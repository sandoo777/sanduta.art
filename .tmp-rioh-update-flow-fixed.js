const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const originalName = 'rioh 2';
  const testName = 'rioh 2 browser test 2026-09-29';
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

    await page.locator('input[name="name"]').fill(testName);
    await page.getByRole('button', { name: /Actualizează/i }).click();
    await page.waitForTimeout(2500);

    const modalVisible = await page.getByText('Editează echipament').isVisible().catch(() => false);
    const bodyText = await page.locator('body').innerText();
    console.log('MODAL_VISIBLE_AFTER_SAVE', modalVisible);
    console.log('PAGE_CONTAINS_TEST_NAME', bodyText.toLowerCase().includes(testName.toLowerCase()));
    console.log('PAGE_SNIP', bodyText.slice(0, 1200));

    if (bodyText.toLowerCase().includes(testName.toLowerCase())) {
      const editedCard = page.locator('div.bg-white.rounded-lg.border').filter({ hasText: new RegExp(testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
      if (await editedCard.count()) {
        await editedCard.locator('button').first().click();
        await page.getByRole('button', { name: /editeaz|edit/i }).click();
        await page.locator('input[name="name"]').fill(originalName);
        await page.getByRole('button', { name: /Actualizează/i }).click();
        await page.waitForTimeout(2500);
        const restored = await page.locator('body').innerText();
        console.log('RESTORED_TO_ORIGINAL', restored.toLowerCase().includes(originalName));
      }
    }
  } catch (error) {
    console.log('SCRIPT_ERROR', error.message);
  } finally {
    await browser.close();
  }
})();
