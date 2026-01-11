# CI/CD Scripts

Acest director conține scripturile necesare pentru pipeline-ul CI/CD.

## Scripts Disponibile

### Versioning

#### `generateVersion.js`
Generează versiune semantic based pe Conventional Commits.

```bash
# Generate version
node scripts/generateVersion.js

# Update package.json
node scripts/generateVersion.js --update-package
```

#### `generateChangelog.ts`
Generează CHANGELOG.md automat din git history.

```bash
# Generate changelog
npm run changelog:generate

# For specific version
npm run changelog:generate 1.2.4
```

### Testing & Validation

#### `smokeTests.js`
Smoke tests pentru validare post-deployment.

```bash
# Local
npm run smoke-tests -- --environment development

# Staging
npm run smoke-tests -- --environment staging --url https://staging.sanduta.art

# Production
npm run smoke-tests -- --environment production --url https://sanduta.art
```

#### `healthCheck.js`
Health check pentru application status.

```bash
# Check staging
npm run health-check -- --environment staging

# Check production
npm run health-check -- --environment production

# Custom URL
npm run health-check -- --url https://example.com
```

### Deployment

#### `recordDeployment.js`
Record deployment în database pentru history.

```bash
node scripts/recordDeployment.js \
  --environment production \
  --version 1.2.4 \
  --url https://sanduta.art \
  --commit abc123
```

#### `monitorDeployment.js`
Monitor deployment metrics live.

```bash
# Monitor for 5 minutes
npm run deploy:monitor -- \
  --environment production \
  --version 1.2.4 \
  --duration 5m
```

#### `notifyDeployment.js`
Send deployment notifications.

```bash
npm run deploy:notify -- \
  --environment production \
  --version 1.2.4 \
  --status success \
  --url https://sanduta.art
```

## Environment Variables

Scripts nevoie de următoarele environment variables:

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...

# Optional (pentru notificări)
SLACK_WEBHOOK=https://hooks.slack.com/services/...
RESEND_API_KEY=re_...

# Optional (pentru deployment)
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
```

## Usage în CI/CD

### În GitHub Actions

```yaml
- name: Generate version
  run: echo "VERSION=$(npm run version:generate)" >> $GITHUB_OUTPUT

- name: Run smoke tests
  run: npm run smoke-tests -- --environment staging

- name: Health check
  run: npm run health-check -- --environment production

- name: Notify deployment
  run: npm run deploy:notify -- --environment production --version $VERSION --status success
```

## Development

### Add New Script

1. Create script în `scripts/` directory
2. Make executable: `chmod +x scripts/myScript.js`
3. Add shebang: `#!/usr/bin/env node`
4. Add npm script în `package.json`
5. Document în acest README

### Testing Scripts

```bash
# Test locally
node scripts/myScript.js --help

# Test with npm
npm run my-script -- --arg value

# Test în CI (dry-run)
act -j test-script
```

## Troubleshooting

### Script fails with "Module not found"

```bash
# Install dependencies
npm install

# Regenerate Prisma client
npm run prisma:generate
```

### Permission denied

```bash
# Make script executable
chmod +x scripts/myScript.js
```

### Environment variables not set

```bash
# Check .env.local exists
cat .env.local

# Load env vars
source .env.local

# Or use dotenv
node -r dotenv/config scripts/myScript.js
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Exit Codes**: Use proper exit codes (0 = success, 1 = failure)
3. **Logging**: Log progress and errors clearly
4. **Arguments**: Support command-line arguments
5. **Documentation**: Document usage în comments
6. **Testing**: Test scripts locally before CI

## Links

- [CI/CD Documentation](../docs/CI_CD_COMPLETE.md)
- [GitHub Actions Workflows](../.github/workflows/)
- [Feature Flags](../src/modules/flags/)
- [Deployment Modules](../src/modules/deploy/)
