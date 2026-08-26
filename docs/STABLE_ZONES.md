# STABLE ZONES — DO NOT REFACTOR

**Ultimă actualizare**: 2026-01-25  
**Scop**: Protejarea zonelor stabile împotriva refactoring-ului excesiv

---

## 🟢 Zone STABILE — NU MODIFICA

Acestea sunt zone ale aplicației care:
- ✅ Funcționează corect
- ✅ Au fost testate extensive
- ✅ NU produc 502 sau crash-uri
- ✅ Au arhitectură corectă

**REGULĂ**: Dacă funcționează, **NU atinge**!

---

## 📱 Public Pages (Frontend)

### ✅ `src/app/(public)/`
Toate paginile publice sunt **STABILE**:

- ✅ `(public)/page.tsx` — Homepage
- ✅ `(public)/about/page.tsx` — Despre noi
- ✅ `(public)/contact/page.tsx` — Contact
- ✅ `(public)/privacy/page.tsx` — Privacy policy
- ✅ `(public)/terms/page.tsx` — Terms & conditions
- ✅ `(public)/cookies/page.tsx` — Cookie policy
- ✅ `(public)/cart/page.tsx` — Shopping cart
- ✅ `(public)/checkout/page.tsx` — Checkout process
- ✅ `(public)/checkout/success/page.tsx` — Order confirmation

**Arhitectură**:
- Client components (`'use client'`)
- Fetch către API routes (nu Prisma direct)
- Error handling corespunzător
- Layout wrapper cu header/footer

**NU MODIFICA** decât dacă:
- Bug raportat de utilizatori
- Cerință nouă de business
- Security vulnerability

---

## 🛒 E-commerce Flow

### ✅ Products & Configurator
- ✅ `(public)/produse/page.tsx` — Catalog produse
- ✅ `(public)/produse/[slug]/page.tsx` — Detalii produs
- ✅ `(public)/produse/[slug]/configure/` — Configurator (3 steps)

**Status**: FUNCȚIONAL, testat, fără crash-uri

### ✅ Editor
- ✅ `(public)/editor/[projectId]/page.tsx` — Design editor
- ✅ `src/modules/editor/` — Editor logic

**Status**: COMPLEX dar STABIL

---

## 👤 Account Pages

### ✅ `src/app/account/`
**TOATE paginile account sunt STABILE**:

- ✅ `account/page.tsx` — Dashboard
- ✅ `account/orders/page.tsx` — Comenzi (FIXAT recent)
- ✅ `account/orders/[id]/page.tsx` — Detalii comandă
- ✅ `account/profile/page.tsx` — Profil utilizator
- ✅ `account/settings/page.tsx` — Setări cont
- ✅ `account/addresses/page.tsx` — Adrese livrare
- ✅ `account/invoices/page.tsx` — Facturi
- ✅ `account/projects/page.tsx` — Proiecte salvate
- ✅ `account/notifications/page.tsx` — Notificări

**Arhitectură**:
- Client components
- Layout cu `PanelSidebar` + `PanelHeader`
- Auth prin middleware + useSession()
- Fetch către API routes

**NU REFACTORIZA** — sunt production-ready!

---

## 🔐 Auth System

### ✅ Authentication Flow
- ✅ `src/modules/auth/nextauth.ts` — NextAuth config
- ✅ `src/app/login/page.tsx` — Login page
- ✅ `src/app/register/page.tsx` — Register page
- ✅ `src/app/forgot-password/page.tsx` — Password reset
- ✅ `src/app/reset-password/page.tsx` — Password reset confirmation
- ✅ `middleware.ts` — Route protection

**Status**: MISSION CRITICAL — NU ATINGE!

**De ce este stabil**:
- JWT strategy funcțională
- Middleware protecție corectă
- Session persistence OK
- Role-based access control

---

## 🎨 UI Components

### ✅ `src/components/ui/`
**Toate componentele UI sunt STANDARDIZATE**:

- ✅ `Button.tsx` — 6 variante
- ✅ `Card.tsx` — Layout wrapper
- ✅ `Input.tsx` — Form input
- ✅ `Select.tsx` — Dropdown
- ✅ `Badge.tsx` — Status display
- ✅ `Table.tsx` — Data tables
- ✅ `Modal.tsx` — Dialogs
- ✅ `Form.tsx` — Form wrapper

**Status**: PRODUCTION-GRADE

**Documentat în**: `docs/UI_COMPONENTS.md`

---

## 🔌 API Routes

### ✅ Funcționale & Testate

#### Admin API
- ✅ `/api/admin/products/` — CRUD produse
- ✅ `/api/admin/orders/` — Gestiune comenzi
- ✅ `/api/admin/customers/` — Clienți
- ✅ `/api/admin/categories/` — Categorii
- ✅ `/api/admin/materials/` — Materiale
- ✅ `/api/admin/users/` — Utilizatori
- ✅ `/api/admin/reports/` — Rapoarte (5 tipuri)
- ✅ `/api/admin/theme/` — Tematizare

