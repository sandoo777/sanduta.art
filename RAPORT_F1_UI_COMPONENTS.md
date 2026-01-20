# F1. Componente UI Comune — Raport de Verificare

**Status**: ✅ **PARȚIAL IMPLEMENTAT** (necesită refactorizare)  
**Data verificării**: 2026-01-20  
**Versiune**: 1.0

---

## 📋 Rezumat Executiv

Sistemul de componente UI este **funcțional dar inconsistent**:
- ✅ **13 componente UI** în `components/ui/` bine structurate
- ⚠️ **21 importuri** din `@/components/ui` (utilizare limitată)
- ❌ **51+ butoane custom** (nu folosesc `Button` component)
- ⚠️ **Inconsistență** — multe pagini folosesc stiluri inline în loc de componente

**Recomandare**: Refactorizare pentru a crește adoptarea componentelor UI comune de la **~25%** la **~90%**.

---

## E1.1 — Identificare Componente Duplicate

### 🎯 Obiectiv
Identifică toate componentele UI duplicate (Button, Input, Card, Table) din codebase.

### ✅ Rezultate Verificare

#### 📊 **Componente UI Disponibile în `components/ui/`**

| Component | Fișier | Linii | Features | Status |
|-----------|--------|-------|----------|--------|
| **Button** | `Button.tsx` | 83 | 6 variante, 3 dimensiuni, loading state | ✅ Complet |
| **Input** | `Input.tsx` | 81 | Label, error, helper text, left/right icons | ✅ Complet |
| **Card** | `Card.tsx` | 108 | Header, Title, Content, Footer | ✅ Complet |
| **Select** | `Select.tsx` | 70 | Dropdown cu opțiuni, label, error | ✅ Complet |
| **Badge** | `Badge.tsx` | 91 | Culori dinamice, status badges | ✅ Complet |
| **Modal** | `Modal.tsx` | 130 | Header, body, footer, overlay | ✅ Complet |
| **Tabs** | `tabs.tsx` | 95 | TabsList, TabsTrigger, TabsContent | ✅ Complet |
| **Pagination** | `Pagination.tsx` | 154 | Previous/Next, page numbers | ✅ Complet |
| **ConfirmDialog** | `ConfirmDialog.tsx` | 251 | Modal de confirmare cu presets | ✅ Complet |
| **SectionTitle** | `SectionTitle.tsx` | 71 | Titluri secțiuni, PageTitle | ✅ Complet |
| **EmptyState** | `EmptyState.tsx` | 115 | State pentru liste goale | ✅ Complet |
| **ErrorState** | `ErrorState.tsx` | 120 | State pentru erori | ✅ Complet |
| **LoadingState** | `LoadingState.tsx` | 128 | Skeleton loaders (Card, List, Table) | ✅ Complet |
| **TOTAL** | **13 componente** | **1497 linii** | **Design system complet** | ✅ **Bine structurat** |

---

#### 🔍 **Componente Duplicate Identificate**

**1. Button — 51+ implementări custom**

**Probleme**:
- ✅ Componentă `Button.tsx` există și este completă (6 variante: primary, secondary, danger, success, ghost, outline)
- ❌ **51+ butoane custom** găsite care **nu folosesc** componenta `Button`
- ❌ Stiluri inline repetitive: `bg-blue-600 text-white hover:bg-blue-700`

**Exemple de stiluri duplicate**:
```tsx
// ❌ Stil custom inline (găsit în 51+ locuri)
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
  Submit
</button>

// ✅ Ar trebui să folosească Button component
import { Button } from '@/components/ui';
<Button variant="primary">Submit</Button>
```

**Locații cu butoane custom** (primele 10):
1. `src/app/manager/dashboard/page.tsx` — 2 butoane (purple-600, blue-600)
2. `src/app/admin/print-methods/page.tsx` — 2 butoane
3. `src/app/admin/reports/products/page.tsx` — 1 buton
4. `src/app/admin/reports/operators/page.tsx` — 1 buton
5. `src/app/admin/reports/page.tsx` — 3 butoane
6. `src/app/admin/reports/customers/page.tsx` — 1 buton
7. `src/app/admin/reports/sales/page.tsx` — 1 buton
8. `src/app/admin/finishing/page.tsx` — 1 buton
9. `src/app/admin/products/page.tsx` — 2 butoane
10. `src/app/admin/customers/page.tsx` — 3 butoane

**Total**: 51+ butoane custom în `src/app/**/*.tsx`

---

**2. Card — Utilizare inconsistentă**

