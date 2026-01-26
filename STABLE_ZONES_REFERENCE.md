# STABLE ZONES REFERENCE — 🔒 Do Not Touch Without Review

**Проект:** sanduta.art  
**Версія:** 1.0 (Final)  
**Дата:** 2026-01-26  
**Мета:** Швидкий reference для zones які пройшли hardening та не повинні змінюватись

---

## 🎯 Що таке Stable Zone?

**Stable Zone** = частина коду що:
1. ✅ Пройшла hardening (barrel files, Server Components, auth, prefetch)
2. ✅ Має comprehensive tests або documentation
3. ✅ Працює стабільно без known issues
4. ❌ **НЕ МОЖНА** змінювати без extreme need + full testing

**Критичне правило:**
```
🔒 STABLE ZONE → NO TOUCH
⚠️ CAREFUL ZONE → REVIEW BEFORE CHANGE
🟢 ACTIVE ZONE → CAN MODIFY FREELY
```

---

## 🔒 ZONE 1: Authentication & Authorization

### Файли

```
middleware.ts                           # 🔒 STABLE
src/modules/auth/nextauth.ts           # 🔒 STABLE
src/lib/auth-helpers.ts                # 🔒 STABLE
src/app/admin/layout.tsx               # 🔒 STABLE
src/app/manager/layout.tsx             # 🔒 STABLE
src/app/operator/layout.tsx            # 🔒 STABLE
src/app/account/layout.tsx             # ⚠️ CAREFUL (має useEffect issue)
```

### Чому Stable

- ✅ Middleware з JWT auth правильно працює
- ✅ Role-based access control tested
- ✅ Protected layouts використовують useSession() правильно
- ✅ Prefetch відключений для всіх auth routes (AuthLink)
- ✅ No getServerSession() в Client Components

### Що НЕ МОЖНА робити

```typescript
// ❌ Додавати getServerSession в Client Component
'use client';
import { getServerSession } from 'next-auth';  // NEVER!

// ❌ Додавати auth redirects в useEffect
useEffect(() => {
  if (!session) router.replace('/login');  // NEVER!
}, [session]);

// ❌ Змінювати middleware matcher без full audit
export const config = {
  matcher: ['/admin/:path*']  // Don't remove /manager, /operator, /account!
};

// ❌ Використовувати Link без prefetch={false} для auth routes
<Link href="/admin/orders">Orders</Link>  // Missing prefetch={false}!
```

### Документація

- `AUTH_PREFETCH_HARDENING_REPORT.md` — comprehensive audit
- `FINAL_APP_ROUTER_RULES.md` — PART 2 (Authentication & Authorization)
- `.github/copilot-instructions.md` — NextAuth rules

### Якщо потрібно змінити

1. 📖 Прочитай `AUTH_PREFETCH_HARDENING_REPORT.md` повністю
2. 🧪 Напиши tests для нової логіки
3. ✅ Перевір що middleware + layouts + prefetch працюють
4. 📝 Оновлюй документацію

---

## 🔒 ZONE 2: Server Component Safety Layer

### Файли

```
src/lib/serverSafe.ts                   # 🔒 STABLE
src/app/account/orders/page.tsx         # 🔒 STABLE
src/app/account/addresses/page.tsx      # 🔒 STABLE
src/app/account/orders/[id]/page.tsx    # 🔒 STABLE
docs/SERVER_COMPONENT_SAFETY_GUIDE.md   # 🔒 DOCUMENTATION
```

### Чому Stable

- ✅ `safeRedirect()` catches NEXT_REDIRECT errors
- ✅ `validateServerData()` перевіряє null/undefined
- ✅ `fetchServerData()` має timeout (10s) + retry (2x)
- ✅ Всі Server Components мають try/catch
- ✅ Всі redirects мають `return` statement

### Що НЕ МОЖНА робити

```typescript
// ❌ redirect() без return
if (!session) {
  redirect('/login');  // Missing return!
}

// ❌ Prisma без timeout wrapper
const data = await prisma.table.findMany();  // No timeout!

// ❌ Server Component без try/catch
export default async function Page() {
  const data = await prisma.table.findMany();  // Can crash!
  return <div>{data}</div>;
}

// ❌ Обходити validateServerData
const userId = session?.user?.id;  // Can be undefined!
// Should be: validateServerData(session?.user?.id, 'User ID missing')
```

### Паттерн який ЗАВЖДИ використовувати

