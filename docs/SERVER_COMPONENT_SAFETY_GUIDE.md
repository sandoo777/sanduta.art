# Server Component Safety — Developer Guide

**Ghid rapid pentru utilizarea `serverSafe.ts` în Server Components Next.js 15**

---

## 🎯 De ce avem nevoie de acest safety layer?

### Probleme comune în Server Components:

1. **502 Errors** din throw-uri necontrolate
2. **Crash-uri** la redirect() în cazuri neașteptate
3. **Null reference errors** la `session.user.id` fără verificare
4. **Timeout-uri** la Prisma queries fără handling
5. **Prefetch failures** care crash-ează paginile

### Soluția:

Library `src/lib/serverSafe.ts` cu 8 funcții de protecție pentru toate cazurile.

---

## 📚 Funcții Disponibile

### 1. `safeRedirect(path: string)`

**Folosire:** Protejează orice `redirect()` în Server Component.

```typescript
import { safeRedirect } from '@/lib/serverSafe';

// ❌ ÎNAINTE (periculos):
if (!session) redirect('/login');

// ✅ DUPĂ (safe):
if (!session) return safeRedirect('/login');
```

**Ce face:**
- Permite NEXT_REDIRECT să treacă normal (comportament așteptat)
- Catch-ește alte erori și le log-ează
- Re-throw NEXT_REDIRECT pentru Next.js să proceseze

**Când să folosești:**
- **Oricând** faci redirect în Server Component
- Auth checks: `if (!session) return safeRedirect('/login')`
- Role checks: `if (!isAdmin) return safeRedirect('/')`

---

### 2. `validateServerData<T>(data, message)`

**Folosire:** Validează că datele există înainte de utilizare.

```typescript
import { validateServerData } from '@/lib/serverSafe';

// ❌ ÎNAINTE (periculos):
const userId = session.user.id; // Crash dacă session.user e null

// ✅ DUPĂ (safe):
const userId = validateServerData(
  session?.user?.id,
  'User ID not found in session'
);
```

**Ce face:**
- Verifică `data !== null && data !== undefined`
- Throw `ServerComponentError` cu mesaj clar dacă fail
- Type-safe: returnează `T` (nu `T | null`)

**Când să folosești:**
- După `getServerSession()`: validează `session?.user?.id`
- După `params`: validează `params?.id`
- Înainte de a accesa nested properties: `order?.customer?.email`

---

### 3. `fetchServerData<T>(fetcher, options)`

**Folosire:** Wrapper pentru Prisma queries cu timeout + retry.

```typescript
import { fetchServerData } from '@/lib/serverSafe';

// ❌ ÎNAINTE (fără timeout):
const orders = await prisma.order.findMany({ where: { userId } });

// ✅ DUPĂ (cu timeout + retry):
const orders = await fetchServerData(
  () => prisma.order.findMany({ where: { userId } }),
  { 
    timeout: 10000,  // 10s
    retries: 2       // 2 încercări
  }
);
```

**Opțiuni:**
```typescript
{
  timeout?: number;   // Default: 10000ms (10s)
  retries?: number;   // Default: 2
}
```

**Ce face:**
- Timeout automat la 10s (previne hanging)
- Retry cu exponential backoff: 2^attempt * 1000ms
- Log-ează fiecare încercare și eroare
- Throw după retries exhaust

**Când să folosești:**
- **Toate** Prisma queries în Server Components
- Fetch-uri externe (API calls)
- Operațiuni DB complexe

---

### 4. `serverSafe<T>(fn, options)`

**Folosire:** Wrapper generic pentru async functions.

```typescript
import { serverSafe } from '@/lib/serverSafe';

const result = await serverSafe(
  async () => {
    // Logică complexă
    const data = await fetchSomething();
    return processData(data);
  },
  {
    fallbackData: [],           // Returnează [] la eroare
    redirectOnError: '/error',  // SAU redirect la /error
    retries: 3,                 // 3 încercări
    timeout: 15000              // 15s timeout
  }
);
```

**Opțiuni:**
```typescript
{
  fallbackData?: T;           // Date de fallback
  fallbackComponent?: JSX;    // Component de fallback (TODO: nu funcționează în .ts)
  redirectOnError?: string;   // Path pentru redirect
  retries?: number;           // Retry count
  timeout?: number;           // Timeout in ms
}
```

