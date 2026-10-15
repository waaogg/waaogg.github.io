import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const git = (args, cwd = process.cwd()) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

const remote = git(['remote', 'get-url', 'origin']);
const revision = git(['rev-parse', '--short', 'HEAD']);
// Keep the existing deployment history, so publishing never needs a force push.
const directory = mkdtempSync(join(tmpdir(), 'astro-pages-'));
git(['init', '--initial-branch=gh-pages', directory]);
git(['remote', 'add', 'origin', remote], directory);
const exists = git(['ls-remote', '--heads', 'origin', 'gh-pages'], directory);
if (exists) {
  git(['fetch', 'origin', 'gh-pages', '--depth=1'], directory);
  git(['reset', '--hard', 'FETCH_HEAD'], directory);
  git(['rm', '-r', '--ignore-unmatch', '.'], directory);
}
cpSync(new URL('../dist/', import.meta.url), directory, { recursive: true });
writeFileSync(join(directory, '.nojekyll'), '');
git(['add', '--all'], directory);
if (git(['status', '--porcelain'], directory)) {
  git(['-c', 'user.name=waaogg', '-c', 'user.email=waaogg@users.noreply.github.com',
    'commit', '-m', `Deploy site from ${revision}`], directory);
  git(['push', 'origin', 'HEAD:gh-pages'], directory);
}
console.log('Published gh-pages. GitHub Pages will update https://waaogg.github.io/');
console.log(`Deployment checkout: ${directory}`);