#### Public API
- ✅ `/api/orders/` — Creare comenzi
- ✅ `/api/editor/projects/` — Proiecte editor
- ✅ `/api/account/` — Account endpoints

#### Auth API
- ✅ `/api/auth/[...nextauth]/` — NextAuth handler
- ✅ `/api/register/` — User registration
- ✅ `/api/forgot-password/` — Password reset
- ✅ `/api/reset-password/` — Password confirmation

**Arhitectură**:
- `requireRole()` pentru auth
- Try/catch pentru errors
- Logging cu `logger`
- Validation cu Zod (unde e cazul)

**NU SCHIMBA** endpoint-uri funcționale!

---

## 📊 Database Schema

### ✅ `prisma/schema.prisma`
**Schema este STABILĂ și TESTATE**:

Models principale:
- User (auth + roles)
- Product (catalog)
- Category (ierarhie)
- Order (e-commerce)
- OrderItem (detalii comandă)
- Payment (Paynet integration)
- Delivery (Nova Poshta)
- Material (producție)
- Machine (producție)

**Status**: PRODUCTION SCHEMA

**NU MODIFICA** decât prin migrații planificate!

---

## 🚫 CE NU TREBUIE FĂCUT

### ❌ Refactoring "pentru ordine"
- NU muta componente funcționale
- NU redenumește fișiere fără motiv
- NU restructurează foldere stabile

### ❌ "Îmbunătățiri" nesolicitatе
- NU adăuga abstracțiuni inutile
- NU complica cod simplu
- NU optimiza prematur

### ❌ Modificări în zone stabile
- NU schimba auth flow
- NU refactoriza UI components
- NU rescrie API routes funcționale

---

## ✅ CÂND Este OK să Modifici

### 1. Bug Real
- Eroare raportată de utilizatori
- Comportament incorect verificat
- Security vulnerability

### 2. Cerință Business
- Feature nou solicitat
- Schimbare proces business
- Update regulatoriu

### 3. Dependency Update
- Security patch
- Breaking change în library
- Next.js major version upgrade

### 4. Performance Issue
- Slow query identificat
- Memory leak confirmat
- Bundle size prea mare

---

## 📋 Checklist Înainte de Modificare

Dacă vrei să modifici o zonă stabilă, răspunde DA la TOATE:

- [ ] Există un bug reproductibil?
- [ ] Bug-ul afectează utilizatorii?
- [ ] Nu există workaround simplu?
- [ ] Am testat modificarea local?
- [ ] Am backup / rollback plan?
- [ ] Am documentat schimbarea?

Dacă răspunzi NU la oricare → **NU MODIFICA**!

---

## 🎯 Principiu General

> **"If it ain't broke, don't fix it!"**

Stabilitatea > Perfecțiunea

Funcționalitatea > Elegența

Production uptime > Code beauty

---

## 📈 Metrici de Stabilitate

### Zone Stabile (nu au avut bug-uri în ultima lună)

| Zonă | Ultimul Bug | Status | Uptime |
|------|-------------|--------|--------|
| Public Pages | N/A | 🟢 STABLE | 100% |
| Account Pages | 2026-01-24 (fixat) | 🟢 STABLE | 99.9% |
| Auth System | N/A | 🟢 STABLE | 100% |
| API Routes | N/A | 🟢 STABLE | 100% |
| UI Components | N/A | 🟢 STABLE | 100% |
| Editor | N/A | 🟢 STABLE | 99.8% |

### Zone în Dezvoltare (pot fi modificate)

| Zonă | Status | Note |
|------|--------|------|
| Admin Pages | 🟡 BETA | În curs de standardizare |
| CMS System | 🟡 BETA | Feature nou |
| Reports | 🟢 STABLE | Recent testat |
| Theme System | 🟡 BETA | În dezvoltare |

---

## 🔒 Protected Files

**NICIODATĂ să nu ștergi sau refactorizezi**:

1. `middleware.ts` — Route protection
2. `src/modules/auth/nextauth.ts` — Auth config
3. `prisma/schema.prisma` — Database schema
4. `src/lib/auth-helpers.ts` — Auth utilities
5. `src/lib/logger.ts` — Logging system
6. `src/lib/validation.ts` — Form validation
7. `src/components/ui/*` — UI library
8. `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler

---

## 📞 Contact

Dacă nu ești sigur dacă o zonă este stabilă:
1. Verifică acest document
2. Caută în git history pentru recent changes
3. Întreabă în #development channel
4. **În caz de dubiu, NU MODIFICA**

---

**Ultima actualizare**: 2026-01-25  
**Menținut de**: Development Team  
**Reviewed by**: Tech Lead

**Status**: 🟢 ENFORCED — Respectarea este obligatorie
