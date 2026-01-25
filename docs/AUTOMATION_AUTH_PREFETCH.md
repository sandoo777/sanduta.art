# Automation — Auth Prefetch Safety

## 📋 Overview

Automation setup pentru a preveni regresia Auth Prefetch issue-ului. Include:
1. **ESLint Rule** — static analysis
2. **Pre-commit Hook** — runtime check
3. **CI/CD Integration** — continuous validation

---

## 🔧 1. ESLint Rule

### Setup

**File:** `.eslintrc-authlink.js`

**Rule:** `no-unsafe-link-in-auth-routes`

**Functionality:**
- Detectează `import Link from 'next/link'` în auth routes
- Detectează `<Link>` JSX tags în auth routes
- **Auto-fix:** Înlocuiește automat cu AuthLink

### Integration

Add to `eslint.config.mjs`:

```javascript
import noUnsafeLinkInAuthRoutes from './.eslintrc-authlink.js';

export default [
  {
    plugins: {
      'custom': {
        rules: {
          'no-unsafe-link-in-auth-routes': noUnsafeLinkInAuthRoutes,
        }
      }
    },
    rules: {
      'custom/no-unsafe-link-in-auth-routes': 'error',
    }
  }
];
```

### Usage

```bash
# Run lint check
npm run lint

# Auto-fix unsafe Links
npm run lint -- --fix
```

### Scope

Checks files in:
- `src/app/account/**`
- `src/app/admin/**`
- `src/app/manager/**`
- `src/app/operator/**`
- `src/components/account/**`
- `src/components/admin/**`

**Skips:** Public routes (homepage, catalog, etc.)

---

## 🪝 2. Pre-commit Hook

### Setup

**File:** `.husky/pre-commit`

**Functionality:**
- Runs before every `git commit`
- Checks **only staged files** (fast!)
- Blocks commit if unsafe Link detected
- Provides clear fix instructions

### Installation

```bash
# Install husky (if not already)
npm install --save-dev husky
npx husky install

# Make hook executable
chmod +x .husky/pre-commit
```

### Behavior

**Success case:**
```
🔍 Checking for unsafe Link usage in auth routes...
✅ All auth routes use AuthLink — safe to commit
```

**Failure case:**
```
❌ UNSAFE: src/app/admin/new-page.tsx uses Link instead of AuthLink

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ COMMIT BLOCKED — Unsafe Link usage detected

Auth-protected routes must use AuthLink to prevent prefetch crashes.

Fix:
  1. Replace: import Link from 'next/link'
     With:    import { AuthLink } from '@/components/common/links/AuthLink'

  2. Replace: <Link> with <AuthLink>

Or run: ./scripts/fix-auth-prefetch.sh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Bypass (Emergency Only)

```bash
# Skip pre-commit hook (NOT recommended)
git commit --no-verify -m "Emergency fix"
```

**Warning:** Bypass doar în cazuri de urgență. CI/CD va detecta și va bloca merge-ul.

---

## 🚀 3. CI/CD Integration

### GitHub Actions

Add to `.github/workflows/lint.yml`:

```yaml
name: Lint & Safety Checks

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  auth-prefetch-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Check Auth Prefetch Safety
        run: |
          echo "🔍 Checking for unsafe Link usage..."
          
          AUTH_FILES=$(find src/app/account src/app/admin src/app/manager src/app/operator src/components/account src/components/admin -name '*.tsx' -o -name '*.ts' 2>/dev/null || true)
          
          FOUND_UNSAFE=0
          for FILE in $AUTH_FILES; do
            if grep -q "from 'next/link'" "$FILE" || grep -q 'from "next/link"' "$FILE"; then
              if ! grep -q "AuthLink" "$FILE"; then
                echo "❌ UNSAFE: $FILE"
                FOUND_UNSAFE=1
              fi
            fi
          done
          
          if [ $FOUND_UNSAFE -eq 1 ]; then
            echo "❌ CI FAILED — Unsafe Link usage detected"
            exit 1
          fi
          
          echo "✅ All auth routes use AuthLink"
      
      - name: Run ESLint
        run: npm run lint