**Status**:
- ✅ Componentă `Card.tsx` există și este completă (Header, Title, Content, Footer)
- ⚠️ **Utilizare parțială** — doar 8-10 pagini folosesc `Card` din `@/components/ui`
- ❌ Multe pagini folosesc `<div className="bg-white rounded-lg shadow-md p-6">` manual

**Exemple**:
```tsx
// ❌ Card custom inline
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-xl font-bold mb-4">Title</h3>
  <p>Content...</p>
</div>

// ✅ Ar trebui să folosească Card component
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content...</p>
  </CardContent>
</Card>
```

---

**3. Input — Utilizare bună în Account Panel**

**Status**:
- ✅ Componentă `Input.tsx` există și este completă (label, error, helper text, icons)
- ✅ **Utilizare bună** în Account Panel (profile, addresses, settings folosesc `Input`)
- ⚠️ Unele formulare în Admin Panel folosesc `<input>` nativ

**Pagini care folosesc `Input` corect**:
- `src/app/account/profile/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/app/account/settings/page.tsx`
- `src/components/orders/SendNotificationModal.tsx`

---

**4. Table — Nu există componentă**

**Probleme**:
- ❌ **Nu există** componentă `Table.tsx` în `components/ui/`
- ❌ Fiecare pagină implementează propriul `<table>` cu stiluri custom
- ❌ Inconsistență masivă între tabelele din Admin Panel

**Exemple de stiluri de tabel duplicate**:
```tsx
// Găsit în 15+ locuri cu stiluri diferite
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        Name
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {/* rows */}
  </tbody>
</table>
```

**Recomandare**: Creați componentă `Table.tsx` refolosibilă cu:
- `Table` — container
- `TableHeader` — thead
- `TableBody` — tbody
- `TableRow` — tr
- `TableCell` — td/th
- Sorting, filtering, pagination integrat

---

**5. Select — Utilizare limitată**

**Status**:
- ✅ Componentă `Select.tsx` există (70 linii)
- ⚠️ **Utilizare limitată** — doar `account/addresses/page.tsx` folosește
- ❌ Multe dropdown-uri folosesc `<select>` nativ fără styling

---

#### 📈 **Statistici Duplicate**

| Component | UI Component Există | Nr. Utilizări Corecte | Nr. Duplicate Custom | Adopție |
|-----------|--------------------|-----------------------|----------------------|---------|
| **Button** | ✅ Da (Button.tsx) | ~21 importuri | 51+ butoane custom | **~30%** |
| **Card** | ✅ Da (Card.tsx) | ~8 pagini | 20+ cards custom | **~30%** |
| **Input** | ✅ Da (Input.tsx) | ~5 pagini | 10+ inputs custom | **~40%** |
| **Select** | ✅ Da (Select.tsx) | ~1 pagină | 15+ selects custom | **~10%** |
| **Table** | ❌ Nu există | 0 | 30+ tables custom | **0%** |
| **Badge** | ✅ Da (Badge.tsx) | ~5 pagini | 10+ badges custom | **~40%** |
| **Modal** | ✅ Da (Modal.tsx) | ~3 pagini | 5+ modals custom | **~40%** |
| **TOTAL** | **6/7 există** | **~43 utilizări** | **141+ duplicate** | **~25%** |

---

## F1.2 — Verificare Structură `components/ui/`

### 🎯 Obiectiv
Verifică că toate componentele sunt mutate în `components/ui/` și sunt bine structurate.

### ✅ Rezultate Verificare

#### 📁 **Structura `components/ui/`**

```
src/components/ui/
├── Badge.tsx              (91 linii)   — Badge cu culori dinamice + StatusBadge
├── Button.tsx             (83 linii)   — 6 variante, 3 dimensiuni, loading
├── Card.tsx               (108 linii)  — Header, Title, Content, Footer
├── ConfirmDialog.tsx      (251 linii)  — Dialog de confirmare cu presets
├── EmptyState.tsx         (115 linii)  — State pentru liste goale
├── ErrorState.tsx         (120 linii)  — State pentru erori
├── Input.tsx              (81 linii)   — Input cu label, error, icons
├── LoadingState.tsx       (128 linii)  — Skeleton loaders
├── Modal.tsx              (130 linii)  — Modal refolosibil
├── Pagination.tsx         (154 linii)  — Paginare cu Previous/Next
├── SectionTitle.tsx       (71 linii)   — Titluri secțiuni
├── Select.tsx             (70 linii)   — Dropdown cu opțiuni
├── tabs.tsx               (95 linii)   — Tabs system
├── index.ts               (25 linii)   — Export centralizat
└── states/                            — State components folder
    └── (empty)
```

