# Omniview 扩展开发指南

本文档详细说明如何为 Omniview 创建扩展插件。

---

## 一、扩展是什么

Omniview 的扩展（Extension）是一个 `.dex` 文件，本质是一个 ZIP 压缩包。安装后，扩展会为特定文件格式注册自定义处理器，或在界面中添加新的功能面板。

**两种类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| **格式扩展（format）** | 为特定文件后缀注册处理器 | `.qmc0` → QQ音乐播放器 |
| **功能扩展（feature）** | 提供通用 UI 面板，不绑定特定格式 | 文件属性面板、EXIF 查看器 |

---

## 二、目录结构

一个扩展必须包含以下文件：

```
my-extension/
├── manifest.json      ← 必需：扩展描述文件（JSON）
├── panel.html         ← 必需：查看/编辑 UI（单个 HTML 文件）
└── [可选资源]         ← CSS、图片、字体等可额外包含
```

打包后的目录结构不变，只是外层加了 `.dex` 后缀：

```
my-extension.dex       ← 将 my-extension/ 整个目录压缩为 .dex 文件
```

### 命名规范

- 目录名和 ID 使用全小写 + 连字符，如 `qmc-audio-player`
- HTML 文件名同样规范，如 `qmc-player.html`
- manifest.json 中的 `id` 字段必须与目录名一致

---

## 三、manifest.json 规范

### 完整示例

```json
{
  "id": "my-extension",
  "name": "我的扩展",
  "version": "1.0.0",
  "description": "扩展功能描述，尽量简洁明了",
  "type": "format",
  "formats": ["pdf", "svg"],
  "mimeTypes": ["application/pdf", "image/svg+xml"],
  "author": "你的名字",
  "ui": {
    "icon": "📄",
    "label": "PDF/图表",
    "panel": "panel.html"
  },
  "apiVersion": "1",
  "hasSettings": false,
  "config": {},
  "permissions": ["file:read"]
}
```

### 字段详解

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✅ | 扩展唯一标识，全小写，用 `-` 连接，如 `my-awesome-ext` |
| `name` | ✅ | 扩展显示名称，支持中文 |
| `version` | ✅ | 语义化版本号，格式 `主版本.次版本.修订号`，如 `1.2.3` |
| `description` | ✅ | 功能描述，1-2 句话 |
| `type` | ✅ | `"format"` 或 `"feature"` |
| `formats` | format 必填 | 支持的后缀名（不含点），如 `["pdf", "svg"]` |
| `mimeTypes` | 可选 | MIME 类型列表，如 `["application/pdf"]` |
| `author` | 可选 | 作者名称 |
| `ui.icon` | ✅ | 图标 Emoji（推荐）或 Unicode 字符 |
| `ui.label` | ✅ | 标签栏显示的短名称，2-6 个字符 |
| `ui.panel` | ✅ | HTML 面板文件名（相对于扩展目录） |
| `apiVersion` | ✅ | 固定填 `"1"` |
| `hasSettings` | 可选 | 是否有可配置项，默认 `false` |
| `settingsSchema` | 可选 | 设置项定义（见下方） |
| `permissions` | ✅ | 需要的权限（见下方权限表） |
| `config` | 可选 | 已保存的用户配置，初始为空对象 `{}` |

### permissions 权限表

| 权限 | 说明 | 适用场景 |
|------|------|---------|
| `file:read` | 读取文件内容（文本或二进制） | 绝大多数扩展需要 |
| `file:write` | 写入/修改文件 | 编辑器类扩展需要 |

> ⚠️ 权限越多，扩展的敏感度越高。只申请你实际需要的权限。

### settingsSchema 格式

如果 `hasSettings: true`，可以定义设置项：

```json
"settingsSchema": {
  "fontSize": {
    "type": "number",
    "label": "字体大小",
    "description": "预览字体大小（像素）",
    "default": 14,
    "min": 10,
    "max": 28
  },
  "wordWrap": {
    "type": "boolean",
    "label": "自动换行",
    "description": "是否自动换行",
    "default": true
  },
  "theme": {
    "type": "select",
    "label": "主题",
    "description": "编辑器配色方案",
    "default": "dark",
    "options": ["dark", "light"]
  }
}
```

