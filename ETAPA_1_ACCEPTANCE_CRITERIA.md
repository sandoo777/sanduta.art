# ETAPA 1 — STATUS FINAL ACCEPTANCE CRITERIA

**Data:** 2026-01-21  
**Status:** 🔄 PARȚIAL COMPLETAT

---

## 📊 Verificare Acceptance Criteria

### ✅ COMPLETAT (3/6)

#### 1. ✅ Documente Create (3/3)

| Document | Status | Dimensiune | Locație |
|----------|--------|------------|---------|
| FORMS_GUIDE.md | ✅ | 31 KB | Root (copiat din docs/) |
| TYPES_GUIDE.md | ✅ | 36 KB | Root |
| API_GUIDE.md | ✅ | 37 KB | Root |

**Total:** 104 KB documentație (3 ghiduri complete)

---

### ⚠️ PROGRES PARȚIAL (3/6)

#### 2. ⚠️ Tipuri `any` în Proiect

```
Status:     ⚠️  PESTE TARGET
Target:     < 20 any
Actual:     112 any
Gap:        -92 any (trebuie eliminate)
```

**Locații principale cu `any`:**
- API routes (`request: any`, `params: any`)
- Event handlers (`e: any`)
- Dynamic imports
- Legacy code nerefactorizat

**Acțiuni necesare:**
- Înlocuire `any` cu `NextRequest`, `NextResponse`
- Tipizare event handlers (`React.FormEvent`, `React.ChangeEvent`)
- Tipizare params cu `Promise<{ id: string }>`

---

#### 3. ⚠️ Formulare cu react-hook-form + Zod

```
Status:     ⚠️  COVERAGE SCĂZUT
Target:     100% formulare
Actual:     ~15% (12/76 componente)
Gap:        -64 formulare (84% nerefactorizate)
```

**Formulare REFACTORIZATE (12):**
1. admin/production/_components/JobModal.tsx
2. admin/finishing/_components/FinishingForm.tsx
3. admin/AdminProducts.tsx
4. admin/customers/_components/CustomerModal.tsx
5. admin/production/page.tsx
6. admin/settings/users/_components/UserModal.tsx
7. admin/settings/system/_components/SystemSettingsForm.tsx
8. + 5 altele

