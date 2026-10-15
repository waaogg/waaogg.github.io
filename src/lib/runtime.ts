import { navigate } from 'astro:transitions/client';
import { setupVisuals } from './visuals';
import { setupLibrary } from './library';
import { setupCollectionFilters } from './collection-filters';

let teardown: (() => void) | undefined;
let returnFocus: HTMLElement | null = null;
let chord = '';
let chordTimer: ReturnType<typeof setTimeout>;
const safeGet = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const safeSet = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch {} };
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || safeGet('journal-motion') === 'off';

function applyPreferences() {
  const theme = safeGet('journal-theme') || 'system';
  document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches));
  document.documentElement.dataset.motion = safeGet('journal-motion') || 'on';
  document.querySelectorAll('[data-theme-toggle]').forEach(button => button.setAttribute('aria-label', '切换主题，当前：' + ({ light: '亮色', dark: '暗色', system: '跟随系统' }[theme] || '跟随系统')));
  document.querySelector('[data-motion-toggle]')?.setAttribute('aria-pressed', String(safeGet('journal-motion') === 'off'));
}
function unlock() { document.body.style.overflow = ''; }
function openDialog(dialog: HTMLDialogElement) {
  returnFocus = document.activeElement as HTMLElement;
  document.dispatchEvent(new Event('journal:close-search'));
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(item => item.close());
  dialog.showModal(); document.body.style.overflow = 'hidden';
}
function closeDialogs() {
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close());
  document.querySelectorAll('[data-menu-open]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  unlock();
}
function applyReading() {
  const body = document.getElementById('article-content');
  if (!body) return;
  const font = safeGet('journal-font') || 'sans';
  const size = Math.min(22, Math.max(15, Number(safeGet('journal-size') || '17')));
  body.classList.toggle('serif-reading', font === 'serif');
  body.style.setProperty('--reading-size', size + 'px');
  document.querySelectorAll('[data-font]').forEach(el => el.setAttribute('aria-pressed', String(el.getAttribute('data-font') === font)));
}
function setupPage() {
  teardown?.();
  applyPreferences(); applyReading();
  const controller = new AbortController();
  const { signal } = controller;
  setupVisuals({signal,openDialog});
  setupCollectionFilters(signal);
  const saveReading=setupLibrary(signal);
  // Footnotes are handled in place; keep the router from starting an anchor navigation.
  document.querySelectorAll<HTMLAnchorElement>('a[data-footnote-ref]').forEach(link => link.setAttribute('data-astro-reload',''));
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      unlock(); document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded', 'false');
      if (returnFocus?.isConnected) returnFocus.focus();
    }, { signal });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, { signal });
  });
  document.querySelectorAll<HTMLElement>('[data-site-age]').forEach(el => {
    const date = new Date(el.dataset.siteAge || '').valueOf();
    el.textContent = Number.isFinite(date) ? '已记录 ' + Math.max(0, Math.floor((Date.now() - date) / 86400000)) + ' 天' : '';
  });
  document.querySelectorAll<HTMLImageElement>('[data-avatar-fallback]').forEach(img => {
    img.addEventListener('error', () => { const fallback=document.createElement('span');fallback.className='friend-avatar';fallback.textContent=img.dataset.avatarFallback||'友';img.replaceWith(fallback); }, {signal});
    if(img.complete && img.naturalWidth===0) img.dispatchEvent(new Event('error'));
  });
  // Code blocks: language, visible copy action and optional long-block folding.
  document.querySelectorAll<HTMLPreElement>('#article-content pre').forEach(pre => {
    if (pre.querySelector('.code-toolbar')) return;
    const code = pre.querySelector('code');
    const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
    const language = document.createElement('span'); language.textContent = pre.dataset.language || code?.className.replace('language-', '') || 'CODE';
    toolbar.append(language);
    if ((code?.textContent || '').split('\n').length > 14) {
      const fold = document.createElement('button'); fold.type = 'button'; fold.textContent = '展开';
      pre.classList.add('code-collapsed'); fold.setAttribute('aria-expanded', 'false');
      fold.addEventListener('click', () => { const closed = pre.classList.toggle('code-collapsed'); fold.textContent = closed ? '展开' : '收起'; fold.setAttribute('aria-expanded', String(!closed)); }, { signal });
      toolbar.append(fold);
    }
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '复制'; copy.setAttribute('aria-label', '复制代码');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code?.textContent || ''); copy.textContent = '已复制 ✓'; }
      catch { copy.textContent = '复制失败，请手动选择'; }
    }, { signal });
    toolbar.append(copy); pre.prepend(toolbar);
  });
  document.querySelectorAll('#article-content table').forEach(table => {
    if (table.parentElement?.classList.contains('table-scroll')) return;
    const wrapper = document.createElement('div'); wrapper.className = 'table-scroll';
    wrapper.setAttribute('tabindex', '0'); wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', '可横向滚动的表格');
    table.before(wrapper); wrapper.append(table);
  });
  // Coordinate comparisons use viewport positions, independent of offset parents.
  const headings = Array.from(document.querySelectorAll<HTMLElement>('#article-content h2[id], #article-content h3[id]'));
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const current = [...headings].reverse().find(h => h.getBoundingClientRect().top <= 150) || headings[0];
      document.querySelectorAll<HTMLElement>('[data-toc-target]').forEach(link => link.toggleAttribute('data-active', link.dataset.tocTarget === current?.id));
      const article = document.getElementById('article-content');
      const progress = document.getElementById('reading-progress');
      if (article && progress) {
        const rect = article.getBoundingClientRect();
        const total = Math.max(1, article.offsetHeight - innerHeight + 140);
        progress.style.width = Math.min(100, Math.max(0, (140 - rect.top) / total * 100)) + '%';
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true, signal }); onScroll();
  let disposed=false;
  teardown = () => { if(disposed)return;disposed=true;saveReading(); controller.abort(); cancelAnimationFrame(frame); document.querySelector('.footnote-popover')?.remove(); };
}
document.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLElement>('button, a');
  if (!target) return;
  if (target.matches('[data-theme-toggle]')) {
    const values = ['system', 'light', 'dark'];
    safeSet('journal-theme', values[(values.indexOf(safeGet('journal-theme') || 'system') + 1) % 3]); applyPreferences();
  } else if (target.matches('[data-motion-toggle]')) {
    safeSet('journal-motion', safeGet('journal-motion') === 'off' ? 'on' : 'off'); applyPreferences();
  } else if (target.matches('[data-menu-open]')) {
    openDialog(document.getElementById('mobile-menu') as HTMLDialogElement); target.setAttribute('aria-expanded', 'true');
  } else if (target.matches('[data-menu-close], [data-lightbox-close]')) closeDialogs();
  else if (target.matches('[data-help-open]')) openDialog(document.getElementById('shortcut-dialog') as HTMLDialogElement);
  else if (target.matches('[data-font]')) { safeSet('journal-font', target.dataset.font || 'sans'); applyReading(); }
  else if (target.matches('[data-size]')) { safeSet('journal-size', String(Math.min(22, Math.max(15, Number(safeGet('journal-size') || 17) + Number(target.dataset.size))))); applyReading(); }
  else if (target.matches('a[data-footnote-ref]')) {
    const footnote = document.getElementById(decodeURIComponent((target as HTMLAnchorElement).hash.slice(1)));
    if (footnote) {
      event.preventDefault(); document.querySelector('.footnote-popover')?.remove();
      const pop = document.createElement('aside'); pop.className = 'footnote-popover'; pop.setAttribute('role', 'note');
      pop.textContent = footnote.textContent?.replace('↩', '').trim() || '';
      const rect = target.getBoundingClientRect(); pop.style.left = Math.max(16,Math.min(innerWidth - 366,rect.left)) + 'px';
      pop.style.top = Math.max(16, Math.min(innerHeight - 180, rect.bottom + 10)) + 'px'; document.body.append(pop);
    }
  }
  if (target.tagName === 'A' && target.closest('dialog')) closeDialogs();
});
document.addEventListener('pointerdown', event => {
  if (!(event.target as Element).closest('[data-footnote-ref], .footnote-popover')) document.querySelector('.footnote-popover')?.remove();
  document.querySelectorAll<HTMLDetailsElement>('.explore[open]').forEach(el => { if (!el.contains(event.target as Node)) el.open = false; });
});
document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (event.key === 'Escape') { closeDialogs(); document.querySelectorAll<HTMLDetailsElement>('.explore[open]').forEach(el => el.open = false); document.querySelector('.footnote-popover')?.remove(); return; }
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || target.closest('input,textarea,select,[contenteditable="true"]') || document.querySelector('dialog[open],[data-search-dialog]')) return;
  if (event.key === '?') { event.preventDefault(); openDialog(document.getElementById('shortcut-dialog') as HTMLDialogElement); return; }
  if (event.key === 'j' || event.key === 'k') { event.preventDefault(); scrollBy({ top: event.key === 'j' ? 260 : -260, behavior: reduceMotion() ? 'instant' : 'smooth' }); return; }
  if (chord === 'g') {
    clearTimeout(chordTimer); chord = '';
    const routes: Record<string,string> = { h: '/', p: '/posts/', m: '/memos/', n: '/now/', g: '/guestbook/' };
    if (routes[event.key]) { event.preventDefault(); void navigate(routes[event.key]); }
  } else if (event.key === 'g') { chord = 'g'; chordTimer = setTimeout(() => { chord = ''; }, 900); }
});
document.addEventListener('astro:before-swap', () => { teardown?.(); closeDialogs(); });
document.addEventListener('astro:after-swap', applyPreferences);
document.addEventListener('astro:page-load', setupPage);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPreferences);
