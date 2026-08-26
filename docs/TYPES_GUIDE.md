# TypeScript Patterns Guide - sanduta.art

**Versiune:** 1.0.0  
**Data:** 2026-01-21  
**Autor:** Development Team

Ghid complet pentru pattern-urile TypeScript utilizate în proiectul sanduta.art. Acest document acoperă toate tipurile centralizate din `src/types/` și best practices pentru utilizarea lor.

---

## 📚 Cuprins

- [1. Structura Types](#1-structura-types)
- [2. Modele Prisma](#2-modele-prisma)
- [3. API Responses](#3-api-responses)
- [4. Pagination](#4-pagination)
- [5. Enums](#5-enums)
- [6. Recursive Types](#6-recursive-types)
- [7. Reports](#7-reports)
- [8. Theme Types](#8-theme-types)
- [9. Best Practices](#9-best-practices)
- [10. Exemple Practice](#10-exemple-practice)

---

## 1. Structura Types

### 📁 Organizare

```
src/types/
├── models.ts              # Modele Prisma + extensii
├── api.ts                 # Request/Response API
├── pagination.ts          # Paginare (offset, cursor, standard)
├── reports.ts             # Rapoarte și export
├── theme.ts               # Theme system (index)
├── theme-branding.ts      # Logo, social, contact
├── theme-colors.ts        # Paleta de culori
├── theme-typography.ts    # Fonts și text styles
├── theme-layout.ts        # Header, footer, spacing
├── theme-components.ts    # UI component styles
├── theme-homepage.ts      # Homepage builder
└── README.md              # Documentație types
```

### 🎯 Principii de Design

1. **Single Source of Truth** - Fiecare tip definit o singură dată
2. **Re-export Pattern** - Module re-exportă tipuri din models.ts
3. **Type Safety** - Zero `any`, zero cast-uri periculoase
4. **Documentation** - JSDoc pentru toate tipurile publice
5. **Consistency** - Același naming pattern peste tot

---

## 2. Modele Prisma

### 📦 Import Pattern

**Toate modelele Prisma se importă din `@/types/models`:**

```typescript
import { User, Order, Product, Category } from '@/types/models';
```

**NU importa direct din `@prisma/client` în codul aplicației!**

### 🏗️ Model Hierarchy

#### Base Models (Prisma Generated)

```typescript
// Re-exported din @prisma/client
export type {
  User,
  Order,
  OrderItem,
  Product,
  Category,
  Customer,
  Material,
  ProductionJob,
  // ... toate modelele Prisma
};
```

#### Model Extensions (cu relații)

```typescript
// User cu relații incluse
export interface UserWithRelations extends User {
  orders?: Order[];
  productionJobs?: ProductionJob[];
  assignedOrders?: Order[];
  _count?: {
    orders: number;
    productionJobs: number;
    assignedOrders: number;
  };
}

// Order cu toate relațiile
export interface OrderWithRelations extends Order {
  customer?: Customer | null;
  orderItems?: OrderItemWithProduct[];
  payment?: Payment | null;
  delivery?: Delivery | null;
  timeline?: OrderTimeline[];
  assignedTo?: User | null;
  productionJobs?: ProductionJob[];
  files?: OrderFile[];
  _count?: {
    orderItems: number;
    files: number;
  };
}

// Product cu relații
export interface ProductWithRelations extends Product {
  category: Category | null;
  variants?: ProductVariant[];
  _count?: {
    variants: number;
    orderItems: number;
  };
}
```

### 🔄 Type Guards

```typescript
// Verifică dacă order are relații încărcate
export function isOrderWithRelations(
  order: Order | OrderWithRelations
): order is OrderWithRelations {
  return 'orderItems' in order || 'customer' in order;
}

// Verifică dacă order are items
export function hasOrderItems(
  order: Order | OrderWithRelations
): order is OrderWithRelations {
  return 'orderItems' in order && Array.isArray(order.orderItems);
}

// Utilizare:
if (hasOrderItems(order)) {
  order.orderItems.forEach(item => {
    // TypeScript știe că orderItems există
  });
}
```

### 📊 Helper Types

```typescript
// OrderFile - pentru fișiere atașate
export interface OrderFile {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

// Address - pentru adrese
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// ContactInfo - pentru informații contact
export interface ContactInfo {
  email: string;
  phone?: string;
  alternativePhone?: string;
}
```

### 💡 Exemple de Utilizare

#### Fetch cu relații

```typescript
import { OrderWithRelations } from '@/types/models';

// API Route
export async function GET() {
  const orders: OrderWithRelations[] = await prisma.order.findMany({
    include: {
      customer: true,
      orderItems: {
        include: {
          product: true,
        },
      },
      assignedTo: true,
      _count: {
        select: { orderItems: true },
      },
    },
  });

  return NextResponse.json(orders);
}
```

#### Type Guard Usage

```typescript
import { Order, OrderWithRelations, hasOrderItems } from '@/types/models';

function calculateTotal(order: Order | OrderWithRelations): number {
  if (hasOrderItems(order)) {
    return order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  
  // Fallback - nu avem items încărcate
  return order.totalPrice || 0;
}
```

---

## 3. API Responses

### 🌐 Generic Response Pattern

#### ApiResponse<T>

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Utilizare:
const response: ApiResponse<Order[]> = await fetch('/api/orders').then(r => r.json());

if (response.success && response.data) {
  response.data.forEach(order => {
    // TypeScript știe că order este Order
  });
}
```

#### ApiError

```typescript
export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Utilizare în API route:
return NextResponse.json(
  {
    error: 'Order not found',
    message: 'Comanda cu ID-ul specificat nu există',
    statusCode: 404,
    timestamp: new Date().toISOString(),
  } satisfies ApiError,
  { status: 404 }
);
```

#### ServiceResult<T>

```typescript
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Utilizare în service layer:
async function createOrder(data: CreateOrderRequest): Promise<ServiceResult<Order>> {
  try {
    const order = await prisma.order.create({ data });
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: 'Failed to create order' };
  }
}
```

### 📥 Request Types

#### CreateOrderRequest

```typescript
export interface CreateOrderRequest {
  customerId?: string;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  source: 'ONLINE' | 'OFFLINE';
  channel: 'WEB' | 'PHONE' | 'WALK_IN' | 'EMAIL';
  items: CreateOrderItemRequest[];
  deliveryAddress?: string;
  deliveryCity?: string;
  notes?: string;
  dueDate?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
  customDescription?: string;
}

// Utilizare:
const orderData: CreateOrderRequest = {
  customerEmail: 'client@example.com',
  customerName: 'Ion Popescu',
  source: 'ONLINE',
  channel: 'WEB',
  items: [
    {
      productId: 'prod_123',
      quantity: 2,
      price: 99.99,
    },
  ],
};

const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData),
});
```

#### UpdateOrderRequest

```typescript
export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  assignedToUserId?: string;
  notes?: string;
  dueDate?: string;
}

// Partial update pattern:
const update: UpdateOrderRequest = {
  status: 'IN_PRODUCTION',
  assignedToUserId: 'user_456',
};
```

### 📤 Response Types

#### Pagination Responses (vezi secțiunea Pagination)

```typescript
// Lista paginată
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Utilizare:
const response: PaginatedResponse<Order> = await fetch('/api/orders?page=1&limit=20')
  .then(r => r.json());

console.log(`Showing ${response.items.length} of ${response.pagination.totalItems}`);
```

---

## 4. Pagination

### 📖 3 Stiluri de Paginare

#### 1. Standard Pagination (Offset + Page)

**Best for:** Liste generale, tabele admin

```typescript
export interface PaginationParams {
  page: number;       // 1-indexed
  limit: number;      // Items per page
  sortBy?: string;    // Field name
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Utilizare în API route:
export async function GET(request: NextRequest) {
  const params = parsePaginationParams(request); // Helper function
  
  const [items, totalCount] = await Promise.all([
    prisma.order.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' },
    }),
    prisma.order.count(),
  ]);

  const response: PaginatedResponse<Order> = {
    items,
    pagination: {
      currentPage: params.page,
      totalPages: Math.ceil(totalCount / params.limit),
      totalItems: totalCount,
      itemsPerPage: params.limit,
      hasNextPage: params.page * params.limit < totalCount,
      hasPreviousPage: params.page > 1,
    },
  };

  return NextResponse.json(response);
}
```

#### 2. Cursor Pagination

**Best for:** Infinite scroll, real-time feeds

```typescript
export interface CursorPaginationParams {
  cursor?: string;           // ID sau timestamp
  limit: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

// Utilizare:
const response: CursorPaginatedResponse<Order> = await fetch(
  '/api/orders?cursor=order_123&limit=20'
).then(r => r.json());

// Load more:
if (response.hasMore && response.nextCursor) {
  const nextPage = await fetch(
    `/api/orders?cursor=${response.nextCursor}&limit=20`
  ).then(r => r.json());
}
```

#### 3. Offset Pagination (Raw)

**Best for:** Low-level queries, custom implementations

```typescript
export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

export interface OffsetPaginatedResponse<T> {
  items: T[];
  offset: number;
  limit: number;
  totalCount: number;
}

// Utilizare:
const items = await prisma.order.findMany({
  skip: 40,  // Skip first 40
  take: 20,  // Get next 20
});
```

### 🔧 Pagination Helpers

```typescript
// Parse URL params
export function parsePaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10))),
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

// Calculate pagination meta
export function calculatePaginationMeta(
  currentPage: number,
  limit: number,
  totalCount: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage,
    totalPages,
    totalItems: totalCount,
    itemsPerPage: limit,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

// Convert to Prisma params
export function toPrismaParams(params: PaginationParams) {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
    orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : undefined,
  };
}
```

### 📊 Pagination cu Filters

```typescript
export interface PaginatedRequest<F = Record<string, unknown>> {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: F;
  search?: string;
}

export interface PaginatedResult<T, F = Record<string, unknown>> {
  items: T[];
  pagination: PaginationMeta;
  filters?: F;
  appliedFilters?: Partial<F>;
}

// Exemple de filters:
interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Utilizare:
const request: PaginatedRequest<OrderFilters> = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filters: {
    status: 'IN_PRODUCTION',
    paymentStatus: 'PAID',
    minAmount: 100,
  },
  search: 'Ion Popescu',
};
```

---

## 5. Enums

### 🏷️ Prisma Enums

**Toate enum-urile se importă din `@/types/models`:**

```typescript
import {
  UserRole,
  OrderStatus,
  OrderSource,
  OrderChannel,
  PaymentStatus,
  ProductionStatus,
  ProductionPriority,
  CustomerSource,
  NotificationType,
  ActivityType,
  ProductType,
} from '@/types/models';
```

### 👤 UserRole

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

// Usage:
const user: User = {
  role: UserRole.ADMIN, // ✅ Type-safe
};

// Role checking:
if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
  // Admin și Manager au acces
}
```

### 📦 OrderStatus

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PREPRODUCTION = 'IN_PREPRODUCTION',
  IN_DESIGN = 'IN_DESIGN',
  IN_PRODUCTION = 'IN_PRODUCTION',
  IN_PRINTING = 'IN_PRINTING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Labels pentru UI (din models.ts):
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'În așteptare',
  IN_PREPRODUCTION: 'În pre-producție',
  IN_DESIGN: 'În design',
  IN_PRODUCTION: 'În producție',
  IN_PRINTING: 'În print',
  QUALITY_CHECK: 'Control calitate',
  READY_FOR_DELIVERY: 'Gata pentru livrare',
  DELIVERED: 'Livrată',
  CANCELLED: 'Anulată',
};

