const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const lines = [];
  page.on('console', (msg) => lines.push('console:' + msg.type() + ':' + msg.text()));
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
    await page.evaluate(() => {
      const form = document.querySelector('form');
      form.addEventListener('submit', (e) => console.log('NATIVE_SUBMIT_FIRED', e.type, !!e.cancelable));
      const button = [...document.querySelectorAll('button[type="submit"]')].at(-1);
      button.addEventListener('click', () => console.log('NATIVE_BUTTON_CLICK_FIRED'));
    });
    await page.locator('input[name="name"]').fill('rioh 2 browser test 2026-09-29');
    await page.getByRole('button', { name: /Actualizează/i }).click();
    await page.waitForTimeout(2000);
    const fs = require('fs');
    fs.writeFileSync('.tmp-rioh-submit-event.txt', lines.join('\n'));
  } catch (e) {
    const fs = require('fs');
    fs.writeFileSync('.tmp-rioh-submit-event.txt', 'ERR:' + e.message);
  } finally { await browser.close(); }
})();
