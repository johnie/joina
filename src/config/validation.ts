export const FILE_UPLOAD = {
  MAX_FILES: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  MAX_FILE_SIZE_DISPLAY: '5MB',
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
  ALLOWED_EXTENSIONS: '.pdf,.doc,.docx',
  ALLOWED_TYPES_DESCRIPTION: 'PDF, DOC och DOCX',
} as const;

export const FORM_VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
    PATTERN: /^[0-9+\s-()]+$/,
  },
} as const;

export const VALIDATION_MESSAGES = {
  NO_FILES: 'Minst en fil krävs',
  TOO_MANY_FILES: (max: number) => `Du kan ladda upp max ${max} filer`,
  INVALID_FILE_TYPE: (fileName: string, allowed: string) =>
    `Ogiltig filtyp för ${fileName}. Endast ${allowed} är tillåtna.`,
  FILE_TOO_LARGE: (fileName: string, maxSize: string) =>
    `Filen ${fileName} överskrider maximal storlek på ${maxSize}.`,
  NAME_TOO_SHORT: (min: number) => `Namnet måste vara minst ${min} tecken`,
  INVALID_EMAIL: 'Ogiltig e-postadress',
  PHONE_TOO_SHORT: (min: number) =>
    `Telefonnummer måste vara minst ${min} tecken`,
  INVALID_PHONE_FORMAT: 'Ogiltigt telefonnummerformat',
  UPLOAD_REQUIRED: 'Vänligen ladda upp minst en fil (CV eller personligt brev)',
  UPLOAD_FAILED: (fileName: string) =>
    `Misslyckades med att ladda upp filen ${fileName}.`,
  SUBMISSION_FAILED: 'Det gick inte att skicka ansökan',
  SUBMISSION_ERROR: 'Kunde inte skicka ansökan. Försök igen.',
  INTERNAL_ERROR: 'Internt serverfel',
} as const;

export const SUCCESS_MESSAGES = {
  APPLICATION_SUBMITTED: 'Ansökan skickad!',
  APPLICATION_UPLOADED: 'Ansökan har laddats upp',
} as const;
