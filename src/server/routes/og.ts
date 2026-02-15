import { Hono } from 'hono';
import { ImageResponse } from 'workers-og';
import { loadGoogleFontCustom } from '../og/font';
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

  const [fontRegularItalic, fontBoldItalic] = await Promise.all([
    loadGoogleFontCustom('Playfair Display', 400, true),
    loadGoogleFontCustom('Playfair Display', 700, true),
  ]);

  const element = renderOgTemplate({
    title: job.title,
    summary: job.summary,
    type: job.type,
    location: job.location,
    percentage: job.percentage,
    hours: job.hours,
  });

  // Satori accepts {type, props} element objects at runtime;
  // workers-og types declare React.ReactNode but the shapes are equivalent
  const imgResponse = new ImageResponse(element as unknown as React.ReactNode, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Playfair Display',
        data: fontRegularItalic,
        weight: 400,
        style: 'italic',
      },
      {
        name: 'Playfair Display',
        data: fontBoldItalic,
        weight: 700,
        style: 'italic',
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
