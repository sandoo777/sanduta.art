# Barrel File Rules — Next.js App Router & React Server Components

## 🚨 Problema identificată

**Barrel files** (`index.ts`) care re-exportă componente Client (folosind `react-hook-form`, `useState`, etc.) și sunt importate în **Server Components** produc **module resolution failures** în Next.js App Router.

### Simptom
```
Error: ... is not exported from 'react-hook-form'
```

**Cauza reală**: Nu lipsa exportului, ci un conflict între Server/Client Components prin barrel file.

---

## ✅ Reguli permanente

### 1. NU re-exporta componente Client prin barrel files

❌ **Interzis**:
```typescript
// src/components/ui/index.ts
export { Form } from './Form';           // Form folosește react-hook-form
export { FormField } from './FormField'; // Client Component
```

✅ **Permis**:
```typescript
// src/components/ui/index.ts
// Form Components — importați DIRECT din fișierul lor
// ❌ import { Form } from '@/components/ui'
// ✅ import { Form } from '@/components/ui/Form'
// export { Form, useFormContext, useWatch } from './Form';  // COMENTAT
```

---

### 2. NU importa din barrel files în Server Components

❌ **Interzis**:
```tsx
// src/app/admin/dashboard/page.tsx (Server Component)
import { Card, Form, FormField } from '@/components/ui'; // Form e Client!
```

✅ **Corect**:
```tsx
// Server Component
import { Card } from '@/components/ui'; // OK, Card e doar UI

// Client Component
'use client';
import { Form } from '@/components/ui/Form';     // Import direct
import { FormField } from '@/components/ui/FormField'; // Import direct
```

---

### 3. Marchează explicit Client Components

Toate componentele care folosesc hooks React (`useState`, `useForm`, `useContext`) TREBUIE să aibă:

```tsx
'use client';

import React from 'react';
// ... rest of component
```

**Fișiere afectate în proiect**:
- `src/components/ui/Form.tsx` ✅
- `src/components/ui/FormField.tsx` ✅
- `src/components/ui/FormLabel.tsx` ✅
- `src/components/ui/FormMessage.tsx` ✅

---

## 📋 Exemple concrete din proiect

### Înainte (problematic)

```tsx
// src/components/ui/index.ts
export { Form, useFormContext, useWatch } from './Form';
export { FormField } from './FormField';

// src/app/(public)/checkout/page.tsx
import { FormField } from '@/components/ui'; // EȘUEAZĂ la build
```

### După (rezolvat)

```tsx
// src/components/ui/index.ts
// Form Components — comentate, import DIRECT
// export { Form, useFormContext, useWatch } from './Form';
// export { FormField } from './FormField';

// src/app/(public)/checkout/page.tsx
'use client';
import { FormField } from '@/components/ui/FormField'; // Import direct ✅
```

---

## 🎯 Când sunt permise barrel files

### ✅ Safe pentru barrel files:
- **Componente UI pure** (fără hooks React):
  ```typescript
  export { Button } from './Button';
  export { Card } from './Card';
  export { Badge } from './Badge';
  ```

- **Utilities și helpers** (doar funcții):
  ```typescript
  export { formatDate } from './dateUtils';
  export { validateEmail } from './validators';
  ```

- **Types și interfaces**:
  ```typescript
  export type { UserRole } from './types';
  export type { ButtonProps } from './Button';
  ```

### ❌ Interzise în barrel files:
- Componente cu `'use client'`
- Componente care folosesc `react-hook-form`
- Componente cu `useState`, `useEffect`, `useContext`
- Re-exporturi de la biblioteci third-party care pot avea ambiguități Server/Client

---

## 🔧 Procedură de remediere

### Pas 1: Identifică componenta problematică
```bash
grep -r "from '@/components/ui'" src/
```

### Pas 2: Verifică dacă este Client Component
```bash
head -5 src/components/ui/ComponentName.tsx
# Caută 'use client' sau hooks React
```

### Pas 3: Actualizează import-ul
```typescript
// Înainte
import { ComponentName } from '@/components/ui';

// După
import { ComponentName } from '@/components/ui/ComponentName';
```

### Pas 4: Curăță cache și rebuild
```bash
rm -rf .next
npm run dev
```

---

## 📊 Statistici proiect

| Fișier | Status | Acțiune |
|--------|--------|---------|
| `src/components/ui/Form.tsx` | ✅ Client | Import direct |
| `src/components/ui/FormField.tsx` | ✅ Client | Import direct |
| `src/components/ui/FormLabel.tsx` | ✅ Client | Import direct |
| `src/components/ui/FormMessage.tsx` | ✅ Client | Import direct |
| `src/components/ui/Button.tsx` | ✅ UI only | Barrel OK |
| `src/components/ui/Card.tsx` | ✅ UI only | Barrel OK |
| `src/components/ui/Badge.tsx` | ✅ UI only | Barrel OK |

---

## 🧪 Testare

După modificări, verifică:

1. **Build-ul reușește**:
   ```bash
   npm run build
   ```

2. **Nu există erori de tip "not exported"**:
   - Caută în output: `Error: ... is not exported from`

3. **Funcționalitatea rămâne intactă**:
   - Testează formularele (checkout, login, profile)
   - Verifică că validările funcționează

4. **Nu apar 502 Bad Gateway**:
   - Navighează prin `/admin`, `/account`, `/checkout`

---

## 📚 Referințe

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Module Resolution in Next.js](https://nextjs.org/docs/app/building-your-application/optimizing/package-bundling)

---

## 🔐 Regula de aur

> **Dacă o componentă are `'use client'`, importează-o DIRECT din fișierul ei, NU prin barrel file.**

Această regulă previne 100% din problemele de module resolution în Next.js App Router.

---

**Data creării**: 2026-01-25  
**Status**: ✅ Implementat și validat  
**Ultima actualizare**: 2026-01-25 14:06 UTC
