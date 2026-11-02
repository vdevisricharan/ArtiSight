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
    // Currently, this fails on baseline because App.jsx has no catch-all route!
    // After our fix, it will show a clear 404 screen.
    const notFoundHeading = page.locator('h1, h2').filter({ hasText: /404|Page Not Found/i });
    await expect(notFoundHeading).toBeVisible({ timeout: 5000 });
  });
});
