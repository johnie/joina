import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import {
  ALLOWED_HEADERS,
  ALLOWED_HTTP_METHODS,
  API_ENDPOINTS,
  isDevelopment,
} from '@/config';
import { robotsRoutes } from './routes/robots';
import { sitemapRoutes } from './routes/sitemap';
import { upload } from './routes/upload';
import type { Bindings } from './types/bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', logger());
app.use('/api/*', (c, next) => {
  const origin = isDevelopment
    ? '*'
    : c.env.PRODUCTION_URL || 'https://joina.johnie.se';

  return cors({
    origin,
    allowMethods: ALLOWED_HTTP_METHODS,
    allowHeaders: ALLOWED_HEADERS,
  })(c, next);
});

app.get(API_ENDPOINTS.HEALTH, (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route(API_ENDPOINTS.UPLOAD, upload);

app.route('/', sitemapRoutes);
app.route('/', robotsRoutes);

export default app;
