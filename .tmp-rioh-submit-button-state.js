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
      const btns = [...document.querySelectorAll('button[type="submit"]')];
      const last = btns[btns.length - 1];
      return {
        count: btns.length,
        text: last && last.textContent,
        disabled: last && last.disabled,
        aria: last && last.getAttribute('aria-label'),
        outer: last && last.outerHTML.slice(0, 500),
        formAction: last && last.form && last.form.action,
        formNoValidate: last && last.form && last.form.noValidate,
      };
    });
    console.log(JSON.stringify(info, null, 2));
  } catch (e) { console.log('ERR', e.message); } finally { await browser.close(); }
})();
