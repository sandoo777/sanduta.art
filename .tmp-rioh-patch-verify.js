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

    const list = await page.evaluate(async () => {
      const res = await fetch('/api/admin/machines', { credentials: 'include' });
      if (!res.ok) throw new Error('list failed: ' + res.status);
      return await res.json();
    });

    const match = list.find((machine) => /rioh 2/i.test(machine.name));
    if (!match) {
      throw new Error('Rioh 2 machine not found');
    }

    const original = match.name;
    const candidate = 'Rioh 2 - verification';

    const updateRes = await page.evaluate(async ({ id, name }) => {
      const res = await fetch(`/api/admin/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include',
      });
      const text = await res.text();
      return { status: res.status, text };
    }, { id: match.id, name: candidate });

    const after = await page.evaluate(async () => {
      const res = await fetch('/api/admin/machines', { credentials: 'include' });
      if (!res.ok) throw new Error('after fetch failed: ' + res.status);
      return await res.json();
    });

    const updated = after.find((machine) => machine.id === match.id);
    console.log('FIND_MATCH', JSON.stringify({
      id: match.id,
      original,
      candidate,
      updateStatus: updateRes.status,
      updatedName: updated ? updated.name : null,
      updateText: updateRes.text
    }, null, 2));

    const revertRes = await page.evaluate(async ({ id, name }) => {
      const res = await fetch(`/api/admin/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include',
      });
      const text = await res.text();
      return { status: res.status, text };
    }, { id: match.id, name: original });

    console.log('REVERT_STATUS', JSON.stringify(revertRes, null, 2));
  } finally {
    await browser.close();
  }
})();
