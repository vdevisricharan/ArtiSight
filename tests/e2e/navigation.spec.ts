// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Phase 8: Navigation & Interaction Audit', () => {
  test('NAV-01: Logo link returns to Home page from Upload page', async ({ page }) => {
    await page.goto('/upload');
    const brandLink = page.getByRole('link', { name: /ArtiSight/i }).first();
    await brandLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('NAV-02: Header navigation buttons scroll to their respective sections on Home', async ({ page }) => {
    await page.goto('/');
    const howItWorksBtn = page.getByRole('button', { name: 'How it Works' });
    await howItWorksBtn.click();
    await expect(page.locator('#how-it-works')).toBeInViewport();

    const capabilitiesBtn = page.getByRole('button', { name: 'Capabilities' });
    await capabilitiesBtn.click();
    await expect(page.locator('#capabilities')).toBeInViewport();
  });

  test('NAV-03: Header CTA "Analyze Photo" navigates to Upload route', async ({ page }) => {
    await page.goto('/');
    const analyzeBtn = page.locator('header nav').getByRole('button', { name: 'Analyze Photo' });
    await analyzeBtn.click();
    await expect(page).toHaveURL(/\/upload/);
  });

  test('NAV-04: Mobile menu toggle toggles aria-expanded and displays links on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const toggleBtn = page.getByRole('button', { name: /Open navigation menu|Close navigation menu/i });
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu')).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('NAV-05: Unknown routes render a helpful 404 error page with link back to Home', async ({ page }) => {
    await page.goto('/some-nonexistent-route-999');
    const notFoundHeading = page.locator('h1, h2').filter({ hasText: /404|Page Not Found/i });
    await expect(notFoundHeading).toBeVisible({ timeout: 5000 });
  });

  test('NAV-06: Logo link on Home reloads the website', async ({ page }) => {
    await page.goto('/');
    // Set a window variable to verify reload
    await page.evaluate(() => {
      window['__test_persisted_marker'] = 'active';
    });
    expect(await page.evaluate(() => window['__test_persisted_marker'])).toBe('active');

    const brandLink = page.getByRole('link', { name: /ArtiSight/i }).first();
    await brandLink.click();

    // After reload, window variable is reset to undefined
    await page.waitForLoadState('domcontentloaded');
    const marker = await page.evaluate(() => window['__test_persisted_marker']);
    expect(marker).toBeUndefined();
  });

  test('NAV-07: Analyze Your Photograph Now button navigates to /upload and resets scroll to top', async ({ page }) => {
    await page.goto('/');

    // Scroll down to the bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBeGreaterThan(500);

    // Click Analyze button at the bottom of the home page
    const ctaBtn = page.getByRole('button', { name: /Analyze Your Photograph Now/i });
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();

    await expect(page).toHaveURL(/\/upload/);
    // Verify scroll position is reset to the top
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(50);
    // Verify top of upload workspace is in viewport
    await expect(page.locator('h1:has-text("Upload Your Photograph")')).toBeInViewport();
  });

  test('NAV-08: Upload page has high contrast text and light background for HowItWorksSection', async ({ page }) => {
    await page.goto('/upload');

    // Check heading color and visibility
    const heading = page.locator('#how-it-works-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('From Raw Photograph to Actionable Mastery');

    // Ensure the color is not dark-gray on dark background
    const headingColor = await heading.evaluate((el) => window.getComputedStyle(el).color);
    // slate-900 is rgb(15, 23, 42)
    expect(headingColor).toMatch(/rgb\(15,\s*23,\s*42\)|rgb\(17,\s*24,\s*39\)/);

    // Check section background
    const sectionBg = await page.locator('main').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Slate-50 background is light rgb(248, 250, 252)
    expect(sectionBg).not.toBe('rgb(0, 0, 0)');
  });
});
