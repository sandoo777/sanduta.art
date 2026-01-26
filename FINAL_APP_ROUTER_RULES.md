# FINAL APP ROUTER RULES — PERMANENT ARCHITECTURE

**Проект:** sanduta.art  
**Версія:** 1.0 (Final)  
**Дата:** 2026-01-26  
**Статус:** 🔒 **LOCKED** — ці правила не можна порушувати

---

## 🎯 Мета цього документа

Після циклу hardening (barrel files → Server Components → auth/prefetch) встановлюємо **незмінні правила** для App Router архітектури.

**Критерій успіху:**
- ✅ Debug predictibil (помилки легко знаходити)
- ✅ Zero регресії (нові фічі не ламають старе)
- ✅ Архітектура зрозуміла (новачок швидко розуміється)

---

## 📚 Ієрархія правил

### 1. CRITICAL (🔴 MUST FOLLOW)
Порушення = проект ламається (502, infinite loops, memory leaks).

### 2. IMPORTANT (🟠 SHOULD FOLLOW)
Порушення = unpredictable behavior, погана maintainability.

### 3. RECOMMENDED (🟡 NICE TO HAVE)
Порушення = sub-optimal, але працює.

---

## 🏗️ PART 1: SERVER vs CLIENT COMPONENTS

### 🔴 RULE 1.1: Server Component розмежування

**ДОЗВОЛЕНО в Server Components:**
```typescript
// ✅ Prisma queries
const products = await prisma.product.findMany();

// ✅ Direct API calls (server-to-server)
const data = await fetch('https://api.example.com', {
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
});

// ✅ fs, path, crypto (Node.js APIs)
import { readFileSync } from 'fs';
import { join } from 'path';

// ✅ getServerSession (NextAuth)
import { getServerSession } from 'next-auth';
const session = await getServerSession(authOptions);

// ✅ Environment variables (server-only)
const secret = process.env.NEXTAUTH_SECRET;
```

**ЗАБОРОНЕНО в Server Components:**
```typescript
// ❌ useState, useEffect, useContext
import { useState } from 'react'; // NEVER!

// ❌ Browser APIs
window.localStorage.setItem('key', 'value'); // NEVER!
document.querySelector('.class'); // NEVER!

// ❌ Event handlers
<button onClick={() => {}}>Click</button> // NEVER!

// ❌ useSession (NextAuth client)
import { useSession } from 'next-auth/react'; // NEVER!
```

**Чому важливо:**
- Server Components рендеряться на сервері (Node.js environment)
- Browser APIs не існують на сервері
- Client hooks не працюють в async Server Components

---

### 🔴 RULE 1.2: Client Component позначення

**Завжди додавай `'use client'` якщо:**
```typescript
// ✅ Використовуєш hooks
'use client';
import { useState, useEffect } from 'react';

// ✅ Обробляєш events
'use client';
export function Button({ onClick }) {
  return <button onClick={onClick}>Click</button>;
}

// ✅ Використовуєш browser APIs
'use client';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// ✅ Використовуєш Context
'use client';
import { useCart } from '@/context/CartContext';

// ✅ Використовуєш useSession (NextAuth)
'use client';
import { useSession } from 'next-auth/react';
```

**Важливо:**
- `'use client'` має бути **першою лінією файлу** (before imports)
- Один файл = один mode (або Server, або Client)
- Client Components можуть містити Server Components як children через props

---

### 🔴 RULE 1.3: Server Component safety patterns

**ЗАВЖДИ використовуй захисні wrapper:**

```typescript
// ❌ НЕБЕЗПЕЧНО
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login'); // Може викликати NEXT_REDIRECT error
  }
  const data = await prisma.table.findMany(); // Може timeout
  return <Component data={data} />;
}

// ✅ БЕЗПЕЧНО
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function Page() {
  try {
    // 1. Safe redirect
    const session = await getServerSession(authOptions);
    if (!session) return safeRedirect('/login'); // ← return!
    
    // 2. Validate data
    const userId = validateServerData(session?.user?.id, 'User ID missing');
    
    // 3. Fetch with timeout + retry
    const data = await fetchServerData(
      () => prisma.table.findMany({ where: { userId } }),
      { timeout: 10000, retries: 2 }
    );
    
    return <Component data={data} />;
  } catch (error) {
    logger.error('Page', 'Failed to load', { error });
    throw error; // Next.js error boundary
  }
}
```

