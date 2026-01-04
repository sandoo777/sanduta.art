# 🏗️ ARHITECTURA SISTEMULUI DE COȘ

## Diagrama fluxului de date

```
User Interface
│
├─ Header (src/components/public/Header.tsx)
│  └─ useCartStore → getTotals() → Badge cu itemCount
│
├─ Cart Page (src/app/(public)/cart/page.tsx)
│  ├─ CartList (componentă)
│  │  ├─ CartItem (componentă)
│  │  │  ├─ Preview + Specificații
│  │  │  ├─ onRemove → store.removeItem()
│  │  │  ├─ onDuplicate → store.duplicateItem()
│  │  │  └─ Link Edit: /produse/[slug]/configure?editItemId={id}
│  │  │
│  │  └─ useCartStore (store)
│  │     ├─ items: CartItem[]
│  │     └─ functions: addItem, removeItem, updateItem, etc.
│  │
│  └─ CartSummary (componentă sticky)
│     ├─ getTotals() → Subtotal, Discount, VAT, Total
│     └─ CTA "Finalizează comanda" → /checkout
│
└─ Configurator (src/app/(public)/produse/[slug]/configure/)
   ├─ Step 1-3: Selection & Customization
   └─ Step 4: Finalizare
      ├─ Detectează ?editItemId din URL
      ├─ Dacă edit: updateItem(editItemId, newData)
      └─ Dacă nou: addItem(newData) → redirect /cart
```

## Structura componentelor

```
CartStore (Zustand)
├── State
│   └── items: CartItem[]
├── Actions
│   ├── addItem(item) → itemId
│   ├── removeItem(itemId)
│   ├── updateItem(itemId, updates)
│   ├── duplicateItem(itemId) → newItemId
│   ├── clearCart()
│   ├── getTotals() → { subtotal, discount, vat, total, itemCount }
│   └── getItem(itemId) → CartItem | undefined
└── Middleware
    └── persist (localStorage)

CartItem Component
├── Props
│   ├── item: CartItem
│   ├── onRemove: (itemId) => void
│   └── onDuplicate: (itemId) => void
├── Display
│   ├── Preview Image
│   ├── Product Info
│   ├── Specifications (Dimensions, Material, Finishes, etc.)
│   ├── Price Breakdown
│   └── Upsells
└── Actions
    ├── Edit Button → /produse/[slug]/configure?editItemId=...
    ├── Duplicate Button → duplicateItem()
    └── Delete Button → removeItem()

CartList Component
├── Props: (none, uses store directly)
├── Display
│   ├── List of CartItem components
│   └── Empty state message
└── Logic
    └── Manage onRemove and onDuplicate handlers

CartSummary Component
├── Props: (none, uses store directly)
├── Display
│   ├── Subtotal
│   ├── Discount (if any)
│   ├── VAT
│   ├── Total (sticky)
│   ├── Info message about shipping
│   ├── CTA Button "Finalizează comanda"
│   ├── Trust badges
│   └── Additional info
└── Actions
    └── Navigate to /checkout

Cart Page
├── Layout
│   ├── Desktop: grid-cols-3 (2fr for items, 1fr for summary)
│   ├── Tablet: 1 column
│   └── Mobile: 1 column + sticky footer
├── Sections
│   ├── Header with breadcrumbs
│   ├── CartList (main)
│   ├── CartSummary (sticky on desktop, bottom on mobile)
│   ├── Additional info section
│   └── Trust section
└── Mobile enhancements
    └── Sticky footer with quick summary

Header Component
├── Logo
├── Navigation
├── Cart Icon (NEW)
│   ├── Link to /cart
│   └── Badge with itemCount
└── Mobile menu
    └── Cart link in menu
```

## Fluxul de date: User Journey

### 1. Adăugare în coș

```
User: Configurează produs → Click "Adaugă în coș"
  ↓
Step 4 Component: 
  - Pregătește CartItem cu toate datele
  - Apelează useCartStore.addItem(item)
  ↓
cartStore.addItem():
  - Generează unique ID: cart-item-{timestamp}-{random}
  - Adaugă item la state.items[]
  - localStorage se actualizează automat (persist middleware)
  ↓
Header: Detectează schimbare (getTotals.itemCount)
  - Badge se actualizează în real-time
  ↓
User: Redirecționare la /cart
  - Vede produsul nou în CartList
```

### 2. Editare din coș

```
User: Pe /cart → Click "Editează configurarea"
  ↓
URL: /produse/[slug]/configure?editItemId=cart-item-123
  ↓
Configurator detectează editItemId:
  - Apelează getItem(editItemId) din store
  - Preîncarcă datele în form
  - Afișează banner "Modul editare"
  ↓
User: Modifica specificații → Click "Finalizează"
  ↓
Step 4 Component:
  - Detectează editItemId din sessionStorage
  - Apelează updateItem(editItemId, newData) în loc de addItem()
  - sessionStorage.removeItem('editItemId')
  ↓
cartStore.updateItem():
  - Găsește item cu id === editItemId
  - Înlocuiește cu noile date
  - localStorage se actualizează
  ↓
User: Redirecționare la /cart
  - Produsul se afișează cu datele noi
```

### 3. Ștergere din coș

```
User: Pe /cart → Click "Șterge"
  ↓
CartItem Component:
  - Cere confirmație
  ↓
onRemove handler:
  - Apelează useCartStore.removeItem(itemId)
  ↓
cartStore.removeItem():
  - Filtrează items, scoate cartItem cu id === itemId
  - localStorage se actualizează
  ↓
UI Update:
  - CartItem dispare din listă
  - CartSummary se recalculează
  - Header badge se actualizează
```