// Usage în componente:
<Badge value={order.status}>
  {ORDER_STATUS_LABELS[order.status]}
</Badge>
```

### 💳 PaymentStatus

```typescript
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Neplatită',
  PAID: 'Platită',
  FAILED: 'Eșuată',
  REFUNDED: 'Rambursată',
};
```

### 🏭 ProductionStatus

```typescript
export enum ProductionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  PENDING: 'Planificată',
  IN_PROGRESS: 'În lucru',
  ON_HOLD: 'În așteptare',
  COMPLETED: 'Finalizată',
  CANCELED: 'Anulată',
};
```

### 🎨 Enum Utilities

```typescript
// Get all enum values
const allStatuses = Object.values(OrderStatus);
// ['PENDING', 'IN_PREPRODUCTION', ...]

// Check if value is valid enum
function isValidOrderStatus(value: string): value is OrderStatus {
  return Object.values(OrderStatus).includes(value as OrderStatus);
}

// Usage:
const statusFromUrl = searchParams.get('status');
if (statusFromUrl && isValidOrderStatus(statusFromUrl)) {
  // TypeScript știe că statusFromUrl este OrderStatus
  const label = ORDER_STATUS_LABELS[statusFromUrl];
}

// Enum to options pentru Select:
const statusOptions = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

<Select options={statusOptions} />
```

---

## 6. Recursive Types

### 🌲 Category Tree (Hierarchical Data)

#### CategoryTreeNode

**Full tree structure cu toate câmpurile:**

```typescript
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  featured: boolean;
  productCount: number;
  children: CategoryTreeNode[]; // ✅ Recursiv
  parentId?: string | null;
}