**Правила:**
1. ✅ **ЗАВЖДИ** `return safeRedirect()` (not just `safeRedirect()`)
2. ✅ **ЗАВЖДИ** `validateServerData()` для session/params
3. ✅ **ЗАВЖДИ** `fetchServerData()` для Prisma queries
4. ✅ **ЗАВЖДИ** try/catch з logger.error()
5. ✅ **ЗАВЖДИ** throw для Next.js error boundary

**Документація:** `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`

---

### 🟠 RULE 1.4: Composition pattern (Server + Client)

**Правильна композиція:**
```typescript
// app/products/page.tsx (Server Component)
import { ClientFilter } from './_components/ClientFilter';
import { ProductList } from './_components/ProductList';

export default async function ProductsPage() {
  // Server-side data fetching
  const products = await prisma.product.findMany();
  
  return (
    <div>
      {/* Client Component for interactivity */}
      <ClientFilter />
      
      {/* Server Component for data */}
      <ProductList products={products} />
    </div>
  );
}

// _components/ClientFilter.tsx (Client Component)
'use client';
import { useState } from 'react';

export function ClientFilter() {
  const [filter, setFilter] = useState('');
  return <input value={filter} onChange={(e) => setFilter(e.target.value)} />;
}

// _components/ProductList.tsx (Server Component - no 'use client')
export function ProductList({ products }) {
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**Паттерн:**
- Page (Server) → fetchує дані
- Client Components → інтерактивність
- Server Components → static UI, дані

---

## 🔐 PART 2: AUTHENTICATION & AUTHORIZATION

### 🔴 RULE 2.1: Auth в middleware (server-side)

**Єдине правильне місце для auth check:**

```typescript
// middleware.ts
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check auth
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role
  if (path.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/operator/:path*', '/account/:path*']
};
```

**Правила:**
1. ✅ Використовуй `getToken()` (JWT-based, fast)
2. ✅ Не використовуй `getServerSession()` в middleware (slow)
3. ✅ Redirect неавторизованих ОДРАЗУ (before page render)
4. ✅ Matcher має містити всі protected routes

---

### 🔴 RULE 2.2: Auth в layouts (client-side UI)

**Protected layouts - завжди Client Components:**

```typescript
// app/admin/layout.tsx
'use client';

import { useSession } from 'next-auth/react';
import { LoadingState } from '@/components/ui/LoadingState';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();

  // 1. Show loading
  if (status === 'loading') {
    return <LoadingState />;
  }

  // 2. Middleware guarantees auth
  // If user reaches here, they are authenticated
  
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
```

**Правила:**
1. ✅ Layout = Client Component (може використовувати `useSession()`)
2. ✅ Показуй loading state поки `status === 'loading'`
3. ❌ **НІКОЛИ** не роби `router.replace('/login')` в useEffect (race condition!)
4. ✅ Middleware вже захищає, layout - тільки UI

**Документація:** `AUTH_PREFETCH_HARDENING_REPORT.md`

---

### 🔴 RULE 2.3: Auth в API routes

**Завжди перевіряй auth:**

```typescript
// app/api/admin/orders/route.ts
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // 1. Auth check
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    // 2. Log request
    logger.info('API:Orders', 'Fetching orders', { userId: user.id });

    // 3. Business logic
    const orders = await prisma.order.findMany({
      where: { /* ... */ }
    });

    // 4. Return response
    return NextResponse.json(orders);
    
  } catch (err) {
    logApiError('API:Orders', err);
    return createErrorResponse('Failed to fetch orders', 500);
  }
}
```

**Правила:**
1. ✅ **ЗАВЖДИ** `requireRole()` або `requireAuth()` на початку
2. ✅ **ЗАВЖДИ** try/catch wrapper
3. ✅ **ЗАВЖДИ** logging через `logger`
4. ✅ **ЗАВЖДИ** `createErrorResponse()` для помилок
5. ❌ **НІКОЛИ** не довіряй client-side даним (validate все!)

---

### 🟠 RULE 2.4: Prefetch для auth routes

**ЗАВЖДИ відключай prefetch для protected routes:**

```typescript
// ✅ Використовуй AuthLink
import { AuthLink } from '@/components/common/links/AuthLink';

