# Environment Configuration

## Overview
Acest proiect folosește trei medii separate: development, staging și production. Fiecare environment are resursele sale dedicate pentru siguranță și izolare.

## Environments

### Development (Local)
- **DATABASE_URL**: `postgresql://postgres:postgres@localhost:5432/sanduta_dev`
- **NEXTAUTH_URL**: `http://localhost:3000`
- **NEXTAUTH_SECRET**: (generat local)
- **Storage**: Local filesystem
- **Logging**: Console + local files

### Staging (Preview)
- **DATABASE_URL**: `postgresql://user:pass@staging-db.example.com:5432/sanduta_staging`
- **NEXTAUTH_URL**: `https://staging.sanduta.art`
- **NEXTAUTH_SECRET**: (secret din GitHub Secrets: `NEXTAUTH_SECRET_STAGING`)
- **Storage**: Cloudinary staging bucket
- **Logging**: Vercel + external service
- **Auto-deploy**: La fiecare push în `main`

### Production (Live)
- **DATABASE_URL**: `postgresql://user:pass@prod-db.example.com:5432/sanduta_prod`
- **NEXTAUTH_URL**: `https://sanduta.art`
- **NEXTAUTH_SECRET**: (secret din GitHub Secrets: `NEXTAUTH_SECRET`)
- **Storage**: Cloudinary production bucket
- **Logging**: Vercel + external service
- **Deploy**: Manual approval required

## Environment Variables

### GitHub Secrets Required

```bash
# Database URLs
DATABASE_URL                  # Production
DATABASE_URL_STAGING          # Staging
DATABASE_URL_TEST            # Testing

# NextAuth
NEXTAUTH_SECRET              # Production
NEXTAUTH_SECRET_STAGING      # Staging
NEXTAUTH_SECRET_TEST         # Testing

# Vercel
VERCEL_TOKEN                 # Deployment token
VERCEL_ORG_ID                # Organization ID
VERCEL_PROJECT_ID            # Project ID

# External Services
PAYNET_API_KEY               # Payment provider
PAYNET_SECRET                # Payment provider secret
NOVA_POSHTA_API_KEY          # Delivery service
RESEND_API_KEY               # Email service
CLOUDINARY_CLOUD_NAME        # Image CDN
CLOUDINARY_API_KEY           # Image CDN key
CLOUDINARY_API_SECRET        # Image CDN secret

# Monitoring & Notifications
SLACK_WEBHOOK                # Deployment notifications
LHCI_GITHUB_APP_TOKEN        # Lighthouse CI
SNYK_TOKEN                   # Security scanning (optional)

# API Keys
STAGING_API_KEY              # For smoke tests
PRODUCTION_API_KEY           # For smoke tests
REVALIDATE_SECRET            # ISR revalidation
```

### Local Development (.env.local)

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sanduta_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars-long-dev"

# External Services (use test keys)
PAYNET_API_KEY="test_key"
PAYNET_SECRET="test_secret"
NOVA_POSHTA_API_KEY="test_key"
RESEND_API_KEY="test_key"
CLOUDINARY_CLOUD_NAME="test"
CLOUDINARY_API_KEY="test"
CLOUDINARY_API_SECRET="test"

# Feature Flags
FEATURE_NEW_EDITOR="true"
FEATURE_ADVANCED_REPORTS="false"
```

## Environment Setup

### 1. Local Development

```bash
# Clone repository
git clone https://github.com/sandoo777/sanduta.art.git
cd sanduta.art

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your local configuration
# Start PostgreSQL locally or use Docker
docker-compose up -d postgres

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run dev
```

### 2. Staging Setup

```bash
# Configure GitHub Secrets pentru staging
gh secret set DATABASE_URL_STAGING --body "postgresql://..."
gh secret set NEXTAUTH_SECRET_STAGING --body "$(openssl rand -base64 32)"

# Deploy manual la staging (first time)
npm run deploy:staging
```

### 3. Production Setup

```bash
# Configure GitHub Secrets pentru production
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set VERCEL_TOKEN --body "..."
gh secret set VERCEL_ORG_ID --body "..."
gh secret set VERCEL_PROJECT_ID --body "..."

