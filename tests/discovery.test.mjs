import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtempSync,rmSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve,basename} from 'node:path';
import {importAsset,readAssets} from '../scripts/lib/assets-store.mjs';
import {validateReferences} from '../scripts/lib/references.mjs';
import {listContent} from '../scripts/lib/content-store.mjs';
import {parseLibrary,limitReading,emptyLibrary} from '../src/lib/library-state.ts';
import {assetSchema,cardSchema,topicSchema} from '../src/lib/schemas.ts';
test('image import creates responsive references, strips metadata, and preserves stable ids',async()=>{
  const root=mkdtempSync(join(tmpdir(),'journal-assets-'));
  try{
    const file=join(root,'camera.jpg');
    await sharp({create:{width:1200,height:900,channels:3,background:'#85917f'}}).withExif({IFD0:{Artist:'Private source metadata'}}).jpeg().toFile(file);
    const first=await importAsset(root,file,{id:'my-photo',alt:'A test image',x:25,y:75});
    assert.deepEqual(first.variants.map(v=>v.width),[320,640,960,1200]);assert.equal(first.focal.x,25);
    const metadata=await sharp(readFileSync(join(root,'public'+first.src))).metadata();assert.equal(metadata.exif,undefined);assert.equal(metadata.width,1200);
    assert.equal(readAssets(root).length,1);const before=readFileSync(join(root,'src/data/assets.json'),'utf8');
    await assert.rejects(importAsset(root,file,{id:'my-photo',alt:'overwrite'}),/already exists/);
    assert.equal(readFileSync(join(root,'src/data/assets.json'),'utf8'),before);
    await assert.rejects(importAsset(root,file,{id:'../../private',alt:'bad'}),/stable/);
    const corrupt=join(root,'corrupt.jpg');writeFileSync(corrupt,'not an image');await assert.rejects(importAsset(root,corrupt,{id:'broken',alt:'broken'}));
    assert.equal(readAssets(root).length,1);assert.equal(existsSync(join(root,'src/data/assets.json.lock')),false);
    assert.equal(assetSchema.safeParse({...first,src:'/images/library/../../secret.webp'}).success,false);
  }finally{assert.equal(dirname(resolve(root)),resolve(tmpdir()));assert.ok(basename(root).startsWith('journal-assets-'));rmSync(root,{recursive:true});}
});
test('library tolerates invalid browser data, bounds progress and keeps latest 100 positions',()=>{
  for(const raw of [null,'invalid','{}','{"version":9}'])assert.deepEqual(parseLibrary(raw),emptyLibrary());
  const state=parseLibrary(JSON.stringify({version:1,saved:{ok:12,bad:'time'},reading:{ok:{progress:1000,scroll:-20,anchor:'标题',delta:15,updatedAt:1,complete:true},bad:{progress:'oops'}}}));
  assert.equal(state.saved.ok,12);assert.equal(state.saved.bad,undefined);assert.equal(state.reading.ok.progress,100);assert.equal(state.reading.ok.scroll,0);assert.equal(state.reading.bad,undefined);
  for(let i=1;i<=120;i++)state.reading['post-'+i]={progress:20,scroll:100,anchor:'',delta:0,updatedAt:i,complete:false};
  const limited=limitReading(state);assert.equal(Object.keys(limited.reading).length,100);assert.equal(limited.reading['post-1'],undefined);assert.ok(limited.reading['post-120']);
});
test('cards, series and cross-content references cannot silently point to missing items',()=>{
  assert.equal(cardSchema.safeParse({contentId:'c',type:'image',title:'Image',date:'2026-01-01'}).success,false);
  assert.equal(topicSchema.safeParse({contentId:'t',title:'Topic',description:'d',updatedDate:'2026-01-01',posts:['one','one']}).success,false);
  const items=listContent(process.cwd());validateReferences(process.cwd(),items);
  assert.throws(()=>validateReferences(process.cwd(),[{kind:'gallery',slug:'broken',data:{publication:'published',assetId:'does-not-exist'}}]),/Unknown image/);
  assert.throws(()=>validateReferences(process.cwd(),[{kind:'topics',slug:'broken',data:{posts:['missing']}}]),/Unknown topic post/);
});
