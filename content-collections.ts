import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import rehypeImageToolkit from 'rehype-image-toolkit';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import { z } from 'zod';

const pages = defineCollection({
  name: 'pages',
  directory: 'src/content/pages',
  include: '*.mdx',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [rehypeUnwrapImages, rehypeImageToolkit],
    });
    return {
      ...document,
      mdx,
    };
  },
});

const qna = defineCollection({
  name: 'qna',
  directory: 'src/content/qna',
  include: '*.yaml',
  parser: 'yaml',
  schema: z.object({
    title: z.string(),
    answer: z.string(),
    order: z.number(),
  }),
});

export default defineConfig({
  collections: [pages, qna],
});
