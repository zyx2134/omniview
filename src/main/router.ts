import { extname, basename } from 'path';
import { ExtensionManager } from './extensions/manager';

const BUILTIN_FORMATS: Record<string, { handler: string; label: string }> = {
  '.png':  { handler: 'image',  label: 'PNG' },
  '.jpg':  { handler: 'image',  label: 'JPEG' },
  '.jpeg': { handler: 'image',  label: 'JPEG' },
  '.gif':  { handler: 'image',  label: 'GIF' },
  '.svg':  { handler: 'pdf-chart', label: 'SVG Chart' },
  '.bmp':  { handler: 'image',  label: 'BMP' },
  '.webp': { handler: 'image',  label: 'WebP' },
  '.apng': { handler: 'image',  label: 'APNG' },
  '.pdf':  { handler: 'pdf-chart', label: 'PDF' },
  '.mp4':  { handler: 'video', label: 'MP4' },
  '.webm': { handler: 'video', label: 'WebM' },
  '.avi':  { handler: 'video', label: 'AVI' },
  '.mov':  { handler: 'video', label: 'MOV' },
  '.mkv':  { handler: 'video', label: 'MKV' },
  '.flv':  { handler: 'video', label: 'FLV' },
  '.wmv':  { handler: 'video', label: 'WMV' },
  '.mp3':  { handler: 'audio', label: 'MP3' },
  '.wav':  { handler: 'audio', label: 'WAV' },
  '.flac': { handler: 'audio', label: 'FLAC' },
  '.ogg':  { handler: 'audio', label: 'OGG' },
  '.m4a':  { handler: 'audio', label: 'M4A' },
  '.aac':  { handler: 'audio', label: 'AAC' },
  '.txt':  { handler: 'text',  label: 'Text' },
  '.md':   { handler: 'text',  label: 'Markdown' },
  '.json': { handler: 'text',  label: 'JSON' },
  '.xml':  { handler: 'text',  label: 'XML' },
  '.html': { handler: 'text',  label: 'HTML' },
  '.htm':  { handler: 'text',  label: 'HTML' },
  '.css':  { handler: 'text',  label: 'CSS' },
  '.js':   { handler: 'text',  label: 'JavaScript' },
  '.ts':   { handler: 'text',  label: 'TypeScript' },
  '.jsx':  { handler: 'text',  label: 'JSX' },
  '.tsx':  { handler: 'text',  label: 'TSX' },
  '.py':   { handler: 'text',  label: 'Python' },
  '.java': { handler: 'text',  label: 'Java' },
  '.c':    { handler: 'text',  label: 'C' },
  '.cpp':  { handler: 'text',  label: 'C++' },
  '.h':    { handler: 'text',  label: 'Header' },
  '.rs':   { handler: 'text',  label: 'Rust' },
  '.go':   { handler: 'text',  label: 'Go' },
  '.rb':   { handler: 'text',  label: 'Ruby' },
  '.sh':   { handler: 'text',  label: 'Shell' },
  '.bat':  { handler: 'text',  label: 'Batch' },
  '.ini':  { handler: 'text',  label: 'INI' },
  '.yaml': { handler: 'text',  label: 'YAML' },
  '.yml':  { handler: 'text',  label: 'YAML' },
  '.toml': { handler: 'text',  label: 'TOML' },
  '.csv':  { handler: 'text',  label: 'CSV' },
  '.log':  { handler: 'text',  label: 'Log' },
};

export interface RouteResult {
  handled: boolean;
  type: 'built-in' | 'extension';
  handler?: string;
  panel?: string;
  panelPath?: string;
  extensionId?: string;
  extensionName?: string;
  label?: string;
}

export class FileRouter {
  constructor(private extManager: ExtensionManager) {}

  async route(filePath: string): Promise<RouteResult> {
    let cleanPath = filePath.replace(/^file:\/\//, '').replace(/\\/g, '/');
    const extWithDot = extname(cleanPath).toLowerCase();
    const ext = extWithDot.replace(/^\./, '');

    // 1. Try extensions first
    const extHandlers = this.extManager.getByFormat(ext);
    if (extHandlers.length > 0) {
      const primary = extHandlers[0];
      const extDef = this.extManager.get(primary.id);
      if (extDef) {
        // If extension has no custom panel, fall back to the default handler
        const panel = extDef.ui?.panel;
        return {
          handled: true,
          type: 'extension',
          handler: panel || 'default',
          panel,
          panelPath: panel ? extDef.path : undefined,
          extensionId: extDef.id,
          extensionName: extDef.name,
        };
      }
    }

    // 2. Fallback to built-in handlers
    const builtin = BUILTIN_FORMATS[extWithDot];
    if (builtin) {
      return {
        handled: true,
        type: 'built-in',
        handler: builtin.handler,
        label: builtin.label,
      };
    }

    // 3. Unknown format → still show the default info view
    return {
      handled: true,
      type: 'built-in',
      handler: 'default',
      label: ext ? ext.toUpperCase() : 'FILE',
    };
  }
}
