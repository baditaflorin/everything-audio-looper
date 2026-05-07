import { existsSync, readFileSync, statSync } from 'node:fs';

const required = ['../docs/index.html', '../docs/404.html', '../docs/version.json'];

for (const file of required) {
  const target = new URL(file, import.meta.url);
  if (!existsSync(target)) {
    throw new Error(`${file} is missing.`);
  }
}

const html = readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8');
if (!html.includes('/everything-audio-looper/assets/')) {
  throw new Error('Built index.html does not reference the GitHub Pages base asset path.');
}

const assets = new URL('../docs/assets/', import.meta.url);
if (!existsSync(assets) || !statSync(assets).isDirectory()) {
  throw new Error('docs/assets/ is missing.');
}

const version = JSON.parse(readFileSync(new URL('../docs/version.json', import.meta.url), 'utf8'));
if (version.schemaVersion !== 1 || !version.version || !version.commit) {
  throw new Error('docs/version.json is invalid.');
}

console.log(`Pages build ready: version ${version.version}, commit ${version.commit}`);