// Utilizare - build tree:
const categories = await prisma.category.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    parentId: true,
    _count: { select: { products: true } },
    // ... toate câmpurile
  },
});

const categoryMap = new Map<string, CategoryTreeNode>();
const rootCategories: CategoryTreeNode[] = [];

// Build map
categories.forEach(cat => {
  const node: CategoryTreeNode = {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    image: cat.image,
    color: cat.color,
    icon: cat.icon,
    order: cat.order,
    active: cat.active,
    featured: cat.featured,
    productCount: cat._count.products,
    parentId: cat.parentId,
    children: [], // ✅ Inițializat gol
  };
  categoryMap.set(cat.id, node);
});

// Build hierarchy
categories.forEach(cat => {
  const node = categoryMap.get(cat.id);
  if (!node) return;

  if (cat.parentId) {
    const parent = categoryMap.get(cat.parentId);
    if (parent) {
      parent.children.push(node); // ✅ Add to parent's children
    } else {
      rootCategories.push(node); // Orphan - treat as root
    }
  } else {
    rootCategories.push(node);
  }
});

// Now rootCategories este array de CategoryTreeNode cu children recursive
```

#### CategoryWithChildren

**Lightweight version pentru hooks și componente:**

```typescript
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]; // ✅ Recursiv, optional
}