<AuthLink href="/admin/orders">Orders</AuthLink>
// Default: prefetch={false}

// ✅ Або явно вказуй prefetch={false}
import Link from 'next/link';

<Link href="/admin/orders" prefetch={false}>Orders</Link>

// ❌ НІКОЛИ без prefetch={false} для auth routes
<Link href="/admin/orders">Orders</Link>
// Prefetch може спрацювати ДО middleware check!
```

**Правила:**
1. ✅ AuthLink для всіх auth routes
2. ✅ `prefetch={false}` для /admin, /manager, /operator, /account
3. ✅ Default prefetch OK для public routes (/, /products, /about)

**Чому важливо:**
- Prefetch = Next.js завантажує page ДО кліку
- Якщо page має auth check → може викликати помилки
- AuthLink вимикає prefetch для безпеки

---

## 📦 PART 3: DATA FETCHING

### 🔴 RULE 3.1: Server Components - direct Prisma

**В Server Components можеш напряму використовувати Prisma:**

```typescript
// app/products/page.tsx (Server Component)
import { prisma } from '@/lib/db';
import { fetchServerData } from '@/lib/serverSafe';

export default async function ProductsPage() {
  // ✅ Direct Prisma query wrapped in fetchServerData
  const products = await fetchServerData(
    () => prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    { timeout: 10000, retries: 2 }
  );

  return <ProductList products={products} />;
}
```

**Правила:**
1. ✅ Використовуй `fetchServerData()` wrapper (timeout + retry)
2. ✅ Select тільки потрібні поля (`select: { id: true, name: true }`)
3. ✅ Include тільки необхідні relations
4. ❌ Уникай N+1 queries (використовуй include/select wisely)

---

### 🔴 RULE 3.2: Client Components - API routes або hooks

**В Client Components завжди через API або custom hooks:**

```typescript
// ❌ НІКОЛИ в Client Component
'use client';
import { prisma } from '@/lib/db';
const products = await prisma.product.findMany(); // ПОМИЛКА!

// ✅ Через API route
'use client';
export function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
  
  return <div>{products.map(...)}</div>;
}

// ✅ АБО через custom hook зі safeFetch
'use client';
import { useProducts } from '@/hooks/useProducts';

export function ProductList() {
  const { data: products, isLoading, error } = useProducts();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return <div>{products.map(...)}</div>;
}
```

**Правила:**
1. ✅ Client Components → API routes → Prisma
2. ✅ Використовуй custom hooks з `safeFetch`
3. ✅ Handle loading/error states
4. ❌ **НІКОЛИ** Prisma безпосередньо в Client Component

---

### 🟠 RULE 3.3: Caching strategy

**ISR (Incremental Static Regeneration) для public routes:**

```typescript
// app/products/page.tsx
export const revalidate = 3600; // 1 година

export default async function ProductsPage() {
  const products = await prisma.product.findMany();
  return <ProductList products={products} />;
}
```

**Dynamic для auth routes:**

```typescript
// app/admin/orders/page.tsx
export const dynamic = 'force-dynamic'; // Always fresh

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany();
  return <OrdersList orders={orders} />;
}
```

**Правила:**
1. ✅ Public routes → ISR (revalidate: 3600)
2. ✅ Auth routes → force-dynamic
3. ✅ API routes → cache headers (Cache-Control)
4. ❌ Уникай over-caching sensitive data

---

## ⚠️ PART 4: ERROR HANDLING

### 🔴 RULE 4.1: Try/catch everywhere async

**ЗАВЖДИ обгортай async code:**

```typescript
// ❌ НЕБЕЗПЕЧНО
export default async function Page() {
  const data = await prisma.table.findMany(); // Може fail!
  return <Component data={data} />;
}

