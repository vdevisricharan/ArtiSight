// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Phase 1: First Impression & Landing Page UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('LAND-01: First 5 seconds comprehension — headline, subheadline, and primary CTA are clear', async ({ page }) => {
    // 1. Primary branding is visible
    const brand = page.locator('text=ArtiSight');
    await expect(brand.first()).toBeVisible();

    // 2. Primary value proposition is communicated immediately
    const headline = page.locator('h1#hero-heading');
    await expect(headline).toBeVisible();
    await expect(headline).toContainText('Master Photography Through Explainable AI Feedback');

    // 3. Supporting copy answers what ArtiSight does and its benefits
    const subtext = page.locator('text=Transform raw photographs into structured rubric scores');
    await expect(subtext).toBeVisible();

    // 4. Primary CTA is explicit and action-oriented
    const primaryCta = page.getByRole('button', { name: /Start Free Photo Critique/i });
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toBeEnabled();

    // 5. Trust and free indicators are visible
    const badge = page.locator('text=ArtiSight 2.0 • Multimodal AI & Computer Vision Critique');
    await expect(badge).toBeVisible();
  });

  test('LAND-02: Hero section metrics highlights display key capabilities', async ({ page }) => {
    const heroSection = page.locator('section[aria-labelledby="hero-heading"]');
    await expect(heroSection.getByText('6 Rubric Dimensions', { exact: true })).toBeVisible();
    await expect(heroSection.getByText('Deterministic CV', { exact: true })).toBeVisible();
    await expect(heroSection.getByText('Targeted Practice', { exact: true })).toBeVisible();
  });

  test('LAND-03: Primary CTA navigates user directly to upload workspace', async ({ page }) => {
    const primaryCta = page.getByRole('button', { name: /Start Free Photo Critique/i });
    await primaryCta.click();
    await expect(page).toHaveURL(/\/upload/);
    await expect(page.locator('h1')).toContainText('Upload Your Photograph');
  });

  test('LAND-04: How It Works section presents the 3-step learning journey', async ({ page }) => {
    const howItWorks = page.locator('#how-it-works');
    await expect(howItWorks).toBeVisible();
    await expect(howItWorks.locator('text=1. Upload Photograph')).toBeVisible();
    await expect(howItWorks.locator('text=2. Multimodal AI & CV Analysis')).toBeVisible();
    await expect(howItWorks.locator('text=3. Actionable Growth Path')).toBeVisible();
  });

  test('LAND-05: Interactive Workflow visualizer allows step selection and updates preview', async ({ page }) => {
    const exampleSection = page.locator('#examples');
    await expect(exampleSection).toBeVisible();

    // Step 2 selection
    const step2Button = exampleSection.locator('text=2. Review Structured Critique').first();
    await step2Button.click();
    await expect(exampleSection.locator('text=Step 2: 2. Review Structured Critique')).toBeVisible();

    // Step 3 selection
    const step3Button = exampleSection.locator('text=3. Practice Hands-On Exercises').first();
    await step3Button.click();
    await expect(exampleSection.locator('text=Step 3: 3. Practice Hands-On Exercises')).toBeVisible();
  });

  test('LAND-06: Capabilities section explains the 6 classical photographic principles', async ({ page }) => {
    const capabilities = page.locator('#capabilities');
    await expect(capabilities).toBeVisible();
    await expect(capabilities.locator('text=Composition Analysis')).toBeVisible();
    await expect(capabilities.locator('text=Lighting & Exposure')).toBeVisible();
    await expect(capabilities.locator('text=Technical Clarity & Focus')).toBeVisible();
    await expect(capabilities.locator('text=Color Harmony & Tones')).toBeVisible();
    await expect(capabilities.locator('text=Personalized Practice Assignments')).toBeVisible();
    await expect(capabilities.locator('text=Privacy-First Architecture')).toBeVisible();
  });

  test('LAND-07: Footer provides verifiable repository, case study, and privacy details', async ({ page }) => {
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();
    await expect(footer.locator('text=GitHub Repository')).toHaveAttribute('href', /github\.com/);
    await expect(footer.locator('text=Portfolio Case Study')).toHaveAttribute('href', /netlify\.app/);
    await expect(footer.locator('text=Technical Privacy')).toBeVisible();
  });
});
