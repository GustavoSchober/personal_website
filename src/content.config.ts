import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const shared = {
  title: z.string(),
  metric: z.string().optional(),
  metricLabel: z.string().optional(),
  chips: z.array(z.string()).default([]),
  order: z.number(),
};

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({ ...shared, stack: z.string() }),
  }),
  experience: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
    schema: z.object({ ...shared, org: z.string().optional(), period: z.string() }),
  }),
};
