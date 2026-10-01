const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const originalName = 'rioh 2';
  const testName = 'rioh 2 browser test 2026-09-29';

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
    await page.waitForSelector('text=Editează echipament', { state: 'visible', timeout: 20000 });

    const nameInput = page.getByLabel(/Nume echipament/i);
    await nameInput.fill(testName);
    await page.getByRole('button', { name: /Actualizează/i }).click();

    await page.waitForTimeout(2000);
    const modalStillOpen = await page.getByText('Editează echipament').isVisible().catch(() => false);
    const bodyText = await page.locator('body').innerText();
    console.log('MODAL_STILL_OPEN', modalStillOpen);
    console.log('AFTER_UPDATE_HAS_TEST_NAME', bodyText.toLowerCase().includes(testName.toLowerCase()));
    console.log('AFTER_UPDATE_SNIP', bodyText.slice(0, 1800));

    if (bodyText.toLowerCase().includes(testName.toLowerCase())) {
      const editAgain = page.locator('div.bg-white.rounded-lg.border').filter({ hasText: new RegExp(testName, 'i') }).first();
      if (await editAgain.count()) {
        await editAgain.locator('button').first().click();
        await page.getByRole('button', { name: /editeaz|edit/i }).click();
        await page.getByLabel(/Nume echipament/i).fill(originalName);
        await page.getByRole('button', { name: /Actualizează/i }).click();
        await page.waitForTimeout(2000);
        console.log('RESTORE_DONE', await page.locator('body').innerText().toLowerCase().includes(originalName));
      }
    }
  } catch (error) {
    console.log('SCRIPT_ERROR', error.message);
  } finally {
    await browser.close();
  }
})();