### 4. Duplicare din coș

```
User: Pe /cart → Click "Duplică"
  ↓
CartItem Component:
  - Apelează onDuplicate(itemId)
  ↓
CartList handler:
  - Apelează useCartStore.duplicateItem(itemId)
  ↓
cartStore.duplicateItem():
  - Găsește original item
  - Creează nou item cu aceleași date (minus id și addedAt)
  - Apelează addItem() pentru noul item
  - Returnează newItemId
  ↓
UI Update:
  - Noua copie apare în listă
  - CartSummary se recalculează
  - Header badge se actualizează
```

## Calculele financiare

```
cartStore.getTotals() → {

  subtotal = SUM(item.totalPrice pentru fiecare item)

  discount = {
    if (subtotal > 1000 RON) {
      return subtotal * 0.05  // 5% discount
    }
    return 0
  }

  vat = (subtotal - discount) * 0.19  // 19% VAT în România

  total = subtotal - discount + vat

  itemCount = SUM(item.specifications.quantity pentru fiecare item)

  return { subtotal, discount, vat, total, itemCount }
}
```

## Interfețele TypeScript

```typescript
interface CartItem {
  id: string;                              // auto-generated
  productId: string;                       // din produs
  productSlug: string;                     // pentru edit link
  name: string;                            // nume produs
  previewUrl?: string;                     // thumbnail
  fileUrl?: string;                        // design file
  specifications: CartItemSpecifications;  // user selections
  upsells: CartItemUpsell[];              // optional extras
  priceBreakdown: CartItemPriceBreakdown;  // cost details
  totalPrice: number;                      // final price
  addedAt: Date;                          // timestamp
}

interface CartItemSpecifications {
  dimensions: {
    width: number;      // cm
    height: number;     // cm
    depth?: number;     // cm (optional)
  };
  material: {
    id: string;
    name: string;       // e.g., "170g Coated"
  };
  finishes?: {
    id: string;
    name: string;       // e.g., "Glossy"
    type: string;       // e.g., "coating"
  }[];
  quantity: number;     // buc
  productionTime: string; // e.g., "5-7 zile"
}

interface CartItemUpsell {
  id: string;
  name: string;
  price: number;        // RON
}

interface CartItemPriceBreakdown {
  basePrice: number;       // product price
  materialCost: number;    // extra for material
  finishingCost: number;   // extra for finishes
  upsellsCost: number;     // sum of upsells
  quantityDiscount: number; // bulk discount (if any)
  subtotal: number;        // all costs minus discounts
}

interface CartTotals {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  itemCount: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => string;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  duplicateItem: (itemId: string) => string;
  clearCart: () => void;
  getTotals: () => CartTotals;
  getItem: (itemId: string) => CartItem | undefined;
}
```

## localStorage Schema

```json
{
  "sanduta-cart-storage": {
    "state": {
      "items": [
        {
          "id": "cart-item-1704355200000-abc1d2e3",
          "productId": "prod-123",
          "productSlug": "carti-personalizate",
          "name": "Cărți personalizate A5",
          "previewUrl": "https://cdn.example.com/preview.jpg",
          "fileUrl": "https://storage.example.com/design.pdf",
          "specifications": {
            "dimensions": { "width": 148, "height": 210 },
            "material": { "id": "mat-170g", "name": "170g" },
            "finishes": [{ "id": "finish-glossy", "name": "Glossy", "type": "coating" }],
            "quantity": 500,
            "productionTime": "5-7 zile"
          },
          "upsells": [
            { "id": "upsell-1", "name": "Cutie ambalare", "price": 150 }
          ],
          "priceBreakdown": {
            "basePrice": 1000,
            "materialCost": 200,
            "finishingCost": 150,
            "upsellsCost": 150,
            "quantityDiscount": 50,
            "subtotal": 1450
          },
          "totalPrice": 1450,
          "addedAt": "2026-01-04T22:42:21.335Z"
        }
      ]
    },
    "version": 0
  }
}
```

## Performance Optimizations

```
Zustand Store:
├── Shallow equality (state updates only affected parts)
├── Persist middleware (auto-saves to localStorage)
└── No unnecessary re-renders

Component Rendering:
├── CartItem: useCallback for handlers
├── CartList: Maps CartItems efficiently
├── CartSummary: Sticky positioning (CSS, not JS)
└── Header: Minimal re-renders on cart change

Image Loading:
├── next/image optimization
├── Lazy loading for thumbnails
└── Responsive sizes (srcSet)

CSS:
├── Tailwind for optimization
├── Mobile-first approach
├── Minimal custom CSS
└── Hardware acceleration (transform, will-change)
```

## Browser Compatibility

```
Tested on:
✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers (iOS Safari, Chrome Mobile)

Features used:
✅ localStorage (IE11+)
✅ CSS Grid (IE11+)
✅ CSS Flexbox (IE11+)
✅ Promise/async-await (modern)
✅ ES2020+ features (transpiled by Next.js)
```

---

Această arhitectură asigură:
- **Simplitate:** Store-ul este ușor de înțeles și de extins
- **Performance:** Minimal re-renders și localStorage caching
- **Flexibility:** Ușor de adăuga noi features (checkout, payments, etc.)
- **Maintainability:** Cod clar, tipuri TypeScript, bine documentat
- **Scalability:** Gata pentru integrare cu backend APIs viitoare
