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

    const info = await page.evaluate(() => {
      const title = [...document.querySelectorAll('h3')].find(el => el.textContent.toLowerCase().includes('rioh 2'));
      if (!title) return { found: false };
      const card = title.closest('div');
      const buttons = [...(card ? card.querySelectorAll('button') : [])].map((btn) => ({
        text: (btn.textContent || '').trim(),
        outer: btn.outerHTML.slice(0, 200)
      }));
      return { found: true, buttonTexts: buttons, body: document.body.innerText.slice(0, 2500) };
    });
    console.log(JSON.stringify(info, null, 2));
  } catch (e) {
    console.log('ERR', e.message);
  } finally { await browser.close(); }
})();
