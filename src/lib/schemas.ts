import { z } from 'astro/zod';
const date = () => z.coerce.date().meta({ type: 'string', format: 'date-time' });

export const publicationFields = {
  schemaVersion: z.literal(1).default(1),
  contentId: z.string().min(1),
  publication: z.enum(['draft', 'published', 'archived']).default('published'),
};
export const imageSchema = z.object({ src: z.string().min(1), alt: z.string().min(1), caption: z.string().optional() });
export const postSchema = z.object({
  ...publicationFields,
  title: z.string().min(1), description: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  pubDate: date(), updatedDate: date().optional(),
  tags: z.array(z.string()).default([]), heroImage: z.string().optional(), heroAlt: z.string().optional(),
  growth: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
  isDraft: z.boolean().default(false), featured: z.boolean().default(false),
});
export const memoSchema = z.object({
  ...publicationFields, date: date(), mood: z.string().default(''),
  tags: z.array(z.string()).default([]), images: z.array(imageSchema).default([]),
});
export const projectSchema = z.object({
  ...publicationFields, title: z.string().min(1), description: z.string().min(1),
  tech: z.array(z.string()).default([]), demoUrl: z.url().optional(), githubUrl: z.url().optional(),
  badge: z.string().optional(), featured: z.boolean().default(false), cover: z.string().optional(),
  stage: z.enum(['building', 'active', 'complete', 'archived']).default('active'), order: z.number().default(0),
});
export const mediaSchema = z.object({
  ...publicationFields, title: z.string().min(1), creator: z.string().default(''),
  type: z.enum(['book', 'movie', 'game', 'music']), rating: z.number().min(1).max(5).optional(),
  date: date(), review: z.string().default(''),
  status: z.enum(['completed', 'in-progress', 'wishlist']), cover: z.string().optional(), url: z.url().optional(),
});
export const friendSchema = z.object({
  ...publicationFields, name: z.string().min(1), description: z.string(),
  avatar: z.string().default(''), url: z.url(), tag: z.string().default('朋友'),
});
export const pageSchema = z.object({
  ...publicationFields, title: z.string(), description: z.string(), updatedDate: date(),
});
export const contentSchemas = { posts: postSchema, memos: memoSchema, projects: projectSchema, media: mediaSchema, friends: friendSchema, pages: pageSchema };
const localPath = z.string().regex(/^\/(?!\/)[^\s<>]*$/);
export const siteSchema = z.object({
  title:z.string().min(1), subtitle:z.string(), description:z.string(), author:z.string().min(1), bio:z.string(),
  avatar:z.string(), site:z.url(), siteStartDate:z.iso.datetime({offset:true}),
  social:z.object({github:z.url(),email:z.union([z.email(),z.literal('')])}),
  waline:z.object({serverURL:z.union([z.url(),z.literal('')])}),
  hero:z.object({eyebrow:z.string(),title:z.string(),emphasis:z.string(),description:z.string(),note:z.string()}),
  features:z.object({music:z.boolean(),quotes:z.boolean(),siteAge:z.boolean()}),
  navigation:z.array(z.object({label:z.string(),href:localPath})),
  explore:z.array(z.object({label:z.string(),href:localPath,description:z.string()})),
  music:z.array(z.object({title:z.string(),artist:z.string(),url:z.union([z.url(),localPath]),cover:z.string()})),
  quotes:z.array(z.object({text:z.string(),source:z.string()})),
});
