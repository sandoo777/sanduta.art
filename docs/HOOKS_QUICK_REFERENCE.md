# Hooks Quick Reference

⚡ Referință rapidă pentru toate hook-urile custom din sanduta.art

---

## 🎨 useTheme

```typescript
import { useTheme } from '@/hooks';

const { theme, isLoading, error, reload, hasPublishedTheme } = useTheme();
```

**Use case:** Aplicare și gestionare temă vizuală

---

## 🛒 useCheckout

```typescript
import { useCheckout } from '@/hooks';

const { 
  validateCustomerData, 
  validateAddressData, 
  processOrder, 
  isLoading, 
  error 
} = useCheckout();
```

**Use case:** Procesare comenzi cu Paynet + Nova Poshta

---

## ⚙️ useSetup

```typescript
import { useSetup } from '@/hooks';

const { 
  setupStatus, 
  isCheckingStatus, 
  isProcessing, 
  processSetup, 
  validateSetupData 
} = useSetup();
```

**Use case:** Setup inițial aplicație (creare admin)

---

## 📝 useBlog

```typescript
import { useBlog } from '@/hooks';

const { 
  posts, 
  currentPost, 
  categories, 
  popularTags, 
  isLoading, 
  loadPosts, 
  loadPostBySlug 
} = useBlog();
```

**Use case:** Gestionare articole blog cu filtrare

---

## 🔐 useAuth

```typescript
import { useAuth } from '@/hooks';

const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  logout, 
  hasRole, 
  isAdmin, 
  isManager 
} = useAuth();
```

**Use case:** Autentificare și verificare roluri

---

## 🛡️ useRequireAuth

```typescript
import { useRequireAuth } from '@/hooks';

// Redirect automat dacă nu are rol
useRequireAuth(['ADMIN', 'MANAGER']);
```

**Use case:** Protecție pagini bazată pe rol

---

## 📦 Import Centralizat

```typescript
// Import toate dintr-o dată
import { 
  useTheme, 
  useAuth, 
  useBlog, 
  useCheckout, 
  useSetup 
} from '@/hooks';

// Import tipuri
import type { 
  AuthUser, 
  BlogPost, 
  CheckoutData 
} from '@/hooks';
```

---

## 🎯 Pattern Comun

Toate hook-urile urmează același pattern:

```typescript
const {
  data,        // Date returnate
  isLoading,   // Loading state
  error,       // Error message
  method       // Metode de acțiune
} = useHook();
```

---

## ⚠️ Error Handling

```typescript
const { error } = useHook();

{error && <Alert variant="error">{error}</Alert>}
```

---

## ⏳ Loading States

```typescript
const { isLoading } = useHook();

if (isLoading) return <Spinner />;
```

---

## 📚 Documentație Completă

Vezi [`docs/HOOKS.md`](./docs/HOOKS.md) pentru detalii complete

---

_Quick Reference v1.0 | 2026-01-21_
