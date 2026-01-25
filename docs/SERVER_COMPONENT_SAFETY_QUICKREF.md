# Server Component Safety — Quick Reference

**1-page cheat sheet pentru utilizarea rapidă a `serverSafe.ts`**

---

## 🎯 Quick Imports

```typescript
import { 
  safeRedirect, 
  validateServerData, 
  fetchServerData 
} from '@/lib/serverSafe';
```

---

## 📋 Pattern Standard (Copy-Paste Ready)

```typescript
// src/app/your-page/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import prisma from '@/lib/prisma';
import YourClient from './YourClient';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';
import { logger } from '@/lib/logger';

export default async function YourPage() {
  try {
    // ✅ Step 1: Auth check
    const session = await getServerSession(authOptions);
    if (!session) return safeRedirect('/login');
    
    // ✅ Step 2: Validate session data
    const userId = validateServerData(
      session?.user?.id,
      'User ID not found in session'
    );
    
    // ✅ Step 3: Fetch with safety wrapper
    const data = await fetchServerData(
      () => prisma.yourTable.findMany({
        where: { userId },
        // ...
      }),
      { timeout: 10000, retries: 2 }
    );
    
    // ✅ Step 4: Return client component
    return <YourClient data={data} />;
  } catch (error) {
    logger.error('YourPage', 'Failed to load', { error });
    throw error;
  }
}
```

---

## 🔧 Function Reference

### `safeRedirect(path)`
```typescript
// ❌ UNSAFE:
if (!session) redirect('/login');

// ✅ SAFE:
if (!session) return safeRedirect('/login');
```
**⚠️ MUST use `return` before `safeRedirect()`!**

---

### `validateServerData<T>(data, message)`
```typescript
// ❌ UNSAFE:
const userId = session.user.id;  // Crash if null!

// ✅ SAFE:
const userId = validateServerData(
  session?.user?.id,
  'User ID missing'
);
```
**Returns `T`, not `T | null` — type-safe!**

---

### `fetchServerData<T>(fetcher, options)`
```typescript
// ❌ UNSAFE:
const orders = await prisma.order.findMany({ where: { userId } });

// ✅ SAFE:
const orders = await fetchServerData(
  () => prisma.order.findMany({ where: { userId } }),
  { 
    timeout: 10000,  // 10s (default)
    retries: 2       // 2 attempts (default)
  }
);
```
**Auto retry with exponential backoff!**

---

## 🎨 Common Patterns

### Pattern 1: Simple Auth
```typescript
const session = await getServerSession(authOptions);
if (!session) return safeRedirect('/login');

const userId = validateServerData(session?.user?.id, 'User ID missing');
```

### Pattern 2: Role Check
```typescript
const session = await getServerSession(authOptions);
if (!session) return safeRedirect('/login');

const role = validateServerData(session?.user?.role, 'Role missing');

if (role !== 'ADMIN' && role !== 'MANAGER') {
  return safeRedirect('/');
}
```

### Pattern 3: Params Validation
```typescript
const { id } = await params;
const orderId = validateServerData(id, 'Order ID missing');

const order = await fetchServerData(
  () => prisma.order.findUnique({ where: { id: orderId } })
);

if (!order) return safeRedirect('/orders');
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: No return
```typescript
// WRONG — function continues after redirect!
if (!session) safeRedirect('/login');
console.log(session.user.id);  // ← CRASH HERE

// CORRECT
if (!session) return safeRedirect('/login');
```

### ❌ Mistake 2: Validate after use
```typescript
// WRONG — crash before validation
const userId = session.user.id;
validateServerData(userId, 'Missing');

// CORRECT — validate BEFORE use
const userId = validateServerData(session?.user?.id, 'Missing');
```

### ❌ Mistake 3: No optional chaining
```typescript
// WRONG — crash if null
const email = session.user.email;

// CORRECT — optional chaining + validate
const email = validateServerData(session?.user?.email, 'Email missing');
```

---

## 📦 Options Reference

### fetchServerData Options
```typescript
{
  timeout?: number;   // Default: 10000 (10s)
  retries?: number;   // Default: 2
}
```

### serverSafe Options
```typescript
{
  fallbackData?: T;           // Return this on error
  redirectOnError?: string;   // Redirect to this path on error
  retries?: number;           // Retry count
  timeout?: number;           // Timeout in ms
}
```

---

## 🧪 Testing Checklist

- [ ] All `redirect()` replaced with `safeRedirect()`
- [ ] All `safeRedirect()` have `return` before them
- [ ] Session data uses `validateServerData(session?.user?.id)`
- [ ] Params use `validateServerData(params?.id)`
- [ ] Prisma queries wrapped in `fetchServerData()`
- [ ] Try-catch at component level
- [ ] Errors logged with `logger.error()`
- [ ] Optional chaining (`?.`) for nested access

---

## 📚 Documentation

- **Full Guide:** `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`
- **Implementation Report:** `RAPORT_SERVER_COMPONENT_SAFETY_FINAL.md`
- **Source Code:** `src/lib/serverSafe.ts`
- **Task Summary:** `TASK_SERVER_COMPONENT_SAFETY_COMPLETE.md`

---

## 🚀 Quick Start

1. Import functions from `@/lib/serverSafe`
2. Wrap auth check with `safeRedirect()`
3. Validate session with `validateServerData()`
4. Wrap Prisma with `fetchServerData()`
5. Add try-catch around component
6. Log errors with `logger.error()`

**Done! No more 502 errors.** ✅

---

*Generated: 2025-01-25 • See docs for detailed examples*