**Verificare**:
✅ **Structură bună** — toate componentele în `components/ui/`  
✅ **Export centralizat** — `index.ts` exportă toate componentele  
✅ **TypeScript** — toate au interfețe de props bine definite  
✅ **Consistent naming** — PascalCase pentru componente

---

#### 🎨 **Design System — Button Variants**

**Fișier**: `src/components/ui/Button.tsx`

**Variante disponibile**:
```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

// Stiluri variante
const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
};
```

**Verificare**:
✅ **6 variante** — acoperă toate cazurile de utilizare  
✅ **3 dimensiuni** — sm (px-3 py-1.5), md (px-4 py-2), lg (px-6 py-3)  
✅ **Loading state** — spinner animat  
✅ **Disabled state** — opacity-50, cursor-not-allowed  
✅ **Dark mode support** — `dark:` prefixes  
✅ **Hover effects** — scale transform (1.02), shadow-lg

---

#### 🃏 **Design System — Card Structure**

**Fișier**: `src/components/ui/Card.tsx`

**Sub-componente**:
```typescript
export const Card: React.FC<CardProps>
export const CardHeader: React.FC<CardHeaderProps>
export const CardTitle: React.FC<CardTitleProps>
export const CardContent: React.FC<CardContentProps>
export const CardFooter: React.FC<CardFooterProps>
```

**Props avansate**:
```typescript
interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}
```

**Verificare**:
✅ **Structură modulară** — Header, Title, Content, Footer  
✅ **Flexibilitate** — padding și shadow configurabile  
✅ **Hover effect** — transition-shadow hover:shadow-xl (opțional)

---

#### 📝 **Design System — Input Features**

**Fișier**: `src/components/ui/Input.tsx`

**Features**:
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Verificare**:
✅ **Label** — cu `*` pentru required  
✅ **Error handling** — border roșu, mesaj de eroare cu icon  
✅ **Helper text** — text gri pentru ajutor  
✅ **Icons** — left și right icons cu positioning absolut  
✅ **Dark mode** — bg-gray-700, border-gray-600  
✅ **Animations** — shake animation pentru erori

---

#### 📊 **Design System — Badge Colors**

**Fișier**: `src/components/ui/Badge.tsx`

**Variante**:
```typescript
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface StatusBadgeProps {
  status: string; // Dynamic color based on status value
}
```

**StatusBadge Logic** (automatic color assignment):
```typescript
const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('success') || lowerStatus.includes('completed')) return 'bg-green-100 text-green-800';
  if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) return 'bg-yellow-100 text-yellow-800';
  if (lowerStatus.includes('error') || lowerStatus.includes('failed')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800'; // default
};
```

**Verificare**:
✅ **5 variante** — default, success, warning, danger, info  
✅ **Dynamic colors** — `StatusBadge` alege culoarea automat  
✅ **Round shape** — `rounded-full` pentru pill design

---

#### 🔄 **Export Centralizat — `index.ts`**

**Fișier**: `src/components/ui/index.ts` (25 linii)

```typescript
// UI Components
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps } from './Card';

export { Badge, StatusBadge } from './Badge';
export type { BadgeProps, StatusBadgeProps } from './Badge';

export { SectionTitle, PageTitle } from './SectionTitle';
export type { SectionTitleProps, PageTitleProps } from './SectionTitle';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './tabs';

// ... etc (12+ exports)
```

**Verificare**:
✅ **Centralizat** — un singur import pentru toate componentele  
✅ **Types exported** — interfețe disponibile pentru TypeScript  
✅ **Tree-shaking** — importuri named pentru optimizare

---

## F1.3 — Verificare Utilizare Componente Comune

### 🎯 Obiectiv
Verifică că paginile folosesc componentele comune din `components/ui/` în loc de stiluri custom.

### ⚠️ Rezultate Verificare

#### 📊 **Statistici Utilizare**

**Total importuri** din `@/components/ui`: **21**

| Folder | Nr. Importuri | Procent |
|--------|---------------|---------|
| `src/app/account/**` | 8 | **38%** |
| `src/components/**` | 13 | **62%** |
| `src/app/admin/**` | 0 | **0%** |
| `src/app/manager/**` | 0 | **0%** |
| **TOTAL** | **21** | **100%** |

