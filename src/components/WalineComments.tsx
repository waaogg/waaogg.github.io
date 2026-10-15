import React, { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/style';
import { siteConfig } from '../site.config';

interface WalineProps {
  serverURL?: string;
  path?: string;
}

export default function WalineComments({
  serverURL = siteConfig.waline.serverURL,
  path,
}: WalineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isConfigured = Boolean(serverURL && !serverURL.includes('example.com'));

  useEffect(() => {
    if (!containerRef.current || !isConfigured) return;

    let walineInstance: any = null;

    try {
      walineInstance = init({
        el: containerRef.current,
        serverURL,
        path: path || window.location.pathname,
        lang: 'zh-CN',
        dark: 'html.dark',
        reaction: true,
        meta: ['nick', 'mail', 'link'],
        requiredMeta: ['nick'],
        pageSize: 10,
      });
    } catch (err) {
      console.warn('Waline client failed to connect to backend server, graceful fallback mode active:', err);
    }

    return () => {
      if (walineInstance && typeof walineInstance.destroy === 'function') {
        walineInstance.destroy();
      }
    };
  }, [serverURL, path, isConfigured]);

  return (
    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          评论与互动
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          (支持匿名留言 · Markdown · 邮件通知)
        </span>
      </div>
      {isConfigured ? (
        <div ref={containerRef} className="waline-custom-container min-h-[160px]" />
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30">
          评论系统已就绪。在 <code className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/80 font-mono text-zinc-600 dark:text-zinc-300">src/site.config.ts</code> 中配置您的 Waline 服务端地址后即可启用在线评论与互动。
        </div>
      )}
    </div>
  );
}