// ✅ БЕЗПЕЧНО
export default async function Page() {
  try {
    const data = await fetchServerData(
      () => prisma.table.findMany(),
      { timeout: 10000, retries: 2 }
    );
    return <Component data={data} />;
  } catch (error) {
    logger.error('Page', 'Failed to load', { error });
    throw error; // Next.js error boundary
  }
}
```

**Правила:**
1. ✅ Try/catch для всіх async Server Components
2. ✅ logger.error() для logging
3. ✅ throw для Next.js error boundary
4. ✅ Graceful fallbacks де можливо

---

### 🔴 RULE 4.2: API routes error responses

**Стандартизовані HTTP коди:**

```typescript
import { createErrorResponse } from '@/lib/logger';

// ✅ 400 - Bad Request (client error)
if (!email) {
  return createErrorResponse('Email is required', 400);
}

// ✅ 401 - Unauthorized (not authenticated)
if (!session) {
  return createErrorResponse('Authentication required', 401);
}

// ✅ 403 - Forbidden (not authorized)
if (user.role !== 'ADMIN') {
  return createErrorResponse('Admin access required', 403);
}

// ✅ 404 - Not Found
if (!order) {
  return createErrorResponse('Order not found', 404);
}

// ✅ 409 - Conflict (duplicate, constraint violation)
if (existingUser) {
  return createErrorResponse('Email already exists', 409);
}

// ✅ 500 - Internal Server Error
catch (error) {
  logApiError('API:Route', error);
  return createErrorResponse('Server error', 500);
}
```

**Правила:**
1. ✅ Використовуй правильні HTTP коди
2. ✅ `createErrorResponse()` для consistency
3. ✅ Log всі 500 errors через `logApiError()`
4. ❌ Не expose internal details в error messages (security!)

---

### 🟠 RULE 4.3: Client-side error handling

**Graceful degradation:**

```typescript
'use client';

export function ProductList() {
  const { data, isLoading, error } = useProducts();

  // 1. Loading state
  if (isLoading) {
    return <LoadingState message="Loading products..." />;
  }

  // 2. Error state
  if (error) {
    return (
      <ErrorState 
        error={error}
        retry={() => window.location.reload()}
      />
    );
  }

  // 3. Empty state
  if (data?.length === 0) {
    return <EmptyState message="No products found" />;
  }

  // 4. Success state
  return <div>{data.map(...)}</div>;
}
```

**Правила:**
1. ✅ Handle: loading, error, empty, success states
2. ✅ Provide retry mechanism для errors
3. ✅ User-friendly messages (не технічні деталі)
4. ✅ Використовуй UI components (LoadingState, ErrorState, EmptyState)

---

## 📝 PART 5: VALIDATION & SECURITY

### 🔴 RULE 5.1: Validate all inputs

**Server-side validation ЗАВЖДИ:**

```typescript
// app/api/orders/route.ts
import { validateCheckoutForm } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // 1. Validate
  const errors = validateCheckoutForm(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  
  // 2. Sanitize (якщо потрібно)
  const email = body.email.toLowerCase().trim();
  
  // 3. Process
  // ...
}
```

**Правила:**
1. ✅ **ЗАВЖДИ** validate на сервері (never trust client)
2. ✅ Використовуй `src/lib/validation.ts` functions
3. ✅ Return 400 з описом помилок
4. ❌ Client-side validation = UX, не security

---

### 🔴 RULE 5.2: Environment variables security

**НІКОЛИ не expose secrets на client:**

```typescript
// ✅ Server-side OK
const apiKey = process.env.PAYNET_API_KEY;
const secret = process.env.NEXTAUTH_SECRET;

