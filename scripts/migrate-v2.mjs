import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
for (const kind of ['posts', 'memos', 'projects', 'media', 'friends']) {
  const dir = join('src/content', kind);
  for (const filename of readdirSync(dir)) {
    const file = join(dir, filename);
    const id = kind + '-' + basename(filename).replace(/\.(md|json)$/, '');
    if (filename.endsWith('.md')) {
      let text = readFileSync(file, 'utf8');
      if (!/^contentId:/m.test(text)) text = text.replace(/^---\r?\n/, '---\nschemaVersion: 1\ncontentId: "' + id + '"\npublication: published\n');
      if (kind === 'posts') {
        let fenced=false;
        const ticks=String.fromCharCode(96).repeat(3);
        text=text.split('\n').map(line=>{
          if(line.trimStart().startsWith(ticks)||line.trimStart().startsWith('~~~'))fenced=!fenced;
          return !fenced?line.replace(/^# /,'## '):line;
        }).join('\n');
      }
      writeFileSync(file, text, 'utf8');
    } else if (filename.endsWith('.json')) {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      writeFileSync(file, JSON.stringify({ schemaVersion: 1, contentId: id, publication: 'published', ...data }, null, 2) + '\n');
    }
  }
}
console.log('Content migrated to schema v1; existing stable IDs preserved.');