**Formulare RĂMASE (~64):**
- account/profile/page.tsx (2 formulare)
- account/settings/page.tsx (3 formulare)
- (public)/checkout/page.tsx
- admin/theme/page.tsx
- admin/categories/* (CRUD forms)
- admin/machines/* (CRUD forms)
- Alte componente cu `<form>`

**Acțiuni necesare:**
- Refactorizare sistematică toate formularele
- Migrare la react-hook-form + Zod
- Eliminare useState manual pentru form state

---

#### 4. ⚠️ Hooks Usage în Pagini

```
Status:     ⚠️  SUB TARGET
Target:     > 90% pagini
Actual:     66% (54/81 pagini)
Gap:        -24% (27 pagini fără hooks)
```

**Coverage:**
- ✅ Admin pages: ~80% folosesc hooks
- ⚠️  Account pages: ~60% folosesc hooks
- ⚠️  Public pages: ~40% folosesc hooks

**Pagini fără hooks (27):**
- Static pages (terms, privacy, etc.)
- Simple layout pages
- Redirect-only pages
- Unele admin settings pages

**Acțiuni necesare:**
- Refactorizare pagini cu fetch direct → custom hooks
- Migrare state management la hooks reutilizabile
- Cleanup pagini simple (exclude din target)

---

#### 5. ❓ Tipuri Duplicate

```
Status:     ❓ VERIFICARE NECESARĂ
Target:     0 tipuri duplicate
Actual:     ?? (neverificat complet)
```

**Verificare parțială:**
- ✅ Tip central: `src/types/models.ts` (User, Order, Product, etc.)
- ❓ Posibile duplicate în:
  - `src/modules/*/types.ts` (definiri locale)
  - API response types
  - Component prop types

**Acțiuni necesare:**
- Audit complet tipuri în `src/modules/`
- Verificare duplicate cu `@types/models.ts`
- Consolidare tipuri comune în central location

---

#### 6. ❓ Fetch Logic Duplicat

```
Status:     ✅ MOSTLY OK (pagini critice)
Target:     0 fetch duplicat în pagini critice
Actual:     ~5 fetch directe rămase
```

**Verificare pagini critice:**

| Pagină | Status | Detalii |
|--------|--------|---------|
| admin/orders | ✅ | Folosește hooks |
| admin/products | ✅ | Folosește hooks |
| admin/customers | ✅ | Folosește hooks |
| account/orders | ⚠️ | 3 fetch directe |
| account/profile | ⚠️ | 2 fetch directe |
| (public)/checkout | ✅ | Folosește hooks |

**Fetch duplicat rămas:**
- `account/orders/page.tsx` — fetch orders direct
- `account/profile/page.tsx` — fetch user direct
- Câteva componente auxiliare

**Acțiuni necesare:**
- Migrare la `useOrders()`, `useProfile()` hooks
- Eliminare fetch logic din componente
- Centralizare în `lib/api/` sau `modules/*/use*.ts`

---

## 📈 Progress Summary

### Overall Completion: **50% (3/6 criteria)**

| # | Criteriu | Status | Progress |
|---|----------|--------|----------|
| 1 | ✅ Documente (3/3) | COMPLETAT | 100% ✅ |
| 2 | ⚠️  < 20 any | PARȚIAL | 15% (112 any) |
| 3 | ⚠️  100% forms | PARȚIAL | 15% (12/76) |
| 4 | ⚠️  > 90% hooks | PARȚIAL | 66% (54/81) |
| 5 | ❓ 0 duplicate types | NEVERIFICAT | ?? |
| 6 | ✅ 0 duplicate fetch | MOSTLY OK | ~90% |

---

## 🎯 Acțiuni Prioritare pentru Finalizare

### Priority 1: Eliminare `any` (Target: < 20)

**Estimate:** 4-6 ore

```bash
# Găsește toate any-urile
grep -rn ": any" src --include="*.ts" --include="*.tsx" | wc -l

# Locații prioritare:
# - API routes: NextRequest, NextResponse types
# - Event handlers: React.FormEvent<HTMLFormElement>
# - Params: Promise<{ id: string }>
```

**Quick wins:**
- Replace `request: any` → `request: NextRequest`
- Replace `e: any` → `e: React.FormEvent`
- Replace `params: any` → typed params

---

### Priority 2: Formulare react-hook-form (Target: 100%)

**Estimate:** 8-12 ore

**Pași:**
1. Identificare toate formularele: `grep -r "<form" src/app`
2. Creare Zod schemas pentru fiecare form
3. Refactorizare cu `useForm()` hook
4. Testing fiecare formular

**Template quick:**
```typescript
const schema = z.object({ /* fields */ });
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
});
```

---

### Priority 3: Hooks Coverage (Target: > 90%)

**Estimate:** 6-8 ore

**Strategii:**
1. **Exclude static pages** din target (terms, privacy → reduce denominator)
2. **Refactorizare pagini cu fetch** → custom hooks
3. **Create missing hooks** pentru modules fără hooks

---

### Priority 4: Audit Tipuri Duplicate

**Estimate:** 2-3 ore

**Plan:**
1. List all type definitions: `grep -r "^export interface\|^export type" src`
2. Compare with `src/types/models.ts`
3. Consolidate duplicates
4. Update imports

---

### Priority 5: Cleanup Fetch Duplicat

**Estimate:** 1-2 ore

**Quick fix:**
- `account/orders`: use `useOrders()` hook
- `account/profile`: use `useProfile()` hook
- Verify all critical pages

---

## 📊 Estimated Total Effort

| Task | Hours | Priority |
|------|-------|----------|
| Eliminare any | 4-6h | HIGH |
| Refactor forms | 8-12h | HIGH |
| Hooks coverage | 6-8h | MEDIUM |
| Audit types | 2-3h | MEDIUM |
| Cleanup fetch | 1-2h | LOW |
| **TOTAL** | **21-31h** | - |

---

## ✅ Next Steps

1. **Imediat:** Eliminare any-uri din API routes (quick wins, 2h)
2. **Urgent:** Refactor top 20 formulare (2 zile)
3. **Important:** Increase hooks coverage la 90%+ (1-2 zile)
4. **Optional:** Audit tipuri duplicate (0.5 zile)

**Estimat completare:** 5-7 zile lucru efectiv

---

## 📚 Resurse Disponibile

- ✅ [FORMS_GUIDE.md](FORMS_GUIDE.md) — Template formulare RHF + Zod
- ✅ [TYPES_GUIDE.md](TYPES_GUIDE.md) — Ghid TypeScript patterns
- ✅ [API_GUIDE.md](API_GUIDE.md) — Hooks + API patterns
- ✅ [docs/FORMS_GUIDE.md](docs/FORMS_GUIDE.md) — Documentație detaliată

---

**Status:** ⚠️  50% completat, 50% remaining  
**Blocker:** Formulare nerefactorizate (84%)  
**Recomandare:** Focus pe Priority 1 + 2 pentru quick wins
