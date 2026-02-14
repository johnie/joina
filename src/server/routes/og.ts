import { Hono } from 'hono';
import { ImageResponse, loadGoogleFont } from 'workers-og';
import { renderOgTemplate } from '../og/template';
import type { Bindings } from '../types/bindings';

const og = new Hono<{ Bindings: Bindings }>();

og.get('/:slug', async (c) => {
  const raw = c.req.param('slug');
  if (!raw.endsWith('.png')) {
    return c.notFound();
  }
  const slug = raw.slice(0, -4);
  const { allJobs } = await import('content-collections');
  const job = allJobs.find((j) => j.slug === slug);

  if (!job) {
    return c.notFound();
  }

  const fontData = await loadGoogleFont({
    family: 'Geist Mono',
    weight: 400,
  });

  const html = renderOgTemplate({
    title: job.title,
    type: job.type,
    location: job.location,
    percentage: job.percentage,
  });

  const imgResponse = new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Geist Mono',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  const body = await imgResponse.arrayBuffer();

  return c.body(body, 200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=86400',
  });
});

export { og as ogRoutes };
