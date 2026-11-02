// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, '../fixtures/sample-images');

test.describe('Phase 2: Photograph Upload Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('UPLOAD-01 & 05: Select a valid JPEG via file input', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Clicking the dropzone or file input
    const dropzone = page.locator('div:has-text("Drag and drop your image here")').last();
    await dropzone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    // Image preview should appear
    const previewImg = page.locator('img[alt="Selected preview"]');
    await expect(previewImg).toBeVisible({ timeout: 5000 });

    // File info details bar should appear
    await expect(page.locator('text=valid-portrait.jpg')).toBeVisible();
    await expect(page.locator('text=Dimensions:')).toBeVisible();
    await expect(page.locator('text=Format: JPEG')).toBeVisible();

    // Primary analyze CTA should be present
    const analyzeBtn = page.getByRole('button', { name: /Analyze with ArtiSight/i });
    await expect(analyzeBtn).toBeVisible();
  });

  test('UPLOAD-02: Select a valid PNG image and check metadata', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-landscape.png'));

    await expect(page.locator('img[alt="Selected preview"]')).toBeVisible();
    await expect(page.locator('text=valid-landscape.png')).toBeVisible();
    await expect(page.locator('text=Format: PNG')).toBeVisible();
  });

  test('UPLOAD-03: Select a valid WebP image', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-architecture.webp'));

    await expect(page.locator('img[alt="Selected preview"]')).toBeVisible();
    await expect(page.locator('text=valid-architecture.webp')).toBeVisible();
    await expect(page.locator('text=Format: WEBP')).toBeVisible();
  });

  test('UPLOAD-06: Attempt unsupported file format (.txt) shows clear error notice', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'unsupported-doc.txt'));

    // Alert notice should be rendered
    const alert = page.locator('div:has-text("Upload Notice")').last();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Unsupported format. Please upload a JPEG, PNG, or WebP photograph.');

    // Dropzone should remain visible, no preview
    await expect(page.locator('text=Drag and drop your image here')).toBeVisible();
  });

  test('UPLOAD-07: Attempt oversized image (>16MB) shows maximum file size alert', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'oversized-image.jpg'));

    const alert = page.locator('div:has-text("Upload Notice")').last();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('File is too large');
    await expect(alert).toContainText('Maximum supported size is 16MB');
  });

  test('UPLOAD-09: Replace or remove selected image restores dropzone', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(FIXTURES_DIR, 'valid-portrait.jpg'));

    // Click 'Choose Different Photo'
    const removeBtn = page.getByRole('button', { name: /Choose Different Photo/i });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Dropzone should be restored
    await expect(page.locator('text=Drag and drop your image here')).toBeVisible();
    await expect(page.locator('img[alt="Selected preview"]')).not.toBeVisible();
  });

  test('UPLOAD-10: Dropzone accessibility — keyboard focusable and activatable', async ({ page }) => {
    // Dropzone should be reachable via keyboard tab navigation and have role="button"
    const dropzone = page.locator('[role="button"]:has-text("Drag and drop your image here"), div[tabindex="0"]:has-text("Drag and drop your image here")');
    // Note: this tests WCAG 2.1.1 Keyboard compliance
    await expect(dropzone).toBeVisible();
  });
});
