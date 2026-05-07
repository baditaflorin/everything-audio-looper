import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function gitCommit() {
  try {
    const log = execSync('git log -n 30 --format=%h%x00%s', { encoding: 'utf8' }).trim();
    const sourceLine = log.split('\n').find((line) => !line.endsWith('chore: publish pages build'));
    return (
      sourceLine?.split('\0')[0] ??
      execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    );
  } catch {
    return 'local';
  }
}

const manifest = {
  schemaVersion: 1,
  version: process.env.VITE_APP_VERSION ?? pkg.version,
  commit: process.env.VITE_GIT_COMMIT ?? gitCommit(),
  builtAt: process.env.VITE_BUILT_AT ?? new Date().toISOString(),
  repositoryUrl: 'https://github.com/baditaflorin/everything-audio-looper',
  paypalUrl: 'https://www.paypal.com/paypalme/florinbadita'
};

const docsDir = new URL('../docs/', import.meta.url);
mkdirSync(docsDir, { recursive: true });
writeFileSync(new URL('version.json', docsDir), `${JSON.stringify(manifest, null, 2)}\n`);
