import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  unlink,
  rename,
  stat,
  rm,
} from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { homedir } from 'os';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  ExtensionInstance,
  ExtensionManifest,
  InstallResult,
  ConflictInfo,
} from '../types';

const execFileAsync = promisify(execFile);
const STORAGE_DIR = join(homedir(), '.omniview', 'extensions');
const CONFIG_FILE = join(STORAGE_DIR, 'config.json');

export class ExtensionManager {
  private extensions: Map<string, ExtensionInstance> = new Map();

  async init() {
    if (!existsSync(STORAGE_DIR)) {
      await mkdir(STORAGE_DIR, { recursive: true });
    }
    await this.loadAll();
    await this.cleanupOrphans();
  }

  async loadAll() {
    this.extensions.clear();
    if (!existsSync(CONFIG_FILE)) return;
    try {
      const data = JSON.parse(await readFile(CONFIG_FILE, 'utf-8'));
      const insts = data.extensions as ExtensionInstance[];
      // Batch all stat calls together for speed
      const checks = insts.map(async (inst) => {
        try {
          const s = await stat(inst.path);
          return s.isDirectory() ? inst : null;
        } catch { return null; }
      });
      const results = await Promise.all(checks);
      for (const inst of results) {
        if (inst) this.extensions.set(inst.id, inst);
      }
    } catch {
      // corrupted config — start fresh
    }
  }

  async save() {
    const list = Array.from(this.extensions.values());
    await mkdir(dirname(CONFIG_FILE), { recursive: true });
    await writeFile(CONFIG_FILE, JSON.stringify({ extensions: list }, null, 2), 'utf-8');
  }

  getAll(): ExtensionInstance[] {
    return Array.from(this.extensions.values());
  }

  get(id: string): ExtensionInstance | undefined {
    return this.extensions.get(id);
  }

  /** Find extensions that claim to handle a given file extension (e.g. ".heic") */
  getByFormat(ext: string): ExtensionInstance[] {
    return Array.from(this.extensions.values())
      .filter((e) => e.active && e.formats?.includes(ext.toLowerCase()))
      .sort((a, b) => (b.installedAt ?? 0) - (a.installedAt ?? 0));
  }

  /** Check if a new manifest conflicts with any installed extension */
  checkConflict(manifest: ExtensionManifest): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    if (manifest.formats) {
      for (const fmt of manifest.formats) {
        const lower = fmt.toLowerCase();
        const owner = Array.from(this.extensions.values()).find(
          (e) => e.active && e.formats?.includes(lower) && e.id !== manifest.id
        );
        if (owner) {
          conflicts.push({
            type: 'format',
            value: lower,
            existingExtensionId: owner.id,
            existingName: owner.name,
          });
        }
      }
    }

    if (manifest.type === 'feature' && manifest.ui.panel) {
      const panelOwner = Array.from(this.extensions.values()).find(
        (e) =>
          e.active &&
          e.type === 'feature' &&
          e.ui.panel === manifest.ui.panel &&
          e.id !== manifest.id
      );
      if (panelOwner) {
        conflicts.push({
          type: 'panel',
          value: manifest.ui.panel,
          existingExtensionId: panelOwner.id,
          existingName: panelOwner.name,
        });
      }
    }

    return conflicts;
  }

  /** Install an extension from a .dex file path or a directory */
  async install(sourcePath: string): Promise<InstallResult> {
    let extDir: string;
    let isTempDir = false;

    try {
      if (sourcePath.endsWith('.dex')) {
        extDir = await this.extractDex(sourcePath);
        isTempDir = true;
      } else if (existsSync(sourcePath)) {
        const destDir = join(STORAGE_DIR, basename(sourcePath));
        await this.copyDir(sourcePath, destDir);
        extDir = destDir;
      } else {
        return { success: false, error: '文件不存在' };
      }

      const manifestPath = join(extDir, 'manifest.json');
      if (!existsSync(manifestPath)) {
        return { success: false, error: '缺少 manifest.json' };
      }

      const manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) as ExtensionManifest;
      const id = manifest.id || `${manifest.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      manifest.id = id;

      const conflicts = this.checkConflict(manifest);
      if (conflicts.length > 0) {
        return { success: false, error: '扩展冲突', conflicts };
      }

      const instance: ExtensionInstance = {
        ...manifest,
        id,
        path: extDir,
        config: {},
        installedAt: Date.now(),
        active: true,
      };

      this.extensions.set(id, instance);
      await this.save();
      return { success: true, extension: instance };
    } catch (e: any) {
      return { success: false, error: e.message || '安装失败' };
    }
  }

  /** Extract .dex (zip format) to a temp directory */
  private async extractDex(zipPath: string): Promise<string> {
    const tmpDir = join(STORAGE_DIR, `_tmp_${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });

    // Try PowerShell Expand-Archive first (Windows built-in)
    try {
      await execFileAsync('powershell', [
        '-Command',
        `Expand-Archive -Path "${zipPath}" -DestinationPath "${tmpDir}" -Force`,
      ]);
      return tmpDir;
    } catch {
      // Fallback: tar
      try {
        await execFileAsync('tar', ['-xzf', zipPath, '-C', tmpDir]);
        return tmpDir;
      } catch {
        throw new Error('无法解压 .dex 文件，请确保系统已安装 tar 命令');
      }
    }
  }

  async scanDirectory(dirPath: string): Promise<string[]> {
    if (!existsSync(dirPath)) return [];
    const files: string[] = [];
    for (const entry of await readdir(dirPath)) {
      const full = join(dirPath, entry);
      const s = await stat(full);
      if (s.isDirectory()) {
        files.push(...await this.scanDirectory(full));
      } else if (entry.endsWith('.dex')) {
        files.push(full);
      }
    }
    return files;
  }

  /** Remove orphaned _tmp_* directories older than 1 hour that aren't referenced by installed extensions */
  private async cleanupOrphans() {
    try {
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      const knownPaths = new Set(Array.from(this.extensions.values()).map((e: any) => e.path));
      for (const entry of await readdir(STORAGE_DIR, { withFileTypes: true })) {
        if (!entry.isDirectory() || !entry.name.startsWith('_tmp_')) continue;
        const full = join(STORAGE_DIR, entry.name);
        if (knownPaths.has(full)) continue;
        try {
          const st = await stat(full);
          if (now - st.mtimeMs > ONE_HOUR) {
            await rm(full, { recursive: true, force: true });
          }
        } catch {}
      }
    } catch {}
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    const ext = this.extensions.get(id);
    if (!ext) return { success: false, error: '扩展不存在' };
    try {
      await rm(ext.path, { recursive: true, force: true });
      this.extensions.delete(id);
      await this.save();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateConfig(id: string, config: Record<string, unknown>): Promise<{ success: boolean }> {
    const ext = this.extensions.get(id);
    if (!ext) return { success: false };
    ext.config = { ...ext.config, ...config };
    await this.save();
    return { success: true };
  }

  private async copyDir(src: string, dst: string) {
    await mkdir(dst, { recursive: true });
    for (const entry of await readdir(src, { withFileTypes: true })) {
      const srcPath = join(src, entry.name);
      const dstPath = join(dst, entry.name);
      if (entry.isDirectory()) {
        await this.copyDir(srcPath, dstPath);
      } else {
        const data = await readFile(srcPath);
        await writeFile(dstPath, data);
      }
    }
  }
}