### settingsSchema 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `type` | ✅ | `"boolean"` / `"number"` / `"text"` / `"select"` |
| `label` | ✅ | 设置项显示标签 |
| `description` | 可选 | 设置项说明文字 |
| `default` | ✅ | 默认值 |
| `min` | number 时必填 | 最小值 |
| `max` | number 时必填 | 最大值 |
| `options` | select 时必填 | 可选值列表 |

---

## 四、HTML 面板规范

### 4.1 基本结构

面板是一个独立的 HTML 文件，在 iframe 中运行。**不能有外部依赖**（除非使用 CDN）。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self' https:;
             style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
             script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
             connect-src 'self' file: https:;">
  <title>我的面板</title>
  <style>
    /* 样式写在这里 */
  </style>
</head>
<body>
  <!-- UI 写在这里 -->
  <script>
    // 逻辑写在这里
  </script>
</body>
</html>
```

### 4.2 CSP 安全策略

CSP 是必须的，它控制面板可以加载哪些资源：

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self' https:;
           style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
           script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
           connect-src 'self' file: https:;">
```

**常用 CDN 地址：**

| 库 | CDN |
|---|-----|
| marked (Markdown) | `https://cdn.jsdelivr.net/npm/marked/marked.min.js` |
| highlight.js | `https://cdn.jsdelivr.net/npm/highlight.js@11/lib/index.min.js` |
| Three.js (3D) | `https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js` |
| Chart.js | `https://cdn.jsdelivr.net/npm/chart.js` |
| jsPDF | `https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js` |

> 💡 如果使用 CDN，必须在 CSP 的 `script-src` 和 `style-src` 中添加对应的域名。

### 4.3 获取文件路径

```javascript
const urlParams = new URLSearchParams(location.search);
const filePath = decodeURIComponent(urlParams.get('file') || '');
```

Omniview 在加载面板时会自动附加 `?file=文件路径` 参数。

### 4.4 调用主进程 API

通过 `window.parent.omniview` 访问主进程的 IPC 桥接：

```javascript
const api = window.parent.omniview;

// 读取文本文件
const textResult = await api.readFile(filePath);
if (textResult.success) {
  const content = textResult.content;
}

// 读取二进制文件（用于加密文件、图片等）
const bufResult = await api.readFileBuffer(filePath);
if (bufResult.success) {
  const buffer = bufResult.buffer; // ArrayBuffer
  const uint8 = new Uint8Array(buffer);
}

// 写入文件（需要 file:write 权限）
await api.writeFile(filePath, newContent);

// 路由文件（获取路由结果，可用于判断其他扩展是否能处理）
const route = await api.routeFile(filePath);

// 获取应用信息
const info = await api.getAppInfo();
// → { version: "0.1.0", name: "Omniview" }
```

### 4.5 通知父窗口

```javascript
// 发送消息给父窗口（如更新标签页标题）
window.parent.postMessage({
  type: 'omniview:title',
  title: '新标题'
}, window.location.origin);

// 监听来自父窗口的消息
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  if (e.data.type === 'some-event') {
    console.log('Received:', e.data);
  }
});
```

### 4.6 样式规范

Omniview 使用深色主题，建议遵循以下配色：

```css
:root {
  --bg-base: #121212;       /* 背景底色 */
  --bg-surface: #1e1e1e;    /* 卡片/面板背景 */
  --bg-elevated: #252525;   /* 悬浮层背景 */
  --bg-hover: #2f2f2f;      /* 悬停背景 */
  --border: #333333;        /* 边框 */
  --text-primary: #f0f0f0;  /* 主文本 */
  --text-secondary: #c8c8c8;/* 次要文本 */
  --text-muted: #888888;    /* 弱化文本 */
  --accent: #00a8e8;        /* 主题色 */
  --danger: #e81123;        /* 错误/危险 */
  --success: #107c10;       /* 成功 */
}
```

**注意事项：**
- 不要设置 `height: 100vh`，面板高度由父容器决定
- 使用 `flex` 布局，禁止内容溢出
- 禁止全局滚动，内容区独立滚动
- 避免使用亮色背景（如白色），会破坏整体视觉

---

## 五、完整示例：Markdown 查看器

### 目录结构

```
md-viewer/
├── manifest.json
└── md-viewer.html
```

### manifest.json

