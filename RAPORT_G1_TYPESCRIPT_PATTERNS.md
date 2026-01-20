# 📋 Raport G1: Tipare & TypeScript
**Data:** 2026-01-20  
**Task:** G1 - Tipare clare, fără ambiguități  
**Status:** ⚠️ Necesită Refactoring

---

## 📊 Sumar Executiv

### ❌ Probleme Critice Identificate

1. **233 utilizări `any`** în cod (mai multe decât toate formularele combinate!)
2. **26 duplicate type definitions** pentru entități principale
3. **Zero centralizare** - fiecare fișier își definește propriile tipuri
4. **Tipuri Prisma subutilizate** - doar 26 importuri din `@prisma/client`

### 📈 Statistici

```
❌ Utilizări 'any':          233
❌ Duplicate User types:      5
❌ Duplicate Order types:     8
❌ Duplicate Product types:   5
❌ Duplicate Category types:  8
📁 src/types/ files:          2 (theme.ts, next-auth.d.ts)
✅ Prisma imports:            26 (subutilizat)
```

**Estimare duplicare:** ~500-700 lines of redundant type definitions

---

## 🔍 G1.1: Eliminare 'any' Inutile

### Status: ❌ 233 Utilizări Identificate

#### Top Fișiere cu 'any'

| Fișier | Utilizări | Categorie | Prioritate |
|--------|-----------|-----------|------------|
| src/components/theme/HomepageBuilder.tsx | 15+ | Theme System | P2 |
| src/lib/prisma-helpers.ts | 8 | Database | P1 |
| src/app/api/admin/reports/export.ts | 6 | Reports | P1 |
| src/app/api/admin/reports/export-advanced.ts | 12 | Reports | P1 |
| src/app/api/categories/tree/route.ts | 3 | API | P0 |
| src/lib/paynet.ts | 1 | Payments | P1 |
| src/lib/webVitals.ts | 1 | Monitoring | P2 |
| src/components/orders/SendNotificationModal.tsx | 2 | Orders | P1 |
| src/components/theme/ThemePreview.tsx | 1 | Theme | P2 |
| src/components/theme/ColorSettings.tsx | 1 | Theme | P2 |

### Exemple Problematice

#### ❌ Problem 1: Category Tree API (P0 - Critical)

**Fișier:** [src/app/api/categories/tree/route.ts](src/app/api/categories/tree/route.ts)

```typescript
// ❌ BAD
const rootCategories: any[] = [];

categories.forEach(category => {
  const node = categoryMap.get(category.id);
  if ((category as any).parentId) {  // ❌ Force cast
    const parent = categoryMap.get((category as any).parentId);
    // ...
  }
});
```

**Problema:** 
- Prisma model `Category` **nu are** câmp `parentId` în schema
- Code presupune existența unui câmp inexistent
- Type safety compromise prin `as any`

**Soluție:**
```typescript
// ✅ GOOD - Use Prisma types
import { Category } from '@prisma/client';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  children: CategoryNode[];
}

const rootCategories: CategoryNode[] = [];

categories.forEach((category: Category) => {
  const node: CategoryNode = categoryMap.get(category.id);
  // No parentId - flat structure
  rootCategories.push(node);
});
```

#### ❌ Problem 2: Prisma Helpers (P1 - High)

**Fișier:** [src/lib/prisma-helpers.ts](src/lib/prisma-helpers.ts)

```typescript
// ❌ BAD (lines 100-140)
export async function paginateQuery(
  prismaModel: any,  // ❌ What model?
  params: {
    where?: any;     // ❌ What filters?
    cursor?: any;    // ❌ What cursor?
    orderBy?: any;   // ❌ What order?
    select?: any;    // ❌ What fields?
    include?: any;   // ❌ What relations?
  }
): any {  // ❌ What returns?
  // ...
}
```

