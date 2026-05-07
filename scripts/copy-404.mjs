import { copyFileSync, existsSync } from 'node:fs';

const index = new URL('../docs/index.html', import.meta.url);
const fallback = new URL('../docs/404.html', import.meta.url);

if (!existsSync(index)) {
  throw new Error('docs/index.html does not exist after build.');
}

copyFileSync(index, fallback);
