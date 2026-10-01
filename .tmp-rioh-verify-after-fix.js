const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const urls = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/admin/machines')) {
      urls.push({ url: res.url(), status: res.status() });
      try { urls[urls.length - 1].body = (await res.text()).slice(0, 300); } catch {}
    }
  });
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
    await page.waitForTimeout(1000);

    const updated = 'rioh 2 browser verify 2026-09-29';
    await page.locator('input[name="name"]').fill(updated);
    await page.getByRole('button', { name: /Actualizează/i }).click();
    await page.waitForTimeout(2500);

    const modalVisible = await page.getByText('Editează echipament').isVisible().catch(() => false);
    const bodyText = await page.locator('body').innerText();
    console.log('PATCH_REQUESTS', JSON.stringify(urls, null, 2));
    console.log('MODAL_VISIBLE_AFTER_SAVE', modalVisible);
    console.log('BODY_HAS_UPDATED_NAME', bodyText.toLowerCase().includes(updated.toLowerCase()));

    if (bodyText.toLowerCase().includes(updated.toLowerCase())) {
      const editedCard = page.locator('div.bg-white.rounded-lg.border').filter({ hasText: new RegExp(updated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
      if (await editedCard.count()) {
        await editedCard.locator('button').first().click();
        await page.getByRole('button', { name: /editeaz|edit/i }).click();
        await page.locator('input[name="name"]').fill('rioh 2');
        await page.getByRole('button', { name: /Actualizează/i }).click();
        await page.waitForTimeout(2000);
      }
    }
  } catch (error) {
    console.log('SCRIPT_ERROR', error.message);
  } finally {
    await browser.close();
  }
})();
