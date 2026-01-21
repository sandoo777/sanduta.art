# Hook-uri Custom - Documentație

Această documentație descrie toate hook-urile custom disponibile în aplicația sanduta.art.

## 📋 Index

1. [useTheme](#usetheme) - Gestionare temă aplicație
2. [useCheckout](#usecheckout) - Proces checkout
3. [useSetup](#usesetup) - Setup inițial aplicație
4. [useBlog](#useblog) - Gestionare blog
5. [useAuth](#useauth) - Autentificare utilizatori

---

## useTheme

**Path:** [`src/hooks/useTheme.ts`](../src/hooks/useTheme.ts)

### Descriere

Hook unificat pentru gestionarea temei aplicației. Combină funcționalitatea de aplicare și publishing a temei.

### Features

- ✅ Încărcare automată a temei publicate
- ✅ Aplicare în timp real a temei în DOM prin CSS Variables
- ✅ Publishing/unpublishing teme
- ✅ Gestionare stări de loading/error
- ✅ Reload manual al temei

### API

```typescript
interface UseThemeReturn {
  theme: ThemeConfig | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  hasPublishedTheme: boolean;
}

const { theme, isLoading, error, reload, hasPublishedTheme } = useTheme();
```

### Exemplu Utilizare

```tsx
function ThemeDisplay() {
  const { theme, isLoading, error, reload } = useTheme();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  if (!theme) return <p>No theme applied</p>;

  return (
    <div>
      <h1>Current Theme: {theme.name}</h1>
      <button onClick={reload}>Reload Theme</button>
    </div>
  );
}
```

### Note Implementare

- Aplică tema automat la mount
- Folosește CSS Variables pentru aplicare stiluri
- Pentru funcționalitate avansată de publishing, vezi `useThemePublishing`

---

## useCheckout

**Path:** [`src/hooks/useCheckout.ts`](../src/hooks/useCheckout.ts)

### Descriere

Hook unificat pentru gestionarea procesului de checkout. Re-exportă funcționalitatea din modulul checkout.

### Features

- ✅ Validare date client (nume, email, telefon)
- ✅ Validare adresă de livrare
- ✅ Gestionare metode de livrare și plată
- ✅ Procesare comandă cu integrări Paynet + Nova Poshta
- ✅ Trimitere email-uri de confirmare
- ✅ Gestionare stări de loading/error

### API

```typescript
interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  taxId?: string;
}

interface AddressData {
  country: string;
  city: string;
  street: string;
  number: string;
  apt?: string;
  postalCode: string;
}

const {
  validateCustomerData,
  validateAddressData,
  processOrder,
  isLoading,
  error,
} = useCheckout();
```

### Exemplu Utilizare

```tsx
function CheckoutPage() {
  const { processOrder, isLoading, error } = useCheckout();

  const handleSubmit = async (data: CheckoutData) => {
    const result = await processOrder(data);
    
    if (result.success) {
      router.push(`/order-confirmation?id=${result.orderId}`);
    } else {
      alert(result.error);
    }
  };

  return <CheckoutForm onSubmit={handleSubmit} loading={isLoading} />;
}
```

### Documentație Completă

Vezi: [`docs/CHECKOUT_FLOW.md`](./CHECKOUT_FLOW.md)

---

## useSetup

**Path:** [`src/hooks/useSetup.ts`](../src/hooks/useSetup.ts)

### Descriere

Hook pentru gestionarea setup-ului inițial al aplicației, inclusiv crearea primului administrator.

### Features

- ✅ Verificare dacă aplicația necesită setup
- ✅ Creare administrator inițial
- ✅ Validare date setup (email, parolă, nume)
- ✅ Gestionare stări de loading/error/success
- ✅ Auto-check status la mount

### API

```typescript
interface SetupData {
  email: string;
  password: string;
  name?: string;
}

interface UseSetupReturn {
  setupStatus: SetupStatus | null;
  isCheckingStatus: boolean;
  isProcessing: boolean;
  error: string | null;
  checkSetupStatus: () => Promise<void>;
  processSetup: (data: SetupData) => Promise<SetupResult>;
  validateSetupData: (data: SetupData) => ValidationResult;
}

const {
  setupStatus,
  isCheckingStatus,
  isProcessing,
  processSetup,
  validateSetupData,
} = useSetup();
```

### Exemplu Utilizare

```tsx
function SetupPage() {
  const {
    setupStatus,
    isCheckingStatus,
    processSetup,
    validateSetupData,
  } = useSetup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = { email, password, name };
    const validation = validateSetupData(data);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const result = await processSetup(data);
    
    if (result.success) {
      router.push('/admin/login');
    }
  };

  if (isCheckingStatus) return <Spinner />;
  if (!setupStatus?.needsSetup) return <p>Setup completed</p>;

  return <SetupForm onSubmit={handleSubmit} />;
}
```

### Note Implementare

- Verifică automat status la mount
- Validează date înainte de trimitere
- Permite un singur admin la setup inițial

---

## useBlog

**Path:** [`src/hooks/useBlog.ts`](../src/hooks/useBlog.ts)

### Descriere

Hook pentru gestionarea blog-ului și articolelor, cu suport pentru filtrare, căutare și paginare.

### Features

- ✅ Listare articole publice
- ✅ Filtrare după categorie și tag
- ✅ Căutare articole
- ✅ Gestionare paginare
- ✅ Obținere articol după slug
- ✅ Statistici vizualizări
- ✅ Gestionare categorii și tag-uri

### API

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  category: { id: string; name: string; slug: string };
  tags: string[];
  authorName: string;
  publishedAt: string;
  views: number;
}

interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const {
  posts,
  currentPost,
  categories,
  popularTags,
  isLoading,
  error,
  loadPosts,
  loadPostBySlug,
  loadCategories,
  loadPopularTags,
  reset,
} = useBlog();
```

### Exemple Utilizare

#### Lista Articole cu Filtrare

```tsx
function BlogList() {
  const { posts, isLoading, loadPosts, categories } = useBlog();

  useEffect(() => {
    loadPosts({ category: 'tutorial', limit: 10 });
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div>
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### Articol Single

```tsx
function BlogPost({ slug }: { slug: string }) {
  const { currentPost, isLoading, loadPostBySlug } = useBlog();

  useEffect(() => {
    loadPostBySlug(slug);
  }, [slug]);

  if (isLoading) return <Spinner />;
  if (!currentPost) return <NotFound />;

  return <BlogPostContent post={currentPost} />;
}
```

### Note Implementare

- Nu încarcă automat la mount - apelează manual `loadPosts()`
- Suportă filtrare multiplă (categorie + tag + search)
- `reset()` șterge toate datele și stările

---

## useAuth

**Path:** [`src/hooks/useAuth.ts`](../src/hooks/useAuth.ts)

### Descriere

Hook pentru gestionarea autentificării utilizatorilor cu NextAuth, incluzând verificare roluri și protecție componente.

### Features

- ✅ Login/logout utilizatori
- ✅ Verificare stare autentificare
- ✅ Acces la informații utilizator curent
- ✅ Verificare roluri (ADMIN, MANAGER, OPERATOR, VIEWER)
- ✅ Gestionare stări de loading/error
- ✅ Helper pentru protecție componente

### API

```typescript
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const {
  user,
  isAuthenticated,
  isLoading,
  isProcessing,
  error,
  login,
  logout,
  hasRole,
  isAdmin,
  isManager,
  isOperator,
} = useAuth();
```

### Exemple Utilizare

#### Login Form

```tsx
function LoginPage() {
  const { login, isProcessing, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    
    if (result.success) {
      router.push('/admin');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input type="email" value={email} onChange={...} />
      <Input type="password" value={password} onChange={...} />
      <Button disabled={isProcessing}>Login</Button>
      {error && <Alert>{error}</Alert>}
    </form>
  );
}
```

#### Protected Component

```tsx
function AdminPanel() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAdmin) return <AccessDenied />;

  return <AdminDashboard user={user} />;
}
```

#### Role Checking

```tsx
function ManagerSection() {
  const { hasRole } = useAuth();

  if (!hasRole(['ADMIN', 'MANAGER'])) {
    return null;
  }

  return <ManagerControls />;
}
```

#### Protecție Automată cu useRequireAuth

```tsx
function ProtectedPage() {
  useRequireAuth(['ADMIN', 'MANAGER']);

  return <AdminContent />;
}
```

### Note Implementare

- Folosește NextAuth `useSession` intern
- `hasRole()` acceptă array de roluri (OR logic)
- `useRequireAuth` face redirect automat dacă nu e autorizat
- Validează email format înainte de login

---

## 🎯 Best Practices

### 1. Error Handling

Toate hook-urile returnează `error: string | null`. Afișați eroarea în UI:

```tsx
const { error } = useTheme();

{error && <Alert variant="error">{error}</Alert>}
```

### 2. Loading States

Folosiți `isLoading` pentru feedback vizual:

```tsx
const { isLoading } = useBlog();

if (isLoading) return <Spinner />;
```

### 3. Dependency Arrays

Folosiți `useCallback` pentru funcții stabile:

```tsx
const { loadPosts } = useBlog();

useEffect(() => {
  loadPosts({ category: 'tutorial' });
}, []); // loadPosts e stabil datorită useCallback
```

### 4. Type Safety

Toate hook-urile exportă tipuri - folosiți-le:

```typescript
import { useAuth, type AuthUser } from '@/hooks/useAuth';

function UserProfile({ user }: { user: AuthUser }) {
  // ...
}
```

### 5. Cleanup

Pentru operațiuni async în componente unmounted:

```tsx
useEffect(() => {
  let mounted = true;
  
  loadPosts().then(() => {
    if (mounted) {
      // Update state doar dacă e mounted
    }
  });
  
  return () => { mounted = false; };
}, []);
```

---

## 🔧 Testare

Toate hook-urile pot fi testate cu `@testing-library/react-hooks`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

test('useAuth - login flow', async () => {
  const { result } = renderHook(() => useAuth());
  
  expect(result.current.isAuthenticated).toBe(false);
  
  await act(async () => {
    await result.current.login({ email: 'test@test.com', password: 'password' });
  });
  
  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## 📚 Resurse

- [NextAuth Documentation](https://next-auth.js.org/)
- [React Hooks Reference](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

_Ultima actualizare: 2026-01-21_
