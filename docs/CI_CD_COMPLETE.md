# CI/CD Pipeline - Ghid Complet

## 📋 Cuprins

1. [Prezentare Generală](#prezentare-generală)
2. [Arhitectură CI/CD](#arhitectură-cicd)
3. [CI Pipeline](#ci-pipeline)
4. [CD Pipeline](#cd-pipeline)
5. [Environments](#environments)
6. [Rollback System](#rollback-system)
7. [Monitoring](#monitoring)
8. [Feature Flags](#feature-flags)
9. [Versioning](#versioning)
10. [Best Practices](#best-practices)

---

## Prezentare Generală

Pipeline-ul CI/CD pentru **sanduta.art** este complet automatizat, sigur și pregătit pentru scalare enterprise.

### Caracteristici Principale

- ✅ **Automated Testing**: Unit, Integration, API, E2E, Performance
- ✅ **Multi-Environment**: Development, Staging, Production
- ✅ **Zero Downtime**: Blue-Green deployment strategy
- ✅ **Instant Rollback**: < 10 secunde
- ✅ **Comprehensive Monitoring**: Real-time metrics și alerting
- ✅ **Feature Flags**: Gradual rollout și A/B testing
- ✅ **Semantic Versioning**: Automated changelog generation

---

## Arhitectură CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                       Developer Push                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      CI Pipeline                             │
├─────────────────────────────────────────────────────────────┤
│  1. Install Dependencies (cached)                            │
│  2. Lint & Type Check                                        │
│  3. Unit Tests                                               │
│  4. Integration Tests                                        │
│  5. API Tests                                                │
│  6. Security Tests                                           │
│  7. E2E Tests (Playwright)                                   │
│  8. Build Application                                        │
│  9. Performance Tests (Lighthouse)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                    [All Pass?]
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      CD Pipeline                             │
├─────────────────────────────────────────────────────────────┤
│  1. Download Build Artifacts                                 │
│  2. Deploy to Staging (auto)                                 │
│  3. Smoke Tests (Staging)                                    │
│  4. Manual Approval                                          │
│  5. Deploy to Production                                     │
│  6. Smoke Tests (Production)                                 │
│  7. Post-Deploy Monitoring                                   │
│  8. Rollback (if needed)                                     │
└────────────────────────────────────────────────────────────┘
```

---

## CI Pipeline

### Fișier: `.github/workflows/ci-cd.yml`

### Jobs

#### 1. Lint & Type Check
```yaml
- ESLint pentru code quality
- TypeScript type checking
- Duration: ~30s
```

#### 2. Unit Tests
```yaml
- Vitest pentru unit tests
- Coverage raportare
- Duration: ~1m
```

#### 3. Integration Tests
```yaml
- PostgreSQL service container
- Prisma migrations
- Database seed
- Duration: ~2m
```

#### 4. API Tests
```yaml
- Next.js server start
- API endpoints testing
- Duration: ~2m
```

#### 5. E2E Tests
```yaml
- Playwright cu Chromium/Firefox
- User flow testing
- Duration: ~5m
```

#### 6. Security Tests
```yaml
- npm audit
- Snyk scanning (optional)
- Duration: ~1m
```

#### 7. Build
```yaml
- Next.js production build
- Artifacts upload
- Duration: ~3m
```

#### 8. Performance Tests
```yaml
- Lighthouse CI
- Performance budgets
- Duration: ~2m
```

### Total CI Duration: ~15-20 minunte

### Cache Strategy

```yaml
# node_modules cache
- key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Next.js build cache
- key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts') }}

# Playwright browsers cache
- key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```

---

## CD Pipeline

### Fișier: `.github/workflows/cd.yml`

### Workflow Trigger

```yaml
on:
  workflow_run:
    workflows: ["CI/CD Pipeline - QA & Testing"]
    types: [completed]
    branches: [main]
  workflow_dispatch:
    inputs:
      environment: [staging, production]
      rollback: boolean
```

### Jobs

#### 1. Prepare Deployment
- Generate semantic version
- Determine target environment
- Create deployment tag
- Duration: ~30s

#### 2. Deploy to Staging
- Auto-deploy pe push în `main`
- Database migrations
- Environment staging
- Duration: ~2m

#### 3. Smoke Tests (Staging)
- Critical paths validation
- Homepage, API, Admin
- Duration: ~1m

#### 4. Deploy to Production
- **Manual approval required**
- Database backup
- Production deployment
- Cache invalidation
- ISR regeneration
- Duration: ~3m

#### 5. Smoke Tests (Production)
- Post-deploy validation
- Auto-rollback on failure
- Duration: ~1m

#### 6. Post-Deploy Monitoring
- Health checks
- Metrics collection
- Alert on anomalies
- Duration: ~5m

#### 7. Rollback (Conditional)
- Auto-rollback pe failure
- Manual rollback cu workflow_dispatch
- Database restore
- Duration: < 10s

### Total CD Duration: ~15-20 minunte

---

## Environments

### Development (Local)
```bash
URL: http://localhost:3000
DB: PostgreSQL local
Storage: Local filesystem
Deploy: Manual (npm run dev)
```

### Staging (Preview)
```bash
URL: https://staging.sanduta.art
DB: PostgreSQL Staging (Supabase/Neon)
Storage: Cloudinary (staging bucket)
Deploy: Auto pe push în main
Tests: Full test suite
```

### Production (Live)
```bash
URL: https://sanduta.art
DB: PostgreSQL Production (HA)
Storage: Cloudinary (production bucket)
Deploy: Manual approval
Tests: Smoke tests only
Monitoring: 24/7 alerting
```

### Configuration

Vezi: [docs/ENVIRONMENTS.md](ENVIRONMENTS.md)

---

## Rollback System

### Modul: `src/modules/deploy/useRollback.ts`

### Features

- ✅ Rollback deployment (Vercel)
- ✅ Rollback database (snapshot restore)
- ✅ Rollback storage (Cloudinary)
- ✅ Rollback theme settings
- ✅ Rollback CMS content

### Usage

```typescript
import { rollbackSystem } from '@/modules/deploy/useRollback';

// Rollback to version
await rollbackSystem.rollback({
  environment: 'production',
  version: '1.2.3',
  reason: 'Critical bug detected',
  rollbackDatabase: true,
  rollbackStorage: true,
});
```

### CLI

```bash
# Rollback production
node src/modules/deploy/useRollback.ts production 1.2.3 "Critical bug"

# Rollback staging
node src/modules/deploy/useRollback.ts staging 1.2.2
```

### Target: < 10 secunde pentru rollback complet

---

## Monitoring

### Modul: `src/modules/deploy/useDeployMonitoring.ts`

### Metrics Collected

- **Build Time**: Duration pentru npm run build
- **Deploy Time**: Duration pentru deployment
- **Error Count**: Erori în timpul deploy-ului
- **Warning Count**: Warning-uri non-critice
- **Success Rate**: Procent deploy-uri reușite

### Usage

```typescript
import { deployMonitoring } from '@/modules/deploy/useDeployMonitoring';

// Start monitoring
deployMonitoring.startDeployment({
  version: '1.2.4',
  environment: 'production',
  commit: 'abc123',
  deployedBy: 'ci-cd',
});

// Track build
deployMonitoring.startBuild();
deployMonitoring.endBuild();

// Track deploy
deployMonitoring.startDeploy();
deployMonitoring.endDeploy();

// Complete
await deployMonitoring.completeDeployment('success');
```

### Alerting

- **Slack**: Notificări instant
- **Email**: Critical alerts (Resend)
- **Logs**: Vercel + External service

### Alert Triggers

- Build time > 5 minutes
- Deploy time > 3 minutes
- Error rate > 5%
- Any critical error

---

## Feature Flags

### Modul: `src/modules/flags/useFeatureFlags.ts`

### Features

- ✅ Enable/Disable funcționalități
- ✅ Rollout gradual (percentage-based)
- ✅ User/Role-based toggles
- ✅ Environment-based toggles
- ✅ A/B testing support

### Usage

```typescript
import { useFeatureFlags } from '@/modules/flags/useFeatureFlags';

function MyComponent() {
  const { isEnabled } = useFeatureFlags();

  if (isEnabled('new_editor')) {
    return <NewEditor />;
  }

  return <OldEditor />;
}
```

### CLI

```bash
# List all flags
node src/modules/flags/useFeatureFlags.ts list

# Enable flag
node src/modules/flags/useFeatureFlags.ts enable new_editor

# Disable flag
node src/modules/flags/useFeatureFlags.ts disable beta_features

# Set rollout percentage
node src/modules/flags/useFeatureFlags.ts rollout new_editor 50
```

### Default Flags

- `new_editor`: New design editor (dev/staging only)
- `advanced_reports`: Advanced analytics (admin/manager)
- `cms_system`: Content management (admin only)
- `theme_customizer`: Live theme customization
- `notifications`: Real-time notifications
- `backup_system`: Automated backups (admin only)
- `marketing_tools`: Marketing automation
- `beta_features`: Early access features (non-prod)

---

## Versioning

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Conventional Commits

```bash
feat: Add new editor
fix: Fix cart calculation bug
BREAKING CHANGE: Remove old API

chore: Update dependencies
docs: Update README
style: Format code
refactor: Simplify checkout logic
perf: Optimize image loading
test: Add cart tests
```

### Automated Version Generation

```bash
# Generate next version based on commits
node scripts/generateVersion.js

# Update package.json
node scripts/generateVersion.js --update-package
```

### Changelog Generation

```bash
# Generate CHANGELOG.md
node scripts/generateChangelog.ts

# For specific version
node scripts/generateChangelog.ts 1.2.4
```

### Git Tags

```bash
# Create tag (automated in CD pipeline)
git tag -a v1.2.4 -m "Release v1.2.4"
git push origin v1.2.4

# List tags
git tag -l

# Delete tag
git tag -d v1.2.4
git push origin :refs/tags/v1.2.4
```

---

## Best Practices

### 1. Testing

- ✅ Write tests for all new features
- ✅ Maintain > 80% code coverage
- ✅ Run tests locally before push
- ✅ Fix failing tests immediately

### 2. Commits

- ✅ Use Conventional Commits format
- ✅ Keep commits atomic and focused
- ✅ Write descriptive commit messages
- ✅ Reference issues in commits

### 3. Deployments

- ✅ Always deploy to staging first
- ✅ Run smoke tests before production
- ✅ Schedule deploys during low traffic
- ✅ Monitor metrics after deploy
- ✅ Have rollback plan ready

### 4. Database Migrations

- ✅ Test migrations on staging first
- ✅ Make migrations backward compatible
- ✅ Take database backup before migration
- ✅ Have rollback SQL ready

### 5. Monitoring

- ✅ Set up alerts for critical metrics
- ✅ Monitor deployment metrics
- ✅ Review logs regularly
- ✅ Respond to alerts promptly

### 6. Security

- ✅ Never commit secrets
- ✅ Rotate secrets regularly
- ✅ Use GitHub Secrets for CI/CD
- ✅ Run security scans
- ✅ Keep dependencies updated

### 7. Documentation

- ✅ Document all CI/CD changes
- ✅ Update runbooks for incidents
- ✅ Keep README current
- ✅ Document rollback procedures

---

## Quick Commands

### Local Development

```bash
# Start development
npm run dev

# Run tests
npm test
npm run test:unit
npm run test:integration
npm run test:e2e

# Build
npm run build

# Lint
npm run lint
```

### CI/CD

```bash
# Trigger CI manually
gh workflow run ci-cd.yml

# Trigger staging deploy
gh workflow run cd.yml -f environment=staging

# Trigger production deploy
gh workflow run cd.yml -f environment=production

# Rollback
gh workflow run cd.yml -f rollback=true -f version=1.2.3
```

### Smoke Tests

```bash
# Local
npm run smoke-tests -- --environment development

# Staging
npm run smoke-tests -- --environment staging

# Production
npm run smoke-tests -- --environment production
```

### Feature Flags

```bash
# List flags
npm run flags:list

# Enable flag
npm run flags:enable new_editor

# Disable flag
npm run flags:disable beta_features
```

---

## Troubleshooting

### CI Failures

#### Tests Failing

```bash
# Run tests locally first
npm test

# Check test logs in GitHub Actions
# Fix failing tests and push again
```

#### Build Failing

```bash
# Check build locally
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check for missing env vars
```

### CD Failures

#### Deployment Failed

```bash
# Check Vercel logs
vercel logs <deployment-url>

# Check GitHub Actions logs
# Look for error in deploy step

# Rollback if needed
gh workflow run cd.yml -f rollback=true -f version=<previous-version>
```

#### Smoke Tests Failed

```bash
# Check which test failed
cat smoke-test-results/failed.json

# Test manually
curl https://sanduta.art/api/health

# Fix issue and redeploy
```

### Rollback Issues

```bash
# Manual rollback via Vercel
vercel rollback <deployment-id> --token $VERCEL_TOKEN

# Check health after rollback
curl https://sanduta.art/api/health

# Notify team
node scripts/notifyRollback.js --environment production
```

---

## GitHub Secrets Required

```bash
# Database
DATABASE_URL
DATABASE_URL_STAGING
DATABASE_URL_TEST

# NextAuth
NEXTAUTH_SECRET
NEXTAUTH_SECRET_STAGING
NEXTAUTH_SECRET_TEST

# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# External Services
PAYNET_API_KEY
PAYNET_SECRET
NOVA_POSHTA_API_KEY
RESEND_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Monitoring
SLACK_WEBHOOK
LHCI_GITHUB_APP_TOKEN
SNYK_TOKEN

# Deployment
STAGING_API_KEY
PRODUCTION_API_KEY
REVALIDATE_SECRET
```

### Set Secrets

```bash
# Via GitHub CLI
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"

# Via GitHub UI
# Settings → Secrets and variables → Actions → New repository secret
```

---

## Performance Targets

### CI Pipeline

- Total duration: < 20 minutes
- Cache hit rate: > 90%
- Parallel jobs: Yes
- Failure rate: < 5%

### CD Pipeline

- Staging deploy: < 3 minutes
- Production deploy: < 5 minutes
- Rollback time: < 10 seconds
- Success rate: > 95%

### Testing

- Unit tests: < 1 minute
- Integration tests: < 2 minutes
- E2E tests: < 5 minutes
- Code coverage: > 80%

---

## Support & Resources

### Documentation

- [Environments](ENVIRONMENTS.md)
- [Blue-Green Deployment](BLUE_GREEN_DEPLOYMENT.md)
- [Testing Strategy](TESTING.md)
- [Backup System](BACKUP_SYSTEM.md)

### External Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

### Contact

- **Team Lead**: Check project README
- **CI/CD Issues**: Open GitHub issue with label `ci/cd`
- **Emergency**: Use Slack #alerts channel

---

## Changelog

### v1.0.0 (2026-01-11)

- ✅ Initial CI/CD pipeline setup
- ✅ Multi-stage testing (unit, integration, API, E2E)
- ✅ Automated deployment to staging/production
- ✅ Rollback system implementation
- ✅ Deploy monitoring and alerting
- ✅ Feature flags system
- ✅ Semantic versioning automation
- ✅ Smoke tests post-deploy
- ✅ Blue-green deployment strategy
- ✅ Comprehensive documentation

---

**Pipeline Status**: 🟢 Operational  
**Last Updated**: 2026-01-11  
**Maintainer**: CI/CD Team
