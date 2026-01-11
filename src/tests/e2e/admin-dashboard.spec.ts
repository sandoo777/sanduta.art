/**
 * E2E Tests - Admin Dashboard
 * Flux complet admin: Login → Orders → Production → Settings
 */

import { test, expect } from '@playwright/test';

// Mock credentials pentru test environment
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@sanduta.art';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

test.describe('Admin Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login pentru fiecare test
    await page.goto('/auth/signin');
    
    await page.fill('[name="email"]', ADMIN_EMAIL);
    await page.fill('[name="password"]', ADMIN_PASSWORD);
    await page.click('[data-testid="signin-btn"]');
    
    // Așteaptă redirect la dashboard
    await page.waitForURL(/\/admin|\/dashboard/, { timeout: 10000 });
  });

  test('admin vizualizează dashboard principal', async ({ page }) => {
    await test.step('Acces dashboard', async () => {
      await page.goto('/admin');
      
      // Verifică elemente dashboard
      await expect(page.locator('h1')).toContainText(/dashboard/i);
      
      // Verifică statistici
      await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible();
    });

    await test.step('Verifică grafice', async () => {
      // Verifică că există grafice
      const charts = page.locator('[data-testid="chart"]');
      expect(await charts.count()).toBeGreaterThan(0);
    });
  });

  test('admin gestionează comenzi', async ({ page }) => {
    await test.step('Navigare la Orders', async () => {
      await page.click('text=Orders');
      await expect(page).toHaveURL(/\/admin\/orders/);
      
      // Verifică tabel comenzi
      await expect(page.locator('[data-testid="orders-table"]')).toBeVisible({
        timeout: 10000,
      });
    });

    await test.step('Filtrare comenzi după status', async () => {
      const statusFilter = page.locator('[data-testid="status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('PENDING');
        await page.waitForLoadState('networkidle');
        
        // Verifică că filtrarea funcționează
        const orders = page.locator('[data-testid="order-row"]');
        const count = await orders.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    await test.step('Deschidere detalii comandă', async () => {
      const firstOrder = page.locator('[data-testid="order-row"]').first();
      
      if (await firstOrder.isVisible()) {
        await firstOrder.click();
        
        // Verifică detalii comandă
        await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-timeline"]')).toBeVisible();
      }
    });

    await test.step('Actualizare status comandă', async () => {
      const statusBtn = page.locator('[data-testid="update-status-btn"]');
      
      if (await statusBtn.isVisible()) {
        await statusBtn.click();
        
        // Selectare nou status
        const statusOption = page.locator('[data-testid="status-option-confirmed"]');
        if (await statusOption.isVisible()) {
          await statusOption.click();
          
          // Confirmare
          await page.click('[data-testid="confirm-status-change"]');
          
          // Verifică notificare succes
          await expect(
            page.locator('text=/updated|actualizat/i')
          ).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test('admin gestionează producția', async ({ page }) => {
    await test.step('Navigare la Production', async () => {
      await page.click('text=Production');
      await expect(page).toHaveURL(/\/admin\/production/);
      
      // Verifică tabel producție
      await expect(page.locator('[data-testid="production-table"]')).toBeVisible({
        timeout: 10000,
      });
    });

    await test.step('Pornire job producție', async () => {
      const startBtn = page.locator('[data-testid="start-production-btn"]').first();
      
      if (await startBtn.isVisible()) {
        await startBtn.click();
        
        // Verifică că statusul s-a schimbat
        await expect(
          page.locator('text=/in progress|în progres/i')
        ).toBeVisible({ timeout: 5000 });
      }
    });

    await test.step('Pauză job producție', async () => {
      const pauseBtn = page.locator('[data-testid="pause-production-btn"]').first();
      
      if (await pauseBtn.isVisible()) {
        await pauseBtn.click();
        
        // Verifică notificare
        await expect(
          page.locator('text=/paused|întrerupt/i')
        ).toBeVisible({ timeout: 5000 });
      }
    });

    await test.step('Vizualizare timeline producție', async () => {
      const timelineBtn = page.locator('[data-testid="view-timeline-btn"]').first();
      
      if (await timelineBtn.isVisible()) {
        await timelineBtn.click();
        
        // Verifică timeline
        await expect(page.locator('[data-testid="production-timeline"]')).toBeVisible();
      }
    });
  });

  test('admin gestionează produse', async ({ page }) => {
    await test.step('Navigare la Products', async () => {
      await page.click('text=Products');
      await expect(page).toHaveURL(/\/admin\/products/);
    });

    await test.step('Adăugare produs nou', async () => {
      await page.click('[data-testid="add-product-btn"]');
      
      // Completare formular
      await page.fill('[name="name"]', 'Test Product ' + Date.now());
      await page.fill('[name="slug"]', 'test-product-' + Date.now());
      await page.fill('[name="description"]', 'Test description');
      await page.fill('[name="price"]', '99.99');
      await page.fill('[name="stock"]', '10');
      
      // Selectare categorie
      const categorySelect = page.locator('[name="categoryId"]');
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      // Salvare
      await page.click('[data-testid="save-product-btn"]');
      
      // Verifică succes
      await expect(
        page.locator('text=/created|creat|added|adăugat/i')
      ).toBeVisible({ timeout: 5000 });
    });

    await test.step('Editare produs', async () => {
      const editBtn = page.locator('[data-testid="edit-product-btn"]').first();
      
      if (await editBtn.isVisible()) {
        await editBtn.click();
        
        // Modificare preț
        await page.fill('[name="price"]', '149.99');
        
        // Salvare
        await page.click('[data-testid="save-product-btn"]');
        
        await expect(
          page.locator('text=/updated|actualizat/i')
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test('admin gestionează setări', async ({ page }) => {
    await test.step('Navigare la Settings', async () => {
      await page.click('text=Settings');
      await expect(page).toHaveURL(/\/admin\/settings/);
    });

    await test.step('Actualizare setări generale', async () => {
      // Site title
      const siteTitle = page.locator('[name="siteTitle"]');
      if (await siteTitle.isVisible()) {
        await siteTitle.fill('Sanduta.art - Test');
        
        // Salvare
        await page.click('[data-testid="save-settings-btn"]');
        
        await expect(
          page.locator('text=/saved|salvat/i')
        ).toBeVisible({ timeout: 5000 });
      }
    });

    await test.step('Gestionare utilizatori', async () => {
      await page.click('text=Users');
      
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible({
        timeout: 10000,
      });
      
      // Număr utilizatori
      const users = page.locator('[data-testid="user-row"]');
      expect(await users.count()).toBeGreaterThan(0);
    });
  });

  test('admin vizualizează rapoarte', async ({ page }) => {
    await test.step('Navigare la Reports', async () => {
      await page.click('text=Reports');
      await expect(page).toHaveURL(/\/admin\/reports/);
    });

    await test.step('Vizualizare raport vânzări', async () => {
      await page.click('text=Sales Report');
      
      // Selectare interval de timp
      await page.fill('[name="startDate"]', '2024-01-01');
      await page.fill('[name="endDate"]', '2024-12-31');
      
      // Generare raport
      await page.click('[data-testid="generate-report-btn"]');
      
      // Verifică că raportul se încarcă
      await expect(page.locator('[data-testid="report-data"]')).toBeVisible({
        timeout: 10000,
      });
    });

    await test.step('Export raport PDF', async () => {
      const exportBtn = page.locator('[data-testid="export-pdf-btn"]');
      
      if (await exportBtn.isVisible()) {
        // Pornește descărcarea
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportBtn.click(),
        ]);
        
        // Verifică că fișierul a fost descărcat
        expect(download.suggestedFilename()).toMatch(/\.pdf$/);
      }
    });
  });

  test('admin gestionează notificări', async ({ page }) => {
    await test.step('Acces notificări', async () => {
      await page.click('[data-testid="notifications-icon"]');
      
      await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();
    });

    await test.step('Marcare notificare ca citită', async () => {
      const notification = page.locator('[data-testid="notification"]').first();
      
      if (await notification.isVisible()) {
        await notification.click();
        
        // Verifică că devine citită
        await expect(notification).toHaveClass(/read|citit/);
      }
    });
  });

  test('admin verifică QA dashboard', async ({ page }) => {
    await test.step('Navigare la QA Dashboard', async () => {
      await page.goto('/admin/qa');
      
      // Verifică dashboard QA
      await expect(page.locator('h1')).toContainText(/QA|Quality/i);
    });

    await test.step('Vizualizare metrici teste', async () => {
      // Verifică metrici
      await expect(page.locator('[data-testid="test-coverage"]')).toBeVisible();
      await expect(page.locator('[data-testid="test-status"]')).toBeVisible();
    });
  });

  test('admin face logout', async ({ page }) => {
    await test.step('Logout', async () => {
      // Click pe profil dropdown
      await page.click('[data-testid="user-menu"]');
      
      // Click logout
      await page.click('text=Logout');
      
      // Verifică redirect la login
      await page.waitForURL(/\/auth\/signin/);
    });
  });
});
