# IMPORT RULES — Module Organization & Barrel Files

**Проект:** sanduta.art  
**Версія:** 1.0 (Final)  
**Дата:** 2026-01-26  
**Статус:** 🔒 **CRITICAL** — порушення цих правил = 502 errors

---

## 🎯 Мета цього документа

Після barrel file crisis (homepage 502s) встановлюємо **чіткі правила import/export** для уникнення Client/Server Component conflicts.

**Критичний context:**
- Barrel files (`index.ts`) можуть викликати 502 якщо неправильно використані
- Client Components не можна експортувати через barrel files
- Direct imports ЗАВЖДИ безпечніші за barrel file imports

---

## 📚 Ієрархія правил

### 1. CRITICAL (🔴 NEVER VIOLATE)
Порушення = 502 errors, проект ламається.

### 2. IMPORTANT (🟠 FOLLOW STRICTLY)
Порушення = maintainability issues, technical debt.

### 3. RECOMMENDED (🟡 BEST PRACTICE)
Порушення = sub-optimal, але працює.

---

## 🚨 PART 1: BARREL FILES — ЗАБОРОНЕНІ ПАТТЕРНИ

### 🔴 RULE 1.1: НІКОЛИ не експортуй Client Components з barrel files

**ЗАБОРОНЕНО:**

```typescript
// ❌ src/components/ui/index.ts
'use client';  // Робить ВЕСЬ файл Client Component!

export { Button } from './Button';      // Client Component
export { Modal } from './Modal';        // Client Component
export { Input } from './Input';        // Client Component

// Наслідок: ВСІ імпорти з 'ui/index.ts' стають client-side!
```

```typescript
// ❌ src/components/charts/index.ts
export { BarChart } from './BarChart';       // 'use client'
export { LineChart } from './LineChart';     // 'use client'
export { PieChart } from './PieChart';       // 'use client'

// Наслідок: Server Component який імпортує з 'charts/index.ts' → CRASH!
```

**Чому заборонено:**
1. Barrel file з Client Component exports стає Client Component
2. Server Component не може імпортувати Client Component напряму (тільки як JSX child)
3. Виникає конфлікт Server/Client boundary → 502 errors

**Documented cases:**
- `src/components/public/home/index.ts` — викликав homepage 502
- `src/components/charts/index.ts` — викликав dashboard crashes
- `src/components/ui/index.ts` — потенційна problem zone

---

### 🔴 RULE 1.2: Що МОЖНА експортувати з barrel files

**ДОЗВОЛЕНО:**

```typescript
// ✅ src/types/index.ts — TypeScript types/interfaces
export type { Product, Category, Order } from './product';
export type { User, UserRole } from './user';
export type { ValidationError } from './validation';

// ✅ src/lib/utils/index.ts — Utility functions (pure JS)
export { formatDate, parseDate } from './dateUtils';
export { formatPrice, calculateDiscount } from './priceUtils';
export { cn, classNames } from './classNames';

// ✅ src/constants/index.ts — Constants
export { API_ENDPOINTS } from './api';
export { ROUTES } from './routes';
export { STATUS_COLORS } from './colors';

// ✅ src/lib/index.ts — Server-side libraries
export { prisma } from './db';
export { logger } from './logger';
export { safeFetch } from './safeFetch';
```

**Правило простими словами:**
- ✅ Types, interfaces, constants — OK
- ✅ Pure functions (без React hooks) — OK
- ✅ Server-only utilities — OK
- ❌ Client Components — NEVER!
- ❌ Hooks (useState, useEffect, useQuery) — NEVER!
- ❌ Files з `'use client'` — NEVER!

---

### 🟠 RULE 1.3: Audit існуючих barrel files

**Команда для перевірки:**

```bash
# Знайти всі barrel files (index.ts)
find src -name "index.ts" -type f

# Перевірити чи експортують Client Components
grep -r "'use client'" src/components/*/index.ts

# Знайти barrel files які експортують компоненти
grep -r "export.*from.*tsx" src/*/index.ts
```

**Checklist для кожного barrel file:**

