import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { readEntry, saveEntry, listContent } from './lib/content-store.mjs';
const [command,kind,slug,...options]=process.argv.slice(2);
const root=process.cwd();
try {
  if(command==='validate'){const items=listContent(root);console.log('Validated '+items.length+' entries and site settings.');}
  else if(command==='list'){console.log(JSON.stringify(listContent(root).map(({kind,slug,revision,data})=>({kind,slug,revision,title:data.title||data.name||data.date,contentId:data.contentId,publication:data.publication||'published'})),null,2));}
  else if(command==='read')console.log(JSON.stringify(readEntry(root,kind,slug),null,2));
  else if(command==='save'){
    const fileIndex=options.indexOf('--file'),revisionIndex=options.indexOf('--revision');
    if(fileIndex<0)throw new Error('Provide --file payload.json containing {data,body}');
    const input=JSON.parse(readFileSync(resolve(options[fileIndex+1]),'utf8'));
    console.log(JSON.stringify(saveEntry(root,kind,slug,input,revisionIndex>=0?options[revisionIndex+1]:undefined),null,2));
  } else if(command==='new'){
    const now=new Date().toISOString(), common={schemaVersion:1,contentId:randomUUID(),publication:'draft'};
    const defaults={
      posts:{...common,title:'新的手记',description:'写下这篇文章的简短介绍。',pubDate:now,tags:[],growth:'seedling'},
      memos:{...common,date:now,tags:[],images:[]}, projects:{...common,title:'新的作品',description:'关于这个作品。',tech:[]},
      media:{...common,title:'新的相遇',type:'book',date:now,status:'wishlist'},
      friends:{...common,name:'朋友的小站',url:'https://example.com',description:'写下介绍。'},
      pages:{...common,title:'新的页面',description:'页面介绍。',updatedDate:now},
    };
    if(!defaults[kind])throw new Error('Use new posts|memos|projects|media|friends|pages <file-slug>');
    console.log(JSON.stringify(saveEntry(root,kind,slug,{data:defaults[kind],body:''}),null,2));
  } else {
    console.log('Content tools:\n  npm run content -- validate\n  npm run content -- list\n  npm run content -- new posts my-note\n  npm run content -- read posts my-note\n  npm run content -- save posts my-note --file payload.json --revision <sha256>\n\nNew entries are drafts. Never put private drafts in this public GitHub repository.');
  }
}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
