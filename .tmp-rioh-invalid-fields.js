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
    const card = page.locator('div.bg-white.rounded-lg.border').filter({ hasText: /rioh 2/i }).first();
    await card.locator('button').first().click();
    await page.getByRole('button', { name: /editeaz|edit/i }).click();
    await page.waitForTimeout(1500);
    const invalidBefore = await page.evaluate(() => Array.from(document.querySelectorAll('input, select, textarea')).filter(el => !el.checkValidity()).map(el => ({ tag: el.tagName, name: el.name, type: el.type, id: el.id, value: el.value, placeholder: el.placeholder, label: el.labels?.[0]?.textContent || null })));
    console.log('INVALID_BEFORE', JSON.stringify(invalidBefore.slice(0, 50), null, 2));
    await page.locator('input[name="name"]').fill('rioh 2 browser test 2026-09-29');
    const invalidAfter = await page.evaluate(() => Array.from(document.querySelectorAll('input, select, textarea')).filter(el => !el.checkValidity()).map(el => ({ tag: el.tagName, name: el.name, type: el.type, id: el.id, value: el.value, placeholder: el.placeholder, label: el.labels?.[0]?.textContent || null })));
    console.log('INVALID_AFTER', JSON.stringify(invalidAfter.slice(0, 50), null, 2));
  } catch (e) {
    console.log('ERR', e.message);
  } finally { await browser.close(); }
})();
