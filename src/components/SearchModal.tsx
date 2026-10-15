import React, { useEffect, useState, useRef } from 'react';
import { Search as SearchIcon, X, FileText, ArrowRight } from 'lucide-react';

interface SearchResult {
  url: string;
  meta: {
    title?: string;
  };
  excerpt: string;
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleSearchBtnClick = () => setIsOpen(true);
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', handleSearchBtnClick);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (searchBtn) {
        searchBtn.removeEventListener('click', handleSearchBtnClick);
      }
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Execute Pagefind Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let isCancelled = false;
    const executeSearch = async () => {
      setLoading(true);
      try {
        if (typeof window !== 'undefined' && !(window as any).pagefind) {
          try {
            const pagefindUrl = '/pagefind/pagefind.js';
            const pagefindModule = await new Function('url', 'return import(url)')(pagefindUrl);
            (window as any).pagefind = pagefindModule;
          } catch (e) {
            console.warn('Pagefind index not found, fallback mode');
          }
        }

        // @ts-ignore
        if (window.pagefind) {
          // @ts-ignore
          const search = await window.pagefind.search(query);
          const loadedResults = await Promise.all(
            search.results.slice(0, 8).map((r: any) => r.data())
          );
          if (!isCancelled) {
            setResults(loadedResults);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timer = setTimeout(executeSearch, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/40 backdrop-blur-md transition-opacity duration-300"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all duration-300 animate-[float-gentle_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
          <SearchIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索博文、动态、项目或笔记..."
            className="w-full h-12 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 px-1.5 py-0.5 text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
          >
            ESC
          </button>
        </div>

        {/* Results / Status */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {loading && (
            <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              正在检索全站索引...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              未检索到与「{query}」相关的内容
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 px-4 text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>输入关键词进行全文毫秒级检索</span>
              <span>支持中英文分词</span>
            </div>
          )}

          {!loading &&
            results.map((item, index) => (
              <a
                key={index}
                href={item.url}
                onClick={() => setIsOpen(false)}
                className="group flex flex-col p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div className="flex items-center justify-between text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>{item.meta.title || item.url}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-zinc-400" />
                </div>
                {item.excerpt && (
                  <p
                    className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 [&>mark]:bg-amber-200/60 [&>mark]:text-zinc-900 dark:[&>mark]:bg-amber-500/30 dark:[&>mark]:text-amber-200"
                    dangerouslySetInnerHTML={{ __html: item.excerpt }}
                  />
                )}
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