**Când să folosești:**
- Logică complexă cu multiple failure points
- Când vrei fallback data la eroare
- Când preferi redirect în loc de throw

---

### 5. `withServerSafety(Component, options)`

**Folosire:** HOC pentru protecție la nivel de componentă întreagă.

```typescript
import { withServerSafety } from '@/lib/serverSafe';

async function MyServerPage() {
  // Logică fără try-catch manual
  const session = await getServerSession(authOptions);
  // ...
  return <MyClient />;
}

// Wrap cu protecție
export default withServerSafety(MyServerPage, {
  redirectOnError: '/error'
});
```

**Când să folosești:**
- Pages complexe cu multe failure points
- Când vrei protecție automată fără try-catch manual
- **Notă:** De preferat pattern-ul manual cu try-catch pentru control mai fin

---

### 6-8. Type Guards

```typescript
import { isValidArray, isValidObject, hasRequiredFields } from '@/lib/serverSafe';

// Verifică array valid și non-empty
if (isValidArray(orders)) {
  // orders are sigur length > 0
}

// Verifică object valid și non-empty
if (isValidObject(user)) {
  // user are sigur cel puțin o proprietate
}

// Verifică câmpuri obligatorii
if (hasRequiredFields(data, ['name', 'email'])) {
  // data.name și data.email există sigur
}
```

---

## 🎨 Pattern-uri Recomandate

### Pattern 1: Auth Check Simple

```typescript
import { safeRedirect, validateServerData } from '@/lib/serverSafe';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) return safeRedirect('/login');
  
  const userId = validateServerData(session?.user?.id, 'User ID missing');
  
  // Continuă cu logică...
}
```

### Pattern 2: Auth + Data Fetching

```typescript
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function Page() {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);
    if (!session) return safeRedirect('/login');
    
    // 2. Validate
    const userId = validateServerData(session?.user?.id, 'User ID missing');
    
    // 3. Fetch
    const data = await fetchServerData(
      () => prisma.table.findMany({ where: { userId } })
    );
    
    return <MyClient data={data} />;
  } catch (error) {
    logger.error('Page', 'Failed', { error });
    throw error; // Next.js error boundary
  }
}
```

### Pattern 3: Role Check

```typescript
export default async function AdminPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return safeRedirect('/login');
    
    const userRole = validateServerData(session?.user?.role, 'Role missing');
    
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return safeRedirect('/');
    }
    
    // Admin logic...
  } catch (error) {
    throw error;
  }
}
```

### Pattern 4: Params Validation

```typescript
export default async function DetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  try {
    const { id } = await params;
    
    // Validate ID exists
    const orderId = validateServerData(id, 'Order ID missing from URL');
    
    // Fetch with validated ID
    const order = await fetchServerData(
      () => prisma.order.findUnique({ where: { id: orderId } })
    );
    
    if (!order) return safeRedirect('/account/orders');
    
    return <OrderDetail order={order} />;
  } catch (error) {
    throw error;
  }
}
```

---

## ⚠️ Greșeli Frecvente

### ❌ Greșeală 1: Redirect fără return

```typescript
// GREȘIT — redirect execută dar funcția continuă
if (!session) safeRedirect('/login');
console.log(session.user.id); // Crash aici!

// CORECT
if (!session) return safeRedirect('/login');
```

### ❌ Greșeală 2: Validate după utilizare

```typescript
// GREȘIT — crash înainte de validare
const userId = session.user.id;
validateServerData(userId, 'Missing');

// CORECT — validare ÎNAINTE de utilizare
const userId = validateServerData(session?.user?.id, 'Missing');
```

### ❌ Greșeală 3: Prisma fără wrapper

```typescript
// GREȘIT — fără timeout/retry
const orders = await prisma.order.findMany(...);

// CORECT — cu protecție
const orders = await fetchServerData(
  () => prisma.order.findMany(...)
);
```

### ❌ Greșeală 4: Nested access fără optional chaining

```typescript
// GREȘIT — crash la null
const email = session.user.email;

// CORECT — optional chaining + validate
const email = validateServerData(session?.user?.email, 'Email missing');
```

---

## 🧪 Exemple Complete

### Exemplu 1: User Orders Page

