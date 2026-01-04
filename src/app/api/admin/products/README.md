# Products API Documentation

Backend complet pentru modulul Products cu modele Prisma, API routes, validări și protecție acces.

## 📚 Modele Prisma

### Product
```prisma
model Product {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?   @db.Text
  price       Decimal   @default(0) @db.Decimal(10, 2)
  categoryId  String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  category    Category         @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  variants    ProductVariant[]
  orderItems  OrderItem[]
}
```

### ProductVariant
```prisma
model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  name      String
  price     Decimal  @default(0) @db.Decimal(10, 2)
  stock     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

### ProductImage
```prisma
model ProductImage {
  id        String   @id @default(cuid())
  productId String
  url       String
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

## 🛣️ API Routes

### Products

#### GET /api/admin/products
Lista toate produsele cu relații

**Auth**: Required (ADMIN)

**Response**: 200 OK
```json
[
  {
    "id": "clxxx",
    "name": "Product Name",
    "slug": "product-name",
    "description": "Product description",
    "price": "99.99",
    "categoryId": "cat_id",
    "category": {
      "id": "cat_id",
      "name": "Category",
      "slug": "category"
    },
    "images": [
      {
        "id": "img_id",
        "url": "https://example.com/image.jpg",
        "createdAt": "2026-01-04T10:00:00.000Z"
      }
    ],
    "variants": [
      {
        "id": "var_id",
        "name": "Size M",
        "price": "99.99",
        "stock": 10,
        "createdAt": "2026-01-04T10:00:00.000Z",
        "updatedAt": "2026-01-04T10:00:00.000Z"
      }
    ],
    "_count": {
      "orderItems": 5
    },
    "createdAt": "2026-01-04T10:00:00.000Z",
    "updatedAt": "2026-01-04T10:00:00.000Z"
  }
]
```

#### POST /api/admin/products
Creează un produs nou

**Auth**: Required (ADMIN)

**Body**:
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 99.99,
  "categoryId": "cat_id",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "variants": [
    {
      "name": "Size M",
      "price": 99.99,
      "stock": 10
    }
  ]
}
```

**Validări**:
- `name`: required
- `slug`: required, unique
- `price`: required, >= 0
- `categoryId`: required, valid category ID

**Response**: 201 Created
```json
{
  "id": "clxxx",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": "99.99",
  "categoryId": "cat_id",
  "category": { ... },
  "images": [ ... ],
  "variants": [ ... ],
  "createdAt": "2026-01-04T10:00:00.000Z",
  "updatedAt": "2026-01-04T10:00:00.000Z"
}
```

### Product by ID

#### GET /api/admin/products/[id]
Obține un singur produs

**Auth**: Required (ADMIN)

**Response**: 200 OK / 404 Not Found

#### PATCH /api/admin/products/[id]
Actualizează un produs

**Auth**: Required (ADMIN)

**Body** (toate câmpurile sunt opționale):
```json
{
  "name": "Updated Name",
  "slug": "updated-slug",
  "description": "Updated description",
  "price": 129.99,
  "categoryId": "new_cat_id"
}
```

**Validări**:
- `slug`: dacă se schimbă, trebuie să fie unic (exclus produsul curent)
- `categoryId`: dacă se schimbă, trebuie să existe categoria

**Response**: 200 OK / 404 Not Found / 400 Bad Request

#### DELETE /api/admin/products/[id]
Șterge un produs (doar dacă nu are comenzi)

**Auth**: Required (ADMIN)

**Reguli**:
- Nu se poate șterge un produs care are orderItems asociate
- Ștergerea produsului va șterge cascade images și variants

**Response**: 
- 200 OK: `{ "message": "Product deleted successfully" }`
- 400 Bad Request: `{ "error": "Cannot delete product with X associated order(s)" }`
- 404 Not Found: `{ "error": "Product not found" }`

### Variants

#### POST /api/admin/products/[id]/variants
Adaugă o variantă nouă la produs

**Auth**: Required (ADMIN)

**Body**:
```json
{
  "name": "Size L",
  "price": 109.99,
  "stock": 15
}
```

**Validări**:
- `name`: required
- `price`: required, >= 0
- `stock`: required, >= 0

**Response**: 201 Created / 404 Not Found

#### PATCH /api/admin/products/[id]/variants/[variantId]
Actualizează o variantă

**Auth**: Required (ADMIN)

**Body** (toate câmpurile sunt opționale):
```json
{
  "name": "Size XL",
  "price": 119.99,
  "stock": 20
}
```

**Validări**:
- `price`: dacă se trimite, >= 0
- `stock`: dacă se trimite, >= 0
- Varianta trebuie să aparțină produsului specificat

**Response**: 200 OK / 404 Not Found / 400 Bad Request

#### DELETE /api/admin/products/[id]/variants/[variantId]
Șterge o variantă

**Auth**: Required (ADMIN)

**Validări**:
- Varianta trebuie să aparțină produsului specificat

**Response**: 200 OK / 404 Not Found / 400 Bad Request

### Images

#### POST /api/admin/products/[id]/images
Adaugă o imagine nouă la produs

**Auth**: Required (ADMIN)

**Body**:
```json
{
  "url": "https://example.com/image.jpg"
}
```

**Validări**:
- `url`: required

**Response**: 201 Created / 404 Not Found

#### DELETE /api/admin/products/[id]/images/[imageId]
Șterge o imagine

**Auth**: Required (ADMIN)

**Validări**:
- Imaginea trebuie să aparțină produsului specificat

**Response**: 200 OK / 404 Not Found / 400 Bad Request

## 🔒 Protecție Acces

Toate endpoint-urile verifică:
1. **User autentificat**: trebuie să existe session
2. **User rol ADMIN**: `session.user.role === "ADMIN"`

Dacă verificările eșuează:
```json
{
  "error": "Unauthorized"
}
```
Status: 401

## 🧪 Testing

Vezi fișierul [TESTING.md](./TESTING.md) pentru scenarii complete de testare.

## 📝 Notițe

- Toate prețurile sunt stocate ca `Decimal(10, 2)` pentru precizie
- Ștergerea produselor se face cu cascade pentru images și variants
- Slug-urile trebuie să fie unice la nivel de bază de date
- OrderItems previne ștergerea produselor folosite în comenzi
