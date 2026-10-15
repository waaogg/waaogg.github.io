import { getCollection } from 'astro:content';
import { isPublished } from './publication';
export { postPath, formatDate, growthLabels, readingStats } from './publication';
export async function publishedPosts() {
  return (await getCollection('posts', ({ data }) => isPublished(data))).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
export async function publishedMemos() {
  return (await getCollection('memos', ({ data }) => isPublished(data))).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
