import sharp from 'sharp';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, existsSync, mkdirSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { assetSchema } from '../../src/lib/schemas.ts';
export function readAssets(root) {
  const file=resolve(root,'src/data/assets.json');
  return existsSync(file)?JSON.parse(readFileSync(file,'utf8')).map(item=>assetSchema.parse(item)):[];
}
export async function importAsset(root,file,options) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.id||''))throw Error('Use a stable lowercase asset id');
  if(!options.alt?.trim())throw Error('Image alternative text is required');
  const manifest=resolve(root,'src/data/assets.json');mkdirSync(dirname(manifest),{recursive:true});
  const lock=manifest+'.lock';let handle;
  try{handle=openSync(lock,'wx');}catch{throw Error('ASSETS_LOCKED');}
  let temporary;
  try{
    const library=readAssets(root);
    if(library.some(item=>item.id===options.id))throw Error('Asset id already exists; use a new id to preserve existing references');
    const source=readFileSync(file),fingerprint=createHash('sha256').update(source).digest('hex');
    const metadata=await sharp(source,{limitInputPixels:40000000}).metadata();
    if((metadata.pages||1)>1)throw Error('Use a still image, not an animated or multi-page image');
    const variants=[];
    for(const width of [320,640,960,1600]){
      // autoOrient applies camera orientation before metadata is stripped by WebP output.
      const {data,info}=await sharp(source,{limitInputPixels:40000000}).autoOrient().resize({width,withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true});
      if(variants.some(v=>v.width===info.width))continue;
      const name=options.id+'-'+createHash('sha256').update(data).digest('hex').slice(0,12)+'-'+info.width+'.webp';
      const url='/images/library/'+name,path=resolve(root,'public'+url);mkdirSync(dirname(path),{recursive:true});
      if(!existsSync(path))writeFileSync(path,data,{flag:'wx'});
      variants.push({src:url,width:info.width,height:info.height});
    }
    const largest=variants.at(-1);
    const entry=assetSchema.parse({id:options.id,title:options.title||options.alt,alt:options.alt,caption:options.caption||'',fit:options.fit||'cover',focal:{x:Number(options.x??50),y:Number(options.y??50)},...largest,variants,fingerprint,createdAt:new Date().toISOString()});
    library.push(entry);temporary=manifest+'.tmp-'+randomUUID();
    writeFileSync(temporary,JSON.stringify(library,null,2)+'\n',{flag:'wx'});renameSync(temporary,manifest);
    return entry;
  }finally{if(temporary&&existsSync(temporary))unlinkSync(temporary);closeSync(handle);unlinkSync(lock);}
}
