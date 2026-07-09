import { defineCollection, z } from 'astro:content';

const dateSchema = z.any().transform(v => {
  if (v instanceof Date) return v;
  if (typeof v === 'string') return new Date(v);
  return new Date();
});

const postSchema = z.object({
  title: z.string(),
  date: dateSchema,
  tags: z.any().transform(v => Array.isArray(v) ? v.map(String) : typeof v === 'string' ? [v] : []).default([]),
}).passthrough();

export const collections = {
  cs: defineCollection({ schema: postSchema }),
  ml: defineCollection({ schema: postSchema }),
  ds: defineCollection({ schema: postSchema }),
  reading: defineCollection({ schema: postSchema }),
  econ: defineCollection({ schema: postSchema }),
  research: defineCollection({ schema: postSchema }),
  blog: defineCollection({ schema: postSchema }),
};
