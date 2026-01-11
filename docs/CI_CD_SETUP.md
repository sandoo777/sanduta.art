# CI/CD Pipeline Setup Guide

## Prezentare generală

Pipeline-ul CI/CD automatizează testarea, build-ul și deploy-ul aplicației sanduta.art folosind GitHub Actions.

## 🏗️ Arhitectură Pipeline

```
Push/PR → GitHub Actions
  ├─ Lint & Type Check ✓
  ├─ Unit Tests ✓
  ├─ Integration Tests ✓
  ├─ API Tests ✓
  ├─ E2E Tests ✓
  ├─ Performance Tests ✓
  ├─ Security Scan ✓
  ├─ Build ✓
  └─ Deploy (main only) ✓
      └─ Notify ✓
```

## 📋 Jobs Overview

### 1. Lint & Type Check

**Scop**: Verifică calitatea codului și tipuri TypeScript

**Rulează**:
- ESLint pe tot codul
- TypeScript compiler check

**Durată**: ~30 secunde

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run lint
    - run: npx tsc --noEmit
```

### 2. Unit Tests

**Scop**: Testează funcții pure și logică business

**Rulează**:
- Vitest cu coverage
- Upload coverage la Codecov

**Durată**: ~20 secunde

```yaml
unit-tests:
  needs: lint
  steps:
    - run: npm test -- --run --coverage src/tests/unit
    - uses: codecov/codecov-action@v3
```

### 3. Integration Tests

**Scop**: Testează module backend și integrări database

**Services**:
- PostgreSQL 16 container

**Rulează**:
- Prisma migrations
- Database seed
- Integration tests

**Durată**: ~45 secunde

```yaml
integration-tests:
  needs: lint
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
        POSTGRES_DB: sanduta_test
```

### 4. API Tests

**Scop**: Testează toate endpoint-urile REST

**Services**:
- PostgreSQL 16

**Rulează**:
- Next.js build
- Start server pe port 3000
- API tests cu Supertest
- Stop server

**Durată**: ~2 minute

```yaml
api-tests:
  needs: [unit-tests, integration-tests]
  steps:
    - run: npm run build
    - run: npm start &
    - run: npx wait-on http://localhost:3000
    - run: npm test -- --run src/tests/api
```

### 5. E2E Tests

**Scop**: Testează fluxuri complete în browsere reale

**Browsere**:
- Chromium
- Firefox

**Services**:
- PostgreSQL 16

**Rulează**:
- Install Playwright browsers
- Prisma migrations + seed
- Next.js build
- Playwright tests

**Artifact-uri**:
- Playwright report (30 zile)
- Test results cu screenshots (30 zile)

**Durată**: ~5 minute

```yaml
e2e-tests:
  needs: api-tests
  steps:
    - run: npx playwright install --with-deps chromium firefox
    - run: npm run build
    - run: npx playwright test
    - uses: actions/upload-artifact@v4
      with:
        name: playwright-report
```

### 6. Performance Tests

**Scop**: Monitorizează performanța și Core Web Vitals

**Tool**: Lighthouse CI

**Metrici verificate**:
- Performance Score ≥90
- Accessibility ≥90
- Best Practices ≥90
- SEO ≥90
- LCP <2.5s
- CLS <0.1

**URLs testate**: 6 pagini critice

**Artifact-uri**:
- Lighthouse results (30 zile)

**Durată**: ~3 minute

```yaml
performance-tests:
  needs: e2e-tests
  steps:
    - run: npm run build
    - run: npm start &
    - run: npx lhci autorun
```

### 7. Security Scan

**Scop**: Detectează vulnerabilități de securitate

**Scanări**:
1. npm audit (moderate+ severity)
2. Snyk security scan (high+ severity)
3. Security tests (XSS, CSRF, SQL injection, etc.)

**Durată**: ~1 minut

```yaml
security-scan:
  needs: lint
  steps:
    - run: npm audit --audit-level=moderate
    - uses: snyk/actions/node@master
    - run: npm test -- --run src/tests/security