**Soluție:**
```typescript
// ✅ GOOD - Use Prisma generic types
import { Prisma } from '@prisma/client';

export async function paginateQuery<T, K extends keyof T>(
  prismaModel: {
    findMany: (args: Prisma.SelectSubset<T, K>) => Promise<T[]>;
    count: (args: { where?: Prisma.SelectSubset<T, K>['where'] }) => Promise<number>;
  },
  params: {
    where?: Prisma.SelectSubset<T, K>['where'];
    orderBy?: Prisma.SelectSubset<T, K>['orderBy'];
    select?: Prisma.SelectSubset<T, K>['select'];
    include?: Prisma.SelectSubset<T, K>['include'];
  }
): Promise<PaginatedResult<T>> {
  // ...
}
```

#### ❌ Problem 3: Reports Export (P1 - High)

**Fișiere:** 
- [src/app/api/admin/reports/export.ts](src/app/api/admin/reports/export.ts)
- [src/app/api/admin/reports/export-advanced.ts](src/app/api/admin/reports/export-advanced.ts)

```typescript
// ❌ BAD
async function getSalesReport(
  dateRange?: { start: string; end: string }, 
  filters?: any  // ❌ What filters?
) {
  const where: any = {};  // ❌ What structure?
  // ...
}

async function generateExcel(reportType: string, data: any): Promise<Buffer> {
  let columns: any[] = [];  // ❌ What columns?
  let rows: any[] = [];     // ❌ What rows?
  // ...
}

function convertToCSV(data: any[]): string {  // ❌ What data?
  // ...
}
```

**Soluție:**
```typescript
// ✅ GOOD - Define report types
interface SalesReportFilters {
  status?: OrderStatus[];
  customerId?: string;
  minTotal?: number;
  maxTotal?: number;
}

interface SalesReportRow {
  orderId: string;
  date: Date;
  customerName: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

async function getSalesReport(
  dateRange?: { start: string; end: string },
  filters?: SalesReportFilters
): Promise<SalesReportRow[]> {
  const where: Prisma.OrderWhereInput = {
    createdAt: dateRange ? {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    } : undefined,
    status: filters?.status ? { in: filters.status } : undefined,
    userId: filters?.customerId,
    total: {
      gte: filters?.minTotal,
      lte: filters?.maxTotal
    }
  };
  // ...
}

async function generateExcel(
  reportType: string, 
  data: SalesReportRow[]
): Promise<Buffer> {
  const columns: ExcelColumn[] = [
    { header: 'Order ID', key: 'orderId', width: 15 },
    { header: 'Date', key: 'date', width: 20 },
    // ...
  ];
  // ...
}
```

#### ❌ Problem 4: Theme Config (P2 - Medium)

**Fișier:** [src/components/theme/HomepageBuilder.tsx](src/components/theme/HomepageBuilder.tsx)

```typescript
// ❌ BAD
<Input
  value={(block.config as any).title || ''}  // ❌ Force cast
  onChange={(e) => updateBlockConfig(index, 'title', e.target.value)}
/>

<Input
  value={(block.config as any).subtitle || ''}  // ❌ Force cast
/>

<Input
  value={(block.config as any).productIds || ''}  // ❌ Force cast
/>

function getDefaultConfig(type: HomepageBlock['type']): any {  // ❌ Return any
  // ...
}
```

**Soluție:**
```typescript
// ✅ GOOD - Use discriminated unions
type HomepageBlockConfig =
  | { type: 'hero'; title: string; subtitle: string; backgroundImage: string; ctaText: string; ctaLink: string }
  | { type: 'featured-products'; title: string; productIds: string; limit: number }
  | { type: 'categories'; title: string; description: string }
  | { type: 'custom-html'; html: string };

interface HomepageBlock {
  id: string;
  type: 'hero' | 'featured-products' | 'categories' | 'custom-html';
  config: HomepageBlockConfig;
}

function getDefaultConfig(type: HomepageBlock['type']): HomepageBlockConfig {
  switch (type) {
    case 'hero':
      return { type: 'hero', title: '', subtitle: '', backgroundImage: '', ctaText: '', ctaLink: '' };
    case 'featured-products':
      return { type: 'featured-products', title: '', productIds: '', limit: 8 };
    case 'categories':
      return { type: 'categories', title: '', description: '' };
    case 'custom-html':
      return { type: 'custom-html', html: '' };
  }
}

// Usage - Type-safe!
<Input
  value={block.config.type === 'hero' ? block.config.title : ''}
  onChange={(e) => updateBlockConfig(index, 'title', e.target.value)}
/>
```

