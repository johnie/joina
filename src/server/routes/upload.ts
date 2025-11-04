import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { slugifyEmail } from '../utils/slugify';
import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

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

    // Send application email to me
    const msg = createMimeMessage();
    msg.setSender({ name, addr: email });
    msg.setRecipient('jobb@johnie.se');
    msg.setSubject(`Ny jobbsökan från ${name}`);
    msg.addMessage({
      contentType: 'text/html; charset=utf-8',
      data: `<p>En ny jobbsökan har inkommit:</p>
             <ul>
               <li><strong>Namn:</strong> ${name}</li>
               <li><strong>E-post:</strong> ${email}</li>
               <li><strong>Telefon:</strong> ${phone}</li>
             </ul>
             <p>Bifogade filer: ${files
               .map((file) => file.name)
               .join(', ')}</p>`,
    });

    const message = new EmailMessage(email, 'jobb@johnie.se', msg.asRaw());

    try {
      await c.env.EMAIL.send(message);
    } catch (emailError) {
      console.error('Fel vid skickande av e-post:', emailError);
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