// ❌ НЕБЕЗПЕЧНО - client може побачити!
const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Exposed!
```

**Правила:**
1. ✅ Secrets → без `NEXT_PUBLIC_` prefix
2. ✅ Public config → з `NEXT_PUBLIC_` prefix
3. ✅ Validate env vars при старті (у `next.config.ts`)
4. ❌ **НІКОЛИ** не commit `.env` в git

---

## 📋 PART 6: PRE-FEATURE CHECKLIST

### 🔴 Pre-Development Checklist

- [ ] Визначено тип компонента: Server або Client?
- [ ] Якщо Server → чи потрібен `safeRedirect`, `fetchServerData`?
- [ ] Якщо Client → чи є `'use client'` directive?
- [ ] Чи потрібна auth? → Middleware + requireRole()
- [ ] Чи потрібна валідація? → використовуй `lib/validation.ts`
- [ ] Чи є async код? → try/catch + logger

### 🟠 Development Checklist

- [ ] Imports: alias (`@/`), не barrel files для Client Components (див. IMPORT_RULES.md)
- [ ] Error handling: try/catch, logging, graceful fallback
- [ ] Types: TypeScript без `any`, використовуй Prisma types
- [ ] Validation: server-side через `lib/validation.ts`
- [ ] Auth: middleware + API routes з `requireRole()`
- [ ] Prefetch: `AuthLink` або `prefetch={false}` для auth routes

### 🟡 Post-Development Checklist

- [ ] Tests: додані для critical logic
- [ ] Lint: `npm run lint` без помилок
- [ ] Types: `npm run type-check` (якщо є) без помилок
- [ ] Manual test: перевірено в browser (dev mode)
- [ ] Performance: немає зайвих re-renders, оптимізовані зображення
- [ ] Security: немає exposed secrets, validated inputs

---

## 🔒 STABLE ZONES

### ✅ ZONE 1: Authentication & Authorization

**Файли:**
- `middleware.ts` — server-side auth check
- `src/modules/auth/nextauth.ts` — NextAuth config
- `src/lib/auth-helpers.ts` — requireRole, requireAuth
- Protected layouts: `app/admin/layout.tsx`, `app/manager/layout.tsx`, `app/operator/layout.tsx`, `app/account/layout.tsx`

**Статус:** 🔒 **STABLE** — працює правильно, не чіпати без extreme need

**Правила:**
1. ❌ Не додавай getServerSession() в Client Components
2. ❌ Не додавай auth redirects в useEffect
3. ❌ Не змінюй middleware matcher без review
4. ✅ Використовуй існуючі helpers (requireRole, requireAuth)

**Документація:** `AUTH_PREFETCH_HARDENING_REPORT.md`

---

### ✅ ZONE 2: Server Component Safety Layer

**Файли:**
- `src/lib/serverSafe.ts` — safeRedirect, validateServerData, fetchServerData
- Server Components в `app/account/` — використовують safety patterns

**Статус:** 🔒 **STABLE** — tested & hardened

**Правила:**
1. ✅ **ЗАВЖДИ** `return safeRedirect()`
2. ✅ **ЗАВЖДИ** `validateServerData()` для critical data
3. ✅ **ЗАВЖДИ** `fetchServerData()` для Prisma
4. ❌ Не обходь ці helpers (вони захищають від crashes)

**Документація:** `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`

---

### ✅ ZONE 3: Validation & Error Handling

**Файли:**
- `src/lib/validation.ts` — форми validation
- `src/lib/logger.ts` — logging utilities
- `src/lib/safeFetch.ts` — client-side fetch wrapper

**Статус:** 🔒 **STABLE** — comprehensive coverage

**Правила:**
1. ✅ Використовуй існуючі validation functions (не дублюй логіку)
2. ✅ Логуй через `logger` (structured logging)
3. ✅ Client fetches через `safeFetch` (автоматичний retry + error handling)
4. ❌ Не створюй нові validation functions без перевірки існуючих

**Документація:** `docs/RELIABILITY.md`

---

### ✅ ZONE 4: UI Components Library

**Файли:**
- `src/components/ui/` — Button, Card, Badge, Input, Select, etc.

**Статус:** 🔒 **STABLE** — standardized across project

**Правила:**
1. ✅ Використовуй існуючі UI components
2. ✅ Variants через props (не створюй нові компоненти для кожної варіації)
3. ❌ Не імпортуй з barrel file (`ui/index.ts`) — див. IMPORT_RULES.md
4. ✅ Direct imports: `@/components/ui/Button`

**Документація:** `docs/UI_COMPONENTS.md`

---

### ⚠️ ZONE 5: Public Home Page

**Файли:**
- `src/app/page.tsx` — homepage
- `src/components/public/home/` — homepage components

**Статус:** ⚠️ **CAREFUL** — був barrel file issue, зараз виправлено

**Правила:**
1. ✅ Direct imports (не через `public/home/index.ts`)
2. ✅ Prefetch OK для public routes
3. ❌ Не додавай Client Component exports в barrel files

**Документація:** `RAPORT_BARREL_FILES_FINAL.md`, `IMPORT_RULES.md`

---

### 🟢 ZONE 6: Admin Panel

**Файли:**
- `src/app/admin/` — всі admin routes
- `src/app/admin/_components/` — AdminSidebar, AdminTopbar

**Статус:** 🟢 **ACTIVE DEVELOPMENT** — можна змінювати

**Правила:**
1. ✅ Використовуй AuthLink або `prefetch={false}`
2. ✅ API routes через `requireRole(['ADMIN'])`
3. ✅ Direct imports для components (див. IMPORT_RULES.md)
4. ✅ Force-dynamic для fresh data

---

## 🚨 FORBIDDEN PATTERNS

### ❌ PATTERN 1: Client Component в barrel file

```typescript
// ❌ ЗАБОРОНЕНО
// src/components/ui/index.ts
'use client';
export { Button } from './Button';
```

**Наслідки:** 502 errors, infinite loops, unpredictable behavior

**Рішення:** Видали Client Component exports з barrel files, використовуй direct imports. Детально в `IMPORT_RULES.md`.

---

### ❌ PATTERN 2: redirect() без return

```typescript
// ❌ ЗАБОРОНЕНО
export default async function Page() {
  if (!session) {
    redirect('/login'); // Missing return!
  }
  return <div>Content</div>; // Може виконатись!
}

