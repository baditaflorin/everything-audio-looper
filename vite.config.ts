import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

function readGitCommit() {
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

const base = process.env.VITE_APP_BASE ?? '/everything-audio-looper/';
const builtAt = new Date().toISOString();
const commit = process.env.VITE_GIT_COMMIT ?? readGitCommit();
const version = process.env.VITE_APP_VERSION ?? pkg.version;

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      base,
      scope: base,
      registerType: 'autoUpdate',
      includeAssets: ['version.json'],
      manifest: {
        id: base,
        name: 'Everything Audio Looper',
        short_name: 'Audio Looper',
        description: 'Record everyday sounds and turn them into a synced browser drum kit.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#10141f',
        theme_color: '#1f2937',
        icons: [
          {
            src: `${base}pwa-icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wasm}'],
        navigateFallback: `${base}index.html`
      }
    })
  ],
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react') || id.includes('/node_modules/react-dom')) {
            return 'react';
          }

          if (id.includes('/node_modules/@tanstack/react-query')) {
            return 'query';
          }

          return undefined;
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __GIT_COMMIT__: JSON.stringify(commit),
    __BUILT_AT__: JSON.stringify(builtAt),
    __REPOSITORY_URL__: JSON.stringify('https://github.com/baditaflorin/everything-audio-looper'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita')
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});
