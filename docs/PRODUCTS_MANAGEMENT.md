# Products Management System

## 📋 Overview

Sistem complet de gestionare a produselor în Admin Panel cu următoarele funcționalități:

- ✅ Listă produse cu grid responsive
- ✅ Căutare cu debounce (300ms)
- ✅ Filtrare după categorie, tip, status
- ✅ Card-uri produse cu imagine, badges, meniu acțiuni
- ✅ Statistici live (total, active, inactive, pe tipuri)
- ✅ CRUD complet (create, read, update, delete, duplicate)
- ✅ Toggle status (active/inactive)

## 🗂️ Structură

### Backend

**Prisma Model:**
- `type`: STANDARD | CONFIGURABLE | CUSTOM
- `sku`: String unique (optional)
- `active`: Boolean (default: true)
- `category`: Relație cu Category
- `images`: Relație cu ProductImage[]

**API Endpoints:**
- `GET /api/admin/products` - Lista produse cu relații
- `POST /api/admin/products` - Creare produs
- `PATCH /api/admin/products/[id]` - Actualizare produs
- `DELETE /api/admin/products/[id]` - Ștergere produs
- `POST /api/admin/products/[id]/duplicate` - Duplicare produs

### Frontend

**Module:**
- `/src/modules/products/types.ts` - TypeScript interfaces
- `/src/modules/products/useProducts.ts` - React hook cu CRUD

**Components:**
- `/src/components/admin/products/ProductCard.tsx` - Card produs
- `/src/components/admin/products/ProductSearch.tsx` - Search cu debounce
- `/src/components/admin/products/CategoryFilter.tsx` - Filtru categorie
- `/src/components/admin/products/ProductTypeFilter.tsx` - Filtru tip
- `/src/components/admin/products/StatusFilter.tsx` - Toggle active

**Pages:**
- `/src/app/admin/products/page.tsx` - Pagina principală

## 🎨 Design System

### Culori Badges

**Product Types:**
- Standard → Blue (`primary`)
- Configurabil → Purple (`info`)
- Custom → Gray (`default`)

**Status:**
- Active → Green (`success`)
- Inactive → Red (`danger`)

### Branding

- Primary: `#0066FF` (Blue-600)
- Secondary: `#111827` (Gray-900)
- Accent: `#FACC15` (Yellow-400)
- Background: `#F9FAFB` (Gray-50)
- Border radius: `8px`
- Shadows: Subtle (hover only)

### Layout Responsive

- **Desktop (xl)**: 4 columns
- **Large (lg)**: 3 columns
- **Tablet (md)**: 2 columns
- **Mobile**: 1 column

## 🔧 Features

### 1. Search & Filters (Sticky Top Bar)

```tsx
- Search: Caută după nume, SKU, descriere (debounce 300ms)
- Category: Dropdown cu toate categoriile din DB
- Type: Dropdown (Standard/Configurabil/Custom/All)
- Status: Toggle "Doar active"
```

### 2. Product Card

```tsx
- Imagine (fallback: /placeholder-product.svg)
- Nume produs + SKU
- Categorie (icon + nume)
- Badges: Tip + Status
- Preț de bază (dacă există)
- Meniu acțiuni (3 dots):
  - Edit (→ /admin/products/[id]/edit)
  - Duplicate (POST /api/admin/products/[id]/duplicate)
  - Toggle Status (PATCH active: true/false)
```

### 3. Statistics Grid

6 stats cards:
- Total Products
- Active (green)
- Inactive (red)
- Standard (blue)
- Configurable (purple)
- Custom (gray)

### 4. Empty States

- **No products**: Mesaj + buton "Adaugă primul produs"
- **No results**: Mesaj "Nu s-au găsit produse cu filtrele aplicate"

## 📊 Data Flow

```
User Action → Component → useProducts Hook → API Route → Prisma → Database
                                ↓
                           Toast Notification
                                ↓
                            Reload Data
```

## 🧪 Testing

### Test 1: Load Products
✅ Produsele se încarcă corect cu toate relațiile

### Test 2: Search
✅ Căutarea funcționează cu debounce 300ms
✅ Caută în: name, sku, description

### Test 3: Filter by Category
✅ Dropdown-ul încarcă categoriile din DB
✅ Filtrarea funcționează instant

### Test 4: Filter by Type
✅ Dropdown cu 3 tipuri + "Toate tipurile"
✅ Filtrarea funcționează instant

### Test 5: Toggle Active Only
✅ Checkbox funcționează
✅ Afișează doar produsele active

### Test 6: Duplicate Product
✅ Creează copie cu "(Copy)" în nume
✅ SKU devine "[original]-COPY"
✅ Status devine inactive
✅ Stock devine 0
✅ Copiază imagini și variante

### Test 7: Responsive Design
✅ Grid se ajustează: 1 → 2 → 3 → 4 coloane
✅ Filtrele devin vertical pe mobil
✅ Butoane adaptive (text se ascunde pe mobil)

## 🚀 Usage

### Access Page
```
http://localhost:3000/admin/products
```

### Add New Product
```
Click "+ Add Product" → /admin/products/new
```

### Edit Product
```
Click card → Menu (3 dots) → Edit → /admin/products/[id]/edit
```

### Duplicate Product
```
Click card → Menu (3 dots) → Duplicate
→ Creates new product with "(Copy)" suffix
```

### Toggle Status
```
Click card → Menu (3 dots) → Activate/Deactivate
→ PATCH active: true/false
```

## 📦 Database Schema

```prisma
model Product {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  sku         String?     @unique
  description String?     @db.Text
  type        ProductType @default(STANDARD)
  price       Decimal     @default(0) @db.Decimal(10, 2)
  categoryId  String
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  category    Category         @relation(...)
  images      ProductImage[]
  variants    ProductVariant[]
  orderItems  OrderItem[]

  @@index([categoryId])
  @@index([slug])
  @@index([createdAt])
  @@index([active])
  @@map("products")
}

enum ProductType {
  STANDARD
  CONFIGURABLE
  CUSTOM
}
```

## 🔐 Security

- **Auth**: Requires ADMIN or MANAGER role
- **Credentials**: All API calls use `credentials: 'include'`
- **Validation**: Server-side validation în toate API routes

## 📝 Notes

- Produsele sunt sortate: active DESC, createdAt DESC
- Duplicarea setează automat `active: false`
- Placeholder image: `/placeholder-product.svg`
- Search debounce: 300ms (UX optimization)
- Filtrele sunt sticky top pentru acces rapid

## 🎯 Next Steps

- [ ] Implement product edit page
- [ ] Add bulk actions (delete multiple, export)
- [ ] Add product import/export
- [ ] Add advanced filters (price range, stock level)
- [ ] Add sorting options (name, price, date)
- [ ] Add pagination for large datasets
