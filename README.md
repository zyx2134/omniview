# Omniview — 万能文件查看器

<div align="center">

一个轻量、快速的 Windows 桌面文件查看工具。拖入任意文件即可自动识别格式并打开，支持多标签页浏览和插件扩展系统。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-35.x-blue.svg)
![React](https://img.shields.io/badge/React-19-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-lightgrey.svg)

**轻量 · 快速 · 可扩展**

</div>

---

## 目录

- [核心特性](#核心特性)
- [使用场景](#使用场景)
- [内置支持](#内置支持)
- [扩展生态](#扩展生态)
- [安装与运行](#安装与运行)
- [扩展开发](#扩展开发)
- [架构设计](#架构设计)
- [贡献指南](#贡献指南)

---

## 核心特性

### 拖拽即开
将任意文件拖入窗口即可立即打开，无需经过菜单或对话框。支持批量拖放多个文件，每个文件在独立标签页中打开。

### 多标签页导航
顶部标签栏显示所有已打开的文件，支持：
- **Ctrl+T** — 新建标签页（弹出文件选择框）
- **Ctrl+W** — 关闭当前标签页
- **Ctrl+Tab** — 切换到下一个标签
- **标签右键** — 关闭其他标签 / 关闭全部

### 插件扩展系统
通过 `.dex` 文件（本质是 ZIP 压缩包）安装新格式支持。扩展可以直接拖入窗口安装，也可以在扩展管理页面中点击安装。每个扩展都是独立的 HTML 面板，拥有完整的 UI 定制能力。

### 键盘快捷键
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+O` | 打开文件 |
| `Ctrl+T` | 新建标签页 |
| `Ctrl+W` | 关闭当前标签 |
| `Esc` | 返回上级页面 |
| `R` | 刷新当前视图 |

### 窗口记忆
自动保存上次关闭时的窗口位置、大小和最大化状态，重启后自动恢复。

---

## 使用场景

- **开发者**：快速查看代码文件、日志、配置文件，无需打开 IDE
- **运维人员**：检查日志文件、解析 JSON/YAML 配置、查看二进制文件
- **设计师**：预览图片、SVG 矢量图、EXIF 元数据
- **普通用户**：查看照片、视频、音频，解压并预览文件内容
- **数据分析师**：用表格形式查看 CSV/TSV 数据，无需打开 Excel

---

## 内置支持

### 图片格式
| 格式 | 说明 |
|------|------|
| PNG | 支持透明度、APNG 动画 |
| JPEG / JPG | 标准照片格式 |
| GIF | 支持动画 GIF |
| BMP | Windows 位图 |
| WebP | Google 现代图像格式 |
| SVG | 可缩放矢量图形（同时提供代码视图） |

### 视频格式
MP4、WebM、AVI、MOV、MKV、FLV、WMV

### 音频格式
MP3、WAV、FLAC、OGG、M4A、AAC

### 文本/代码格式
TXT、MD、JSON、XML、HTML、CSS、JS、TS、Python、Java、C/C++、Rust、Go、Ruby、Shell、YAML、TOML、INI、CSV、SQL、Log 等

---

## 扩展生态

项目内置 **20+ 扩展**，覆盖更多文件格式和工具：

### 数据与代码类
| 扩展 | 格式 | 功能 |
|------|------|------|
| **JSON Formatter** | `.json` | 格式化 + 语法高亮 + 树形折叠 |
| **YAML Viewer** | `.yaml`, `.yml` | 语法高亮 + 结构展示 |
| **XML Viewer** | `.xml` | 语法高亮 + 有效性验证 |
| **CSV Viewer** | `.csv`, `.tsv` | 可排序表格 + 搜索过滤 |
| **SQL Viewer** | `.sql` | SQL 语句语法高亮 |
| **Log Viewer** | `.log`, `.txt` | 日志级别着色 + 过滤 + 搜索 |
| **Hex Viewer** | `.bin`, `.exe`, `.dll` 等 | 十六进制转储 + ASCII 对照 + 搜索 |
| **Base64 Tool** | `.b64` | Base64 编解码双向转换 |

### 媒体类
| 扩展 | 格式 | 功能 |
|------|------|------|
| **SVG Viewer** | `.svg` | 预览 + 代码切换 + 缩放平移 |
| **Image EXIF** | `.jpg`, `.jpeg`, `.heic` | 提取相机参数、GPS 坐标、拍摄时间 |
| **QMC Audio Player** | `.qmc0`, `.qmcflac` | QQ 音乐加密音频解密播放 |
| **Media Info** | 多种媒体格式 | 显示时长、分辨率、编码信息 |
| **HEIC Handler** | `.heic`, `.heif` | HEIC/HEIF 图片处理（占位扩展） |

### 工具类
| 扩展 | 格式 | 功能 |
|------|------|------|
| **Markdown Viewer** | `.md`, `.markdown` | Markdown 渲染（表格、代码块、公式） |
| **PDF & Chart** | `.pdf` | PDF 文件查看 |
| **3D Model Viewer** | `.glb`, `.gltf`, `.obj` | 3D 模型旋转/缩放/线框模式 |
| **Code Highlighter** | 多种代码格式 | 基于 highlight.js 的代码语法高亮 |
| **Env Viewer** | `.env` | 环境变量文件解析 + 敏感值遮蔽 |
| **File Properties** | 任意文件 | 显示文件大小、修改时间、权限等 |
| **Image Info Panel** | 图片格式 | 显示图片尺寸、颜色深度、格式信息 |

### 安装扩展
将 `.dex` 文件拖入 Omniview 窗口即可自动安装，或在「设置 → 扩展管理」中点击「安装扩展」。

---

## 安装与运行

### 方式一：直接使用（推荐）

下载便携版 `Omniview.exe`，双击运行，无需安装。

### 方式二：安装版

运行 `Omniview-安装程序.exe`，安装后可：
- 创建桌面快捷方式
- 注册文件关联（双击图片/视频/文本文件自动用 Omniview 打开）

### 方式三：从源码构建

```bash
# 克隆仓库
git clone https://github.com/your-username/omniview.git
cd omniview

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 打包（生成安装程序和便携版）
npm run dist
```

构建产物在 `release/` 目录：
- `Omniview-0.1.0-win-x64.exe` — NSIS 安装程序
- `Omniview-0.1.0-win-portable-x64.exe` — 便携版（无需安装）

### 环境要求

- **操作系统**：Windows 10 / 11 (x64)
- **运行时**：无需额外安装（自带 Chromium）
- **开发环境**：Node.js 18+、npm 9+

---

## 扩展开发

详细的扩展开发指南请查看 [EXTENSION_GUIDE.md](./EXTENSION_GUIDE.md)。

### 快速开始

#### 1. 创建扩展目录

```bash
mkdir my-extension
cd my-extension
```

#### 2. 编写 manifest.json

```json
{
  "id": "my-extension",
  "name": "我的扩展",
  "version": "1.0.0",
  "description": "扩展功能描述",
  "type": "format",
  "formats": ["myext"],
  "author": "你的名字",
  "ui": {
    "icon": "🔧",
    "label": "MyExt",
    "panel": "panel.html"
  },
  "apiVersion": "1",
  "hasSettings": false,
  "permissions": ["file:read"]
}
```

#### 3. 编写 panel.html

面板是一个独立的 HTML 文件，在 iframe 中运行：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' file:;">
  <title>我的面板</title>
  <style>
    body { background: #1e1e1e; color: #d4d4d4; padding: 20px; font-family: sans-serif; }
  </style>
</head>
<body>
  <h2 id="filename">加载中...</h2>
  <pre id="content"></pre>

  <script>
    // 获取文件路径
    const fp = decodeURIComponent(new URLSearchParams(location.search).get('file') || '');
    document.getElementById('filename').textContent = fp.split(/\\|\//).pop();

    // 读取文件内容
    async function load() {
      const result = await window.parent.omniview.readFile(fp);
      if (result.success) {
        document.getElementById('content').textContent = result.content;
      }
    }
    load();
  </script>
</body>
</html>
```

#### 4. 打包为 .dex

```bash
# Windows PowerShell
Compress-Archive -Path "my-extension\*" -DestinationPath "my-extension.dex" -Force

# macOS / Linux
cd my-extension && zip -r ../my-extension.dex .
```

#### 5. 安装测试

将生成的 `my-extension.dex` 拖入 Omniview 窗口即可安装。

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     渲染进程 (Renderer)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  App.tsx │  │ Tab Bar  │  │  Viewer / Views     │   │
│  │  (React) │  │  (标签页) │  │  (iframe 面板)       │   │
│  └────┬─────┘  └──────────┘  └──────────────────────┘   │
│       │                                                   │
│  ┌────▼─────┐         ┌──────────────────────────┐       │
│  │ Preload  │◄────────►│  window.omniview API     │       │
│  │ (IPC桥)  │         │  (安全隔离的接口)          │       │
│  └────┬─────┘         └──────────────────────────┘       │
└───┬───────┬─────────────────────────────────────────────┘
    │       │ IPC
┌───▼───────▼─────────────────────────────────────────────┐
│                     主进程 (Main)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  WindowMgr   │  │  FileRouter  │  │ExtManager     │  │
│  │  (窗口管理)   │  │  (文件路由)   │  │ (扩展管理)     │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │  IPC Handle  │  │  Extension   │                      │
│  │  (消息处理)   │  │  Installer   │                      │
│  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### 文件路由流程

```
用户打开文件
    │
    ▼
FileRouter.route(filePath)
    │
    ├── 1. 检查扩展管理器中是否有匹配格式的处理器的扩展
    │       └── 有 → 返回扩展面板 URL
    │
    ├── 2. 检查内置格式表（BUILTIN_FORMATS）
    │       └── 有 → 返回内置处理器 URL
    │
    └── 3. 无匹配 → handled: false
    │
    ▼
渲染进程创建 iframe，加载对应面板
```

### 安全设计

- **Context Isolation**：渲染进程与主进程完全隔离
- **Preload 桥接**：仅暴露必要的 API（`readFile`, `routeFile` 等）
- **CSP 限制**：扩展面板不允许外部网络请求（除非使用 CDN 并在 CSP 中声明）
- **文件权限**：扩展需要声明 `file:read` 或 `file:write` 权限

---

## 贡献指南

### 提交 Issue

- 描述清晰的问题标题
- 提供复现步骤
- 附上截图或录屏（如有）
- 说明操作系统版本和 Omniview 版本

### 提交扩展

1. 在 `extensions/` 目录下创建你的扩展
2. 确保 `manifest.json` 格式正确
3. 确保 HTML 面板能通过 CSP 验证
4. 提 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置（项目已内置）
- 提交前运行 `npm run build` 确保无错误

---

## 常见问题

### Q: 为什么某些格式打不开？
A: 该格式可能需要额外的扩展支持。请在扩展管理页面查看是否有相关插件。

### Q: 如何卸载扩展？
A: 进入「设置 → 扩展管理」，点击对应扩展的「卸载」按钮。

### Q: 扩展可以访问网络吗？
A: 默认不允许。如果需要使用 CDN（如 marked.js、highlight.js），需在 HTML 的 CSP meta 标签中声明。

### Q: 支持 Mac / Linux 吗？
A: 当前仅支持 Windows。Electron 跨平台，移植到 macOS/Linux 只需调整构建配置。

---

## License

[MIT](./LICENSE)

---

## 致谢

- [Electron](https://www.electronjs.org/) — 桌面应用框架
- [React](https://react.dev/) — UI 框架
- [Vite](https://vitejs.dev/) — 构建工具
- [electron-builder](https://www.electron.build/) — 打包分发
- [marked](https://marked.js.org/) — Markdown 解析
- [highlight.js](https://highlightjs.org/) — 代码高亮
