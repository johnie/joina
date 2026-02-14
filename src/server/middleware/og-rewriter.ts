import { SITE_URL } from '@/config';

interface JobMeta {
  title: string;
  summary: string;
  slug: string;
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

export async function rewriteJobMeta(
  job: JobMeta,
  fetchAsset: (path: string) => Promise<Response>
) {
  const assetResponse = await fetchAsset('/');

  const pageTitle = `${job.title} – Joina`;
  const ogImage = `${SITE_URL}/og/${job.slug}.png`;
  const pageUrl = `${SITE_URL}/jobb/${job.slug}`;

  return new HTMLRewriter()
    .on('title', new TitleRewriter(pageTitle))
    .on('meta[name="title"]', new MetaRewriter('content', pageTitle))
    .on('meta[name="description"]', new MetaRewriter('content', job.summary))
    .on('link[rel="canonical"]', new MetaRewriter('href', pageUrl))
    .on('meta[property="og:title"]', new MetaRewriter('content', pageTitle))
    .on(
      'meta[property="og:description"]',
      new MetaRewriter('content', job.summary)
    )
    .on('meta[property="og:image"]', new MetaRewriter('content', ogImage))
    .on('meta[property="og:url"]', new MetaRewriter('content', pageUrl))
    .on('meta[property="og:image:alt"]', new MetaRewriter('content', pageTitle))
    .on('meta[name="twitter:title"]', new MetaRewriter('content', pageTitle))
    .on(
      'meta[name="twitter:description"]',
      new MetaRewriter('content', job.summary)
    )
    .on('meta[name="twitter:image"]', new MetaRewriter('content', ogImage))
    .on('meta[name="twitter:url"]', new MetaRewriter('content', pageUrl))
    .transform(assetResponse);
}
