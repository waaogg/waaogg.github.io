import { getCollection } from 'astro:content';
import { publishedPosts, publishedMemos, postPath } from '../lib/content';
import { isPublished } from '../lib/publication';
import { siteConfig } from '../site.config';
const escape = (value:string) => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export async function GET() {
  const posts=await publishedPosts(),memos=await publishedMemos(),projects=await getCollection('projects',({data})=>isPublished(data));
  const pages=await getCollection('pages',({data})=>isPublished(data));
  const tags=[...new Set(posts.flatMap(post=>post.data.tags))];
  const gallery=await getCollection('gallery',({data})=>isPublished(data)),topics=await getCollection('topics',({data})=>isPublished(data));
  const paths=['/','/posts/','/memos/','/projects/','/media/','/friends/','/guestbook/',...pages.map(p=>'/'+p.id+'/'),...posts.map(postPath),...memos.map(m=>'/memos/'+m.id+'/'),...projects.map(p=>'/projects/'+p.id+'/'),...tags.map(tag=>'/tags/'+encodeURIComponent(tag)+'/')];
  paths.push('/gallery/','/topics/','/updates/',...gallery.map(i=>'/gallery/'+i.id+'/'),...topics.map(i=>'/topics/'+i.id+'/'));
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>'<url><loc>'+escape(new URL(path,siteConfig.site).href)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}});
}