```

### 8. Build

**Scop**: Verifică că aplicația se poate builda

**Rulează**:
- Prisma generate
- Next.js build

**Artifact-uri**:
- Build folder `.next/` (7 zile)

**Durată**: ~2 minute

```yaml
build:
  needs: [unit-tests, integration-tests, api-tests, e2e-tests, security-scan]
  steps:
    - run: npm run prisma:generate
    - run: npm run build
```

### 9. Deploy

**Scop**: Deploy automat pe producție

**Condiții**:
- Doar pe `main` branch
- Doar pe push (nu PR)
- Doar dacă toate testele pass

**Platform**: Vercel

**Durată**: ~1 minut

```yaml
deploy:
  needs: [build, performance-tests]
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  steps:
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-args: '--prod'
```

### 10. Notify

**Scop**: Notifică echipa despre rezultat

**Canale**:
- Slack
- GitHub deployment status

**Durată**: ~5 secunde

```yaml
notify:
  needs: [deploy]
  if: always()
  steps:
    - uses: 8398a7/action-slack@v3
      with:
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔧 Setup Instructions

### 1. GitHub Secrets

Navigați la: **Settings → Secrets and variables → Actions → New repository secret**

#### Database

```bash
DATABASE_URL_TEST=postgresql://test:test@localhost:5432/sanduta_test
```

#### Authentication

```bash
NEXTAUTH_SECRET_TEST=your-test-secret-min-32-characters
```

#### Lighthouse CI

1. Instalați Lighthouse CI Server (opțional) sau folosiți GitHub App
2. Obțineți token:
   ```bash
   npm install -g @lhci/cli
   lhci wizard
   ```
3. Adăugați secret:
   ```bash
   LHCI_GITHUB_APP_TOKEN=your-token-here
   ```

#### Snyk Security

