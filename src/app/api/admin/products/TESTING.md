# Products API Testing Guide

Ghid complet de testare pentru API-ul Products.

## 🔧 Setup

1. **Pornește serverul**:
```bash
npm run dev
```

2. **Autentificare**:
- Loghează-te ca ADMIN în aplicație
- Toate request-urile trebuie să includă cookie-ul de sesiune

## 📋 Test Scenarios

### Test 1: Create Product cu Variante și Imagini

**Request**:
```bash
POST /api/admin/products
Content-Type: application/json

{
  "name": "Cutie Personalizată Premium",
  "slug": "cutie-personalizata-premium",
  "description": "Cutie din lemn personalizată cu gravură laser",
  "price": 199.99,
  "categoryId": "cat_id_here",
  "images": [
    "https://example.com/cutie-premium-1.jpg",
    "https://example.com/cutie-premium-2.jpg"
  ],
  "variants": [
    {
      "name": "Small (20x15cm)",
      "price": 199.99,
      "stock": 10
    },
    {
      "name": "Medium (30x20cm)",
      "price": 299.99,
      "stock": 5
    },
    {
      "name": "Large (40x30cm)",
      "price": 399.99,
      "stock": 3
    }
  ]
}
```

**Expected**:
- Status: 201 Created
- Response include: product cu toate relațiile (category, images, variants)
- Verifică în baza de date: product, 2 images, 3 variants

**Validări**:
✅ Slug este unic
✅ CategoryId există
✅ Price >= 0
✅ Images și variants create corect

---

### Test 2: Lista Produselor

**Request**:
```bash
GET /api/admin/products
```

**Expected**:
- Status: 200 OK
- Array de produse cu toate relațiile
- Sortate desc după createdAt
- Include _count.orderItems

**Verificări**:
✅ Toate produsele returnate
✅ Include category, images, variants
✅ _count.orderItems prezent

---

### Test 3: Get Single Product

**Request**:
```bash
GET /api/admin/products/[product_id]
```

**Expected**:
- Status: 200 OK (dacă există) / 404 Not Found
- Product complet cu toate relațiile

---

### Test 4: Update Product

**Request**:
```bash
PATCH /api/admin/products/[product_id]
Content-Type: application/json

{
  "name": "Cutie Premium Updated",
  "price": 249.99,
  "description": "Descriere actualizată"
}
```

**Expected**:
- Status: 200 OK
- Product actualizat cu valorile noi
- Câmpurile nespecificate rămân neschimbate

**Test Slug Change**:
```bash
PATCH /api/admin/products/[product_id]
{
  "slug": "new-unique-slug"
}
```
✅ Dacă slug este unic → Success
❌ Dacă slug există → 400 "Slug already exists"

**Test Category Change**:
```bash
PATCH /api/admin/products/[product_id]
{
  "categoryId": "invalid_id"
}
```
❌ Dacă category nu există → 400 "Category not found"

---

### Test 5: Delete Product

#### 5a. Delete Product fără Orders

**Request**:
```bash
DELETE /api/admin/products/[product_id]
```

**Expected**:
- Status: 200 OK
- `{ "message": "Product deleted successfully" }`
- Product șters din DB împreună cu images și variants (cascade)

#### 5b. Delete Product cu Orders

**Setup**:
1. Creează un order cu orderItem pentru produsul test

**Request**:
```bash
DELETE /api/admin/products/[product_id_with_orders]
```

**Expected**:
- Status: 400 Bad Request
- `{ "error": "Cannot delete product with X associated order(s)" }`
- Produsul NU este șters

---

### Test 6: Variants CRUD

#### 6a. Add Variant

**Request**:
```bash
POST /api/admin/products/[product_id]/variants
Content-Type: application/json

{
  "name": "Extra Large (50x40cm)",
  "price": 499.99,
  "stock": 2
}
```

**Expected**:
- Status: 201 Created
- Variant created cu datele specificate

