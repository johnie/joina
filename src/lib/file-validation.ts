import { FILE_UPLOAD } from '@/config';

export type FileValidationResult = {
  validFiles: File[];
  errors: Array<{ file: File; message: string }>;
};

export type FileValidationOptions = {
  currentFiles: File[];
  newFiles: File[];
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
};

export function validateFiles({
  currentFiles,
  newFiles,
  accept,
  maxFiles,
  maxSize,
}: FileValidationOptions): FileValidationResult {
  const validFiles: File[] = [];
  const errors: Array<{ file: File; message: string }> = [];

  for (const file of newFiles) {
    if (maxFiles && currentFiles.length + validFiles.length >= maxFiles) {
      errors.push({
        file,
        message: `Du kan maximalt ladda upp ${maxFiles} fil${maxFiles > 1 ? 'er' : ''}`,
      });
      break;
    }

    if (maxSize && file.size > maxSize) {
      errors.push({
        file,
        message: `Filen får max vara ${FILE_UPLOAD.MAX_FILE_SIZE_DISPLAY}`,
      });
      continue;
    }

    if (accept) {
      const acceptTypes = accept.split(',').map((t) => t.trim());
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type;

      const isAccepted = acceptTypes.some((type) => {
        if (type.startsWith('.')) {
          return type.toLowerCase() === fileExtension;
        }
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return type === mimeType;
      });

      if (!isAccepted) {
        errors.push({
          file,
          message: 'Filtypen stöds inte',
        });
        continue;
      }
    }

    validFiles.push(file);
  }

  return { validFiles, errors };
}