---

## 🔍 G1.2: Tipuri Clare pentru User/Order/Product/Category

### Status: ❌ 26 Duplicate Definitions

#### Statistici Duplicate

```
interface User {      →  5 definitions
interface Order {     →  8 definitions
interface Product {   →  5 definitions
interface Category {  →  8 definitions
───────────────────────────────────────
Total:                  26 duplicates
```

### Problema: Zero Centralizare

**Prisma generează** perfect valid types în `@prisma/client`:
```typescript
// Available from Prisma (node_modules/.prisma/client/index.d.ts)
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  emailVerified: Date | null;
  image: string | null;
  phone: string | null;
  company: string | null;
  cui: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  backupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  source: OrderSource;
  channel: OrderChannel;
  // ... 30+ more fields
}

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: string;
  // ... more fields
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  color: string | null;
  icon: string | null;
  // ... more fields
}
```

**DAR** fiecare component își definește propria versiune simplificată:

### Duplicate 1: User Types (5 definitions)

#### Definition 1: [src/app/admin/AdminUsers.tsx](src/app/admin/AdminUsers.tsx)
```typescript
interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}
```

#### Definition 2: [src/app/admin/settings/users/page.tsx](src/app/admin/settings/users/page.tsx)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  _count?: { orders: number };
}
```

#### Definition 3: [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx)
```typescript
interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  _count?: {
    orders: number;
    editorProjects: number;
  };
}
```

#### Definition 4: [src/app/admin/production/_components/AssignOperator.tsx](src/app/admin/production/_components/AssignOperator.tsx)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}
```

#### Definition 5: [src/app/admin/production/_components/JobModal.tsx](src/app/admin/production/_components/JobModal.tsx)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

**Inconsistencies:**
- `name?: string` vs `name: string` (optional inconsistent)
- `role: string` vs `role: UserRole` (type inconsistent)
- `createdAt: string` vs `createdAt: Date` (type inconsistent)
- `_count` missing in some definitions

### Duplicate 2: Order Types (8 definitions)

#### Definition 1: [src/app/admin/AdminOrders.tsx](src/app/admin/AdminOrders.tsx)
```typescript
interface Order {
  id: string;
  total: number;
  customerName: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  orderItems: { product: { name: string }; quantity: number }[];
}
```

#### Definition 2: [src/app/admin/orders/OrdersList.tsx](src/app/admin/orders/OrdersList.tsx)
```typescript
interface Order {
  id: string;
  total: number;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
  };
}
```

#### Definition 3: [src/app/admin/orders/OrderDetails.tsx](src/app/admin/orders/OrderDetails.tsx)
```typescript
interface Order {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      slug: string;
    };
  }>;
  user?: {
    name: string;
    email: string;
  };
}
```

#### Definitions 4-8: Similar patterns in:
- [src/app/account/orders/page.tsx](src/app/account/orders/page.tsx)
- [src/app/account/orders/[id]/page.tsx](src/app/account/orders/[id]/page.tsx)
- [src/app/manager/orders/page.tsx](src/app/manager/orders/page.tsx)
- [src/modules/orders/useOrders.ts](src/modules/orders/useOrders.ts)
- [src/app/admin/production/_components/JobModal.tsx](src/app/admin/production/_components/JobModal.tsx)

