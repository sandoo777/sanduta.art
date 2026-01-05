# Ghid de Securitate - Sanduta.Art

## ✅ Implementat

### 1. Auth Middleware (`src/lib/auth-middleware.ts`)

**Verificare roluri și permisiuni:**

```typescript
import { requireAuth, requireAdmin, requireRole, withAuth, withRole } from '@/lib/auth-middleware';

// În API route
export const GET = withAuth(async (request, { params, user }) => {
  // user este automat disponibil și verificat
  return NextResponse.json({ data: 'Protected data' });
});

// Necesită rol specific
export const DELETE = withRole([UserRole.ADMIN, UserRole.MANAGER], async (request, { params, user }) => {
  // Doar ADMIN și MANAGER pot accesa
  return NextResponse.json({ success: true });
});
```

**Helpers de permisiuni:**
- `canManageOrders(role)` - ADMIN, MANAGER
- `canManageUsers(role)` - ADMIN only
- `canManageProducts(role)` - ADMIN, MANAGER
- `canManageMaterials(role)` - ADMIN, MANAGER, OPERATOR
- `canViewReports(role)` - ADMIN, MANAGER
- `canManageProduction(role)` - ADMIN, MANAGER, OPERATOR

### 2. Rate Limiting (`src/lib/rate-limit.ts`)

**Configurații predefinite:**

```typescript
import { rateLimit, RATE_LIMITS, withRateLimit } from '@/lib/rate-limit';

// În API route
export const POST = withRateLimit(
  RATE_LIMITS.LOGIN,  // 5 requests / 15 minute
  async (request) => {
    // Login logic
  }
);

// Manual check
const result = await rateLimit(request, RATE_LIMITS.API_GENERAL);
if (!result.allowed) {
  return NextResponse.json({ error: result.error }, { status: 429 });
}
```

**Rate limits:**
- `LOGIN`: 5 req / 15 min
- `REGISTER`: 3 req / 1 oră
- `PASSWORD_RESET`: 3 req / 1 oră
- `API_GENERAL`: 100 req / 1 min
- `API_STRICT`: 20 req / 1 min
- `UPLOAD`: 10 req / 1 min
- `SEARCH`: 30 req / 1 min

### 3. Validare Input (`src/lib/validation.ts`)

**Zod schemas:**

```typescript
import { validateInput, loginSchema, createProductSchema } from '@/lib/validation';

// În API route
const body = await request.json();
const validation = await validateInput(loginSchema, body);

if (!validation.success) {
  return NextResponse.json({ errors: validation.errors }, { status: 400 });
}

const { email, password } = validation.data;
```

**Schemas disponibile:**
- Auth: `loginSchema`, `registerSchema`, `passwordSchema`
- Products: `createProductSchema`
- Orders: `updateOrderStatusSchema`
- Sanitization: `sanitizeString(str)`

### 4. Audit Logging (`src/lib/audit-log.ts`)

**Logare acțiuni critice:**

```typescript
import { logAuditAction, AUDIT_ACTIONS, withAuditLog } from '@/lib/audit-log';

// Manual
await logAuditAction({
  userId: user.id,
  action: AUDIT_ACTIONS.ORDER_DELETE,
  resourceType: 'order',
  resourceId: orderId,
  details: { reason: 'duplicate' },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// Automatic cu wrapper
export const DELETE = withAuth(
  withAuditLog(
    AUDIT_ACTIONS.PROJECT_DELETE,
    'project',
    async ({ params, user }) => {
      // Delete logic
    }
  )
);
```

**Acțiuni loghate:**
- Auth: LOGIN, LOGOUT, PASSWORD_CHANGE, LOGIN_FAILED
- Users: USER_CREATE, USER_UPDATE, USER_DELETE, USER_ROLE_CHANGE
- Orders: ORDER_CREATE, ORDER_UPDATE, ORDER_DELETE, ORDER_STATUS_CHANGE
- Projects: PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE
- Files: FILE_UPLOAD, FILE_DELETE
- Security: SESSION_REVOKE, TWO_FACTOR_ENABLE

### 5. Confirmări UI (`src/components/ui/ConfirmDialog.tsx`)

**Hook pentru confirmări:**

```typescript
import { useConfirmDialog, confirmPresets } from '@/components/ui/ConfirmDialog';

function MyComponent() {
  const { confirm, Dialog } = useConfirmDialog();

  const handleDelete = async () => {
    await confirm({
      ...confirmPresets.deleteProject,
      onConfirm: async () => {
        await deleteProject(id);
      },
    });
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <Dialog />
    </>
  );
}
```

**Presets disponibile:**
- `deleteProject` - danger, fără confirmation text
- `deleteFile` - danger
- `deleteOrder` - danger, necesită "CONFIRM"
- `deleteUser` - danger, necesită "CONFIRM"
- `changeUserRole` - warning
- `revokeSession` - warning

