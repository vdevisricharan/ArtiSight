// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mockCritique = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/mock-critique.json'), 'utf8'));

// Helper to pre-populate Redux / sessionStorage with mock critique
async function loadMockCritiqueSession(page) {
  await page.goto('/upload');
  await page.evaluate((data) => {
    sessionStorage.setItem('artisight_analysis_result', JSON.stringify(data));
    sessionStorage.setItem('artisight_image_preview', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%23334155"/></svg>');
  }, mockCritique);
  await page.goto('/feedback');
}

test.describe('Phase 4 & 5: Photography Critique Dashboard & Visual Interactions', () => {
  test('CRIT-01: Empty state shows clear recovery instructions when no critique is active', async ({ page }) => {
    await page.goto('/feedback');
    // Clear storage to ensure empty state
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    await expect(page.locator('text=No Active Photo Critique')).toBeVisible();
    const newCritiqueBtn = page.getByRole('link', { name: 'Start New Critique' });
    await expect(newCritiqueBtn).toBeVisible();
    await newCritiqueBtn.click();
    await expect(page).toHaveURL(/\/upload/);
  });

  test('CRIT-02: Information hierarchy: Overall score, title, and visual observations', async ({ page }) => {
    await loadMockCritiqueSession(page);

    // Title
    await expect(page.locator('h1')).toContainText('Subtle Natural Light Portrait');

    // Overall Score
    await expect(page.locator('text=8.2')).toBeVisible();
    await expect(page.locator('text=/10')).toBeVisible();

    // Visual observations
    await expect(page.locator('text=Subject is framed slightly off-center')).toBeVisible();
  });

  test('CRIT-03: Rubric dimension breakdown displays all 5 category scores with progress bars', async ({ page }) => {
    await loadMockCritiqueSession(page);

    await expect(page.locator('text=Composition')).toBeVisible();
    await expect(page.locator('text=8.5 / 10')).toBeVisible();

    await expect(page.locator('text=Lighting & Exposure')).toBeVisible();
    await expect(page.locator('text=8 / 10').first()).toBeVisible();

    await expect(page.locator('text=Focus & Clarity')).toBeVisible();
    await expect(page.locator('text=7.5 / 10')).toBeVisible();

    await expect(page.locator('text=Color & Harmony')).toBeVisible();
    await expect(page.locator('text=9 / 10')).toBeVisible();

    await expect(page.locator('text=Story & Narrative')).toBeVisible();
  });

  test('CRIT-04: Category rationale accordion expands and collapses', async ({ page }) => {
    await loadMockCritiqueSession(page);

    const compSection = page.locator('[data-testid="dimension-composition"]');
    await compSection.click();

    // Rationale text should expand
    await expect(page.locator('text=Strong rule-of-thirds alignment with eye level')).toBeVisible();
  });

  test('CRIT-05: Strengths and Growth Areas cards visually categorize feedback', async ({ page }) => {
    await loadMockCritiqueSession(page);

    await expect(page.locator('text=Core Strengths')).toBeVisible();
    await expect(page.locator('text=Strong subject-to-background separation')).toBeVisible();

    await expect(page.locator('text=Growth Areas')).toBeVisible();
    await expect(page.locator('text=Deep shadow clipping on camera-right cheekbone')).toBeVisible();
  });

  test('CRIT-06: Interactive composition overlays toggle accurately', async ({ page }) => {
    await loadMockCritiqueSession(page);

    // Default guide is Rule of Thirds
    await expect(page.locator('text=Guide: Rule of Thirds')).toBeVisible();

    // Toggle to Phi Ratio
    await page.getByRole('button', { name: 'Phi Ratio' }).click();
    await expect(page.locator('text=Guide: Phi / Golden Ratio')).toBeVisible();

    // Toggle to Center
    await page.getByRole('button', { name: 'Center' }).click();
    await expect(page.locator('text=Guide: Center Axis')).toBeVisible();

    // Toggle to Diagonals
    await page.getByRole('button', { name: 'Diagonals' }).click();
    await expect(page.locator('text=Guide: Diagonals')).toBeVisible();

    // Toggle to Clean
    await page.getByRole('button', { name: 'Clean' }).click();
    await expect(page.locator('text=Guide: Clean')).toBeVisible();
  });

  test('CRIT-07: OpenCV technical metrics: 32-bin histogram and clipping gauges render', async ({ page }) => {
    await loadMockCritiqueSession(page);

    await expect(page.locator('text=OpenCV Technical Signals')).toBeVisible();
    await expect(page.locator('text=32-Bin Exposure Luminance Histogram')).toBeVisible();
    await expect(page.locator('text=342.8')).toBeVisible(); // Sharpness index
    await expect(page.locator('text=1.2%')).toBeVisible(); // Highlight clipping
    await expect(page.locator('text=3.8%')).toBeVisible(); // Shadow clipping
  });

  test('CRIT-08: Camera EXIF metadata is formatted clearly', async ({ page }) => {
    await loadMockCritiqueSession(page);

    await expect(page.locator('text=Capture & Camera Metadata')).toBeVisible();
    await expect(page.locator('text=Sony ILCE-7M4')).toBeVisible();
    await expect(page.locator('text=FE 50mm F1.2 GM')).toBeVisible();
    await expect(page.locator('text=f/1.8')).toBeVisible();
    await expect(page.locator('text=1/160 s')).toBeVisible();
    await expect(page.locator('text=200')).toBeVisible();
  });

  test('CRIT-09: Copy Report copies markdown to clipboard and confirms state', async ({ page }) => {
    await loadMockCritiqueSession(page);

    await page.evaluate(() => {
      window.navigator.clipboard.writeText = () => Promise.resolve();
    });

    const copyBtn = page.getByRole('button', { name: /Copy Report/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  });

  test('CRIT-10: New Photo button resets state and navigates back to upload', async ({ page }) => {
    await loadMockCritiqueSession(page);

    const newPhotoBtn = page.getByRole('button', { name: /New Photo/i });
    await newPhotoBtn.click();
    await expect(page).toHaveURL(/\/upload/);
  });
});
