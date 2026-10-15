// Local-only negative UI test: serve the built site with the search index unavailable.
import { createServer } from 'node:http';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { resolve, join, extname, sep } from 'node:path';
const root=resolve('dist'),types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.wav':'audio/wav','.wasm':'application/wasm','.json':'application/json'};
createServer((request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(pathname==='/pagefind/pagefind.js'){response.writeHead(503);response.end('Search index unavailable for negative test');return;}
    let file=resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403);response.end();return;}
    if(existsSync(file)&&statSync(file).isDirectory())file=join(file,'index.html');
    if(!existsSync(file)){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');createReadStream(file).pipe(response);
  }catch{response.writeHead(400);response.end();}
}).listen(4323,'127.0.0.1',()=>console.log('Negative-test preview: http://127.0.0.1:4323'));
