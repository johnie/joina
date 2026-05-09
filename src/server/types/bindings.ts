import type { SendEmail } from 'cloudflare:email';

export interface Bindings {
  ASSETS: Fetcher;
  BUCKET: R2Bucket;
  EMAIL: SendEmail;
  ENVIRONMENT?: string;
}
