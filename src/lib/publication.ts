export interface Publication { publication?: 'draft' | 'published' | 'archived'; isDraft?: boolean; pubDate?: Date; }
/** Shared by routes, feeds, lists, search and random navigation. */
export function isPublished(data: Publication, now = new Date()): boolean {
  return !data.isDraft && (data.publication ?? 'published') === 'published'
    && (!data.pubDate || data.pubDate.getTime() <= now.getTime());
}
export function postPath(post: { id: string; data: { slug?: string } }): string { return '/posts/' + (post.data.slug || post.id) + '/'; }
export const growthLabels = { seedling: '萌芽', budding: '生长中', evergreen: '常青' };
export function formatDate(date: Date, short = false): string {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: short ? undefined : 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function readingStats(text: string) {
  const plain = text.replace(/https?:\/\/\S+/g, '');
  const words = (plain.match(/[\u3400-\u9fff]|[a-zA-Z0-9]+/g) || []).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 350)) };
}
