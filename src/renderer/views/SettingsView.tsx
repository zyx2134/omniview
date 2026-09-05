interface Props {
  onOpenExtensions: () => void;
}

export function SettingsView({ onOpenExtensions }: Props) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>设置</h2>

      <div className="settings-group">
        <div className="settings-group-title">通用</div>
        <div className="settings-row disabled">
          <div className="settings-row-left">
            <svg className="settings-row-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="2" y="2" width="14" height="14" rx="2"/>
              <path d="M6 2v4M12 2v4M2 8h14M6 16v-4M12 16v-4"/>
            </svg>
            <div>
              <div className="settings-row-label">主题</div>
              <div className="settings-row-desc">深色 / 浅色模式（即将推出）</div>
            </div>
          </div>
          <span className="settings-row-arrow">›</span>
        </div>
        <div className="settings-row disabled">
          <div className="settings-row-left">
            <svg className="settings-row-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="9" cy="9" r="7"/>
              <path d="M9 4v5l3 3"/>
            </svg>
            <div>
              <div className="settings-row-label">自动检查更新</div>
              <div className="settings-row-desc">启动时检查新版本（即将推出）</div>
            </div>
          </div>
          <span className="settings-row-arrow">›</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">扩展</div>
        <div className="settings-row" onClick={onOpenExtensions}>
          <div className="settings-row-left">
            <svg className="settings-row-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="1" y="1" width="7" height="7" rx="1.5"/><rect x="10" y="1" width="7" height="7" rx="1.5"/>
              <rect x="1" y="10" width="7" height="7" rx="1.5"/><rect x="10" y="10" width="7" height="7" rx="1.5"/>
            </svg>
            <div>
              <div className="settings-row-label">扩展管理</div>
              <div className="settings-row-desc">安装、卸载和管理扩展</div>
            </div>
          </div>
          <span className="settings-row-arrow">›</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">关于</div>
        <div className="settings-row disabled">
          <div className="settings-row-left">
            <svg className="settings-row-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="9" cy="9" r="7"/><path d="M9 7v4M9 5v.5"/>
            </svg>
            <div>
              <div className="settings-row-label">关于 Omniview</div>
              <div className="settings-row-desc">版本 0.1.0 · 开源许可证</div>
            </div>
          </div>
          <span className="settings-row-arrow">›</span>
        </div>
      </div>
    </div>
  );
}