**Inconsistencies:**
- `status: string` vs `status: OrderStatus` (enum not used)
- `createdAt: string` vs `createdAt: Date` (inconsistent types)
- `orderItems` structure varies (some include price, some don't)
- Missing fields: `paymentStatus`, `deliveryAddress`, `notes`

### Duplicate 3: Product Types (5 definitions)

#### Definition 1: [src/app/admin/AdminProducts.tsx](src/app/admin/AdminProducts.tsx)
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  options?: any;  // ❌ any!
}
```

#### Definition 2: [src/app/admin/dashboard/_components/TopProducts.tsx](src/app/admin/dashboard/_components/TopProducts.tsx)
```typescript
interface Product {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
}
```

#### Definition 3: [src/app/manager/dashboard/_components/TopProducts.tsx](src/app/manager/dashboard/_components/TopProducts.tsx)
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  sold: number;
  revenue: number;
}
```

#### Definition 4: [src/app/(public)/produse/CatalogClient.tsx](src/app/(public)/produse/CatalogClient.tsx)
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: { url: string; alt?: string }[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}
```

#### Definition 5: [src/components/public/catalog/ProductGrid.tsx](src/components/public/catalog/ProductGrid.tsx)
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
  category: {
    name: string;
  };
}
```

**Inconsistencies:**
- `category: string` vs `category: { id, name, slug }` (inconsistent structure)
- `image_url?: string` vs `images: { url }[]` (single vs multiple)
- `options?: any` (❌ type unsafe)
- Computed fields (`revenue`, `sold`) mixed with database fields

### Duplicate 4: Category Types (8 definitions)

#### Definitions in:
1. [src/components/public/navigation/MobileCategoriesMenu.tsx](src/components/public/navigation/MobileCategoriesMenu.tsx)
2. [src/components/public/navigation/CategoriesMegaMenu.tsx](src/components/public/navigation/CategoriesMegaMenu.tsx)
3. [src/components/public/home/FeaturedCategories.tsx](src/components/public/home/FeaturedCategories.tsx)
4. [src/components/public/catalog/Filters.tsx](src/components/public/catalog/Filters.tsx)
5. [src/app/admin/categories/page.tsx](src/app/admin/categories/page.tsx)
6. [src/app/(public)/produse/CatalogClient.tsx](src/app/(public)/produse/CatalogClient.tsx)
7. [src/modules/categories/useCategories.ts](src/modules/categories/useCategories.ts)
8. [src/hooks/useCategories.ts](src/hooks/useCategories.ts)

**Common pattern:**
```typescript
// Variation 1
interface Category {
  id: string;
  name: string;
  slug: string;
}

// Variation 2
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

// Variation 3
interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

// Variation 4 (with children)
interface CategoryWithChildren extends Category {
  children: Category[];
}
```

**Inconsistencies:**
- Optional fields inconsistent (`icon?`, `color?`, `description?`)
- Computed fields (`productCount`) mixed with database fields
- Tree structure (`children`) defined in some, not others

---

## 🔍 G1.3: Organizare types/

### Status: ⚠️ Minimal - Doar 2 Fișiere

#### Structura Actuală

```
src/types/
├── next-auth.d.ts    (24 lines - NextAuth augmentation)
└── theme.ts          (370 lines - Theme system types)
```

#### Lipsește Complet

```
src/types/
├── ❌ user.ts          (User types)
├── ❌ order.ts         (Order types)
├── ❌ product.ts       (Product types)
├── ❌ category.ts      (Category types)
├── ❌ api.ts           (API request/response types)
├── ❌ reports.ts       (Reports types)
├── ❌ pagination.ts    (Pagination types)
├── ❌ forms.ts         (Form types)
└── ❌ index.ts         (Re-exports)
```

---

## 🎯 Soluție Recomandată

### Strategie: "Prisma First" + Type Extensions

**Principiu:** Folosește Prisma types ca sursă de adevăr, extinde când e necesar.

### Phase 1: Create src/types/models.ts

