import rss from '@astrojs/rss';
import { publishedPosts, postPath } from '../lib/content';
import { siteConfig } from '../site.config';
export async function GET() {
  return rss({ title:siteConfig.title, description:siteConfig.description, site:siteConfig.site,
    items:(await publishedPosts()).map(post=>({title:post.data.title,pubDate:post.data.pubDate,description:post.data.description,link:postPath(post)})), customData:'<language>zh-CN</language>' });
}
