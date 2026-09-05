export interface Extension {
  id: string;
  name: string;
  version: string;
  description?: string;
  type: 'format' | 'feature';
  formats?: string[];
  mimeTypes?: string[];
  ui: { panel?: string; icon?: string; title?: string };
  apiVersion: string;
  hasSettings?: boolean;
  settingsSchema?: Record<string, unknown>;
  config?: Record<string, unknown>;
  installedAt: number;
  active: boolean;
  path: string;
}

export interface FileRouteResult {
  handled: boolean;
  type: 'built-in' | 'extension';
  extensionId?: string;
  extensionName?: string;
  panel?: string;
  panelPath?: string;
  handler?: string;
  label?: string;
}

export interface Tab {
  id: string;
  filePath: string;
  result: FileRouteResult | null;
  extension?: Extension;
  title: string;
}

export interface AppState {
  page: 'home' | 'settings' | 'extensions' | 'detail' | 'viewer';
  selectedId?: string;
  tabs: Tab[];
  activeTabId?: string;
  recentFiles: string[];
  extensions: Extension[];
}
