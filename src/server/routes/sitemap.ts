import { Hono } from 'hono';
import { BUILD_TIMESTAMP, SEO, SITE_URL } from '@/config';

export const sitemapRoutes = new Hono();

sitemapRoutes.get('/sitemap.xml', async (c) => {
  const { allJobs } = await import('content-collections');

  const urls = [
    `  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${BUILD_TIMESTAMP}</lastmod>
    <changefreq>${SEO.DEFAULT_CHANGE_FREQ}</changefreq>
    <priority>${SEO.HOMEPAGE_PRIORITY}</priority>
  </url>`,
    ...allJobs.map(
      (job) => `  <url>
    <loc>${SITE_URL}/jobb/${job.slug}</loc>
    <lastmod>${BUILD_TIMESTAMP}</lastmod>
    <changefreq>${SEO.DEFAULT_CHANGE_FREQ}</changefreq>
    <priority>${SEO.DEFAULT_PRIORITY}</priority>
  </url>`
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return c.text(sitemap, 200, {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  });
});
