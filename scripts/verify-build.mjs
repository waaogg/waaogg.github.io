import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';
const root='dist',files=[];
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);entry.isDirectory()?walk(path):files.push(path);}}
walk(root);
const html=files.filter(path=>path.endsWith('.html'));
const problems=[];
for(const path of html){
  const text=readFileSync(path,'utf8'),page=relative(root,path);
  if(!/<title>[^<]+<\/title>/.test(text))problems.push(page+': missing title');
  if((text.match(/<h1[\s>]/g)||[]).length!==1)problems.push(page+': must have exactly one h1');
  if(!/<link[^>]+rel="canonical"/.test(text))problems.push(page+': missing canonical');
  if(!/<html[^>]+lang="zh-CN"/.test(text))problems.push(page+': missing language');
  for(const match of text.matchAll(/srcset="([^"]+)"/g))for(const candidate of match[1].split(',')){
    const src=candidate.trim().split(/\s+/)[0];if(src.startsWith('/')&&!existsSync(join(root,decodeURIComponent(src))))problems.push(page+': missing responsive image '+src);
  }
  for(const match of text.matchAll(/(?:href|src)="(\/[^"]*)"/g)){
    const raw=match[1].replace(/&amp;/g,'&'),url=new URL(raw,'https://test.invalid');
    if(!url.pathname||url.pathname==='/')continue;
    const file=join(root,decodeURIComponent(url.pathname));
    if(!existsSync(file)&&!existsSync(join(file,'index.html')))problems.push(page+': missing internal link '+raw);
    else if(existsSync(file)&&statSync(file).isFile()&&url.hash&&file.endsWith('.html')){
      const id=decodeURIComponent(url.hash.slice(1));if(!readFileSync(file,'utf8').includes('id="'+id+'"'))problems.push(page+': missing anchor '+raw);
    }
  }
}
assert.deepEqual(problems,[]);
assert.ok(existsSync('dist/404.html'));assert.ok(existsSync('dist/pagefind/pagefind.js'));assert.ok(existsSync('dist/content-contract.json'));
for(const path of ['dist/index.html','dist/posts/index.html','dist/memos/index.html','dist/projects/index.html','dist/gallery/index.html','dist/topics/index.html','dist/library/index.html','dist/updates/index.html']){
  assert.ok(!readFileSync(path,'utf8').includes('data-pagefind-body'),'Aggregate page must not duplicate search entries: '+path);
}
const contract=JSON.parse(readFileSync('dist/content-contract.json','utf8'));
assert.equal(contract.version,1);assert.equal(contract.schemas.posts.properties.pubDate.type,'string');
assert.equal(contract.schemas.posts.properties.pubDate.format,'date-time');
assert.ok(contract.schemas.asset);assert.ok(contract.schemas.gallery);assert.ok(contract.schemas.topics);
assert.ok(readFileSync('dist/library/index.html','utf8').includes('noindex, follow'));
console.log('Verified '+html.length+' HTML pages, internal links, canonical metadata, unique search scopes and editor schema.');
