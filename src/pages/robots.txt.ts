import { siteConfig } from '../site.config';
export function GET() { return new Response('User-agent: *\nAllow: /\nSitemap: '+new URL('/sitemap.xml',siteConfig.site).href+'\n',{headers:{'Content-Type':'text/plain'}}); }
