import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE_URL = 'http://localhost:3000';
const EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@sanduta.art';
const PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123';

const events = {
  console: [],
  pageErrors: [],
  requestFailures: [],
  machinePatch: null,
  markers: {
    MACHINE_FORM_UPDATE_BUTTON_CLICK: false,
    MACHINE_FORM_SUBMIT_START: false,
    MACHINE_UPDATE_SUBMIT_START: false,
    USE_MACHINES_UPDATE_REQUEST_START: false,
    USE_MACHINES_UPDATE_RESPONSE: false,
    USE_MACHINES_UPDATE_JSON_PARSED: false,
    MACHINE_UPDATE_API_SUCCESS: false,
    MACHINE_UPDATE_CLOSE_MODAL: false,
    MACHINE_UPDATE_FLOW_DONE: false,
    MACHINE_FORM_ONSUBMIT_RESOLVED: false,
  },
};

function updateMarkers(text) {
  for (const key of Object.keys(events.markers)) {
    if (text.includes(key)) events.markers[key] = true;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('UNHANDLED_REJECTION', String(event.reason));
    });
  });

  page.on('console', async (msg) => {
    const text = msg.text();
    events.console.push({ type: msg.type(), text });
    updateMarkers(text);
  });

  page.on('pageerror', (error) => {
    events.pageErrors.push(String(error));
  });

  page.on('requestfailed', (request) => {
    events.requestFailures.push({
      url: request.url(),
      method: request.method(),
      errorText: request.failure()?.errorText || 'unknown',
    });
  });

  page.on('response', async (response) => {
    const request = response.request();
    const url = response.url();
    const method = request.method();
    if (method === 'PATCH' && /\/api\/admin\/machines\/.+/.test(url)) {
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch {
        bodyText = '<failed to read body>';
      }
      events.machinePatch = {
        url,
        method,
        status: response.status(),
        ok: response.ok(),
        requestBody: request.postData() || '',
        responseBody: bodyText,
      };
    }
  });

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Adresa de email').fill(EMAIL);
  await page.getByLabel('Parola').fill(PASSWORD);
  await page.getByRole('button', { name: /^autentificare$/i }).click();
  await page.waitForTimeout(3000);

  const sessionText = await page.evaluate(async () => {
    const response = await fetch('/api/auth/session', { credentials: 'include' });
    return response.text();
  });

  if (!sessionText.includes('"role":"ADMIN"')) {
    throw new Error(`Login did not establish admin session. Session payload: ${sessionText}`);
  }

  await page.goto(`${BASE_URL}/admin/machines`, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('h1:has-text("Echipamente")', { timeout: 20000 });

  const ensureMachineExists = async () => {
    const existingMachines = await page.evaluate(async () => {
      const response = await fetch('/api/admin/machines', { credentials: 'include' });
      if (!response.ok) return [];
      const json = await response.json();
      return Array.isArray(json) ? json : [];
    });

    if (existingMachines.length > 0) return;

    const [materials, methods] = await page.evaluate(async () => {
      const [materialsRes, methodsRes] = await Promise.all([
        fetch('/api/admin/materials?active=true', { credentials: 'include' }),
        fetch('/api/admin/print-methods?active=true', { credentials: 'include' }),
      ]);

      const materialsJson = materialsRes.ok ? await materialsRes.json() : [];
      const methodsJson = methodsRes.ok ? await methodsRes.json() : [];

      return [materialsJson, methodsJson];
    });

    const materialId = materials?.[0]?.id;
    const methodId = methods?.[0]?.id;
    if (!materialId || !methodId) {
      throw new Error('Cannot create test machine: missing active material or print method');
    }

    const createPayload = {
      name: `E2E Machine ${Date.now()}`,
      type: 'DIGITAL_COLOR',
      equipmentType: 'HOURLY',
      status: 'AVAILABLE',
      costPerHour: 120,
      compatibleMaterialIds: [materialId],
      compatiblePrintMethodIds: [methodId],
      active: true,
      notes: 'temporary capture machine',
    };

    const createResult = await page.evaluate(async (payload) => {
      const response = await fetch('/api/admin/machines', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return {
        ok: response.ok,
        status: response.status,
        body: await response.text(),
      };
    }, createPayload);

    if (!createResult.ok) {
      throw new Error(`Failed creating machine for capture: ${createResult.status} ${createResult.body}`);
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
  };

  await ensureMachineExists();

  const firstMachineName = ((await page.locator('h3.font-semibold.text-gray-900').first().textContent()) || '').trim();
  if (!firstMachineName) {
    throw new Error('No machine card title found after ensuring machine exists');
  }

  const card = page.locator('h3', { hasText: firstMachineName }).locator('xpath=ancestor::div[contains(@class,"bg-white")][1]');
  await card.waitFor({ timeout: 20000 });
  await card.locator('button').first().click();
  await page.getByRole('button', { name: /editează/i }).click();

  await page.waitForSelector('h2:has-text("Editează echipament")', { timeout: 15000 });

  const submitButton = page.getByRole('button', { name: /^Actualizează$/i });
  await submitButton.click();

  await page.waitForTimeout(2500);

  const warningsAndErrors = events.console.filter((entry) => entry.type === 'warning' || entry.type === 'error');

  const report = {
    timestamp: new Date().toISOString(),
    location: '/admin/machines edit modal',
    markers: events.markers,
    machinePatch: events.machinePatch,
    consoleWarningsAndErrors: warningsAndErrors,
    pageErrors: events.pageErrors,
    requestFailures: events.requestFailures,
    allConsoleTail: events.console.slice(-120),
  };

  fs.mkdirSync('tmp', { recursive: true });
  fs.writeFileSync('tmp/machine-update-capture.json', JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    markers: report.markers,
    machinePatch: report.machinePatch,
    consoleWarningsAndErrors: report.consoleWarningsAndErrors,
    pageErrors: report.pageErrors,
    requestFailures: report.requestFailures,
  }, null, 2));

  await browser.close();
})();
