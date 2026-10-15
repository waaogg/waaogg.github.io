import { z } from 'astro/zod';
const date = () => z.coerce.date().meta({ type: 'string', format: 'date-time' });

export const publicationFields = {
  schemaVersion: z.literal(1).default(1),
  contentId: z.string().min(1),
  publication: z.enum(['draft', 'published', 'archived']).default('published'),
  updates: z.array(z.object({ date: date(), text: z.string().min(1) })).default([]),
};
const identifier = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const imageSchema = z.union([
  z.object({ assetId: identifier, alt: z.string().optional(), caption: z.string().optional() }),
  z.object({ src: z.string().min(1), alt: z.string().min(1), caption: z.string().optional() }),
]);
export const assetSchema = z.object({
  id: identifier, title: z.string().min(1), alt: z.string().min(1),
  src: z.string().regex(/^\/images\/library\/[a-z0-9-]+\.webp$/), width: z.number().int().positive(), height: z.number().int().positive(),
  variants: z.array(z.object({ src:z.string().regex(/^\/images\/library\/[a-z0-9-]+\.webp$/), width:z.number().int().positive(), height:z.number().int().positive() })).min(1),
  focal: z.object({ x:z.number().min(0).max(100), y:z.number().min(0).max(100) }).default({x:50,y:50}),
  fit:z.enum(['cover','contain']).default('cover'), caption:z.string().default(''),
  createdAt:date(), fingerprint:z.string().regex(/^[a-f0-9]{64}$/),
});
const target = z.object({ kind:z.enum(['posts','memos','projects','gallery']), contentId:z.string().min(1) });
export const postSchema = z.object({
  ...publicationFields,
  title: z.string().min(1), description: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  pubDate: date(), updatedDate: date().optional(),
  tags: z.array(z.string()).default([]), heroImage: z.string().optional(), heroAlt: z.string().optional(), heroAsset:identifier.optional(),
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
  badge: z.string().optional(), featured: z.boolean().default(false), cover: z.string().optional(), coverAsset:identifier.optional(), date:date().optional(),
  stage: z.enum(['building', 'active', 'complete', 'archived']).default('active'), order: z.number().default(0),
});
export const mediaSchema = z.object({
  ...publicationFields, title: z.string().min(1), creator: z.string().default(''),
  type: z.enum(['book', 'movie', 'game', 'music']), rating: z.number().min(1).max(5).optional(),
  date: date(), review: z.string().default(''),
  status: z.enum(['completed', 'in-progress', 'wishlist']), cover: z.string().optional(), coverAsset:identifier.optional(), url: z.url().optional(),
});
export const friendSchema = z.object({
  ...publicationFields, name: z.string().min(1), description: z.string(),
  avatar: z.string().default(''), url: z.url(), tag: z.string().default('朋友'),
});
export const pageSchema = z.object({
  ...publicationFields, title: z.string(), description: z.string(), updatedDate: date(),
});
export const gallerySchema = z.object({
  ...publicationFields, title:z.string().min(1), description:z.string().default(''), assetId:identifier,
  date:date(), themes:z.array(z.string().min(1)).default([]), location:z.string().optional(), related:target.optional(),
});
export const cardSchema = z.object({
  ...publicationFields, type:z.enum(['note','image','feature']), title:z.string().min(1), text:z.string().default(''),
  date:date(), assetId:identifier.optional(), order:z.number().default(0), label:z.string().default('LITTLE MOMENTS'),
  appearance:z.enum(['tape','plain','postcard']).default('tape'), fit:z.enum(['cover','contain']).optional(),
  related:target.optional(), galleryId:identifier.optional(),
}).refine(data => data.type==='note' || !!data.assetId, { message:'Image and feature cards require assetId' });
export const topicSchema = z.object({
  ...publicationFields, title:z.string().min(1), description:z.string().min(1),
  posts:z.array(z.string().min(1)).refine(ids=>new Set(ids).size===ids.length,'Duplicate post in topic'),
  order:z.number().default(0), updatedDate:date(),
});
export const updateSchema = z.object({
  ...publicationFields, title:z.string().min(1), description:z.string().min(1), date:date(),
  kind:z.enum(['site','content']).default('site'), related:target.optional(),
});
export const contentSchemas = { posts: postSchema, memos: memoSchema, projects: projectSchema, media: mediaSchema, friends: friendSchema, pages: pageSchema, gallery:gallerySchema, cards:cardSchema, topics:topicSchema, updates:updateSchema };
const localPath = z.string().regex(/^\/(?!\/)[^\s<>]*$/);
export const siteSchema = z.object({
  title:z.string().min(1), subtitle:z.string(), description:z.string(), author:z.string().min(1), bio:z.string(),
  avatar:z.string(), site:z.url(), siteStartDate:z.iso.datetime({offset:true}),
  social:z.object({github:z.url(),email:z.union([z.email(),z.literal('')])}),
  waline:z.object({serverURL:z.union([z.url(),z.literal('')])}),
  hero:z.object({eyebrow:z.string(),title:z.string(),emphasis:z.string(),description:z.string()}),
  features:z.object({music:z.boolean(),quotes:z.boolean(),siteAge:z.boolean()}),
  navigation:z.array(z.object({label:z.string(),href:localPath})),
  explore:z.array(z.object({label:z.string(),href:localPath,description:z.string()})),
  music:z.array(z.object({title:z.string(),artist:z.string(),url:z.union([z.url(),localPath]),cover:z.string()})),
  quotes:z.array(z.object({text:z.string(),source:z.string()})),
});
