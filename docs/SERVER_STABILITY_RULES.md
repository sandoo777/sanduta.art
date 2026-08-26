# SERVER STABILITY RULES

**Reguli stricte pentru prevenirea erorilor 502 și crash-uri server în Next.js**

> 📅 Ultima actualizare: 2026-01-25  
> ⚡ Status: ACTIV — respectare obligatorie pentru toți dezvoltatorii

---

## 🎯 Obiectiv

Prevenirea definitivă a crash-urilor server Next.js care duc la:
- 502 Bad Gateway
- `chrome-error://chromewebdata`
- Server unresponsive
- Build failures în producție

**Principiu fundamental**: **FAIL FAST CONTROLLED**
- Orice Server Component trebuie să aibă guard (auth / data)
- NICIUN Server Component nu aruncă erori brute
- Toate erorile sunt:
  - ✅ Logate
  - ✅ Transformate în redirect / empty state
  - ✅ Afișate user-friendly

---

## 🚨 ADEVĂRUL despre 502

**IMPORTANT**: Citește [SERVER_LIMITS_REALITY.md](SERVER_LIMITS_REALITY.md) pentru context complet.

### Ce NU produce 502:
- ❌ Dimensiunea proiectului
- ❌ Numărul de fișiere
- ❌ RAM insuficient (dacă Node.js rulează)
- ❌ CPU overload

### Ce PRODUCE 502:
- ✅ Crash în Server Component
- ✅ Loop intern (fetch către propria aplicație)
- ✅ Eroare necontrolată (auth, prisma, redirect)
- ✅ Build corupt

**Regulă de aur**: Dacă apare 502, **caută crash-ul în cod**, nu limitări de server!

---

## ⚠️ Cauze Principale de Crash

### 1. **Unhandled Exceptions în Server Components**
```tsx
// ❌ INTERZIS
export default async function Page() {
  const data = await prisma.product.findMany(); // Poate arunca eroare
  return <div>{data.map(...)}</div>;
}

// ✅ CORECT
export default async function Page() {
  const result = await serverSafe(
    async () => {
      return await prisma.product.findMany();
    },
    { context: 'ProductsPage', redirectTo: '/error' }
  );

  if (!result.success) {
    return <ErrorState message="Nu s-au putut încărca produsele" />;
  }

  return <div>{result.data.map(...)}</div>;
}
```

### 2. **Redirect Necontrolat**
```tsx
// ❌ INTERZIS
export default async function Layout() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login'); // Poate cauza crash în anumite condiții
  }
}

// ✅ CORECT
export default async function Layout() {
  try {
    const session = await getServerSession();
    if (!session) {
      redirect('/login');
    }
  } catch (error) {
    logger.error('Layout:Auth', 'Session check failed', { error });
    redirect('/error');
  }
}
```

### 3. **JSON.parse Neprotejat**
```tsx
// ❌ INTERZIS
const config = JSON.parse(product.options); // Crash dacă JSON invalid

// ✅ CORECT
import { safeJsonParse } from '@/lib/server-safe';
const config = safeJsonParse(product.options, {}, 'ProductConfig');
```

### 4. **Fetch fără Error Handling**
```tsx
// ❌ INTERZIS
const response = await fetch('/api/data');
const data = await response.json(); // Crash dacă 404 sau timeout

// ✅ CORECT
import { safeFetch } from '@/lib/server-safe';
const result = await safeFetch('/api/data', {}, 'DataFetch');
if (!result.success) {
  return <ErrorState />;
}
```

### 5. **Prefetch Agresiv**
```tsx
// ❌ RISC RIDICAT
<Link href="/admin/orders">Orders</Link> // Prefetch automat

// ✅ SIGUR
<Link href="/admin/orders" prefetch={false}>Orders</Link>
```

---

## 📋 Checklist Înainte de Commit

- [ ] **Server Components**: toate operațiile async au `try/catch` sau `serverSafe()`
- [ ] **Redirect-uri**: sunt înfășurate în `try/catch`
- [ ] **JSON.parse**: folosesc `safeJsonParse()` din `server-safe.ts`
- [ ] **Fetch extern**: folosesc `safeFetch()` cu retry
- [ ] **Prisma queries**: folosesc `safePrismaQuery()` sau `try/catch`
- [ ] **Link-uri admin**: au `prefetch={false}`
- [ ] **Logging**: toate erorile sunt logate cu `logger.error()`
- [ ] **Fallback UI**: există component de eroare pentru fiecare rută critică

---

## 🛡️ Sistem Failsafe Global

### Locație
```
src/lib/server-safe.ts
```

### Funcții Disponibile

#### 1. `serverSafe<T>()` — Wrapper universal
```typescript
const result = await serverSafe(
  async () => { /* operație riscantă */ },
  {
    context: 'NomeComponentă',
    redirectTo: '/error', // opțional
    rethrow: false        // opțional
  }
);

if (!result.success) {
  // handle error
}
```

#### 2. `requireAuthOrRedirect()` — Auth guard
```typescript
await requireAuthOrRedirect('/login', 'AdminLayout', getServerSession);
```

