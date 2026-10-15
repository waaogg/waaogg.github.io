import React, { useState, useEffect } from 'react';
import { Command, X } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['?'], description: '呼出 / 关闭快捷键帮助面板' },
  { keys: ['⌘', 'K'], description: '呼出全站离线全文搜索' },
  { keys: ['g', 'h'], description: '返回首页 (Go Home)' },
  { keys: ['g', 'p'], description: '前往文章沉淀 (/posts)' },
  { keys: ['g', 'm'], description: '前往微动态 (/memos)' },
  { keys: ['g', 'g'], description: '前往留言板 (/guestbook)' },
  { keys: ['g', 'n'], description: '前往近况看板 (/now)' },
  { keys: ['g', 'c'], description: '前往幕后账本 (/colophon)' },
  { keys: ['j'], description: '向下平滑滚动 (Scroll Down)' },
  { keys: ['k'], description: '向上平滑滚动 (Scroll Up)' },
  { keys: ['Esc'], description: '关闭弹窗 / 浮层' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    let keyTimeout: any = null;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // '?' toggle modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // 'Esc' close modal
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Smooth scroll 'j' / 'k'
      if (e.key === 'j') {
        window.scrollBy({ top: 300, behavior: 'smooth' });
        return;
      }
      if (e.key === 'k') {
        window.scrollBy({ top: -300, behavior: 'smooth' });
        return;
      }

      // Two-key chord navigation: 'g' then X
      if (e.key === 'g' && !lastKey) {
        setLastKey('g');
        clearTimeout(keyTimeout);
        keyTimeout = setTimeout(() => setLastKey(null), 1000);
        return;
      }

      if (lastKey === 'g') {
        setLastKey(null);
        clearTimeout(keyTimeout);

        switch (e.key) {
          case 'h':
            window.location.href = '/';
            break;
          case 'p':
            window.location.href = '/posts';
            break;
          case 'm':
            window.location.href = '/memos';
            break;
          case 'g':
            window.location.href = '/guestbook';
            break;
          case 'n':
            window.location.href = '/now';
            break;
          case 'c':
            window.location.href = '/colophon';
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimeout);
    };
  }, [lastKey]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-2xl p-6 space-y-4 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              全键盘极客导航快捷键
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="关闭"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <span className="text-zinc-600 dark:text-zinc-400">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
          在任意页面按下 <kbd className="px-1 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/80 font-mono">?</kbd> 即可随时呼出本提示
        </div>
      </div>
    </div>
  );
}
