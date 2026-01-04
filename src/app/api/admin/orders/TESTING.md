# Orders API Testing Guide

Ghid complet de testare pentru API-ul Orders.

## 🔧 Setup

1. **Pornește serverul**:
```bash
npm run dev
```

2. **Autentificare**:
- Loghează-te ca ADMIN sau MANAGER în aplicație
- Toate request-urile trebuie să includă cookie-ul de sesiune

## 📋 Test Scenarios

### Test 1: Create Order cu Items

**Setup**:
1. Creează o categoriegetOrDefault
2. Creează 1-2 produse cu variante
3. Creează 1 customer

**Request**:
```bash
POST /api/admin/orders
Content-Type: application/json

{
  "customerId": "cust_id_here",
  "source": "ONLINE",
  "channel": "WEB",
  "items": [
    {
      "productId": "prod_id_1",
      "variantId": "var_id_1",
      "quantity": 2,
      "customDescription": "Custom gravură"
    },
    {
      "productId": "prod_id_2",
      "quantity": 1,
      "customDescription": null
    }
  ],
  "dueDate": "2026-02-15"
}
```

**Expected**:
- Status: 201 Created
- Response include: order cu items, customer, files array
- `totalPrice` = (prod1_price * qty1) + (prod2_price * qty2)
- `status` = "PENDING"
- `paymentStatus` = "PENDING"

**Verificări**:
✅ Order creat cu orderItems
✅ totalPrice calculat corect
✅ customer include
✅ files array gol
✅ assignedTo = null

---

### Test 2: Get Order Details

**Request**:
```bash
GET /api/admin/orders/[order_id]
```

**Expected**:
- Status: 200 OK
- Response include: customer, assignedTo, orderItems cu products, files, _count

**Verificări**:
✅ Toate relațiile incluse
✅ _count.orderItems === length de items
✅ _count.files === 0 (initial)

---

### Test 3: Add Item to Order

**Request**:
```bash
POST /api/admin/orders/[order_id]/items
Content-Type: application/json

{
  "productId": "prod_id_3",
  "variantId": "var_id_3",
  "quantity": 3,
  "customDescription": "Item adăugat"
}
```

**Expected**:
- Status: 201 Created
- Item creat cu lineTotal calculat
- **Order.totalPrice recalculat** (include noul item)

**Verificări**:
✅ Item creat
✅ unitPrice = variant price sau product price
✅ lineTotal = quantity × unitPrice
✅ Order.totalPrice = vechi + noua lineTotal

---

### Test 4: Update Item Quantity

**Request**:
```bash
PATCH /api/admin/orders/[order_id]/items/[item_id]
Content-Type: application/json

{
  "quantity": 5,
  "customDescription": "Updated notes"
}
```

**Expected**:
- Status: 200 OK
- Item actualizat cu noua quantity și lineTotal
- **Order.totalPrice recalculat**

**Verificări**:
✅ Quantity actualizat
✅ lineTotal recalculat = quantity × unitPrice
✅ Order.totalPrice actualizat

**Test proprietate item**:
```bash
PATCH /api/admin/orders/[wrong_order_id]/items/[item_id]
```
→ 400 "Item does not belong to this order"

---

### Test 5: Delete Item

**Request**:
```bash
DELETE /api/admin/orders/[order_id]/items/[item_id]
```

**Expected**:
- Status: 200 OK
- Item șters
- **Order.totalPrice recalculat** (fără item-ul șters)

**Verificări**:
✅ Item șters
✅ Order.totalPrice = sum(remaining lineTotal)
✅ _count.orderItems decrementat

---

### Test 6: Update Order Status

**Request**:
```bash
PATCH /api/admin/orders/[order_id]
Content-Type: application/json

{
  "status": "IN_DESIGN",
  "paymentStatus": "PAID",
  "dueDate": "2026-02-20"
}
```

**Expected**:
- Status: 200 OK
- Order actualizat cu noile valori

**Verificări**:
✅ Status changed
✅ paymentStatus changed
✅ dueDate changed
✅ Customer și items still included

---

### Test 7: Assign Operator to Order

**Request**:
```bash
PATCH /api/admin/orders/[order_id]
Content-Type: application/json

{
  "assignedToUserId": "user_id_manager"
}
```

**Expected**:
- Status: 200 OK
- Order.assignedTo = user object
- assignedTo include: { id, name, email }

**Test invalid user**:
```bash
PATCH /api/admin/orders/[order_id]
{
  "assignedToUserId": "invalid_user_id"
}
```
→ 400 "User not found"

---

### Test 8: Add Files to Order

**Request**:
```bash
POST /api/admin/orders/[order_id]/files
Content-Type: application/json

{
  "url": "https://example.com/design.pdf",
  "name": "Design Mockup v1"
}
```

