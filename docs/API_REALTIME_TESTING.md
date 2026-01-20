# Documentație API Endpoints & Real-time

## 📡 **8 Noi API Endpoints**

### 1. **Product Search API**
`GET /api/products/search`

**Query Parameters:**
- `q` - search query (caută în name, description, tags)
- `categoryId` - filtrare după categorie
- `minPrice`, `maxPrice` - interval de preț
- `inStock` - doar produse în stoc (true/false)
- `page`, `limit` - paginare

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. **Category Tree API**
`GET /api/categories/tree`

Returnează arborele de categorii cu număr produse:
```json
{
  "categories": [
    {
      "id": "1",
      "name": "Canvas",
      "slug": "canvas",
      "productCount": 15,
      "children": [...]
    }
  ],
  "totalCount": 5
}
```

### 3. **Order Tracking API**
`GET /api/orders/track?orderId=xxx&email=xxx`

Urmărire comandă publică (fără autentificare):
```json
{
  "order": {
    "id": "order123",
    "status": "IN_PRODUCTION",
    "total": 199.99,
    "items": [...]
  },
  "timeline": [
    { "status": "PENDING", "label": "Comandă plasată", "completed": true },
    { "status": "IN_PRODUCTION", "label": "În producție", "completed": true },
    { "status": "DELIVERED", "label": "Livrată", "completed": false }
  ]
}
```

### 4. **Revenue Stats API** (Admin)
`GET /api/admin/stats/revenue?period=30days&groupBy=day`

**Parametri:**
- `period`: 7days, 30days, 90days, year
- `groupBy`: day, week, month

**Response:**
```json
{
  "summary": {
    "totalRevenue": 15000,
    "totalOrders": 45,
    "averageOrderValue": 333.33
  },
  "chartData": [
    { "period": "2026-01-15", "revenue": 1200, "orders": 5 }
  ]
}
```

### 5. **Production Schedule API** (Admin/Manager/Operator)
`GET /api/admin/production/schedule?days=7`

Planificare producție cu ore estimate:
```json
{
  "schedule": [
    {
      "orderId": "order1",
      "customerName": "John Doe",
      "totalProductionHours": 6,
      "estimatedCompletion": "2026-01-21T14:00:00Z"
    }
  ],
  "scheduleByDay": {
    "2026-01-21": [...]
  },
  "summary": {
    "totalOrders": 10,
    "pendingOrders": 3,
    "inProductionOrders": 7
  }
}
```

### 6. **Low Stock Inventory API** (Admin/Manager)
`GET /api/admin/inventory/low-stock?threshold=10`

Alertă produse cu stoc scăzut:
```json
{
  "products": [
    {
      "id": "prod1",
      "name": "Canvas A4",
      "stock": 3,
      "status": "CRITICAL",  // OUT_OF_STOCK, CRITICAL, LOW_STOCK
      "totalOrders": 15
    }
  ],
  "summary": {
    "outOfStock": 2,
    "critical": 5,
    "lowStock": 8
  }
}
```

### 7. **Wishlist API** (Customer)
`GET /api/customer/wishlist`
`POST /api/customer/wishlist` - body: `{ "productId": "xxx" }`
`DELETE /api/customer/wishlist?productId=xxx`

CRUD complet pentru lista de dorințe.

### 8. **Reports Export API** (Admin/Manager)
`POST /api/admin/reports/export`

```json
{
  "reportType": "orders|products|revenue|customers",
  "format": "csv|json",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  }
}
```

Returnează fișier CSV/JSON pentru download.

---

## 🔴 **Real-time cu WebSocket (Socket.IO)**

### Setup

**Server:** [server.ts](server.ts) - Custom Next.js server cu Socket.IO
**Config:** Socket.IO path `/api/socket`

**Rulare:**
```bash
npm run dev  # Folosește tsx server.ts cu WebSocket
```

### Event-uri disponibile

#### **Client → Server**
```typescript
socket.emit('subscribe:orders', role);      // Abonare la comenzi
socket.emit('subscribe:production');         // Abonare la producție
socket.emit('subscribe:inventory');          // Abonare la inventar
socket.emit('unsubscribe:orders');
```

#### **Server → Client**
```typescript
'order:created'          // Comandă nouă
'order:updated'          // Comandă actualizată
'order:status-changed'   // Status schimbat
'production:updated'     // Progres producție
'inventory:low-stock'    // Alertă stoc
'notification'           // Notificare generică
```

### React Hooks

