// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mockCritique = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/mock-critique.json'), 'utf8'));

const VIEWPORTS = [
  { name: 'Small mobile (320x568)', width: 320, height: 568 },
  { name: 'Standard mobile (375x667)', width: 375, height: 667 },
  { name: 'Modern mobile (390x844)', width: 390, height: 844 },
  { name: 'Large mobile (430x932)', width: 430, height: 932 },
  { name: 'Tablet portrait (768x1024)', width: 768, height: 1024 },
  { name: 'Tablet landscape (1024x768)', width: 1024, height: 768 },
  { name: 'Laptop (1366x768)', width: 1366, height: 768 },
  { name: 'Desktop (1440x900)', width: 1440, height: 900 },
  { name: 'Large desktop (1920x1080)', width: 1920, height: 1080 },
];

test.describe('Phase 7: Mobile-First Responsive Testing Matrix', () => {
  for (const vp of VIEWPORTS) {
    test(`RESP-01: No horizontal overflow on Home at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(isOverflowing).toBe(false);
    });

    test(`RESP-02: No horizontal overflow on Upload at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/upload');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(isOverflowing).toBe(false);
    });
  }

  test('RESP-03: Hero metric cards do not clip text on 320px small mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    const columnsOverflow = await page.evaluate(() => {
      const grids = document.querySelectorAll('.grid-cols-3');
      const el = grids[1]; // metric highlights container
      if (!el) return false;
      const cols = Array.from(el.children);
      return cols.some(c => c.scrollWidth > c.clientWidth);
    });

    // After fix, columns stack or have sufficient width so they do not clip
    expect(columnsOverflow).toBe(false);
  });

  test('RESP-04: Feedback dashboard reflows into single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/upload');
    await page.evaluate((data) => {
      sessionStorage.setItem('artisight_analysis_result', JSON.stringify(data));
      sessionStorage.setItem('artisight_image_preview', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%23334155"/></svg>');
    }, mockCritique);
    await page.goto('/feedback');

    // Verify both left-side components (overlay toolbar, histogram) and right-side components are visible and scrollable
    await expect(page.locator('text=OpenCV Technical Signals')).toBeVisible();
    await expect(page.locator('text=Personalized Practice Assignments')).toBeVisible();

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);
  });
});
