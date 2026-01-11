# Security System - Quick Start Guide

## 🚀 Setup rapid (5 minute)

### 1. Instalare dependencies

```bash
cd /workspaces/sanduta.art

# Core security packages
npm install @node-rs/argon2 speakeasy qrcode isomorphic-dompurify

# Type definitions
npm install -D @types/speakeasy @types/qrcode
```

### 2. Environment variables

Adaugă în `.env.local`:

```env
# NextAuth (generate cu: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-key-min-32-characters-here

# Redis pentru production (optional, Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Security alerts (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
SECURITY_ALERT_EMAIL=security@sanduta.art
```

### 3. Database migration

```bash
# Adaugă câmpurile de securitate în schema Prisma
npx prisma migrate dev --name add_security_fields

# Generează client
npx prisma generate
```

### 4. Test rapid

```bash
# Run security tests
npm run test src/__tests__/security.test.ts

# Start dev server
npm run dev
```

## ✅ Verificare instalare

### Test 1: Password hashing (Argon2id)

```bash
# Rulează în terminal
node -e "
const { hash, verify } = require('@node-rs/argon2');
(async () => {
  const h = await hash('TestPassword123!');
  console.log('✅ Argon2id hash:', h.substring(0, 50) + '...');
  const ok = await verify(h, 'TestPassword123!');
  console.log('✅ Verify:', ok ? 'SUCCESS' : 'FAILED');
})();
"
```

### Test 2: 2FA token generation

```bash
node -e "
const speakeasy = require('speakeasy');
const secret = speakeasy.generateSecret({ length: 32 });
console.log('✅ 2FA Secret:', secret.base32.substring(0, 20) + '...');
const token = speakeasy.totp({ secret: secret.base32, encoding: 'base32' });
console.log('✅ TOTP Token:', token);
"
```

### Test 3: XSS sanitization

```bash
node -e "
const createDOMPurify = require('isomorphic-dompurify');
const DOMPurify = createDOMPurify();
const clean = DOMPurify.sanitize('<script>alert(1)</script>Hello');
console.log('✅ Sanitized:', clean);
"
```

## 🔐 Utilizare rapidă

### Protejează un API route

```typescript
// src/app/api/orders/route.ts
import { enforcePermission } from '@/lib/auth/enforcePermissions';
import { withSecurityMiddleware } from '@/middleware/security';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  // Check permission
  const { user, error } = await enforcePermission(req, 'orders.view');
  if (error) return error;

  // Your logic here
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}

export const GET = withSecurityMiddleware(handler);
```

### Validează fișier upload

```typescript
import { FileUploadValidator, ALLOWED_MIME_TYPES } from '@/modules/files/validateFile';

const file = formData.get('file') as File;
const result = await FileUploadValidator.validateFile(
  file,
  ALLOWED_MIME_TYPES.images,
  5 * 1024 * 1024 // 5 MB
);

if (!result.isValid) {
  return NextResponse.json({ errors: result.errors }, { status: 400 });
}
```

### Sanitizează user input

```typescript
import { sanitizeHtml, sanitizePlainText } from '@/lib/security/sanitize';

// Rich text (keep some HTML)
const safeHtml = sanitizeHtml(userComment);

// Plain text (strip all HTML)
const safeText = sanitizePlainText(userInput);
```

### Monitorizează evenimente security

```typescript
import { SecurityMonitoring } from '@/modules/security/useSecurityMonitoring';

const monitoring = new SecurityMonitoring();

// Login failure
monitoring.recordLoginFailed(userId, ipAddress);

// XSS attempt
monitoring.recordXssAttempt(ipAddress, maliciousInput);

// Unauthorized access
monitoring.recordUnauthorizedAccess(userId, requestedResource);
```

## 🧪 Test rapid (manual)

```bash
# 1. Test brute force (5 failed logins)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done
# Ar trebui să vezi "Account locked" după 5 încercări

# 2. Test CSRF protection
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[]}'
# Ar trebui să primești 403 Forbidden

# 3. Test rate limiting
for i in {1..100}; do
  curl -s http://localhost:3000/api/products > /dev/null
done
# Ar trebui să primești 429 Too Many Requests după ~60 requests

# 4. Test security headers
curl -I http://localhost:3000 | grep -E "X-Frame-Options|Content-Security-Policy"
# Ar trebui să vezi headerele de securitate
```

## 📚 Următorii pași

1. **Citește documentația completă:** [SECURITY_SYSTEM.md](./SECURITY_SYSTEM.md)
2. **Configurează alertele:** Setup Slack/Email pentru notificări
3. **Activează 2FA:** Pentru toți adminii
4. **Review audit logs:** Verifică evenimente în baza de date
5. **Penetration testing:** Rulează OWASP ZAP sau Burp Suite

## 🆘 Troubleshooting

### Error: "Cannot find module '@node-rs/argon2'"

```bash
npm install @node-rs/argon2
npm run postinstall
```

### Error: "Prisma Client not found"

```bash
npx prisma generate
```

### Testele nu se rulează

```bash
# Verifică vitest config
cat vitest.config.ts

# Reinstalează dependencies
rm -rf node_modules package-lock.json
npm install
```

### Rate limiting nu funcționează

```bash
# Verifică dacă Redis este configurat
echo $UPSTASH_REDIS_REST_URL

# Dacă nu ai Redis, folosește in-memory (doar pentru dev)
# Rate limiting va funcționa per proces
```

## 🔗 Links utile

- **Documentație completă:** [SECURITY_SYSTEM.md](./SECURITY_SYSTEM.md)
- **Teste:** [src/__tests__/security.test.ts](../src/__tests__/security.test.ts)
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Argon2 Guide:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

---

**Status:** ✅ Ready to use  
**Time to setup:** ~5 minutes  
**Difficulty:** ⭐⭐☆☆☆ (Medium)
