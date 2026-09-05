// ─── Windows Registry helpers for file association ────────────────────────────
// Writes to HKCU (current user only, no admin required).
// Runs asynchronously so it never blocks the main thread.
import { execFile } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(execFile);

const EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.apng', '.svg',
  '.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv',
  '.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac',
  '.txt', '.md', '.json', '.xml', '.html', '.htm', '.css',
  '.js', '.ts', '.py', '.java', '.c', '.cpp', '.h', '.rs',
  '.go', '.rb', '.sh', '.bat', '.ini', '.yaml', '.yml',
  '.toml', '.csv', '.log', '.sql', '.glb', '.gltf', '.obj',
  '.heic', '.heif', '.qmc0', '.qmcflac', '.qmcogg',
];

export async function registerFileAssociations(): Promise<{ success: boolean; error?: string }> {
  try {
    const exePath = process.execPath;
    const exeName = 'Omniview';
    const cmds: string[] = [];

    for (const ext of EXTENSIONS) {
      const progId = `Omniview${ext.replace('.', '').toUpperCase()}`;
      // Set default ProgID for the extension
      cmds.push(`reg add "HKCU\\Software\\Classes\\${ext}" /ve /d "${progId}" /f`);
      // Create ProgID entry with open command
      cmds.push(`reg add "HKCU\\Software\\Classes\\${progId}" /ve /d "Omniview ${ext} File" /f`);
      cmds.push(`reg add "HKCU\\Software\\Classes\\${progId}\\shell" /f`);
      cmds.push(`reg add "HKCU\\Software\\Classes\\${progId}\\shell\\open" /f`);
      cmds.push(`reg add "HKCU\\Software\\Classes\\${progId}\\shell\\open\\command" /ve /d "\"${exePath}\" \"%1\"" /f`);
      // Register as OpenWith handler
      cmds.push(`reg add "HKCU\\Software\\Classes\\${ext}\\OpenWithProgids" /v "${progId}" /d "" /f`);
      // Set as default program for Open With
      cmds.push(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\${ext}\\UserChoice" /v "ProgId" /d "${progId}" /f`);
    }

    // Merge all commands into one PowerShell call for speed
    const mergedCmd = cmds.join(' & ');
    await execAsync('powershell', ['-Command', mergedCmd], { timeout: 15000 });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function isAssociationRegistered(ext: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync('reg', ['query', `HKCU\\Software\\Classes\\${ext}`, '/ve'], { timeout: 3000 });
    return stdout.includes('Omniview');
  } catch {
    return false;
  }
}
