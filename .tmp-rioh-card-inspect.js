const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@sanduta.art');
    await page.fill('input[type="password"]', 'admin123');
    await page.getByRole('button', { name: 'Autentificare', exact: true }).click();
    await page.waitForURL(/\/admin|\/manager|\/operator|\/account/, { timeout: 30000 });
    await page.goto('http://localhost:3001/admin/machines', { waitUntil: 'networkidle', timeout: 30000 });
    const target = page.locator('div').filter({ hasText: /rioh 2/i }).first();
    console.log('COUNT', await target.count());
    console.log('HTML', await target.evaluate(el => el.outerHTML.slice(0, 2500)));
  } catch (e) {
    console.log('ERR', e.message);
  } finally { await browser.close(); }
})();