// Utilizare în hook:
import { Category, CategoryWithChildren } from '@/types/models';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((data: Category[]) => {
        const tree = buildCategoryTree(data);
        setCategories(tree);
      });
  }, []);

  return { categories };
}

// Helper function:
function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const map = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### 🎯 Recursive Rendering

```typescript
// Component recursiv pentru navigare
interface CategoryMenuProps {
  categories: CategoryWithChildren[];
  level?: number;
}

function CategoryMenu({ categories, level = 0 }: CategoryMenuProps) {
  return (
    <ul className={`level-${level}`}>
      {categories.map(category => (
        <li key={category.id}>
          <Link href={`/produse/${category.slug}`}>
            {category.icon} {category.name}
          </Link>
          
          {/* ✅ Recursive rendering pentru children */}
          {category.children && category.children.length > 0 && (
            <CategoryMenu categories={category.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

// Usage:
<CategoryMenu categories={categories} />
```

### 🔍 Tree Traversal Utilities

```typescript
// Find category by ID in tree
function findCategoryById(
  categories: CategoryTreeNode[],
  id: string
): CategoryTreeNode | null {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    
    const found = findCategoryById(cat.children, id);
    if (found) return found;
  }
  return null;
}

// Get all parent IDs (breadcrumb)
function getCategoryPath(
  categories: CategoryTreeNode[],
  targetId: string,
  path: string[] = []
): string[] | null {
  for (const cat of categories) {
    if (cat.id === targetId) {
      return [...path, cat.id];
    }
    
    const found = getCategoryPath(cat.children, targetId, [...path, cat.id]);
    if (found) return found;
  }
  return null;
}

// Flatten tree to array
function flattenTree(categories: CategoryTreeNode[]): CategoryTreeNode[] {
  return categories.flatMap(cat => [cat, ...flattenTree(cat.children)]);
}

// Count total products (recursive)
function countTotalProducts(category: CategoryTreeNode): number {
  return category.productCount + 
    category.children.reduce((sum, child) => sum + countTotalProducts(child), 0);
}
```

