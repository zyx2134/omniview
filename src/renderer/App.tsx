import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Tab, AppState, FileRouteResult } from './types';
import { HomeView } from './views/HomeView';
import { SettingsView } from './views/SettingsView';
import { ExtensionsView } from './views/ExtensionsView';
import { ExtensionDetailView } from './views/ExtensionDetailView';
import { ViewerView } from './views/ViewerView';

let _nextTabId = 1;
const genTabId = () => String(_nextTabId++);

type Page = 'home' | 'settings' | 'extensions' | 'detail' | 'viewer';

export default function App() {
  const [state, setState] = useState<AppState>({
    page: 'home',
    tabs: [],
    recentFiles: [],
    extensions: [],
  });
  const [loading, setLoading] = useState(true);
  const [installResult, setInstallResult] = useState<{ success: boolean; name: string } | null>(null);
  const dragCounter = useRef(0);

  // Init
  useEffect(() => {
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; setLoading(false); }, 600);
    Promise.all([
      window.omniview.listExtensions(),
      window.omniview.listRecent(),
    ]).then(([exts, recent]) => {
      if (!timedOut) {
        setState(s => ({ ...s, extensions: exts, recentFiles: recent }));
        setLoading(false);
      }
    }).catch(() => { if (!timedOut) setLoading(false); });
    return () => clearTimeout(timer);
  }, []);

  // Events
  useEffect(() => {
    return window.omniview.onFileOpened(({ filePath, result }) => { openFile(filePath, result); });
  }, []);

  useEffect(() => {
    const u1 = window.omniview.onExtensionInstalled((ext) =>
      setState(s => ({ ...s, extensions: [...s.extensions, ext] }))
    );
    const u2 = window.omniview.onExtensionRemoved((id) =>
      setState(s => ({ ...s, extensions: s.extensions.filter(e => e.id !== id) }))
    );
    return () => { u1(); u2(); };
  }, []);

  // Install toast
  useEffect(() => {
    if (!installResult) return;
    const timer = setTimeout(() => setInstallResult(null), 2500);
    return () => clearTimeout(timer);
  }, [installResult]);

  const setStateSafe = useCallback((fn: (s: AppState) => AppState) => {
    setState(prev => fn(prev));
  }, []);

  const navigate = useCallback((page: Page, extra?: Partial<Pick<AppState, 'selectedId' | 'tabs' | 'activeTabId'>>) => {
    setState(s => ({ ...s, page, ...extra }));
  }, []);

  const goBack = useCallback(() => {
    if (state.page === 'viewer') {
      if (state.tabs.length > 1) closeTab(state.activeTabId!);
      else navigate('home');
    } else if (state.page === 'detail') {
      navigate('extensions');
    } else if (state.page === 'extensions' || state.page === 'settings') {
      navigate('home');
    }
  }, [state.page, state.tabs.length, state.activeTabId, navigate]);

  const activeTab = state.tabs.find(t => t.id === state.activeTabId);
  const currentExt = state.extensions.find(e => e.id === state.selectedId);

  const openFile = useCallback(async (filePath: string, existingResult?: FileRouteResult) => {
    const result = existingResult || await window.omniview.routeFile(filePath);
    if (!result.handled) return;
    const name = filePath.split(/\\|\//).pop() || filePath;
    const tab: Tab = { id: genTabId(), filePath, result, title: name };
    await window.omniview.addRecent(filePath);
    setStateSafe(s => {
      const filtered = s.tabs.filter(t => t.filePath !== filePath);
      return { ...s, tabs: [...filtered, tab], activeTabId: tab.id, page: 'viewer' };
    });
  }, []);

  const handleOpenFile = useCallback(async () => {
    const r = await window.omniview.openFile();
    if (r?.path) openFile(r.path);
  }, [openFile]);

  // ── Drag & Drop ───────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) dragCounter.current = 0;
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    for (const file of files) {
      const p = (file as any).path;
      if (!p) continue;
      if (p.toLowerCase().endsWith('.dex')) {
        const result = await window.omniview.installExtension(p);
        if (result.success) {
          setInstallResult({ success: true, name: result.extension.name });
        } else if (result.conflicts?.length) {
          alert('扩展冲突："' + result.conflicts.map((c: any) => c.value + ' 已由 "' + c.existingName + '" 注册').join('", "') + '"');
        }
      } else {
        openFile(p);
      }
    }
  }, [openFile]);

  const closeTab = useCallback((tabId: string) => {
    setStateSafe(s => {
      const idx = s.tabs.findIndex(t => t.id === tabId);
      const next = s.tabs.filter(t => t.id !== tabId);
      let activeId = s.activeTabId;
      if (activeId === tabId) activeId = next[Math.min(idx, next.length - 1)]?.id;
      return { ...s, tabs: next, activeTabId: activeId, page: next.length > 0 ? 'viewer' : 'home' };
    });
  }, []);

  const switchTab = useCallback((tabId: string) => setStateSafe(s => ({ ...s, activeTabId: tabId })), []);

  const handleInstallClick = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.dex';
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const result = await window.omniview.installExtension((file as any).path || file.name);
      if (result.success) {
        setInstallResult({ success: true, name: result.extension.name });
      } else if (result.conflicts?.length) {
        alert('扩展冲突："' + result.conflicts.map((c: any) => c.value + ' 已由 "' + c.existingName + '" 注册').join('", "') + '"');
      }
    };
    input.click();
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    if (!confirm('确定要卸载此扩展？')) return;
    await window.omniview.removeExtension(id);
  }, []);

  const openRecent = useCallback(async (filePath: string) => {
    await window.omniview.addRecent(filePath);
    openFile(filePath);
  }, [openFile]);

  const clearRecent = useCallback(async () => {
    await window.omniview.clearRecent();
    setState(s => ({ ...s, recentFiles: [] }));
  }, []);

  const isViewer = state.page === 'viewer';
  const isChrome = !isViewer;

  // Memoize computed values to avoid recalculation on every render
  const pageTitle = useMemo(() => {
    if (state.page === 'home') return '';
    if (state.page === 'settings') return '设置';
    if (state.page === 'extensions') return '扩展管理';
    if (state.page === 'detail' && currentExt) return currentExt.name;
    if (state.page === 'viewer' && activeTab) return activeTab.title;
    return '';
  }, [state.page, currentExt, activeTab]);

  const currentExtForTab = activeTab?.result?.extensionId
    ? state.extensions.find(e => e.id === activeTab.result!.extensionId)
    : undefined;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'o') { e.preventDefault(); handleOpenFile(); }
      else if (e.key === 'Escape') { if (state.page !== 'home') goBack(); }
      else if (e.ctrlKey && e.key === 'w') { e.preventDefault(); if (state.page === 'viewer') closeTab(state.activeTabId!); }
      else if (e.ctrlKey && e.key === 't') { e.preventDefault(); handleOpenFile(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.page, state.activeTabId, handleOpenFile, goBack, closeTab]);

  return (
    <div 
      className="app" 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Title bar */}
      <div className="titlebar">
        <div className="titlebar-brand">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.8"/>
            <circle cx="8" cy="8" r="2.5" fill="currentColor" opacity="0.8"/>
          </svg>
          <span className="titlebar-title">Omniview</span>
        </div>
        
        {/* Back button - only in non-home pages */}
        {!isChrome && (
          <button className="nav-btn" onClick={goBack} title="返回 (Esc)">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 6H3M5 3L3 6l2 3"/></svg>
            <span>返回</span>
          </button>
        )}
        
        {/* Page title */}
        {pageTitle && (
          <span className="nav-file-info">{pageTitle}</span>
        )}
        
        <div className="nav-spacer" />
        
        {/* Action buttons */}
        {state.page === 'settings' && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('extensions')} title="扩展管理">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
            扩展
          </button>
        )}
        {state.page === 'extensions' && (
          <button className="btn btn-primary btn-sm" onClick={handleInstallClick} title="安装扩展">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="1" x2="5" y2="9"/><line x1="1" y1="5" x2="9" y2="5"/></svg>
            安装
          </button>
        )}
        
        {/* Window controls */}
        <div className="titlebar-controls">
          <button onClick={() => window.omniview.minimizeWindow()} title="最小化">
            <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>
          </button>
          <button onClick={() => window.omniview.maximizeWindow()} title="最大化">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="0.5" y="0.5" width="9" height="9"/></svg>
          </button>
          <button className="close-btn" onClick={() => window.omniview.closeWindow()} title="关闭">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>
          </button>
        </div>
      </div>

      {/* Tabs bar - shown when viewing files */}
      {state.page === 'viewer' && state.tabs.length > 0 && (
        <div className="tabs-bar">
          {state.tabs.map(tab => (
            <div key={tab.id} className={`tab-item ${tab.id === state.activeTabId ? 'active' : ''}`} onClick={() => switchTab(tab.id)}>
              <span className="tab-name">{tab.title}</span>
              <button className="tab-close" onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>×</button>
            </div>
          ))}
          <button className="tab-add" onClick={handleOpenFile} title="新建标签页 (Ctrl+T)">+</button>
        </div>
      )}

      {/* Install toast */}
      {installResult && (
        <div className="install-toast">
          <span className="install-toast-icon">✓</span>
          <span>{installResult.success ? '扩展「' + installResult.name + '」已安装' : '安装失败'}</span>
        </div>
      )}

      {/* Main content */}
      <div className="app-body">
        <main className="main">
          {state.page === 'home' && (
            <div className="page"><HomeView onOpenFile={handleOpenFile} recentFiles={state.recentFiles} onOpenRecent={openRecent} loading={loading} /></div>
          )}
          {state.page === 'settings' && (
            <div className="page"><SettingsView onOpenExtensions={() => navigate('extensions')} /></div>
          )}
          {state.page === 'extensions' && (
            <div className="page"><ExtensionsView extensions={state.extensions} onInstall={handleInstallClick} onSelect={(id) => navigate('detail', { selectedId: id })} onRemove={handleRemove} /></div>
          )}
          {state.page === 'detail' && currentExt && (
            <div className="page"><ExtensionDetailView extension={currentExt} onUpdateConfig={(cfg) => window.omniview.updateExtensionConfig(currentExt.id, cfg)} onBack={goBack} /></div>
          )}
          {state.page === 'viewer' && activeTab && activeTab.result && (
            <div className="page" style={{ padding: 0 }}>
              <ViewerView 
                filePath={activeTab.filePath} 
                result={activeTab.result} 
                extension={currentExtForTab} 
                onBack={goBack} 
                onTitleChange={(title) => {
                  setState(s => ({ ...s, tabs: s.tabs.map(t => t.id === activeTab.id ? { ...t, title } : t) }));
                }} 
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
