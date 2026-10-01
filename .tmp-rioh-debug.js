const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log('BROWSER_CONSOLE', msg.type(), msg.text());
  });
  page.on('pageerror', (err) => {
    console.log('PAGE_ERROR', err.message);
  });

  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('/api/admin/machines')) {
      console.log('REQUEST', req.method(), u);
    }
  });

  page.on('response', async (res) => {
    const u = res.url();
    if (u.includes('/api/admin/machines')) {
      try {
        const text = await res.text();
        console.log('RESPONSE', res.status(), u, text.slice(0, 220));
      } catch (err) {
        console.log('RESPONSE', res.status(), u, '<body-read-error>');
      }
    }
  });

  try {
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@sanduta.art');
    await page.fill('input[type="password"]', 'admin123');
    await page.getByRole('button', { name: 'Autentificare', exact: true }).click();
    await page.waitForURL(/\/admin|\/manager|\/operator|\/account/, { timeout: 30000 });
    await page.goto('http://localhost:3002/admin/machines', { waitUntil: 'networkidle', timeout: 30000 });

    const card = page.locator('div.bg-white.rounded-lg.border').filter({ hasText: /rioh 2/i }).first();
    console.log('CARD_COUNT', await card.count());

    const menuButton = card.locator('button').first();
    console.log('MENU_VISIBLE_BEFORE', await menuButton.isVisible());
    await menuButton.click();

    const editButton = page.getByRole('button', { name: /Editează|Edit/i }).last();
    console.log('EDIT_VISIBLE', await editButton.isVisible().catch(() => false));
    await editButton.click();
    await page.waitForTimeout(1200);

    const inputName = page.locator('input[name="name"]').first();
    console.log('INPUT_VISIBLE', await inputName.isVisible().catch(() => false));
    console.log('INPUT_VALUE', await inputName.inputValue().catch(() => 'N/A'));

    const allButtons = await page.locator('button').evaluateAll(nodes => nodes.map(n => ({ text: (n.textContent || '').trim(), visible: !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length) })));
    console.log('BUTTONS', JSON.stringify(allButtons.filter((b) => /Actualizează|Adaugă|Editează|Edit|Anulează|Autentificare|Caută|Plus/.test(b.text) || b.visible), null, 2));

    const bodyBefore = await page.locator('body').innerText();
    console.log('ERROR_TEXT_BEFORE', /obligatoriu|invalid|Minim|error/i.test(bodyBefore));

    const saveButton = page.locator('button').filter({ hasText: /Actualizează|Adaugă echipament/i }).last();
    console.log('SAVE_VISIBLE', await saveButton.isVisible().catch(() => false));
    console.log('SAVE_INFO', await saveButton.evaluate((el) => ({
      text: el.textContent,
      disabled: !!el.disabled,
      hidden: el.hidden,
      pointerEvents: getComputedStyle(el).pointerEvents,
      opacity: getComputedStyle(el).opacity,
      display: getComputedStyle(el).display,
      size: { width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height },
      rect: { left: el.getBoundingClientRect().left, top: el.getBoundingClientRect().top, right: el.getBoundingClientRect().right, bottom: el.getBoundingClientRect().bottom },
      onclick: typeof el.onclick,
      type: el.getAttribute('type'),
      centerElement: (() => {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        return hit ? { tag: hit.tagName, className: hit.className, text: hit.textContent?.slice(0, 80) } : null;
      })()
    })));
    const form = page.locator('form').last();
    await form.evaluate((node) => {
      node.addEventListener('submit', (event) => {
        console.log('NATIVE_SUBMIT_EVENT', !!event);
      }, { once: true });
    });
    await saveButton.click();
    await page.waitForTimeout(1500);
    await form.evaluate((node) => {
      console.log('FORM_SUBMIT_PATH', node.matches(':valid'), node.checkValidity ? node.checkValidity() : 'no-check');
    });
    await page.waitForTimeout(1500);

    const bodyAfter = await page.locator('body').innerText();
    const invalidCount = await page.locator('[aria-invalid="true"]').count();
    const errorNodes = await page.locator('[aria-invalid="true"]').evaluateAll(nodes => nodes.map(n => ({ tag: n.tagName, text: n.textContent ? n.textContent.slice(0, 200) : '', value: n instanceof HTMLInputElement ? n.value : null })));
    console.log('INVALID_COUNT', invalidCount);
    console.log('INVALID_NODES', JSON.stringify(errorNodes, null, 2));
    console.log('ERROR_TEXT_AFTER', /obligatoriu|invalid|Minim|error/i.test(bodyAfter));
    console.log('BODY_TEXT_HAS_UPDATED', bodyAfter.toLowerCase().includes('rioh 2 browser verify'));
    console.log('BODY_AFTER_SNIP', bodyAfter.slice(0, 2000));
  } catch (err) {
    console.log('SCRIPT_ERROR', err.message);
  } finally {
    await browser.close();
  }
})();
