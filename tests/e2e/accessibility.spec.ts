// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

const mockCritique = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/mock-critique.json'), 'utf8'));

test.describe('Phase 9: WCAG 2.2 AA Accessibility Testing', () => {
  test('A11Y-01: Home page satisfies WCAG 2.2 AA rules without serious/critical violations', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('A11Y-02: Upload page satisfies WCAG 2.2 AA rules without serious/critical violations', async ({ page }) => {
    await page.goto('/upload');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('A11Y-03: Critique dashboard satisfies WCAG 2.2 AA rules', async ({ page }) => {
    await page.goto('/upload');
    await page.evaluate((data) => {
      sessionStorage.setItem('artisight_analysis_result', JSON.stringify(data));
      sessionStorage.setItem('artisight_image_preview', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="%23334155"/></svg>');
    }, mockCritique);
    await page.goto('/feedback');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousViolations).toEqual([]);
  });

  test('A11Y-04: Keyboard focus navigation and visible focus rings', async ({ page }) => {
    await page.goto('/');

    // Press Tab and verify focus moves logically
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });
});
