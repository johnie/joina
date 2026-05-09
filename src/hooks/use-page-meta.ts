import { useEffect } from 'react';

interface PageMeta {
  description: string;
  image?: string;
  robots?: string;
  title: string;
  url: string;
}

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    document.title = meta.title;
    setMeta('meta[name="title"]', 'content', meta.title);
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', meta.url);

    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', meta.url);

    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:url"]', 'content', meta.url);

    if (meta.image) {
      setMeta('meta[property="og:image"]', 'content', meta.image);
      setMeta('meta[property="og:image:alt"]', 'content', meta.title);
      setMeta('meta[name="twitter:image"]', 'content', meta.image);
    }

    if (meta.robots) {
      setMeta('meta[name="robots"]', 'content', meta.robots);
    }
  }, [meta.title, meta.description, meta.url, meta.image, meta.robots]);
}
