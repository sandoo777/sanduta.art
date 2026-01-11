# Testing Guide - QA & Automation System

## Prezentare generală

Sistemul complet de testare automată pentru sanduta.art acoperă toate aspectele calității software:

- **Unit Tests** - Funcții pure și logică business
- **Integration Tests** - Module backend și integrări database
- **API Tests** - Toate endpoint-urile REST
- **E2E Tests** - Fluxuri complete utilizator (Playwright)
- **Security Tests** - Vulnerabilități și securitate
- **Performance Tests** - Lighthouse CI și Core Web Vitals

## 🏗️ Arhitectură

```
src/
├── __tests__/          # Teste vechi (existente)
└── tests/              # Sistem nou de testare
    ├── unit/           # Teste unitare (89 teste)
    ├── integration/    # Teste integrare (în dezvoltare)
    ├── api/            # Teste API (75 teste)
    ├── e2e/            # Teste E2E Playwright (21 teste)
    ├── security/       # Teste securitate (35 teste)
    └── performance/    # Teste performanță Lighthouse
```

## 🚀 Quick Start

### 1. Instalare dependențe

```bash
npm install
npm run playwright:install  # Instalează browsere Playwright
```

### 2. Rulare teste

```bash
# Toate testele
npm run test:all

# Teste specifice
npm run test:unit           # Teste unitare
npm run test:integration    # Teste integrare
npm run test:api            # Teste API
npm run test:security       # Teste securitate
npm run test:e2e            # Teste E2E
npm run test:perf           # Teste performanță

# Cu UI interactiv
npm run test:ui             # Vitest UI
npm run test:e2e:ui         # Playwright UI

# Cu coverage
npm run test:coverage
```

### 3. Vizualizare rezultate

```bash
# Prisma Studio pentru DB
npm run prisma:studio

# Rapoarte Playwright
npx playwright show-report

# QA Dashboard (admin panel)
# http://localhost:3000/admin/dashboard/qa
```

## 📋 Tipuri de teste

### Unit Tests (src/tests/unit/)

**Scop**: Testarea funcțiilor pure și logicii business

**Exemple**:
- `priceCalculator.test.ts` - Calcule prețuri, discount-uri, VAT (34 teste)
- `orderStatus.test.ts` - State machine pentru comenzi (25 teste)
- `productionWorkflow.test.ts` - Workflow producție (30 teste)

**Rulare**:
```bash
npm run test:unit
```

**Exemplu de test**:
```typescript
import { describe, it, expect } from 'vitest';

describe('PriceCalculator', () => {
  it('should calculate base price correctly', () => {
    const calculator = new PriceCalculator();
    const price = calculator.calculateBasePrice(100, 2);
    expect(price).toBe(200);
  });
});
```

### API Tests (src/tests/api/)

**Scop**: Testarea endpoint-urilor REST

**Exemple**:
- `products.test.ts` - GET/POST/PUT/DELETE produse (40 teste)
- `orders.test.ts` - Comenzi și status updates (35 teste)

**Rulare**:
```bash
npm run test:api
```

**Exemplu de test**:
```typescript
import request from 'supertest';
import { describe, it, expect } from 'vitest';

describe('GET /api/products', () => {
  it('should return list of products', async () => {
    const response = await request('http://localhost:3000')
      .get('/api/products')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests (src/tests/e2e/)

**Scop**: Testarea fluxurilor complete în browser real

**Exemple**:
- `customer-journey.spec.ts` - Fluxul complet de cumpărare (10 scenarii)
- `admin-dashboard.spec.ts` - Workflow admin (11 scenarii)

**Rulare**:
```bash
npm run test:e2e              # Headless (fără UI)
npm run test:e2e:headed       # Cu browser vizibil
npm run test:e2e:ui           # Playwright UI mode
```

**Exemplu de test**:
```typescript
import { test, expect } from '@playwright/test';