```typescript
// src/app/account/orders/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import prisma from '@/lib/prisma';
import OrdersList from './OrdersList';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function OrdersPage() {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return safeRedirect('/auth/signin');
    }

    // Validate user ID
    const userId = validateServerData(
      session?.user?.id,
      'User ID not found in session'
    );

    // Fetch orders with safety wrapper
    const orders = await fetchServerData(
      () => prisma.order.findMany({
        where: { customerId: userId },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      {
        timeout: 10000,
        retries: 2
      }
    );

    return <OrdersList orders={orders} />;
  } catch (error) {
    logger.error('OrdersPage', 'Failed to load orders', { error });
    throw error;
  }
}
```

### Exemplu 2: Order Detail Page

```typescript
// src/app/account/orders/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderDetail from './OrderDetail';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function OrderDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return safeRedirect('/login?callbackUrl=/account/orders');
    }

    // Validate session
    const userId = validateServerData(
      session?.user?.id,
      'User ID not found in session'
    );

    // Await and validate params
    const { id } = await params;
    const orderId = validateServerData(id, 'Order ID missing');

    // Fetch order
    const order = await fetchServerData(
      () => prisma.order.findUnique({
        where: { 
          id: orderId,
          customerId: userId  // Security: only user's orders
        },
        include: {
          orderItems: { include: { product: true } },
          payment: true,
          delivery: true
        }
      })
    );

    // Handle not found
    if (!order) {
      notFound(); // Next.js 404 page
    }

    return <OrderDetail order={order} />;
  } catch (error) {
    logger.error('OrderDetailPage', 'Failed', { error });
    throw error;
  }
}
```

### Exemplu 3: Manager Dashboard

```typescript
// src/app/manager/orders/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import prisma from '@/lib/prisma';
import ManagerDashboard from './ManagerDashboard';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function ManagerOrdersPage() {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return safeRedirect('/login');
    }

    // Validate role
    const userRole = validateServerData(
      session?.user?.role,
      'User role not found in session'
    );

    // Role check
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return safeRedirect('/');
    }

    // Fetch all orders (managers can see all)
    const orders = await fetchServerData(
      () => prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customer: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      {
        timeout: 15000,  // Longer timeout for many orders
        retries: 2
      }
    );

    return <ManagerDashboard orders={orders} />;
  } catch (error) {
    logger.error('ManagerOrdersPage', 'Failed', { error });
    throw error;
  }
}
```

---

## 🚀 Checklist pentru Code Review

Când reviewing Server Components, verifică:

- [ ] **Toate** `redirect()` sunt înlocuite cu `safeRedirect()`
- [ ] **Toate** `redirect()` au `return` înainte
- [ ] Session data folosește `validateServerData(session?.user?.id)`
- [ ] Params folosesc `validateServerData(params?.id)`
- [ ] Prisma queries sunt wrapped în `fetchServerData()`
- [ ] Există try-catch la nivel de componentă
- [ ] Erori sunt log-ate cu `logger.error()`
- [ ] Optional chaining (`?.`) folosit pentru nested access

---

## 🔍 Debugging Tips

### 1. Verifică log-urile

```typescript
// serverSafe.ts log-ează automat toate operațiunile
// Caută în console:
[ServerSafe] Redirecting to: /login
[ServerSafe] Validating data: User ID
[ServerSafe] Fetching data (attempt 1/3)
```

### 2. Testează manual redirect-urile

```bash
# Acces fără auth
curl -I http://localhost:3000/account/orders
# Expect: 307 Temporary Redirect
# Location: http://localhost:3000/login
```

### 3. Simulează timeout-uri

```typescript
// În fetchServerData, setează timeout mic pentru test
const data = await fetchServerData(
  () => new Promise(resolve => setTimeout(resolve, 20000)),
  { timeout: 1000 }  // Timeout după 1s
);
// Expect: Throw după 1s + 2 retries
```

---

## 📖 Resurse Suplimentare

- **Raport Final:** `/RAPORT_SERVER_COMPONENT_SAFETY_FINAL.md`
- **Cod Sursă:** `/src/lib/serverSafe.ts`
- **Next.js Docs:** [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- **NextAuth Docs:** [getServerSession](https://next-auth.js.org/configuration/nextjs#getserversession)

---

**Questions? Check source code or contact tech lead.**