```typescript
// Питання для кожного index.ts:
// 1. Чи експортує Client Components? → Якщо ТАК → ВИДАЛИ експорти
// 2. Чи експортує hooks (useState, useEffect)? → Якщо ТАК → ВИДАЛИ
// 3. Чи експортує файли з 'use client'? → Якщо ТАК → ВИДАЛИ
// 4. Чи залишились тільки types/utils/constants? → Якщо ТАК → OK
```

**Безпечна альтернатива:**

```typescript
// ✅ src/components/ui/index.ts — only types
export type { ButtonProps } from './Button';
export type { ModalProps } from './Modal';
export type { InputProps } from './Input';

// Components імпортуються напряму:
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
```

---

## 📦 PART 2: DIRECT IMPORTS

### 🔴 RULE 2.1: ЗАВЖДИ використовуй direct imports для Client Components

**ПРАВИЛЬНИЙ паттерн:**

```typescript
// ✅ app/products/page.tsx (Server Component)
import { Button } from '@/components/ui/Button';        // Direct
import { Card } from '@/components/ui/Card';            // Direct
import { ProductCard } from '@/components/ProductCard'; // Direct

export default async function ProductsPage() {
  const products = await prisma.product.findMany();
  
  return (
    <div>
      <Button>Add Product</Button>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

**НЕПРАВИЛЬНИЙ паттерн:**

```typescript
// ❌ app/products/page.tsx
import { Button, Card, ProductCard } from '@/components'; // Barrel file!
// Якщо components/index.ts експортує Client Components → CRASH!
```

**Чому важливо:**
- Direct import = явний контроль що саме імпортуєш
- Next.js точно знає Server/Client boundary
- Легше debug (відразу видно звідки component)
- Немає hidden dependencies через barrel files

---

### 🟠 RULE 2.2: Використовуй `@/` alias замість relative paths

**ПРАВИЛЬНО:**

```typescript
// ✅ Absolute imports з alias
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import type { Product } from '@prisma/client';
```

**ПОГАНО:**

```typescript
// ❌ Relative imports (hard to refactor)
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../context/CartContext';
```

**Винятки:**
- Local components в тій же директорії:
  ```typescript
  // ✅ OK для _components в тій же папці
  import { ProductCard } from './_components/ProductCard';
  ```

**Config:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 🟡 RULE 2.3: Import grouping & ordering

**Рекомендований порядок:**

```typescript
// 1. React/Next.js core
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

// 2. Third-party libraries
import { format } from 'date-fns';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

// 3. NextAuth
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';

// 4. Internal libraries (@/lib)
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { safeFetch } from '@/lib/safeFetch';

// 5. Context & hooks (@/context, @/hooks)
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useProducts';

// 6. Components (@/components) — DIRECT IMPORTS!
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

// 7. Types (@/types, @prisma/client)
import type { Product, Category } from '@prisma/client';
import type { ButtonProps } from '@/components/ui/Button';

// 8. Relative imports (last)
import { ProductCard } from './_components/ProductCard';
import { LocalUtility } from './utils';
```

---

## 🏗️ PART 3: MODULE ORGANIZATION

### 🟠 RULE 3.1: Folder structure по типу модуля

**Рекомендована структура:**

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (no layout)
│   ├── admin/             # Admin panel
│   ├── manager/           # Manager panel
│   └── api/               # API routes
│
├── components/
│   ├── ui/                # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts       # ⚠️ ONLY types!
│   │
│   ├── common/            # Shared components
│   │   ├── headers/
│   │   ├── sidebars/
│   │   └── links/
│   │       └── AuthLink.tsx
│   │
│   └── public/            # Public-facing components
│       └── home/
│           ├── Hero.tsx
│           ├── Features.tsx
│           └── index.ts   # ⚠️ ONLY types!
│
├── context/               # React Context providers
│   └── CartContext.tsx
│
├── hooks/                 # Custom React hooks
│   ├── useProducts.ts
│   └── useCart.ts
│
├── lib/                   # Server-side utilities
│   ├── db.ts             # Prisma client
│   ├── logger.ts         # Logging
│   ├── safeFetch.ts      # Client-side fetch
│   ├── serverSafe.ts     # Server Component helpers
│   ├── validation.ts     # Form validation
│   └── index.ts          # ✅ Can export utilities
│
├── modules/              # Feature modules
│   ├── auth/
│   │   └── nextauth.ts
│   ├── editor/
│   └── reports/
│
└── types/                # TypeScript types
    ├── next-auth.d.ts
    ├── product.ts
    └── index.ts          # ✅ Can export types
```

