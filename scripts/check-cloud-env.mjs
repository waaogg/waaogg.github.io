import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
const env={...(existsSync('.env')?parseEnv(readFileSync('.env','utf8')):{}),...process.env};
try {
  if(!env.PUBLIC_SITE_URL)throw new Error('Set PUBLIC_SITE_URL to the cloud site origin.');
  const site=new URL(env.PUBLIC_SITE_URL);
  if(!['https:','http:'].includes(site.protocol)||site.pathname!=='/')throw new Error('Use an http(s) origin without a path prefix.');
  if(process.argv.includes('--comments')){
    if(!env.PUBLIC_WALINE_SERVER_URL)throw new Error('Set PUBLIC_WALINE_SERVER_URL.');
    new URL(env.PUBLIC_WALINE_SERVER_URL);
    if(!env.WALINE_JWT_TOKEN||env.WALINE_JWT_TOKEN.length<32)throw new Error('Set a unique WALINE_JWT_TOKEN of at least 32 characters.');
    if(site.protocol==='https:'&&!env.PUBLIC_WALINE_SERVER_URL.startsWith('https://'))throw new Error('An HTTPS frontend requires an HTTPS comment endpoint.');
  }
  console.log('Cloud environment passed. Secret values were not printed.');
}catch(error){console.error(error.message);process.exitCode=1;}
