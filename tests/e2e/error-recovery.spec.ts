// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, '../fixtures/sample-images');

test.describe('Phase 10: Error Handling & Recovery UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('ERR-01: Simulated network failure displays constructive message and preserves photo for retry', async ({ page }) => {
    // Intercept and abort with network error
    await page.route('**/api/v2/analyze', async (route) => {
      await route.abort('failed');
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    const analyzeBtn = page.getByRole('button', { name: /Analyze with ArtiSight/i });
    await analyzeBtn.click();

    // Error alert should be visible
    const alert = page.locator('div:has-text("Upload Notice")').last();
    await expect(alert).toBeVisible({ timeout: 5000 });

    // The image preview should still be preserved
    await expect(page.locator('img[alt="Selected preview"]')).toBeVisible();

    // The Analyze button should be active for easy retry
    await expect(page.getByRole('button', { name: /Analyze with ArtiSight/i })).toBeVisible();
  });

  test('ERR-02: Backend HTTP 500 error is handled gracefully with error message', async ({ page }) => {
    await page.route('**/api/v2/analyze', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI critique engine temporarily unavailable. Please retry in a few moments.' }),
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    await page.getByRole('button', { name: /Analyze with ArtiSight/i }).click();

    const alert = page.locator('div:has-text("Upload Notice")').last();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('AI critique engine temporarily unavailable');
  });

  test('ERR-03: Malformed server response does not crash the UI', async ({ page }) => {
    await page.route('**/api/v2/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"invalid": true}', // missing summary
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    await page.getByRole('button', { name: /Analyze with ArtiSight/i }).click();

    const alert = page.locator('div:has-text("Upload Notice")').last();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('invalid analysis format');
  });

  test('ERR-04: Error notification can be dismissed via close button', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'unsupported-doc.txt'));

    const alert = page.locator('div:has-text("Upload Notice")').last();
    await expect(alert).toBeVisible();

    // Click close X button
    const closeBtn = page.getByRole('button', { name: 'Dismiss error notification' });
    await closeBtn.click();
    await expect(alert).not.toBeVisible();
  });
});
