import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    growth: z.enum(['seedling', 'budding', 'evergreen']).default('evergreen'),
    isDraft: z.boolean().default(false),
  }),
});

const memos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/memos' }),
  schema: z.object({
    date: z.coerce.date(),
    mood: z.string().default('💡'),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    demoUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    badge: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/media' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['book', 'movie', 'game', 'music']),
    rating: z.number().min(1).max(5),
    date: z.coerce.date(),
    review: z.string(),
    status: z.enum(['completed', 'in-progress', 'wishlist']),
  }),
});

const friends = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/friends' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    avatar: z.string(),
    url: z.string(),
    tag: z.string().default('技术博友'),
  }),
});

export const collections = { posts, memos, projects, media, friends };