1. Creați cont pe [snyk.io](https://snyk.io)
2. Obțineți API token din **Account Settings → API Token**
3. Adăugați secret:
   ```bash
   SNYK_TOKEN=your-snyk-token
   ```

#### Vercel

1. Obțineți Vercel Token:
   - Login la [vercel.com](https://vercel.com)
   - **Settings → Tokens → Create Token**

2. Obțineți Org ID și Project ID:
   ```bash
   npm install -g vercel
   vercel link
   cat .vercel/project.json
   ```

3. Adăugați secrets:
   ```bash
   VERCEL_TOKEN=your-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_PROJECT_ID=your-project-id
   ```

#### Slack Notifications

1. Creați Slack Webhook:
   - Slack workspace → **Apps → Incoming Webhooks**
   - Add to Channel
   - Copy Webhook URL

2. Adăugați secret:
   ```bash
   SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

#### Codecov (Opțional)

1. Creați cont pe [codecov.io](https://codecov.io)
2. Link GitHub repository
3. Token este generat automat (nu e nevoie de secret pentru public repos)

### 2. GitHub Actions Permissions

Navigați la: **Settings → Actions → General**

**Workflow permissions**:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### 3. Branch Protection Rules

Navigați la: **Settings → Branches → Add rule**

**Branch name pattern**: `main`

**Protecție**:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - `lint`
  - `unit-tests`
  - `integration-tests`
  - `api-tests`
  - `e2e-tests`
  - `security-scan`
  - `build`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

### 4. Workflow File

Asigurați-vă că `.github/workflows/ci-cd.yml` există:

```bash
ls -la .github/workflows/ci-cd.yml
```

## 🚀 Usage

### Trigger Manual

```bash
# Din GitHub UI
Actions → CI/CD Pipeline → Run workflow
```

### Trigger Automat

**Push pe main/develop**:
```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

**Pull Request**:
```bash
git checkout -b feature/my-feature
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
# Creați PR în GitHub UI
```

### Verificare Status

**Din terminal**:
```bash
gh run list
gh run view <run-id>
gh run watch
```

**Din GitHub UI**:
- Navigați la **Actions** tab
- Click pe workflow run
- Vezi status pentru fiecare job

## 📊 Monitoring

### GitHub Actions Dashboard

**URL**: `https://github.com/YOUR_ORG/sanduta.art/actions`

**Metrici**:
- Success rate
- Average duration
- Failed jobs
- Artifact storage

### QA Dashboard (In-App)

**URL**: `http://localhost:3000/admin/dashboard/qa`

**Features**:
- Test status overview
- Coverage metrics
- Performance scores
- Recent runs history
- Export PDF reports

### Codecov Dashboard

**URL**: `https://codecov.io/gh/YOUR_ORG/sanduta.art`

**Metrici**:
- Overall coverage
- Coverage per file
- Coverage trends
- PR coverage diff

### Lighthouse CI Dashboard

**URL**: Depinde de setup (GitHub App sau self-hosted)

**Metrici**:
- Performance scores
- Core Web Vitals trends
- Regression detection
- Historical comparison

## 🐛 Troubleshooting

### Problema: Job timeout

**Cauză**: Job rulează peste 6 ore (limit GitHub)

**Soluție**:
```yaml
jobs:
  my-job:
    timeout-minutes: 30  # Setează timeout explicit
```

### Problema: Database connection failed

**Cauză**: PostgreSQL service nu e ready

**Soluție**:
```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Problema: Playwright tests flaky

**Cauză**: Race conditions, timing issues

**Soluție**:
```yaml
- name: Run E2E tests
  run: npx playwright test --retries=2
```

### Problema: Out of disk space

**Cauză**: Node modules și cache ocupă prea mult

**Soluție**:
```yaml
- name: Cleanup
  run: |
    npm cache clean --force
    docker system prune -af
```

### Problema: Secrets missing

**Cauză**: Secrets nu sunt configurate

**Soluție**:
1. Verifică Settings → Secrets
2. Verifică typos în workflow YAML
3. Verifică environment (production/staging)

### Problema: Deploy failed

**Cauză**: Vercel credentials invalide

**Soluție**:
```bash
# Re-link Vercel project
vercel link
vercel pull
vercel deploy --prod
```

## 📈 Performance Optimization

### 1. Cache Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'  # Cached npm dependencies
```

### 2. Parallel Jobs

```yaml
unit-tests:
  needs: lint  # Așteaptă doar lint, nu toate

api-tests:
  needs: [unit-tests, integration-tests]  # Rulează după ambele
```

### 3. Matrix Strategy

```yaml
test:
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
      node: [18, 20]
  runs-on: ${{ matrix.os }}
```

### 4. Artifact Retention

```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 7  # Nu 30 dacă nu e nevoie
```

### 5. Conditional Jobs

```yaml
deploy:
  if: github.ref == 'refs/heads/main'  # Doar pe main
```

## 🔒 Security Best Practices

### 1. Nu hard-codați secrets

```yaml
# ❌ Bad
- run: curl -H "Authorization: Bearer abc123"

# ✅ Good
- run: curl -H "Authorization: Bearer ${{ secrets.API_TOKEN }}"
```

### 2. Folosiți specific versions

```yaml
# ❌ Bad
- uses: actions/checkout@v4

# ✅ Good
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

### 3. Limitați permissions

```yaml
permissions:
  contents: read
  pull-requests: write
```

### 4. Review third-party actions

```yaml
# Verificați source code înainte de a folosi
- uses: some-random/action@v1  # ⚠️ Review first
```

## 📚 Resources

### GitHub Actions

- [Docs](https://docs.github.com/en/actions)
- [Marketplace](https://github.com/marketplace?type=actions)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### CI/CD Best Practices

- [Martin Fowler - Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Tools

- [act](https://github.com/nektos/act) - Run GitHub Actions locally
- [GitHub CLI](https://cli.github.com/) - Manage workflows from terminal

## 🎯 Success Criteria

Pipeline-ul este considerat success dacă:

- ✅ Toate testele pass (unit, integration, API, E2E, security)
- ✅ Code coverage ≥90%
- ✅ Build success
- ✅ Performance scores ≥90 (Lighthouse)
- ✅ No high/critical security vulnerabilities
- ✅ Deploy success (pe main branch)
- ✅ Total duration <15 minute

## 🚀 Next Steps

1. **Configurați toate secrets-urile**
2. **Testați pipeline-ul cu un dummy commit**
3. **Configurați branch protection pe `main`**
4. **Setupați Slack notifications**
5. **Monitorizați primul deployment**

---

**Întrebări?** Consultați [TESTING_GUIDE.md](./TESTING_GUIDE.md) sau contactați echipa DevOps.