```typescript
/**
 * Central Model Types
 * 
 * IMPORTANT: Prefer using Prisma-generated types directly:
 *   import { User, Order, Product, Category } from '@prisma/client';
 * 
 * Use these only when you need simplified/extended versions for UI.
 */

import { 
  User as PrismaUser,
  Order as PrismaOrder,
  Product as PrismaProduct,
  Category as PrismaCategory,
  OrderItem as PrismaOrderItem,
  UserRole,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';

// ============================================
// USER TYPES
// ============================================

/**
 * Safe user type (excludes sensitive fields)
 * Use for public-facing APIs and components
 */
export type UserSafe = Pick<
  PrismaUser,
  'id' | 'name' | 'email' | 'role' | 'image' | 'createdAt'
>;

/**
 * User with order count (for admin lists)
 */
export type UserWithCount = UserSafe & {
  _count: {
    orders: number;
    editorProjects?: number;
  };
};

/**
 * User profile (includes optional company info)
 */
export type UserProfile = Omit<PrismaUser, 'password' | 'twoFactorSecret' | 'backupCodes'>;

// ============================================
// ORDER TYPES
// ============================================

/**
 * Order with minimal relations (for lists)
 */
export type OrderListItem = Pick<
  PrismaOrder,
  | 'id'
  | 'customerName'
  | 'customerEmail'
  | 'total'
  | 'status'
  | 'paymentStatus'
  | 'createdAt'
> & {
  user?: UserSafe;
};

/**
 * Order with full details (for order page)
 */
export type OrderWithDetails = PrismaOrder & {
  user?: UserSafe;
  orderItems: (PrismaOrderItem & {
    product: {
      id: string;
      name: string;
      slug: string;
    };
  })[];
};

/**
 * Order for customer view (excludes admin fields)
 */
export type CustomerOrder = Omit<
  OrderWithDetails,
  'internalNotes' | 'assignedTo'
>;

// ============================================
// PRODUCT TYPES
// ============================================

/**
 * Product with category (for listings)
 */
export type ProductWithCategory = PrismaProduct & {
  category: Pick<PrismaCategory, 'id' | 'name' | 'slug' | 'icon' | 'color'>;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
  }>;
};

/**
 * Product card (minimal for grid/list)
 */
export type ProductCard = Pick<
  PrismaProduct,
  'id' | 'name' | 'slug' | 'price' | 'description'
> & {
  images: Array<{ url: string; alt?: string | null }>;
  category: Pick<PrismaCategory, 'name'>;
};

/**
 * Product analytics (for reports)
 */
export interface ProductAnalytics {
  id: string;
  name: string;
  slug: string;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
}

// ============================================
// CATEGORY TYPES
// ============================================

/**
 * Category with product count
 */
export type CategoryWithCount = PrismaCategory & {
  _count: {
    products: number;
  };
};

/**
 * Category tree node (for navigation)
 */
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  productCount: number;
  children?: CategoryNode[];
}

/**
 * Category for filters (minimal)
 */
export type CategoryFilter = Pick<
  PrismaCategory,
  'id' | 'name' | 'slug'
>;
```

### Phase 2: Create src/types/api.ts

```typescript
/**
 * API Request/Response Types
 */

import { OrderStatus, PaymentStatus } from '@prisma/client';

// ============================================
// PAGINATION
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// FILTERS
// ============================================

export interface OrderFilters {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

export interface UserFilters {
  role?: string[];
  active?: boolean;
  search?: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiSuccessResponse<T = void> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export type ApiResponse<T = void> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// REPORT TYPES
// ============================================

export interface SalesReportRow {
  orderId: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

export interface ProductReportRow {
  productId: string;
  productName: string;
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date';
}
```

### Phase 3: Create src/types/index.ts

```typescript
/**
 * Central Types Export
 * 
 * Import pattern:
 *   import { UserSafe, OrderWithDetails, ProductCard } from '@/types';
 */

// Re-export Prisma types for convenience
export type {
  User,
  Order,
  Product,
  Category,
  OrderItem,
  UserRole,
  OrderStatus,
  PaymentStatus,
  ProductionStatus,
  NotificationType,
} from '@prisma/client';

// Re-export custom types
export * from './models';
export * from './api';
export * from './theme';
export * from './next-auth';
```

---

