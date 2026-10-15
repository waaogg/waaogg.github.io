import { writeFileSync, existsSync, unlinkSync, readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const npmCLI=process.env.npm_execpath;if(!npmCLI)throw new Error('Run with npm run test:publication');
const token='verification-not-for-public-8d19',paths=[];
const build=()=>execFileSync(process.execPath,[npmCLI,'run','build'],{stdio:'inherit'});
const topicFile='src/content/topics/building-a-journal.md',originalTopic=readFileSync(topicFile,'utf8');
try{
  for(const [name,extra] of [['draft','publication: draft'],['archived','publication: archived'],['legacy','isDraft: true'],['future','pubDate: 2100-01-01']]){
    const path=join('src/content/posts','verification-'+name+'.md');assert.equal(existsSync(path),false);
    const date=extra.startsWith('pubDate')?'':'pubDate: 2026-01-01\n';
    writeFileSync(path,'---\ncontentId: verification-'+name+'\ntitle: '+token+'\ndescription: private fixture\n'+date+extra+'\ntags: [verification-private-tag]\n---\n\n'+token,{flag:'wx'});paths.push(path);
  }
  for(const kind of ['gallery','cards','updates','topics']){
    for(const state of (kind==='topics'?['draft','archived']:['draft','archived','future'])){
      const slug='verification-'+kind+'-'+state,path=join('src/content',kind,slug+(kind==='topics'?'.md':'.json'));
      assert.equal(existsSync(path),false);mkdirSync(join('src/content',kind),{recursive:true});
      const data={contentId:slug,title:token,description:token,publication:state==='future'?'published':state,date:state==='future'?'2100-01-01':'2026-01-01',assetId:'window-light',type:'image',text:token,kind:'site',posts:['post-slow-notes'],updatedDate:'2026-01-01'};
      writeFileSync(path,kind==='topics'?'---\n'+Object.entries(data).map(([k,v])=>k+': '+JSON.stringify(v)).join('\n')+'\n---\n\n'+token:JSON.stringify(data),{flag:'wx'});paths.push(path);
    }
  }
  // A public series may reference a hidden post. Neither its title nor its ID
  // should leak through series counts, local reading catalogs or next links.
  writeFileSync(topicFile,originalTopic.replace('posts: [','posts: [verification-draft, verification-future, '));
  build();
  for(const name of ['draft','archived','legacy','future'])assert.equal(existsSync('dist/posts/verification-'+name+'/index.html'),false);
  assert.equal(existsSync('dist/tags/verification-private-tag/index.html'),false);
  const walk=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else if(/\.(html|xml|json)$/.test(path))assert.ok(!readFileSync(path,'utf8').includes(token),'Private content leaked into '+path);}};
  walk('dist');console.log('Negative publication test passed: posts, gallery, cards, topics and updates exclude unpublished/future content across HTML, XML, JSON and reading catalogs.');
}finally{
  writeFileSync(topicFile,originalTopic);
  for(const path of paths)if(existsSync(path))unlinkSync(path);
  // Always leave a production build without fixtures, even when an assertion fails.
  build();
}
