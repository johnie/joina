export const GIT_SHA = import.meta.env.VITE_GIT_SHA as string | undefined;
export const GIT_SHA_URL = import.meta.env.VITE_GIT_SHA_URL as
  | string
  | undefined;

export const isDevelopment =
  typeof process !== 'undefined' &&
  (process.env.NODE_ENV === 'development' ||
    process.env.WRANGLER_DEV === 'true');

export const isProduction =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
