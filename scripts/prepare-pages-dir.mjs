import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const docsDir = new URL('../docs/', import.meta.url);
const removable = [
  'index.html',
  '404.html',
  'manifest.webmanifest',
  'sw.js',
  'sw.js.map',
  'version.json',
  'pwa-icon.svg'
];

for (const file of removable) {
  const target = new URL(file, docsDir);
  if (existsSync(target)) {
    rmSync(target);
  }
}

const assetsDir = new URL('assets/', docsDir);
if (existsSync(assetsDir)) {
  rmSync(assetsDir, { recursive: true, force: true });
}

for (const entry of existsSync(docsDir) ? readdirSync(docsDir) : []) {
  if (/^workbox-.*\.js(\.map)?$/.test(entry)) {
    rmSync(join(docsDir.pathname, entry), { force: true });
  }
}