// ✅ ПРАВИЛЬНО
export default async function Page() {
  if (!session) {
    return safeRedirect('/login'); // ← return!
  }
  return <div>Content</div>;
}
```

**Наслідки:** NEXT_REDIRECT errors, unexpected renders

---

### ❌ PATTERN 3: Prisma в Client Component

```typescript
// ❌ ЗАБОРОНЕНО
'use client';
import { prisma } from '@/lib/db';

export function ProductList() {
  const products = await prisma.product.findMany(); // RUNTIME ERROR!
}
```

**Наслідки:** Runtime crash, Prisma не працює в browser

**Рішення:** Використовуй API route або Server Component

---

### ❌ PATTERN 4: useEffect auth redirect

```typescript
// ❌ ЗАБОРОНЕНО
'use client';
export default function AccountLayout() {
  const { session } = useSession();
  
  useEffect(() => {
    if (!session) {
      router.replace('/login'); // RACE CONDITION!
    }
  }, [session]);
}
```

**Наслідки:** Race condition з prefetch, flickering UI

**Рішення:** Middleware робить redirect, layout - тільки UI

---

### ❌ PATTERN 5: Exposed secrets

```typescript
// ❌ ЗАБОРОНЕНО
const apiKey = process.env.NEXT_PUBLIC_SECRET_KEY; // Client може побачити!

