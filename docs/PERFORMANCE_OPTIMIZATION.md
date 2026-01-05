# Ghid de Optimizare Performanță - Sanduta.Art

## ✅ Implementat

### 1. Caching System
- **In-memory cache** cu TTL pentru rapoarte și dashboard (`src/lib/cache.ts`)
- Cache keys standardizate pentru consistență
- TTL configurat: SHORT (60s), MEDIUM (5m), LONG (15m), VERY_LONG (1h)
- Auto-cleanup la fiecare 5 minute

**Folosire:**
```typescript
import { withMemoryCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

// Simplu
const data = await withMemoryCache(
  CACHE_KEYS.ADMIN_STATS,
  async () => await fetchStats(),
  CACHE_TTL.MEDIUM
);

// Invalidare
memoryCache.invalidatePrefix('report:');
```

### 2. Debounce Hooks
- `useDebounce` pentru search-uri (300ms default)
- `useDebouncedCallback` pentru functii
- `useThrottle` pentru scroll events
- `useThrottledScroll` pentru optimizare

**Folosire:**
```typescript
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Sau
const handleSearch = useDebouncedCallback((value: string) => {
  performSearch(value);
}, 300);
```

### 3. Prisma Optimizations
- Select fields optimizate pentru liste (`src/lib/prisma-helpers.ts`)
- Paginare cu cursor pentru liste mari
- Helper functions pentru search, sorting, paginare
- Safe user select (exclude date sensibile)

**Index-uri adăugate:**
```prisma
// Product
@@index([categoryId])
@@index([slug])
@@index([createdAt])

// Order  
@@index([userId])
@@index([customerId])
@@index([customerEmail])
@@index([status])
@@index([paymentStatus])
@@index([createdAt])
```

**Folosire:**
```typescript
import { 
  getPaginationParams, 
  buildPaginatedResponse,
  productSelectList,
  buildSearchWhere 
} from '@/lib/prisma-helpers';

const { skip, take } = getPaginationParams(page, limit);
const where = buildSearchWhere(search, ['name', 'description']);

const [products, total] = await Promise.all([
  prisma.product.findMany({
    where,
    skip,
    take,
    select: productSelectList,
  }),
  prisma.product.count({ where }),
]);

return buildPaginatedResponse(products, total, page, limit);
```

### 4. Lazy Loading Components
- Toate componentele grele sunt lazy loaded (`src/components/LazyComponents.tsx`)
- Loading skeletons pentru UX optim
- SSR disabled pentru editor (client-only)
- Dynamic imports pentru charts

**Folosire:**
```typescript
import { EditorCanvas, LineChart, ProductGrid } from '@/components/LazyComponents';

// Automat încarcă cu skeleton loaders
<EditorCanvas />
<LineChart data={chartData} />
```

### 5. Image Optimization
- next/image configurare completă
- AVIF + WebP formats
- Device sizes optimizate
- Image sizes pentru toate breakpoints
- Cache TTL: 30 zile
- Lazy loading automat

**Folosire:**
```typescript
import Image from 'next/image';

<Image
  src="/products/product-1.jpg"
  alt="Product name"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/..."
  priority={false} // doar pentru above-the-fold
/>
```

### 6. Code Splitting
- Package imports optimized: lucide-react, @heroicons/react, recharts
- Console.log removal în production (păstrează warn/error)
- Turbo mode rules pentru SVG

## 📋 Best Practices

### API Routes
```typescript
// ✅ Bine - cu caching
export async function GET(request: Request) {
  return withMemoryCache(
    CACHE_KEYS.ADMIN_STATS,
    async () => {
      const stats = await calculateStats();
      return NextResponse.json(stats);
    },
    CACHE_TTL.MEDIUM
  );
}

// ❌ Rău - fără caching
export async function GET() {
  const stats = await calculateStats(); // slow query
  return NextResponse.json(stats);
}
```

### Search Components
```typescript
// ✅ Bine - cu debounce
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);

// ❌ Rău - fără debounce
const handleChange = (e) => {
  performSearch(e.target.value); // prea multe requests
};
```

### Prisma Queries
```typescript
// ✅ Bine - select specific
const products = await prisma.product.findMany({
  select: productSelectList, // doar câmpurile necesare
  include: {
    category: {
      select: { id: true, name: true }
    }
  }
});

// ❌ Rău - select all
const products = await prisma.product.findMany({
  include: { 
    category: true, // toate câmpurile
    variants: true,
    images: true,
  }
});
```

### Component Loading
```typescript
// ✅ Bine - lazy loaded
import { EditorCanvas } from '@/components/LazyComponents';

// ❌ Rău - eager load
import EditorCanvas from '@/components/public/editor/EditorCanvas';
```

## 🎯 Checklist Implementare în Componente

### Dashboard Admin
- [ ] Aplică caching la statistici
- [ ] Lazy load charts
- [ ] Debounce search comenzi
- [ ] Paginare optimizată

### Editor
- [x] Toate componentele lazy loaded
- [ ] Canvas rendering optimization
- [ ] Auto-save cu debounce
- [ ] Image upload optimization

### Configurator
- [ ] Steps lazy loaded
- [ ] File upload cu progress
- [ ] Price calculation cu debounce
- [ ] Image preview optimization

### Catalog
- [ ] Product grid cu lazy loading
- [ ] Search cu debounce
- [ ] Filters cu caching
- [ ] Images cu next/image

### User Dashboard
- [ ] Projects list cu paginare
- [ ] Files lazy loaded
- [ ] Orders cu caching
- [ ] Notifications real-time optimized

## 📊 Metrici de Măsurat

1. **Lighthouse Score**: Target 90+ pentru toate metricile
2. **First Contentful Paint**: < 1.5s
3. **Largest Contentful Paint**: < 2.5s
4. **Time to Interactive**: < 3.5s
5. **Total Blocking Time**: < 300ms
6. **Cumulative Layout Shift**: < 0.1

## 🚀 Următorii Pași

1. Rulează `npm run build && npm run start` și verifică bundle size
2. Testează toate paginile cu Network throttling (Fast 3G)
3. Monitorizează API response times în production
4. Configurează Redis pentru caching persistent (optional)
5. Implementează Service Worker pentru offline support (optional)

## 🔧 Tools Utile

```bash
# Bundle analyzer
npm install --save-dev @next/bundle-analyzer
# În next.config.ts: withBundleAnalyzer({ enabled: true })

# Performance monitoring
npm install web-vitals
# Track in _app.tsx

# Database query analyzer
npx prisma studio
# Verifică slow queries
```
