import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const FALLBACK_QUOTES = [
  { hitokoto: '不忘初心，方得始终。', from: '华严经' },
  { hitokoto: '生活原本沉闷，但跑起来就会有风。', from: '网络' },
  { hitokoto: '极简不是缺乏，而是克制与纯粹。', from: '设计手记' },
  { hitokoto: '且将新火试新茶，诗酒趁年华。', from: '望江南·超然台作' },
  { hitokoto: '代码如诗，唯有简洁永恒。', from: '极客思考' },
  { hitokoto: '星光不问赶路人，时光不负有心人。', from: '励志随笔' },
  { hitokoto: '山高水长，江湖再见。', from: '侠客行' },
];

export default function Hitokoto() {
  const [quote, setQuote] = useState<{ hitokoto: string; from: string }>(FALLBACK_QUOTES[0]);
  const [loading, setLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  async function fetchQuote() {
    setLoading(true);
    setIsRotating(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch('https://v1.hitokoto.cn/?encode=json', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setQuote({
          hitokoto: data.hitokoto,
          from: data.from_who ? `${data.from_who} · ${data.from}` : data.from || '佚名',
        });
      } else {
        throw new Error('API response not ok');
      }
    } catch {
      // Pick next random quote from fallback list
      const randomIdx = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      setQuote(FALLBACK_QUOTES[randomIdx]);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRotating(false), 500);
    }
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div
      onClick={fetchQuote}
      title="点击刷新一言"
      className="group relative cursor-pointer flex items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all duration-300 shadow-2xs select-none"
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 sm:mt-0 group-hover:scale-110 transition-transform" />
        <div className={`text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'} truncate`}>
          <span className="font-serif italic mr-1">“</span>
          <span className="font-normal">{quote.hitokoto}</span>
          <span className="font-serif italic ml-1">”</span>
          {quote.from && (
            <span className="ml-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              — {quote.from}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="刷新一言"
        className="shrink-0 p-1 rounded-md text-zinc-400 group-hover:text-indigo-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
