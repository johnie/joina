import { SITE_URL } from '@/config';
import {
  buildBreadcrumbLd,
  buildFaqLd,
  buildJobPostingLd,
  serializeJsonLd,
} from '../utils/job-jsonld';

interface JobMeta {
  datePosted?: string;
  deadline: string;
  email: string;
  hours: string;
  image?: string;
  location: string;
  percentage: string;
  slug: string;
  status: 'open' | 'paused' | 'closed';
  summary: string;
  title: string;
  type: string;
}

interface QnaMeta {
  answer: string;
  order: number;
  title: string;
}

class MetaRewriter {
  private readonly attribute: string;
  private readonly value: string;

  constructor(attribute: string, value: string) {
    this.attribute = attribute;
    this.value = value;
  }

  element(element: Element) {
    element.setAttribute(this.attribute, this.value);
  }
}

class TitleRewriter {
  private readonly title: string;

  constructor(title: string) {
    this.title = title;
  }

  element(element: Element) {
    element.setInnerContent(this.title);
  }
}

class HtmlAppender {
  private readonly html: string;

  constructor(html: string) {
    this.html = html;
  }

  element(element: Element) {
    element.append(this.html, { html: true });
  }
}

class HtmlReplacer {
  private readonly html: string;

  constructor(html: string) {
    this.html = html;
  }

  element(element: Element) {
    element.setInnerContent(this.html, { html: true });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCrawlableBody(job: JobMeta): string {
  const facts = [
    { label: 'Tjänstegrad', value: job.percentage },
    { label: 'Arbetstider', value: job.hours },
    { label: 'Plats', value: job.location },
    { label: 'Sista ansökningsdag', value: job.deadline },
  ];

  const factItems = facts
    .map(
      (f) =>
        `<li><strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(f.value)}</li>`
    )
    .join('');

  let statusNote = '';
  if (job.status === 'closed') {
    statusNote = '<p><em>Tjänsten är tillsatt.</em></p>';
  } else if (job.status === 'paused') {
    statusNote = '<p><em>Tjänsten är pausad.</em></p>';
  }

  return `<noscript-fallback id="seo-fallback" style="display:block">
<nav aria-label="Brödsmulor"><a href="/">Lediga tjänster</a></nav>
<article>
<p>${escapeHtml(job.type)} · ${escapeHtml(job.location)}</p>
<h1>${escapeHtml(job.title)}</h1>
<p>${escapeHtml(job.summary)}</p>
${statusNote}
<ul>${factItems}</ul>
<p><a href="mailto:${escapeHtml(job.email)}">${escapeHtml(job.email)}</a></p>
</article>
</noscript-fallback>`;
}

export async function rewriteJobMeta(
  job: JobMeta,
  qnas: QnaMeta[],
  fetchAsset: (path: string) => Promise<Response>
) {
  const assetResponse = await fetchAsset('/');

  const pageTitle = `${job.title} – Joina`;
  const ogImage = `${SITE_URL}/og/${job.slug}.png`;
  const pageUrl = `${SITE_URL}/jobb/${job.slug}`;

  const robotsContent =
    job.status === 'closed'
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const jsonLd = serializeJsonLd([
    buildJobPostingLd(job),
    buildBreadcrumbLd(job),
    buildFaqLd(qnas),
  ]);

  const crawlableBody = buildCrawlableBody(job);

  const transformed = new HTMLRewriter()
    .on('title', new TitleRewriter(pageTitle))
    .on('meta[name="title"]', new MetaRewriter('content', pageTitle))
    .on('meta[name="description"]', new MetaRewriter('content', job.summary))
    .on('meta[name="robots"]', new MetaRewriter('content', robotsContent))
    .on('link[rel="canonical"]', new MetaRewriter('href', pageUrl))
    .on('meta[property="og:title"]', new MetaRewriter('content', pageTitle))
    .on(
      'meta[property="og:description"]',
      new MetaRewriter('content', job.summary)
    )
    .on('meta[property="og:image"]', new MetaRewriter('content', ogImage))
    .on('meta[property="og:url"]', new MetaRewriter('content', pageUrl))
    .on('meta[property="og:image:alt"]', new MetaRewriter('content', job.title))
    .on('meta[property="og:type"]', new MetaRewriter('content', 'article'))
    .on('meta[name="twitter:title"]', new MetaRewriter('content', pageTitle))
    .on(
      'meta[name="twitter:description"]',
      new MetaRewriter('content', job.summary)
    )
    .on('meta[name="twitter:image"]', new MetaRewriter('content', ogImage))
    .on('meta[name="twitter:url"]', new MetaRewriter('content', pageUrl))
    .on('head', new HtmlAppender(jsonLd))
    .on('div#root', new HtmlReplacer(crawlableBody))
    .transform(assetResponse);

  const headers = new Headers(transformed.headers);
  headers.set(
    'Cache-Control',
    'public, max-age=300, s-maxage=3600, must-revalidate'
  );

  return new Response(transformed.body, {
    status: transformed.status,
    statusText: transformed.statusText,
    headers,
  });
}

export async function rewriteJobNotFound(
  fetchAsset: (path: string) => Promise<Response>
) {
  const assetResponse = await fetchAsset('/');

  const transformed = new HTMLRewriter()
    .on('title', new TitleRewriter('Sidan hittades inte – Joina'))
    .on(
      'meta[name="title"]',
      new MetaRewriter('content', 'Sidan hittades inte – Joina')
    )
    .on(
      'meta[name="description"]',
      new MetaRewriter('content', 'Den här sidan finns inte längre.')
    )
    .on('meta[name="robots"]', new MetaRewriter('content', 'noindex, nofollow'))
    .transform(assetResponse);

  const headers = new Headers(transformed.headers);
  headers.set('Cache-Control', 'no-store');

  return new Response(transformed.body, {
    status: 404,
    statusText: 'Not Found',
    headers,
  });
}