## 🛠️ Refactoring Plan

### Phase 1: Create Type Files (2-3 hours)

**Priority P0:**
1. Create `src/types/models.ts` (User, Order, Product, Category types)
2. Create `src/types/api.ts` (API request/response types)
3. Create `src/types/index.ts` (re-exports)
4. Update existing files to remove `theme.ts` duplicates

### Phase 2: Fix Critical 'any' Usage (4-6 hours)

**Priority P0 (fix ASAP):**
1. ✅ `src/app/api/categories/tree/route.ts` - Remove any casts (1h)
2. ✅ `src/lib/prisma-helpers.ts` - Type paginateQuery properly (2h)

**Priority P1 (fix this week):**
3. ✅ `src/app/api/admin/reports/export.ts` - Define report types (2h)
4. ✅ `src/app/api/admin/reports/export-advanced.ts` - Define types (2h)
5. ✅ `src/lib/paynet.ts` - Type getSessionStatus response (1h)

**Priority P2 (fix next sprint):**
6. `src/components/theme/HomepageBuilder.tsx` - Use discriminated unions (3h)
7. `src/components/theme/ThemePreview.tsx` - Remove any casts (1h)
8. `src/lib/webVitals.ts` - Type sendToMonitoring (0.5h)

### Phase 3: Refactor Duplicate Types (8-12 hours)

**Step 1: Replace User types** (2-3h)
- Find: `interface User {` (5 files)
- Replace: `import { UserSafe, UserWithCount } from '@/types';`
- Test: All user-related pages

**Step 2: Replace Order types** (3-4h)
- Find: `interface Order {` (8 files)
- Replace: `import { OrderListItem, OrderWithDetails } from '@/types';`
- Test: Orders pages, admin panel, customer account

**Step 3: Replace Product types** (2-3h)
- Find: `interface Product {` (5 files)
- Replace: `import { ProductCard, ProductWithCategory } from '@/types';`
- Test: Product catalog, admin products

**Step 4: Replace Category types** (2-3h)
- Find: `interface Category {` (8 files)
- Replace: `import { CategoryNode, CategoryFilter } from '@/types';`
- Test: Navigation, filters, admin categories

### Phase 4: Update Imports (1-2 hours)

**Pattern migration:**

```typescript
// ❌ BEFORE
interface User {
  id: string;
  email: string;
  role: string;
}

const [users, setUsers] = useState<User[]>([]);

// ✅ AFTER
import { UserSafe } from '@/types';

const [users, setUsers] = useState<UserSafe[]>([]);
```

### Phase 5: Testing (2-3 hours)

1. **Type checking:** `npm run type-check` (create script)
2. **Unit tests:** Test type guards, validators
3. **Integration:** Test API endpoints with new types
4. **E2E:** Smoke test critical flows

---

## ⏱️ Effort Estimation

| Phase | Task | Hours | Priority |
|-------|------|-------|----------|
| 1 | Create type files | 2-3 | P0 |
| 2 | Fix critical any (Categories, Prisma) | 3 | P0 |
| 2 | Fix reports any | 4 | P1 |
| 2 | Fix theme any | 4 | P2 |
| 3 | Refactor User types | 2-3 | P0 |
| 3 | Refactor Order types | 3-4 | P0 |
| 3 | Refactor Product types | 2-3 | P1 |
| 3 | Refactor Category types | 2-3 | P1 |
| 4 | Update imports globally | 1-2 | P0 |
| 5 | Testing & validation | 2-3 | P0 |

**Total:** 25-36 hours

### Breakdown by Priority

```
P0 (Critical - This Week): 13-17 hours
  - Type files
  - Fix critical any
  - Refactor User/Order
  - Update imports
  - Testing
  
P1 (High - Next Week): 8-11 hours
  - Fix reports any
  - Refactor Product/Category
  
P2 (Medium - Next Sprint): 4-8 hours
  - Fix theme any
  - Cleanup remaining duplicates
```

---

## 🎯 Success Criteria

