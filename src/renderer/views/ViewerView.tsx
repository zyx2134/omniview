import { useState, useEffect, useRef } from 'react';
import { Extension, FileRouteResult } from '../types';

interface Props {
  filePath: string;
  result: FileRouteResult;
  extension?: Extension;
  onBack: () => void;
  onTitleChange?: (title: string) => void;
}

function getHandlerUrl(handler: string, filePath: string): string {
  const base = new URL(window.location.href);
  base.pathname = base.pathname.replace(/[^/]+$/, '') + `handlers/${handler}.html`;
  base.search = `?file=${encodeURIComponent(filePath)}`;
  return base.toString();
}

function getPanelUrl(panelPath: string, panelFile: string, filePath: string): string {
  const base = panelPath.replace(/\\/g, '/');
  const sep = base.endsWith('/') ? '' : '/';
  const url = new URL(`${base}${sep}${panelFile}?file=${encodeURIComponent(filePath)}`);
  return url.toString();
}

export function ViewerView({ filePath, result, extension, onBack, onTitleChange }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshIframe = () => {
    // Find iframe in DOM (ref may be null during React re-render after key change)
    const el = document.querySelector('iframe.viewer-frame') as HTMLIFrameElement | null;
    if (!el) return;
    // Toggle src to force reload
    const url = el.src;
    el.src = '';
    setTimeout(() => { el.src = url; }, 50);
  };
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    let url = '';
    if (result.type === 'extension' && extension?.ui?.panel && result.panelPath) {
      const panelFile = extension.ui.panel.endsWith('.html')
        ? extension.ui.panel
        : `${extension.ui.panel}.html`;
      url = getPanelUrl(result.panelPath, panelFile, filePath);
    } else if (result.type === 'built-in' && result.handler) {
      url = getHandlerUrl(result.handler, filePath);
    }
    if (iframeRef.current && url) {
      iframeRef.current.src = url;
    } else if (iframeRef.current) {
      // No handler found — reset src to avoid stale content
      iframeRef.current.src = '';
    }
  }, [result, extension, filePath]);

  useEffect(() => {
    // Notify parent of iframe title change
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data && e.data.type === 'omniview:title') {
        onTitleChange?.(e.data.title);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onTitleChange]);

  const fileName = filePath.split(/\\|\//).pop() || filePath;
  const ext = filePath.split('.').pop()?.toUpperCase() || '';

  return (
    <div className="viewer">
      {/* Viewer toolbar */}
      <div className="viewer-toolbar">
        <button className="viewer-btn" onClick={onBack} title="返回上一级 (Esc)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 6H3M5 3L3 6l2 3"/></svg>
          <span>返回</span>
        </button>
        <div className="viewer-sep" />
        <div className="viewer-filename">
          <span className="viewer-filename-name">{fileName}</span>
          <span className="viewer-filename-ext">{ext}</span>
        </div>
        {result.extensionName && (
          <>
            <div className="viewer-sep" />
            <span className="viewer-ext-badge">{result.extensionName}</span>
          </>
        )}
        <div className="viewer-spacer" />
        <button className="viewer-btn" onClick={refreshIframe} title="刷新">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M10 6A4 4 0 1 1 6 2" strokeLinecap="round"/><path d="M10 2v4H6"/></svg>
          <span>刷新</span>
        </button>
      </div>
      {/* Iframe */}
      <iframe
        ref={iframeRef}
        className="viewer-frame"
        title="文件查看"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={() => setLoaded(true)}
      />
      {/* Loading overlay */}
      {!loaded && (
        <div className="viewer-loading">
          <div className="viewer-spinner" />
          <span>加载中...</span>
        </div>
      )}
    </div>
  );
}
