# 🚀 CI/CD Quick Start Guide

Ghid rapid pentru configurarea și utilizarea pipeline-ului CI/CD.

## ⚡ Setup Rapid (5 minute)

### Pas 1: Install GitHub CLI

```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt update
sudo apt install gh

# Windows
winget install --id GitHub.cli
```

### Pas 2: Autentificare

```bash
gh auth login
```

### Pas 3: Run Setup Script

```bash
cd /workspaces/sanduta.art
./scripts/setup-cicd.sh
```

Scriptul va cere:
- Database URLs (production, staging, test)
- Vercel credentials
- External API keys
- Monitoring webhooks (optional)

**Secrets auto-generate**: NextAuth secrets, API keys, revalidation tokens

### Pas 4: Verificare

```bash
# Check secrets configured
gh secret list

# Should show:
# DATABASE_URL
# NEXTAUTH_SECRET
# VERCEL_TOKEN
# ... etc
```

---

## 🧪 Test CI Pipeline

### Prima rulare

```bash
# Commit și push
git add .
git commit -m "feat: test CI pipeline"
git push origin main

# Monitor în browser
gh run watch

# Sau deschide GitHub Actions
gh repo view --web
```

### Verificare rezultate

```bash
# List runs
gh run list

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

---

## 🚢 Deploy la Staging

### Auto-deploy (pe push în main)

```bash
# Simplu push declanșează staging deploy
git push origin main

# CI va rula → apoi CD la staging
```

### Manual deploy

```bash
# Trigger staging deploy
gh workflow run cd.yml -f environment=staging

# Monitor
gh run watch
```

### Verificare staging

```bash
# Health check
curl https://staging.sanduta.art/api/health

# Smoke tests
npm run smoke-tests -- --environment staging

# Open în browser
open https://staging.sanduta.art
```

---

## 🎯 Deploy la Production

### Manual cu approval

```bash
# Trigger production deploy
gh workflow run cd.yml -f environment=production

# Așteaptă manual approval în GitHub UI
# https://github.com/sandoo777/sanduta.art/actions

# Monitor după approval
gh run watch
```

### Verificare production

```bash
# Health check
npm run health-check -- --environment production

# Smoke tests
npm run smoke-tests -- --environment production

# Monitor metrics
npm run deploy:monitor -- --environment production --duration 5m
```

---

## 🔄 Rollback

### Quick rollback

```bash
# Rollback la versiunea anterioară
gh workflow run cd.yml \
  -f environment=production \
  -f rollback=true \
  -f version=1.2.3

# Verify
curl https://sanduta.art/api/health
```

### Emergency rollback (< 10s)

```bash
# Direct via module
node src/modules/deploy/useRollback.ts production 1.2.3 "Emergency rollback"
```

---

## 🚩 Feature Flags

### Folosire în cod

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

### CLI Commands

```bash
# List all flags
npm run flags:list

# Enable feature
npm run flags:enable new_editor

# Disable feature
npm run flags:disable beta_features

# Set rollout percentage (gradual rollout)
npm run flags:rollout new_editor 50
```

---

## 📊 Monitoring

### Live monitoring

```bash
# Monitor deployment for 5 minutes
npm run deploy:monitor -- \
  --environment production \
  --version 1.2.4 \
  --duration 5m
```

### Health checks

```bash
# Check production
npm run health-check -- --environment production

# Check staging
npm run health-check -- --environment staging
```

### Logs

```bash
# View în Vercel
vercel logs production

# View în GitHub Actions
gh run view <run-id> --log
```

---

## 🔖 Versioning

### Generate version

```bash
# Generate next version based on commits
npm run version:generate

# Output: 1.2.4

# Update package.json
npm run version:update
```

### Generate changelog

```bash
# Generate CHANGELOG.md
npm run changelog:generate

# Review
cat CHANGELOG.md
```

### Commit conventions

```bash
# Feature (minor bump)
git commit -m "feat: add new payment method"

# Fix (patch bump)
git commit -m "fix: resolve cart calculation bug"

# Breaking change (major bump)
git commit -m "feat!: redesign checkout flow
BREAKING CHANGE: removed old checkout API"

# Other types
git commit -m "chore: update dependencies"
git commit -m "docs: update README"
git commit -m "style: format code"
git commit -m "refactor: simplify auth logic"
git commit -m "perf: optimize image loading"
git commit -m "test: add cart tests"
```

---

## 🐛 Troubleshooting

### CI fails

**Tests failing**:
```bash
# Run tests locally
npm test

# Fix issues
# Push again
git push
```

**Build failing**:
```bash
# Build locally
npm run build

# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint
```

### CD fails

**Deployment failed**:
```bash
# Check Vercel logs
vercel logs

# Check workflow logs
gh run view --log

# Retry
gh workflow run cd.yml -f environment=staging
```

**Smoke tests failed**:
```bash
# Check failed tests
cat smoke-test-results/failed.json

# Test manually
curl https://staging.sanduta.art/api/health

# Fix și redeploy
```

### Secrets issues

**Missing secrets**:
```bash
# List secrets
gh secret list

# Set missing secret
gh secret set SECRET_NAME --body "value"

# Re-run setup
./scripts/setup-cicd.sh
```

---

## 📚 Resources

### Documentation
- **Main Guide**: [docs/CI_CD_COMPLETE.md](../docs/CI_CD_COMPLETE.md)
- **Environments**: [docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md)
- **Blue-Green**: [docs/BLUE_GREEN_DEPLOYMENT.md](../docs/BLUE_GREEN_DEPLOYMENT.md)
- **Scripts**: [scripts/README.md](../scripts/README.md)

### GitHub Actions
- **Workflows**: [.github/workflows/](.github/workflows/)
- **Actions**: https://github.com/sandoo777/sanduta.art/actions

### External Links
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✅ Checklist După Setup

- [ ] GitHub Secrets configured
- [ ] CI pipeline tested
- [ ] Staging deploy succeeds
- [ ] Smoke tests pass
- [ ] Production deploy tested
- [ ] Rollback tested în staging
- [ ] Feature flags funcționează
- [ ] Monitoring active
- [ ] Team trained pe workflow
- [ ] Documentation reviewed

---

## 🎓 Training Videos (TODO)

- [ ] How to trigger deployments
- [ ] How to read CI/CD logs
- [ ] How to perform rollbacks
- [ ] How to use feature flags
- [ ] How to write good commits

---

## 💡 Pro Tips

1. **Always test în staging first**
2. **Use feature flags pentru risky changes**
3. **Monitor metrics după deploy**
4. **Keep commits small and focused**
5. **Write descriptive commit messages**
6. **Review smoke test results**
7. **Have rollback plan ready**
8. **Schedule deploys în low-traffic periods**

---

## 🆘 Support

**CI/CD Issues**: Open issue cu label `ci/cd`  
**Emergency**: Slack #alerts  
**Questions**: Team channel sau docs/

---

**Last Updated**: 2026-01-11  
**Version**: 1.0.0  
**Status**: ✅ Ready to use
