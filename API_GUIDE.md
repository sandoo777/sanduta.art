# API Guide — sanduta.art

**Versiune:** 1.0
**Data:** 2026-01-21
**Status:** ✅ Complet

---

## 📋 Cuprins

1. [Overview](#overview)
2. [API Client Architecture](#api-client-architecture)
3. [Hooks Pattern](#hooks-pattern)
4. [Caching Strategy](#caching-strategy)
5. [Pagination](#pagination)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## 🎯 Overview

Acest ghid documentează pattern-urile și convențiile pentru lucrul cu API-uri în sanduta.art. Proiectul folosește o arhitectură centralizată cu:

- **API Client** centralizat (`lib/api/`)
- **Custom hooks** pentru data fetching (`modules/*/use*.ts`)
- **Error handling** consistent
- **Caching** la nivel de endpoint
- **Type-safe** responses cu TypeScript

### Principii de Design

1. **DRY (Don't Repeat Yourself)** — eliminare duplicare prin funcții centralizate
2. **Type Safety** — toate API call-urile sunt type-safe cu TypeScript
3. **Error Handling** — strategie consistentă pentru toate erorile
4. **User Feedback** — toast notifications pentru success/error
5. **Loading States** — LoadingState component pentru UX consistent

---

## 🏗️ API Client Architecture

### 1. Structura Fișierelor

```
src/lib/api/
├── client.ts        # APIClient class, ApiResponse, ApiError
├── endpoints.ts     # 39 funcții pentru endpoint-uri comune
└── index.ts         # Exports centralizate
```

### 2. API Client Class

**Location:** `src/lib/api/client.ts`

#### Features

- ✅ Request/response interceptors
- ✅ Automatic error handling
- ✅ Timeout support (default 30s)
- ✅ Query params builder
- ✅ Type-safe responses
- ✅ Retry logic (optional)

#### Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const response = await apiClient.get<User[]>('/api/users');

// POST request
const newUser = await apiClient.post<User>('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// With query params
const filtered = await apiClient.get<Product[]>('/api/products', {
  params: { category: 'banners', active: true }
});

// With timeout
const data = await apiClient.get('/api/slow-endpoint', {
  timeout: 60000 // 60 seconds
});
```

#### ApiResponse Interface

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Toate API call-urile returnează `ApiResponse<T>` pentru consistență:

```typescript
const response = await fetchUsers();

if (response.success && response.data) {
  setUsers(response.data);
} else {
  console.error(response.error);
}
```

### 3. Centralized Endpoints

**Location:** `src/lib/api/endpoints.ts`

39 funcții pentru cele mai folosite endpoint-uri, organizate pe domenii:

#### Users (5 funcții)
```typescript
fetchUsers(filters?: UserFilters)
fetchUserById(userId: string)
updateUser(userId: string, data: UserUpdateData)
updateUserRole(userId: string, role: UserRole)
deleteUser(userId: string)
```

#### Orders (6 funcții)
```typescript
fetchOrders(filters?: OrderFilters)
fetchOrderById(orderId: string)
updateOrderStatus(orderId: string, status: OrderStatus)
assignOrderToOperator(orderId: string, operatorId: string)
createOrder(data: CreateOrderData)
deleteOrder(orderId: string)
```

#### Products (8 funcții)
```typescript
fetchProducts(filters?: ProductFilters)
fetchProductById(productId: string)
createProduct(data: CreateProductData)
updateProduct(productId: string, data: UpdateProductData)
deleteProduct(productId: string)
toggleProductStatus(productId: string, active: boolean)
duplicateProduct(productId: string)
searchProducts(query: string)
```

#### Categories (4 funcții)
```typescript
fetchCategories()
fetchCategoryById(categoryId: string)
createCategory(data: CreateCategoryData)
updateCategory(categoryId: string, data: UpdateCategoryData)
```

#### Theme (5 funcții)
```typescript
fetchTheme()
updateTheme(data: ThemeUpdateData)
updateColors(colors: ColorPalette)
updateTypography(typography: Typography)
publishTheme()
```

#### Stats & Reports (11 funcții)
```typescript
fetchDashboardStats()
fetchSalesReport(period: Period)
fetchProductsReport()
fetchCustomersReport()
fetchOperatorsReport()
fetchMaterialsReport()
fetchRevenueByProduct()
fetchOrdersByStatus()
fetchTopCustomers(limit: number)
fetchOperatorPerformance()
fetchInventoryStatus()
```

#### Example Usage

```typescript
import { fetchUsers, updateUserRole } from '@/lib/api';

// În component sau hook
const loadUsers = async () => {
  const response = await fetchUsers({ role: 'ADMIN' });
  
  if (response.success) {
    setUsers(response.data);
  } else {
    toast.error(response.error);
  }
};

// Update role
const changeRole = async (userId: string) => {
  const response = await updateUserRole(userId, 'MANAGER');
  
  if (response.success) {
    toast.success('Rol actualizat cu succes');
    await loadUsers(); // Reload
  }
};
```

---

## 🎣 Hooks Pattern

### 1. Custom Hooks Structure

Toate modulele folosesc custom hooks pentru data fetching și state management.

**Pattern:** `src/modules/{domain}/use{Domain}.ts`

#### Hook Template

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Entity, CreateInput, UpdateInput, Filters } from './types';

export function useEntity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET ALL
  const getEntities = async (filters?: Filters): Promise<Entity[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/entities', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entities');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Eroare la încărcarea datelor: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // GET ONE
  const getEntity = async (id: string): Promise<Entity> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/entities/${id}`);
      if (!response.ok) throw new Error('Entity not found');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const createEntity = async (input: CreateInput): Promise<Entity> => {
    setLoading(true);
    try {
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const entity = await response.json();
      toast.success('Entitate creată cu succes');
      return entity;
    } catch (err) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE
  const updateEntity = async (
    id: string, 
    input: UpdateInput
  ): Promise<Entity> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/entities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Update failed');

      const entity = await response.json();
      toast.success('Actualizat cu succes');
      return entity;
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const deleteEntity = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/entities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Șters cu succes');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getEntities,
    getEntity,
    createEntity,
    updateEntity,
    deleteEntity,
  };
}
```

### 2. Hook Usage in Components

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/modules/products/useProducts';
import { LoadingState, ErrorState } from '@/components/ui';

export default function ProductsPage() {
  const { loading, error, getProducts, deleteProduct } = useProducts();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sigur ștergi?')) {
      await deleteProduct(id);
      await loadProducts(); // Refresh list
    }
  };

  if (loading) return <LoadingState text="Se încarcă produsele..." />;
  if (error) return <ErrorState message={error} retry={loadProducts} />;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          {product.name}
          <button onClick={() => handleDelete(product.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Available Hooks

**Location:** `src/modules/*/use*.ts`

#### Production Hooks
- `useProducts()` — CRUD produse
- `useProductBuilder()` — Constructor produse
- `useCustomers()` — Gestionare clienți
- `useProduction()` — Joburi producție
- `useFinishing()` — Operații finisare
- `useMachines()` — Echipamente

#### Business Logic
- `useOrders()` — Gestionare comenzi
- `useCart()` — Coș cumpărături
- `useCheckout()` — Proces checkout
- `useInvoices()` — Facturare

#### Admin & Reports
- `useReports()` — Rapoarte admin
- `useAnalytics()` — Analytics dashboard
- `useAdminSettings()` — Setări platformă
- `useMarketing()` — Campanii marketing

#### System & Security
- `useSecurityMonitoring()` — Monitorizare securitate
- `useBackupEngine()` — Backup management
- `useNotifications()` — Sistem notificări
- `useFeatureFlags()` — Feature toggles

---

## 💾 Caching Strategy

### 1. In-Memory Cache (Reports)

**Location:** `src/modules/reports/utils.ts`

#### Implementation

```typescript
// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > DEFAULT_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
```

#### Usage în API Routes

```typescript
// src/app/api/admin/reports/overview/route.ts
import { getCachedData, setCachedData } from '@/modules/reports/utils';

export async function GET(request: NextRequest) {
  const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  // CHECK CACHE (5 minutes TTL)
  const cacheKey = 'reports:overview';
  const cached = getCachedData<OverviewKPIs>(cacheKey);
  
  if (cached) {
    logger.info('API:Reports', 'Serving from cache', { cacheKey });
    return NextResponse.json(cached);
  }

  // FETCH FRESH DATA
  const data = await prisma.order.findMany({ /* ... */ });
  
  const result = {
    revenue: calculateRevenue(data),
    orders: data.length,
    // ...
  };

  // CACHE FOR 5 MINUTES
  setCachedData(cacheKey, result);

  return NextResponse.json(result);
}
```

### 2. HTTP Caching (Next.js)

#### Static Generation with Revalidation

```typescript
// src/app/api/products/route.ts

// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany({
    where: { active: true },
  });

  const response = NextResponse.json(products);
  
  // Cache-Control headers pentru CDN
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=7200'
  );

  return response;
}
```

**Explicație Headers:**
- `public` — poate fi cache-uit de orice (browser, CDN)
- `s-maxage=3600` — CDN servește din cache 1 oră
- `stale-while-revalidate=7200` — servește stale content 2 ore în timp ce revalidează

### 3. Cache Invalidation

#### Manual Invalidation

```typescript
import { clearCache } from '@/modules/reports/utils';

