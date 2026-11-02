// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const FIXTURES_DIR = path.join(__dirname, '../fixtures/sample-images');
const mockCritique = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/mock-critique.json'), 'utf8'));

test.describe('Phase 3: AI Analysis Loading Experience', () => {
  test('AN-01: Processing phase transitions and loading state verification', async ({ page }) => {
    // Intercept /api/v2/analyze to simulate controlled delay
    let resolveRequest;
    const requestHold = new Promise(resolve => { resolveRequest = resolve; });

    await page.route('**/api/v2/analyze', async (route) => {
      await requestHold;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCritique),
      });
    });

    await page.goto('/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    const analyzeBtn = page.getByRole('button', { name: /Analyze with ArtiSight/i });
    await analyzeBtn.click();

    // 1. Loading indicators are visible immediately
    const processingSection = page.locator('text=Multimodal AI evaluation in progress');
    await expect(processingSection).toBeVisible({ timeout: 5000 });

    // 2. Action buttons are disabled or removed during analysis to prevent double submission
    await expect(page.getByRole('button', { name: /Analyze with ArtiSight/i })).not.toBeVisible();

    // 3. Cancel button is present
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await expect(cancelBtn).toBeVisible();

    // Release mock request
    resolveRequest();

    // 4. Upon completion, navigates to /feedback
    await expect(page).toHaveURL(/\/feedback/, { timeout: 10000 });
  });

  test('AN-02: Cancelling an in-flight analysis aborts the request and resets state', async ({ page }) => {
    await page.route('**/api/v2/analyze', async () => {
      // Hold in-flight
    });

    await page.goto('/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    const analyzeBtn = page.getByRole('button', { name: /Analyze with ArtiSight/i });
    await analyzeBtn.click();

    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Processing indicator should disappear
    await expect(page.locator('text=Multimodal AI evaluation in progress')).not.toBeVisible();

    // Image preview and Analyze button should be restored
    await expect(page.getByRole('button', { name: /Analyze with ArtiSight/i })).toBeVisible();
  });
});