### ✅ Type-Safe Tree Operations

```typescript
// Sort children recursively
function sortCategoryTree(categories: CategoryTreeNode[]): void {
  categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  categories.forEach(cat => sortCategoryTree(cat.children));
}

// Filter tree (keep only active)
function filterActiveCategories(
  categories: CategoryTreeNode[]
): CategoryTreeNode[] {
  return categories
    .filter(cat => cat.active)
    .map(cat => ({
      ...cat,
      children: filterActiveCategories(cat.children),
    }));
}

// Map tree (transform nodes)
function mapCategoryTree<T>(
  categories: CategoryTreeNode[],
  mapper: (cat: CategoryTreeNode) => T
): T[] {
  return categories.map(cat => mapper({
    ...cat,
    children: mapCategoryTree(cat.children, mapper) as any,
  }));
}
```

---

## 7. Reports

### 📊 Report Types

```typescript
export type ReportType =
  | 'sales'       // Vânzări și revenue
  | 'orders'      // Comenzi detaliate
  | 'products'    // Top produse
  | 'customers'   // Clienți și segmentare
  | 'materials'   // Consum materiale
  | 'inventory'   // Stoc și disponibilitate
  | 'financial'   // Financiar complet
  | 'production'  // Producție și eficiență
  | 'performance';// KPIs și performance

// Date range presets
export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';
```

### 📈 Sales Report

```typescript
export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProfit: number;
  profitMargin: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByPaymentStatus: Record<PaymentStatus, number>;
  dailySales: DailySalesData[];
  topProducts: TopProductData[];
  topCustomers: TopCustomerData[];
}

export interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

// Utilizare:
const report: SalesReportData = await fetch('/api/admin/reports/sales?period=last30days')
  .then(r => r.json());

console.log(`Total revenue: ${report.totalRevenue} RON`);
console.log(`Orders: ${report.totalOrders}`);
console.log(`AOV: ${report.averageOrderValue} RON`);
```

### 📦 Export

```typescript
export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
}

export interface ExportRequest {
  reportType: ReportType;
  dateRange: DateRangeParams;
  filters?: ReportFilters;
  options?: ExportOptions;
}

export interface ExportResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// Utilizare:
const exportRequest: ExportRequest = {
  reportType: 'sales',
  dateRange: {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  },
  filters: {
    status: 'DELIVERED',
    paymentStatus: 'PAID',
  },
  options: {
    format: 'xlsx',
    filename: 'sales-january-2026',
    includeHeaders: true,
  },
};

const result: ExportResponse = await fetch('/api/admin/reports/export', {
  method: 'POST',
  body: JSON.stringify(exportRequest),
}).then(r => r.json());

if (result.success && result.url) {
  window.open(result.url, '_blank');
}
```

---

## 8. Theme Types

### 🎨 Theme System

Theme-ul este modular, split în multiple fișiere:

```typescript
// Main export - src/types/theme.ts
export * from './theme-branding';
export * from './theme-colors';
export * from './theme-typography';
export * from './theme-layout';
export * from './theme-components';
export * from './theme-homepage';

// Usage - import tot:
import { ThemeConfig } from '@/types/theme';

// Sau import specific:
import { ThemeColors } from '@/types/theme-colors';
import { ThemeTypography } from '@/types/theme-typography';
```

#### Theme Branding

```typescript
export interface ThemeBranding {
  logo: {
    light: string;
    dark: string;
    alt: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  contact: {
    email: string;
    phone: string;
    address?: string;
  };
}
```