```typescript
import {
  useOrderNotifications,
  useOrderStatusUpdates,
  useProductionUpdates,
  useInventoryAlerts,
  useNotifications
} from '@/lib/socket/socket-client';

// În componentă:
const { notifications, isConnected } = useOrderNotifications('ADMIN');
const { alerts } = useInventoryAlerts();
```

### Componente UI

1. **OrderNotificationsBadge** - Badge cu notificări comenzi (admin/manager)
2. **NotificationToast** - Toast-uri pentru notificări generale
3. **InventoryAlertsWidget** - Widget alertă stoc scăzut

**Integrare:**
```tsx
// În layout admin:
import { OrderNotificationsBadge } from '@/components/notifications/OrderNotificationsBadge';
import { NotificationToast } from '@/components/notifications/NotificationToast';

<OrderNotificationsBadge />
<NotificationToast />
```

### Emit events din server

```typescript
import {
  emitOrderCreated,
  emitOrderStatusChanged,
  emitProductionUpdated,
  emitLowStock
} from '@/lib/socket/socket-server';

// După creare comandă:
emitOrderCreated({
  orderId: order.id,
  customerName: order.customerName,
  total: order.total,
  status: order.status,
  timestamp: new Date()
});
```

---

## 🧪 **Testing**

### Unit Tests (Vitest)

**3 fișiere test:**
1. [src/__tests__/api/endpoints.test.ts](src/__tests__/api/endpoints.test.ts) - Search, Category, Track
2. [src/__tests__/api/admin-endpoints.test.ts](src/__tests__/api/admin-endpoints.test.ts) - Revenue, Production, Inventory
3. [src/__tests__/api/customer-endpoints.test.ts](src/__tests__/api/customer-endpoints.test.ts) - Wishlist, Reports

**Rulare:**
```bash
npm test                  # Watch mode
npm run test:coverage     # Cu coverage
```

**Mock-uri:**
- Prisma queries
- NextAuth auth helpers
- Logger

### E2E Tests (Playwright)

**2 fișiere test:**
1. [tests/e2e/critical-flows.spec.ts](tests/e2e/critical-flows.spec.ts) - Fluxuri critice + real-time + API
2. [tests/e2e/advanced-features.spec.ts](tests/e2e/advanced-features.spec.ts) - Search, wishlist, tracking, performance

**Rulare:**
```bash
npm run test:e2e          # Headless
npm run test:e2e:headed   # Cu browser vizibil
npm run test:e2e:ui       # UI interactiv
```

**Coverage:**
- ✅ Homepage + navigation
- ✅ Product browsing + search + filters
- ✅ Add to cart + checkout
- ✅ Admin login + dashboard
- ✅ Order management + invoice export
- ✅ Product creation
- ✅ Revenue stats + production schedule
- ✅ Low stock alerts + export reports
- ✅ WebSocket notifications
- ✅ Wishlist CRUD
- ✅ Order tracking
- ✅ Error handling

---

## 📊 **Structură Proiect**

```
src/
├── app/api/
│   ├── products/search/          # Search API
│   ├── categories/tree/          # Category tree
│   ├── orders/track/             # Order tracking
│   ├── customer/wishlist/        # Wishlist CRUD
│   └── admin/
│       ├── stats/revenue/        # Revenue stats
│       ├── production/schedule/  # Production plan
│       ├── inventory/low-stock/  # Inventory alerts
│       └── reports/export/       # Export reports
├── lib/socket/
│   ├── socket-server.ts          # Socket.IO server
│   └── socket-client.ts          # React hooks
├── components/notifications/
│   ├── OrderNotificationsBadge.tsx
│   ├── NotificationToast.tsx
│   └── InventoryAlertsWidget.tsx
└── __tests__/api/                # Unit tests

tests/e2e/                         # E2E tests
server.ts                          # Custom server cu WebSocket
```

---

## 🚀 **Rulare Completă**

```bash
# Instalare dependențe (deja făcut)
npm install

# Pornire server cu WebSocket
npm run dev

# Test unit tests (alt terminal)
npm test

# Test E2E (alt terminal)
npm run test:e2e
```

**Port:** http://localhost:3000
**WebSocket:** ws://localhost:3000/api/socket

---

## ✅ **Checklist Completare**

- [x] 8 API endpoints implementate și testate
- [x] WebSocket server cu Socket.IO
- [x] React hooks pentru real-time
- [x] 3 componente UI pentru notificări
- [x] Unit tests (18+ teste)
- [x] E2E tests (25+ scenarii)
- [x] Documentație completă
- [x] Server custom cu tsx
- [x] Error handling și logging
- [x] TypeScript types pentru toate

**Gata de producție!** 🎉
