// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Search Engine Optimization (SEO) & Social Meta Testing', () => {
  test('SEO-01: Root document contains essential search engine meta tags and canonical link', async ({ page }) => {
    await page.goto('/');

    // 1. Page title
    await expect(page).toHaveTitle(/ArtiSight/);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);

    // 2. Meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /photography|critique|AI/i);
    const descriptionContent = await metaDescription.getAttribute('content');
    expect(descriptionContent?.length).toBeGreaterThan(50);

    // 3. Keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute('content', /photography/i);

    // 4. Meta robots
    const metaRobots = page.locator('meta[name="robots"]');
    await expect(metaRobots).toHaveAttribute('content', /index,\s*follow/i);

    // 5. Canonical URL
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute('href', 'https://artisight.netlify.app/');
  });

  test('SEO-02: Open Graph social preview tags are configured correctly', async ({ page }) => {
    await page.goto('/');

    // OG Site Name
    const ogSiteName = page.locator('meta[property="og:site_name"]');
    await expect(ogSiteName).toHaveAttribute('content', 'ArtiSight');

    // OG Title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /ArtiSight/);

    // OG Description
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);

    // OG Type
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');

    // OG Image
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /og-image\.png/);
  });

  test('SEO-03: Twitter Card metadata is configured for summary_large_image', async ({ page }) => {
    await page.goto('/');

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');

    const twitterTitle = page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveAttribute('content', /ArtiSight/);

    const twitterImage = page.locator('meta[name="twitter:image"]');
    await expect(twitterImage).toHaveAttribute('content', /og-image\.png/);
  });

  test('SEO-04: Structured Data (Schema.org JSON-LD) exists and is valid', async ({ page }) => {
    await page.goto('/');

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const jsonContent = await jsonLdScript.textContent();
    expect(jsonContent).not.toBeNull();

    const data = JSON.parse(jsonContent || '{}');
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toBeDefined();
    expect(Array.isArray(data['@graph'])).toBeTruthy();

    const webApp = data['@graph'].find((item) => item['@type'] === 'WebApplication');
    expect(webApp).toBeDefined();
    expect(webApp.name).toBe('ArtiSight');
    expect(webApp.applicationCategory).toContain('MultimediaApplication');
    expect(webApp.featureList.length).toBeGreaterThanOrEqual(5);

    const webSite = data['@graph'].find((item) => item['@type'] === 'WebSite');
    expect(webSite).toBeDefined();
    expect(webSite.url).toBe('https://artisight.netlify.app/');
  });

  test('SEO-05: Crawlers can access robots.txt and sitemap.xml', async ({ request }) => {
    // 1. Check robots.txt
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('User-agent: *');
    expect(robotsText).toContain('Allow: /');
    expect(robotsText).toContain('Sitemap: https://artisight.netlify.app/sitemap.xml');

    // 2. Check sitemap.xml
    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain('<urlset');
    expect(sitemapText).toContain('https://artisight.netlify.app/</loc>');
    expect(sitemapText).toContain('https://artisight.netlify.app/upload</loc>');
  });

  test('SEO-06: Web App Manifest is valid and discoverable', async ({ request }) => {
    const manifestRes = await request.get('/site.webmanifest');
    expect(manifestRes.status()).toBe(200);
    const manifest = await manifestRes.json();
    expect(manifest.name).toContain('ArtiSight');
    expect(manifest.short_name).toBe('ArtiSight');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
  });

  test('SEO-07: Dynamic route updates title and canonical tags in client-side navigation', async ({ page }) => {
    // 1. Navigate to Upload
    await page.goto('/upload');
    await expect(page).toHaveTitle(/Upload Photograph\s*\|\s*ArtiSight/);
    const uploadCanonical = page.locator('link[rel="canonical"]');
    await expect(uploadCanonical).toHaveAttribute('href', 'https://artisight.netlify.app/upload');

    // 2. Navigate to Feedback (Critique Dashboard)
    await page.goto('/feedback');
    await expect(page).toHaveTitle(/Photo Critique\s*&\s*Analysis Dashboard\s*\|\s*ArtiSight/);
    const critiqueRobots = page.locator('meta[name="robots"]');
    await expect(critiqueRobots).toHaveAttribute('content', /noindex,\s*follow/);

    // 3. Navigate to a non-existent route (404)
    await page.goto('/not-a-real-page-route');
    await expect(page).toHaveTitle(/Page Not Found \(404\)\s*\|\s*ArtiSight/);
    const notFoundRobots = page.locator('meta[name="robots"]');
    await expect(notFoundRobots).toHaveAttribute('content', /noindex,\s*nofollow/);
  });
});
