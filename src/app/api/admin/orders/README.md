# Orders API Documentation

Backend complet pentru modulul Orders cu workflow complet, order items, file uploads și protecție acces.

## 📚 Modele Prisma

### Order
```prisma
model Order {
  id                   String        @id @default(cuid())
  customerId           String?
  customerName         String
  customerEmail        String
  customerPhone        String?
  source               OrderSource   @default(ONLINE)
  channel              OrderChannel  @default(WEB)
  status               OrderStatus   @default(PENDING)
  paymentStatus        PaymentStatus @default(PENDING)
  paymentMethod        String?
  deliveryStatus       String        @default("pending")
  deliveryMethod       String?
  deliveryAddress      String?
  city                 String?
  novaPoshtaWarehouse  String?
  trackingNumber       String?
  paynetSessionId      String?
  totalPrice           Decimal       @default(0) @db.Decimal(10, 2)
  currency             String        @default("MDL")
  dueDate              DateTime?
  userId               String?
  assignedToUserId     String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  customer     Customer? @relation(fields: [customerId], references: [id])
  user         User?     @relation(fields: [userId], references: [id])
  assignedTo   User?     @relation("AssignedOrders", fields: [assignedToUserId], references: [id])
  orderItems   OrderItem[]
  files        OrderFile[]
}
```