test('complete customer journey', async ({ page }) => {
  // Homepage
  await test.step('Visit homepage', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sanduta.art/);
  });

  // Products
  await test.step('Browse products', async () => {
    await page.click('text=Produse');
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
  });

  // Add to cart
  await test.step('Add product to cart', async () => {
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });
});
```

### Security Tests (src/tests/security/)

**Scop**: Detectarea vulnerabilităților de securitate

**Exemple**:
- `vulnerabilities.test.ts` - XSS, CSRF, SQL injection, auth, etc. (35 teste)

**Acoperire**:
- ✅ XSS Prevention (3 test suites)
- ✅ CSRF Protection (3 tests)
- ✅ SQL Injection (3 tests)
- ✅ Authentication & Authorization (4 tests)
- ✅ File Upload Security (3 tests)
- ✅ Rate Limiting (2 tests)
- ✅ Session Security (2 tests)
- ✅ CSP Headers (1 test)
- ✅ Data Exposure (2 tests)
- ✅ Clickjacking Protection (1 test)

**Rulare**:
```bash
npm run test:security
```

### Performance Tests (Lighthouse CI)

**Scop**: Monitorizarea performanței și Core Web Vitals

**Configurație**: `lighthouserc.js`

**Metrici**:
- Performance Score: ≥90
- Accessibility Score: ≥90
- Best Practices Score: ≥90
- SEO Score: ≥90
- FCP: <2000ms
- LCP: <2500ms
- CLS: <0.1
- TBT: <300ms

**URLs testate**:
- `/` - Homepage
- `/products` - Catalog
- `/configurator` - Configurator
- `/editor` - Editor
- `/cart` - Coș
- `/checkout` - Checkout

**Rulare**:
```bash
npm run test:perf
```

**Rezultate**: `.lighthouseci/` folder

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Fișier: `.github/workflows/ci-cd.yml`

**Jobs**:
1. **Lint & Type Check** - ESLint + TypeScript
2. **Unit Tests** - Vitest unit tests + coverage
3. **Integration Tests** - Module tests + PostgreSQL
4. **API Tests** - Endpoint testing cu server pornit
5. **E2E Tests** - Playwright cross-browser
6. **Performance Tests** - Lighthouse CI
7. **Security Scan** - npm audit + Snyk + security tests
8. **Build** - Next.js build
9. **Deploy** - Vercel (doar pe main branch)
10. **Notify** - Slack notifications

**Trigger-uri**:
- Push pe `main` sau `develop`
- Pull requests către `main` sau `develop`

**Artifact-uri salvate**:
- Coverage reports (30 zile)
- Playwright reports (30 zile)
- Lighthouse results (30 zile)
- Build artifacts (7 zile)

### Configurare Secrets

În GitHub repo settings → Secrets and variables → Actions:

```bash
DATABASE_URL_TEST=postgresql://...
NEXTAUTH_SECRET_TEST=...
LHCI_GITHUB_APP_TOKEN=...
SNYK_TOKEN=...
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
SLACK_WEBHOOK=...
```

## 📊 QA Dashboard

### Acces

URL: http://localhost:3000/admin/dashboard/qa

**Autentificare**: Admin role required

### Features

1. **Test Status Overview**
   - Total tests, passed, failed
   - Overall coverage percentage
   - Real-time status

2. **Test Suites Detail**
   - Status per test suite (unit/api/e2e/security/perf)
   - Pass/fail counts
   - Duration
   - Coverage percentage
   - Last run timestamp

3. **Performance Metrics**
   - Lighthouse scores per URL
   - Core Web Vitals (FCP, LCP, CLS, TBT)
   - Trend charts (30 zile)

4. **Recent Test Runs**
   - Git branch și commit
   - Status (success/failure/running)
   - Duration
   - Timestamp

5. **Actions**
   - Refresh data
   - Trigger new test run
   - Export PDF report

### API Endpoints

```typescript
GET  /api/admin/qa/test-runs          // Test runs history
GET  /api/admin/qa/performance-metrics // Lighthouse data
POST /api/admin/qa/trigger-tests      // Trigger test run
GET  /api/admin/qa/export-report      // Export PDF
```

## 📝 Cum scrii teste noi

### Unit Test

```typescript
// src/tests/unit/myFeature.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from '@/lib/myFeature';

