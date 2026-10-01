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
    const inputInfo = await page.locator('input').evaluateAll(els => els.map(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      placeholder: el.placeholder,
      value: el.value,
      ariaLabel: el.getAttribute('aria-label'),
      formControlName: el.getAttribute('formcontrolname'),
      labels: el.labels && el.labels.length ? [...el.labels].map(l => l.textContent) : []
    })));
    console.log(JSON.stringify(inputInfo.slice(0, 25), null, 2));
  } catch (e) {
    console.log('ERR', e.message);
  } finally { await browser.close(); }
})();
