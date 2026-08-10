import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@sanduta.art';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/auth/signin');
  await page.fill('[name="email"]', ADMIN_EMAIL);
  await page.fill('[name="password"]', ADMIN_PASSWORD);
  await page.click('[data-testid="signin-btn"]');
  await page.waitForURL(/\/admin|\/dashboard/, { timeout: 15000 });
}

async function waitForMaterialsReady(page: import('@playwright/test').Page) {
  await page.goto('/admin/materials');

  const loading = page.getByText('Se Ã®ncarcÄƒ...');
  if ((await loading.count()) > 0) {
    await loading.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => undefined);
  }

  await page.getByRole('button', { name: 'Edit' }).first().waitFor({
    state: 'visible',
    timeout: 45000,
  });
}

test.describe('Materials Regression', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await waitForMaterialsReady(page);
  });

  test('list, edit logic, sheet conversion and cleanup', async ({ page }) => {
    await test.step('Loads materials list and search works', async () => {
      await expect(page.getByRole('heading', { name: /Materials & Inventory/i })).toBeVisible();

      const editButtons = page.getByRole('button', { name: 'Edit' });
      await expect(editButtons.first()).toBeVisible();

      await page.getByPlaceholder('CautÄƒ dupÄƒ nume sau SKU...').fill('Banner BlockOut 340');
      await expect(page.getByRole('button', { name: 'Copie' }).first()).toBeVisible();
    });

    await test.step('Edit form applies pricing logic for DIRECT mode', async () => {
      await page.getByRole('button', { name: 'Edit' }).first().click();

      const consumptionType = page.locator('select[name="consumptionType"]');
      await expect(consumptionType).toBeVisible();

      await consumptionType.selectOption('DIRECT');

      await expect(page.getByText('PreÈ› per mÂ² (MDL) *')).toHaveCount(0);
      await expect(page.getByText('PreÈ› per metru (MDL) *')).toHaveCount(0);
      await expect(page.getByText(/PreÈ› per unitate \(MDL\)/)).toHaveCount(1);

      // m2 unit should show the sheet size selector block.
      await page.locator('select[name="unit"]').selectOption('m2');
      await expect(page.locator('select').filter({ hasText: 'A4 (210x297 mm)' }).first()).toBeVisible();

      await page.keyboard.press('Escape');
    });

    await test.step('Copy flow creates material with per-sheet conversion and auto SKU', async () => {
      await page.getByPlaceholder('CautÄƒ dupÄƒ nume sau SKU...').fill('Banner BlockOut 340');
      await page.getByRole('button', { name: 'Copie' }).first().click();

      const uniqueName = `E2E_MATERIAL_${Date.now()}`;
      await page.locator('input[name="name"]').fill(uniqueName);
      await page.locator('select[name="unit"]').selectOption('m2');

      await page.getByRole('button', { name: 'per foaie' }).click();
      await page.locator('select').filter({ hasText: 'A4 (210x297 mm)' }).first().selectOption('A4');
      await page.locator('input[name="purchasePrice"]').fill('0.16');

      await page.getByRole('button', { name: 'CreeazÄƒ' }).click();

      const createdCheck = await page.evaluate(async (targetName) => {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i < 8; i += 1) {
          const listRes = await fetch('/api/admin/materials');
          if (listRes.ok) {
            const rows = await listRes.json();
            const row = rows.find((entry: unknown) => entry.name === targetName);

            if (row) {
              const expected = 0.16 / 0.06237;
              const actual = Number(row.purchasePrice ?? 0);
              const diff = Math.abs(actual - expected);

              const deleteRes = await fetch(`/api/admin/materials/${row.id}`, {
                method: 'DELETE',
              });

              return {
                found: true,
                sku: row.sku,
                diff,
                withinTolerance: diff < 0.02,
                deleteOk: deleteRes.ok,
              };
            }
          }

          await sleep(800);
        }

        return {
          found: false,
          sku: null,
          diff: null,
          withinTolerance: false,
          deleteOk: false,
        };
      }, uniqueName);

      expect(createdCheck.found).toBe(true);
      expect(createdCheck.withinTolerance).toBe(true);
      expect(Boolean(createdCheck.sku)).toBe(true);
      expect(createdCheck.deleteOk).toBe(true);
    });
  });
});