#### 3. `requireRoleOrRedirect()` — Role guard
```typescript
await requireRoleOrRedirect(
  ['ADMIN', 'MANAGER'],
  '/unauthorized',
  'AdminPage',
  getCurrentUser
);
```

#### 4. `safeJsonParse<T>()` — JSON parsing
```typescript
const config = safeJsonParse<Config>(
  jsonString,
  { defaultValue: true },
  'ConfigParser'
);
```

#### 5. `safeFetch<T>()` — HTTP requests cu retry
```typescript
const result = await safeFetch<Data>(
  '/api/endpoint',
  { method: 'POST', body: JSON.stringify(data) },
  'ApiCall',
  3 // retry count
);
```

#### 6. `safePrismaQuery<T>()` — Prisma protection
```typescript
const products = await safePrismaQuery(
  () => prisma.product.findMany(),
  [],
  'ProductsList'
);
```

---

## 🚨 Pattern-uri INTERZISE

### ❌ 1. Throw direct în Server Component
```tsx
export default async function Page() {
  if (!condition) {
    throw new Error('Bad request'); // INTERZIS!
  }
}
```

### ❌ 2. Unhandled Promise Rejection
```tsx
async function loadData() {
  await someAsyncOperation(); // fără try/catch
}
```

### ❌ 3. Redirect în catch fără context
```tsx
try {
  // ...
} catch {
  redirect('/error'); // Poate cauza loop sau crash
}
```

### ❌ 4. Prefetch pentru rute complexe
```tsx
<Link href="/admin/production/[id]" /> // INTERZIS fără prefetch={false}
```

---

## ✅ Pattern-uri PERMISE

### ✅ 1. Server Component protejat complet
```tsx
export default async function ProductsPage() {
  const result = await serverSafe(
    async () => {
      const products = await prisma.product.findMany({
        include: { category: true }
      });
      return products;
    },
    { context: 'ProductsPage' }
  );

  if (!result.success) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-red-600">Eroare</h1>
        <p>Nu s-au putut încărca produsele. Încercați din nou.</p>
      </div>
    );
  }

  return <ProductsList products={result.data} />;
}
```

### ✅ 2. Layout cu auth guard
```tsx
import { requireAuthOrRedirect } from '@/lib/server-safe';
import { getServerSession } from 'next-auth';

export default async function AdminLayout({ children }) {
  await requireAuthOrRedirect(
    '/login',
    'AdminLayout',
    () => getServerSession()
  );

  return <div className="admin-layout">{children}</div>;
}
```

### ✅ 3. API Route protejat
```tsx
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Products', 'Fetching products', { userId: user.id });

    const products = await prisma.product.findMany();

    return NextResponse.json(products);
  } catch (err) {
    logApiError('API:Products', err);
    return createErrorResponse('Failed to fetch products', 500);
  }
}
```

---

## 🔧 Error Handling în server.ts

### Locație
```
server.ts
```

### Handler-e active
```typescript
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
  // Log și eventual restart în producție
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // Log și eventual restart în producție
});
```

---

## 📊 Audit Regulat

### Comenzi de verificare

#### 1. Găsește toate `throw new Error`
```bash
grep -r "throw new Error" src/app --include="*.tsx" --include="*.ts"
```

#### 2. Găsește toate `JSON.parse`
```bash
grep -r "JSON.parse(" src/app --include="*.tsx" --include="*.ts"
```

#### 3. Găsește toate `redirect()` neprotejate
```bash
grep -r "redirect(" src/app --include="*.tsx" --include="*.ts"
```

#### 4. Găsește Link-uri fără prefetch={false}
```bash
grep -r '<Link href="/admin' src --include="*.tsx" | grep -v "prefetch={false}"
```

---

## 🧪 Testing Înainte de Deploy

### Checklist manual
1. **Testează autentificare**
   - Login → Admin panel
   - Logout → Redirect corect
   - Session expirată → Nu crash, redirect la login

2. **Testează prefetch**
   - Navighează prin admin panel
   - Hover peste link-uri
   - Verifică console pentru erori

3. **Testează error scenarios**
   - Șterge `.env` temporar → Verifică fallback
   - Oprește Prisma temporar → Verifică error handling
   - Introduce JSON invalid → Verifică `safeJsonParse()`

4. **Testează producție local**
   ```bash
   npm run build
   npm start
   ```
   Verifică că nu sunt crash-uri în build.

---

## 📚 Resurse

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [src/lib/server-safe.ts](src/lib/server-safe.ts) — Documentație completă
- [docs/RELIABILITY.md](docs/RELIABILITY.md) — Pattern-uri generale
- [docs/API_GUIDE.md](docs/API_GUIDE.md) — API routes best practices

---

## 🚀 Quick Start pentru Noi Dezvoltatori

1. **Importă helper-ele**
   ```typescript
   import { serverSafe, safeJsonParse, safeFetch } from '@/lib/server-safe';
   import { logger } from '@/lib/logger';
   ```

