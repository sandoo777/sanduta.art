const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const responses = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/admin/machines')) {
      responses.push({ url, status: res.status(), statusText: res.statusText() });
      try {
        const text = await res.text();
        responses[responses.length - 1].body = text.slice(0, 2000);
      } catch {}
    }
  });
  page.on('console', (msg) => console.log('BROWSER_CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGEERROR', err.message));
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
    await page.waitForTimeout(4000);
    console.log('RESPONSES', JSON.stringify(responses, null, 2));
    console.log('MODAL_VISIBLE', await page.getByText('Editează echipament').isVisible().catch(() => false));
    console.log('BODY_TEXT', (await page.locator('body').innerText()).slice(0, 800));
  } catch (e) {
    console.log('ERR', e.message);
  } finally { await browser.close(); }
})();