// După actualizare
export async function POST(request: NextRequest) {
  // ... create order
  
  // Invalidate cache-ul de rapoarte
  clearCache('reports:overview');
  clearCache('reports:sales');
  
  return NextResponse.json(order);
}
```

#### Next.js revalidatePath/revalidateTag

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const product = await prisma.product.create({ /* ... */ });
  
  // Revalidate specific path
  revalidatePath('/products');
  revalidatePath('/admin/products');
  
  // Sau cu tags
  revalidateTag('products');
  
  return NextResponse.json(product);
}
```

### 4. Client-Side Caching (React State)

```typescript
'use client';

import { useState, useEffect } from 'react';

// Cache în component state
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 60000; // 1 minut

  const loadProducts = async (force = false) => {
    const now = Date.now();
    const isCacheValid = now - lastFetch < CACHE_DURATION;

    if (!force && isCacheValid && products.length > 0) {
      console.log('Using cached products');
      return;
    }

    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
    setLastFetch(now);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <button onClick={() => loadProducts(true)}>
        Force Refresh
      </button>
      {/* ... */}
    </div>
  );
}
```

### 5. Cache Keys Convention

**Format:** `{domain}:{resource}:{id?}`

```typescript
// Reports
'reports:overview'
'reports:sales'
'reports:products'

// Specific entity
'product:123'
'order:456'
'user:789'

// With filters
'products:category:banners'
'orders:status:pending'
```

