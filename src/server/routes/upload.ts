import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { FILE_UPLOAD, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '@/config';
import { APPLICATION_STATUS } from '@/constants/application';
import type { Bindings } from '../types/bindings';
import { createApplicationEmail, logEmailPayload } from '../utils/email';
import {
  createErrorResponse,
  createInternalError,
  createSuccessResponse,
  createValidationError,
  type JsonApiError,
} from '../utils/jsonapi';
import { slugifyEmail } from '../utils/slugify';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.WRANGLER_DEV === 'true';

const upload = new Hono<{ Bindings: Bindings }>();

const JobApplicationSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  email: z.email('Giltig e-postadress krävs'),
  phone: z.string().min(1, 'Telefonnummer krävs'),
  files: z
    .union([z.instanceof(File), z.array(z.instanceof(File))])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .pipe(z.array(z.instanceof(File)).min(1, VALIDATION_MESSAGES.NO_FILES)),
});

export type JobApplicationData = z.infer<typeof JobApplicationSchema>;

/**
 * Validates file signature (magic numbers) to prevent file type spoofing
 */
async function validateFileSignature(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF: %PDF (0x25 0x50 0x44 0x46)
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return true;
    }

    // DOC: D0 CF 11 E0 A1 B1 1A E1 (OLE2)
    if (
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0 &&
      bytes[4] === 0xa1 &&
      bytes[5] === 0xb1 &&
      bytes[6] === 0x1a &&
      bytes[7] === 0xe1
    ) {
      return true;
    }

    // DOCX: PK (ZIP format)
    if (
      (bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04) ||
      (bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x05 &&
        bytes[3] === 0x06)
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function validateFileType(file: File): Promise<JsonApiError | null> {
  // Check MIME type first
  if (
    !FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(
      file.type as (typeof FILE_UPLOAD.ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return createValidationError(
      VALIDATION_MESSAGES.INVALID_FILE_TYPE(
        file.name,
        FILE_UPLOAD.ALLOWED_TYPES_DESCRIPTION
      )
    );
  }

  // Validate file signature to prevent spoofing
  const isValidSignature = await validateFileSignature(file);
  if (!isValidSignature) {
    return createValidationError(
      `Filens innehåll matchar inte dess filtyp: ${file.name}`
    );
  }

  return null;
}

function validateFileSize(file: File): JsonApiError | null {
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    return createValidationError(
      VALIDATION_MESSAGES.FILE_TOO_LARGE(
        file.name,
        FILE_UPLOAD.MAX_FILE_SIZE_DISPLAY
      )
    );
  }
  return null;
}

async function validateFiles(files: File[]): Promise<JsonApiError[]> {
  const errors: JsonApiError[] = [];

  if (!files || files.length === 0) {
    errors.push(createValidationError(VALIDATION_MESSAGES.NO_FILES));
    return errors;
  }

  for (const file of files) {
    if (typeof file === 'string' || !file || typeof file !== 'object') {
      continue;
    }

    const typeError = await validateFileType(file);
    if (typeError) {
      errors.push(typeError);
    }

    const sizeError = validateFileSize(file);
    if (sizeError) {
      errors.push(sizeError);
    }
  }

  return errors;
}

async function uploadFileToR2(
  bucket: R2Bucket,
  file: File,
  folderName: string
): Promise<void> {
  const fileKey = `${folderName}/${file.name}`;
  await bucket.put(fileKey, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
}

upload.post('/', zValidator('form', JobApplicationSchema), async (c) => {
  if (APPLICATION_STATUS !== 'open') {
    return c.json(
      createErrorResponse(
        createValidationError('Ansökningar är för närvarande stängda')
      ),
      503
    );
  }

  try {
    const { name, email, phone, files } = c.req.valid('form');

    const validationErrors = await validateFiles(files);
    if (validationErrors.length > 0) {
      return c.json(createErrorResponse(validationErrors), 400);
    }

    const folderName = `${slugifyEmail(email)}-${Date.now()}`;

    const applicationData = {
      name,
      email,
      phone,
      submittedAt: new Date().toISOString(),
      files: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    };

    const jsonKey = `${folderName}/application.json`;
    await c.env.BUCKET.put(jsonKey, JSON.stringify(applicationData, null, 2));

    for (const file of files) {
      if (typeof file === 'string' || !file || typeof file !== 'object') {
        continue;
      }

      try {
        await uploadFileToR2(c.env.BUCKET, file, folderName);
      } catch (uploadError) {
        console.error(`Failed to upload file ${file.name}:`, uploadError);
        return c.json(
          createErrorResponse(
            createInternalError(VALIDATION_MESSAGES.UPLOAD_FAILED(file.name), {
              fileName: file.name,
              error:
                uploadError instanceof Error
                  ? uploadError.message
                  : 'Unknown error',
            })
          ),
          500
        );
      }
    }

    // Send email notification
    const emailData = {
      name,
      email,
      phone,
      fileCount: files.length,
      submittedAt: applicationData.submittedAt,
      folderId: folderName,
    };

    if (isDev) {
      logEmailPayload(emailData);
    } else {
      try {
        const emailMessage = createApplicationEmail(emailData);
        await c.env.EMAIL.send(emailMessage);
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail upload on email error
      }
    }

    return c.json(
      createSuccessResponse(
        {
          type: 'application',
          id: folderName,
          attributes: {
            name,
            email,
            phone,
            submittedAt: applicationData.submittedAt,
            fileCount: files.length,
          },
        },
        {
          message: SUCCESS_MESSAGES.APPLICATION_UPLOADED,
        }
      ),
      201
    );
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      createErrorResponse(
        createInternalError(VALIDATION_MESSAGES.INTERNAL_ERROR, {
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      ),
      500
    );
  }
});

export { upload };