**Observație**: ❌ **Admin Panel și Manager Panel nu folosesc deloc componentele UI comune!**

---

#### ✅ **Pagini care folosesc componente UI corect**

**1. Account Panel** (8 pagini)

```typescript
// src/app/account/page.tsx
import { Card } from '@/components/ui';

// src/app/account/profile/page.tsx
import { Card, Button, Input } from '@/components/ui';

// src/app/account/addresses/page.tsx
import { Card, Button, Input, Select } from '@/components/ui';

// src/app/account/settings/page.tsx
import { Card, Button, Input } from '@/components/ui';

// src/app/account/orders/page.tsx
import { PageTitle, StatusBadge, Card, Button } from '@/components/ui';

// src/app/account/notifications/page.tsx
import { Button, Card, Badge } from '@/components/ui';

// src/app/account/projects/page.tsx
import { Card, Button } from '@/components/ui';

// src/app/account/invoices/page.tsx
import { Card, Button } from '@/components/ui';
```

**Verificare**: ✅ **Account Panel** — utilizare **100%** a componentelor UI

---

**2. Production Components** (6 componente)

```typescript
// src/components/production/WorkQueue.tsx
import { Card, Button, Badge } from '@/components/ui';

// src/components/production/OverviewPanel.tsx
import { Card } from '@/components/ui';

// src/components/production/ProductionCalendar.tsx
import { Card } from '@/components/ui';

// src/components/production/OperatorsPanel.tsx
import { Card, Button, Badge } from '@/components/ui';

// src/components/production/MachinesPanel.tsx
import { Card, Button, Badge } from '@/components/ui';

// src/components/orders/SendNotificationModal.tsx
import { Button, Input, Card } from '@/components/ui';
```

**Verificare**: ✅ **Production Components** — utilizare **bună** a componentelor UI

---

**3. Public Components** (5 componente)

```typescript
// src/components/public/Header.tsx
import { Button } from '@/components/ui';

// src/components/public/home/Hero.tsx
import { Button } from '@/components/ui';

// src/components/public/home/FinalCTA.tsx
import { Button } from '@/components/ui';

// src/components/public/home/PopularProducts.tsx
import { Button } from '@/components/ui';

// src/components/public/editor/export/ExportPanel.tsx
import { Button } from '@/components/ui';
```

**Verificare**: ✅ **Public Components** — utilizare **parțială** (doar Button)

---

#### ❌ **Pagini care NU folosesc componente UI**

**1. Admin Panel** (35 pagini, 0 importuri)

**Probleme**:
- ❌ **Zero importuri** din `@/components/ui` în tot Admin Panel
- ❌ Toate butoanele sunt custom: `className="bg-blue-600 text-white..."`
- ❌ Toate card-urile sunt custom: `<div className="bg-white rounded-lg shadow-md...">`
- ❌ Toate input-urile sunt custom: `<input className="border rounded-lg...">`

**Exemple de pagini afectate**:
- `src/app/admin/reports/products/page.tsx` — 1 buton custom
- `src/app/admin/reports/sales/page.tsx` — 1 buton custom
- `src/app/admin/customers/page.tsx` — 3 butoane custom
- `src/app/admin/products/page.tsx` — 2 butoane custom
- `src/app/admin/print-methods/page.tsx` — 2 butoane custom
- ... (30+ pagini similare)

---

**2. Manager Panel** (3 pagini, 0 importuri)

**Probleme**:
- ❌ **Zero importuri** din `@/components/ui`
- ❌ `manager/dashboard/page.tsx` — 2 butoane custom (purple-600, blue-600)
- ❌ `manager/orders/page.tsx` — 1 buton custom

**Exemple**:
```tsx
// src/app/manager/dashboard/page.tsx
<Link
  href="/manager/orders"
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
>
  View Orders
</Link>
```

**Ar trebui**:
```tsx
import { Button } from '@/components/ui';
<Button variant="primary" asChild>
  <Link href="/manager/orders">View Orders</Link>
</Button>
```

---

#### 📈 **Analiza Adopție pe Panel**

| Panel | Total Pagini | Pagini cu UI Components | Adopție |
|-------|-------------|-------------------------|---------|
| **Account** | 9 | 8 (88%) | ✅ **Excellent** |
| **Admin** | 35 | 0 (0%) | ❌ **Zero** |
| **Manager** | 3 | 0 (0%) | ❌ **Zero** |
| **Operator** | 1 | 0 (0%) | ❌ **Zero** |
| **Public** | 32+ | ~5 (15%) | ⚠️ **Slab** |
| **TOTAL** | **80+** | **13 (16%)** | ⚠️ **Foarte slab** |

