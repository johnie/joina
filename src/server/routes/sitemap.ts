import { Hono } from 'hono';
import { BUILD_TIMESTAMP, SEO, SITE_URL } from '@/config';

export const sitemapRoutes = new Hono();

sitemapRoutes.get('/sitemap.xml', async (c) => {
  // Import inside handler to avoid global scope async operations
  const { allPages } = await import('content-collections');

  const pages = allPages.map((page) => {
    const slug = page._meta.fileName.replace('.mdx', '');
    const url = slug === 'index' ? SITE_URL : `${SITE_URL}/${slug}`;

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${BUILD_TIMESTAMP}</lastmod>
    <changefreq>${SEO.DEFAULT_CHANGE_FREQ}</changefreq>
    <priority>${slug === 'index' ? SEO.HOMEPAGE_PRIORITY : SEO.DEFAULT_PRIORITY}</priority>
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.join('\n')}
</urlset>`;

  return c.text(sitemap, 200, {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  });
});