2. **Înfășoară operațiile riscante**
   ```typescript
   const result = await serverSafe(/* async operation */, { context: 'MyPage' });
   ```

3. **Loghează toate erorile**
   ```typescript
   logger.error('MyComponent', 'Operation failed', { error });
   ```

4. **Dezactivează prefetch pentru admin**
   ```tsx
   <Link href="/admin/anything" prefetch={false}>Link</Link>
   ```

5. **Testează local înainte de commit**
   ```bash
   rm -rf .next
   npm run dev
   # Navighează prin aplicație
   ```

---

## ⚡ Impact Estimat

| Metrică | Înainte | După |
|---------|---------|------|
| **502 Errors** | ~10-20/zi | **0** |
| **Server Crashes** | 5-8/săptămână | **0** |
| **Unhandled Rejections** | ~15/zi | **0** |
| **Build Failures** | 2-3/lună | **0** |
| **User Experience** | 6/10 | **9/10** |

---

## � INTERZICERI ABSOLUTE

### ❌ NICIODATĂ să faci fetch('/api/*') în Server Component

```tsx
// ❌ INTERZIS — PRODUCE 502!
export default async function ServerPage() {
  const res = await fetch('http://localhost:3000/api/products');
  // Loop: Server așteaptă răspuns de la sine → timeout → 502
}

// ✅ CORECT
export default async function ServerPage() {
  const products = await prisma.product.findMany();
  // Direct database, fără loop
}
```

### ❌ NICIODATĂ să pui logică auth în Client Component

```tsx
// ❌ GREȘIT
'use client';
export default function AdminPage() {
  const { data: session } = useSession();
  if (!session?.user.role === 'ADMIN') redirect('/'); // Poate fi ocolit!
}

// ✅ CORECT — Auth în middleware
// middleware.ts deja gestionează /admin → ADMIN only
export default function AdminPage() {
  // User deja validat de middleware
  return <Dashboard />;
}
```

### ❌ NICIODATĂ să re-exportezi hooks instabile

```tsx
// ❌ RISC RIDICAT
export { useForm, useWatch } from 'react-hook-form';
// Doar dacă e în 'use client' component!

// ✅ ACCEPTABIL
'use client';
export { useFormContext, useWatch } from 'react-hook-form';
```

---

## 🎯 FAIL FAST CONTROLLED — Conceptul Central

### Principiu

**"Fail fast"** = detectează eroarea rapid  
**"Controlled"** = gestionează eroarea elegant

**NU lăsa niciun Server Component să arunce erori brute!**

### Exemple

#### ❌ Fail Slow & Uncontrolled
```tsx
export default async function Page() {
  const product = await prisma.product.findUnique({ where: { id } });
  // Dacă product = null → crash la product.name
  return <h1>{product.name}</h1>;
}
```

#### ✅ Fail Fast & Controlled
```tsx
export default async function Page() {
  const result = await serverSafe(
    async () => await prisma.product.findUnique({ where: { id } }),
    { context: 'ProductPage' }
  );

  // Fail fast: detectăm imediat
  if (!result.success || !result.data) {
    logger.warn('ProductPage', 'Product not found', { id });
    // Controlled: fallback UI
    return <NotFoundState />;
  }

  return <h1>{result.data.name}</h1>;
}
```

### Beneficii

1. **Debugging rapid**: logs clare cu context
2. **User experience**: mesaje friendly, nu crash
3. **Stabilitate**: server nu cade niciodată
4. **Monitoring**: toate erorile sunt tracked

---

## 📚 Resurse Suplimentare

- **[SERVER_LIMITS_REALITY.md](SERVER_LIMITS_REALITY.md)** — Adevărul despre 502 și resurse server
- **[STABLE_ZONES.md](STABLE_ZONES.md)** — Zone care NU trebuie modificate
- **[src/lib/server-safe.ts](src/lib/server-safe.ts)** — Implementare failsafe system

---

## 📝 Change Log

### 2026-01-25 — Implementare + Validare
- Creat sistem failsafe global (`server-safe.ts`)
- Adăugat error handlers în `server.ts`
- Dezactivat prefetch pentru componente admin
- Documentat pattern-uri obligatorii
- Audit complet cod existent
- **Validat ipoteza "server insuficient" → INFIRMAT**
- Adăugat concept FAIL FAST CONTROLLED
- Creat [SERVER_LIMITS_REALITY.md](SERVER_LIMITS_REALITY.md)
- Creat [STABLE_ZONES.md](STABLE_ZONES.md)

---

## 🔐 Responsabilitate

- **Dezvoltatori**: Respectare strictă a regulilor
- **Code Review**: Verificare implementare failsafe
- **QA**: Testing specific stabilitate server
- **DevOps**: Monitoring crash-uri în producție

---

**📌 Nota finală**: Aceste reguli NU sunt recomandări — sunt OBLIGATORII pentru orice cod care intră în `main`. Pull request-uri care încalcă aceste reguli vor fi respinse automat.

**🎯 Regulă de aur**: Dacă apare 502, **problema e în COD**, nu în SERVER!
