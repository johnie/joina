import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import rehypeImageToolkit from 'rehype-image-toolkit';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import { z } from 'zod';

const posts = defineCollection({
  name: 'posts',
  directory: 'src/posts',
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

export default defineConfig({
  collections: [posts],
});
