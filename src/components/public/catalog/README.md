# Catalog Components - Quick Reference

## 🎯 Import & Usage

### ProductCard (with Quick View)
```tsx
import { ProductCard } from '@/components/public/catalog/ProductCard';

<ProductCard
  id={1}
  name="Flyere A5"
  slug="flyere-a5"
  description="Flyere profesionale, hârtie 150g"
  imageUrl="/images/products/flyere.jpg"
  basePrice={250}
  badges={['bestseller', 'promo']}
  discount={15}
  specifications={{
    sizes: ['A5', 'A4', 'A3'],
    materials: ['Hârtie 150g', 'Hârtie 300g'],
    finishes: ['Mat', 'Lucios'],
    productionTime: '2-3 zile',
  }}
/>
```

### ProductQuickView
```tsx
import { ProductQuickView } from '@/components/public/catalog/ProductQuickView';

const [quickViewOpen, setQuickViewOpen] = useState(false);

<ProductQuickView
  isOpen={quickViewOpen}
  onClose={() => setQuickViewOpen(false)}
  product={{
    id: 1,
    name: "Flyere A5",
    slug: "flyere-a5",
    description: "Flyere profesionale...",
    imageUrl: "/images/flyere.jpg",
    basePrice: 250,
    badges: ['bestseller'],
    discount: 15,
    specifications: {
      sizes: ['A5', 'A4'],
      materials: ['Hârtie 150g'],
      finishes: ['Mat'],
      productionTime: '2-3 zile',
    },
  }}
/>
```

### Filters
```tsx
import { Filters, FilterState } from '@/components/public/catalog/Filters';

const [filters, setFilters] = useState<FilterState>({
  categoryId: null,
  minPrice: 0,
  maxPrice: 10000,
  productTypes: [],
  materials: [],
});

<Filters
  onFilterChange={setFilters}
  categories={categories}
/>
```

### SortBar
```tsx
import { SortBar, SortOption } from '@/components/public/catalog/SortBar';

const [sortBy, setSortBy] = useState<SortOption>('popular');

<SortBar
  onSortChange={setSortBy}
  currentSort={sortBy}
  totalProducts={120}
/>
```

### ProductGrid
```tsx
import { ProductGrid } from '@/components/public/catalog/ProductGrid';

<ProductGrid
  products={products}
  loading={false}
/>
```

### Pagination
```tsx
import { Pagination } from '@/components/public/catalog/Pagination';

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
/>
```

## 🎨 Customization

### Colors
Schimbă culorile în fiecare componentă:
- `blue-600` → culoarea ta primară
- `yellow-400` → culoarea ta de accent
- `gray-50` → background

### Grid Columns
În [ProductGrid.tsx](../src/components/public/catalog/ProductGrid.tsx):
```tsx
// Current: 1 → 2 → 3 → 4 columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Change to: 1 → 2 → 3 columns max
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Products Per Page
În [CatalogClient.tsx](../src/app/(public)/produse/CatalogClient.tsx):
```tsx
const PRODUCTS_PER_PAGE = 12; // Schimbă cu 8, 16, 24, etc.
```

## 📦 TypeScript Interfaces

```typescript
// Product
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  categoryId: number;
  badges?: ('bestseller' | 'promo' | 'eco')[];
  discount?: number;
  createdAt: string;
  popularity?: number;
}

// Category
interface Category {
  id: number;
  name: string;
}

// FilterState
interface FilterState {
  categoryId: number | null;
  minPrice: number;
  maxPrice: number;
  productTypes: string[];
  materials: string[];
}

// SortOption
type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
```

## 🔧 Common Modifications

### Add New Badge Type
În [ProductCard.tsx](../src/components/public/catalog/ProductCard.tsx):
```tsx
const badgeConfig = {
  bestseller: { label: 'Best Seller', color: 'bg-blue-600 text-white' },
  promo: { label: 'Promoție', color: 'bg-yellow-400 text-gray-900' },
  eco: { label: 'Eco', color: 'bg-green-600 text-white' },
  // Add new:
  new: { label: 'Nou', color: 'bg-red-600 text-white' },
};
```

### Add New Sort Option
În [SortBar.tsx](../src/components/public/catalog/SortBar.tsx):
```tsx
const sortOptions = [
  { value: 'popular', label: 'Cele mai populare' },
  // Add new:
  { value: 'rating', label: 'Cele mai bine cotate' },
];
```

### Add New Filter
În [Filters.tsx](../src/components/public/catalog/Filters.tsx):
```tsx
// Add new checkbox group similar to productTypes or materials
```

## 📱 Mobile Testing

```bash
# Test responsive breakpoints
# Mobile: < 640px
# Tablet: 640-1024px
# Desktop: > 1024px
```

## 🚀 Quick Test

```bash
# Run test script
bash scripts/test-catalog.sh

# Start dev server
npm run dev

# Visit: http://localhost:3000/produse
```
