import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path, { join } from 'path';
import { homedir } from 'os';
import { readFile, writeFile, mkdir, stat, readdir, rm, unlink, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { ExtensionManager } from './extensions/manager';
import { FileRouter } from './router';
import { registerFileAssociations, isAssociationRegistered } from './associations';

// ─── Paths ────────────────────────────────────────────────────────────────────
const APP_DATA = join(homedir(), '.omniview');
const RECENT_FILE = join(APP_DATA, 'recent.json');
const STATE_FILE = join(APP_DATA, 'state.json');

let mainWindow: BrowserWindow | null = null;
const extensionManager = new ExtensionManager();
const fileRouter = new FileRouter(extensionManager);

// ─── Recent files ─────────────────────────────────────────────────────────────
async function loadRecent(): Promise<string[]> {
  if (!existsSync(RECENT_FILE)) return [];
  try { return JSON.parse(await readFile(RECENT_FILE, 'utf-8')) as string[]; }
  catch { return []; }
}

async function saveRecent(files: string[]) {
  await mkdir(APP_DATA, { recursive: true });
  await writeFile(RECENT_FILE, JSON.stringify(files.slice(0, 20), null, 2), 'utf-8');
}

async function addToRecent(filePath: string) {
  const files = await loadRecent();
  const clean = filePath.replace(/^file:\/\//, '');
  const next = [clean, ...files.filter(f => f !== clean)];
  await saveRecent(next);
  return next;
}

// ─── Window state ─────────────────────────────────────────────────────────────
async function loadWindowState() {
  if (!existsSync(STATE_FILE)) return {};
  try { return JSON.parse(await readFile(STATE_FILE, 'utf-8')); }
  catch { return {}; }
}

async function saveWindowState(win: BrowserWindow) {
  const { x, y, width, height } = win.getBounds();
  await mkdir(APP_DATA, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify({ x, y, width, height, maximized: win.isMaximized() }), 'utf-8');
}

// ─── Create window ────────────────────────────────────────────────────────────
async function createWindow() {
  const saved = await loadWindowState();

  mainWindow = new BrowserWindow({
    width: saved.width || 1200,
    height: saved.height || 800,
    minWidth: 800,
    minHeight: 600,
    x: saved.x,
    y: saved.y,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 12 },
    backgroundColor: '#0d0d0d',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => { mainWindow?.show(); });

  if (saved.maximized) mainWindow.maximize();

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('resize', () => { if (!mainWindow?.isMaximized()) saveWindowState(mainWindow!); });
  mainWindow.on('move', () => { if (!mainWindow?.isMaximized()) saveWindowState(mainWindow!); });
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Startup: show window IMMEDIATELY, load data in background ────────────────
// Extension init and recent files are async I/O — do NOT await them before
// showing the window. The renderer updates itself via IPC when data arrives.
createWindow();
extensionManager.init().then(() => {
  BrowserWindow.getAllWindows().forEach(win =>
    win.webContents.send('ext:ready', extensionManager.getAll())
  );
});
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC: Window ──────────────────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => mainWindow?.maximize());
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.handle('window:get-state', async () => {
  if (!mainWindow) return null;
  const b = mainWindow.getBounds();
  return { x: b.x, y: b.y, width: b.width, height: b.height, maximized: mainWindow.isMaximized() };
});

// ─── IPC: File open ───────────────────────────────────────────────────────────
ipcMain.handle('file:open', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
    title: 'Open File',
    properties: ['openFile'],
    filters: [{ name: 'All Files', extensions: ['*'] }],
  });
  if (canceled || filePaths.length === 0) return null;
  const recent = await addToRecent(filePaths[0]);
  return { path: filePaths[0], recent };
});

// ─── IPC: File route ──────────────────────────────────────────────────────────
ipcMain.handle('file:route', async (_e, filePath: string) => {
  return fileRouter.route(filePath);
});

// ─── IPC: File read ───────────────────────────────────────────────────────────
ipcMain.handle('file:read', async (_e, filePath: string) => {
  try { return { success: true, content: await readFile(filePath, 'utf-8') }; }
  catch (e: any) { return { success: false, error: e.message }; }
});

ipcMain.handle('file:read-buffer', async (_e, filePath: string) => {
  try {
    const buf = await readFile(filePath);
    return { success: true, buffer: buf };
  } catch (e: any) { return { success: false, error: e.message }; }
});

