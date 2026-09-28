import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://localhost:3000';
const outputDir = path.join(process.cwd(), 'evidence', 'material-property-management-ui');

fs.mkdirSync(outputDir, { recursive: true });

const VALUES = {
  original: 'TEST_COLOR_999',
  renamed: 'TEST_COLOR_RENAMED',
};

function colorRow(page, value) {
  return page.getByRole('row').filter({ hasText: value }).first();
}

async function rowExists(page, value) {
  return (await colorRow(page, value).count()) > 0;
}

async function openColorsTab(page) {
  await page.getByRole('button', { name: 'Colors' }).click();
  await page.getByRole('table').waitFor({ timeout: 15000 });
}

async function addColor(page, value) {
  await page.getByRole('button', { name: 'Add Color' }).click();
  await page.locator('#material-property-name').fill(value);
  await page.getByRole('button', { name: 'Save' }).click();
  await colorRow(page, value).waitFor({ timeout: 15000 });
}

async function renameColor(page, fromValue, toValue) {
  const row = colorRow(page, fromValue);
  await row.getByRole('button', { name: 'Edit' }).click();
  await page.locator('#material-property-name').fill(toValue);
  await page.getByRole('button', { name: 'Save' }).click();
  await colorRow(page, toValue).waitFor({ timeout: 15000 });
}

async function deleteColorIfUnused(page, value) {
  if (!(await rowExists(page, value))) return;

  const row = colorRow(page, value);
  const usageCellText = await row.locator('td').nth(2).innerText();
  const usageCount = Number(usageCellText.trim());

  if (!Number.isFinite(usageCount) || usageCount > 0) {
    return;
  }

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  await row.getByRole('button', { name: 'Delete' }).click();
  await colorRow(page, value).waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
  const page = await context.newPage();

  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', 'admin@sanduta.art');
    await page.fill('#password', 'admin123');
    await page.getByRole('button', { name: 'Autentificare', exact: true }).click();
    await page.waitForURL(/\/admin\//, { timeout: 30000 });

    await page.goto(`${baseUrl}/admin/settings/material-properties`, { waitUntil: 'networkidle' });
    await openColorsTab(page);

    // Keep scenario deterministic when prior leftovers exist.
    await deleteColorIfUnused(page, VALUES.original);
    await deleteColorIfUnused(page, VALUES.renamed);

    if (!(await rowExists(page, VALUES.original))) {
      await addColor(page, VALUES.original);
    }

    await renameColor(page, VALUES.original, VALUES.renamed);
    await page.screenshot({ path: path.join(outputDir, '01-color-added-and-renamed.png'), fullPage: true });

    await page.goto(`${baseUrl}/admin/materials`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Add Material|Adaugă Material|Adauga Material/i }).click();

    const propertiesTab = page.getByRole('tab', { name: /Propriet/i });
    if (await propertiesTab.isVisible().catch(() => false)) {
      await propertiesTab.click();
    }

    await page.selectOption('#colorName', { label: VALUES.renamed });
    const selectedValue = await page.locator('#colorName').inputValue();
    if (selectedValue !== VALUES.renamed) {
      throw new Error(`Dropdown value mismatch. Expected ${VALUES.renamed}, got ${selectedValue}`);
    }

    await page.screenshot({ path: path.join(outputDir, '02-color-selectable-in-material-editor.png'), fullPage: true });

    await page.getByRole('button', { name: /Anulează|Cancel/i }).first().click().catch(() => {});
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Add Material|Adaugă Material|Adauga Material/i }).click();
    if (await propertiesTab.isVisible().catch(() => false)) {
      await propertiesTab.click();
    }
    await page.selectOption('#colorName', { label: VALUES.renamed });
    await page.screenshot({ path: path.join(outputDir, '03-persists-after-refresh.png'), fullPage: true });

    console.log('Material property management verification completed.');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