#### Theme Colors

```typescript
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    main: string;
    secondary: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
```

#### Theme Components

```typescript
export interface ComponentStyles {
  button: ButtonStyles;
  card: CardStyles;
  input: InputStyles;
  badge: BadgeStyles;
}

export interface ButtonStyles {
  primary: string;
  secondary: string;
  ghost: string;
  danger: string;
  borderRadius: string;
}
```

---

## 9. Best Practices

### ✅ DO

1. **Import din `@/types/models`**, nu din `@prisma/client`:
   ```typescript
   // ✅ CORECT
   import { User, Order, OrderStatus } from '@/types/models';
   
   // ❌ GREȘIT
   import { User, Order } from '@prisma/client';
   ```

2. **Folosește Type Guards** pentru verificări sigure:
   ```typescript
   // ✅ CORECT
   if (hasOrderItems(order)) {
     order.orderItems.forEach(/* ... */);
   }
   
   // ❌ GREȘIT
   if ((order as any).orderItems) { /* ... */ }
   ```

3. **Adaugă JSDoc** pentru tipuri publice:
   ```typescript
   /**
    * Category Tree Node - Recursive structure for hierarchical categories
    * Used by /api/categories/tree endpoint
    */
   export interface CategoryTreeNode {
     // ...
   }
   ```

4. **Folosește `satisfies`** pentru type checking fără widening:
   ```typescript
   const config = {
     timeout: 5000,
     retries: 3,
   } satisfies ApiConfig;
   ```

5. **Validează cu Zod** în API routes:
   ```typescript
   import { categoryTreeResponseSchema } from '@/lib/validations/category';
   
   const validated = categoryTreeResponseSchema.parse(response);
   return NextResponse.json(validated);
   ```

### ❌ DON'T

1. **NU folosi `any`**:
   ```typescript
   // ❌ GREȘIT
   const data: any = await fetch('/api/orders');
   
   // ✅ CORECT
   const data: ApiResponse<Order[]> = await fetch('/api/orders').then(r => r.json());
   ```

2. **NU duplica type definitions**:
   ```typescript
   // ❌ GREȘIT - tip local
   interface User {
     id: string;
     email: string;
   }
   
   // ✅ CORECT - import
   import { User } from '@/types/models';
   ```

3. **NU face cast-uri nesigure**:
   ```typescript
   // ❌ GREȘIT
   const order = data as Order;
   
   // ✅ CORECT - validare
   if (isValidOrder(data)) {
     // TypeScript știe că data este Order
   }
   ```

4. **NU amesteca Prisma include și select**:
   ```typescript
   // ❌ GREȘIT
   const order = await prisma.order.findUnique({
     include: { customer: true },
     select: { id: true },  // Conflict!
   });
   
   // ✅ CORECT - alege unul
   const order = await prisma.order.findUnique({
     include: { customer: true },
   });
   ```

---

## 10. Exemple Practice

### 🎯 Exemplu 1: Order List cu Pagination

```typescript
// API Route - src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderWithRelations, OrderStatus } from '@/types/models';
import { PaginatedResponse, PaginationMeta } from '@/types/pagination';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const status = searchParams.get('status') as OrderStatus | null;

  const where = status ? { status } : {};

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: true,
        orderItems: {
          include: { product: true },
        },
        assignedTo: true,
        _count: { select: { orderItems: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  const response: PaginatedResponse<OrderWithRelations> = {
    items: orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1,
    },
  };

  return NextResponse.json(response);
}
```

### 🎯 Exemplu 2: Category Tree Navigation

