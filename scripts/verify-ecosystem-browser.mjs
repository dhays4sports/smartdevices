// Local app only. SD_PLAYWRIGHT_MODULE and SD_CHROMIUM_PATH can select a local QA runtime.
const { chromium } = await import(process.env.SD_PLAYWRIGHT_MODULE ?? 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.SD_CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage', '--single-process'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const origin = process.env.SD_QA_ORIGIN ?? 'http://127.0.0.1:43130';
  const results = [];
  fs.mkdirSync('outputs/qa', { recursive: true });
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/devices', '/devices/moen-flo-smart-water-shutoff', '/connect', '/operate', '/build', '/farmers']) {
      const response = await page.goto(origin + route);
      assert.equal(response.status(), 200, route);
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `${route} overflow at ${width}`);
      assert.ok(await page.locator('h1').count(), `${route} heading`);
      results.push({ route, width, status: 200, overflow });
      if ((width === 375 || width === 1440) && ['/devices', '/connect', '/build', '/farmers'].includes(route)) await page.screenshot({ path: `outputs/qa/${route.slice(1)}-${width}.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(origin + '/devices');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Close', exact: true }).getAttribute('aria-expanded'), 'true');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Connect', exact: true }).click();
  await page.waitForURL('**/connect');
  await page.goto(origin + '/devices');
  await page.getByLabel('Capability', { exact: true }).selectOption('shutoff.water');
  assert.match(await page.locator('.library-status').innerText(), /2 reviewed devices/);
  await page.goto(origin + '/build');
  const textArea = page.locator('textarea').first();
  await textArea.fill('Monitor freezer temperatures and alert me when too warm');
  await page.getByRole('button', { name: /Research \+ plan this device/ }).click();
  await page.waitForSelector('#builder-requirements');
  await page.getByRole('button', { name: /Create the build workspace/ }).click();
  await page.waitForSelector('#builder-workspace');
  assert.match(await page.locator('#builder-workspace').innerText(), /temperature|freezer/i);
  assert.deepEqual(errors, []);
  fs.writeFileSync('outputs/qa/browser-results.json', JSON.stringify({ results, interactions: ['mobile navigation', 'capability filter', 'deterministic builder intake and project'], pageErrors: errors }, null, 2));
  await browser.close();
  console.log(`PASS ${results.length} route/viewport checks and 3 interactions; no page errors`);
})().catch(error => { console.error(error); process.exit(1); });
