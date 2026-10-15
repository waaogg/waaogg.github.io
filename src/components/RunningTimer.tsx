import React, { useState, useEffect } from 'react';
import { siteConfig } from '../site.config';

interface TimeDifference {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function RunningTimer() {
  const [diff, setDiff] = useState<TimeDifference | null>(null);

  useEffect(() => {
    const startDate = new Date(siteConfig.siteStartDate || '2026-01-01T00:00:00Z').getTime();

    function updateTimer() {
      const now = Date.now();
      const elapsed = Math.max(0, now - startDate);

      const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
      const seconds = Math.floor((elapsed / 1000) % 60);

      setDiff({ days, hours, minutes, seconds });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!diff) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>计算运行时长中...</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 select-none shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>
        本站已平稳运行{' '}
        <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{diff.days}</strong> 天{' '}
        <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{diff.hours}</strong> 时{' '}
        <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{diff.minutes}</strong> 分{' '}
        <strong className="font-semibold text-zinc-900 dark:text-zinc-200">{diff.seconds}</strong> 秒
      </span>
    </div>
  );
}
