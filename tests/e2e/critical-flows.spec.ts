import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads successfully', async ({ page }) => {
    // Check hero section
    await expect(page.locator('h1')).toContainText('Tipărim');
    
    // Check navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check popular products section
    await expect(page.locator('text=Produse Populare')).toBeVisible();
  });

  test('Product browsing flow', async ({ page }) => {
    // Navigate to products
    await page.click('text=Produse');
    await expect(page).toHaveURL(/.*products/);
    
    // Check products grid loads
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Check product details page
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Adaugă în coș')).toBeVisible();
  });

  test('Add to cart flow', async ({ page }) => {
    // Go to products
    await page.goto('http://localhost:3000/products');
    
    // Add first product to cart
    await page.locator('[data-testid="product-card"]').first().click();
    await page.click('text=Adaugă în coș');
    
    // Check cart badge updates
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText('1');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();
  });

  test('Checkout flow (guest)', async ({ page }) => {
    // Add product to cart
    await page.goto('http://localhost:3000/products');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.click('text=Adaugă în coș');
    
    // Go to checkout
    await page.click('[data-testid="cart-button"]');
    await page.click('text=Finalizează comanda');
    
    // Fill checkout form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '0712345678');
    await page.fill('input[name="address"]', 'Str. Test, Nr. 1');
    await page.fill('input[name="city"]', 'București');
    
    // Select payment method
    await page.click('text=Ramburs');
    
    // Submit order
    await page.click('text=Plasează comanda');
    
    // Check success page
    await expect(page).toHaveURL(/.*success/);
    await expect(page.locator('text=Mulțumim')).toBeVisible();
  });

  test('Search functionality', async ({ page }) => {
    // Click search
    await page.click('[data-testid="search-button"]');
    
    // Type search query
    await page.fill('[data-testid="search-input"]', 'canvas');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Check results
    await expect(page).toHaveURL(/.*search.*canvas/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('Category navigation', async ({ page }) => {
    // Navigate to categories
    await page.click('text=Categorii');
    
    // Select a category
    await page.click('text=Canvas').first();
    
    // Check filtered products
    await expect(page).toHaveURL(/.*category/);
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });
});

test.describe('Admin Panel Critical Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@sanduta.art');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');
  });

  test('Admin dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check key stats are visible
    await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();
  });

  test('Order management flow', async ({ page }) => {
    // Navigate to orders
    await page.click('text=Orders');
    await expect(page).toHaveURL(/.*admin.*orders/);
    
    // Check orders table
    await expect(page.locator('table')).toBeVisible();
    
    // Click on first order
    await page.locator('tr').nth(1).click();
    
    // Check order details
    await expect(page.locator('text=Order Details')).toBeVisible();
  });

  test('Product creation flow', async ({ page }) => {
    // Navigate to products
    await page.click('text=Products');
    await page.click('text=Adaugă produs');
    
    // Fill product form
    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.fill('input[name="price"]', '99.99');
    
    // Save product
    await page.click('button[type="submit"]');
    
    // Check success message
    await expect(page.locator('text=Produs adăugat')).toBeVisible();
  });

  test('Export invoice flow', async ({ page }) => {
    // Go to orders
    await page.click('text=Orders');
    
    // Click on first order
    await page.locator('tr').nth(1).click();
    
    // Download invoice
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Descarcă factură');
    const download = await downloadPromise;
    
    // Check file downloaded
    expect(download.suggestedFilename()).toContain('factura');
  });

  test('Revenue stats view', async ({ page }) => {
    await page.click('text=Reports');
    await page.click('text=Revenue');
    
    // Check stats cards
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    
    // Check chart
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('Production schedule view', async ({ page }) => {
    await page.click('text=Production');
    await page.click('text=Schedule');
    
    // Check schedule table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Production Hours')).toBeVisible();
  });

  test('Low stock alerts', async ({ page }) => {
    await page.click('text=Inventory');
    
    // Check alert widget
    await expect(page.locator('[data-testid="low-stock-alert"]')).toBeVisible();
    
    // Navigate to low stock page
    await page.click('text=Vezi toate alertele');
    await expect(page).toHaveURL(/.*inventory.*low-stock/);
  });

  test('Export report flow', async ({ page }) => {
    await page.click('text=Reports');
    await page.click('text=Export');
    
    // Select report type
    await page.selectOption('select[name="reportType"]', 'orders');
    await page.selectOption('select[name="format"]', 'csv');
    
    // Download report
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Exportă');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('orders-report');
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe('Real-time Features', () => {
  test('Order notifications', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@sanduta.art');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');
    
    // Check notification badge
    await expect(page.locator('[data-testid="notifications-badge"]')).toBeVisible();
    
    // Check WebSocket connection indicator
    const connectionIndicator = page.locator('[data-testid="ws-status"]');
    await expect(connectionIndicator).toHaveClass(/bg-green-500/);
  });

  test('Inventory alerts appear', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@sanduta.art');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Navigate to dashboard
    await page.goto('http://localhost:3000/admin/dashboard');
    
    // Check for inventory alert widget
    const alertWidget = page.locator('[data-testid="inventory-alerts"]');
    if (await alertWidget.isVisible()) {
      await expect(alertWidget.locator('text=Alertă Stoc Scăzut')).toBeVisible();
    }
  });
});

test.describe('API Integration Tests', () => {
  test('Product search API', async ({ request }) => {
    const response = await request.get('/api/products/search?q=canvas&minPrice=50&maxPrice=200');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('products');
    expect(data).toHaveProperty('pagination');
    expect(data.pagination).toHaveProperty('totalCount');
  });

  test('Order tracking API', async ({ request }) => {
    const response = await request.get('/api/orders/track?orderId=test123&email=test@example.com');
    
    // Should return 404 for non-existent order, or 200 with timeline
    expect([200, 404]).toContain(response.status());
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('order');
      expect(data).toHaveProperty('timeline');
      expect(data.timeline).toHaveLength(5);
    }
  });

  test('Category tree API', async ({ request }) => {
    const response = await request.get('/api/categories/tree');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('categories');
    expect(data).toHaveProperty('totalCount');
    
    if (data.categories.length > 0) {
      expect(data.categories[0]).toHaveProperty('productCount');
      expect(data.categories[0]).toHaveProperty('children');
    }
  });
});
