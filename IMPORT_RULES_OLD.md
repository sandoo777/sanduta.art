# 📦 IMPORT RULES — Dependency Management & Module Organization

**Status:** ✅ PRODUCTION RULESET  
**Last Updated:** 2026-01-25  
**Applies To:** All TypeScript/JavaScript imports in project

---

## 📋 Table of Contents

1. [Import Order & Organization](#import-order--organization)
2. [Barrel Files (index.ts)](#barrel-files-indexts)
3. [Server vs Client Import Rules](#server-vs-client-import-rules)
4. [Path Aliases](#path-aliases)
5. [Third-party Dependencies](#third-party-dependencies)
6. [Circular Dependencies](#circular-dependencies)
7. [Forbidden Patterns](#forbidden-patterns)
8. [Checklist](#checklist)

---

## 🔴 CRITICAL RULES

### 1. **NEVER Import Server-only Code in Client Components**

```typescript
// ❌ FORBIDDEN — Client Component
'use client';

import { prisma } from '@/lib/prisma';           // ← Server-only!
import { getServerSession } from 'next-auth';    // ← Server-only!

// ✅ CORRECT — Client Component
'use client';

import { useSession } from 'next-auth/react';   // ← Client version
// Call API routes for data, don't import prisma
```

**Why:** Prisma and server utilities can't run in browser → build errors or runtime crashes.

---

### 2. **NEVER Import Client-only Code in Server Components**

```typescript
// ❌ FORBIDDEN — Server Component
import { useState } from 'react';                // ← Client hook!
import { useRouter } from 'next/navigation';     // ← Client hook!

// ✅ CORRECT — Server Component
import { redirect } from 'next/navigation';      // ← Server function
import { prisma } from '@/lib/prisma';           // ← Server DB
```

**Why:** React hooks don't work in Server Components → build errors.

---

### 3. **ALWAYS Use Path Aliases (@/)**

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/modules/auth/nextauth';

// ❌ FORBIDDEN (hard to refactor, breaks easily)
import { Button } from '../../components/ui/Button';
import { prisma } from '../../../lib/prisma';
```

**Why:** Absolute imports are easier to maintain, refactor-safe, and IDE-friendly.

---

## 📝 Import Order & Organization

### Standard Order

```typescript
// 1. React & Next.js core
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';

// 2. Third-party libraries
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// 3. Internal modules (@/ imports)
import { Button, Card } from '@/components/ui';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// 4. Types
import type { User } from '@prisma/client';
import type { ButtonProps } from '@/components/ui/Button';

// 5. Relative imports (avoid if possible)
import { helper } from './utils';

// 6. CSS/Styles (if any)
import styles from './styles.module.css';
```

**Rules:**
- ✅ Group by category (React → third-party → internal → types → relative → styles)
- ✅ Alphabetical within each group (optional but nice)
- ✅ Blank lines between groups
- ❌ No unused imports (ESLint will catch)

---

## 📦 Barrel Files (index.ts)

### When to Use Barrel Files

**✅ RECOMMENDED:**
- UI components (buttons, cards, inputs)
- Utility functions
- Constants
- Types and interfaces

**❌ AVOID:**
- Client components with heavy dependencies
- Server-only utilities
- Large modules that slow tree-shaking

---

### Safe Barrel File Pattern

```typescript
// src/components/ui/index.ts

// ✅ CORRECT — Simple exports
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';

// ✅ CORRECT — Type exports
export type { ButtonProps } from './Button';
export type { CardProps } from './Card';

// ❌ AVOID — Re-exporting third-party hooks
export { useForm } from 'react-hook-form';  // Better to import directly

// ❌ AVOID — Server-only utilities
export { prisma } from '@/lib/prisma';      // Import directly where needed
```

---

### Import from Barrel File

```typescript
// ✅ CORRECT
import { Button, Card, Input } from '@/components/ui';

// ⚠️ ACCEPTABLE (but verbose)
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// ❌ FORBIDDEN
import { Button } from '@/components/ui/index';  // Don't include /index
```

---

### When NOT to Use Barrel Files

**Skip barrel files for:**

1. **Large modules with many exports** (slow tree-shaking)
2. **Server-only code** (prisma, auth helpers)
3. **Client-only hooks** (form libraries)
4. **Page components** (no need to re-export)

---

## 🔀 Server vs Client Import Rules

### Server Component Imports

```typescript
// Server Component (no 'use client')

// ✅ ALLOWED
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';

// ❌ FORBIDDEN
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
```

**Why:** Server Components run on server only — can't use browser APIs or React hooks.

---

### Client Component Imports

```typescript
// Client Component ('use client' at top)
'use client';

// ✅ ALLOWED
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';

// ❌ FORBIDDEN
import { prisma } from '@/lib/prisma';           // Server-only!
import { getServerSession } from 'next-auth';    // Server-only!
import { redirect } from 'next/navigation';      // Server-only!
import { cookies } from 'next/headers';          // Server-only!
```

**Why:** Client Components run in browser — can't access server resources.

---

### Shared Imports (Both)

```typescript
// ✅ SAFE in both Server and Client Components

// React core (no hooks)
import { Suspense } from 'react';

// UI components
import { Button, Card } from '@/components/ui';

// Utilities (pure functions)
import { formatDate, cn } from '@/lib/utils';

// Constants
import { APP_NAME, ROUTES } from '@/constants';

// Types
import type { User, Product } from '@prisma/client';
```

**Rule:** If it's a pure function or constant → safe in both.

---

## 🛣️ Path Aliases

### Configured Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Usage

```typescript
// ✅ CORRECT — Using @/ alias
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/modules/auth/nextauth';

// ❌ FORBIDDEN — Relative paths from deep files
import { Button } from '../../../components/ui/Button';
import { prisma } from '../../../../lib/prisma';
```

**Exceptions:**
- ✅ Same-folder imports: `import { helper } from './helper'`
- ✅ Types in same module: `import type { Props } from './types'`

---

## 📚 Third-party Dependencies

### Common Imports

**Next.js:**
```typescript
// Server
import { redirect, notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import Image from 'next/image';

// Client
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
```

**React:**
```typescript
// Client only
import { useState, useEffect, useCallback, useMemo } from 'react';

// Both
import { Suspense } from 'react';
import type { ReactNode, FC } from 'react';
```

**NextAuth:**
```typescript
// Server
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';

// Client
import { useSession, signIn, signOut } from 'next-auth/react';
```

**Prisma:**
```typescript
// Server only
import { prisma } from '@/lib/prisma';
import type { User, Product, Order } from '@prisma/client';
```

---

### Import Patterns by Library

**Zod (validation):**
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

**React Hook Form:**
```typescript
'use client'; // Required!

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
```

**TailwindCSS:**
```typescript
// No imports needed — use className
<div className="bg-blue-500 text-white p-4">...</div>

// For dynamic classes, use cn() utility
import { cn } from '@/lib/utils';
<div className={cn('base-class', isActive && 'active-class')}>...</div>
```

**Lucide Icons:**
```typescript
import { ShoppingCart, User, Settings } from 'lucide-react';

<ShoppingCart className="w-5 h-5" />
```

---

## 🔄 Circular Dependencies

### What is a Circular Dependency?

```typescript
// a.ts
import { b } from './b';
export const a = b + 1;

// b.ts
import { a } from './a';  // ← Circular!
export const b = a + 1;
```

**Problem:** Module resolution fails, undefined values, or build errors.

---

### How to Detect

```bash
# Install madge
npm install -g madge

# Check for circular dependencies
madge --circular --extensions ts,tsx src/
```

**Output:**
```
✓ No circular dependencies found
```

---

### How to Fix

**Option 1: Extract to Shared Module**
```typescript
// Before (circular)
// a.ts
import { b } from './b';

// b.ts
import { a } from './a';

// After (fixed)
// shared.ts
export const shared = 'value';

// a.ts
import { shared } from './shared';

// b.ts
import { shared } from './shared';
```

**Option 2: Dependency Injection**
```typescript
// Instead of importing, pass as param
function processA(bValue: number) {
  return bValue + 1;
}
```

**Option 3: Move to index.ts**
```typescript
// index.ts
export { a } from './a';
export { b } from './b';

// Usage (no circular import)
import { a, b } from './index';
```

---

## ❌ FORBIDDEN PATTERNS

### 1. **Importing from node_modules internals**

```typescript
// ❌ FORBIDDEN
import { internalHelper } from 'some-library/dist/internal/helper';

// ✅ CORRECT
import { publicApi } from 'some-library';
```

**Why:** Internal paths can change between versions → breaks code.

---

### 2. **Importing Server-only in Client**

```typescript
// ❌ FORBIDDEN
'use client';
import { prisma } from '@/lib/prisma';

// ✅ CORRECT
'use client';
// Use API routes instead
fetch('/api/products').then(...)
```

---

### 3. **Importing Client-only in Server**

```typescript
// ❌ FORBIDDEN (Server Component)
import { useState } from 'react';

// ✅ CORRECT
// Don't use state in Server Components — they're async functions
```

---

### 4. **Deep relative imports**

```typescript
// ❌ FORBIDDEN
import { helper } from '../../../lib/utils/helper';

// ✅ CORRECT
import { helper } from '@/lib/utils/helper';
```

---

### 5. **Unused imports**

```typescript
// ❌ FORBIDDEN
import { Button } from '@/components/ui/Button';  // Not used below

export default function Page() {
  return <div>Hello</div>;
}

// ✅ CORRECT
// Remove unused imports (ESLint will warn)
```

---

### 6. **Wildcard imports (except types)**

```typescript
// ⚠️ AVOID (hard to tree-shake)
import * as utils from '@/lib/utils';

// ✅ BETTER
import { formatDate, formatPrice } from '@/lib/utils';

// ✅ ACCEPTABLE for types only
import type * as Prisma from '@prisma/client';
```

---

## ✅ CHECKLIST

### Before Committing

- [ ] All imports use `@/` path alias (no deep relative paths)
- [ ] Server Components don't import client hooks
- [ ] Client Components don't import server utilities
- [ ] No unused imports (ESLint check)
- [ ] Imports organized by category (React → third-party → internal → types)
- [ ] No circular dependencies (check with `madge`)

### When Creating Barrel File

- [ ] Only export simple, pure components/functions
- [ ] Don't re-export third-party hooks
- [ ] Don't re-export server-only code
- [ ] Test tree-shaking (bundle size doesn't explode)

### When Adding Third-party Library

- [ ] Check if it's client-only (requires `'use client'`)
- [ ] Check if it's server-only (e.g., database driver)
- [ ] Add to package.json dependencies (not devDependencies if runtime)
- [ ] Update imports guide if commonly used

---

## 📚 Quick Reference

### Import Decision Tree

```
Need to import something?
  ├─ Is it React hook? → Client Component only
  ├─ Is it Prisma/DB? → Server Component only
  ├─ Is it Next.js API?
  │   ├─ redirect(), cookies() → Server only
  │   └─ useRouter(), usePathname() → Client only
  ├─ Is it UI component? → Check if has 'use client'
  └─ Is it utility/constant? → Safe in both
```

---

### Common Import Patterns

**Server Component:**
```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { safeRedirect } from '@/lib/serverSafe';
```

**Client Component:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
```

**API Route:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
```

**Middleware:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
```

---

## 🟢 STABLE IMPORT PATTERNS (DO NOT CHANGE)

These import patterns are production-tested:

### ✅ Auth Imports
```typescript
// Server
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';

// Client
import { useSession } from 'next-auth/react';

// API Routes
import { requireAuth, requireRole } from '@/lib/auth-helpers';
```

**Status:** STABLE — do not change

---

### ✅ Database Imports
```typescript
import { prisma } from '@/lib/prisma';
import type { User, Product, Order } from '@prisma/client';
```

**Status:** STABLE — single source of truth

---

### ✅ Server Safety Imports
```typescript
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';
```

**Status:** STABLE — core utilities

---

### ✅ Logging Imports
```typescript
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
```

**Status:** STABLE — standardized logging

---

### ✅ UI Component Imports
```typescript
import { Button, Card, Input, Badge } from '@/components/ui';
```

**Status:** STABLE — barrel file tested

---

### ✅ Navigation Imports (Auth Routes)
```typescript
import { AuthLink } from '@/components/common/links/AuthLink';
```

**Status:** STABLE — prefetch safety

---

## 🎯 Summary

**GOLDEN RULES:**

1. ✅ **@/ alias → ALWAYS for cross-folder imports**
2. ✅ **Server imports → prisma, getServerSession, redirect**
3. ✅ **Client imports → useState, useRouter, useSession**
4. ✅ **Barrel files → Only for simple UI components**
5. ✅ **No circular deps → Check with madge**
6. ✅ **Organized order → React → third-party → internal → types**

**DEBUG STRATEGY:**

- Build error about prisma → Importing in Client Component
- Build error about useState → Using in Server Component
- Circular dependency → Check imports with `madge --circular`
- Module not found → Check path alias `@/` configuration
- Tree-shaking fail → Check barrel file exports

**STATUS:** ✅ PRODUCTION READY — Follow these rules for clean imports

---

**Last Updated:** 2026-01-25  
**Related Docs:** FINAL_APP_ROUTER_RULES.md  
**Next Review:** Q2 2026
