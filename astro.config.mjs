// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import site from './src/data/site.json' with { type: 'json' };
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import remarkAssets from './scripts/remark-assets.mjs';
import { satteri } from '@astrojs/markdown-satteri';
const env = loadEnv(process.env.NODE_ENV || 'production', fileURLToPath(new URL('.', import.meta.url)), 'PUBLIC_');

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || env.PUBLIC_SITE_URL || site.site,
  trailingSlash: 'always',
  integrations: [react()],
  markdown: { processor:satteri({mdastPlugins:[remarkAssets]}), shikiConfig: {
    themes: { light: 'github-light', dark: 'github-dark' },
    transformers: [{
      name: 'journal-code',
      pre(node) { node.properties['data-language'] = this.options.lang || 'text'; },
      line(node, line) {
        const ranges = (this.options.meta?.__raw || '').match(/\{([\d,\s-]+)\}/)?.[1];
        if (!ranges) return;
        if (ranges.split(',').some(range => { const [from, to = from] = range.trim().split('-').map(Number); return line >= from && line <= to; })) node.properties['data-highlighted'] = '';
      },
    }],
  } },
  vite: {
    plugins: [tailwindcss()],
  },
});
