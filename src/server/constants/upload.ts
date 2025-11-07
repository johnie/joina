/**
 * Allowed MIME types for job application files
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Human-readable file type descriptions for error messages
 */
export const ALLOWED_FILE_TYPES_DESCRIPTION = 'PDF, DOC och DOCX';

/**
 * Error messages for validation
 */
export const ERROR_MESSAGES = {
  NO_FILES: 'Minst en fil krävs',
  INVALID_FILE_TYPE: (fileName: string) =>
    `Ogiltig filtyp för ${fileName}. Endast ${ALLOWED_FILE_TYPES_DESCRIPTION} är tillåtna.`,
  FILE_TOO_LARGE: (fileName: string) =>
    `Filen ${fileName} överskrider maximal storlek på 5MB.`,
  UPLOAD_FAILED: (fileName: string) =>
    `Misslyckades med att ladda upp filen ${fileName}.`,
  INTERNAL_ERROR: 'Internt serverfel',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  APPLICATION_UPLOADED: 'Ansökan har laddats upp',
} as const;
