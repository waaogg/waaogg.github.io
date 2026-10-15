import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename } from 'node:path';
import { isPublished, postPath, formatDate } from '../src/lib/publication.ts';
import { postSchema, mediaSchema, siteSchema } from '../src/lib/schemas.ts';
import { readEntry, saveEntry, contentPath, listContent } from '../scripts/lib/content-store.mjs';

const valid = {schemaVersion:1,contentId:'stable-1',publication:'published',title:'测试',description:'说明',pubDate:'2026-01-01T00:00:00+08:00'};
test('publication excludes drafts, archived and future posts',()=>{
  const now=new Date('2026-10-15T12:00:00Z');
  for(const data of [{publication:'draft'},{publication:'archived'},{isDraft:true},{pubDate:new Date('2100-01-01')}])assert.equal(isPublished(data,now),false);
  assert.equal(isPublished({publication:'published',pubDate:new Date('2026-01-01')},now),true);
});
test('schema rejects missing identity, invalid slug and invalid date',()=>{
  assert.equal(postSchema.safeParse({...valid,contentId:''}).success,false);
  assert.equal(postSchema.safeParse({...valid,slug:'../../private'}).success,false);
  assert.equal(postSchema.safeParse({...valid,pubDate:'not-a-date'}).success,false);
});
test('wishlist items do not require invented ratings',()=>{
  assert.equal(mediaSchema.safeParse({contentId:'book-1',title:'待读',type:'book',date:'2026-01-01',status:'wishlist'}).success,true);
  assert.equal(mediaSchema.safeParse({contentId:'book-1',title:'待读',type:'book',date:'2026-01-01',status:'wishlist',rating:9}).success,false);
});
test('paths use a stable slug and dates use Shanghai timezone',()=>{
  assert.equal(postPath({id:'old-filename',data:{slug:'permanent-address'}}),'/posts/permanent-address/');
  assert.match(formatDate(new Date('2026-10-14T20:00:00Z')),/2026\/10\/15/);
});
test('content paths reject traversal and unknown collections',()=>{
  assert.throws(()=>contentPath(process.cwd(),'posts','../secret'));
  assert.throws(()=>contentPath(process.cwd(),'unknown','file'));
});
test('file roundtrip, optimistic revision conflict and stable identity',()=>{
  const root=mkdtempSync(join(tmpdir(),'journal-test-'));
  try{
    const first=saveEntry(root,'posts','hello',{data:valid,body:'## 你好\n\n正文。'});
    assert.equal(first.data.contentId,'stable-1');assert.equal(first.body,'## 你好\n\n正文。');
    assert.throws(()=>saveEntry(root,'posts','hello',{data:valid,body:'stale'}),'missing revision must not overwrite');
    const second=saveEntry(root,'posts','hello',{data:valid,body:'new body'},first.revision);
    assert.notEqual(second.revision,first.revision);
    assert.throws(()=>saveEntry(root,'posts','hello',{data:valid,body:'stale'},first.revision),/REVISION_CONFLICT/);
    assert.throws(()=>saveEntry(root,'posts','hello',{data:{...valid,contentId:'different'},body:''},second.revision),/contentId/);
    assert.throws(()=>saveEntry(root,'posts','hello',{data:{...valid,slug:'changed-path'},body:''},second.revision),/SLUG_MIGRATION_REQUIRED/);
    assert.equal(readEntry(root,'posts','hello').body,'new body');
    writeFileSync(contentPath(root,'posts','hello')+'.lock','held');
    assert.throws(()=>saveEntry(root,'posts','hello',{data:valid,body:'locked'},second.revision),/CONTENT_LOCKED/);
  }finally{
    assert.equal(dirname(resolve(root)),resolve(tmpdir()));assert.ok(basename(root).startsWith('journal-test-'));rmSync(root,{recursive:true});
  }
});
test('all author content and site settings validate against shared schemas',()=>{
  const all=listContent(process.cwd());assert.ok(all.length>=15);assert.equal(new Set(all.map(e=>e.data.contentId)).size,all.length);
  const site=readEntry(process.cwd(),'site','settings').data;
  assert.equal(siteSchema.safeParse(site).success,true);
  assert.equal(siteSchema.safeParse({...site,navigation:[{label:'bad',href:'javascript:alert(1)'}]}).success,false);
});
