import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path, { join } from 'path';
import { homedir } from 'os';
import { readFile, writeFile, mkdir, stat, readdir, rm, unlink, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { ExtensionManager } from './extensions/manager';
import { FileRouter } from './router';

// 鈹€鈹€鈹€ Paths 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const APP_DATA = join(homedir(), '.omniview');
const RECENT_FILE = join(APP_DATA, 'recent.json');
const STATE_FILE = join(APP_DATA, 'state.json');

let mainWindow: BrowserWindow | null = null;
const extensionManager = new ExtensionManager();
const fileRouter = new FileRouter(extensionManager);

// 鈹€鈹€鈹€ Recent files 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ Window state 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ Create window 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

app.whenReady().then(async () => {
  // Fire extensions init in background 鈥?don't block window creation
  await extensionManager.init();
  await createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 鈹€鈹€鈹€ IPC: Window 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => mainWindow?.maximize());
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.handle('window:get-state', async () => {
  if (!mainWindow) return null;
  const b = mainWindow.getBounds();
  return { x: b.x, y: b.y, width: b.width, height: b.height, maximized: mainWindow.isMaximized() };
});

// 鈹€鈹€鈹€ IPC: File open 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ IPC: File route 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
ipcMain.handle('file:route', async (_e, filePath: string) => {
  return fileRouter.route(filePath);
});

// 鈹€鈹€鈹€ IPC: File read 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ IPC: File stat 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
ipcMain.handle('file:stat', async (_e, filePath: string) => {
  try {
    const st = await stat(filePath);
    return { success: true, size: st.size, mtime: st.mtimeMs, ctime: st.ctimeMs, atime: st.atimeMs };
  } catch (e: any) { return { success: false, error: e.message }; }
});

// 鈹€鈹€鈹€ IPC: Recent files 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
ipcMain.handle('recent:list', async () => {
  const files = await loadRecent();
  // Fast check: just filter by existence without stat-ing large files
  const valid: string[] = [];
  for (const f of files) {
    try {
      if (existsSync(f)) valid.push(f);
    } catch { /* skip */ }
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

// 鈹€鈹€鈹€ IPC: File write 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
ipcMain.handle('file:write', async (_e, filePath: string, content: string) => {
  try {
    await writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
});

// 鈹€鈹€鈹€ IPC: Extension 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€鈹€ IPC: App info 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
ipcMain.handle('app:info', () => ({ version: app.getVersion(), name: app.getName() }));

// 鈹€鈹€鈹€ IPC: Handle second instance 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.on('second-instance', (_e, argv) => {
    const fileArg = argv.find(a => a.endsWith('.dex') || ['.png', '.jpg', '.mp4', '.mp3', '.txt', '.glb'].some(ext => a.toLowerCase().endsWith(ext)));
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

// 鈹€鈹€鈹€ Command-line file argument 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// Only process actual file arguments (skip exe path and flags)
const cliArgs = process.argv.slice(2).filter(a => !a.startsWith('--'));
const fileArg = cliArgs.find(a => a.length > 1);
if (fileArg && !mainWindow) {
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

