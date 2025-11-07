import { allPages } from 'content-collections';
import { Hono } from 'hono';

export const sitemapRoutes = new Hono();

sitemapRoutes.get('/sitemap.xml', (c) => {
  const baseUrl = 'https://joina.johnie.se';
  const currentDate = new Date().toISOString().split('T')[0];

  // Generate sitemap entries from content collections
  const pages = allPages.map((page) => {
    const slug = page._meta.fileName.replace('.mdx', '');
    const url = slug === 'index' ? baseUrl : `${baseUrl}/${slug}`;

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${slug === 'index' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.join('\n')}
</urlset>`;

  return c.text(sitemap, 200, {
    'Content-Type': 'application/xml',
  });
});
