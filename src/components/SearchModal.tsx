import { useEffect, useRef, useState } from 'react';
import { Search, ArrowUpRight, AlertCircle } from 'lucide-react';
import { navigate } from 'astro:transitions/client';

interface Result { url: string; meta: { title?: string; type?: string }; excerpt: string; }
interface Pagefind { search: (query: string) => Promise<{ results: { data: () => Promise<Result> }[] }>; }
let engine: Promise<Pagefind> | undefined;
function loadEngine(): Promise<Pagefind> {
  const url = '/pagefind/pagefind.js';
  engine ??= import(/* @vite-ignore */ url).catch(error => { engine = undefined; throw error; });
  return engine;
}
function Excerpt({ html }: { html: string }) {
  // Pagefind excerpts only need text and highlighting. Never inject arbitrary HTML.
  return <>{html.split(/(<mark>.*?<\/mark>)/g).map((part, i) => {
    const clean = part.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    return part.startsWith('<mark>') ? <mark key={i}>{clean}</mark> : <span key={i}>{clean}</span>;
  })}</>;
}
export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const show = () => { previousFocus.current = document.activeElement as HTMLElement; setOpen(true); };
    const click = (event: MouseEvent) => { if ((event.target as Element).closest('[data-search-open]')) show(); };
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); previousFocus.current = document.activeElement as HTMLElement; setOpen(value => !value); }
      if (event.key === 'Escape') setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('click', click); document.addEventListener('keydown', key);
    document.addEventListener('astro:before-preparation', close); document.addEventListener('journal:close-search', close);
    return () => {
      document.removeEventListener('click', click); document.removeEventListener('keydown', key);
      document.removeEventListener('astro:before-preparation', close); document.removeEventListener('journal:close-search', close);
    };
  }, []);
  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setLoading(false); setFailed(false); return; }
    document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close());
    document.body.style.overflow = 'hidden'; input.current?.focus();
    return () => { if (!document.querySelector('dialog[open]')) document.body.style.overflow = ''; previousFocus.current?.isConnected && previousFocus.current.focus(); };
  }, [open]);
  useEffect(() => {
    if (!open || !query.trim()) { setResults([]); setLoading(false); setFailed(false); return; }
    let cancelled = false; setLoading(true); setFailed(false);
    const timer = setTimeout(async () => {
      try {
        const index = await loadEngine();
        const result = await index.search(query.trim());
        const loaded = await Promise.all(result.results.slice(0, 15).map(item => item.data()));
        if (!cancelled) { setResults(loaded); setSelected(0); }
      } catch { if (!cancelled) { setFailed(true); setResults([]); } }
      finally { if (!cancelled) setLoading(false); }
    }, 180);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open, attempt]);
  useEffect(() => { panel.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [selected]);
  if (!open) return null;
  return <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
    <div className="dialog-panel" data-search-dialog role="dialog" aria-modal="true" aria-label="搜索全站内容" ref={panel}
      onKeyDown={e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(index => Math.min(results.length - 1, index + 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(index => Math.max(0, index - 1)); }
        if (e.key === 'Enter' && e.target === input.current && results[selected]) { e.preventDefault(); setOpen(false); void navigate(results[selected].url); }
        if (e.key === 'Tab') {
          const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>('a,button,input') || []);
          const first = focusable[0], last = focusable.at(-1);
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="search-input-row"><Search size={19} strokeWidth={1.5} /><input ref={input} aria-label="搜索关键词" placeholder="找一篇文章，或一个日常片段…" value={query} onChange={e => setQuery(e.target.value)} /><button type="button" onClick={() => setOpen(false)} aria-label="关闭搜索"><kbd>Esc</kbd></button></div>
      <div aria-live="polite" aria-atomic="true">
        {loading && <div className="search-status">正在翻阅内容…</div>}
        {!loading && failed && <div className="search-status"><AlertCircle size={22} style={{margin:'0 auto 12px'}} />搜索索引暂时无法加载。<br /><button className="button secondary" style={{marginTop:16}} onClick={() => setAttempt(value => value + 1)}>重新加载</button></div>}
        {!loading && !failed && !query && <div className="search-status">输入关键词，发现文章、作品和日常。<br /><small>也可以去 <a href="/posts/" onClick={() => setOpen(false)}>文章归档</a> 慢慢看看。</small></div>}
        {!loading && !failed && query && results.length === 0 && <div className="search-status">没有找到「{query}」。换个词试试？</div>}
      </div>
      {!loading && !failed && <div className="search-results">{results.map((item, index) => <a className="search-result" href={item.url} key={item.url} data-selected={selected === index} onMouseEnter={() => setSelected(index)} onClick={() => setOpen(false)}><span className="meta">{item.meta.type || '内容'} <ArrowUpRight size={10} /></span><strong>{item.meta.title || item.url}</strong><p><Excerpt html={item.excerpt} /></p></a>)}</div>}
      <div className="search-footer"><span>↑ ↓ 选择 · Enter 打开 · Esc 关闭</span><span>本地静态检索</span></div>
    </div>
  </div>;
}