### OrderItem
```prisma
model OrderItem {
  id                String  @id @default(cuid())
  orderId           String
  productId         String
  variantId         String?
  customDescription String?
  quantity          Int     @default(1)
  unitPrice         Decimal @default(0) @db.Decimal(10, 2)
  lineTotal         Decimal @default(0) @db.Decimal(10, 2)

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

### OrderFile
```prisma
model OrderFile {
  id        String   @id @default(cuid())
  orderId   String
  url       String
  name      String
  createdAt DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

## 🛣️ API Routes

### Orders

#### GET /api/admin/orders
Lista toate comenzile cu relații complete

**Auth**: Required (ADMIN | MANAGER)

**Query Params**: None

**Response**: 200 OK
```json
[
  {
    "id": "clxxx",
    "customerId": "cust_id",
    "customerName": "Customer Name",
    "customerEmail": "customer@example.com",
    "customerPhone": "123456789",
    "source": "ONLINE",
    "channel": "WEB",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "totalPrice": "299.99",
    "currency": "MDL",
    "dueDate": "2026-02-04T00:00:00.000Z",
    "customer": {
      "id": "cust_id",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "123456789",
      "address": "123 Street",
      "company": "Company Inc",
      "source": "ONLINE",
      "tags": [],
      "createdAt": "2026-01-04T10:00:00.000Z",
      "updatedAt": "2026-01-04T10:00:00.000Z"
    },
    "assignedTo": null,
    "orderItems": [
      {
        "id": "item_id",
        "orderId": "clxxx",
        "productId": "prod_id",
        "variantId": "var_id",
        "customDescription": null,
        "quantity": 2,
        "unitPrice": "99.99",
        "lineTotal": "199.99",
        "product": {
          "id": "prod_id",
          "name": "Product Name",
          "price": "99.99"
        }
      }
    ],
    "files": [],
    "_count": {
      "orderItems": 1,
      "files": 0
    },
    "createdAt": "2026-01-04T10:00:00.000Z",
    "updatedAt": "2026-01-04T10:00:00.000Z"
  }
]
```

#### POST /api/admin/orders
Creează o comandă nouă cu items

**Auth**: Required (ADMIN | MANAGER)

**Body**:
```json
{
  "customerId": "cust_id",
  "source": "ONLINE",
  "channel": "WEB",
  "items": [
    {
      "productId": "prod_id",
      "variantId": "var_id",
      "quantity": 2,
      "customDescription": "Custom notes for this item"
    }
  ],
  "dueDate": "2026-02-04"
}
```

**Validări**:
- `customerId`: required, valid customer ID
- `items`: required, non-empty array
- `items[].productId`: required, valid product ID
- `items[].quantity`: required, > 0
- `items[].variantId`: optional, valid variant ID if provided

**Calcule Automate**:
- `unitPrice` = product price or variant price
- `lineTotal` = quantity × unitPrice
- `totalPrice` = sum(lineTotal)

**Response**: 201 Created

### Order by ID

#### GET /api/admin/orders/[id]
Obține o comandă cu detalii complete

**Auth**: Required (ADMIN | MANAGER)

**Response**: 200 OK / 404 Not Found

#### PATCH /api/admin/orders/[id]
Actualizează comandă (status, payment, assignment)

**Auth**: Required (ADMIN | MANAGER)

**Body** (toate câmpurile opționale):
```json
{
  "status": "IN_PRODUCTION",
  "paymentStatus": "PAID",
  "dueDate": "2026-02-10",
  "assignedToUserId": "user_id"
}
```

**Validări**:
- `status`: trebuie să fie din enum OrderStatus
- `paymentStatus`: trebuie să fie din enum PaymentStatus
- `assignedToUserId`: dacă se trimite, trebuie să existe user

**Response**: 200 OK / 404 Not Found / 400 Bad Request

#### DELETE /api/admin/orders/[id]
Șterge comandă (doar dacă PENDING)

**Auth**: Required (ADMIN | MANAGER)

**Regulă**: 
- Permite ștergerea doar dacă `status === "PENDING"`
- Cascade delete pentru orderItems și files

**Response**:
- 200 OK: `{ "message": "Order deleted successfully" }`
- 400 Bad Request: `{ "error": "Cannot delete order with status..." }`
- 404 Not Found

### Order Items

#### POST /api/admin/orders/[id]/items
Adaugă item la comandă

**Auth**: Required (ADMIN | MANAGER)

**Body**:
```json
{
  "productId": "prod_id",
  "variantId": "var_id",
  "quantity": 3,
  "customDescription": "Special request"
}
```

**Validări**:
- `productId`: required, valid product
- `quantity`: required, > 0
- `variantId`: optional, valid variant if provided

**Calcule Automate**:
- `unitPrice` din product/variant
- `lineTotal` = quantity × unitPrice
- **Recalculează `order.totalPrice`**

**Response**: 201 Created / 404 Order Not Found / 400 Bad Request

#### PATCH /api/admin/orders/[id]/items/[itemId]
Actualizează item

**Auth**: Required (ADMIN | MANAGER)

**Body**:
```json
{
  "quantity": 5,
  "customDescription": "Updated notes"
}
```

**Validări**:
- `quantity`: dacă se trimite, trebuie > 0
- Item trebuie să aparțină comenzii

**Calcule Automate**:
- Recalculează `lineTotal` dacă se schimbă quantity
- **Recalculează `order.totalPrice`**

**Response**: 200 OK / 404 Not Found / 400 Bad Request

#### DELETE /api/admin/orders/[id]/items/[itemId]
Șterge item din comandă

**Auth**: Required (ADMIN | MANAGER)

**Calcule Automate**:
- **Recalculează `order.totalPrice`**

**Response**: 200 OK / 404 Not Found / 400 Bad Request

### Order Files

#### POST /api/admin/orders/[id]/files
Adaugă fișier la comandă

**Auth**: Required (ADMIN | MANAGER)

**Body**:
```json
{
  "url": "https://example.com/file.pdf",
  "name": "Design Mockup"
}
```

**Validări**:
- `url`: required
- `name`: required

**Response**: 201 Created / 404 Not Found / 400 Bad Request

#### DELETE /api/admin/orders/[id]/files/[fileId]
Șterge fișier din comandă

**Auth**: Required (ADMIN | MANAGER)

**Validări**:
- Fișierul trebuie să aparțină comenzii

**Response**: 200 OK / 404 Not Found / 400 Bad Request

## 🔒 Protecție Acces

Toate endpoint-urile verifică:
1. **User autentificat**: trebuie să existe session
2. **User rol ADMIN sau MANAGER**: `session.user.role === "ADMIN" || session.user.role === "MANAGER"`

Dacă verificările eșuează:
```json
{
  "error": "Unauthorized"
}
```
Status: 401

## 💰 Workflow Calcule Preț

**Create Order**:
1. Pentru fiecare item:
   - Obții `unitPrice` din product sau variant
   - Calculezi `lineTotal = quantity × unitPrice`
2. Sumezi toti `lineTotal` pentru `order.totalPrice`

**Add/Update Item**:
- Recalculezi `lineTotal` dacă se schimbă quantity
- Sumezi toti `lineTotal` pentru `order.totalPrice`

**Delete Item**:
- Sumezi toti `lineTotal` rămași pentru `order.totalPrice`

## 📋 Enums

### OrderStatus
```
PENDING
IN_PREPRODUCTION
IN_DESIGN
IN_PRODUCTION
IN_PRINTING
QUALITY_CHECK
READY_FOR_DELIVERY
DELIVERED
CANCELLED
```

### PaymentStatus
```
PENDING
PAID
FAILED
REFUNDED
```

### OrderSource
```
ONLINE
OFFLINE
```

### OrderChannel
```
WEB
PHONE
WALK_IN
EMAIL
```

## 📝 Notițe

- Toate prețurile sunt stocate ca `Decimal(10, 2)` pentru precizie
- Ștergerea comenzii are cascade delete pentru items și files
- TotalPrice este auto-calculat și actualizat la orice schimbare
- ADMIN și MANAGER pot accesa toate endpoint-urile
- Doar PENDING comenzi pot fi șterse
