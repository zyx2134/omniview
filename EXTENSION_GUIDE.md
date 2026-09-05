# Omniview 扩展开发指南

## 一、扩展是什么

Omniview 的扩展（Extension）是一个 `.dex` 文件，本质是一个 ZIP 压缩包，用于为特定文件格式提供自定义查看或编辑能力。

**两种类型：**
- **格式扩展（format）**：为特定文件后缀注册处理器（如 `.pdf`、`.svg`、`.qmc0`）
- **功能扩展（feature）**：提供通用 UI 面板（如信息面板、工具）

---

## 二、目录结构

```
my-extension/
├── manifest.json      ← 必需：扩展描述文件
├── my-panel.html      ← 必需：查看/编辑 UI（HTML 单文件）
└── [可选资源]         ← CSS、图片等可额外包含
```

打包后：
```
my-extension.dex       ← 将 my-extension/ 整个目录压缩为 .dex 文件
```

---

## 三、manifest.json 规范

```json
{
  "id": "my-extension",
  "name": "我的扩展",
  "version": "1.0.0",
  "description": "扩展功能描述",
  "type": "format",
  "formats": ["pdf", "svg"],
  "mimeTypes": ["application/pdf", "image/svg+xml"],
  "author": "你的名字",
  "ui": {
    "icon": "📄",
    "label": "PDF/图表",
    "panel": "my-panel.html"
  },
  "apiVersion": "1",
  "hasSettings": false,
  "config": {},
  "permissions": ["file:read"]
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | ✅ | 扩展唯一标识，全小写，用 `-` 连接 |
| `name` | ✅ | 扩展显示名称（支持中文） |
| `version` | ✅ | 语义化版本号，如 `1.0.0` |
| `description` | ✅ | 功能描述 |
| `type` | ✅ | `"format"` 或 `"feature"` |
| `formats` | format 必填 | 支持的后缀名（不含点），如 `["pdf", "svg"]` |
| `mimeTypes` | 可选 | MIME 类型列表 |
| `ui.icon` | ✅ | 图标 Emoji（推荐）或 Unicode 字符 |
| `ui.label` | ✅ | 在标签栏显示的短名称 |
| `ui.panel` | ✅ | HTML 面板文件名 |
| `apiVersion` | ✅ | 固定填 `"1"` |
| `hasSettings` | 可选 | 是否有可配置项，默认 `false` |
| `settingsSchema` | 可选 | 设置项定义（见下方） |
| `permissions` | ✅ | 需要的权限 |
| `config` | 可选 | 已保存的用户配置 |

### permissions 权限

| 权限 | 说明 |
|------|------|
| `file:read` | 读取文件内容（文本/二进制） |
| `file:write` | 写入/修改文件 |

### settingsSchema 格式

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
    "description": "编辑器主题",
    "default": "dark",
    "options": ["dark", "light"]
  }
}
```

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
    /* 你的样式 */
  </style>
</head>
<body>
  <!-- 你的 UI -->
  <script>
    // 你的逻辑
  </script>
</body>
</html>
```

### 4.2 CSP 要求

必须包含 CSP meta 标签。根据需要使用 CDN（如 marked、highlight.js）：

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self' https:;
           style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
           script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
           connect-src 'self' file: https:;">
```

### 4.3 获取文件路径

```javascript
const urlParams = new URLSearchParams(location.search);
const filePath = decodeURIComponent(urlParams.get('file') || '');
```

### 4.4 调用主进程 API

通过 `window.parent.omniview` 访问主进程的 IPC 桥接：

```javascript
const api = window.parent.omniview;

// 读取文本文件
const textResult = await api.readFile(filePath);
if (textResult.success) {
  const content = textResult.content;
}

// 读取二进制文件（extension 专用，需要 readFileBuffer）
const bufResult = await api.readFileBuffer(filePath);
if (bufResult.success) {
  const buffer = bufResult.buffer; // ArrayBuffer
}

// 写入文件（需要 file:write 权限）
await api.writeFile(filePath, newContent);

// 路由文件（获取路由结果）
const route = await api.routeFile(filePath);

// 获取应用信息
const info = await api.getAppInfo();
```

### 4.5 通知父窗口

```javascript
// 发送消息给父窗口
window.parent.postMessage({
  type: 'omniview:title',
  title: '新标题'
}, window.location.origin);

// 监听消息
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  if (e.data.type === 'some-event') {
    // 处理
  }
});
```

