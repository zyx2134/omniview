import { useState, useEffect } from 'react';

interface Props {
  onOpenExtensions: () => void;
}

export function SettingsView({ onOpenExtensions }: Props) {
  const [associations, setAssociations] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    // Check which extensions are registered
    const checks: Promise<[string, boolean]>[] = [
      ['.png', window.omniview.checkAssociation('.png')],
      ['.jpg', window.omniview.checkAssociation('.jpg')],
      ['.mp4', window.omniview.checkAssociation('.mp4')],
      ['.txt', window.omniview.checkAssociation('.txt')],
      ['.json', window.omniview.checkAssociation('.json')],
      ['.svg', window.omniview.checkAssociation('.svg')],
      ['.pdf', window.omniview.checkAssociation('.pdf')],
      ['.mp3', window.omniview.checkAssociation('.mp3')],
    ];
    Promise.all(checks).then(results => {
      const registeredExts = results.filter(([, v]) => v).map(([k]) => k);
      setAssociations(registeredExts);
      setRegistered(registeredExts.length > 0);
    }).catch(() => {});
  }, []);

  async function handleRegister() {
    setRegistering(true);
    const result = await window.omniview.registerAssociations();
    setRegistering(false);
    if (result.success) {
      setRegistered(true);
      setAssociations(['.png', '.jpg', '.mp4', '.txt', '.json', '.svg', '.pdf', '.mp3']);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>设置</h2>

      <div className="settings-group">
        <div className="settings-group-title">文件关联</div>
        <div className="settings-row" onClick={handleRegister} style={{ cursor: registered ? 'default' : 'pointer' }}>
          <div className="settings-row-left">
            <svg className="settings-row-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M14.5 2.5l1 1v12a1 1 0 01-1 1h-10a1 1 0 01-1-1v-12a1 1 0 011-1h7.5z"/>
              <path d="M12 2.5v4h4"/>
            </svg>
            <div>
              <div className="settings-row-label">
                注册文件关联
                {registered && <span style={{ color: '#107c10', marginLeft: 6, fontSize: 10 }}>✓ 已注册</span>}
              </div>
              <div className="settings-row-desc">
                {registered
                  ? `已关联 ${associations.length} 种格式，右键 → 打开方式即可使用`
                  : '注册后支持右键打开文件，关联图片/视频/音频/文本等格式'}
              </div>
            </div>
          </div>
          {registered
            ? <span style={{ color: '#107c10', fontSize: 11 }}>已注册</span>
            : registering
              ? <span style={{ color: '#00a8e8', fontSize: 10 }}>注册中...</span>
              : <span className="settings-row-arrow">›</span>
          }
        </div>
        {registered && associations.length > 0 && (
          <div style={{ padding: '4px 0 8px 32px', fontSize: 10, color: '#666', lineHeight: 1.6 }}>
            已关联: {associations.join('、')}
          </div>
        )}
      </div>

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
              <div className="settings-row-desc">版本 0.1.0 · MIT 许可证</div>
            </div>
          </div>
          <span className="settings-row-arrow">›</span>
        </div>
      </div>
    </div>
  );
}
