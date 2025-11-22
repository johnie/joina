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

/**
 * Validates file signature (magic numbers) to prevent file type spoofing
 */
async function validateFileSignature(file: File): Promise<boolean> {
  try {
    // Read first 8 bytes for signature validation
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF signature: %PDF (0x25 0x50 0x44 0x46)
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return true;
    }

    // DOC signature: D0 CF 11 E0 A1 B1 1A E1 (OLE2/CFB format)
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

    // DOCX signature: PK (0x50 0x4B) - ZIP format
    // DOCX files are ZIP archives, so they start with PK
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
    // If signature validation fails, reject the file for safety
    return false;
  }
}

/**
 * Checks if adding more files would exceed the maximum file count
 */
function exceedsMaxFiles(
  currentCount: number,
  validCount: number,
  maxFiles?: number
): boolean {
  if (!maxFiles) {
    return false;
  }
  return currentCount + validCount >= maxFiles;
}

/**
 * Validates file size against maximum allowed size
 */
function validateFileSize(file: File, maxSize?: number): string | null {
  if (!maxSize) {
    return null;
  }
  if (file.size > maxSize) {
    return `Filen får max vara ${FILE_UPLOAD.MAX_FILE_SIZE_DISPLAY}`;
  }
  return null;
}

/**
 * Validates file type against accepted types
 */
function validateFileType(file: File, accept?: string): string | null {
  if (!accept) {
    return null;
  }

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

  return isAccepted ? null : 'Filtypen stöds inte';
}

export async function validateFiles({
  currentFiles,
  newFiles,
  accept,
  maxFiles,
  maxSize,
}: FileValidationOptions): Promise<FileValidationResult> {
  const validFiles: File[] = [];
  const errors: Array<{ file: File; message: string }> = [];

  for (const file of newFiles) {
    if (exceedsMaxFiles(currentFiles.length, validFiles.length, maxFiles)) {
      errors.push({
        file,
        message: `Du kan maximalt ladda upp ${maxFiles} fil${maxFiles && maxFiles > 1 ? 'er' : ''}`,
      });
      break;
    }

    const sizeError = validateFileSize(file, maxSize);
    if (sizeError) {
      errors.push({ file, message: sizeError });
      continue;
    }

    const typeError = validateFileType(file, accept);
    if (typeError) {
      errors.push({ file, message: typeError });
      continue;
    }

    // Validate file signature to prevent spoofing
    const isValidSignature = await validateFileSignature(file);
    if (!isValidSignature) {
      errors.push({
        file,
        message: 'Filens innehåll matchar inte dess filtyp',
      });
      continue;
    }

    validFiles.push(file);
  }

  return { validFiles, errors };
}
