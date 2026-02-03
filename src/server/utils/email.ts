import { EmailMessage } from 'cloudflare:email';
import { EMAIL } from '@/config';

interface ApplicationEmailData {
  name: string;
  email: string;
  phone: string;
  fileCount: number;
  submittedAt: string;
  folderId: string;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('sv-SE', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function buildHtmlBody(data: ApplicationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">Ny jobbansökan</h1>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; font-weight: 600; width: 120px;">Namn:</td>
      <td style="padding: 8px 0;">${escapeHtml(data.name)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: 600;">E-post:</td>
      <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #0066cc;">${escapeHtml(data.email)}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: 600;">Telefon:</td>
      <td style="padding: 8px 0;"><a href="tel:${escapeHtml(data.phone)}" style="color: #0066cc;">${escapeHtml(data.phone)}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: 600;">Antal filer:</td>
      <td style="padding: 8px 0;">${data.fileCount}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: 600;">Skickad:</td>
      <td style="padding: 8px 0;">${formatDate(data.submittedAt)}</td>
    </tr>
  </table>

  <p style="margin-top: 20px; padding: 12px; background-color: #f5f5f5; border-radius: 4px; font-size: 14px;">
    <strong>Mapp-ID:</strong> ${escapeHtml(data.folderId)}<br>
    Filer finns i R2-bucket under denna mapp.
  </p>

  <p style="margin-top: 20px; font-size: 14px; color: #666;">
    Svara direkt på detta mail för att kontakta den sökande.
  </p>
</body>
</html>
`.trim();
}

function buildTextBody(data: ApplicationEmailData): string {
  return `
Ny jobbansökan
==============

Namn: ${data.name}
E-post: ${data.email}
Telefon: ${data.phone}
Antal filer: ${data.fileCount}
Skickad: ${formatDate(data.submittedAt)}

Mapp-ID: ${data.folderId}
Filer finns i R2-bucket under denna mapp.

---
Svara direkt på detta mail för att kontakta den sökande.
`.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isAsciiOnly(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}

function encodeRFC2047(str: string): string {
  // Encode non-ASCII characters in headers using RFC 2047
  if (isAsciiOnly(str)) {
    return str;
  }
  const encoded = new TextEncoder().encode(str);
  const base64 = btoa(String.fromCharCode(...encoded));
  return `=?UTF-8?B?${base64}?=`;
}

function buildMimeMessage(data: ApplicationEmailData): string {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const subject = `Ny ansökan: ${data.name}`;
  const textBody = buildTextBody(data);
  const htmlBody = buildHtmlBody(data);

  const headers = [
    `From: ${encodeRFC2047(EMAIL.FROM_NAME)} <${EMAIL.FROM}>`,
    `To: ${EMAIL.TO}`,
    `Reply-To: ${data.email}`,
    `Subject: ${encodeRFC2047(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `Date: ${new Date().toUTCString()}`,
  ].join('\r\n');

  const textPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
  ].join('\r\n');

  const htmlPart = [
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
  ].join('\r\n');

  return [headers, '', textPart, htmlPart, `--${boundary}--`].join('\r\n');
}

export function createApplicationEmail(
  data: ApplicationEmailData
): EmailMessage {
  const rawEmail = buildMimeMessage(data);
  return new EmailMessage(EMAIL.FROM, EMAIL.TO, rawEmail);
}

export function logEmailPayload(data: ApplicationEmailData): void {
  console.log('[Email] Would send notification:', {
    from: EMAIL.FROM,
    to: EMAIL.TO,
    replyTo: data.email,
    subject: `Ny ansökan: ${data.name}`,
    applicant: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
    fileCount: data.fileCount,
    folderId: data.folderId,
  });
}
