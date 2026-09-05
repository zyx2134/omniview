interface Props {
  onOpenFile: () => void;
  recentFiles: string[];
  onOpenRecent: (path: string) => void;
  loading?: boolean;
}

export function HomeView({ onOpenFile, recentFiles, onOpenRecent, loading }: Props) {
  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="5" fill="currentColor"/>
            <circle cx="16" cy="16" r="2" fill="#121212"/>
          </svg>
        </div>
        <div>
          <div className="home-title">Omniview</div>
          <div className="home-sub">万能文件查看器</div>
        </div>
        <div className="home-actions">
          <button className="btn btn-primary" onClick={onOpenFile}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 4h8M6 1v3M2.5 9.5h7a1 1 0 001-1v-5a1 1 0 00-1-1h-5l-1 1v5a1 1 0 001 1z"/></svg>
            打开文件
          </button>
        </div>
        <div className="home-drop">或将文件拖拽到此处</div>

        {loading && (
          <div className="loading-text">加载中...</div>
        )}

        {recentFiles.length > 0 && (
          <div className="recent-section">
            <div className="recent-title">最近打开</div>
            {recentFiles.slice(0, 8).map(f => (
              <div key={f} className="recent-item" onClick={() => onOpenRecent(f)} title={f}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1"/></svg>
                <span>{f.split(/\\|\//).pop()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
