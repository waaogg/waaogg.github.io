import React, { useState, useEffect } from 'react';
import { Type } from 'lucide-react';

export default function FontSwitcher() {
  const [font, setFont] = useState<'sans' | 'serif'>('sans');

  useEffect(() => {
    const saved = localStorage.getItem('preferred-font') as 'sans' | 'serif' | null;
    if (saved === 'serif' || saved === 'sans') {
      setFont(saved);
      applyFont(saved);
    }
  }, []);

  function applyFont(f: 'sans' | 'serif') {
    const article = document.getElementById('article-content');
    if (article) {
      if (f === 'serif') {
        article.classList.add('font-serif-reading');
      } else {
        article.classList.remove('font-serif-reading');
      }
    }
  }

  function toggleFont() {
    const next = font === 'sans' ? 'serif' : 'sans';
    setFont(next);
    localStorage.setItem('preferred-font', next);
    applyFont(next);
  }

  return (
    <button
      onClick={toggleFont}
      type="button"
      title={font === 'sans' ? '切换为人文衬线字体' : '切换为现代无衬线字体'}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
    >
      <Type className="w-3.5 h-3.5 text-indigo-500" />
      <span>{font === 'sans' ? '无衬线' : '思源宋体'}</span>
    </button>
  );
}
