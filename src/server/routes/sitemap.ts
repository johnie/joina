import { Hono } from 'hono';
import { BUILD_TIMESTAMP, SEO, SITE_URL } from '@/config';
import { parseSwedishDate } from '../utils/swedish-date';

export const sitemapRoutes = new Hono();

function lastModFor(job: { datePosted?: string; deadline: string }): string {
  if (job.datePosted) {
    const d = new Date(job.datePosted);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  const deadline = parseSwedishDate(job.deadline);
  if (deadline) {
    return deadline.toISOString();
  }
  return BUILD_TIMESTAMP;
}

sitemapRoutes.get('/sitemap.xml', async (c) => {
  const { allJobs } = await import('content-collections');

  const indexableJobs = allJobs.filter((j) => j.status !== 'closed');

  const urls = [
    `  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${BUILD_TIMESTAMP}</lastmod>
    <changefreq>${SEO.DEFAULT_CHANGE_FREQ}</changefreq>
    <priority>${SEO.HOMEPAGE_PRIORITY}</priority>
  </url>`,
    ...indexableJobs.map((job) => {
      const changefreq = job.status === 'paused' ? 'monthly' : 'weekly';
      return `  <url>
    <loc>${SITE_URL}/jobb/${job.slug}</loc>
    <lastmod>${lastModFor(job)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${SEO.DEFAULT_PRIORITY}</priority>
  </url>`;
    }),
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
