const { test, expect } = require('@playwright/test');

test('page title contains Example', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});