import { describe, expect, it } from 'vitest';
import { validateFiles } from './file-validation';

// Helper to create mock File with specific content
function createMockFile(name: string, type: string, content: Uint8Array): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('validateFiles', () => {
  it('rejects files exceeding max file limit', async () => {
    const files = [
      createMockFile(
        'test1.pdf',
        'application/pdf',
        new Uint8Array([0x25, 0x50, 0x44, 0x46])
      ),
      createMockFile(
        'test2.pdf',
        'application/pdf',
        new Uint8Array([0x25, 0x50, 0x44, 0x46])
      ),
      createMockFile(
        'test3.pdf',
        'application/pdf',
        new Uint8Array([0x25, 0x50, 0x44, 0x46])
      ),
    ];

    const result = await validateFiles({
      currentFiles: [],
      newFiles: files,
      maxFiles: 2,
    });

    expect(result.validFiles).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('maximalt');
  });

  it('rejects files exceeding max size', async () => {
    const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
    largeContent[0] = 0x25; // %
    largeContent[1] = 0x50; // P
    largeContent[2] = 0x44; // D
    largeContent[3] = 0x46; // F

    const file = createMockFile('large.pdf', 'application/pdf', largeContent);

    const result = await validateFiles({
      currentFiles: [],
      newFiles: [file],
      maxSize: 5 * 1024 * 1024, // 5MB limit
    });

    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('max vara');
  });

  it('accepts valid PDF file with correct signature', async () => {
    // PDF signature: %PDF
    const pdfContent = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34,
    ]);
    const file = createMockFile('document.pdf', 'application/pdf', pdfContent);

    const result = await validateFiles({
      currentFiles: [],
      newFiles: [file],
      accept: 'application/pdf',
      maxSize: 5 * 1024 * 1024,
    });

    expect(result.validFiles).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects file with invalid signature (spoofed PDF)', async () => {
    // Not a real PDF - just random bytes
    const fakeContent = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    const file = createMockFile('fake.pdf', 'application/pdf', fakeContent);

    const result = await validateFiles({
      currentFiles: [],
      newFiles: [file],
      accept: 'application/pdf',
    });

    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('innehåll');
  });

  it('returns empty arrays when no files provided', async () => {
    const result = await validateFiles({
      currentFiles: [],
      newFiles: [],
    });

    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
