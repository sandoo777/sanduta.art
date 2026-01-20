# Products Domain

Domeniul de business pentru gestionarea produselor și catalogului.

## 📁 Structură

```
products/
├── types/              # TypeScript types & interfaces
│   └── index.ts
├── services/          # Business logic
│   └── ProductsService.ts
└── hooks/             # React hooks pentru UI
    └── useProducts.ts
```

## 🔄 Data Flow

```
UI Component
    ↓
useProducts Hook (hooks/)
    ↓
ProductsService (services/)
    ↓
Prisma → Database
```

## 📚 Usage

### În API Routes:

```typescript
import { productsService } from '@/domains/products';

export async function GET(req: NextRequest) {
  const result = await productsService.getProducts({
    page: 1,
    limit: 20,
    isActive: true
  });
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  return NextResponse.json(result.data);
}
```

### În Components:

```typescript
import { useProducts } from '@/domains/products';

function ProductsList() {
  const { loading, getProducts } = useProducts();
  
  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProducts({ isActive: true });
      if (result.success) {
        setProducts(result.data.products);
      }
    };
    fetchProducts();
  }, []);
  
  // ...
}
```

## 🎯 Funcționalități

### Queries:
- `getProducts(params)` - Listă produse cu filtre și paginare
- `getProductById(id)` - Detalii produs cu varianțe și categorie

### Mutations:
- `createProduct(data)` - Creează produs nou
- `updateProduct(id, updates)` - Actualizează produs
- `deleteProduct(id)` - Șterge produs

## 🔒 Business Rules

1. **Delete Protection**: Produsele folosite în comenzi nu pot fi șterse
2. **SKU Uniqueness**: SKU-uri unice per produs
3. **Price Validation**: Prețuri pozitive
4. **Stock Management**: Track stoc per produs/variantă
5. **Category Relationship**: Produse pot aparține unei categorii

## 📊 Types

Vezi `types/index.ts`:
- `Product`, `ProductVariant`, `Category`
- `CreateProductDTO`, `UpdateProductDTO`
- `ProductsQueryParams`, `ProductsListResponse`
- `ProductServiceResult<T>`