---

## 🔍 PART 4: IMPORT PATTERNS ПО ТИПУ ФАЙЛУ

### 🔴 RULE 4.1: Server Components (page.tsx, layout.tsx)

**Дозволені imports:**

```typescript
// app/admin/orders/page.tsx

// ✅ Server-side libraries
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { fetchServerData, safeRedirect } from '@/lib/serverSafe';

// ✅ NextAuth server-side
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';

// ✅ Client Components (as JSX children only!)
import { OrdersList } from './_components/OrdersList';  // 'use client'
import { Button } from '@/components/ui/Button';        // 'use client'

// ✅ Types
import type { Order } from '@prisma/client';

// ✅ Server Components (no 'use client')
import { ServerSideTable } from '@/components/ServerTable';

export default async function OrdersPage() {
  // Server-side logic
  const session = await getServerSession(authOptions);
  if (!session) return safeRedirect('/login');
  
  const orders = await fetchServerData(
    () => prisma.order.findMany({ where: { userId: session.user.id } })
  );
  
  return (
    <div>
      {/* Client Component as JSX */}
      <Button>New Order</Button>
      <OrdersList orders={orders} />
    </div>
  );
}
```

**ЗАБОРОНЕНІ imports:**

```typescript
// ❌ Client hooks
import { useState, useEffect } from 'react';  // Server Component не може use hooks!
import { useSession } from 'next-auth/react'; // Client-side hook!

// ❌ Browser APIs
import { useRouter } from 'next/navigation';  // useRouter = client-side!
window.localStorage.getItem('key');           // window не існує на сервері!

// ❌ Barrel files з Client Components
import { Button } from '@/components/ui';     // Якщо ui/index.ts експортує Client Components!
```

---

### 🔴 RULE 4.2: Client Components

**Дозволені imports:**

```typescript
// components/ui/Button.tsx
'use client';

// ✅ React hooks
import { useState, useEffect, useCallback } from 'react';

// ✅ Client-side libraries
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// ✅ Custom hooks
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useProducts';

// ✅ Client-side utilities
import { safeFetch } from '@/lib/safeFetch';
import { cn } from '@/lib/utils';

// ✅ Types
import type { ButtonProps } from './types';

export function Button({ children, onClick, variant }: ButtonProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <button onClick={onClick} className={cn('btn', variant)}>
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

**ЗАБОРОНЕНІ imports:**

```typescript
// ❌ Prisma (server-only)
import { prisma } from '@/lib/db';  // Prisma не працює в browser!

// ❌ Server-side NextAuth
import { getServerSession } from 'next-auth';  // Server-only!

// ❌ Node.js APIs
import { readFileSync } from 'fs';  // fs не існує в browser!
import crypto from 'crypto';        // crypto (Node.js) не існує в browser!

// ❌ Server-only environment variables
const secret = process.env.NEXTAUTH_SECRET;  // Undefined в client!
```

---

### 🟠 RULE 4.3: API Routes (app/api/*/route.ts)

**Дозволені imports:**

```typescript
// app/api/admin/orders/route.ts

// ✅ Next.js API utilities
import { NextRequest, NextResponse } from 'next/server';

// ✅ Server-side libraries
import { prisma } from '@/lib/db';
import { logger, createErrorResponse } from '@/lib/logger';
import { requireRole } from '@/lib/auth-helpers';

// ✅ Validation
import { validateCheckoutForm } from '@/lib/validation';

// ✅ Types
import type { Order, OrderStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;
    
    const orders = await prisma.order.findMany();
    return NextResponse.json(orders);
  } catch (err) {
    logger.error('API:Orders', 'Failed', { error: err });
    return createErrorResponse('Server error', 500);
  }
}
```

**ЗАБОРОНЕНІ imports:**

```typescript
// ❌ React/React hooks (API routes не рендерять UI!)
import { useState } from 'react';  // Не має сенсу в API route

