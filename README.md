# Omniview — 万能文件查看器

一个轻量、快速的 Windows 桌面文件查看工具。拖入任意文件即可自动识别格式并打开，支持多标签页和扩展系统。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-35.x-blue.svg)
![React](https://img.shields.io/badge/React-19-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

---

## 功能

- **拖拽即开**：将文件拖入窗口即可打开，无需菜单操作
- **多标签页**：同时打开多个文件，顶部标签栏切换（Ctrl+T 新建 / Ctrl+W 关闭）
- **扩展系统**：拖入 `.dex` 文件即可安装新格式支持
- **快捷键**：Ctrl+O 打开文件 / Esc 返回 / Ctrl+T 新建标签 / Ctrl+W 关闭标签
- **窗口记忆**：自动保存上次位置和大小
- **冲突检测**：安装扩展时自动检测格式冲突

### 内置支持

| 类型 | 格式 |
|------|------|
| 图片 | PNG, JPEG, GIF, BMP, WebP, APNG |
| 视频 | MP4, WebM, AVI, MOV, MKV, FLV, WMV |
| 音频 | MP3, WAV, FLAC, OGG, M4A, AAC |
| 文本 | TXT, MD, JSON, XML, HTML, CSS, JS, TS, Python, Java, C/C++, Rust, Go 等 |

### 扩展生态（20+ 插件）

| 插件 | 说明 |
|------|------|
| **JSON Formatter** | 格式化 + 语法高亮 |
| **YAML Viewer** | YAML 语法高亮 |
| **XML Viewer** | XML 语法高亮 + 验证 |
| **CSV Viewer** | 可排序表格 + 搜索 |
| **SQL Viewer** | SQL 语句高亮 |
| **Log Viewer** | 日志级别着色 + 过滤 |
| **SVG Viewer** | 预览 + 代码视图 + 缩放 |
| **Hex Viewer** | 十六进制转储 + 搜索 |
| **Base64 Tool** | 双向编解码 |
| **Markdown Viewer** | Markdown 渲染 |
| **Image EXIF** | 提取相机参数、GPS |
| **QMC Audio Player** | QQ 音乐加密音频解密播放 |
| **Env Viewer** | .env 文件解析 + 敏感值遮蔽 |
| **Media Info** | 媒体时长/分辨率/编码信息 |
| **PDF & Chart** | PDF/SVG 文件查看 |
| **Code Highlighter** | 代码语法高亮（支持 100+ 语言） |
| **3D Model Viewer** | GLB/GLTF/OBJ/FBX 3D 模型查看 |
| **HEIC Handler** | HEIC/HEIF 图片处理 |
| **File Properties** | 详细文件属性面板 |
| **Image Info Panel** | 图片尺寸/颜色/格式信息 |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- Windows 10/11 (x64)

### 安装依赖

```bash
cd omniview
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build        # 仅构建代码
npm run dist         # 构建 + 打包（生成安装包）
```

构建产物：
- `release/Omniview-0.1.0-win-x64.exe` — NSIS 安装程序
- `release/Omniview-0.1.0-win-portable-x64.exe` — 便携版

---

## 扩展开发

详见 [EXTENSION_GUIDE.md](./EXTENSION_GUIDE.md)

### 快速创建

```bash
# 1. 创建目录
mkdir my-extension
cd my-extension

# 2. 创建 manifest.json
cat > manifest.json << 'EOF'
{
  "id": "my-extension",
  "name": "我的扩展",
  "version": "1.0.0",
  "description": "功能描述",
  "type": "format",
  "formats": ["myext"],
  "ui": { "icon": "🔧", "label": "MyExt", "panel": "panel.html" },
  "apiVersion": "1",
  "permissions": ["file:read"]
}
EOF

# 3. 创建 panel.html（在同一个目录）
# ... 编写你的 UI 和逻辑

# 4. 打包为 .dex
cd ..
Compress-Archive -Path "my-extension\*" -DestinationPath "my-extension.dex" -Force
```

安装：将 `.dex` 文件拖入 Omniview 窗口即可。

---

## 项目结构

```
omniview/
├── src/
│   ├── main/                 # 主进程（Electron）
│   │   ├── index.ts          # 窗口管理、IPC、拖放
│   │   ├── router.ts         # 文件路由（内置→扩展）
│   │   ├── types.ts          # 核心类型
│   │   └── extensions/
│   │       └── manager.ts    # 扩展加载、安装、冲突检测
│   ├── preload/
│   │   └── index.ts          # 安全 IPC 桥接
│   └── renderer/
│       ├── index.html        # 渲染进程入口
│       ├── main.tsx          # React 入口
│       ├── App.tsx           # 主应用（标签页、导航）
│       ├── global.css        # 全局样式
│       ├── handlers/         # 内置处理器 HTML
│       │   ├── image.html
│       │   ├── video.html
│       │   ├── audio.html
│       │   ├── text.html
│       │   └── pdf-chart.html
│       └── views/            # React 视图组件
├── extensions/               # 示例扩展（可发布为 .dex）
├── build/                    # 打包资源（图标、NSIS 脚本）
├── scripts/                  # 构建脚本
├── EXTENSION_GUIDE.md        # 扩展开发指南
└── package.json
```

---

## 技术栈

- **Electron 35** — 桌面应用框架
- **React 19** — UI 框架
- **TypeScript 5** — 类型安全
- **Vite 5** — 构建工具
- **electron-builder 25** — 打包分发

---

## 已知限制

- HEIC 解码需要 WASM 支持（当前为占位扩展）
- 扩展面板不允许外部网络请求（除非使用 CDN 并在 CSP 中声明）
- 文件关联仅 NSIS 安装版生效

---

## License

MIT
