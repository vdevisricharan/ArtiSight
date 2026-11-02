const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

const LIVE_URL = process.env.LIVE_URL || 'https://artisight.netlify.app';

const VIEWPORTS = [
  { name: '01_small_mobile_320x568', width: 320, height: 568 },
  { name: '02_standard_mobile_375x667', width: 375, height: 667 },
  { name: '03_modern_mobile_390x844', width: 390, height: 844 },
  { name: '04_large_mobile_430x932', width: 430, height: 932 },
  { name: '05_tablet_portrait_768x1024', width: 768, height: 1024 },
  { name: '06_tablet_landscape_1024x768', width: 1024, height: 768 },
  { name: '07_laptop_1366x768', width: 1366, height: 768 },
  { name: '08_desktop_1440x900', width: 1440, height: 900 },
  { name: '09_large_desktop_1920x1080', width: 1920, height: 1080 },
];

async function runAudit() {
  console.log(`Starting live site UX audit against: ${LIVE_URL}`);
  const browser = await chromium.launch({ headless: true });
  const auditReport = {
    targetUrl: LIVE_URL,
    timestamp: new Date().toISOString(),
    viewportsTested: [],
    consoleMessages: [],
    networkErrors: [],
    accessibility: {},
    interactions: {},
    horizontalScrollIssues: [],
  };

  const screenshotsDir = path.join(__dirname, '../tests/screenshots/responsive');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // 1. Viewport Responsive & Horizontal Scroll Audit
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.width < 768
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        auditReport.consoleMessages.push({ viewport: vp.name, type: msg.type(), text: msg.text() });
      }
    });

    page.on('pageerror', err => {
      auditReport.consoleMessages.push({ viewport: vp.name, type: 'pageerror', text: err.message });
    });

    try {
      await page.goto(`${LIVE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({
        path: path.join(screenshotsDir, `home_${vp.name}.png`),
        fullPage: true,
      });

      // Check for horizontal scrollbar / overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasHorizontalScroll = scrollWidth > clientWidth;

      if (hasHorizontalScroll) {
        auditReport.horizontalScrollIssues.push({
          page: 'Home',
          viewport: vp.name,
          scrollWidth,
          clientWidth,
          overflowPx: scrollWidth - clientWidth,
        });
      }

      // Check Upload page
      await page.goto(`${LIVE_URL}/upload`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({
        path: path.join(screenshotsDir, `upload_${vp.name}.png`),
        fullPage: true,
      });

      const uploadScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const uploadClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      if (uploadScrollWidth > uploadClientWidth) {
        auditReport.horizontalScrollIssues.push({
          page: 'Upload',
          viewport: vp.name,
          scrollWidth: uploadScrollWidth,
          clientWidth: uploadClientWidth,
          overflowPx: uploadScrollWidth - uploadClientWidth,
        });
      }

      // Check Feedback empty state
      await page.goto(`${LIVE_URL}/feedback`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({
        path: path.join(screenshotsDir, `feedback_empty_${vp.name}.png`),
        fullPage: true,
      });

      auditReport.viewportsTested.push({
        ...vp,
        status: 'passed',
        homeHorizontalOverflow: hasHorizontalScroll,
        uploadHorizontalOverflow: uploadScrollWidth > uploadClientWidth,
      });
    } catch (err) {
      console.error(`Error auditing viewport ${vp.name}:`, err.message);
      auditReport.viewportsTested.push({ ...vp, status: 'failed', error: err.message });
    } finally {
      await context.close();
    }
  }

  // 2. Accessibility Audit with Axe-core (WCAG 2.2 AA)
  const a11yContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const a11yPage = await a11yContext.newPage();

  const routesToTest = [
    { name: 'Home', path: '/' },
    { name: 'Upload', path: '/upload' },
    { name: 'Feedback_Empty', path: '/feedback' },
  ];

  for (const route of routesToTest) {
    await a11yPage.goto(`${LIVE_URL}${route.path}`, { waitUntil: 'networkidle' });
    try {
      const axeResults = await new AxeBuilder({ page: a11yPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      auditReport.accessibility[route.name] = {
        violationsCount: axeResults.violations.length,
        violations: axeResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map(n => ({
            html: n.html,
            target: n.target,
            failureSummary: n.failureSummary,
          })),
        })),
        passesCount: axeResults.passes.length,
        incompleteCount: axeResults.incomplete.length,
      };
    } catch (err) {
      console.error(`Axe evaluation failed for ${route.name}:`, err.message);
      auditReport.accessibility[route.name] = { error: err.message };
    }
  }

  // 3. Navigation and Deep-link 404 test
  const navPage = await a11yContext.newPage();
  await navPage.goto(`${LIVE_URL}/non-existent-page-route-12345`, { waitUntil: 'networkidle' });
  const notFoundContent = await navPage.evaluate(() => ({
    title: document.title,
    bodyText: document.body.innerText.trim(),
    html: document.body.innerHTML,
  }));
  auditReport.interactions['unknownRoute'] = notFoundContent;

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, '../tests/reports/live_site_audit.json'),
    JSON.stringify(auditReport, null, 2)
  );

  console.log('Live site audit complete! Summary saved to tests/reports/live_site_audit.json');
}

runAudit().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
