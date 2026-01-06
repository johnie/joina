export const GIT_SHA = import.meta.env.VITE_GIT_SHA as string | undefined;
export const GIT_SHA_URL = import.meta.env.VITE_GIT_SHA_URL as
  | string
  | undefined;

export const BUILD_TIMESTAMP =
  (import.meta.env.VITE_BUILD_TIME as string | undefined) ||
  new Date().toISOString().split('T')[0];
