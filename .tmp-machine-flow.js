const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@sanduta.art');
    await page.fill('input[type="password"]', 'admin123');
    await page.getByRole('button', { name: /login|autentificare|sign in/i }).click();
    await page.waitForURL(/\/admin|\/manager|\/operator/, { timeout: 30000 });
    await page.goto('http://localhost:3000/admin/machines', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const editButtons = await page.locator('button:has-text("Editeaza")').count();
    console.log('EDIT_BUTTONS', editButtons);
    if (editButtons > 0) {
      await page.locator('button:has-text("Editeaza")').first().click();
      await page.waitForTimeout(2000);
      console.log('MODAL_VISIBLE', await page.locator('text=Editeaza echipament').isVisible());
      await page.getByRole('button', { name: /^Actualizeaza$/i }).click();
      await page.waitForTimeout(4000);
      console.log('MODAL_VISIBLE_AFTER', await page.locator('text=Editeaza echipament').isVisible());
      const bodyText = await page.locator('body').innerText();
      console.log('BODY_SNIP', bodyText.slice(0, 2000));
    }
  } catch (e) {
    console.log('SCRIPT_ERROR', e.message);
  } finally {
    await browser.close();
  }
})();
