const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@sanduta.art');
    await page.fill('input[type="password"]', 'admin123');
    await page.getByRole('button', { name: 'Autentificare', exact: true }).click();
    await page.waitForURL(/\/admin|\/manager|\/operator|\/account/, { timeout: 30000 });

    const cookies = await context.cookies('http://localhost:3001');
    console.log('COOKIES', cookies.map(c => ({ name: c.name, value: c.value.slice(0, 12) + '...' }))); 

    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('http://localhost:3001/api/admin/machines', {
      headers: { cookie: cookieHeader, accept: 'application/json' }
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY_SNIP', text.slice(0, 2000));
  } catch (error) {
    console.log('SCRIPT_ERROR', error.message);
  } finally {
    await browser.close();
  }
})();
