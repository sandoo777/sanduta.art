const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const lines = [];
  page.on('console', (msg) => lines.push('console:' + msg.type() + ':' + msg.text()));
  page.on('pageerror', (err) => lines.push('pageerror:' + err.message));
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
    await page.locator('input[name="name"]').fill('rioh 2 browser test 2026-09-29');
    await page.getByRole('button', { name: /Actualizează/i }).click();
    await page.waitForTimeout(2500);
    lines.push('modalVisible:' + (await page.getByText('Editează echipament').isVisible().catch(() => false)));
  } catch (e) {
    lines.push('err:' + e.message);
  }
  const fs = require('fs');
  fs.writeFileSync('.tmp-rioh-submit-errors.txt', lines.join('\n'));
  await browser.close();
})();