describe('MyClass', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  it('should do something', () => {
    const result = instance.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### API Test

```typescript
// src/tests/api/myEndpoint.test.ts
import request from 'supertest';
import { describe, it, expect } from 'vitest';

const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('GET /api/my-endpoint', () => {
  it('should return 200', async () => {
    const response = await request(API_URL)
      .get('/api/my-endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### E2E Test

```typescript
// src/tests/e2e/myFlow.spec.ts
import { test, expect } from '@playwright/test';

test('my user flow', async ({ page }) => {
  await test.step('Step 1', async () => {
    await page.goto('/');
    // assertions
  });

  await test.step('Step 2', async () => {
    await page.click('[data-testid="button"]');
    // assertions
  });
});
```

### Security Test

```typescript
// src/tests/security/myVulnerability.test.ts
import { test, expect } from '@playwright/test';

test('should prevent XSS', async ({ page }) => {
  await page.goto('/search');
  
  const maliciousInput = '<script>alert("XSS")</script>';
  await page.fill('[data-testid="search-input"]', maliciousInput);
  await page.press('[data-testid="search-input"]', 'Enter');

  // Script nu ar trebui să se execute
  const content = await page.textContent('[data-testid="search-results"]');
  expect(content).toContain('&lt;script&gt;');
  expect(content).not.toContain('<script>');
});
```

## 🎯 Best Practices

### 1. Test Naming

```typescript
// ✅ Good
it('should calculate VAT correctly for Romanian products', () => {});

// ❌ Bad
it('test vat', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should apply bulk discount', () => {
  // Arrange
  const calculator = new PriceCalculator();
  const quantity = 100;

  // Act
  const discount = calculator.calculateBulkDiscount(quantity);

  // Assert
  expect(discount).toBe(0.15); // 15% pentru 100+ bucăți
});
```

### 3. Use Test IDs

```tsx
// Component
<button data-testid="add-to-cart">Add to Cart</button>

// Test
await page.click('[data-testid="add-to-cart"]');
```

### 4. Avoid Hard-coded Waits

```typescript
// ❌ Bad
await page.waitForTimeout(3000);

// ✅ Good
await page.waitForSelector('[data-testid="product-loaded"]');
```

### 5. Mock External Dependencies

```typescript
import { vi } from 'vitest';

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ data: 'mocked' }),
  })
));
```

## 📈 Coverage Goals

**Target**: 90%+ code coverage

**Prioritate**:
1. **Critical paths**: 100% coverage
   - Authentication
   - Payment processing
   - Order creation
   - Production workflow

2. **Business logic**: 90%+ coverage
   - Price calculations
   - Discount rules
   - Inventory management
   - Email notifications

3. **UI components**: 70%+ coverage
   - Forms validation
   - User interactions
   - Error handling

**Verificare coverage**:
```bash
npm run test:coverage

# Raport HTML în coverage/index.html
```

## 🐛 Debugging

### Vitest Tests

```bash
# Run cu UI
npm run test:ui

# Run specific test file
npm test src/tests/unit/priceCalculator.test.ts

# Debug în VS Code
# Setează breakpoint și apasă F5
```

### Playwright Tests

```bash
# Run cu browser vizibil
npm run test:e2e:headed

# Playwright Inspector
npm run test:e2e:ui

# Debug specific test
npx playwright test customer-journey.spec.ts --debug

# Show trace
npx playwright show-trace trace.zip
```

### CI/CD Debugging

```bash
# Local GitHub Actions simulation
npm install -g act
act push
```

## 🔍 Troubleshooting

### Problema: Teste fail local dar pass în CI

**Soluție**: Verifică environment variables și database state

```bash
# Resetează DB de test
npm run prisma:migrate reset
npm run prisma:seed
```

### Problema: Playwright tests timeout

**Soluție**: Crește timeout în `playwright.config.ts`

```typescript
export default defineConfig({
  timeout: 60_000, // 60 secunde
});
```

### Problema: Coverage prea mic

**Soluție**: Identifică fișiere netestete

```bash
npm run test:coverage

# Vezi în coverage/index.html ce lipsește
```

## 📚 Resurse

### Documentație

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Supertest Docs](https://github.com/visionmedia/supertest)

### Exemple

- Unit tests: `src/tests/unit/`
- API tests: `src/tests/api/`
- E2E tests: `src/tests/e2e/`
- Security tests: `src/tests/security/`

### Alte documente

- `docs/RELIABILITY.md` - Error handling patterns
- `docs/UI_COMPONENTS.md` - UI component testing
- `.github/copilot-instructions.md` - Copilot conventions

## 🚀 Next Steps

1. **Scrieți teste pentru feature-ul vostru**
   - Începeți cu unit tests
   - Adăugați API tests
   - Completați cu E2E test pentru fluxul complet

2. **Rulați testele local**
   ```bash
   npm run test:all
   ```

3. **Verificați coverage**
   ```bash
   npm run test:coverage
   ```

4. **Push la repo**
   - CI/CD va rula automat toate testele
   - Verificați rezultatele în GitHub Actions

5. **Monitorizați în QA Dashboard**
   - http://localhost:3000/admin/dashboard/qa

---

**Întrebări?** Consultați documentația sau contactați echipa QA.