### 4.6 样式规范

- 使用深色主题，背景色 `#1e1e1e` ~ `#252526`
- 文字颜色 `#d4d4d4`（主文本）、`#888888`（次要文本）
- 边框颜色 `#333333`
- 主题色 `#00a8e8`（accent）
- 不要设置 `height: 100vh`，使用 `flex` 布局自适应
- 禁止滚动溢出：`overflow: hidden` on body，内容区独立滚动

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
  "name": "Markdown 查看器",
  "version": "1.0.0",
  "description": "渲染 Markdown 文件，支持表格、代码高亮和公式预览",
  "type": "format",
  "formats": ["md", "markdown"],
  "mimeTypes": ["text/markdown"],
  "author": "Omniview",
  "ui": { "icon": "📝", "label": "Markdown", "panel": "md-viewer.html" },
  "apiVersion": "1",
  "hasSettings": true,
  "settingsSchema": {
    "fontSize": { "type": "number", "label": "字体大小", "default": 14, "min": 10, "max": 28 }
  },
  "permissions": ["file:read"]
}
```

### md-viewer.html（使用 CDN 加载 marked）

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
    body { background: #1e1e1e; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    .bar { display: flex; align-items: center; gap: 8px; padding: 5px 12px; background: #252526; border-bottom: 1px solid #333; height: 32px; flex-shrink: 0; }
    .bar .name { flex: 1; font-size: 11px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar .stats { font-size: 10px; color: #666; }
    .content { flex: 1; overflow: auto; padding: 20px; }
    .content h1 { font-size: 22px; margin-bottom: 12px; color: #f0f0f0; }
    .content h2 { font-size: 18px; margin: 16px 0 8px; color: #e0e0e0; }
    .content p { margin-bottom: 10px; line-height: 1.7; color: #d4d4d4; }
    .content code { background: #2d2d2d; padding: 2px 6px; border-radius: 3px; font-family: "Consolas", monospace; font-size: 12px; color: #ce9178; }
    .content pre { background: #2d2d2d; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 10px 0; }
    .content pre code { background: none; padding: 0; color: #d4d4d4; }
    .content blockquote { border-left: 3px solid #00a8e8; padding-left: 12px; color: #888; margin: 10px 0; }
    .content table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .content th { background: #2d2d2d; padding: 6px 12px; text-align: left; font-size: 11px; color: #ccc; }
    .content td { padding: 6px 12px; border-bottom: 1px solid #2a2a2a; font-size: 11px; color: #d4d4d4; }
    .err { display: flex; align-items: center; justify-content: center; height: 100%; color: #e81123; font-size: 12px; }
  </style>
</head>
<body>
  <div class="bar"><span class="name" id="nm"></span><span class="stats" id="st"></span></div>
  <div class="content" id="content"></div>
  <div class="err" id="err" style="display:none;"></div>

  <!-- CDN: marked for Markdown parsing -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <script>
    (function() {
      const fp = decodeURIComponent(new URLSearchParams(location.search).get('file') || '');
      const name = fp.split(/\\|\//).pop() || 'markdown';
      document.getElementById('nm').textContent = name;
      document.title = name + ' - Markdown';

      async function load() {
        try {
          const result = await window.parent.omniview.readFile(fp);
          if (!result.success) throw new Error(result.error);
          const raw = result.content;
          // Render Markdown to HTML
          const html = marked.parse(raw);
          document.getElementById('content').innerHTML = html;
          document.getElementById('st').textContent = raw.length + ' chars, ' + raw.split('\n').length + ' lines';
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

QMC 是 QQ 音乐的加密音频格式，使用 XOR 异或加密。下面展示如何读取二进制并解密：

```javascript
async function load() {
  const fp = decodeURIComponent(new URLSearchParams(location.search).get('file') || '');
  
  // 1. Read binary data
  const result = await window.parent.omniview.readFileBuffer(fp);
  if (!result.success) throw new Error(result.error);
  const buf = new Uint8Array(result.buffer);
  
  // 2. Detect magic bytes and XOR key
  const magic = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
  let key = 0x61; // QMC0 default key
  
  // 3. Skip header, decrypt
  const headerSize = 12;
  const decrypted = new Uint8Array(buf.length - headerSize);
  for (let i = 0; i < decrypted.length; i++) {
    decrypted[i] = buf[i + headerSize] ^ key;
  }
  
  // 4. Create audio blob and play
  const blob = new Blob([decrypted], { type: 'audio/flac' });
  const audio = document.getElementById('audio');
  audio.src = URL.createObjectURL(blob);
}
```

---

## 七、冲突检测

扩展的 `formats` 不能与已安装的扩展重复。如果冲突，安装会失败并返回：

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

---

## 八、最佳实践

1. **单文件 HTML**：所有 CSS 和 JS 内联，不要引用外部文件
2. **使用 CDN 时要加 CSP**：如 pdf-lib、marked 等可从 jsdelivr 加载
3. **错误处理要完善**：始终检查 `result.success`
4. **标题同步**：通过 `postMessage` 通知父窗口更新标签页标题
5. **性能**：大文件分批读取，避免阻塞 UI
6. **命名**：扩展 ID 用全小写 + 连字符，如 `my-awesome-extension`
7. **测试**：安装后在扩展管理页面验证是否正常工作
8. **二进制数据**：使用 `readFileBuffer` 而不是 `readFile` 来读取二进制文件

---

## 九、构建命令

```bash
# 构建主项目
npm run build

