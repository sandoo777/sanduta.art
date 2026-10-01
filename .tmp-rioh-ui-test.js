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

    const row = page.locator('tr').filter({ hasText: /rioh 2/i }).first();
    const rowCount = await row.count();
    console.log('ROW_COUNT', rowCount);

    if (rowCount > 0) {
      console.log('ROW_TEXT', await row.innerText());
      await row.getByRole('button', { name: /editeaza|edit/i }).click();
      await page.waitForTimeout(2000);
      console.log('MODAL_VISIBLE_OPEN', await page.getByText('Editeaza echipament').isVisible().catch(() => false));

      const nameInput = page.getByLabel(/nume|name/i).first();
      await nameInput.fill('rioh 2 updated');
      await page.getByRole('button', { name: /^Actualizeaza$/i }).click();
      await page.waitForTimeout(3000);

      console.log('MODAL_VISIBLE_AFTER', await page.getByText('Editeaza echipament').isVisible().catch(() => false));
      console.log('FINAL_BODY_SNIP', (await page.locator('body').innerText()).slice(0, 1800));
    } else {
      console.log('ALL_ROWS', JSON.stringify(await page.locator('tr').allTextContents(), null, 2).slice(0, 1500));
    }
  } catch (error) {
    console.log('SCRIPT_ERROR', error.message);
  } finally {
    await browser.close();
  }
})();
