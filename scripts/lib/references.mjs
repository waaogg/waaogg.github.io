import { readAssets } from './assets-store.mjs';
import { isPublished } from '../../src/lib/publication.ts';
export function validateReferences(root,items){
  const assets=new Set(readAssets(root).map(a=>a.id));
  const identity=new Map(items.map(e=>[e.data.contentId,e]));
  for(const entry of items){
    const d=entry.data;
    if(!isPublished({...d,pubDate:d.pubDate?new Date(d.pubDate):undefined,date:d.date?new Date(d.date):undefined}))continue;
    const check=id=>{if(id&&!assets.has(id))throw Error('Unknown image asset '+id+' in '+entry.kind+'/'+entry.slug);};
    [d.assetId,d.heroAsset,d.coverAsset,...(d.images||[]).map(i=>i.assetId)].forEach(check);
    for(const match of (entry.body||'').matchAll(/!\[[^\]]*\]\(asset:([a-z0-9-]+)\)/g))check(match[1]);
    if(d.related){const target=identity.get(d.related.contentId);if(!target||target.kind!==d.related.kind)throw Error('Unknown related content in '+entry.slug);}
    if(d.galleryId&&!items.some(e=>e.kind==='gallery'&&e.slug===d.galleryId))throw Error('Unknown gallery item in '+entry.slug);
    if(entry.kind==='topics')for(const id of d.posts){if(identity.get(id)?.kind!=='posts')throw Error('Unknown topic post '+id);}
  }
}
