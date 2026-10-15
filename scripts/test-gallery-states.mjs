import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const npmCLI=process.env.npm_execpath;if(!npmCLI)throw Error('Run through npm run test:gallery');
const originals=readdirSync('src/content/cards').filter(f=>f.endsWith('.json')).map(file=>({file:'src/content/cards/'+file,text:readFileSync('src/content/cards/'+file,'utf8')}));
const build=()=>execFileSync(process.execPath,[npmCLI,'run','build'],{stdio:'pipe'});
try{
  for(const count of [1,0]){
    originals.forEach((entry,i)=>{const data=JSON.parse(entry.text);data.publication=i<count?'published':'draft';writeFileSync(entry.file,JSON.stringify(data));});
    build();const html=readFileSync('dist/index.html','utf8');
    assert.equal((html.match(/<article\b[^>]*data-moment-card/g)||[]).length,count);
    assert.equal(html.includes('data-deck-controls'),false,'No redundant navigation for zero or one card');
    if(count===0)assert.equal(html.includes('data-moment-deck'),false);
  }
  console.log('Actual build checks passed for zero cards and one card.');
}finally{for(const entry of originals)writeFileSync(entry.file,entry.text);build();}
