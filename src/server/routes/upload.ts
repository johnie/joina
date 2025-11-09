import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { FILE_UPLOAD, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '@/config';
import { rateLimit } from '../middleware/rate-limit';
import type { Bindings } from '../types/bindings';
import {
  createErrorResponse,
  createInternalError,
  createSuccessResponse,
  createValidationError,
  type JsonApiError,
} from '../utils/jsonapi';
import { slugifyEmail } from '../utils/slugify';

const upload = new Hono<{ Bindings: Bindings }>();

upload.use(
  '/',
  rateLimit({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message:
      'Du har skickat in för många ansökningar. Försök igen om en stund.',
  }),
);

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

function validateFileType(file: File): JsonApiError | null {
  if (
    !FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(
      file.type as (typeof FILE_UPLOAD.ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return createValidationError(
      VALIDATION_MESSAGES.INVALID_FILE_TYPE(
        file.name,
        FILE_UPLOAD.ALLOWED_TYPES_DESCRIPTION,
      ),
    );
  }
  return null;
}

function validateFileSize(file: File): JsonApiError | null {
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    return createValidationError(
      VALIDATION_MESSAGES.FILE_TOO_LARGE(
        file.name,
        FILE_UPLOAD.MAX_FILE_SIZE_DISPLAY,
      ),
    );
  }
  return null;
}

function validateFiles(files: File[]): JsonApiError[] {
  const errors: JsonApiError[] = [];

  if (!files || files.length === 0) {
    errors.push(createValidationError(VALIDATION_MESSAGES.NO_FILES));
    return errors;
  }

  for (const file of files) {
    if (typeof file === 'string' || !file || typeof file !== 'object') {
      continue;
    }

    const typeError = validateFileType(file);
    if (typeError) errors.push(typeError);

    const sizeError = validateFileSize(file);
    if (sizeError) errors.push(sizeError);
  }

  return errors;
}

async function uploadFileToR2(
  bucket: R2Bucket,
  file: File,
  folderName: string,
): Promise<void> {
  const fileKey = `${folderName}/${file.name}`;
  await bucket.put(fileKey, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
}

upload.post('/', zValidator('form', JobApplicationSchema), async (c) => {
  try {
    const { name, email, phone, files } = c.req.valid('form');

    const validationErrors = validateFiles(files);
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
            }),
          ),
          500,
        );
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
        },
      ),
      201,
    );
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      createErrorResponse(
        createInternalError(VALIDATION_MESSAGES.INTERNAL_ERROR, {
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      ),
      500,
    );
  }
});

export { upload };
