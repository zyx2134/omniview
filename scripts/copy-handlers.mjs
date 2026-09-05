import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const handlersSrc = join(root, 'src', 'renderer', 'handlers');
const handlersDst = join(root, 'dist', 'renderer', 'handlers');
mkdirSync(handlersDst, { recursive: true });

for (const f of ['image.html', 'video.html', 'audio.html', 'text.html', 'pdf-chart.html', 'default.html']) {
  const src = join(handlersSrc, f);
  const dst = join(handlersDst, f);
  copyFileSync(src, dst);
  console.log(`  ✓ ${f}`);
}
console.log('Handlers copied to dist/renderer/handlers/');