```typescript
// Component - src/components/CategoriesMenu.tsx
import { CategoryWithChildren } from '@/types/models';
import Link from 'next/link';

interface CategoriesMenuProps {
  categories: CategoryWithChildren[];
  level?: number;
}

export function CategoriesMenu({ categories, level = 0 }: CategoriesMenuProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <ul className={`menu-level-${level}`}>
      {categories.map((category) => (
        <li key={category.id} className="menu-item">
          <Link 
            href={`/produse/${category.slug}`}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">{category.icon}</span>
            <span>{category.name}</span>
          </Link>

          {/* Recursive rendering */}
          {category.children && category.children.length > 0 && (
            <CategoriesMenu 
              categories={category.children} 
              level={level + 1} 
            />
          )}
        </li>
      ))}
    </ul>
  );
}

// Hook pentru fetch
export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((data: Category[]) => {
        const tree = buildCategoryTree(data);
        setCategories(tree);
      })
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

// Helper
function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const map = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  categories.forEach(cat => map.set(cat.id, { ...cat, children: [] }));
  categories.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parentId) {
      map.get(cat.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### 🎯 Exemplu 3: Sales Report

```typescript
// API Route - src/app/api/admin/reports/sales/route.ts
import { SalesReportData, DailySalesData } from '@/types/reports';
import { OrderStatus, PaymentStatus } from '@/types/models';

export async function GET(req: NextRequest) {
  const startDate = new Date(searchParams.get('startDate') || '');
  const endDate = new Date(searchParams.get('endDate') || '');

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      orderItems: { include: { product: true } },
      customer: true,
    },
  });

  // Calculate daily sales
  const dailySalesMap = new Map<string, DailySalesData>();
  
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    const existing = dailySalesMap.get(date) || {
      date,
      revenue: 0,
      orders: 0,
      averageOrderValue: 0,
    };

    existing.revenue += order.totalPrice;
    existing.orders += 1;
    existing.averageOrderValue = existing.revenue / existing.orders;

    dailySalesMap.set(date, existing);
  });

  const report: SalesReportData = {
    totalRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
    totalOrders: orders.length,
    averageOrderValue: orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length,
    totalProfit: /* calculate */,
    profitMargin: /* calculate */,
    ordersByStatus: /* group by status */,
    revenueByPaymentStatus: /* group by payment */,
    dailySales: Array.from(dailySalesMap.values()),
    topProducts: /* calculate */,
    topCustomers: /* calculate */,
  };

  return NextResponse.json(report);
}
```

### 🎯 Exemplu 4: Create Order cu Validation

```typescript
// API Route - src/app/api/orders/route.ts
import { CreateOrderRequest } from '@/types/api';
import { validateCreateOrder } from '@/lib/validations/order';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validare cu Zod
  const validation = validateCreateOrder(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: validation.errors },
      { status: 400 }
    );
  }

  const data: CreateOrderRequest = validation.data;

  // Create order
  const order = await prisma.order.create({
    data: {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      source: data.source,
      channel: data.channel,
      status: 'PENDING',
      orderItems: {
        create: data.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      orderItems: { include: { product: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
```

---

## 📚 Referințe

### Documentație

- **src/types/README.md** - Ghid complet types structure
- **G1_1_TYPES_STRUCTURE_RAPORT.md** - Raport creare structură
- **G1_3_UNIFICARE_TIPURI_RAPORT.md** - Raport eliminare duplicate
- **G1_4_CATEGORY_TREE_API_RAPORT.md** - Raport recursive types

### Fișiere Cheie

- **src/types/models.ts** - Modele Prisma + extensii
- **src/types/api.ts** - Request/Response types
- **src/types/pagination.ts** - Pagination patterns
- **src/types/reports.ts** - Report types
- **src/lib/validations/category.ts** - Zod schemas

### Pattern-uri Externe

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Zod Documentation](https://zod.dev/)

---

## 🎓 Concluzie

Acest ghid acoperă toate pattern-urile TypeScript utilizate în sanduta.art. Respectarea acestor pattern-uri asigură:

- ✅ **Type Safety** - Erori la compile time, nu runtime
- ✅ **Consistency** - Același stil în tot codebase-ul
- ✅ **Maintainability** - Ușor de modificat și extins
- ✅ **Developer Experience** - IntelliSense complet
- ✅ **Documentation** - Tipurile sunt și documentație

**Pentru întrebări sau clarificări, consultați `src/types/README.md` sau echipa de development.**

---

_Document creat: 2026-01-21_  
_Versiune: 1.0.0_  
_Proiect: sanduta.art_
