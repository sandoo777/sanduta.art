import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://localhost:3000';
const outputDir = path.join(process.cwd(), 'evidence', 'material-properties-thumbnail-ui');

fs.mkdirSync(outputDir, { recursive: true });

const values = {
  colorCreate: 'TEST_COLOR_456',
  colorRename: 'TEST_COLOR_789',
};

function rowLocator(page, value) {
  return page.locator('div.rounded-lg.border').filter({ hasText: value }).first();
}

async function existsRow(page, value) {
  return (await rowLocator(page, value).count()) > 0;
}

async function addColorIfMissing(page, value) {
  if (await existsRow(page, value)) return;
  await page.getByPlaceholder('Add colors').fill(value);
  await page.getByRole('button', { name: 'Add value' }).click();
  await page.getByText(value, { exact: true }).waitFor({ timeout: 10000 });
}

async function renameColor(page, from, to) {
  const row = rowLocator(page, from);
  page.once('dialog', async (dialog) => {
    await dialog.accept(to);
  });
  await row.getByRole('button', { name: 'Edit' }).click();
  await page.getByText(to, { exact: true }).waitFor({ timeout: 10000 });
}

async function ensureRenameFlow(page) {
  await page.getByRole('button', { name: 'Colors' }).click();

  const has456 = await existsRow(page, values.colorCreate);
  const has789 = await existsRow(page, values.colorRename);

  if (!has456 && has789) {
    await renameColor(page, values.colorRename, values.colorCreate);
  }

  await addColorIfMissing(page, values.colorCreate);
  await renameColor(page, values.colorCreate, values.colorRename);
}

async function openFirstMaterialEditor(page) {
  await page.getByRole('button', { name: /Edit/i }).first().click();
  await page.locator('#thumbnailImage-upload').waitFor({ state: 'attached', timeout: 15000 });
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

    // 1-2. Create TEST_COLOR_456 and rename to TEST_COLOR_789.
    await page.goto(`${baseUrl}/admin/settings/material-properties`, { waitUntil: 'networkidle' });
    await ensureRenameFlow(page);
    await page.screenshot({ path: path.join(outputDir, '01-colors-create-rename.png'), fullPage: true });

    // 3. Verify color appears in Material Editor dropdown.
    await page.goto(`${baseUrl}/admin/materials`, { waitUntil: 'networkidle' });
    await openFirstMaterialEditor(page);
    await page.getByRole('tab', { name: 'Proprietăți' }).click();
    await page.selectOption('#colorName', { label: values.colorRename });
    await page.screenshot({ path: path.join(outputDir, '02-color-visible-in-editor-dropdown.png'), fullPage: true });

    // 4-5. Upload/replace/remove/preview thumbnail and save material.
    await page.getByRole('tab', { name: 'General' }).click();
    const fileInput = page.locator('#thumbnailImage-upload');
    const thumbnailField = page.locator('#thumbnailImage-upload').locator('xpath=ancestor::div[contains(@class,"space-y-3")]').first();

    const firstImage = path.join(process.cwd(), 'evidence', 'material-properties-ui', '01-settings-entry.png');
    const secondImage = path.join(process.cwd(), 'evidence', 'material-properties-ui', '02-material-properties-screen.png');

    await fileInput.setInputFiles(firstImage);
    await thumbnailField.locator('img[alt="Thumbnail material"]').waitFor({ timeout: 15000 });

    await thumbnailField.getByRole('button', { name: 'Inlocuieste' }).click();
    await fileInput.setInputFiles(secondImage);
    await thumbnailField.locator('img[alt="Thumbnail material"]').waitFor({ timeout: 15000 });

    await thumbnailField.getByRole('button', { name: 'Sterge' }).click();
    await thumbnailField.getByText('Fara thumbnail').waitFor({ timeout: 10000 });

    await fileInput.setInputFiles(secondImage);
    await thumbnailField.locator('img[alt="Thumbnail material"]').waitFor({ timeout: 15000 });
    await page.screenshot({ path: path.join(outputDir, '03-thumbnail-upload-replace-remove-preview.png'), fullPage: true });

    await page.getByRole('button', { name: 'Actualizează' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outputDir, '04-material-saved.png'), fullPage: true });

    // 6-7. Reopen material editor and verify thumbnail persists.
    await openFirstMaterialEditor(page);
    const reopenThumbnailField = page.locator('#thumbnailImage-upload').locator('xpath=ancestor::div[contains(@class,"space-y-3")]').first();
    await reopenThumbnailField.locator('img[alt="Thumbnail material"]').waitFor({ timeout: 15000 });
    await page.screenshot({ path: path.join(outputDir, '05-thumbnail-persisted-after-reopen.png'), fullPage: true });

    console.log('Verification completed. Evidence saved to evidence/material-properties-thumbnail-ui');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
