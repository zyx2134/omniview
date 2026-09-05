import { useState } from 'react';
import { Extension } from '../types';

interface Props {
  extension: Extension;
  onUpdateConfig: (cfg: Record<string, unknown>) => Promise<any>;
  onBack: () => void;
}

export function ExtensionDetailView({ extension, onUpdateConfig, onBack }: Props) {
  const [config, setConfig] = useState<Record<string, unknown>>(extension.config || {});
  const [saving, setSaving] = useState(false);

  const hasSettings = extension.hasSettings && Object.keys(extension.settingsSchema || {}).length > 0;

  const handleSave = async () => {
    setSaving(true);
    await onUpdateConfig(config);
    setSaving(false);
  };

  const handleToggle = (key: string, current: unknown) => {
    setConfig(prev => ({ ...prev, [key]: !current }));
  };

  return (
    <div>
      {/* Header */}
      <div className="detail-header">
        <div className="detail-icon">{extension.ui.icon || '⬡'}</div>
        <div className="detail-info">
          <div className="detail-name">{extension.name}</div>
          <div className="detail-meta">
            <span>v{extension.version}</span>
            <span>·</span>
            <span>{extension.type === 'feature' ? '功能扩展' : '格式扩展'}</span>
            <span>·</span>
            <span>安装于 {new Date(extension.installedAt).toLocaleDateString('zh-CN')}</span>
          </div>
          {extension.description && <div className="detail-desc">{extension.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <span className="tag tag-accent">{extension.type === 'feature' ? '功能' : '格式'}</span>
        </div>
      </div>

      {/* Formats */}
      {extension.formats && extension.formats.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="detail-section-title">支持格式</div>
          <div className="detail-formats">
            {extension.formats.map(f => (
              <span key={f} className="format-tag">.{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {hasSettings && (
        <div>
          <div className="detail-section-title">设置</div>
          <div className="card" style={{ marginTop: 8 }}>
            {Object.entries(extension.settingsSchema!).map(([key, schema]) => {
              const s = schema as any;
              const val = config[key] ?? s.default;
              return (
                <div key={key} className="setting-row">
                  <div>
                    <div className="setting-label">{s.label || key}</div>
                    {s.description && <div className="setting-desc">{s.description}</div>}
                  </div>
                  <div className="setting-control">
                    {s.type === 'boolean' ? (
                      <div className={`toggle ${val ? 'on' : ''}`} onClick={() => handleToggle(key, val)} />
                    ) : s.type === 'select' ? (
                      <select
                        value={val ?? s.default ?? ''}
                        onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                      >
                        {(s.options as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={s.type === 'number' ? 'number' : 'text'}
                        value={val ?? s.default ?? ''}
                        onChange={e => setConfig(p => ({ ...p, [key]: s.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasSettings && (
        <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)' }}>
          此扩展没有可配置的选项。
        </div>
      )}

      {/* Remove button */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => { if (confirm('确定要卸载此扩展？')) window.omniview.removeExtension(extension.id); }}
        >
          卸载扩展
        </button>
      </div>
    </div>
  );
}
