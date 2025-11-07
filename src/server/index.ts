import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { robotsRoutes } from './routes/robots';
import { sitemapRoutes } from './routes/sitemap';
import { upload } from './routes/upload';

const app = new Hono();

// Middleware for API routes only
app.use('/api/*', logger());
app.use(
  '/api/*',
  cors({
    origin: '*', // Update this with your actual frontend URL in production
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/upload', upload);

// SEO routes (sitemap and robots)
app.route('/', sitemapRoutes);
app.route('/', robotsRoutes);

export default app;
