export interface OmniviewAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  getWindowState: () => Promise<any>;
  openFile: () => Promise<{ path: string; recent: string[] } | null>;
  routeFile: (path: string) => Promise<any>;
  readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  installExtension: (path: string) => Promise<any>;
  writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
  listExtensions: () => Promise<Extension[]>;
  removeExtension: (id: string) => Promise<any>;
  getExtension: (id: string) => Promise<Extension | null>;
  updateExtensionConfig: (id: string, cfg: Record<string, unknown>) => Promise<any>;
  checkConflict: (manifest: any) => Promise<any>;
  listRecent: () => Promise<string[]>;
  addRecent: (path: string) => Promise<string[]>;
  clearRecent: () => Promise<string[]>;
  getAppInfo: () => Promise<{ version: string; name: string }>;
  onExtensionInstalled: (cb: (ext: Extension) => void) => () => void;
  onExtensionRemoved: (cb: (id: string) => void) => () => void;
  onFileOpened: (cb: (data: { filePath: string; result: any }) => void) => () => void;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  description?: string;
  type: 'format' | 'feature';
  formats?: string[];
  ui: { panel?: string; icon?: string; title?: string };
  apiVersion: string;
  hasSettings?: boolean;
  settingsSchema?: Record<string, unknown>;
  config?: Record<string, unknown>;
  installedAt: number;
  active: boolean;
  path: string;
}

declare global {
  interface Window {
    omniview: OmniviewAPI;
  }
}

export {};