// ✅ ПРАВИЛЬНО
const apiKey = process.env.SECRET_KEY; // Тільки server-side
```

**Наслідки:** Security vulnerability, leaked credentials

---

## 📖 DOCUMENTATION REFERENCES

### Critical Docs (READ FIRST)

1. **`IMPORT_RULES.md`** ← **NEW! Обов'язково читати**
   - Import/export patterns
   - Barrel file rules
   - Module organization

2. **`AUTH_PREFETCH_HARDENING_REPORT.md`**
   - Auth architecture
   - Prefetch rules
   - Protected layouts patterns

3. **`docs/SERVER_COMPONENT_SAFETY_GUIDE.md`**
   - safeRedirect usage
   - fetchServerData patterns
   - Error handling

4. **`RAPORT_BARREL_FILES_FINAL.md`**
   - Barrel file anti-patterns
   - Case studies

### Supporting Docs

- `docs/RELIABILITY.md` — error handling patterns
- `docs/UI_COMPONENTS.md` — UI library reference
- `docs/TESTING.md` — testing strategy
- `.github/copilot-instructions.md` — AI agent rules

---

## 🎓 LESSONS LEARNED (War Stories)

### 1. Barrel File 502s

**Problem:** Homepage 502 errors, random crashes  
**Root Cause:** Client Components re-exported through barrel files  
**Solution:** Eliminated Client Component exports, direct imports only  
**Prevention:** IMPORT_RULES.md — never export Client Components from barrel files

### 2. Missing return before redirect()

**Problem:** NEXT_REDIRECT errors, pages render after redirect  
**Root Cause:** `redirect()` without `return` statement  
**Solution:** `return safeRedirect()` everywhere  
**Prevention:** RULE 1.3 — always return safeRedirect()

### 3. Prisma timeout crashes

**Problem:** Server Components hang, no timeout  
**Root Cause:** Prisma queries without timeout protection  
**Solution:** `fetchServerData()` wrapper з timeout + retry  
**Prevention:** RULE 1.3 — wrap all Prisma in fetchServerData()

### 4. useEffect auth redirect race

**Problem:** Flickering UI, race conditions з prefetch  
**Root Cause:** `router.replace('/login')` в useEffect  
**Solution:** Видалили useEffect, middleware робить redirect  
**Prevention:** RULE 2.2 — no redirects in useEffect

---

## ✅ SUCCESS CRITERIA

**Досягнуто якщо:**

✅ **Debug predictibil** — помилки легко знайти через structured logging  
✅ **Zero регресії** — нові фічі не ламають існуючі (stable zones)  
✅ **Архітектура зрозуміла** — новий dev розуміється за 1 день

**Metrics:**
- 🟢 0 barrel file imports Client Components
- 🟢 100% auth routes через middleware
- 🟢 100% protected routes з prefetch={false}
- 🟢 100% async Server Components з try/catch
- 🟢 100% API routes з requireRole()

---

## 🔮 FUTURE-PROOFING

**Ці правила стабільні для:**
- Next.js 14-15 App Router
- React 18-19 Server Components
- NextAuth 4.x JWT strategy

**Якщо оновлюєш Next.js:**
1. Перечитай BREAKING CHANGES
2. Протестуй stable zones
3. Оновлюй ці правила якщо потрібно

**Якщо додаєш нову бібліотеку:**
1. Перевір чи вона працює в Server Components
2. Якщо ні → додай до Client Components або dynamic import
3. Не експортуй через barrel files (див. IMPORT_RULES.md)

---

## 📞 SUPPORT

**Якщо щось незрозуміло:**
1. Перечитай відповідний PART вище
2. Подивись Documentation References
3. Grep codebase для прикладів: `grep -r "pattern" src/`

**Якщо знайшов bug related to ці правила:**
1. Створи issue з тегом `architecture`
2. Опиши який RULE порушено
3. Запропонуй fix

---

**VERSION:** 1.0 Final  
**LAST UPDATED:** 2026-01-26  
**STATUS:** 🔒 LOCKED — do not violate these rules  
**NEXT REVIEW:** After major Next.js version upgrade
