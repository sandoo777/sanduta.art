import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://localhost:3000';
const outputDir = path.join(process.cwd(), 'evidence', 'material-properties-ui');

fs.mkdirSync(outputDir, { recursive: true });

const values = {
  finish: 'TEST_FINISH_123',
  color: 'TEST_COLOR_123',
  texture: 'TEST_TEXTURE_123',
  temp: 'TEST_TEMP_DELETE_123',
  tempEdited: 'TEST_TEMP_DELETE_123_EDIT',
};

async function ensureValueExists(page, tabName, inputPlaceholder, value) {
  await page.getByRole('button', { name: tabName }).click();
  const row = page.locator('div').filter({ hasText: value }).first();
  if ((await row.count()) > 0) {
    return;
  }

  await page.getByPlaceholder(inputPlaceholder).fill(value);
  await page.getByRole('button', { name: 'Add value' }).click();
  await page.getByText(value, { exact: true }).waitFor();
}

async function getRow(page, value) {
  return page.locator('div.rounded-lg.border').filter({ hasText: value }).first();
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
const page = await context.newPage();

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', 'admin@sanduta.art');
  await page.fill('#password', 'admin123');
  await page.getByRole('button', { name: 'Autentificare', exact: true }).click();

  await page.waitForURL(/\/admin\//, { timeout: 30000 });
  await page.goto(`${baseUrl}/admin/settings`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputDir, '01-settings-entry.png'), fullPage: true });

  await page.getByRole('link', { name: 'Material Properties' }).click();
  await page.waitForURL('**/admin/settings/material-properties');
  await page.screenshot({ path: path.join(outputDir, '02-material-properties-screen.png'), fullPage: true });

  await ensureValueExists(page, 'Finishes', 'Add finishes', values.finish);
  await ensureValueExists(page, 'Colors', 'Add colors', values.color);
  await ensureValueExists(page, 'Textures', 'Add textures', values.texture);

  // Edit + disable + delete flow on temporary finish value.
  await ensureValueExists(page, 'Finishes', 'Add finishes', values.temp);

  const tempRow = await getRow(page, values.temp);
  page.once('dialog', async (dialog) => {
    await dialog.accept(values.tempEdited);
  });
  await tempRow.getByRole('button', { name: 'Edit' }).click();
  await page.getByText(values.tempEdited, { exact: true }).waitFor();

  const editedRow = await getRow(page, values.tempEdited);
  const toggleButton = editedRow.getByRole('button', { name: /Enabled|Disabled/ });
  const previousState = await toggleButton.innerText();
  await toggleButton.click();
  await page.waitForFunction(
    ([selector, expected]) => {
      const el = document.querySelector(selector);
      return el && el.textContent && el.textContent.trim() !== expected;
    },
    [
      `button:has-text("${previousState}")`,
      previousState.trim(),
    ]
  ).catch(() => {});

  await editedRow.getByRole('button', { name: 'Delete' }).click();
  await page.getByText(values.tempEdited, { exact: true }).waitFor({ state: 'detached' });
  await page.screenshot({ path: path.join(outputDir, '03-crud-finish-color-texture.png'), fullPage: true });

  await page.goto(`${baseUrl}/admin/materials`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Add Material/i }).click();
  await page.getByRole('tab', { name: 'Proprietăți' }).click();

  await page.selectOption('#finishType', { label: values.finish });
  await page.selectOption('#colorName', { label: values.color });
  await page.selectOption('#texture', { label: values.texture });

  await page.screenshot({ path: path.join(outputDir, '04-material-editor-selected-values.png'), fullPage: true });

  await page.goto(`${baseUrl}/admin/settings/material-properties`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText(values.finish, { exact: true }).waitFor();
  await page.screenshot({ path: path.join(outputDir, '05-persisted-after-refresh.png'), fullPage: true });

  console.log('UI verification completed. Screenshots saved in evidence/material-properties-ui');
} finally {
  await browser.close();
}
