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
    const h3 = page.locator('h3').filter({ hasText: /rioh 2/i }).first();
    console.log('H3_COUNT', await h3.count());
    console.log('H3_TEXT', await h3.innerText());
    const card = h3.locator('xpath=ancestor::div[contains(@class, "bg-white")][1]');
    console.log('CARD_COUNT', await card.count());
    const buttons = await card.locator('button').allTextContents();
    console.log('BUTTONS', buttons);
    console.log('CARD_HTML', (await card.evaluate(el => el.outerHTML)).slice(0, 1200));
  } catch (e) {
    console.log('ERR', e.message);
  } finally {
    await browser.close();
  }
})();