```typescript
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function Page() {
  try {
    // 1. Safe redirect з return
    const session = await getServerSession(authOptions);
    if (!session) return safeRedirect('/login');
    
    // 2. Validate critical data
    const userId = validateServerData(session?.user?.id, 'User ID missing');
    
    // 3. Fetch з timeout + retry
    const data = await fetchServerData(
      () => prisma.table.findMany({ where: { userId } }),
      { timeout: 10000, retries: 2 }
    );
    
    return <Component data={data} />;
  } catch (error) {
    logger.error('Page', 'Failed', { error });
    throw error; // Next.js error boundary
  }
}
```

### Документація

- `docs/SERVER_COMPONENT_SAFETY_GUIDE.md` — comprehensive guide
- `FINAL_APP_ROUTER_RULES.md` — RULE 1.3 (Server Component safety)

### Якщо потрібно змінити

1. 📖 Прочитай `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`
2. 🧪 Напиши tests (особливо timeout scenarios)
3. ✅ Перевір що всі existing usages не ламаються
4. 📝 Оновлюй GUIDE якщо змінюєш API

---

## 🔒 ZONE 3: Validation & Error Handling

### Файли

```
src/lib/validation.ts                   # 🔒 STABLE
src/lib/logger.ts                       # 🔒 STABLE
src/lib/safeFetch.ts                    # 🔒 STABLE
docs/RELIABILITY.md                     # 🔒 DOCUMENTATION
```

### Чому Stable

- ✅ Validation functions tested і використовуються по всьому проекту
- ✅ Logger має structured logging (timestamp, level, tag, context)
- ✅ safeFetch має automatic retry + error handling
- ✅ Consistency по всьому проекту (single source of truth)

### Що НЕ МОЖНА робити

```typescript
// ❌ Дублювати validation logic
function validateEmail(email: string) { ... }  // Already exists in validation.ts!

// ❌ Створювати нові logging functions
function logError(msg: string) { console.error(msg); }  // Use logger!

// ❌ Direct fetch без error handling
const res = await fetch('/api/products');  // No retry, no error handling!

// ❌ Не використовувати createErrorResponse в API routes
return NextResponse.json({ error: 'Failed' }, { status: 500 });  // Use createErrorResponse!
```

### Паттерн який ЗАВЖДИ використовувати

```typescript
// Validation
import { validateCheckoutForm, validateEmail } from '@/lib/validation';
const errors = validateCheckoutForm(data);
if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 });

// Logging
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
logger.info('API:Orders', 'Creating order', { userId, total });
logger.error('API:Paynet', 'Payment failed', { error, orderId });

// Client-side fetch
import { safeFetch } from '@/lib/safeFetch';
const { data, error } = await safeFetch('/api/products', {
  method: 'POST',
  body: JSON.stringify(productData)
});
```

### Документація

- `docs/RELIABILITY.md` — error handling patterns
- `FINAL_APP_ROUTER_RULES.md` — PART 4-5 (Error Handling, Validation)

### Якщо потрібно додати нову validation function

1. 📖 Перевір чи вона вже не існує в `validation.ts`
2. 🧪 Напиши tests для нової функції
3. ✅ Додай до `validation.ts` (не створюй окремий файл)
4. 📝 Документуй в `docs/RELIABILITY.md`

---

## 🔒 ZONE 4: UI Components Library

### Файли

```
src/components/ui/Button.tsx            # 🔒 STABLE
src/components/ui/Card.tsx              # 🔒 STABLE
src/components/ui/Badge.tsx             # 🔒 STABLE
src/components/ui/Input.tsx             # 🔒 STABLE
src/components/ui/Select.tsx            # 🔒 STABLE
src/components/ui/Modal.tsx             # 🔒 STABLE
src/components/ui/LoadingState.tsx      # 🔒 STABLE
src/components/ui/ErrorState.tsx        # 🔒 STABLE
src/components/ui/EmptyState.tsx        # 🔒 STABLE
src/components/ui/index.ts              # ⚠️ CAREFUL (only types!)
docs/UI_COMPONENTS.md                   # 🔒 DOCUMENTATION
```

### Чому Stable

- ✅ Standardized по всьому проекту
- ✅ Variants через props (не дублюються компоненти)
- ✅ TailwindCSS classes consistent
- ✅ TypeScript types для всіх props
- ✅ Used extensively (breaking changes = багато work)

