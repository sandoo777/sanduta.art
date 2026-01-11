# CI/CD Command Cheatsheet

Quick reference pentru comenzile CI/CD cele mai folosite.

## 🚀 Setup Initial

```bash
# Run setup script
./scripts/setup-cicd.sh

# Verify secrets
gh secret list

# Test connection
gh auth status
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# API tests
npm run test:api

# E2E tests
npm run test:e2e

# All tests + coverage
npm run test:all
```

## 🏗️ Build

```bash
# Build locally
npm run build

# Build + lint
npm run lint && npm run build

# Type check
npx tsc --noEmit
```

## 🚢 Deployment

```bash
# Auto-deploy to staging (push to main)
git push origin main

# Manual staging deploy
gh workflow run cd.yml -f environment=staging

# Production deploy
gh workflow run cd.yml -f environment=production

# Check deployment status
gh run list
gh run watch
```

## 🔄 Rollback

```bash
# Rollback production
gh workflow run cd.yml \
  -f environment=production \
  -f rollback=true \
  -f version=1.2.3

# Emergency rollback
node src/modules/deploy/useRollback.ts production 1.2.3

# Verify rollback
curl https://sanduta.art/api/health
```

## 🚩 Feature Flags

```bash
# List all flags
npm run flags:list
# sau
tsx src/modules/flags/useFeatureFlags.ts list

# Enable flag
npm run flags:enable new_editor

# Disable flag
npm run flags:disable beta_features

# Set rollout percentage
npm run flags:rollout new_editor 50
```

## 📊 Monitoring

```bash
# Health check production
npm run health-check -- --environment production

# Health check staging
npm run health-check -- --environment staging

# Smoke tests
npm run smoke-tests -- --environment production

# Monitor deployment
npm run deploy:monitor -- \
  --environment production \
  --duration 5m
```

## 🔖 Versioning

```bash
# Generate version
npm run version:generate

# Update package.json version
npm run version:update

# Generate changelog
npm run changelog:generate

# Create git tag
git tag -a v1.2.4 -m "Release v1.2.4"
git push origin v1.2.4
```

## 📝 Commit Messages

```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve login redirect issue"

# Breaking change
git commit -m "feat!: redesign API endpoints"

# Other types
git commit -m "chore: update dependencies"
git commit -m "docs: update README"
git commit -m "style: format code with prettier"
git commit -m "refactor: simplify cart logic"
git commit -m "perf: optimize database queries"
git commit -m "test: add checkout tests"
```

## 🔐 Secrets Management

```bash
# List secrets
gh secret list

# Set secret
gh secret set DATABASE_URL --body "postgresql://..."

# Set from file
gh secret set SSH_KEY < ~/.ssh/id_rsa

# Delete secret
gh secret delete SECRET_NAME

# Generate random secret
openssl rand -base64 32
```

## 📋 GitHub Actions

```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run workflow-name.yml

# View workflow runs
gh run list

# Watch latest run
gh run watch

# View run details
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>

# Cancel run
gh run cancel <run-id>

# Rerun failed jobs
gh run rerun <run-id>
```

## 🌐 Vercel

```bash
# List deployments
vercel list

# Deploy
vercel deploy

# Deploy to production
vercel deploy --prod

# View logs
vercel logs

# Promote deployment
vercel promote <deployment-url>

# Rollback (alias to previous)
vercel alias set <old-deployment-url> sanduta.art

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
```

## 🗄️ Database

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (dev only!)
npx prisma migrate reset
```

## 🔍 Debugging

```bash
# View CI logs
gh run view <run-id> --log

# View specific job
gh run view <run-id> --job=<job-id> --log

# View Vercel logs
vercel logs <deployment-url>

# Local build test
npm run build 2>&1 | tee build.log

# Test deployment locally
vercel dev
```

## 📦 Artifacts

```bash
# Download build artifacts
gh run download <run-id>

# Download specific artifact
gh run download <run-id> -n artifact-name

# List artifacts
gh api repos/:owner/:repo/actions/runs/:run_id/artifacts
```

## 🧹 Maintenance

```bash
# Clean node_modules
rm -rf node_modules package-lock.json
npm install

# Clean Next.js cache
rm -rf .next

# Clean Playwright cache
rm -rf ~/.cache/ms-playwright
npm run playwright:install

# Update dependencies
npm update

# Check outdated packages
npm outdated

# Audit dependencies
npm audit
npm audit fix
```

## 🎯 Quick Workflows

### Deploy to staging și test
```bash
git push origin main && \
gh run watch && \
npm run smoke-tests -- --environment staging
```

### Full test local
```bash
npm run lint && \
npm run test:all && \
npm run build
```

### Production deploy cu verificare
```bash
gh workflow run cd.yml -f environment=production && \
gh run watch && \
npm run health-check -- --environment production
```

### Emergency rollback
```bash
gh workflow run cd.yml \
  -f environment=production \
  -f rollback=true \
  -f version=$(git describe --tags --abbrev=0 | sed 's/v//') && \
curl https://sanduta.art/api/health
```

## 🔗 Useful Links

```bash
# Open repository
gh repo view --web

# Open actions
gh repo view --web -b actions

# Open specific run
gh run view <run-id> --web

# Open Vercel dashboard
open https://vercel.com/sandoo777/sanduta-art
```

## 💡 Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# CI/CD aliases
alias ci-test='npm run test:all'
alias ci-build='npm run build'
alias ci-deploy-staging='gh workflow run cd.yml -f environment=staging'
alias ci-deploy-prod='gh workflow run cd.yml -f environment=production'
alias ci-watch='gh run watch'
alias ci-logs='gh run view --log'

# Feature flags aliases
alias ff-list='npm run flags:list'
alias ff-enable='npm run flags:enable'
alias ff-disable='npm run flags:disable'

# Deployment aliases
alias deploy-staging='git push origin main && gh run watch'
alias deploy-prod='gh workflow run cd.yml -f environment=production'
alias rollback='gh workflow run cd.yml -f rollback=true'

# Health check aliases
alias health-staging='npm run health-check -- --environment staging'
alias health-prod='npm run health-check -- --environment production'
alias smoke-staging='npm run smoke-tests -- --environment staging'
alias smoke-prod='npm run smoke-tests -- --environment production'
```

## 📚 More Help

```bash
# GitHub CLI help
gh help

# Workflow help
gh workflow --help

# Run help
gh run --help

# Vercel help
vercel --help

# npm scripts
npm run
```

---

**Tip**: Save this file local și folosește `Ctrl+F` / `Cmd+F` pentru search rapid!
