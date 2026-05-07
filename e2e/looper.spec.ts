import { expect, test } from '@playwright/test';

test('demo kit creates pads, version, repository, and paypal links', async ({ page }) => {
  await page.goto('/everything-audio-looper/');

  await expect(page.getByRole('heading', { name: /turn room sounds/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /star on github/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/everything-audio-looper'
  );
  await expect(page.getByRole('link', { name: 'PayPal', exact: true })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita'
  );

  await page.getByRole('button', { name: 'Demo' }).click();
  await expect(page.getByText(/Demo kit ready/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Play loop/i })).toBeEnabled();
  await expect(page.getByText(/Version 0\.1\.0/i)).toBeVisible();
  await expect(page.getByText(/Commit/i)).toBeVisible();

  await page.getByTitle('Play Kick').click();
  await page.getByRole('button', { name: /Play loop/i }).click();
  await expect(page.getByRole('button', { name: /Stop loop/i })).toBeVisible();
  await page.getByRole('button', { name: /Stop loop/i }).click();
});
