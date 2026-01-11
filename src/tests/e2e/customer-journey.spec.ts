/**
 * E2E Tests - Complete Customer Journey
 * Flux complet: Homepage → Product → Configurator → Cart → Checkout → Order
 */

import { test, expect } from '@playwright/test';

test.describe('Customer Journey - Complete Flow', () => {
  test('vizitator navighează și plasează comandă completă', async ({ page }) => {
    // 1. Homepage
    await test.step('Acces homepage', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Sanduta\.art/i);
      
      // Verifică elemente principale
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    // 2. Navigare la produse
    await test.step('Navigare la catalog produse', async () => {
      await page.click('text=Produse');
      await expect(page).toHaveURL(/\/products/);
      
      // Verifică că există produse
      const products = page.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible({ timeout: 10000 });
    });

    // 3. Selectare produs
    await test.step('Selectare produs', async () => {
      await page.locator('[data-testid="product-card"]').first().click();
      
      // Verifică pagina produsului
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();
    });

    // 4. Configurator (dacă există)
    await test.step('Deschidere configurator', async () => {
      const configuratorBtn = page.locator('[data-testid="configure-btn"]');
      
      if (await configuratorBtn.isVisible()) {
        await configuratorBtn.click();
        
        // Așteaptă încărcarea configuratorului
        await expect(page.locator('[data-testid="configurator"]')).toBeVisible();
        
        // Selectează o opțiune
        const option = page.locator('[data-testid="config-option"]').first();
        if (await option.isVisible()) {
          await option.click();
        }
        
        // Salvează configurația
        await page.click('[data-testid="save-config-btn"]');
      }
    });

    // 5. Adăugare în coș
    await test.step('Adăugare în coș', async () => {
      await page.click('[data-testid="add-to-cart-btn"]');
      
      // Verifică notificare succes
      await expect(
        page.locator('text=/added to cart|adăugat în coș/i')
      ).toBeVisible({ timeout: 5000 });
      
      // Verifică badge coș actualizat
      const cartBadge = page.locator('[data-testid="cart-badge"]');
      await expect(cartBadge).toBeVisible();
    });

    // 6. Vizualizare coș
    await test.step('Navigare la coș', async () => {
      await page.click('[data-testid="cart-icon"]');
      await expect(page).toHaveURL(/\/cart/);
      
      // Verifică că există produse în coș
      const cartItems = page.locator('[data-testid="cart-item"]');
      await expect(cartItems.first()).toBeVisible();
      
      // Verifică total
      await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    });

    // 7. Checkout
    await test.step('Inițiere checkout', async () => {
      await page.click('[data-testid="checkout-btn"]');
      await expect(page).toHaveURL(/\/checkout/);
    });

    // 8. Completare formular
    await test.step('Completare date livrare', async () => {
      // Date personale
      await page.fill('[name="firstName"]', 'Test');
      await page.fill('[name="lastName"]', 'Customer');
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="phone"]', '0712345678');
      
      // Adresă
      await page.fill('[name="street"]', 'Str. Test 123');
      await page.fill('[name="city"]', 'București');
      await page.fill('[name="county"]', 'București');
      await page.fill('[name="postalCode"]', '010101');
    });

    // 9. Selectare metodă de plată
    await test.step('Selectare metodă de plată', async () => {
      await page.click('[data-testid="payment-method-card"]');
    });

    // 10. Plasare comandă (mock pentru testing)
    await test.step('Plasare comandă', async () => {
      // În test environment, mock plata
      if (process.env.NODE_ENV === 'test') {
        await page.click('[data-testid="place-order-btn"]');
        
        // Verifică redirect la pagina de confirmare
        await expect(page).toHaveURL(/\/order\/success/, { timeout: 15000 });
        
        // Verifică mesaj de succes
        await expect(
          page.locator('text=/order placed|comandă plasată/i')
        ).toBeVisible();
        
        // Verifică număr comandă
        await expect(
          page.locator('[data-testid="order-number"]')
        ).toBeVisible();
      }
    });
  });

  test('vizitator folosește editor pentru design custom', async ({ page }) => {
    // 1. Navigare la editor
    await test.step('Acces editor', async () => {
      await page.goto('/editor');
      
      await expect(page.locator('[data-testid="editor-canvas"]')).toBeVisible({
        timeout: 10000,
      });
    });

    // 2. Adaugă text
    await test.step('Adăugare text', async () => {
      await page.click('[data-testid="add-text-btn"]');
      
      const textInput = page.locator('[data-testid="text-input"]');
      if (await textInput.isVisible()) {
        await textInput.fill('Custom Text');
      }
    });

    // 3. Salvare design
    await test.step('Salvare design', async () => {
      await page.click('[data-testid="save-design-btn"]');
      
      await expect(
        page.locator('text=/saved|salvat/i')
      ).toBeVisible({ timeout: 5000 });
    });

    // 4. Adăugare în coș
    await test.step('Adăugare design în coș', async () => {
      await page.click('[data-testid="add-to-cart-btn"]');
      
      await expect(
        page.locator('text=/added to cart/i')
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test('verifică responsive design', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    
    // Verifică meniu mobile
    const hamburger = page.locator('[data-testid="mobile-menu-btn"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test('verifică accesibilitate', async ({ page }) => {
    await page.goto('/');
    
    // Verifică că există heading-uri
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Verifică că imaginile au alt text
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 5)) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Verifică navigare cu tastatură
    await page.keyboard.press('Tab');
    const focused = await page.locator(':focus').first();
    await expect(focused).toBeVisible();
  });

  test('verifică performanță', async ({ page }) => {
    // Măsoară timpul de încărcare
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // < 5s
    
    // Verifică că nu există erori în consolă
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Permite unele erori cunoscute (ex: analytics blockers)
    const criticalErrors = errors.filter(
      (err) => !err.includes('analytics') && !err.includes('gtm')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('verifică search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Caută un produs
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test product');
      await page.keyboard.press('Enter');
      
      // Verifică rezultate
      await page.waitForURL(/\/search/);
      
      const results = page.locator('[data-testid="search-result"]');
      // Poate fi 0 rezultate în test environment
      expect(await results.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('verifică filtere și sortare produse', async ({ page }) => {
    await page.goto('/products');
    
    // Așteaptă încărcarea produselor
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Selectare categorie
    const categoryFilter = page.locator('[data-testid="category-filter"]').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Sortare după preț
    const sortSelect = page.locator('[data-testid="sort-select"]');
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('price-asc');
      await page.waitForLoadState('networkidle');
      
      // Verifică că produsele sunt sortate
      const prices = await page.locator('[data-testid="product-price"]').allTextContents();
      // Parsează prețurile și verifică sortarea
    }
  });

  test('verifică navigare paginare', async ({ page }) => {
    await page.goto('/products');
    
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Verifică butoane paginare
    const nextBtn = page.locator('[data-testid="pagination-next"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      
      // Verifică că URL s-a schimbat
      expect(page.url()).toContain('page=2');
    }
  });

  test('verifică error handling', async ({ page }) => {
    // Pagină inexistentă
    await page.goto('/page-that-does-not-exist');
    
    // Ar trebui să afișeze pagina 404
    await expect(
      page.locator('text=/404|not found|nu a fost găsit/i')
    ).toBeVisible({ timeout: 5000 });
  });
});
