import { Hono } from 'hono';

export const robotsRoutes = new Hono();

robotsRoutes.get('/robots.txt', (c) => {
  const baseUrl = 'https://joina.johnie.se';

  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

  return c.text(robots, 200, {
    'Content-Type': 'text/plain',
  });
});
