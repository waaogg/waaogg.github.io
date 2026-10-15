import { writeFileSync, mkdirSync } from 'node:fs';
import { z } from 'astro/zod';
import { contentSchemas, siteSchema } from '../src/lib/schemas.ts';
const schemas=Object.fromEntries(Object.entries({...contentSchemas,site:siteSchema}).map(([kind,schema])=>[kind,z.toJSONSchema(schema,{unrepresentable:'any',io:'input'})]));
mkdirSync('public',{recursive:true});
writeFileSync('public/content-contract.json',JSON.stringify({
  version:1,bodyFormat:'markdown',timezone:'Asia/Shanghai',
  canonicalSource:'file-repository',concurrency:'sha256-baseRevision',schemas,
  operations:['list','read','save-draft','preview','publish','withdraw','upload-asset','job-status'],
  notes:['This file describes data, not a writable API.','A private authenticated publishing service is required for online writes.','Public repository history is public; keep private drafts outside it.']
},null,2)+'\n');
console.log('Generated public/content-contract.json from shared schemas.');
