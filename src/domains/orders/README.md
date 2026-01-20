# Orders Domain

Domeniul de business pentru gestionarea comenzilor.

## 📁 Structură

```
orders/
├── types/              # TypeScript types & interfaces
│   └── index.ts
├── repositories/       # Data access layer
│   └── OrdersRepository.ts
├── services/          # Business logic
│   └── OrdersService.ts
└── hooks/             # React hooks pentru UI
    └── useOrders.ts
```

## 🔄 Data Flow

```
UI Component
    ↓
useOrders Hook (hooks/)
    ↓
OrdersService (services/)
    ↓
OrdersRepository (repositories/)
    ↓
Prisma → Database
```

## 📚 Usage

### În API Routes:

```typescript
import { ordersService } from '@/domains/orders';

export async function GET(req: NextRequest) {
  const result = await ordersService.getOrders({ page: 1, limit: 20 });
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  return NextResponse.json(result.data);
}
```

### În Components:

```typescript
import { useOrders } from '@/domains/orders';

function OrdersList() {
  const { loading, getOrders } = useOrders();
  
  useEffect(() => {
    const fetchOrders = async () => {
      const result = await getOrders({ page: 1, limit: 20 });
      if (result.success) {
        setOrders(result.data.orders);
      }
    };
    fetchOrders();
  }, []);
  
  // ...
}
```

## 🎯 Funcționalități

### Queries:
- `getOrders(params)` - Listă comenzi cu filtre și paginare
- `getOrderById(id)` - Detalii comandă cu relații complete

### Mutations:
- `createOrder(data)` - Creează comandă nouă
- `updateOrderStatus(id, status)` - Actualizează status
- `updatePaymentStatus(id, status)` - Actualizează status plată
- `assignOperator(id, userId)` - Atribuie operator
- `addItem(orderId, item)` - Adaugă produs
- `updateItem(orderId, itemId, updates)` - Actualizează produs
- `deleteItem(orderId, itemId)` - Șterge produs
- `deleteOrder(id)` - Șterge comandă

## 🔒 Business Rules

1. **Status Transitions**: Validări pentru tranziții valide între statusuri
2. **Delete Protection**: Comenzile livrate nu pot fi șterse
3. **Order Total**: Recalculat automat la modificarea items
4. **Timeline**: Toate acțiunile sunt înregistrate în timeline
5. **Operator Assignment**: Doar useri cu rol ADMIN/MANAGER pot atribui

## 📊 Types

Vezi `types/index.ts` pentru toate tipurile disponibile:
- `Order`, `OrderItem`, `OrderTimeline`
- `CreateOrderDTO`, `UpdateOrderDTO`
- `OrdersQueryParams`, `OrdersListResponse`
- `OrderServiceResult<T>`