**Concluzie**: Doar **16%** din pagini folosesc componentele UI comune.

---

## 📊 Rezumat Probleme Identificate

### 🔴 **Probleme Critice**

1. **❌ Admin Panel (35 pagini)** — Zero utilizare componentele UI
   - Impact: Inconsistență masivă, duplicare cod
   - Soluție: Refactorizare completă cu Button, Card, Input

2. **❌ Manager Panel (3 pagini)** — Zero utilizare componentele UI
   - Impact: Stiluri diferite față de Account Panel
   - Soluție: Import Button, Card din @/components/ui

3. **❌ Lipsește componentă Table** — 30+ tabele custom
   - Impact: Inconsistență stiluri, cod duplicat
   - Soluție: Creați Table.tsx refolosibil

4. **❌ 51+ butoane custom** — Nu folosesc Button component
   - Impact: Stiluri diferite, culori hardcodate
   - Soluție: Înlocuiți cu `<Button variant="primary">`

---

### ⚠️ **Probleme Moderate**

5. **⚠️ Select utilizare 10%** — Doar 1 pagină folosește
   - Impact: Dropdown-uri fără styling consistent
   - Soluție: Promovare utilizare Select.tsx

6. **⚠️ Badge utilizare 40%** — 10+ badges custom
   - Impact: Culori inconsistente pentru statusuri
   - Soluție: Folosiți StatusBadge cu culori automate

7. **⚠️ Modal utilizare 40%** — 5+ modals custom
   - Impact: Overlay și animații diferite
   - Soluție: Folosiți Modal.tsx pentru toate dialog-urile

---

## ✅ Criterii de Acceptare

### **F1.1 — Identificare componente duplicate**

✅ **Button**: Identificat — 51+ butoane custom vs 1 componentă Button.tsx  
✅ **Card**: Identificat — 20+ cards custom vs 1 componentă Card.tsx  
✅ **Input**: Identificat — 10+ inputs custom vs 1 componentă Input.tsx  
❌ **Table**: Identificat — 30+ tables custom, **nu există componentă**

### **F1.2 — Mutare în components/ui/**

✅ **Toate componentele** sunt în `components/ui/` (13 componente)  
✅ **Export centralizat** prin `index.ts`  
✅ **TypeScript interfaces** definite pentru toate  
✅ **Structură bună** — fișiere separate pentru fiecare componentă

### **F1.3 — Refactorizare pagini**

❌ **Admin Panel**: 0% adopție (0/35 pagini)  
❌ **Manager Panel**: 0% adopție (0/3 pagini)  
✅ **Account Panel**: 88% adopție (8/9 pagini)  
⚠️ **Public Pages**: 15% adopție (~5/32 pagini)

### **UI consistent pe tot site-ul**

❌ **NU** — Inconsistență masivă:
- Admin Panel: stiluri custom inline
- Manager Panel: culori diferite (purple-600 vs blue-600)
- Account Panel: folosește componente UI ✅
- Public Pages: mix de Button component și stiluri custom

**Scor general**: ❌ **16% adopție** (ținta: 90%)

---

## 🎯 Plan de Refactorizare

### **Faza 1: Creați componentele lipsă**

**1. Table Component** (prioritate MARE)
```bash
# Creați: src/components/ui/Table.tsx
- Table (container)
- TableHeader (thead)
- TableBody (tbody)
- TableRow (tr)
- TableCell (td/th)
- TableHeaderCell (th cu sorting)
```

**Estimate**: 4-6 ore

---

### **Faza 2: Refactorizare Admin Panel** (prioritate MARE)

**Target**: 35 pagini din `src/app/admin/**/*.tsx`

**Acțiuni**:
1. Înlocuiți toate `<button className="bg-blue-600...">` cu `<Button variant="primary">`
2. Înlocuiți toate `<div className="bg-white rounded-lg shadow-md...">` cu `<Card>`
3. Înlocuiți toate `<input className="border...">` cu `<Input>`
4. Înlocuiți toate `<table>` cu `<Table>` (după creare componentă)

**Estimate**: 10-15 ore (1-2 zile)

**Exemplu refactorizare**:
```tsx
// ÎNAINTE (admin/products/page.tsx)
<button
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  onClick={handleCreate}
>
  <Plus className="w-4 h-4" />
  Add Product
</button>

// DUPĂ
import { Button } from '@/components/ui';
<Button variant="primary" onClick={handleCreate}>
  <Plus className="w-4 h-4" />
  Add Product
</Button>
```

