// Preload — safe IPC bridge
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('omniview', {
  // Window
  minimizeWindow:   () => ipcRenderer.send('window:minimize'),
  maximizeWindow:   () => ipcRenderer.send('window:maximize'),
  closeWindow:      () => ipcRenderer.send('window:close'),
  getWindowState:   () => ipcRenderer.invoke('window:get-state'),

  // File
  openFile:         () => ipcRenderer.invoke('file:open'),
  routeFile:        (p: string) => ipcRenderer.invoke('file:route', p),
  readFile:         (p: string) => ipcRenderer.invoke('file:read', p),
  readFileBuffer:   (p: string) => ipcRenderer.invoke('file:read-buffer', p),
  installExtension: (p: string) => ipcRenderer.invoke('ext:install', p),
  writeFile:        (p: string, c: string) => ipcRenderer.invoke('file:write', p, c),

  // Extensions
  listExtensions:   () => ipcRenderer.invoke('ext:list'),
  removeExtension:  (id: string) => ipcRenderer.invoke('ext:remove', id),
  getExtension:     (id: string) => ipcRenderer.invoke('ext:get', id),
  updateExtensionConfig: (id: string, cfg: any) => ipcRenderer.invoke('ext:update-config', id, cfg),
  checkConflict:    (m: any) => ipcRenderer.invoke('ext:check-conflict', m),

  // Recent files
  listRecent:           () => ipcRenderer.invoke('recent:list'),
  addRecent:            (p: string) => ipcRenderer.invoke('recent:add', p),
  clearRecent:          () => ipcRenderer.invoke('recent:clear'),

  // App
  getAppInfo: () => ipcRenderer.invoke('app:info'),

  // Events
  onExtensionInstalled: (cb: (e: any) => void) => {
    const h = (_: any, e: any) => cb(e);
    ipcRenderer.on('ext:installed', h);
    return () => ipcRenderer.removeListener('ext:installed', h);
  },
  onExtensionRemoved: (cb: (id: string) => void) => {
    const h = (_: any, id: string) => cb(id);
    ipcRenderer.on('ext:removed', h);
    return () => ipcRenderer.removeListener('ext:removed', h);
  },
  onFileOpened: (cb: (data: { filePath: string; result: any }) => void) => {
    const h = (_: any, d: any) => cb(d);
    ipcRenderer.on('file:opened', h);
    return () => ipcRenderer.removeListener('file:opened', h);
  },
});