# Configure toate serviciile externe
gh secret set PAYNET_API_KEY --body "..."
gh secret set NOVA_POSHTA_API_KEY --body "..."
gh secret set RESEND_API_KEY --body "..."
# etc.

# Deployment se face automat prin CD pipeline
```

## Database Separation

### Development
- Local PostgreSQL instance
- Full reset allowed
- Test data seed

### Staging
- Managed PostgreSQL (e.g., Supabase, Neon, Railway)
- Mimics production schema
- Refreshed periodically from production backup
- Test data for QA

### Production
- Managed PostgreSQL with high availability
- Daily automated backups
- Point-in-time recovery enabled
- Connection pooling (PgBouncer)
- Read replicas for analytics

## Storage Separation

### Development
```javascript
// Local filesystem
UPLOAD_DIR=/tmp/sanduta-uploads
```

### Staging
```javascript
// Cloudinary with staging folder
CLOUDINARY_FOLDER=sanduta-staging
```

### Production
```javascript
// Cloudinary production folder
CLOUDINARY_FOLDER=sanduta-production
```

## Logs Separation

### Development
- Console output
- Local files: `logs/dev-*.log`

### Staging
- Vercel logs
- External logging service (optional)
- Retention: 7 days

### Production
- Vercel logs
- External logging service (e.g., Logtail, Better Stack)
- Retention: 90 days
- Alert on errors

## Environment Switching

### Using environment variables
```typescript
// src/lib/env.ts
export const ENV = process.env.NODE_ENV || 'development';
export const IS_DEV = ENV === 'development';
export const IS_STAGING = process.env.VERCEL_ENV === 'preview';
export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

export function getEnvConfig() {
  if (IS_PRODUCTION) {
    return {
      apiUrl: 'https://sanduta.art',
      cdnUrl: 'https://res.cloudinary.com/sanduta-production',
    };
  }
  
  if (IS_STAGING) {
    return {
      apiUrl: 'https://staging.sanduta.art',
      cdnUrl: 'https://res.cloudinary.com/sanduta-staging',
    };
  }
  
  return {
    apiUrl: 'http://localhost:3000',
    cdnUrl: '/uploads',
  };
}
```

### Environment-specific features
```typescript
// src/modules/flags/useFeatureFlags.ts
import { IS_PRODUCTION, IS_STAGING } from '@/lib/env';

export function useFeatureFlags() {
  return {
    enableNewEditor: !IS_PRODUCTION || process.env.FEATURE_NEW_EDITOR === 'true',
    enableAdvancedReports: IS_STAGING || IS_PRODUCTION,
    enableBetaFeatures: !IS_PRODUCTION,
  };
}
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate secrets** regularly (quarterly)
3. **Use different API keys** for each environment
4. **Limit staging access** to team only
5. **Monitor production** for unauthorized access
6. **Enable 2FA** for all services
7. **Use least privilege** principle for database users

## Monitoring

### Development
- Local console
- Browser DevTools

### Staging
- Vercel Analytics
- Error tracking (optional)

### Production
- Vercel Analytics
- Error tracking (Sentry/LogRocket)
- Performance monitoring
- Uptime monitoring (UptimeRobot)
- Database monitoring

## Disaster Recovery

### Staging
- Daily database snapshots
- Restore time: < 1 hour

### Production
- Hourly database backups
- Point-in-time recovery
- Restore time: < 15 minutes
- RPO: 1 hour
- RTO: 15 minutes

## Environment Validation

```bash
# Validate environment configuration
npm run validate:env

# Check database connection
npm run db:check

# Verify all services
npm run services:check
```

## Troubleshooting

### Cannot connect to database
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Check PostgreSQL is running
docker ps | grep postgres
```

### Build fails with missing env vars
```bash
# List all required env vars
npm run env:list

# Copy from .env.example
cp .env.example .env.local

# Validate all vars are set
npm run env:validate
```

### Deployment fails
```bash
# Check GitHub Secrets
gh secret list

# Verify Vercel configuration
vercel env ls

# Check deployment logs
vercel logs <deployment-url>
```

## Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