### Що НЕ МОЖНА робити

```typescript
// ❌ Створювати дублікати існуючих components
export function PrimaryButton() { ... }  // Use Button variant="primary"!
export function DangerButton() { ... }   // Use Button variant="danger"!

// ❌ Експортувати UI components з barrel file
// src/components/ui/index.ts
export { Button } from './Button';  // NEVER! (see IMPORT_RULES.md)

// ❌ Змінювати existing variants без migration plan
<Button variant="primary">  // Якщо зміниш primary style → 100+ components affected!

// ❌ Додавати React hooks в UI utilities
export function cn(...classes) {
  const [state, setState] = useState();  // NEVER! Keep utils pure!
}
```

### Паттерн який ЗАВЖДИ використовувати

```typescript
// ✅ Direct imports
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ✅ Use variants instead of new components
<Button variant="primary">Save</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Cancel</Button>

// ✅ Consistent styling
<Card className="p-6">  // Use Tailwind classes
  <Badge value="PENDING" />  // Auto-styling based on value
</Card>
```

### Документація

- `docs/UI_COMPONENTS.md` — comprehensive examples
- `IMPORT_RULES.md` — UI barrel file rules

### Якщо потрібно додати новий UI component

1. 📖 Перевір чи можна використати existing component з іншим variant
2. 🎨 Follow existing design patterns (variants, TypeScript, TailwindCSS)
3. 📝 Додай приклади в `docs/UI_COMPONENTS.md`
4. ❌ **НЕ експортуй** з `ui/index.ts` (тільки types!)

---

## ⚠️ ZONE 5: Import System (Barrel Files)

### Файли

```
src/components/public/home/index.ts     # ⚠️ CAREFUL (був 502 issue)
src/components/charts/index.ts          # ⚠️ CAREFUL (був crash issue)
src/components/ui/index.ts              # ⚠️ CAREFUL (only types!)
IMPORT_RULES.md                         # 🔒 DOCUMENTATION
RAPORT_BARREL_FILES_FINAL.md            # 🔒 CASE STUDY
```

### Чому Careful (не Stable)

- ⚠️ Був barrel file crisis (homepage 502s)
- ⚠️ Client Component exports = crashes
- ⚠️ Easy to accidentally break (один export = 502)
- ✅ Зараз виправлено (direct imports everywhere)

### Що КАТЕГОРИЧНО ЗАБОРОНЕНО

```typescript
// ❌ НІКОЛИ не експортуй Client Components з barrel files
// src/components/ui/index.ts
export { Button } from './Button';  // Client Component → 502!
export { Modal } from './Modal';    // Client Component → crash!

// ❌ НІКОЛИ не додавай 'use client' в barrel file
// src/components/charts/index.ts
'use client';  // Робить ВЕСЬ файл Client Component!
export { BarChart } from './BarChart';

// ❌ НІКОЛИ не імпортуй з barrel file в Server Component
// app/page.tsx (Server Component)
import { Button } from '@/components/ui';  // Якщо ui/index.ts має Client exports → CRASH!
```

### Що ДОЗВОЛЕНО експортувати з barrel files

```typescript
// ✅ Types/interfaces
export type { ButtonProps } from './Button';
export type { ModalProps } from './Modal';

// ✅ Pure utilities (no React hooks)
export { formatDate, cn } from './utils';

// ✅ Constants
export { ROUTES, STATUS_COLORS } from './constants';

// ✅ Server-only libraries
export { prisma, logger } from './lib';
```

### Паттерн який ЗАВЖДИ використовувати

```typescript
// ✅ Direct imports для Client Components
import { Button } from '@/components/ui/Button';
import { Hero } from '@/components/public/home/Hero';
import { BarChart } from '@/components/charts/BarChart';

// ✅ Barrel imports ТІЛЬКИ для types
import type { ButtonProps } from '@/components/ui';
import type { ChartData } from '@/components/charts';
```

### Документація

- `IMPORT_RULES.md` — comprehensive barrel file rules
- `RAPORT_BARREL_FILES_FINAL.md` — case study (homepage 502s)
- `FINAL_APP_ROUTER_RULES.md` — RULE 4.1 (forbidden patterns)

### Якщо потрібно додати exports в barrel file