# 打包扩展为 .dex（PowerShell）
Compress-Archive -Path "extensions/my-extension\*" -DestinationPath "my-extension.zip"
Copy-Item "my-extension.zip" "my-extension.dex"

# 打包扩展为 .dex（Linux/macOS）
cd extensions/my-extension && zip -r ../my-extension.dex .
```

---

## 十、API 参考

### window.parent.omniview（预加载桥接）

| 方法 | 参数 | 返回值 |
|------|------|--------|
| `readFile(path)` | 文件路径 | `{ success, content?, error? }` |
| `readFileBuffer(path)` | 文件路径 | `{ success, buffer?, error? }` (buffer 是 ArrayBuffer) |
| `writeFile(path, content)` | 路径 + 内容 | `{ success, error? }` |
| `routeFile(path)` | 文件路径 | `{ handled, type, handler, panel, extensionName }` |
| `getAppInfo()` | — | `{ version, name }` |
| `listExtensions()` | — | `Extension[]` |
| `installExtension(path)` | .dex 路径 | `{ success, extension?, error?, conflicts? }` |
| `removeExtension(id)` | 扩展 ID | `{ success, error? }` |
| `listRecent()` | — | `string[]` |
| `addRecent(path)` | 文件路径 | `string[]` |
| `clearRecent()` | — | `string[]` |
| `openFile()` | — | `{ path, recent } \| null` |

### 事件监听

| 方法 | 回调参数 | 说明 |
|------|---------|------|
| `onExtensionInstalled(cb)` | `(ext) => void` | 扩展安装成功 |
| `onExtensionRemoved(cb)` | `(id) => void` | 扩展被移除 |
| `onFileOpened(cb)` | `({ filePath, result }) => void` | 文件打开事件 |

所有事件监听方法返回取消函数，调用后可移除监听。

---

## 十一、已提供的扩展模板

在 `extensions/` 目录下有 17 个开箱即用的扩展模板，可直接学习参考：

| 扩展 ID | 说明 | 关键技术 |
|---------|------|---------|
| `json-formatter` | JSON 格式化树形视图 | DOM 操作、语法高亮 |
| `md-viewer` | Markdown 渲染 | marked CDN |
| `yaml-viewer` | YAML 语法高亮 | 正则解析 |
| `xml-viewer` | XML 语法高亮 | DOMParser 验证 |
| `csv-viewer` | CSV 可排序表格 | 排序、搜索 |
| `svg-viewer` | SVG 预览+代码切换 | Blob URL、缩放 |
| `hex-viewer` | 十六进制转储 | 二进制处理 |
| `base64-tool` | Base64 编解码 | btoa/atob |
| `qmc-audio-player` | QQ 音乐解密播放 | XOR 解密、Blob URL |
| `image-exif` | 图片 EXIF 提取 | DataView 读取二进制 |
| `pdf-chart` | PDF 查看 | iframe 渲染 |
| `media-duration-info` | 媒体信息提取 | MediaController |
| `heic-image-handler` | HEIC 图片处理 | 格式转换 |
| `3d-model-viewer` | 3D 模型查看 | Three.js CDN |
| `code-syntax-highlighter` | 代码高亮 | highlight.js CDN |
| `file-properties-panel` | 文件属性面板 | fs.stat |
| `image-info-panel` | 图片信息面板 | ImageData |
