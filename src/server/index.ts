import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ALLOWED_HEADERS, ALLOWED_HTTP_METHODS, API_ENDPOINTS } from '@/config';
import { rewriteJobMeta } from './middleware/og-rewriter';
import { rateLimiter } from './middleware/rate-limiter';
import { ogRoutes } from './routes/og';
import { robotsRoutes } from './routes/robots';
import { sitemapRoutes } from './routes/sitemap';
import { upload } from './routes/upload';
import type { Bindings } from './types/bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', logger());
app.use('/api/*', (c, next) => {
  // Dynamic CORS: Allow development origins and same-origin requests in production
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.WRANGLER_DEV === 'true';

  const origin = isDevelopment
    ? '*' // Allow all origins in development
    : new URL(c.req.url).origin; // Use current deployment URL in production/preview

  return cors({
    origin,
    allowMethods: ALLOWED_HTTP_METHODS,
    allowHeaders: ALLOWED_HEADERS,
  })(c, next);
});

// Rate limiting for upload endpoint: 3 uploads per 15 minutes per IP
app.use(
  API_ENDPOINTS.UPLOAD,
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3, // 3 requests per window
    keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? 'unknown',
  })
);

app.get(API_ENDPOINTS.HEALTH, (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.route(API_ENDPOINTS.UPLOAD, upload);

app.route(API_ENDPOINTS.OG, ogRoutes);

// Rewrite OG meta tags for job detail pages
app.get('/jobb/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const { allJobs } = await import('content-collections');
    const job = allJobs.find((j) => j.slug === slug);

    const fetchAsset = (path: string) => {
      const url = new URL(path, c.req.url);
      if (c.env.ASSETS) {
        return c.env.ASSETS.fetch(new Request(url));
      }
      return fetch(url);
    };

    if (!job) {
      return fetchAsset('/');
    }

    return rewriteJobMeta(job, fetchAsset);
  } catch (error) {
    console.error('OG rewriter failed:', error);
    return c.text('Internal Server Error', 500);
  }
});

app.route('/', sitemapRoutes);
app.route('/', robotsRoutes);

export default app;