### G1.1: Eliminare 'any'
- ✅ Zero `any` în API routes (prioritate P0/P1)
- ✅ Zero `any` în lib/ helpers
- ⚠️  Acceptabil `any` în theme system (P2)
- ✅ Total `any` usage < 50 (reduction 80%)

### G1.2: Tipuri Clare
- ✅ User: 1 definition în src/types/models.ts
- ✅ Order: 1 definition + variants
- ✅ Product: 1 definition + variants
- ✅ Category: 1 definition + variants
- ✅ Zero duplicate definitions în components

### G1.3: Organizare types/
- ✅ src/types/models.ts (core types)
- ✅ src/types/api.ts (API types)
- ✅ src/types/index.ts (re-exports)
- ✅ Import pattern: `import { UserSafe } from '@/types';`

---

## 📝 Quick Win: Fix Category Tree (30 minutes)

**Immediate fix pentru P0 critical bug:**

```bash
cd /workspaces/sanduta.art

# Fix categories/tree route
# File: src/app/api/categories/tree/route.ts
```

**Changes:**

```typescript
// Remove lines 21, 38-39 (any usage)
// Replace with:

import { Category } from '@prisma/client';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

const rootCategories: CategoryNode[] = [];

categories.forEach((category: Category) => {
  const node: CategoryNode = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: category._count.products,
  };
  rootCategories.push(node);
});
```

**Test:**
```bash
curl http://localhost:3000/api/categories/tree
```

**Commit:**
```bash
git add src/app/api/categories/tree/route.ts
git commit -m "fix: Remove 'any' usage in categories tree API (G1.1)"
git push origin main
```

---

## 🔗 Resources

### TypeScript Best Practices
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Prisma Type Safety](https://www.prisma.io/docs/concepts/components/prisma-client/type-safety)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### Prisma Types
- [Generated Types](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
- [Select & Include](https://www.prisma.io/docs/concepts/components/prisma-client/select-fields)
- [Type Utilities](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety)

### Related Reports
- [RAPORT_F2_FORMS_VALIDATION.md](RAPORT_F2_FORMS_VALIDATION.md) - Forms standardization
- [RAPORT_F1_UI_COMPONENTS.md](RAPORT_F1_UI_COMPONENTS.md) - UI component types

---

## ✅ Concluzie

### Status Actual
- ❌ **G1.1:** 233 utilizări `any` (prea multe)
- ❌ **G1.2:** 26 duplicate type definitions
- ⚠️  **G1.3:** Doar 2 fișiere în types/

### Impact

**Probleme Actuale:**
- Type safety compromise (any usage)
- Code duplication (26 duplicate types)
- Maintenance overhead (fiecare file își definește propriile types)
- Inconsistency (createdAt: string vs Date, role: string vs UserRole)

**După Refactoring:**
- ✅ Type safety 100% (zero any în P0/P1)
- ✅ Single source of truth (Prisma types)
- ✅ Zero duplicates (centralized în types/)
- ✅ Consistency (toate folosesc aceleași types)

### Recomandări

1. **Prioritate Maximă:** Fix category tree API (30 min)
2. **Această Săptămână:** Create type files + refactor User/Order (13-17h)
3. **Următoarea Săptămână:** Refactor Product/Category + reports (8-11h)
4. **Next Sprint:** Cleanup theme system (4-8h)

### Next Steps

```bash
# 1. Quick win (NOW - 30 min)
# Fix categories/tree/route.ts

# 2. Create types (TODAY - 2-3h)
src/types/models.ts
src/types/api.ts
src/types/index.ts

# 3. Refactor User types (THIS WEEK - 2-3h)
# Replace 5 duplicate definitions

# 4. Refactor Order types (THIS WEEK - 3-4h)
# Replace 8 duplicate definitions

# 5. Testing (THIS WEEK - 2-3h)
npm run type-check
npm test
```

---

**Data raport:** 2026-01-20  
**Autor:** GitHub Copilot  
**Status:** ⚠️ Necesită Refactoring Urgent