**Expected**:
- Status: 201 Created
- File creat cu name și url
- createdAt timestamp

**Add second file**:
```bash
POST /api/admin/orders/[order_id]/files
{
  "url": "https://example.com/specs.pdf",
  "name": "Specifications"
}
```
✅ Ambele fișiere în order.files

---

### Test 9: Delete File

**Request**:
```bash
DELETE /api/admin/orders/[order_id]/files/[file_id]
```

**Expected**:
- Status: 200 OK
- File șters
- _count.files decrementat

**Test proprietate file**:
```bash
DELETE /api/admin/orders/[wrong_order_id]/files/[file_id]
```
→ 400 "File does not belong to this order"

---

### Test 10: Delete Order (PENDING)

**Setup**:
1. Creează o comandă nouă (status = PENDING)

**Request**:
```bash
DELETE /api/admin/orders/[pending_order_id]
```

**Expected**:
- Status: 200 OK
- Order șters
- orderItems și files cascade deleted

**Verificări**:
✅ Order șters
✅ Items șterse
✅ Files șterse

---

### Test 11: Delete Order (Non-PENDING)

**Setup**:
1. Creează o comandă
2. Update status = "IN_DESIGN"

**Request**:
```bash
DELETE /api/admin/orders/[non_pending_order_id]
```

**Expected**:
- Status: 400 Bad Request
- Error: "Cannot delete order with status IN_DESIGN..."

**Verificări**:
❌ Order NU este șters
✅ Status check funcționează

---

### Test 12: Access Control

#### ADMIN Role - All Access
```bash
GET /api/admin/orders → 200 OK
POST /api/admin/orders → 201 Created
PATCH /api/admin/orders/[id] → 200 OK
DELETE /api/admin/orders/[id] → 200 OK (if PENDING)
```

#### MANAGER Role - All Access
```bash
GET /api/admin/orders → 200 OK
POST /api/admin/orders → 201 Created
PATCH /api/admin/orders/[id] → 200 OK
DELETE /api/admin/orders/[id] → 200 OK (if PENDING)
```

#### CLIENT/OPERATOR Role - No Access
```bash
GET /api/admin/orders → 401 Unauthorized
POST /api/admin/orders → 401 Unauthorized
```

#### No Authentication - No Access
```bash
GET /api/admin/orders (without session) → 401 Unauthorized
```

---

## 🎯 Checklist Complete

### Orders CRUD
- [x] GET /orders → Lista cu relații
- [x] POST /orders → Create cu items și calcul preț
- [x] GET /orders/[id] → Single order
- [x] PATCH /orders/[id] → Update status/payment/assign
- [x] DELETE /orders/[id] → Delete doar PENDING

### Order Items CRUD
- [x] POST /orders/[id]/items → Add item + recalc
- [x] PATCH /orders/[id]/items/[itemId] → Update + recalc
- [x] DELETE /orders/[id]/items/[itemId] → Delete + recalc
- [x] Ownership validation

### Order Files CRUD
- [x] POST /orders/[id]/files → Add file
- [x] DELETE /orders/[id]/files/[fileId] → Delete file
- [x] Ownership validation

### Price Calculations
- [x] unitPrice din product/variant
- [x] lineTotal = quantity × unitPrice
- [x] totalPrice = sum(lineTotal)
- [x] Recalc on add item
- [x] Recalc on update item
- [x] Recalc on delete item

### Security
- [x] Auth check pe toate routes
- [x] ADMIN | MANAGER role check
- [x] 401 pentru unauthorized
- [x] Ownership validation items/files

### Data Integrity
- [x] Customer validation
- [x] Product validation
- [x] Variant validation (optional)
- [x] User validation (assignedTo)
- [x] Cascade delete pentru items/files
- [x] Prevent delete non-PENDING orders

---

## 🔍 Debug Tips

**Vezi logs**:
```bash
npm run dev
# Toate errors sunt logguite în console
```

**Verif DB**:
```bash
npx prisma studio
# Browse orders, items, files
```

**Test rapid cu cURL**:
```bash
# Get orders
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Create order
curl -X POST http://localhost:3000/api/admin/orders \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId":"cust_id",
    "source":"ONLINE",
    "channel":"WEB",
    "items":[{"productId":"prod_id","quantity":1}]
  }'
```

---

## ✅ Success Criteria

Backend complet funcțional dacă toate testele trec:
1. ✅ CRUD complet pentru Orders
2. ✅ CRUD complet pentru Items
3. ✅ CRUD complet pentru Files
4. ✅ Price calculations corect
5. ✅ Auto-recalc pe mutații
6. ✅ Auth și role checks funcționează
7. ✅ Data integrity menținută
8. ✅ Cascade deletes funcționează
9. ✅ Status validation pentru delete
10. ✅ Error handling consistent