## 📋 Checklist Securitate API

### Protected Routes Template

```typescript
// src/app/api/admin/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth-middleware';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateInput, createResourceSchema } from '@/lib/validation';
import { logAuditAction, AUDIT_ACTIONS } from '@/lib/audit-log';
import { UserRole } from '@prisma/client';

export const GET = withRole(
  [UserRole.ADMIN, UserRole.MANAGER],
  async (request, { user }) => {
    // 1. Rate limiting
    const rateCheck = await rateLimit(request, RATE_LIMITS.API_GENERAL);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    // 2. Fetch data
    const data = await prisma.resource.findMany();

    // 3. Return
    return NextResponse.json({ data });
  }
);

export const POST = withRole(
  [UserRole.ADMIN],
  async (request, { user }) => {
    // 1. Rate limiting
    const rateCheck = await rateLimit(request, RATE_LIMITS.API_STRICT);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    // 2. Validate input
    const body = await request.json();
    const validation = await validateInput(createResourceSchema, body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    // 3. Create resource
    const resource = await prisma.resource.create({
      data: validation.data,
    });

    // 4. Audit log
    await logAuditAction({
      userId: user.id,
      action: AUDIT_ACTIONS.RESOURCE_CREATE,
      resourceType: 'resource',
      resourceId: resource.id,
    });

    // 5. Return
    return NextResponse.json({ data: resource }, { status: 201 });
  }
);
```

### Client-Side Protection

```typescript
// hooks/useRequireAuth.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireAuth(requiredRole?: UserRole) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [session, status, router, requiredRole]);

  return { session, status };
}
```

## 🔒 Best Practices

### 1. Niciodată nu expune date sensibile

```typescript
// ❌ Rău
const users = await prisma.user.findMany();
return NextResponse.json({ users });

// ✅ Bine
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    // NU include: password, twoFactorSecret, backupCodes
  },
});
return NextResponse.json({ users });
```

### 2. Verifică ownership

```typescript
// ❌ Rău
export const DELETE = async (request, { params }) => {
  await prisma.project.delete({ where: { id: params.id } });
};

// ✅ Bine
export const DELETE = withAuth(async (request, { params, user }) => {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (project.userId !== user.id && user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: params.id } });
});
```

### 3. Sanitize toate input-urile

```typescript
import { sanitizeString } from '@/lib/validation';

const body = await request.json();
const sanitizedData = {
  name: sanitizeString(body.name),
  description: sanitizeString(body.description),
};
```

### 4. Rate limit pe toate endpoint-urile publice

```typescript
// Public search - mai permisiv
export const GET = withRateLimit(
  RATE_LIMITS.SEARCH,
  async (request) => { /* ... */ }
);

// Admin actions - strict
export const POST = withRole(
  [UserRole.ADMIN],
  withRateLimit(
    RATE_LIMITS.API_STRICT,
    async (request, { user }) => { /* ... */ }
  )
);
```

### 5. Log toate acțiunile critice

```typescript
// Sempre log:
// - Schimbări de rol
// - Ștergeri
// - Modificări comenzi importante
// - Acțiuni admin

await logAuditAction({
  userId: user.id,
  action: AUDIT_ACTIONS.ORDER_STATUS_CHANGE,
  resourceType: 'order',
  resourceId: orderId,
  details: {
    oldStatus: order.status,
    newStatus: newStatus,
  },
});
```

## 🚨 Vulnerabilități Comune de Evitat

1. **SQL Injection** - Prisma previne automat, nu folosi raw SQL
2. **XSS** - Folosește `sanitizeString()` pe toate input-urile
3. **CSRF** - Next.js are protecție built-in cu tokens
4. **Brute Force** - Rate limiting pe login/register
5. **Information Disclosure** - Nu expune stack traces în production
6. **Broken Access Control** - Verifică rol și ownership peste tot
7. **Missing Rate Limiting** - Aplică pe toate API routes
8. **Weak Password Policy** - Folosește `passwordSchema` 

## 📊 Audit Reports

```typescript
// Obține audit logs pentru un user
import { getUserAuditLogs } from '@/lib/audit-log';

const logs = await getUserAuditLogs(userId, {
  limit: 50,
  startDate: new Date('2026-01-01'),
});

// Cleanup periodic (rulează lunar)
import { cleanupOldAuditLogs } from '@/lib/audit-log';
const deleted = await cleanupOldAuditLogs(90); // păstrează 90 zile
```

## 🎯 Următorii Pași

1. Aplică middleware pe toate API routes existente
2. Adaugă confirmări UI pentru toate acțiunile critice
3. Testează rate limiting în condiții de load
4. Review audit logs săptămânal
5. Configurează alerting pentru activități suspecte
6. Implementează 2FA pentru toți admins
7. Regular security audits (lunar)
