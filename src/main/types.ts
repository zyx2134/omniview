export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  type: 'format' | 'feature';
  formats?: string[];        // e.g. ['heic', 'webm'] — only for type:'format'
  mimeTypes?: string[];      // e.g. ['image/heic']
  ui: {
    panel?: string;          // panel identifier, only for type:'feature'
    icon?: string;
    title?: string;
  };
  apiVersion: string;
  hasSettings?: boolean;     // whether this extension has its own settings UI
  settingsSchema?: Record<string, unknown>;
}

export interface ExtensionInstance extends ExtensionManifest {
  id: string;
  path: string;              // filesystem path to the extension directory
  config: Record<string, unknown>;
  installedAt: number;
  active: boolean;
}

export interface InstallResult {
  success: boolean;
  extension?: ExtensionInstance;
  error?: string;
  conflicts?: ConflictInfo[];
}

export interface ConflictInfo {
  type: 'format' | 'panel';
  value: string;
  existingExtensionId: string;
  existingName: string;
}

export interface RouteResult {
  handled: boolean;
  type: 'built-in' | 'extension';
  extensionId?: string;
  extensionName?: string;
  handler?: string;       // for built-in: HTML filename stem (e.g. 'image')
  panel?: string;         // for extensions: panel HTML filename (e.g. '3d-viewer')
  panelPath?: string;     // for extensions: absolute filesystem path to panel HTML
  label?: string;
}
