import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import rehypeImageToolkit from 'rehype-image-toolkit';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import { z } from 'zod';

const rehypePlugins = [rehypeUnwrapImages, rehypeImageToolkit];

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
    const mdx = await compileMDX(context, document, { rehypePlugins });
    return { ...document, mdx };
  },
});

const jobs = defineCollection({
  name: 'jobs',
  directory: 'src/content/jobs',
  include: '*.mdx',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    slug: z.string(),
    type: z.string(),
    location: z.string(),
    hours: z.string(),
    percentage: z.string(),
    deadline: z.string(),
    status: z.enum(['open', 'paused', 'closed']),
    formEnabled: z.boolean().default(false),
    highlights: z.array(
      z.object({
        icon: z.string(),
        label: z.string(),
        value: z.string(),
      })
    ),
    email: z.string(),
    order: z.number(),
    image: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, { rehypePlugins });
    return { ...document, mdx };
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
  collections: [pages, jobs, qna],
});
