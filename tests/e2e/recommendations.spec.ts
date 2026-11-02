// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mockCritique = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/mock-critique.json'), 'utf8'));

async function loadMockCritiqueSession(page) {
  await page.goto('/upload');
  await page.evaluate((data) => {
    sessionStorage.setItem('artisight_analysis_result', JSON.stringify(data));
    sessionStorage.setItem('artisight_image_preview', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%23334155"/></svg>');
  }, mockCritique);
  await page.goto('/feedback');
}

test.describe('Phase 6: Learning Recommendations UX', () => {
  test.beforeEach(async ({ page }) => {
    await loadMockCritiqueSession(page);
  });

  test('REC-01: Practice assignments present actionable shooting exercises and target skill outcomes', async ({ page }) => {
    await expect(page.locator('text=Personalized Practice Assignments')).toBeVisible();

    // Problem 1
    await expect(page.locator('text=Aggressive shadow falloff on the unlit side')).toBeVisible();
    await expect(page.locator('text=Evidence:').first()).toBeVisible();
    await expect(page.locator('text=Recommended Adjustment:').first()).toBeVisible();
    await expect(page.locator('text=Shooting Assignment:').first()).toBeVisible();
    await expect(page.locator('text=Shoot 5 portraits placing a reflector at 45 degrees')).toBeVisible();
    await expect(page.locator('text=Target Skill Outcome:').first()).toBeVisible();

    // Problem 2
    await expect(page.locator('text=Marginal eye sharpness due to 1/60s shutter speed handheld')).toBeVisible();
    await expect(page.locator('text=Perform a test burst at 1/125s, 1/250s, and 1/500s')).toBeVisible();
  });

  test('REC-02: Learning topic badges categorize exercises clearly', async ({ page }) => {
    await expect(page.locator('text=Portrait Lighting').first()).toBeVisible();
    await expect(page.locator('text=Shutter Speed & Sharpness').first()).toBeVisible();
  });

  test('REC-03: Educational guide cards have valid links, domain labels, and open in new tab', async ({ page }) => {
    await expect(page.locator('text=Curated Educational Resources')).toBeVisible();

    const guide1 = page.locator('a[href*="digital-photography-school.com"]');
    await expect(guide1).toBeVisible();
    await expect(guide1).toHaveAttribute('target', '_blank');
    await expect(guide1).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(guide1.locator('text=digital-photography-school.com')).toBeVisible();
    await expect(guide1.locator('text=Read Guide')).toBeVisible();

    const guide2 = page.locator('a[href*="photographylife.com"]');
    await expect(guide2).toBeVisible();
    await expect(guide2).toHaveAttribute('target', '_blank');
    await expect(guide2).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('REC-04: Visual validation screenshots of improved sections', async ({ page }) => {
    const practiceSection = page.locator('text=Personalized Practice Assignments').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")]').first();
    await expect(practiceSection).toBeVisible();
    await practiceSection.screenshot({ path: 'test-results/improved-practice-assignments.png' });

    const resourcesSection = page.locator('text=Curated Educational Resources').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")]').first();
    await expect(resourcesSection).toBeVisible();
    await resourcesSection.screenshot({ path: 'test-results/improved-curated-resources.png' });
  });
});