1. ⚠️ **STOP!** Прочитай `IMPORT_RULES.md` повністю
2. 🔍 Перевір чи це Client Component → якщо ТАК, НЕ експортуй!
3. ✅ Якщо тільки types/utils/constants → OK
4. 🧪 Test у Server Component що імпорт працює
5. 📝 Оновлюй `IMPORT_RULES.md` якщо потрібно

---

## 🟢 ZONE 6: Active Development Areas

### Admin Panel

```
src/app/admin/                          # 🟢 CAN MODIFY
src/app/admin/_components/              # 🟢 CAN MODIFY
src/app/api/admin/                      # 🟢 CAN MODIFY (з auth check!)
```

**Rules:**
- ✅ Використовуй `requireRole(['ADMIN'])` в API routes
- ✅ Використовуй `AuthLink` або `prefetch={false}` для links
- ✅ Direct imports для components (no barrel files)
- ✅ `force-dynamic` для fresh data

---

### Manager/Operator Panels

```
src/app/manager/                        # 🟢 CAN MODIFY
src/app/operator/                       # 🟢 CAN MODIFY
```

**Rules:**
- ✅ Layout = Client Component з `useSession()`
- ✅ Middleware робить auth check (не додавай в layout)
- ✅ `AuthLink` для всіх protected links

---

### Public Pages

```
src/app/(public)/                       # 🟢 CAN MODIFY
src/components/public/                  # ⚠️ CAREFUL (no barrel exports!)
```

**Rules:**
- ✅ Server Components де можливо
- ✅ Client Components тільки для interactivity
- ❌ НЕ експортуй Client Components через barrel files
- ✅ ISR cache strategy (revalidate: 3600)

---

## 📊 Quick Reference Matrix

| Zone | Status | Can Modify? | Requires Review? | Documentation |
|------|--------|-------------|------------------|---------------|
| Auth & Authorization | 🔒 STABLE | ❌ NO | ✅ YES (full audit) | AUTH_PREFETCH_HARDENING_REPORT.md |
| Server Component Safety | 🔒 STABLE | ❌ NO | ✅ YES (full audit) | docs/SERVER_COMPONENT_SAFETY_GUIDE.md |
| Validation & Errors | 🔒 STABLE | ⚠️ EXTEND ONLY | ✅ YES | docs/RELIABILITY.md |
| UI Components | 🔒 STABLE | ⚠️ EXTEND ONLY | ✅ YES | docs/UI_COMPONENTS.md |
| Barrel Files | ⚠️ CAREFUL | ❌ NO (types only) | ✅ YES (critical) | IMPORT_RULES.md |
| Admin Panel | 🟢 ACTIVE | ✅ YES | ⚠️ Basic review | ADMIN_PANEL_*.md |
| Public Pages | 🟢 ACTIVE | ✅ YES | ⚠️ No barrel files | - |

---

## 🚨 Before Touching Any Stable Zone

### Checklist

- [ ] Прочитав відповідну документацію повністю?
- [ ] Розумію чому це Stable Zone (history, issues)?
- [ ] Є **extreme need** для цієї зміни?
- [ ] Є plan для testing (manual + automated)?
- [ ] Є план rollback якщо щось ламається?
- [ ] Готовий оновити всю related documentation?

### Якщо хоч один ❌ — НЕ ЧІПАЙ STABLE ZONE!

---

## 📞 Emergency Contact

**Якщо зламав Stable Zone:**

1. 🚨 **IMMEDIATE:** Revert commit (`git revert HEAD`)
2. 📖 Перечитай documentation для цієї Zone
3. 🧪 Напиши tests які відтворюють problem
4. 🔧 Fix у branch, test extensively
5. 📝 Оновлюй documentation з lessons learned

**Якщо знайшов bug в Stable Zone:**

1. 📝 Створи issue з тегом `stable-zone-bug`
2. 📖 Опиши чому ти думаєш що це bug (не feature)
3. 🔍 Перевір documentation — можливо це expected behavior
4. 🧪 Напиши test що демонструє bug
5. ⏳ Почекай review перед fixing

---

## 🎯 Success Criteria

**Stable Zones працюють якщо:**

✅ 0 regressions в stable zones протягом 30 днів  
✅ New devs розуміють що можна/не можна чіпати  
✅ Всі modifications проходять review  
✅ Documentation актуальна (updated within 7 days of change)  

---

**VERSION:** 1.0 Final  
**LAST UPDATED:** 2026-01-26  
**NEXT REVIEW:** After any Stable Zone modification  
**EMERGENCY CONTACT:** See git blame for original author
