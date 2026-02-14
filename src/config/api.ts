export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  UPLOAD: '/api/upload',
  OG: '/og',
} as const;

export const ALLOWED_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

export const ALLOWED_HEADERS = ['Content-Type', 'Authorization'];

export const WORKER_FIRST_ROUTES = [
  '/api/*',
  '/sitemap.xml',
  '/robots.txt',
] as const;