// ❌ UI Components
import { Button } from '@/components/ui/Button';  // API route не повертає JSX!

// ❌ useSession (client-side)
import { useSession } from 'next-auth/react';  // Use getServerSession або requireAuth!
```

---

## 📋 PART 5: MIGRATION CHECKLIST

### Якщо знайшов barrel file з Client Components:

**Step 1: Audit barrel file**

```bash
# Файл: src/components/ui/index.ts
cat src/components/ui/index.ts
```

**Step 2: Identify Client Components**

```typescript
// Які експорти мають 'use client'?
export { Button } from './Button';     // ← перевір Button.tsx
export { Modal } from './Modal';       // ← перевір Modal.tsx
export type { ButtonProps } from './Button';  // ← type OK
```

**Step 3: Remove Client Component exports**

```typescript
// ❌ BEFORE (src/components/ui/index.ts)
export { Button } from './Button';     // Client Component
export { Modal } from './Modal';       // Client Component
export type { ButtonProps } from './Button';

// ✅ AFTER (src/components/ui/index.ts)
// Client Component exports removed - use direct imports
// import { Button } from '@/components/ui/Button';
// import { Modal } from '@/components/ui/Modal';

export type { ButtonProps } from './Button';  // Types OK
export type { ModalProps } from './Modal';
```

**Step 4: Find all files importing from barrel**

```bash
# Знайти всі imports з ui barrel file
grep -r "from '@/components/ui'" src --include="*.tsx" --include="*.ts"
```

**Step 5: Replace barrel imports з direct imports**

```typescript
// ❌ BEFORE
import { Button, Modal } from '@/components/ui';

// ✅ AFTER
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
```

**Step 6: Test**

```bash
npm run dev
# Відкрий page який використовував barrel file imports
# Перевір що немає 502 errors
```

---

## ✅ SUCCESS CRITERIA

**Import rules вважаються успішними якщо:**

1. ✅ **0 barrel files експортують Client Components**
2. ✅ **100% Server Components використовують direct imports**
3. ✅ **Barrel files тільки для types/utils/constants**
4. ✅ **Документація зрозуміла для нових devs**

**Metrics:**
- 🟢 Barrel files з Client exports: **0** (fixed)
- 🟢 Server Components з barrel imports: **0** (fixed)
- 🟢 Homepage 502 errors: **0** (fixed!)
- 🟢 Direct imports coverage: **100%**

---

## 📖 DOCUMENTATION REFERENCES

**Related docs:**
1. `FINAL_APP_ROUTER_RULES.md` — main architecture rules
2. `RAPORT_BARREL_FILES_FINAL.md` — case study, lessons learned
3. `docs/SERVER_COMPONENT_SAFETY_GUIDE.md` — Server Component patterns
4. `AUTH_PREFETCH_HARDENING_REPORT.md` — auth patterns

---

## 🎓 LESSONS LEARNED

### 1. Homepage 502 від barrel file

**Problem:** Homepage 502 errors  
**Root Cause:** `src/components/public/home/index.ts` експортував Client Components  
**Solution:** Видалили Client exports, використали direct imports  
**Prevention:** Ці IMPORT_RULES

### 2. Admin charts crashes

**Problem:** Dashboard crashes при завантаженні charts  
**Root Cause:** `src/components/charts/index.ts` з `'use client'` в barrel file  
**Solution:** Direct imports для всіх chart components  
**Prevention:** Audit barrel files регулярно

### 3. Implicit dependencies

**Problem:** Важко знайти де використовується component  
**Root Cause:** Barrel file приховує actual import path  
**Solution:** Direct imports = explicit dependencies  
**Prevention:** Enforce direct imports

---

**VERSION:** 1.0 Final  
**LAST UPDATED:** 2026-01-26  
**STATUS:** 🔒 CRITICAL — порушення = 502 errors  
**RELATED:** `FINAL_APP_ROUTER_RULES.md`
