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
    const info = await page.evaluate(() => {
      const forms = [...document.querySelectorAll('form')].map((f, i) => ({ i, action: f.action, text: (f.textContent || '').slice(0, 200) }));
      const buttons = [...document.querySelectorAll('button')].map((b, i) => ({ i, type: b.type, text: (b.textContent || '').trim(), aria: b.getAttribute('aria-label') }));
      return { formsCount: forms.length, forms, buttons: buttons.filter(b => b.text || b.aria) };
    });
    console.log(JSON.stringify(info, null, 2));
  } catch (e) {
    console.log('ERR', e.message);
  } finally { await browser.close(); }
})();
