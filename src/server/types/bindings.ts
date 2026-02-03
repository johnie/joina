import type { SendEmail } from 'cloudflare:email';

export interface Bindings {
  BUCKET: R2Bucket;
  EMAIL: SendEmail;
  ENVIRONMENT?: string;
}
