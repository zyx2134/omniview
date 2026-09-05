import { useState } from 'react';
import { Extension } from '../types';

interface Props {
  extensions: Extension[];
  onInstall: () => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ExtensionsView({ extensions, onInstall, onSelect, onRemove }: Props) {
  const [search, setSearch] = useState('');
  const filtered = extensions.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.formats?.some(f => f.includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>扩展管理</h2>
        <input
          className="form-input"
          style={{ width: 160, padding: '4px 10px' }}
          placeholder="搜索扩展…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onInstall}>+ 安装扩展</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-title">{search ? '没有匹配的扩展' : '还没有安装扩展'}</div>
          <div className="empty-desc">
            {search ? '换个关键词试试' : '点击"安装扩展"添加新格式支持，或将 .dex 文件拖入窗口'}
          </div>
        </div>
      ) : (
        <div className="ext-list">
          {filtered.map(ext => (
            <div key={ext.id} className="ext-card" onClick={() => onSelect(ext.id)}>
              <div className="ext-card-icon">{ext.ui.icon || '⬡'}</div>
              <div className="ext-card-info">
                <div className="ext-card-name">{ext.name}</div>
                <div className="ext-card-desc">
                  v{ext.version} · {ext.type === 'feature' ? '功能扩展' : '格式扩展'}
                  {ext.formats?.length ? ` · ${ext.formats.map(f => '.' + f).join(', ')}` : ''}
                </div>
              </div>
              <div className="ext-card-actions" onClick={e => e.stopPropagation()}>
                <span className="tag tag-accent">{ext.type === 'feature' ? '功能' : '格式'}</span>
                <button className="btn btn-danger btn-sm" onClick={() => onRemove(ext.id)}>卸载</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div className="detail-section-title">内置处理器</div>
        <div className="ext-list" style={{ marginTop: 8 }}>
          {[
            { name: '图片查看器', formats: 'PNG, JPEG, GIF, BMP, WebP' },
            { name: '视频播放器', formats: 'MP4, WebM, AVI, MOV, MKV' },
            { name: '音频播放器', formats: 'MP3, WAV, FLAC, OGG, M4A' },
            { name: '文本编辑器', formats: 'TXT, MD, JSON, XML, 代码文件' },
            { name: 'PDF / 图表查看器', formats: 'PDF, SVG' },
          ].map(item => (
            <div key={item.name} className="ext-card" style={{ cursor: 'default', opacity: 0.65 }}>
              <div className="ext-card-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>◫</div>
              <div className="ext-card-info">
                <div className="ext-card-name">{item.name}</div>
                <div className="ext-card-desc">{item.formats}</div>
              </div>
              <span className="tag">内置</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
