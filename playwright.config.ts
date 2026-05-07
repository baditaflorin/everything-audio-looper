import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4174);
const basePath = '/everything-audio-looper/';
const localBaseUrl = `http://127.0.0.1:${port}${basePath}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl,
    serviceWorkers: 'block',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `node scripts/serve-static.mjs docs ${port} ${basePath}`,
        url: localBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 20_000
      }
});