**Validări negative**:
```bash
# Missing name
{ "price": 100, "stock": 5 }
→ 400 "Name is required"

# Negative price
{ "name": "Test", "price": -10, "stock": 5 }
→ 400 "Price must be non-negative"

# Negative stock
{ "name": "Test", "price": 100, "stock": -5 }
→ 400 "Stock must be non-negative"
```

#### 6b. Update Variant

**Request**:
```bash
PATCH /api/admin/products/[product_id]/variants/[variant_id]
Content-Type: application/json

{
  "price": 549.99,
  "stock": 5
}
```

**Expected**:
- Status: 200 OK
- Variant actualizat

**Test ownership**:
```bash
PATCH /api/admin/products/[wrong_product_id]/variants/[variant_id]
```
→ 400 "Variant does not belong to this product"

#### 6c. Delete Variant

**Request**:
```bash
DELETE /api/admin/products/[product_id]/variants/[variant_id]
```

**Expected**:
- Status: 200 OK
- `{ "message": "Variant deleted successfully" }`

---

### Test 7: Images CRUD

#### 7a. Add Image

**Request**:
```bash
POST /api/admin/products/[product_id]/images
Content-Type: application/json

{
  "url": "https://example.com/new-image.jpg"
}
```

**Expected**:
- Status: 201 Created
- Image created

**Validare**:
```bash
# Missing URL
{}
→ 400 "URL is required"
```

#### 7b. Delete Image

**Request**:
```bash
DELETE /api/admin/products/[product_id]/images/[image_id]
```

**Expected**:
- Status: 200 OK
- `{ "message": "Image deleted successfully" }`

**Test ownership**:
```bash
DELETE /api/admin/products/[wrong_product_id]/images/[image_id]
```
→ 400 "Image does not belong to this product"

---

### Test 8: Acces Neautorizat

#### 8a. Fără Autentificare

**Request** (fără cookies):
```bash
GET /api/admin/products
```

**Expected**:
- Status: 401 Unauthorized
- `{ "error": "Unauthorized" }`

#### 8b. User Non-Admin

**Setup**: Loghează-te cu user CLIENT/MANAGER/OPERATOR

**Request**:
```bash
GET /api/admin/products
```

**Expected**:
- Status: 401 Unauthorized
- `{ "error": "Unauthorized" }`

---

## 🎯 Checklist Complete

### Products
- [x] GET /products → Lista cu relații
- [x] POST /products → Create cu validări
- [x] GET /products/[id] → Single product
- [x] PATCH /products/[id] → Update cu validări
- [x] DELETE /products/[id] → Delete cu protecție orders

### Variants
- [x] POST /products/[id]/variants → Create
- [x] PATCH /products/[id]/variants/[variantId] → Update
- [x] DELETE /products/[id]/variants/[variantId] → Delete
- [x] Ownership validation

### Images
- [x] POST /products/[id]/images → Create
- [x] DELETE /products/[id]/images/[imageId] → Delete
- [x] Ownership validation

### Security
- [x] Auth check pe toate routes
- [x] ADMIN role check
- [x] 401 pentru unauthorized

### Data Integrity
- [x] Slug uniqueness
- [x] Category existence
- [x] Cascade delete pentru images/variants
- [x] Prevent delete cu orders

---

## 🔍 Debug Tips

**Vezi logs în console**:
```bash
npm run dev
# Toate errors sunt logguite în console cu details
```

**Verifică DB**:
```bash
npx prisma studio
# Browse products, variants, images
```

**Test rapid cu curl**:
```bash
# Get products
curl -X GET http://localhost:3000/api/admin/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Create product
curl -X POST http://localhost:3000/api/admin/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test","price":99,"categoryId":"cat_id"}'
```

---

## ✅ Success Criteria

Backend complet funcțional dacă toate testele trec:
1. ✅ CRUD complet pentru Products
2. ✅ CRUD complet pentru Variants
3. ✅ CRUD complet pentru Images
4. ✅ Validări corect implementate
5. ✅ Auth și role checks funcționează
6. ✅ Data integrity menținută
7. ✅ Cascade deletes funcționează
8. ✅ Error handling consistent
