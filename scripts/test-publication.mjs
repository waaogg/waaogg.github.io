import { writeFileSync, existsSync, unlinkSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const npmCLI=process.env.npm_execpath;if(!npmCLI)throw new Error('Run with npm run test:publication');
const token='verification-not-for-public-8d19',paths=[];
const build=()=>execFileSync(process.execPath,[npmCLI,'run','build'],{stdio:'inherit'});
try{
  for(const [name,extra] of [['draft','publication: draft'],['archived','publication: archived'],['legacy','isDraft: true'],['future','pubDate: 2100-01-01']]){
    const path=join('src/content/posts','verification-'+name+'.md');assert.equal(existsSync(path),false);
    const date=extra.startsWith('pubDate')?'':'pubDate: 2026-01-01\n';
    writeFileSync(path,'---\ncontentId: verification-'+name+'\ntitle: '+token+'\ndescription: private fixture\n'+date+extra+'\ntags: [verification-private-tag]\n---\n\n'+token,{flag:'wx'});paths.push(path);
  }
  build();
  for(const name of ['draft','archived','legacy','future'])assert.equal(existsSync('dist/posts/verification-'+name+'/index.html'),false);
  assert.equal(existsSync('dist/tags/verification-private-tag/index.html'),false);
  const walk=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else if(/\.(html|xml|json)$/.test(path))assert.ok(!readFileSync(path,'utf8').includes(token),'Private content leaked into '+path);}};
  walk('dist');console.log('Negative publication test passed: draft, archived, legacy draft and future content excluded.');
}finally{
  for(const path of paths)if(existsSync(path))unlinkSync(path);
  // Always leave a production build without fixtures, even when an assertion fails.
  build();
}