---

## 📄 Pagination

### 1. Backend Pagination

#### Prisma Implementation

```typescript
// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  // Parse query params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (status) {
    where.status = status;
  }

  // Parallel queries pentru performance
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true }
        },
        payment: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
}
```

### 2. Frontend Pagination Hook

```typescript
// src/hooks/usePagination.ts
import { useState } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePagination(initialLimit = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.page - 1);
    }
  };

  const setLimit = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const updatePagination = (data: Partial<PaginationState>) => {
    setPagination(prev => ({ ...prev, ...data }));
  };

  return {
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    updatePagination,
  };
}
```

### 3. Pagination Component Usage

```typescript
'use client';

import { useState, useEffect } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/Pagination';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const { pagination, goToPage, setLimit, updatePagination } = usePagination(20);

  useEffect(() => {
    loadOrders();
  }, [pagination.page, pagination.limit]);

  const loadOrders = async () => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });

    const response = await fetch(`/api/admin/orders?${params}`);
    const data = await response.json();

    setOrders(data.orders);
    updatePagination(data.pagination);
  };

  return (
    <div>
      {/* Orders list */}
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}

      {/* Pagination controls */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={goToPage}
      />

      {/* Page size selector */}
      <select 
        value={pagination.limit} 
        onChange={(e) => setLimit(Number(e.target.value))}
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
      </select>
    </div>
  );
}
```

