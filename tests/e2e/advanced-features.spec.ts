import { test, expect } from '@playwright/test';

test.describe('Advanced Search and Filtering', () => {
  test('Multi-criteria product search', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    
    // Open advanced filters
    await page.click('[data-testid="advanced-filters"]');
    
    // Apply multiple filters
    await page.fill('[data-testid="search-query"]', 'canvas');
    await page.fill('[data-testid="min-price"]', '50');
    await page.fill('[data-testid="max-price"]', '200');
    await page.check('[data-testid="in-stock-only"]');
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Verify URL contains query params
    await expect(page).toHaveURL(/.*q=canvas.*minPrice=50.*maxPrice=200.*inStock=true/);
    
    // Verify results
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test('Pagination navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Check pagination controls
    const pagination = page.locator('[data-testid="pagination"]');
    await expect(pagination).toBeVisible();
    
    // Navigate to page 2
    await page.click('[data-testid="page-2"]');
    await expect(page).toHaveURL(/.*page=2/);
    
    // Check active page
    await expect(page.locator('[data-testid="page-2"]')).toHaveClass(/bg-purple-600/);
  });
});

test.describe('Wishlist Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('Add product to wishlist', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Add to wishlist
    await page.click('[data-testid="add-to-wishlist"]');
    
    // Check success message
    await expect(page.locator('text=Adăugat la favorite')).toBeVisible();
    
    // Go to wishlist
    await page.click('[data-testid="wishlist-button"]');
    await expect(page).toHaveURL(/.*wishlist/);
    
    // Verify product is in wishlist
    await expect(page.locator('[data-testid="wishlist-items"]')).toBeVisible();
  });

  test('Remove from wishlist', async ({ page }) => {
    await page.goto('http://localhost:3000/wishlist');
    
    // Click remove on first item
    await page.locator('[data-testid="remove-wishlist-item"]').first().click();
    
    // Confirm removal
    await page.click('text=Confirmă');
    
    // Check success message
    await expect(page.locator('text=Șters din favorite')).toBeVisible();
  });
});

test.describe('Order Tracking', () => {
  test('Track order with email', async ({ page }) => {
    await page.goto('http://localhost:3000/track-order');
    
    // Fill tracking form
    await page.fill('input[name="orderId"]', 'ORDER-123');
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.click('button[type="submit"]');
    
    // Should show order details or error
    const orderDetails = page.locator('[data-testid="order-details"]');
    const errorMessage = page.locator('[data-testid="error-message"]');
    
    await expect(orderDetails.or(errorMessage)).toBeVisible();
  });

  test('Order timeline display', async ({ page }) => {
    // Assuming we have a test order
    await page.goto('http://localhost:3000/track-order');
    await page.fill('input[name="orderId"]', 'TEST-ORDER-1');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Check timeline
    const timeline = page.locator('[data-testid="order-timeline"]');
    if (await timeline.isVisible()) {
      await expect(timeline.locator('[data-testid="status-pending"]')).toBeVisible();
      await expect(timeline.locator('[data-testid="status-confirmed"]')).toBeVisible();
    }
  });
});

test.describe('Performance and Optimization', () => {
  test('Product search responds quickly', async ({ page }) => {
    const startTime = Date.now();
    
    const response = await page.goto('http://localhost:3000/api/products/search?q=canvas');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response?.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(2000); // Should respond in under 2 seconds
  });

  test('Pagination handles large datasets', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/orders?limit=100');
    
    // Should load without timeout
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Error Handling', () => {
  test('Invalid order tracking shows error', async ({ page }) => {
    await page.goto('http://localhost:3000/track-order');
    
    await page.fill('input[name="orderId"]', 'INVALID');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Order not found')).toBeVisible();
  });

  test('API error handling', async ({ page }) => {
    // Navigate to a page that makes API calls
    await page.goto('http://localhost:3000/products');
    
    // Intercept API and force error
    await page.route('**/api/products/search*', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    await page.reload();
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
