import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { siteConfig } from '../site.config';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const validPosts = posts
    .filter((post) => !post.data.isDraft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site || siteConfig.site,
    items: validPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
