import { getCollection } from 'astro:content';
import { isPublished,postPath } from './publication';
export const labels:Record<string,string>={posts:'文章',memos:'日常',projects:'作品',gallery:'影像',topics:'专题'};
export async function publicCatalog(){
  const groups=await Promise.all((['posts','memos','projects','gallery','topics'] as const).map(async kind=>{
    const entries=await getCollection(kind);
    return entries.filter(e=>isPublished(e.data)).map(e=>({id:e.data.contentId,path:e.collection==='posts'?postPath(e):'/'+kind+'/'+e.id+'/',title:'title' in e.data?e.data.title:'日常 · '+new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium'}).format(e.data.date),kind,label:labels[kind]}));
  }));return groups.flat();
}
export async function resolveTarget(target?:{kind:string;contentId:string}){
  if(!target)return undefined;
  return (await publicCatalog()).find(item=>item.id===target.contentId && item.kind===target.kind);
}
export async function publishedGallery(){return (await getCollection('gallery',({data})=>isPublished(data))).sort((a,b)=>b.data.date.valueOf()-a.data.date.valueOf());}
export async function publishedTopics(){return (await getCollection('topics',({data})=>isPublished(data))).sort((a,b)=>a.data.order-b.data.order);}
