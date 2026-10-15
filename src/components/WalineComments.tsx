import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../site.config';
import '@waline/client/style';
export default function WalineComments({ path }: { path: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    let instance: { destroy: () => void } | null | undefined;
    setFailed(false);
    void import('@waline/client').then(({ init }) => {
      if (disposed || !container.current) return;
      instance = init({ el: container.current, serverURL: siteConfig.waline.serverURL, path, lang:'zh-CN', dark:'html.dark', meta:['nick','mail','link'], requiredMeta:['nick'], pageSize:10 });
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; instance?.destroy(); };
  }, [path, attempt]);
  return <>{failed && <div className="comment-unavailable" role="status">评论组件暂时无法加载。<button type="button" onClick={() => setAttempt(n => n + 1)}>重试</button></div>}<div ref={container} /></>;
}