```json
{
  "id": "md-viewer",
  "name": "Markdown Viewer",
  "version": "1.0.0",
  "description": "Renders Markdown files with tables, code highlighting and formula preview",
  "type": "format",
  "formats": ["md", "markdown"],
  "mimeTypes": ["text/markdown"],
  "author": "Omniview",
  "ui": {
    "icon": "📝",
    "label": "Markdown",
    "panel": "md-viewer.html"
  },
  "apiVersion": "1",
  "hasSettings": true,
  "settingsSchema": {
    "fontSize": {
      "type": "number",
      "label": "Font Size",
      "description": "Preview font size in pixels",
      "default": 14,
      "min": 10,
      "max": 28
    },
    "lineHeight": {
      "type": "number",
      "label": "Line Height",
      "description": "Line height multiplier",
      "default": 1.7,
      "min": 1.2,
      "max": 2.5
    },
    "wordWrap": {
      "type": "boolean",
      "label": "Word Wrap",
      "description": "Enable automatic word wrapping",
      "default": true
    }
  },
  "permissions": ["file:read"]
}
```

### md-viewer.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self' https:;
             style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
             script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
             connect-src 'self' file: https:;">
  <title>Markdown</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #1e1e1e;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: "Segoe UI", sans-serif;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      background: #252526;
      border-bottom: 1px solid #333;
      height: 32px;
      flex-shrink: 0;
    }
    .bar .name {
      flex: 1;
      font-size: 11px;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .bar .stats { font-size: 10px; color: #666; }
    .content {
      flex: 1;
      overflow: auto;
      padding: 20px;
    }
    .content h1 { font-size: 22px; margin-bottom: 12px; color: #f0f0f0; }
    .content h2 { font-size: 18px; margin: 16px 0 8px; color: #e0e0e0; }
    .content p { margin-bottom: 10px; line-height: 1.7; color: #d4d4d4; }
    .content code {
      background: #2d2d2d;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Consolas", monospace;
      font-size: 12px;
      color: #ce9178;
    }
    .content pre {
      background: #2d2d2d;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 10px 0;
    }
    .content pre code { background: none; padding: 0; color: #d4d4d4; }
    .content blockquote {
      border-left: 3px solid #00a8e8;
      padding-left: 12px;
      color: #888;
      margin: 10px 0;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .content th {
      background: #2d2d2d;
      padding: 6px 12px;
      text-align: left;
      font-size: 11px;
      color: #ccc;
    }
    .content td {
      padding: 6px 12px;
      border-bottom: 1px solid #2a2a2a;
      font-size: 11px;
      color: #d4d4d4;
    }
    .err {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #e81123;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="bar">
    <span class="name" id="nm"></span>
    <span class="stats" id="st"></span>
  </div>
  <div class="content" id="content"></div>
  <div class="err" id="err" style="display:none;"></div>

  <!-- CDN: marked 用于 Markdown 解析 -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <script>
    (function() {
      // 获取文件路径
      const fp = decodeURIComponent(new URLSearchParams(location.search).get('file') || '');
      const name = fp.split(/\\|\//).pop() || 'markdown';
      document.getElementById('nm').textContent = name;
      document.title = name + ' - Markdown';

      // 加载并渲染
      async function load() {
        try {
          const result = await window.parent.omniview.readFile(fp);
          if (!result.success) throw new Error(result.error);
          
          const raw = result.content;
          // 使用 marked 将 Markdown 转为 HTML
          const html = marked.parse(raw);
          document.getElementById('content').innerHTML = html;
          document.getElementById('st').textContent = 
            raw.length + ' chars, ' + raw.split('\n').length + ' lines';
        } catch (e) {
          document.getElementById('err').style.display = 'flex';
          document.getElementById('err').textContent = 'Error: ' + e.message;
        }
      }
      load();
    })();
  </script>
</body>
</html>
```

---

## 六、完整示例：QMC 音乐解密播放器

QQ 音乐使用 XOR 异或加密保护音频文件。以下示例演示如何读取二进制数据并进行解密：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; media-src 'self' blob:;
             style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';
             connect-src 'self' file:;">
  <title>QQ Music</title>
  <style>
    body { background: #0d0d0d; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .wrap { text-align: center; color: #fff; }
    .disc { width: 120px; height: 120px; border-radius: 50%; background: #1a1a2e; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .disc.spin { animation: spin 3s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .prog { width: 300px; height: 4px; background: #333; border-radius: 2px; margin: 10px auto; cursor: pointer; }
    .prog-fill { height: 100%; background: #0078d4; border-radius: 2px; width: 0; }
    button { padding: 8px 20px; margin: 0 8px; border: none; border-radius: 4px; cursor: pointer; background: #0078d4; color: #fff; }
  </style>
</head>
<body>
  <div class="wrap" id="wrap">
    <div class="disc" id="disc">🎵</div>
    <div id="title"></div>
    <div class="prog" id="prog"><div class="prog-fill" id="pf"></div></div>
    <div id="time">0:00 / 0:00</div>
    <button id="play">播放</button>
  </div>
  <audio id="audio"></audio>

  <script>
    const fp = decodeURIComponent(new URLSearchParams(location.search).get('file') || '');
    document.getElementById('title').textContent = fp.split(/\\|\//).pop();

    // XOR 解密函数
    function xorDecrypt(data, key) {
      const out = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        out[i] = data[i] ^ key;
      }
      return out;
    }

    // 加载并解密
    async function load() {
      try {
        const result = await window.parent.omniview.readFileBuffer(fp);
        if (!result.success) throw new Error(result.error);
        
        const buf = new Uint8Array(result.buffer);
        
        // QMC0 使用固定密钥 0x61 进行异或加密
        // 跳过 12 字节的头部元数据
        const headerSize = 12;
        const decrypted = xorDecrypt(buf.slice(headerSize), 0x61);
        
        // 创建 Blob URL 并播放
        const blob = new Blob([decrypted], { type: 'audio/flac' });
        const audio = document.getElementById('audio');
        audio.src = URL.createObjectURL(blob);
        
        audio.onloadedmetadata = () => {
          document.getElementById('time').textContent = 
            fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
        };
        audio.ontimeupdate = () => {
          const pct = (audio.currentTime / audio.duration) * 100;
          document.getElementById('pf').style.width = pct + '%';
          document.getElementById('time').textContent = 
            fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
        };
        
        document.getElementById('play').onclick = () => {
          if (audio.paused) {
            audio.play();
            document.getElementById('disc').classList.add('spin');
            document.getElementById('play').textContent = '暂停';
          } else {
            audio.pause();
            document.getElementById('disc').classList.remove('spin');
            document.getElementById('play').textContent = '播放';
          }
        };
      } catch (e) {
        document.getElementById('wrap').innerHTML = '<div style="color:#e81123;padding:40px;">' + e.message + '</div>';
      }
    }

    function fmt(s) {
      if (!s || !isFinite(s)) return '0:00';
      return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
    }

    load();
  </script>
</body>
</html>
```

---

## 七、冲突检测

扩展的 `formats` 不能与已安装的扩展重复。如果冲突，安装会失败并返回详细信息：

```json
{
  "success": false,
  "error": "扩展冲突",
  "conflicts": [
    {
      "type": "format",
      "value": "pdf",
      "existingExtensionId": "other-pdf-ext",
      "existingName": "其他 PDF 扩展"
    }
  ]
}
```

前端收到冲突时应该提示用户：

```javascript
const result = await window.omniview.installExtension(path);
if (!result.success && result.conflicts?.length) {
  const msgs = result.conflicts.map(c => 
    `"${c.value}" 已由 "${c.existingName}" 注册`
  );
  alert('扩展冲突：' + msgs.join('\n'));
}
```

---

## 八、最佳实践

1. **单文件 HTML**：所有 CSS 和 JS 内联，不要引用本地外部文件
2. **CDN 谨慎使用**：仅在必要时使用 CDN，并确保在 CSP 中声明
3. **完善的错误处理**：始终检查 `result.success`，给用户清晰的错误提示
4. **标题同步**：通过 `postMessage` 通知父窗口更新标签页标题
5. **性能考虑**：大文件分批处理，避免阻塞 UI 线程
6. **命名规范**：扩展 ID 用全小写 + 连字符，如 `my-awesome-extension`
7. **二进制文件**：使用 `readFileBuffer` 而不是 `readFile` 读取二进制数据
8. **内存管理**：使用 `URL.revokeObjectURL()` 释放 Blob URL
9. **响应式布局**：适应不同窗口大小，不要硬编码宽高
10. **中文优先**：UI 文案使用中文，保持一致性

---

## 九、构建与打包

```bash
# 构建主项目（必须首先执行）
cd omniview
npm run build

# 打包单个扩展为 .dex（PowerShell）
Compress-Archive -Path "extensions/my-extension\*" -DestinationPath "my-extension.dex" -Force

# 打包单个扩展为 .dex（macOS/Linux）
cd extensions/my-extension && zip -r ../my-extension.dex .
```

---

## 十、API 完整参考

### window.parent.omniview（预加载桥接 API）

#### 文件操作

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `readFile(path)` | 文件路径字符串 | `{ success, content?, error? }` | 读取文本文件内容 |
| `readFileBuffer(path)` | 文件路径字符串 | `{ success, buffer?, error? }` | 读取二进制数据（返回 ArrayBuffer） |
| `writeFile(path, content)` | 路径 + 内容 | `{ success, error? }` | 写入文本文件（需 file:write 权限） |
| `routeFile(path)` | 文件路径字符串 | `{ handled, type, handler, panel, extensionName }` | 获取文件路由结果 |
| `openFile()` | — | `{ path, recent } \| null` | 弹出文件选择对话框 |

#### 扩展管理

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `installExtension(path)` | .dex 文件路径 | `{ success, extension?, error?, conflicts? }` | 安装扩展 |
| `removeExtension(id)` | 扩展 ID | `{ success, error? }` | 卸载扩展 |
| `listExtensions()` | — | `Extension[]` | 列出所有已安装扩展 |
| `updateExtensionConfig(id, config)` | ID + 配置对象 | `{ success }` | 更新扩展配置 |

#### 最近文件

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `listRecent()` | — | `string[]` | 获取最近打开的文件列表 |
| `addRecent(path)` | 文件路径 | `string[]` | 添加到最近列表 |
| `clearRecent()` | — | `string[]` | 清空最近列表 |

#### 事件监听

| 方法 | 回调签名 | 说明 |
|------|---------|------|
| `onExtensionInstalled(cb)` | `(ext: Extension) => void` | 扩展安装成功时触发 |
| `onExtensionRemoved(cb)` | `(id: string) => void` | 扩展被移除时触发 |
| `onFileOpened(cb)` | `({ filePath, result }) => void` | 文件打开时触发 |

> 所有事件监听方法返回取消函数，调用后可移除监听：
> ```javascript
> const dispose = window.omniview.onExtensionInstalled(cb);
> dispose(); // 移除监听
> ```

---

## 十一、已提供的扩展模板

在 `extensions/` 目录下有 **20 个开箱即用的扩展模板**，可直接学习参考：

| 扩展 ID | 格式 | 关键技术点 |
|---------|------|-----------|
| `json-formatter` | `.json` | DOM 操作、语法高亮 |
| `md-viewer` | `.md` | marked CDN、HTML 渲染 |
| `yaml-viewer` | `.yaml/.yml` | 正则解析、语法着色 |
| `xml-viewer` | `.xml` | DOMParser 验证 |
| `csv-viewer` | `.csv/.tsv` | 可排序表格、搜索 |
| `svg-viewer` | `.svg` | Blob URL、缩放平移 |
| `hex-viewer` | `.bin/.exe/.dll` | 二进制处理、十六进制转换 |
| `base64-tool` | `.b64` | btoa/atob 编解码 |
| `qmc-audio-player` | `.qmc0/.qmcflac` | XOR 解密、Blob URL 播放 |
| `image-exif` | `.jpg/.jpeg/.heic` | DataView 读取二进制头 |
| `log-viewer` | `.log` | 正则过滤、级别着色 |
| `sql-viewer` | `.sql` | SQL 关键字高亮 |
| `env-viewer` | `.env` | 键值对解析、敏感值遮蔽 |
| `pdf-chart` | `.pdf` | iframe 嵌入 PDF |
| `media-duration-info` | 多种媒体 | Audio API 获取时长 |
| `3d-model-viewer` | `.glb/.gltf/.obj` | Three.js CDN |
| `code-syntax-highlighter` | 多种代码 | highlight.js CDN |
| `file-properties-panel` | 任意文件 | fs.stat 读取属性 |
| `image-info-panel` | 图片 | ImageData 分析 |
| `heic-image-handler` | `.heic/.heif` | 格式转换（占位） |

每个模板都是完整可运行的代码，建议从最简单的 `json-formatter` 或 `md-viewer` 开始学习。
