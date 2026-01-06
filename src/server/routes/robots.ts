import { Hono } from 'hono';
import { SITE_URL } from '@/config';

export const robotsRoutes = new Hono();

robotsRoutes.get('/robots.txt', (c) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml`;

  return c.text(robots, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=86400',
  });
});
