import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  ALLOWED_FILE_TYPES,
  ERROR_MESSAGES,
  MAX_FILE_SIZE,
  SUCCESS_MESSAGES,
} from '../constants/upload';
import {
  type JsonApiError,
  createErrorResponse,
  createInternalError,
  createSuccessResponse,
  createValidationError,
} from '../utils/jsonapi';
import { slugifyEmail } from '../utils/slugify';

// Define the Cloudflare Workers environment type
type Bindings = {
  BUCKET: R2Bucket;
};

// Create a new Hono app with typed bindings
const upload = new Hono<{ Bindings: Bindings }>();

// Zod schema for form validation
const JobApplicationSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  email: z.email('Giltig e-postadress krävs'),
  phone: z.string().min(1, 'Telefonnummer krävs'),
  files: z
    .union([z.instanceof(File), z.array(z.instanceof(File))])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .pipe(z.array(z.instanceof(File)).min(1, ERROR_MESSAGES.NO_FILES)),
});

// Type for the validated data (exported for potential reuse)
export type JobApplicationData = z.infer<typeof JobApplicationSchema>;

/**
 * Validates file type against allowed types
 */
function validateFileType(file: File): JsonApiError | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return createValidationError(ERROR_MESSAGES.INVALID_FILE_TYPE(file.name));
  }
  return null;
}

/**
 * Validates file size against maximum allowed size
 */
function validateFileSize(file: File): JsonApiError | null {
  if (file.size > MAX_FILE_SIZE) {
    return createValidationError(ERROR_MESSAGES.FILE_TOO_LARGE(file.name));
  }
  return null;
}

/**
 * Validates all files in the upload
 */
function validateFiles(files: File[]): JsonApiError[] {
  const errors: JsonApiError[] = [];

  if (!files || files.length === 0) {
    errors.push(createValidationError(ERROR_MESSAGES.NO_FILES));
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

/**
 * Uploads a file to R2 bucket
 */
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

/**
 * Upload endpoint for job applications
 * Accepts multipart/form-data with:
 * - name: string
 * - email: string
 * - phone: string
 * - files: File[] (CV and cover letter)
 */
upload.post('/', zValidator('form', JobApplicationSchema), async (c) => {
  try {
    const { name, email, phone, files } = c.req.valid('form');

    // Validate files
    const validationErrors = validateFiles(files);
    if (validationErrors.length > 0) {
      return c.json(createErrorResponse(validationErrors), 400);
    }

    // Generate unique folder name
    const folderName = `${slugifyEmail(email)}-${Date.now()}`;

    // Prepare application metadata
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

    // Upload metadata JSON
    const jsonKey = `${folderName}/application.json`;
    await c.env.BUCKET.put(jsonKey, JSON.stringify(applicationData, null, 2));

    // Upload all files
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
            createInternalError(ERROR_MESSAGES.UPLOAD_FAILED(file.name), {
              fileName: file.name,
              error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
            }),
          ),
          500,
        );
      }
    }

    // Return JSON API compliant success response
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
        createInternalError(
          ERROR_MESSAGES.INTERNAL_ERROR,
          {
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ),
      ),
      500,
    );
  }
});

export { upload };
