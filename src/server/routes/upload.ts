import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { slugifyEmail } from '../utils/slugify';
import { EmailMessage } from 'cloudflare:email';

/**
 * Creates a raw MIME message for multipart/alternative email
 * (plain text + HTML) without Node.js dependencies
 */
function createRawMimeMessage(params: {
  from: { name: string; email: string };
  to: string;
  subject: string;
  replyTo?: string;
  textContent: string;
  htmlContent: string;
}): string {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const headers = [
    `From: ${params.from.name} <${params.from.email}>`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    params.replyTo ? `Reply-To: ${params.replyTo}` : null,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
  ]
    .filter((h) => h !== null)
    .join('\r\n');

  const textPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.textContent,
    '',
  ].join('\r\n');

  const htmlPart = [
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.htmlContent,
    '',
  ].join('\r\n');

  return `${headers}${textPart}${htmlPart}--${boundary}--\r\n`;
}

// Define the Cloudflare Workers environment type
type Bindings = {
  BUCKET: R2Bucket;
  EMAIL: SendEmail;
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
    .pipe(z.array(z.instanceof(File)).min(1, 'Minst en fil krävs')),
});

// Type for the validated data (exported for potential reuse)
export type JobApplicationData = z.infer<typeof JobApplicationSchema>;

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
    // Parse the form data
    const formData = c.req.valid('form');

    // Extract text fields
    const name = formData.name;
    const email = formData.email;
    const phone = formData.phone;
    const files = formData.files;

    const folderName = `${slugifyEmail(email)}-${Date.now()}`;

    // Validate that files are present
    if (!files || files.length === 0) {
      return c.json({ error: 'Minst en fil krävs' }, 400);
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (typeof file === 'string' || !file || typeof file !== 'object') {
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        return c.json(
          {
            error: `Ogiltig filtyp för ${file.name}. Endast PDF, DOC och DOCX är tillåtna.`,
          },
          400,
        );
      }

      if (file.size > maxSize) {
        return c.json(
          {
            error: `Filen ${file.name} överskrider maximal storlek på 5MB.`,
          },
          400,
        );
      }
    }

    // Prepare the JSON data to store
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

    // Upload the JSON data file
    const jsonKey = `${folderName}/application.json`;
    await c.env.BUCKET.put(jsonKey, JSON.stringify(applicationData, null, 2));

    // Upload the files
    for (const fileEntry of files) {
      if (
        typeof fileEntry === 'string' ||
        !fileEntry ||
        typeof fileEntry !== 'object'
      ) {
        continue;
      }

      const file = fileEntry as File;
      const fileKey = `${folderName}/${file.name}`;
      try {
        await c.env.BUCKET.put(fileKey, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });
      } catch (uploadError) {
        console.error(`Fel vid uppladdning av fil ${file.name}:`, uploadError);
        return c.json(
          {
            error: `Misslyckades med att ladda upp filen ${file.name}.`,
          },
          500,
        );
      }
    }

    // Send application email notification
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .info-list { list-style: none; padding: 0; }
            .info-list li { padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
            .info-list strong { color: #18181b; min-width: 100px; display: inline-block; }
            .files { background: #fafafa; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e4e4e7; font-size: 0.875rem; color: #71717a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: #18181b;">🎉 Ny jobbansökan mottagen</h2>
            </div>
            <ul class="info-list">
              <li><strong>Namn:</strong> ${name}</li>
              <li><strong>E-post:</strong> <a href="mailto:${email}">${email}</a></li>
              <li><strong>Telefon:</strong> ${phone}</li>
              <li><strong>Inlämnad:</strong> ${new Date().toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' })}</li>
            </ul>
            <div class="files">
              <strong>📎 Bifogade filer:</strong>
              <ul>
                ${files.map((file) => `<li>${file.name} (${(file.size / 1024).toFixed(1)} KB)</li>`).join('')}
              </ul>
            </div>
            <div class="footer">
              <p>Svara på detta mail för att kontakta sökanden direkt.</p>
              <p><small>Filerna är sparade i R2 under: <code>${folderName}</code></small></p>
            </div>
          </div>
        </body>
        </html>
      `;

    const textContent = `Ny jobbansökan från ${name}

Sökandeinformation:
- Namn: ${name}
- E-post: ${email}
- Telefon: ${phone}
- Inlämnad: ${new Date().toLocaleString('sv-SE')}

Bifogade filer:
${files.map((file) => `- ${file.name} (${(file.size / 1024).toFixed(1)} KB)`).join('\n')}

Svara på detta mail för att kontakta sökanden direkt.
Filerna är sparade i R2 under: ${folderName}
      `;

    const rawMimeMessage = createRawMimeMessage({
      from: { name, email: 'jobb@johnie.se' },
      to: 'jobb@johnie.se',
      subject: `Ny jobbansökan från ${name}`,
      replyTo: email,
      textContent,
      htmlContent,
    });

    const message = new EmailMessage(email, 'jobb@johnie.se', rawMimeMessage);

    try {
      await c.env.EMAIL.send(message);
      console.log(`Email notification sent for application from ${email}`);
    } catch (emailError) {
      console.error(
        'Fel vid skickande av e-post:',
        emailError,
        rawMimeMessage,
        message,
      );
      // Don't fail the request if email fails, just log it
    }

    // Return success response
    const response = {
      success: true,
      message: 'Ansökan har laddats upp',
    };
    return c.json(response, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      {
        error: 'Internt serverfel',
        message: error instanceof Error ? error.message : 'Okänt fel',
      },
      500,
    );
  }
});

export { upload };
