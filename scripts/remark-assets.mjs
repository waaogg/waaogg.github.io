import { readFileSync } from 'node:fs';
// Sätteri's native visitor API; no legacy remark processor is needed.
export default function imageAssets(context){
  if(!context.source.includes('asset:'))return false;
  const assets=JSON.parse(readFileSync(new URL('../src/data/assets.json',import.meta.url),'utf8'));
  return {name:'journal-image-assets',image(node,ctx){
    if(!node.url.startsWith('asset:'))return;
    const id=node.url.slice(6),asset=assets.find(a=>a.id===id);if(!asset)throw Error('Unknown Markdown image asset: '+id);
    ctx.setProperty(node,'url',asset.variants.find(v=>v.width>=960)?.src||asset.src);
    if(!node.alt)ctx.setProperty(node,'alt',asset.alt);
    ctx.setProperty(node,'data',{hProperties:{width:asset.width,height:asset.height,loading:'lazy','data-full-src':asset.src,srcSet:asset.variants.map(v=>v.src+' '+v.width+'w').join(', '),sizes:'(max-width: 760px) 90vw, 760px'}});
  }};
}
