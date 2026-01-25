# Auth Link Component — Documentation

**Component pentru Link-uri în zone protejate cu autentificare**

---

## 🎯 Problema

Next.js Link component are prefetch activat by default în production:
- Prefetch-ul încarcă Server Components în background
- Dacă Server Component face `redirect()` în auth check, poate cauza crash invizibil
- User-ul nu vede eroarea, dar browser-ul crashează silent

**Impact:**
- 502 errors ascunse
- Crash-uri la hover peste Link-uri
- Auth redirects care eșuează silent

---

## ✅ Soluția: AuthLink

Component wrapper care:
- **Disable prefetch by default** (`prefetch={false}`)
- Păstrează toate props-urile lui Link
- Type-safe cu TypeScript
- Backwards compatible

---

## 📦 Usage

### Basic Usage

```tsx
import { AuthLink } from '@/components/common/links/AuthLink';

// În loc de:
<Link href="/account/orders">Comenzile mele</Link>

// Folosește:
<AuthLink href="/account/orders">Comenzile mele</AuthLink>
```

### With Styling

```tsx
<AuthLink 
  href="/account/orders"
  className="text-blue-600 hover:underline"
>
  Vezi toate comenzile
</AuthLink>
```

### With All Link Props

```tsx
<AuthLink
  href="/account/orders"
  scroll={false}
  replace={true}
  shallow={true}
>
  Navigate fără scroll
</AuthLink>
```

### Override Prefetch (Rar Necesar)

```tsx
// Dacă ȘTII sigur că route-ul e safe pentru prefetch
<AuthLink 
  href="/account/orders" 
  prefetch={true}
>
  Comenzile mele
</AuthLink>
```

---

## 🚦 Când să Folosești

### ✅ USE AuthLink:

- `/account/*` — user account routes
- `/admin/*` — admin panel routes
- `/manager/*` — manager dashboard routes
- `/operator/*` — operator panel routes
- Orice route protejată cu auth check

### ❌ USE Link (default):

- `/` — homepage
- `/produse/*` — public catalog
- `/about`, `/contact` — static pages
- Public routes fără auth

---

## 🔧 Migration Guide

### Step 1: Import AuthLink

```tsx
import { AuthLink } from '@/components/common/links/AuthLink';
```

### Step 2: Replace Link cu AuthLink

**Before:**
```tsx
import Link from 'next/link';

<Link href="/account/orders">Orders</Link>
<Link href="/admin/users">Users</Link>
```

**After:**
```tsx
import { AuthLink } from '@/components/common/links/AuthLink';

<AuthLink href="/account/orders">Orders</AuthLink>
<AuthLink href="/admin/users">Users</AuthLink>
```

### Step 3: Keep Link for Public Routes

```tsx
import Link from 'next/link';
import { AuthLink } from '@/components/common/links/AuthLink';

// Public route — use Link
<Link href="/produse/tricouri">Tricouri</Link>

// Auth route — use AuthLink
<AuthLink href="/account/orders">Comenzi</AuthLink>
```

---

## 📊 Performance Impact

### With Default Link (prefetch={true}):

```
User hovers over link
  ↓
Next.js prefetches /account/orders
  ↓
Server Component runs getServerSession()
  ↓
No session → redirect('/login')
  ↓
❌ CRASH — redirect throws in prefetch context
```

### With AuthLink (prefetch={false}):

```
User hovers over link
  ↓
No prefetch (disabled)
  ↓
User clicks link
  ↓
Server Component runs getServerSession()
  ↓
No session → safeRedirect('/login')
  ↓
✅ SAFE — redirect only on actual navigation
```

**Result:**
- ✅ No prefetch crashes
- ✅ Smooth navigation
- ⚠️ Slightly slower first click (no prefetch cache)

**Trade-off:** Stability > Speed for auth routes.

---

## 🧪 Testing

### Test 1: Hover Without Crash

```tsx
// Component
<AuthLink href="/account/orders">Orders</AuthLink>

// Test
1. Logout (or use incognito)
2. Hover over link
3. Wait 2 seconds
4. ✅ No crash in console
```

### Test 2: Click Navigation Works

```tsx
// Test
1. Logout
2. Click AuthLink
3. ✅ Redirects to /login
4. ✅ No 502 error
```

### Test 3: Logged In Works

```tsx
// Test
1. Login
2. Click AuthLink to /account/orders
3. ✅ Page loads
4. ✅ Orders display
```

---

## 🔍 Debugging

### Check Prefetch in DevTools

1. Open DevTools → Network tab
2. Hover over AuthLink
3. Filter by "Fetch/XHR"
4. ✅ No prefetch requests (disabled)

vs.

1. Hover over regular Link
2. ❌ See prefetch requests

### Console Logs

AuthLink nu log-ează nimic (transparent wrapper).

Verifică în Server Component logs:
```
[ServerSafe] Redirecting to: /login  ← OK
[ServerSafe] Fetching data...         ← OK
```

---

## 🚀 Advanced Usage

### Custom AuthLink Variant

```tsx
// Create custom variant with extra behavior
export function DashboardLink(props: AuthLinkProps) {
  return (
    <AuthLink
      {...props}
      className={`dashboard-link ${props.className || ''}`}
    />
  );
}
```

### Conditional Prefetch

```tsx
// Enable prefetch doar pentru logged-in users
import { useSession } from 'next-auth/react';

function SmartAuthLink(props: AuthLinkProps) {
  const { data: session } = useSession();
  
  return (
    <AuthLink
      {...props}
      prefetch={!!session}  // true dacă logged in
    />
  );
}
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Using Link in Auth Routes

```tsx
// WRONG — poate crash la prefetch
<Link href="/account/orders">Orders</Link>

// CORRECT
<AuthLink href="/account/orders">Orders</AuthLink>
```

### ❌ Mistake 2: Using AuthLink in Public Routes

```tsx
// WRONG — unnecessary, slow prefetch disable
<AuthLink href="/produse/tricouri">Tricouri</AuthLink>

// CORRECT — public route, use Link
<Link href="/produse/tricouri">Tricouri</Link>
```

### ❌ Mistake 3: Forgetting Import

```tsx
// WRONG — Link is not AuthLink
import Link from 'next/link';
<Link href="/account/orders">Orders</Link>

// CORRECT — import AuthLink
import { AuthLink } from '@/components/common/links/AuthLink';
<AuthLink href="/account/orders">Orders</AuthLink>
```

---

## 📚 Related Documentation

- [Server Component Safety Guide](./SERVER_COMPONENT_SAFETY_GUIDE.md)
- [serverSafe.ts Documentation](../../../lib/serverSafe.ts)
- [Next.js Link API](https://nextjs.org/docs/app/api-reference/components/link)

---

**Created:** 2025-01-25  
**Last Updated:** 2025-01-25  
**Status:** ✅ Production Ready
