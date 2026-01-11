# Security System Documentation

## Системаоборонец (Comprehensive Security Architecture)

**Statус:** ✅ Implementat complet  
**Versiune:** 1.0.0  
**Data:** 2024-01-10

---

## 📋 Cuprins

1. [Arhitectură](#arhitectură)
2. [Componente Security](#componente-security)
3. [Configurare](#configurare)
4. [Utilizare](#utilizare)
5. [Best Practices](#best-practices)
6. [Testing](#testing)
7. [Incident Response](#incident-response)
8. [Compliance](#compliance)

---

## 🏗️ Arhitectură

### Layered Security Model

```
┌─────────────────────────────────────┐
│  Application Layer (React/Next.js)  │
│  - CSRF Protection                  │
│  - XSS Sanitization                 │
│  - Input Validation                 │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│  API Layer (Next.js API Routes)     │
│  - Rate Limiting                    │
│  - Authentication                   │
│  - Authorization (RBAC)             │
│  - Request Validation               │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│  Security Middleware                │
│  - Security Headers                 │
│  - CSRF Validation                  │
│  - Suspicious Pattern Detection     │
│  - API Key Validation               │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│  Data Layer (Prisma/PostgreSQL)     │
│  - Parameterized Queries            │
│  - Audit Logging                    │
│  - Encryption at Rest               │
└─────────────────────────────────────┘
```

### Security Modules

```
src/
├── modules/
│   ├── auth/
│   │   └── security.ts          # Auth hardening (Argon2id, 2FA, brute force)
│   ├── files/
│   │   └── validateFile.ts      # File upload security
│   └── security/
│       └── useSecurityMonitoring.ts  # Event tracking & alerting
├── lib/
│   ├── auth/
│   │   └── enforcePermissions.ts     # RBAC enforcement
│   └── security/
│       ├── csrf.ts              # CSRF protection
│       ├── sanitize.ts          # XSS protection
│       └── passwordPolicy.ts    # Password validation
├── middleware/
│   └── security.ts              # Security middleware
└── __tests__/
    └── security.test.ts         # Security test suite
```

---

## 🔐 Componente Security

### 1. Authentication Hardening

**Fișier:** `src/modules/auth/security.ts`

#### Password Security (Argon2id)

```typescript
import { PasswordSecurity } from '@/modules/auth/security';

// Hash password with Argon2id (OWASP recommended)
const hash = await PasswordSecurity.hashPassword('user_password');

// Verify password
const isValid = await PasswordSecurity.verifyPassword('user_password', hash);

// Check password strength
const strength = PasswordSecurity.checkPasswordStrength('MyP@ssw0rd123');
// Returns: { isValid: boolean, strength: string, errors: string[] }
```

**Configurare Argon2id:**
- Memory cost: 64 MiB
- Time cost: 3 iterations
- Parallelism: 4 threads
- Salt length: 16 bytes
- Hash length: 32 bytes

#### Two-Factor Authentication (2FA)

```typescript
import { TwoFactorAuth } from '@/modules/auth/security';

// Generate 2FA secret for user
const secret = TwoFactorAuth.generateSecret('user@example.com');

// Generate QR code for authenticator app
const qrCode = await TwoFactorAuth.generateQRCode(secret, 'user@example.com', 'Sanduta.art');

// Verify TOTP token
const isValid = TwoFactorAuth.verifyToken(secret, userToken);
```

**Suportat:** Google Authenticator, Authy, Microsoft Authenticator

#### Brute Force Protection

```typescript
import { BruteForceProtection } from '@/modules/auth/security';

// Record failed login attempt
BruteForceProtection.recordFailedAttempt(userId);

// Check if user is locked out
const isLocked = BruteForceProtection.isLockedOut(userId);

// Get remaining attempts
const remaining = BruteForceProtection.getRemainingAttempts(userId);

// Reset on successful login
BruteForceProtection.resetAttempts(userId);
```

**Politică:**
- Maximum attempts: 5
- Lockout duration: 15 minutes
- Storage: In-memory (Redis recommended for production)

#### Session Security

```typescript
import { SessionSecurity } from '@/modules/auth/security';

// Generate session token
const token = SessionSecurity.generateSessionToken();

// Validate session
const isValid = await SessionSecurity.validateSession(token, userId);

// Invalidate session
await SessionSecurity.invalidateSession(token);
```

**Configurare NextAuth.js:**

```typescript
// src/modules/auth/nextauth.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  },
};
```

---

### 2. CSRF Protection

**Fișier:** `src/lib/security/csrf.ts`

#### Utilizare în API Routes

```typescript
import { withCsrfProtection } from '@/lib/security/csrf';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  // Your API logic here
  return NextResponse.json({ success: true });
}

// Wrap with CSRF protection
export const POST = withCsrfProtection(handler);
```

#### Utilizare în Frontend

```typescript
import { generateCsrfToken } from '@/lib/security/csrf';

// Get CSRF token
const csrfToken = generateCsrfToken();

// Send with request
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

**Cum funcționează:**
1. Token generat cu 32 bytes random
2. Token stocat în cookie HttpOnly
3. Token trimis în header `X-CSRF-Token`
4. Server validează că token din cookie = token din header
5. Token valid 24 ore

---

### 3. XSS Protection

**Fișier:** `src/lib/security/sanitize.ts`

#### Sanitizare HTML

```typescript
import { sanitizeHtml } from '@/lib/security/sanitize';

// User input from rich text editor
const userInput = '<p>Hello</p><script>alert("XSS")</script>';
const safe = sanitizeHtml(userInput);
// Returns: '<p>Hello</p>'
```

**Allowed tags:** p, br, strong, em, u, h1-h6, ul, ol, li, a, img, blockquote, code, pre

#### Sanitizare Plain Text

```typescript
import { sanitizePlainText } from '@/lib/security/sanitize';

// Remove all HTML
const text = '<h1>Title</h1>';
const safe = sanitizePlainText(text);
// Returns: 'Title'
```

#### Sanitizare URL

```typescript
import { sanitizeUrl } from '@/lib/security/sanitize';

// Block dangerous protocols
const safe = sanitizeUrl(userUrl);
// Returns: null for javascript:, data:, vbscript:
```

#### Detectare Patternuri XSS

```typescript
import { detectXssPattern } from '@/lib/security/sanitize';

// Check for XSS patterns
const hasXss = detectXssPattern(userInput);
// Returns: true if <script>, onclick, onerror, etc. detected
```

#### Sanitizare Recursive Objects

```typescript
import { sanitizeObject } from '@/lib/security/sanitize';

// Sanitize all string fields
const safeData = sanitizeObject(userSubmittedData);
```

---

### 4. File Upload Security

**Fișier:** `src/modules/files/validateFile.ts`

#### Validare Fișier

```typescript
import { FileUploadValidator, ALLOWED_MIME_TYPES } from '@/modules/files/validateFile';

// Validate image upload
const result = await FileUploadValidator.validateFile(
  file, // File object
  ALLOWED_MIME_TYPES.images, // ['image/jpeg', 'image/png', 'image/gif', ...]
  5 * 1024 * 1024 // Max size: 5 MB
);

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

**Limite:**
- Images: 5 MB
- Documents: 20 MB
- General: 10 MB

**MIME Types Permise:**
- Images: JPEG, PNG, GIF, WebP, SVG
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT
- Archives: ZIP, RAR, 7Z

**Extensii Blocate:**
- Executables: .exe, .dll, .bat, .cmd, .sh, .ps1
- Scripts: .js, .vbs, .py, .rb
- Others: .msi, .app, .deb, .rpm

#### Verificare MIME Type (Magic Numbers)

```typescript
// Verify file signature matches extension
const isValid = await FileUploadValidator.verifyMimeType(file);
```

**Magic numbers suportate:**
- JPEG: FFD8FFE0
- PNG: 89504E47
- GIF: 47494638
- PDF: 25504446
- ZIP: 504B0304

#### Generare Nume Securizat

```typescript
// Generate random secure filename
const secureFilename = FileUploadValidator.generateSecureFilename('user-upload.jpg');
// Returns: 1704888000_a3f7e9d2c4b8f1e6.jpg
```

#### Detectare Script în Fișiere

```typescript
// Detect <script> in SVG/text files
const hasScript = await FileUploadValidator.detectEmbeddedScript(file);
```

---

### 5. Permission Enforcement (RBAC)

**Fișier:** `src/lib/auth/enforcePermissions.ts`

#### Roluri Disponibile

```typescript
type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
```

#### Permisiuni per Rol

```typescript
const PERMISSIONS = {
  // User Management (ADMIN only)
  'users.create': ['ADMIN'],
  'users.edit': ['ADMIN'],
  'users.delete': ['ADMIN'],
  'users.view': ['ADMIN', 'MANAGER'],

  // Orders (ADMIN, MANAGER, OPERATOR)
  'orders.create': ['ADMIN', 'MANAGER', 'OPERATOR'],
  'orders.edit': ['ADMIN', 'MANAGER'],
  'orders.delete': ['ADMIN'],
  'orders.view': ['ADMIN', 'MANAGER', 'OPERATOR'],

  // Products (ADMIN, MANAGER)
  'products.create': ['ADMIN', 'MANAGER'],
  'products.edit': ['ADMIN', 'MANAGER'],
  'products.delete': ['ADMIN'],
  'products.view': ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'],

  // Production (ADMIN, MANAGER, OPERATOR)
  'production.view': ['ADMIN', 'MANAGER', 'OPERATOR'],
  'production.update': ['ADMIN', 'MANAGER', 'OPERATOR'],

  // Reports (ADMIN, MANAGER)
  'reports.sales': ['ADMIN', 'MANAGER'],
  'reports.materials': ['ADMIN', 'MANAGER'],
  'reports.production': ['ADMIN', 'MANAGER'],

  // Settings (ADMIN only)
  'settings.view': ['ADMIN'],
  'settings.edit': ['ADMIN'],
};
```

#### Enforcare în API Routes

```typescript
import { enforcePermission } from '@/lib/auth/enforcePermissions';

export async function GET(req: NextRequest) {
  // Check permission
  const { user, error } = await enforcePermission(req, 'orders.view');
  if (error) return error; // Returns 401 or 403

  // User has permission, continue
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}
```

#### Verificare Multiple Permisiuni (OR)

```typescript
import { enforceAnyPermission } from '@/lib/auth/enforcePermissions';

// User needs at least one of these permissions
const { user, error } = await enforceAnyPermission(req, ['orders.view', 'orders.edit']);
```

#### Higher-Order Function Wrapper

```typescript
import { withPermission } from '@/lib/auth/enforcePermissions';

const handler = async (req: NextRequest) => {
  // Your logic here
};

export const GET = withPermission(handler, 'orders.view');
```

#### Resource Ownership Validation

```typescript
import { enforceResourceOwnership } from '@/lib/auth/enforcePermissions';

// User can only access their own orders
const { user, error } = await enforceResourceOwnership(req, order.userId);
if (error) return error;
```

---

### 6. Security Middleware

**Fișier:** `src/middleware/security.ts`

#### Security Headers

```typescript
import { applySecurityHeaders } from '@/middleware/security';

const response = applySecurityHeaders(NextResponse.next());
```

**Headers Applied:**
- **Content-Security-Policy:** Restrict script sources
- **X-Frame-Options:** DENY (prevent clickjacking)
- **X-Content-Type-Options:** nosniff
- **Strict-Transport-Security:** max-age=31536000
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Permissions-Policy:** Disable unused features
- **X-XSS-Protection:** 1; mode=block
- **X-Permitted-Cross-Domain-Policies:** none

#### Suspicious Pattern Detection

```typescript
import { detectSuspiciousPatterns } from '@/middleware/security';

// Check URL and body for SQL injection, XSS, path traversal
const patterns = detectSuspiciousPatterns(url, requestBody);
if (patterns.length > 0) {
  // Log and reject
}
```

**Patterns Detectate:**
- SQL Injection: `' OR 1=1`, `UNION SELECT`, `DROP TABLE`
- XSS: `<script>`, `javascript:`, `onerror=`
- Path Traversal: `../`, `..\\`, `..\`
- Command Injection: `| ls`, `; rm -rf`

#### User-Agent Validation

```typescript
import { validateUserAgent } from '@/middleware/security';

// Block bots and automated tools
const isValid = validateUserAgent(userAgent);
// Blocks: curl, wget, python-requests, Postman
```

#### API Key Validation

```typescript
import { validateApiKey } from '@/middleware/security';

// Validate X-API-Key header
const isValid = validateApiKey(apiKey);
```

#### Complete Middleware Wrapper

```typescript
import { withSecurityMiddleware } from '@/middleware/security';

async function handler(req: NextRequest) {
  // Your API logic
}

export const POST = withSecurityMiddleware(handler);
```

**Aplică automat:**
- Security headers
- Suspicious pattern detection
- User-Agent validation
- API key check (optional)
- CSRF validation (optional)

---

### 7. Security Monitoring

**Fișier:** `src/modules/security/useSecurityMonitoring.ts`

#### Event Types

```typescript
type SecurityEventType =
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'BRUTE_FORCE_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'SQL_INJECTION_ATTEMPT'
  | 'CSRF_VIOLATION'
  | 'UNAUTHORIZED_ACCESS'
  | 'SUSPICIOUS_FILE_UPLOAD'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'API_KEY_INVALID'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ABNORMAL_TRAFFIC'
  | 'SECURITY_SCAN_DETECTED';
```

#### Severity Levels

```typescript
type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

#### Înregistrare Evenimente

```typescript
import { SecurityMonitoring } from '@/modules/security/useSecurityMonitoring';

const monitoring = new SecurityMonitoring();

// Record security event
monitoring.recordEvent({
  type: 'LOGIN_FAILED',
  userId: 'user-123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  metadata: { username: 'john@example.com' },
});
```

#### Helper Methods

```typescript
// Login failures
monitoring.recordLoginFailed('user-123', '192.168.1.1');

// Brute force
monitoring.recordBruteForce('user-123', '192.168.1.1');

// XSS attempts
monitoring.recordXssAttempt('192.168.1.1', '<script>alert(1)</script>');

// File upload
monitoring.recordSuspiciousFileUpload('user-123', 'malware.exe');

// Unauthorized access
monitoring.recordUnauthorizedAccess('user-123', '/api/admin/users');
```

#### Alert Thresholds

```typescript
const ALERT_THRESHOLDS = {
  LOGIN_FAILED: { count: 3, windowSeconds: 300 }, // 3 failures in 5 min
  BRUTE_FORCE_ATTEMPT: { count: 1, windowSeconds: 60 }, // Immediate
  XSS_ATTEMPT: { count: 1, windowSeconds: 60 }, // Immediate
  CSRF_VIOLATION: { count: 1, windowSeconds: 60 }, // Immediate
  RATE_LIMIT_EXCEEDED: { count: 5, windowSeconds: 300 }, // 5 in 5 min
};
```

#### Alert Notifications

```typescript
// Trigger alert (sends to Slack/Email)
monitoring.triggerAlert('CRITICAL', 'Multiple XSS attempts detected', {
  userId: 'user-123',
  count: 5,
});
```

**TODO:** Implementează integrare Slack/Email reală

#### Get Recent Events

```typescript
// Get events from last hour
const events = monitoring.getRecentEvents();

// Get events for specific user
const userEvents = monitoring.getEventsForUser('user-123');
```

---

### 8. Password Policy

**Fișier:** `src/lib/security/passwordPolicy.ts`

#### Politică Parole

```typescript
const DEFAULT_POLICY = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxSequentialChars: 3,
  maxRepeatedChars: 3,
  expirationDays: 0, // 0 = disabled
  historyCount: 5, // Remember last 5 passwords
};
```

#### Validare Parolă

```typescript
import { PasswordPolicy } from '@/lib/security/passwordPolicy';

// Validate password
const result = PasswordPolicy.validate('MyP@ssw0rd123', {
  email: 'user@example.com',
  name: 'John Doe',
});

console.log(result);
// {
//   isValid: true,
//   errors: [],
//   strength: 'strong',
//   score: 75
// }
```

**Strength Levels:**
- `very-weak`: 0-20 points
- `weak`: 21-40 points
- `medium`: 41-60 points
- `strong`: 61-80 points
- `very-strong`: 81-100 points

#### Common Passwords Blacklist

Top 100 parole comune sunt blocate:
- password, password123, 123456, qwerty, admin, letmein, ...

#### Verificare Expirare

```typescript
// Check if password has expired
const isExpired = await PasswordPolicy.isPasswordExpired('user-123');

// Force password change
await PasswordPolicy.forcePasswordChange('user-123');
```

#### Requirements Message

```typescript
// Get user-friendly requirements message
const requirements = PasswordPolicy.getRequirementsMessage();
// Returns: "Password must be at least 10 characters, contain..."
```

---

## ⚙️ Configurare

### 1. Environment Variables

```env
# .env.local

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars

# Database (use SSL in production)
DATABASE_URL="postgresql://user:pass@localhost:5432/sanduta?schema=public&sslmode=require"

# Redis (Upstash - pentru production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# API Keys (optional)
API_KEY_ADMIN=admin-key-here
API_KEY_INTEGRATION=integration-key-here

# Slack Webhook (pentru alertele de securitate)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email (Resend - pentru notificări)
RESEND_API_KEY=re_your_api_key
SECURITY_ALERT_EMAIL=security@sanduta.art
```

### 2. Instalare Dependencies

```bash
npm install @node-rs/argon2 speakeasy qrcode isomorphic-dompurify
npm install -D @types/speakeasy @types/qrcode
```

### 3. Prisma Schema Updates

```prisma
// prisma/schema.prisma

model User {
  id String @id @default(cuid())
  email String @unique
  password String
  name String?
  role UserRole @default(VIEWER)
  
  // Security fields
  twoFactorSecret String? // For 2FA
  twoFactorEnabled Boolean @default(false)
  passwordExpired Boolean @default(false)
  passwordChangedAt DateTime?
  passwordHistory String[] // JSON array of hashed passwords
  
  // Brute force protection
  loginAttempts Int @default(0)
  lockedUntil DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sessions Session[]
  auditLogs AuditLog[]
}

model Session {
  id String @id @default(cuid())
  userId String
  token String @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}

model AuditLog {
  id String @id @default(cuid())
  userId String?
  action String
  resource String
  resourceId String?
  changes Json?
  ipAddress String?
  userAgent String?
  
  // Security fields
  securityEventType String?
  severity String?
  alertTriggered Boolean @default(false)
  
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([securityEventType])
}
```

### 4. Migrare Bază de Date

```bash
npx prisma migrate dev --name add_security_fields
npx prisma generate
```

### 5. Middleware Configuration

```typescript
// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { withSecurityMiddleware } from '@/middleware/security';
import { applySecurityHeaders } from '@/middleware/security';

export default withAuth(
  async function middleware(req) {
    // Apply security middleware
    return withSecurityMiddleware(async (req) => {
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    })(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/operator/:path*',
    '/api/admin/:path*',
    '/api/manager/:path*',
  ],
};
```

---

## 🚀 Utilizare

### Complete Authentication Flow

```typescript
// 1. Register new user
import { PasswordSecurity, PasswordPolicy } from '@/modules/auth/security';

// Validate password
const validation = PasswordPolicy.validate(password, { email, name });
if (!validation.isValid) {
  return { errors: validation.errors };
}

// Hash password
const hashedPassword = await PasswordSecurity.hashPassword(password);

// Create user
const user = await prisma.user.create({
  data: {
    email,
    name,
    password: hashedPassword,
    role: 'VIEWER',
  },
});

// 2. Enable 2FA (optional)
import { TwoFactorAuth } from '@/modules/auth/security';

const secret = TwoFactorAuth.generateSecret(user.email);
const qrCode = await TwoFactorAuth.generateQRCode(secret, user.email, 'Sanduta.art');

await prisma.user.update({
  where: { id: user.id },
  data: {
    twoFactorSecret: secret,
    twoFactorEnabled: true,
  },
});

// 3. Login with brute force protection
import { BruteForceProtection, SecurityMonitoring } from '@/modules/auth/security';

// Check if locked out
if (BruteForceProtection.isLockedOut(user.id)) {
  return { error: 'Account locked. Try again in 15 minutes.' };
}

// Verify password
const isValid = await PasswordSecurity.verifyPassword(password, user.password);
if (!isValid) {
  BruteForceProtection.recordFailedAttempt(user.id);
  SecurityMonitoring.recordLoginFailed(user.id, ipAddress);
  return { error: 'Invalid credentials' };
}

// Verify 2FA token (if enabled)
if (user.twoFactorEnabled) {
  const is2FAValid = TwoFactorAuth.verifyToken(user.twoFactorSecret!, token);
  if (!is2FAValid) {
    return { error: 'Invalid 2FA code' };
  }
}

// Reset brute force attempts
BruteForceProtection.resetAttempts(user.id);

// Create session
import { SessionSecurity } from '@/modules/auth/security';

const sessionToken = SessionSecurity.generateSessionToken();
await prisma.session.create({
  data: {
    userId: user.id,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ipAddress,
    userAgent,
  },
});

// Log successful login
SecurityMonitoring.recordEvent({
  type: 'LOGIN_SUCCESS',
  userId: user.id,
  ip: ipAddress,
  userAgent,
});
```

### Secure API Endpoint Example

```typescript
// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withSecurityMiddleware } from '@/middleware/security';
import { enforcePermission } from '@/lib/auth/enforcePermissions';
import { withCsrfProtection } from '@/lib/security/csrf';
import { sanitizeObject } from '@/lib/security/sanitize';
import { logger } from '@/lib/logger';
import { SecurityMonitoring } from '@/modules/security/useSecurityMonitoring';

async function handler(req: NextRequest) {
  try {
    // 1. Enforce permission
    const { user, error } = await enforcePermission(req, 'users.view');
    if (error) {
      SecurityMonitoring.recordUnauthorizedAccess(user?.id, '/api/admin/users');
      return error;
    }

    // 2. Parse and sanitize input
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);

    // 3. Business logic
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Log action
    logger.info('API:Users', 'Fetched users', { userId: user.id, count: users.length });

    // 5. Return response
    return NextResponse.json(users);
  } catch (error) {
    logger.error('API:Users', 'Failed to fetch users', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Apply security layers
export const GET = withSecurityMiddleware(handler);
export const POST = withSecurityMiddleware(withCsrfProtection(handler));
```

### File Upload with Security

```typescript
// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FileUploadValidator, ALLOWED_MIME_TYPES } from '@/modules/files/validateFile';
import { SecurityMonitoring } from '@/modules/security/useSecurityMonitoring';
import { enforcePermission } from '@/lib/auth/enforcePermissions';

export async function POST(req: NextRequest) {
  // 1. Check permission
  const { user, error } = await enforcePermission(req, 'files.upload');
  if (error) return error;

  // 2. Get file from form data
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // 3. Validate file
  const validation = await FileUploadValidator.validateFile(
    file,
    ALLOWED_MIME_TYPES.images,
    5 * 1024 * 1024 // 5 MB
  );

  if (!validation.isValid) {
    SecurityMonitoring.recordSuspiciousFileUpload(user.id, file.name);
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  // 4. Generate secure filename
  const secureFilename = FileUploadValidator.generateSecureFilename(file.name);

  // 5. Upload to storage (Cloudinary, S3, etc.)
  // ... upload logic ...

  return NextResponse.json({
    success: true,
    filename: secureFilename,
    url: uploadedUrl,
  });
}
```

---

## ✅ Best Practices

### 1. Never Trust User Input

```typescript
// ❌ WRONG - Direct use
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// ✅ CORRECT - Use Prisma (parameterized queries)
const user = await prisma.user.findUnique({ where: { email: userEmail } });
```

### 2. Always Sanitize Output

```typescript
// ❌ WRONG - Direct render
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ CORRECT - Sanitize first
import { sanitizeHtml } from '@/lib/security/sanitize';
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userComment) }} />
```

### 3. Use HTTPS Everywhere

```typescript
// ❌ WRONG - HTTP in production
const API_URL = 'http://api.sanduta.art';

// ✅ CORRECT - HTTPS only
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.sanduta.art'
  : 'http://localhost:3000';
```

### 4. Secure Session Cookies

```typescript
// ✅ CORRECT - Secure cookie options
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,        // Cannot be accessed via JavaScript
      sameSite: 'strict',    // CSRF protection
      secure: true,          // HTTPS only
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },
}
```

### 5. Rate Limit All Endpoints

```typescript
import { rateLimit } from '@/lib/performance/rateLimiting';

// Public endpoints: 60 requests/min
export const GET = rateLimit(handler, { limit: 60, window: 60 });

// Auth endpoints: 5 requests/min (brute force prevention)
export const POST = rateLimit(authHandler, { limit: 5, window: 60 });
```

### 6. Log Security Events

```typescript
import { SecurityMonitoring } from '@/modules/security/useSecurityMonitoring';

// Always log security-relevant actions
SecurityMonitoring.recordEvent({
  type: 'PASSWORD_CHANGE',
  userId: user.id,
  ip: ipAddress,
  metadata: { initiatedBy: currentUser.id },
});
```

### 7. Validate File Uploads

```typescript
// ✅ CORRECT - Full validation
const result = await FileUploadValidator.validateFile(file, allowedTypes, maxSize);
if (!result.isValid) {
  return { errors: result.errors };
}

// Additional: Check magic numbers
const isMimeValid = await FileUploadValidator.verifyMimeType(file);
if (!isMimeValid) {
  return { error: 'File type mismatch' };
}
```

### 8. Use Principle of Least Privilege

```typescript
// ❌ WRONG - Give too many permissions
const user = await prisma.user.create({
  data: { email, password, role: 'ADMIN' },
});

// ✅ CORRECT - Start with minimal permissions
const user = await prisma.user.create({
  data: { email, password, role: 'VIEWER' },
});
```

### 9. Implement Defense in Depth

```typescript
// Apply multiple security layers
export const POST = 
  withSecurityMiddleware(       // Layer 1: Headers + validation
    withCsrfProtection(          // Layer 2: CSRF protection
      withPermission(            // Layer 3: Authorization
        rateLimit(               // Layer 4: Rate limiting
          handler, 
          { limit: 30, window: 60 }
        ),
        'orders.create'
      )
    )
  );
```

### 10. Keep Dependencies Updated

```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update all dependencies
npm update
```

---

## 🧪 Testing

### Run Security Tests

```bash
# Run all security tests
npm run test src/__tests__/security.test.ts

# Run with coverage
npm run test:coverage src/__tests__/security.test.ts

# Run in watch mode
npm run test:watch src/__tests__/security.test.ts
```

### Manual Testing Checklist

```bash
# 1. Test brute force protection
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  # Repeat 5 times, should get locked out

# 2. Test CSRF protection
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[]}' \
  # Should get 403 without CSRF token

# 3. Test rate limiting
for i in {1..100}; do
  curl http://localhost:3000/api/products
done
# Should get 429 after 60 requests

# 4. Test XSS sanitization
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"<script>alert(1)</script>"}' \
  # Script should be stripped

# 5. Test file upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@malware.exe" \
  # Should be rejected

# 6. Test security headers
curl -I http://localhost:3000
# Should see: X-Frame-Options, CSP, HSTS, etc.

# 7. Test role enforcement
# Login as OPERATOR
curl http://localhost:3000/api/admin/users \
  -H "Cookie: session=operator-token" \
  # Should get 403

# 8. Test audit logging
# Check database after actions
psql -d sanduta -c "SELECT * FROM \"AuditLog\" ORDER BY \"createdAt\" DESC LIMIT 10;"
```

### Penetration Testing

```bash
# Use OWASP ZAP or Burp Suite for comprehensive testing
# https://www.zaproxy.org/
# https://portswigger.net/burp

# Common tests:
# - SQL Injection
# - XSS (Reflected, Stored, DOM)
# - CSRF
# - Authentication bypass
# - Authorization bypass
# - File upload vulnerabilities
# - Information disclosure
```

---

## 🚨 Incident Response

### Security Incident Playbook

#### 1. Detection
```typescript
// Monitor alerts from SecurityMonitoring
const alerts = await prisma.auditLog.findMany({
  where: {
    alertTriggered: true,
    severity: { in: ['HIGH', 'CRITICAL'] },
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
  orderBy: { createdAt: 'desc' },
});
```

#### 2. Containment
```typescript
// Lock compromised account
await prisma.user.update({
  where: { id: compromisedUserId },
  data: {
    lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    passwordExpired: true,
  },
});

// Invalidate all sessions
await prisma.session.deleteMany({
  where: { userId: compromisedUserId },
});
```

#### 3. Investigation
```typescript
// Get audit trail
const auditTrail = await prisma.auditLog.findMany({
  where: {
    userId: compromisedUserId,
    createdAt: { gte: incidentStartTime },
  },
  orderBy: { createdAt: 'asc' },
});

// Analyze patterns
const suspiciousIPs = auditTrail
  .filter(log => log.securityEventType === 'LOGIN_FAILED')
  .map(log => log.ipAddress);
```

#### 4. Recovery
```typescript
// Force password reset
await PasswordPolicy.forcePasswordChange(compromisedUserId);

// Send notification
await sendSecurityNotificationEmail(user.email, {
  type: 'account_compromised',
  actions: ['Password reset required', 'Enable 2FA'],
});

// Enable 2FA if not already enabled
if (!user.twoFactorEnabled) {
  // Send 2FA setup instructions
}
```

#### 5. Post-Incident
```typescript
// Document incident
await prisma.auditLog.create({
  data: {
    userId: 'SYSTEM',
    action: 'SECURITY_INCIDENT_RESOLVED',
    resource: 'User',
    resourceId: compromisedUserId,
    changes: {
      incidentId: generateIncidentId(),
      type: 'Account Compromise',
      resolution: 'Password reset, sessions invalidated, 2FA enforced',
      affectedUsers: 1,
    },
    securityEventType: 'SECURITY_INCIDENT',
    severity: 'HIGH',
  },
});

// Update security policies if needed
// - Increase password requirements
// - Enforce 2FA for all users
// - Add IP to blocklist
```

### Emergency Contacts

```typescript
// config/security.ts
export const EMERGENCY_CONTACTS = {
  securityTeam: 'security@sanduta.art',
  technicalLead: 'tech-lead@sanduta.art',
  legal: 'legal@sanduta.art',
  pr: 'pr@sanduta.art',
};
```

---

## 📜 Compliance

### GDPR Compliance

#### Data Protection
- **Encryption at Rest:** PostgreSQL with encryption enabled
- **Encryption in Transit:** HTTPS only (HSTS enforced)
- **Data Minimization:** Only collect necessary data
- **Right to be Forgotten:** Soft delete with anonymization

```typescript
// GDPR: Right to erasure
async function deleteUserData(userId: string) {
  // Anonymize instead of hard delete (preserve audit trail)
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@anonymized.local`,
      name: '[DELETED]',
      password: '[DELETED]',
      twoFactorSecret: null,
      deletedAt: new Date(),
    },
  });

  // Keep audit logs but anonymize
  await prisma.auditLog.updateMany({
    where: { userId },
    data: { userId: 'ANONYMIZED' },
  });
}
```

#### Data Breach Notification
- **Detection:** SecurityMonitoring alerts
- **Notification:** Within 72 hours to authorities
- **User Notification:** If high risk to rights and freedoms

### OWASP Top 10 Coverage

| Risk | Mitigation | Implementation |
|------|-----------|----------------|
| **A01:2021 – Broken Access Control** | RBAC, Permission enforcement | `enforcePermissions.ts` |
| **A02:2021 – Cryptographic Failures** | Argon2id, HTTPS, secure cookies | `security.ts`, middleware |
| **A03:2021 – Injection** | Prisma ORM, sanitization | Parameterized queries, `sanitize.ts` |
| **A04:2021 – Insecure Design** | Security by design, defense in depth | Multiple security layers |
| **A05:2021 – Security Misconfiguration** | Security headers, CSP | `middleware/security.ts` |
| **A06:2021 – Vulnerable Components** | npm audit, dependency updates | CI/CD checks |
| **A07:2021 – Identification/Authentication** | 2FA, brute force protection, strong passwords | `security.ts`, `passwordPolicy.ts` |
| **A08:2021 – Software/Data Integrity** | CSRF protection, secure file uploads | `csrf.ts`, `validateFile.ts` |
| **A09:2021 – Logging/Monitoring Failures** | Comprehensive audit logs, security monitoring | `useSecurityMonitoring.ts` |
| **A10:2021 – Server-Side Request Forgery** | URL sanitization, allowlists | `sanitize.ts` |

### PCI DSS (if handling cards)

**Note:** Currently using Paynet for payments (no direct card handling).

If storing card data:
- **Requirement 3:** Encrypt stored data (AES-256)
- **Requirement 8:** Multi-factor authentication (2FA implemented)
- **Requirement 10:** Audit logs (implemented)
- **Requirement 11:** Security testing (test suite)

---

## 📚 Additional Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Penetration testing
- [Snyk](https://snyk.io/) - Dependency scanning
- [SonarQube](https://www.sonarqube.org/) - Code quality & security
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Vulnerability scanning

### Libraries
- [@node-rs/argon2](https://www.npmjs.com/package/@node-rs/argon2) - Password hashing
- [isomorphic-dompurify](https://www.npmjs.com/package/isomorphic-dompurify) - XSS sanitization
- [speakeasy](https://www.npmjs.com/package/speakeasy) - 2FA TOTP
- [helmet](https://helmetjs.github.io/) - Security headers (alternative)

---

## 🔄 Maintenance

### Regular Security Tasks

#### Daily
- [ ] Review security alerts from SecurityMonitoring
- [ ] Check failed login attempts
- [ ] Monitor rate limit violations

#### Weekly
- [ ] Review audit logs for suspicious activity
- [ ] Check for dependency vulnerabilities (`npm audit`)
- [ ] Verify backup integrity

#### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review and rotate API keys
- [ ] Security training for team
- [ ] Penetration testing

#### Quarterly
- [ ] Full security audit
- [ ] Review and update security policies
- [ ] Disaster recovery drill
- [ ] Third-party security assessment

---

## 📞 Support

Pentru întrebări sau incidente de securitate:
- **Email:** security@sanduta.art
- **Urgențe:** +40 XXX XXX XXX (24/7)
- **Bug Bounty:** https://sanduta.art/security/bug-bounty

**Responsible Disclosure:** Raportați vulnerabilitățile prin email la security@sanduta.art înainte de publicare.

---

**Last Updated:** 2024-01-10  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
