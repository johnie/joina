/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns A slugified version of the text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Creates a slug from an email address
 * Converts email@example.com to email-example-com
 * @param email - The email address to slugify
 * @returns A slugified version of the email
 */
export function slugifyEmail(email: string): string {
  return slugify(email.replace('@', '-').replace(/\./g, '-'));
}
