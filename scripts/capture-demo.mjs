import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:4174/everything-audio-looper/';
const output = process.argv[3] ?? 'docs/demo.png';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  serviceWorkers: 'block'
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Demo' }).click();
await page.getByText(/Demo kit ready/i).waitFor();
await page.screenshot({ path: output, fullPage: true });
await browser.close();