```

### Vercel Deployment

Add to `vercel.json`:

```json
{
  "buildCommand": "npm run lint && npm run build",
  "installCommand": "npm install && npm run lint"
}
```

Vercel va bloca deployment dacă ESLint detectează unsafe Links.

---

## 📊 4. Monitoring

### Production Error Tracking

Setup alerts pentru 502 errors cauzate de prefetch:

**Sentry/DataDog config:**

```javascript
// src/lib/monitoring.ts
if (error.message.includes('NEXT_REDIRECT') && 
    error.stack.includes('prefetch')) {
  Sentry.captureException(error, {
    tags: {
      type: 'auth-prefetch-crash',
      route: req.url,
    },
    level: 'error',
  });
}
```

### Metrics to Track

1. **502 Errors** — Should be 0 after AuthLink rollout
2. **Auth Redirect Rate** — Monitor `/login` redirects
3. **Prefetch Request Count** — Should decrease in auth routes
4. **User Navigation Speed** — Track Time to Interactive (TTI)

### Dashboard

Grafana query:

```promql
# 502 errors related to prefetch
sum(rate(http_requests_total{status="502", path=~"/account.*|/admin.*"}[5m]))

# Auth redirects
sum(rate(http_requests_total{status="307", path="/login"}[5m]))
```

**Alert threshold:** > 0 errors/min for 5 minutes

---

## 🧪 5. Testing

### Manual Test

```bash
# 1. Create test file with unsafe Link
cat > src/app/admin/test-unsafe.tsx << 'EOF'
import Link from 'next/link';

export default function TestUnsafe() {
  return <Link href="/admin/dashboard">Dashboard</Link>;
}
EOF

# 2. Try to commit
git add src/app/admin/test-unsafe.tsx
git commit -m "Test unsafe link"

# Expected: ❌ COMMIT BLOCKED

# 3. Fix with script
./scripts/fix-auth-prefetch.sh

# 4. Try again
git add src/app/admin/test-unsafe.tsx
git commit -m "Test safe link"

# Expected: ✅ Commit successful

# 5. Cleanup
rm src/app/admin/test-unsafe.tsx
```

### Automated Test

```bash
# Run pre-commit hook manually
.husky/pre-commit

# Run ESLint
npm run lint

# Expected: No errors
```

---

## 📝 6. Team Workflow

### For Developers

**When creating new auth route:**

1. ✅ **DO:** Use AuthLink from start
   ```typescript
   import { AuthLink } from '@/components/common/links/AuthLink';
   ```

2. ❌ **DON'T:** Use next/link
   ```typescript
   import Link from 'next/link'; // ❌ Will be blocked
   ```

3. 🔧 **If blocked:** Run fix script
   ```bash
   ./scripts/fix-auth-prefetch.sh
   ```

### For Code Reviewers

**PR Checklist:**

- [ ] No `import Link from 'next/link'` in auth routes
- [ ] All auth navigation uses `<AuthLink>`
- [ ] Pre-commit hook passed
- [ ] CI/CD checks green
- [ ] No 502 errors in staging

### For DevOps

**Deployment Checklist:**

- [ ] ESLint check passed
- [ ] No unsafe Links detected
- [ ] Zero 502 errors in staging
- [ ] Auth redirect rate normal
- [ ] Prefetch disabled on auth routes confirmed

---

## 🔄 7. Maintenance

### Weekly

- Review 502 error logs (should be 0)
- Check auth redirect patterns
- Verify ESLint rule still active

### Monthly

- Review AuthLink coverage (should be 100%)
- Update documentation if patterns change
- Check for new auth routes

### Quarterly

- Full audit of auth routes
- Update ESLint rule if Next.js changes
- Performance review of auth navigation

---

## 🆘 8. Troubleshooting

### ESLint rule not working

```bash
# Check ESLint config
npx eslint --print-config src/app/admin/page.tsx

# Reload ESLint in VSCode
Cmd+Shift+P → "ESLint: Restart ESLint Server"
```

### Pre-commit hook not running

```bash
# Check husky installation
npx husky install

# Make hook executable
chmod +x .husky/pre-commit

# Test manually
.husky/pre-commit
```

### False positives

If ESLint blocks legitimate usage:

```typescript
// Disable for specific line
// eslint-disable-next-line custom/no-unsafe-link-in-auth-routes
import Link from 'next/link';
```

**Warning:** Justify în code review why AuthLink nu e potrivit.

---

## 📚 References

- **AuthLink Component:** `docs/AUTH_LINK_COMPONENT.md`
- **Implementation Report:** `RAPORT_AUTH_PREFETCH_HARDENING.md`
- **Server Safety:** `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`
- **Fix Script:** `scripts/fix-auth-prefetch.sh`

---

**Last Updated:** 2026-01-25
**Status:** Production Ready ✅
**Coverage:** 100% of auth routes protected
