import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { resolve, dirname, extname, basename } from 'node:path';
import { parse, stringify } from 'yaml';
import { contentSchemas, siteSchema } from '../../src/lib/schemas.ts';

export const markdownKinds = new Set(['posts','memos','pages']);
export const revisionOf = text => createHash('sha256').update(text).digest('hex');
export function contentPath(root, kind, slug) {
  if (kind === 'site') return resolve(root,'src/data/site.json');
  if (!(kind in contentSchemas)) throw new Error('Unknown content type');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('Invalid file slug');
  return resolve(root,'src/content',kind,slug+(markdownKinds.has(kind)?'.md':'.json'));
}
export function decodeContent(kind, text) {
  if (!markdownKinds.has(kind)) return { data:JSON.parse(text), body:'' };
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('Missing Markdown frontmatter');
  return { data:parse(match[1]), body:match[2].trim() };
}
export function readEntry(root,kind,slug) {
  const path=contentPath(root,kind,slug), text=readFileSync(path,'utf8');
  return {kind,slug,revision:revisionOf(text),...decodeContent(kind,text)};
}
export function validateEntry(kind, data) {
  const schema=kind==='site'?siteSchema:contentSchemas[kind];
  if(!schema)throw new Error('Unknown content type');
  return schema.parse(data);
}
export function saveEntry(root,kind,slug,input,expectedRevision) {
  const path=contentPath(root,kind,slug);
  mkdirSync(dirname(path),{recursive:true});
  const lock=path+'.lock';
  let descriptor;
  try { descriptor=openSync(lock,'wx'); } catch { throw new Error('CONTENT_LOCKED: another write is in progress; retry after it finishes'); }
  try {
  const exists=existsSync(path);
  if (exists) {
    const current=readEntry(root,kind,slug);
    if (!expectedRevision || current.revision!==expectedRevision) throw new Error('REVISION_CONFLICT: read the latest revision before saving');
    if (kind!=='site' && current.data.contentId!==input.data.contentId) throw new Error('Stable contentId cannot be changed');
    if (kind==='posts' && current.data.slug!==input.data.slug) throw new Error('SLUG_MIGRATION_REQUIRED: add a redirect and migrate comments before changing a published path');
  } else if(expectedRevision) throw new Error('REVISION_CONFLICT: entry no longer exists');
  const data=validateEntry(kind,input.data);
  const normalized=JSON.parse(JSON.stringify(data));
  const text=markdownKinds.has(kind)?'---\n'+stringify(normalized)+'---\n\n'+(input.body||'').trim()+'\n':JSON.stringify(normalized,null,2)+'\n';
  const temporary=path+'.tmp-'+randomUUID();
  try { writeFileSync(temporary,text,{encoding:'utf8',flag:'wx'}); renameSync(temporary,path); }
  finally { if(existsSync(temporary))unlinkSync(temporary); }
  return readEntry(root,kind,slug);
  } finally { closeSync(descriptor); unlinkSync(lock); }
}
export function listContent(root) {
  const items=[], ids=new Set(), routes=new Set();
  for(const kind of Object.keys(contentSchemas)){
    const dir=resolve(root,'src/content',kind);
    if(!existsSync(dir))continue;
    for(const file of readdirSync(dir)){
      const ext=markdownKinds.has(kind)?'.md':'.json'; if(extname(file)!==ext)continue;
      const entry=readEntry(root,kind,basename(file,ext)); validateEntry(kind,entry.data);
      if(ids.has(entry.data.contentId))throw new Error('Duplicate contentId: '+entry.data.contentId);
      ids.add(entry.data.contentId);items.push(entry);
      if(kind==='posts'){const route=entry.data.slug||entry.slug;if(routes.has(route))throw new Error('Duplicate post route: '+route);routes.add(route);}
    }
  }
  validateEntry('site',readEntry(root,'site','settings').data);
  return items;
}
