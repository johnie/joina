import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { rateLimiter } from 'hono-rate-limiter';
import { ALLOWED_HEADERS, ALLOWED_HTTP_METHODS, API_ENDPOINTS } from '@/config';
import { robotsRoutes } from './routes/robots';
import { sitemapRoutes } from './routes/sitemap';
import { upload } from './routes/upload';
import type { Bindings } from './types/bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', logger());
app.use('/api/*', (c, next) => {
  const origin = c.env.PRODUCTION_URL || '*';

  return cors({
    origin,
    allowMethods: ALLOWED_HTTP_METHODS,
    allowHeaders: ALLOWED_HEADERS,
  })(c, next);
});

// Rate limiting for upload endpoint: 5 uploads per 15 minutes per IP
app.use(
  API_ENDPOINTS.UPLOAD,
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3, // 3 requests per window
    keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? 'unknown',
    standardHeaders: 'draft-7',
  }),
);

app.get(API_ENDPOINTS.HEALTH, (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route(API_ENDPOINTS.UPLOAD, upload);

app.route('/', sitemapRoutes);
app.route('/', robotsRoutes);

export default app;