### 4. Cursor-Based Pagination (Alternative)

Pentru datasets mari cu scroll infinit:

```typescript
// Backend
export async function GET(request: NextRequest) {
  const cursor = searchParams.get('cursor'); // ID ultimului item
  const limit = 20;

  const orders = await prisma.order.findMany({
    take: limit + 1, // +1 pentru a detecta hasMore
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip cursor item
    }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = orders.length > limit;
  const items = hasMore ? orders.slice(0, -1) : orders;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({
    items,
    nextCursor,
    hasMore,
  });
}

// Frontend cu Infinite Scroll
const [orders, setOrders] = useState([]);
const [nextCursor, setNextCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const params = new URLSearchParams();
  if (nextCursor) params.set('cursor', nextCursor);

  const response = await fetch(`/api/orders?${params}`);
  const data = await response.json();

  setOrders(prev => [...prev, ...data.items]);
  setNextCursor(data.nextCursor);
  setHasMore(data.hasMore);
};
```

---

## 🚨 Error Handling

### 1. API Error Class

**Location:** `src/lib/api/client.ts`

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage
throw new ApiError('User not found', 404, { userId: '123' });
```

### 2. Centralized Error Responses

**Location:** `src/lib/logger.ts`

```typescript
import { NextResponse } from 'next/server';

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

// Usage în API routes
if (!user) {
  return createErrorResponse('User not found', 404, { userId });
}
```

### 3. Error Handling în API Routes

```typescript
// src/app/api/admin/products/[id]/route.ts
import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication & Authorization
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    // 2. Validate params
    const { id } = await params;
    if (!id) {
      return createErrorResponse('Product ID is required', 400);
    }

    // 3. Log request
    logger.info('API:Products', 'Fetching product', { 
      productId: id, 
      userId: user.id 
    });

    // 4. Fetch data
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    // 5. Handle not found
    if (!product) {
      return createErrorResponse('Product not found', 404, { id });
    }

    // 6. Success response
    return NextResponse.json(product);

  } catch (err) {
    // 7. Centralized error logging
    logApiError('API:Products', err);
    
    // 8. Generic error response
    return createErrorResponse(
      'Failed to fetch product',
      500,
      process.env.NODE_ENV === 'development' ? err.message : undefined
    );
  }
}
```

### 4. Error Handling în Hooks

```typescript
export function useProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProduct = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${id}`);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (err) {
      // Type guard pentru Error object
      const message = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';

      setError(message);
      
      // User feedback
      toast.error(`Eroare: ${message}`);
      
      // Re-throw pentru caller
      throw err;

    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getProduct };
}
```

### 5. Error Handling în Components

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/modules/products/useProducts';
import { ErrorState, LoadingState } from '@/components/ui';

export default function ProductDetailsPage({ params }) {
  const { getProduct, loading, error } = useProducts();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await getProduct(params.id);
      setProduct(data);
    } catch (err) {
      // Error already handled in hook (toast + setError)
      // Optionally handle specific errors here
      if (err.statusCode === 404) {
        router.push('/products');
      }
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState text="Se încarcă produsul..." />;
  }

  // Error state with retry
  if (error) {
    return (
      <ErrorState 
        message={error}
        retry={loadProduct}
      />
    );
  }

  // Success state
  return <div>{product?.name}</div>;
}
```

### 6. Validation Errors

```typescript
// src/lib/validation.ts
export interface ValidationError {
  field: string;
  message: string;
}