// ─── IPC: File stat ───────────────────────────────────────────────────────────
ipcMain.handle('file:stat', async (_e, filePath: string) => {
  try {
    const st = await stat(filePath);
    return { success: true, size: st.size, mtime: st.mtimeMs, ctime: st.ctimeMs, atime: st.atimeMs };
  } catch (e: any) { return { success: false, error: e.message }; }
});

// ─── IPC: Recent files ────────────────────────────────────────────────────────
ipcMain.handle('recent:list', async () => {
  const files = await loadRecent();
  const valid: string[] = [];
  for (const f of files) {
    try { if (existsSync(f)) valid.push(f); } catch { /* skip */ }
  }
  return valid;
});

ipcMain.handle('recent:add', async (_e, filePath: string) => {
  return addToRecent(filePath);
});

ipcMain.handle('recent:clear', async () => {
  await writeFile(RECENT_FILE, '[]', 'utf-8');
  return [];
});

// ─── IPC: File write ──────────────────────────────────────────────────────────
ipcMain.handle('file:write', async (_e, filePath: string, content: string) => {
  try {
    await writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
});

// ─── IPC: Extension ───────────────────────────────────────────────────────────
ipcMain.handle('ext:list', () => extensionManager.getAll());
ipcMain.handle('ext:install', async (_e, p) => {
  const r = await extensionManager.install(p);
  if (r.success && mainWindow) mainWindow.webContents.send('ext:installed', r.extension);
  return r;
});
ipcMain.handle('ext:remove', async (_e, id) => {
  const r = await extensionManager.remove(id);
  if (r.success && mainWindow) mainWindow.webContents.send('ext:removed', id);
  return r;
});
ipcMain.handle('ext:get', (_e, id) => extensionManager.get(id));
ipcMain.handle('ext:update-config', (_e, id, cfg) => extensionManager.updateConfig(id, cfg));
ipcMain.handle('ext:check-conflict', (_e, m) => extensionManager.checkConflict(m as any));

// ─── IPC: App info ────────────────────────────────────────────────────────────
ipcMain.handle('app:info', () => ({ version: app.getVersion(), name: app.getName() }));

// ─── IPC: File association (portable mode) ────────────────────────────────────
ipcMain.handle('assoc:register', async () => {
  return registerFileAssociations();
});

ipcMain.handle('assoc:check', async (_e, ext: string) => {
  return isAssociationRegistered(ext);
});

// ─── Second-instance handler (right-click "Open with") ────────────────────────
// Windows passes argv = [exePath, filePath] when opening via right-click.
// requestSingleInstanceLock() prevents a second window, so the existing instance
// receives 'second-instance' with the new args.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    if (!mainWindow) return;
    // Strip surrounding quotes (Windows adds them for paths with spaces)
    const rawArgs = argv.map(a => a.replace(/^"|"$/g, ''));
    // Find the first argument that looks like an actual file (skip .exe and flags)
    const fileArg = rawArgs.find(a =>
      !a.toLowerCase().endsWith('.exe') &&
      (a.toLowerCase().endsWith('.dex') ||
       /\.(png|jpe?g|gif|bmp|webp|apng|svg|pdf|mp4|webm|avi|mov|mkv|flv|wmv|mp3|wav|flac|ogg|m4a|aac|txt|md|json|xml|html|htm|css|js|ts|jsx|tsx|py|java|c|cpp|h|rs|go|rb|sh|bat|ini|yaml|yml|toml|csv|log|sql|qmc0|qmcflac|qmcogg|glb|gltf|obj|fbx|env|b64|heic|heif)$/i.test(a))
    );
    if (fileArg && mainWindow) {
      if (fileArg.toLowerCase().endsWith('.dex')) {
        extensionManager.install(fileArg).then(r => {
          if (r.success) mainWindow?.webContents.send('ext:installed', r.extension);
        });
      } else {
        fileRouter.route(fileArg).then(result => {
          mainWindow?.webContents.send('file:opened', { filePath: fileArg, result });
        });
      }
      mainWindow.focus();
    }
  });
}

// ─── Command-line file argument (first-instance launch with file) ─────────────
const cliArgs = process.argv.slice(2).filter(a => !a.startsWith('--'));
const fileArg = cliArgs.find(a => a.length > 1);
if (fileArg) {
  app.whenReady().then(async () => {
    await createWindow();
    if (fileArg.toLowerCase().endsWith('.dex')) {
      extensionManager.install(fileArg).then(r => {
        if (r.success && mainWindow) mainWindow.webContents.send('ext:installed', r.extension);
      });
    } else {
      fileRouter.route(fileArg).then(result => {
        if (mainWindow) mainWindow.webContents.send('file:opened', { filePath: fileArg, result });
      });
    }
  });
}