---

### **Faza 3: Refactorizare Manager Panel** (prioritate MEDIE)

**Target**: 3 pagini din `src/app/manager/**/*.tsx`

**Acțiuni**:
1. `manager/dashboard/page.tsx` — înlocuiți 2 butoane custom
2. `manager/orders/page.tsx` — înlocuiți 1 buton custom

**Estimate**: 1-2 ore

---

### **Faza 4: Refactorizare Public Pages** (prioritate JOASĂ)

**Target**: ~27 pagini fără componente UI

**Acțiuni**:
1. Înlocuiți butoanele custom din catalog
2. Înlocuiți card-urile custom din blog
3. Înlocuiți input-urile din checkout

**Estimate**: 5-8 ore

---

### **Faza 5: Documentare** (prioritate MEDIE)

**Creați**:
- `docs/UI_COMPONENTS.md` — documentație completă
- Storybook pentru componente (opțional)
- Ghid de utilizare pentru dezvoltatori

**Estimate**: 2-3 ore

---

## 📝 Checklist Refactorizare

### **Per Pagină**

- [ ] Import componente: `import { Button, Card, Input } from '@/components/ui';`
- [ ] Înlocuiți `<button className="bg-blue-600...">` cu `<Button variant="primary">`
- [ ] Înlocuiți `<button className="bg-red-600...">` cu `<Button variant="danger">`
- [ ] Înlocuiți `<button className="bg-gray-200...">` cu `<Button variant="secondary">`
- [ ] Înlocuiți `<div className="bg-white rounded-lg shadow-md...">` cu `<Card>`
- [ ] Înlocuiți `<input className="border...">` cu `<Input>`
- [ ] Înlocuiți `<select>` nativ cu `<Select>`
- [ ] Verificați că stilurile rămân identice
- [ ] Testați funcționalitatea (click, submit, etc.)

---

## 🎨 Design System Documentation

### **Button Usage**

```tsx
import { Button } from '@/components/ui';

// Primary (default)
<Button variant="primary">Save</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Danger
<Button variant="danger">Delete</Button>

// Success
<Button variant="success">Approve</Button>

// Ghost (transparent)
<Button variant="ghost">Skip</Button>

// Outline
<Button variant="outline">Learn More</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading>Processing...</Button>

// Full width
<Button fullWidth>Submit</Button>
```

---

### **Card Usage**

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card padding="md" shadow="md" hover>
  <CardHeader>
    <CardTitle>Product Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Product information...</p>
  </CardContent>
  <CardFooter>
    <Button>View More</Button>
  </CardFooter>
</Card>
```

---

### **Input Usage**

```tsx
import { Input } from '@/components/ui';

// Basic
<Input label="Email" type="email" required />

// With error
<Input 
  label="Password" 
  type="password" 
  error="Password must be at least 8 characters"
/>

// With helper text
<Input 
  label="Username" 
  helperText="Choose a unique username"
/>

// With icons
<Input 
  label="Search" 
  leftIcon={<Search className="w-4 h-4" />}
  placeholder="Search products..."
/>
```

---

## 📁 Fișiere Relevante

### UI Components
- `src/components/ui/Button.tsx` — Button component (83 linii)
- `src/components/ui/Card.tsx` — Card components (108 linii)
- `src/components/ui/Input.tsx` — Input component (81 linii)
- `src/components/ui/Select.tsx` — Select dropdown (70 linii)
- `src/components/ui/Badge.tsx` — Badge + StatusBadge (91 linii)
- `src/components/ui/Modal.tsx` — Modal dialog (130 linii)
- `src/components/ui/Tabs.tsx` — Tabs system (95 linii)
- `src/components/ui/Pagination.tsx` — Pagination (154 linii)
- `src/components/ui/index.ts` — Export centralizat (25 linii)

### Pagini cu Utilizare Bună
- `src/app/account/**/*.tsx` — 8 pagini (88% adopție)
- `src/components/production/**/*.tsx` — 6 componente

### Pagini cu Probleme
- `src/app/admin/**/*.tsx` — 35 pagini (0% adopție) ❌
- `src/app/manager/**/*.tsx` — 3 pagini (0% adopție) ❌

---

**Verificat de**: GitHub Copilot  
**Data**: 2026-01-20  
**Versiune raport**: 1.0  
**Status**: ⚠️ **Necesită Refactorizare** (adopție actuală: 16%, țintă: 90%)