export function validateProduct(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.length < 3) {
    errors.push({
      field: 'name',
      message: 'Numele trebuie să aibă minim 3 caractere'
    });
  }

  if (!data.price || data.price <= 0) {
    errors.push({
      field: 'price',
      message: 'Prețul trebuie să fie mai mare ca 0'
    });
  }

  return errors;
}

// API route cu validare
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const errors = validateProduct(body);
  if (errors.length > 0) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Validation failed',
        validationErrors: errors 
      },
      { status: 400 }
    );
  }

  // ... create product
}
```

### 7. Error Status Codes

**Convention:**

| Code | Usage | Example |
|------|-------|---------|
| 400 | Bad Request — invalid input | Missing required field |
| 401 | Unauthorized — not authenticated | No session token |
| 403 | Forbidden — insufficient permissions | USER trying admin endpoint |
| 404 | Not Found — resource doesn't exist | Product ID not in DB |
| 409 | Conflict — duplicate resource | Email already exists |
| 422 | Unprocessable Entity — validation errors | Invalid email format |
| 429 | Too Many Requests — rate limiting | >100 requests/minute |
| 500 | Internal Server Error — unexpected | Database connection failed |
| 503 | Service Unavailable — temporary | Database maintenance |

---

## ✅ Best Practices

### 1. Always Use Type-Safe Responses

```typescript
// ❌ BAD
const data = await fetch('/api/users');
const users = await data.json(); // any type

// ✅ GOOD
import { fetchUsers } from '@/lib/api';
const response = await fetchUsers();
if (response.success) {
  const users: User[] = response.data; // typed!
}
```

### 2. Consistent Error Handling

```typescript
// ❌ BAD
try {
  const res = await fetch('/api/users');
  const users = await res.json();
  return users;
} catch (err) {
  console.log(err); // No user feedback
}

// ✅ GOOD
try {
  const response = await fetchUsers();
  if (!response.success) {
    toast.error(response.error);
    return [];
  }
  return response.data;
} catch (err) {
  toast.error('Eroare de conexiune');
  logger.error('FetchUsers', err);
  return [];
}
```

### 3. Use Custom Hooks pentru Reutilizare

```typescript
// ❌ BAD - Duplicate fetch în fiecare component
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers);
  }, []);
}

// ✅ GOOD - Custom hook reutilizabil
export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers();
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState retry={refetch} />;
  return <UsersList users={users} />;
}
```

### 4. Invalidate Cache După Mutații

```typescript
const createProduct = async (data: CreateProductInput) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.ok) {
    // ✅ GOOD - Clear cache
    clearCache('products');
    
    // Sau revalidate
    revalidatePath('/products');
    
    // Sau reload data
    await loadProducts();
  }
};
```

### 5. Loading States pentru UX

```typescript
// ❌ BAD - No loading feedback
const handleSubmit = async () => {
  await createProduct(data);
};

// ✅ GOOD - Show loading state
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await createProduct(data);
    toast.success('Produs creat!');
  } finally {
    setLoading(false);
  }
};

return (
  <Button loading={loading} onClick={handleSubmit}>
    Creează Produs
  </Button>
);
```

### 6. Debounce pentru Search

```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProductSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // 500ms

  useEffect(() => {
    if (debouncedSearch) {
      searchProducts(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input 
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Caută produse..."
    />
  );
}
```

### 7. Parallel Requests pentru Performance

```typescript
// ❌ BAD - Sequential (slow)
const users = await fetchUsers();
const products = await fetchProducts();
const orders = await fetchOrders();

// ✅ GOOD - Parallel (fast)
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders(),
]);
```

### 8. Proper TypeScript Types

```typescript
// ❌ BAD
const [data, setData] = useState<any>(null);

