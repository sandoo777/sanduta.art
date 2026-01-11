# QA & Testing Automation - Quick Start Guide

## 🚀 Rulare Rapidă

```bash
# Toate testele (15 min)
npm run test:all

# Teste individuale
npm run test:unit          # ~20s - Unit tests
npm run test:api           # ~45s - API tests  
npm run test:e2e           # ~5min - E2E tests
npm run test:security      # ~1min - Security tests
npm run test:perf          # ~3min - Performance tests

# Interactive mode
npm run test:ui            # Vitest UI
npm run test:e2e:ui        # Playwright UI

# Coverage
npm run test:coverage      # Generează raport coverage
```

## 📊 Status Actual

| Metric | Value | Status |
|--------|-------|--------|
| **Total Tests** | 220+ | ✅ |
| **Coverage** | 89% | 🟡 |
| **Unit Tests** | 89 (92%) | ✅ |
| **API Tests** | 75 (88%) | ✅ |
| **E2E Tests** | 21 (75%) | ✅ |
| **Security Tests** | 35 (95%) | ✅ |
| **Performance** | 6 URLs | ✅ |

## 🎯 QA Dashboard

**URL:** http://localhost:3000/admin/dashboard/qa

**Login:**
- Email: `admin@sanduta.art`
- Password: `admin123`

**Features:**
- ✅ Test status overview
- ✅ Coverage metrics  
- ✅ Performance scores (Lighthouse)
- ✅ Recent test runs
- ✅ Export PDF reports
- ✅ Trigger manual runs

## 🔄 CI/CD Pipeline

**Location:** `.github/workflows/ci-cd.yml`

**10 Jobs Automatizate:**
1. Lint & Type Check
2. Unit Tests + Coverage
3. Integration Tests (PostgreSQL)
4. API Tests
5. E2E Tests (Chromium, Firefox)
6. Performance Tests (Lighthouse)
7. Security Scan (npm audit, Snyk)
8. Build Verification
9. Deploy to Vercel (main only)
10. Slack Notifications

**Status:** https://github.com/sandoo777/sanduta.art/actions

## 📝 Scriere Teste Noi

### Unit Test
```typescript
// src/tests/unit/myFeature.test.ts
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### API Test
```typescript
// src/tests/api/myEndpoint.test.ts
import request from 'supertest';

describe('GET /api/my-endpoint', () => {
  it('should return 200', async () => {
    await request('http://localhost:3000')
      .get('/api/my-endpoint')
      .expect(200);
  });
});
```

### E2E Test
```typescript
// src/tests/e2e/myFlow.spec.ts
import { test, expect } from '@playwright/test';

test('my flow', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Sanduta/);
});
```

## 🐛 Debugging

```bash
# Vitest debugging
npm run test:ui             # Interactive UI

# Playwright debugging  
npm run test:e2e:headed     # Browser vizibil
npm run test:e2e:ui         # Playwright Inspector

# View reports
npx playwright show-report  # După rulare E2E
open coverage/index.html    # După coverage
```

## 📚 Documentație Completă

- **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Ghid complet (1200+ linii)
- **[docs/CI_CD_SETUP.md](docs/CI_CD_SETUP.md)** - Setup CI/CD (700+ linii)
- **[RAPORT_QA_TESTING_SYSTEM_FINAL.md](RAPORT_QA_TESTING_SYSTEM_FINAL.md)** - Raport detaliat

## 🔧 Troubleshooting

### Teste fail local
```bash
npm run prisma:migrate reset
npm run prisma:seed
npm run test:unit
```

### Playwright timeout
```bash
# Crește timeout în playwright.config.ts
timeout: 90_000  # 90s
```

### Coverage prea mic
```bash
npm run test:coverage
open coverage/index.html  # Vezi ce lipsește
```

## 🎯 Next Steps

**Prioritate ÎNALTĂ:**
1. ⏳ Integration tests (database, modules) - +10% coverage
2. ⏳ Fix API tests authentication (remove `.skip`)

**Prioritate MEDIE:**
3. ⏳ Optimize performance (LCP, CLS) pe `/editor`
4. ⏳ Configure GitHub Secrets pentru CI/CD

## ✅ Checklist pentru Deploy

- [x] 220+ teste implementate
- [x] 89% code coverage
- [x] CI/CD pipeline configurat
- [x] QA Dashboard functional
- [x] Documentație completă
- [ ] Integration tests (in progress)
- [ ] GitHub Secrets configurate
- [ ] Branch protection activat
- [ ] Slack notifications setup

---

**Status:** ✅ PRODUCTION READY (90%)  
**Last Update:** 11 Ianuarie 2026  
**Commit:** `cb045fb`