// ✅ GOOD
import type { Product } from '@/types/models';
const [product, setProduct] = useState<Product | null>(null);
```

---

## 📖 Examples

### Example 1: Complete CRUD Hook

```typescript
// src/modules/categories/useCategories.ts
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { fetchCategories, createCategory, updateCategory } from '@/lib/api';
import type { Category, CreateCategoryData, UpdateCategoryData } from '@/types';

export function useCategories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCategories = async (): Promise<Category[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCategories();
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Eroare la încărcarea categoriilor: ${message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNewCategory = async (data: CreateCategoryData) => {
    setLoading(true);
    try {
      const response = await createCategory(data);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success('Categorie creată cu succes');
      return response.data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingCategory = async (
    id: string, 
    data: UpdateCategoryData
  ) => {
    setLoading(true);
    try {
      const response = await updateCategory(id, data);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success('Categorie actualizată');
      return response.data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getCategories,
    createNewCategory,
    updateExistingCategory,
  };
}
```

### Example 2: Dashboard cu Caching

```typescript
// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchDashboardStats } from '@/lib/api';
import { LoadingState, ErrorState } from '@/components/ui';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    loadStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async (force = false) => {
    // Use cached data if fresh (< 2 min old)
    const now = Date.now();
    const isFresh = now - lastFetch < 2 * 60 * 1000;

    if (!force && isFresh && stats) {
      console.log('Using cached stats');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchDashboardStats();
      
      if (response.success) {
        setStats(response.data);
        setLastFetch(now);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return <LoadingState text="Se încarcă dashboard-ul..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={() => loadStats(true)} />;
  }

  return (
    <div>
      <button onClick={() => loadStats(true)}>Refresh</button>
      
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Vânzări" value={stats.totalSales} />
        <StatCard title="Comenzi" value={stats.totalOrders} />
        <StatCard title="Produse" value={stats.totalProducts} />
        <StatCard title="Clienți" value={stats.totalCustomers} />
      </div>
    </div>
  );
}
```

### Example 3: Paginated List cu Search

```typescript
// src/app/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { LoadingState } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { pagination, goToPage, updatePagination } = usePagination(20);

  useEffect(() => {
    loadCustomers();
  }, [pagination.page, pagination.limit, debouncedSearch]);

  const loadCustomers = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      setCustomers(data.customers);
      updatePagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Caută clienți..."
        className="mb-4 p-2 border rounded"
      />

      {/* List */}
      {loading ? (
        <LoadingState text="Se încarcă clienții..." />
      ) : (
        <>
          <div className="space-y-2">
            {customers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
          />

          <div className="text-sm text-gray-500">
            Afișând {customers.length} din {pagination.total} clienți
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 🎓 Summary

### Key Takeaways

1. **Use Centralized API Client** — `lib/api/client.ts` pentru toate request-urile
2. **Custom Hooks** — Encapsulează logica de data fetching în hooks reutilizabile
3. **Type Safety** — Folosește `ApiResponse<T>` pentru toate API call-urile
4. **Caching** — In-memory cache pentru rapoarte, HTTP cache pentru pagini statice
5. **Pagination** — Offset-based pentru dashboard-uri, cursor-based pentru feeds
6. **Error Handling** — Consistent în toate layerele (API → Hook → Component)
7. **Loading States** — `LoadingState` component pentru UX uniform
8. **Toast Notifications** — Feedback imediat pentru user

### Quick Reference

```typescript
// Import centralizat
import { 
  fetchUsers, 
  fetchProducts, 
  createOrder 
} from '@/lib/api';

// Custom hook
const { loading, error, getProducts } = useProducts();

// Caching
const cached = getCachedData('products');
if (cached) return cached;

// Pagination
const { pagination, goToPage } = usePagination(20);

// Error handling
try {
  const response = await fetchUsers();
  if (!response.success) {
    toast.error(response.error);
  }
} catch (err) {
  logApiError('FetchUsers', err);
}
```

---

**Ultima actualizare:** 2026-01-21
**Versiune:** 1.0
**Autor:** GitHub Copilot pentru sanduta.art
