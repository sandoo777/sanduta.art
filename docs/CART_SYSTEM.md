# 🛒 Sistemul Complet de Coș de Cumpărături

## Vizualizare generală

Sistemul de coș oferă o experiență modernă și completă pentru gestionarea produselor configurate, cu suport pentru editare, duplicare și finalizare de comenzi.

---

## 📁 Structură de fișiere

```
src/
├── modules/cart/
│   ├── cartStore.ts          # Zustand store cu state management
│   └── useCartActions.ts     # Hook pentru adăugare/actualizare în coș
├── components/public/cart/
│   ├── CartItem.tsx          # Componenta pentru item individual
│   ├── CartList.tsx          # Lista cu toate produsele
│   └── CartSummary.tsx       # Sidebar cu total și CTA
├── app/(public)/cart/
│   └── page.tsx              # Pagina principală a coșului
└── components/public/
    └── Header.tsx            # Header actualizado cu indicator coș
```

---

## 🏗️ Arhitectura sistemului

### 1. **Cart Store** (`cartStore.ts`)
Zustand store cu persistență în localStorage.

**Interfețe:**
- `CartItem` - Structura unui produs în coș
- `CartItemSpecifications` - Specificații produs
- `CartItemUpsell` - Opțiuni adiționale
- `CartItemPriceBreakdown` - Detalii preț

**Funcții disponibile:**
```typescript
addItem(item)              // Adaugă produs nou
removeItem(itemId)         // Șterge produs
updateItem(itemId, data)   // Actualizează produs
duplicateItem(itemId)      // Copiază produs
clearCart()                // Golește coșul
getTotals()                // Calculează totaluri
getItem(itemId)            // Preiau informații produs
```

### 2. **Componente UI**

#### CartItem.tsx
Afișează un produs cu:
- ✅ Preview imagine
- ✅ Specificații (dimensiuni, material, finisaje, cantitate, timp producție)
- ✅ Detalii preț pe bucată
- ✅ Pret total
- ✅ Butoane: Editează, Duplică, Șterge
- ✅ Display opțiuni adiționale
- ✅ Breakdown detaliat al prețului

#### CartList.tsx
- Afișează lista de produse
- Mesaj pentru coș gol
- Butoane de acțiune (remove, duplicate)

#### CartSummary.tsx
Sidebar sticky cu:
- Subtotal
- Reduceri (dacă sunt)
- TVA (19%)
- Total final
- CTA "Finalizează comanda"
- Informații de încredere
- Badge-uri de siguranță

### 3. **Pagina Cart**
Layout responsive:
- Desktop: 2 coloane (listă + sidebar)
- Mobil: 1 coloană cu sidebar sticky jos

---

## ✨ Funcționalități principale

### Adăugare în coș
```typescript
import { useCartStore } from '@/modules/cart/cartStore';

const { addItem } = useCartStore();

addItem({
  productId: 'prod-123',
  productSlug: 'carti-personalizate',
  name: 'Cărți personalizate A5',
  previewUrl: '/preview.png',
  specifications: {
    dimensions: { width: 148, height: 210 },
    material: { id: 'mat-1', name: '170g' },
    quantity: 500,
    productionTime: '5-7 zile'
  },
  upsells: [],
  priceBreakdown: { /* ... */ },
  totalPrice: 1500
});
```

### Editare din coș
1. Click pe "Editează configurarea"
2. URL: `/produse/[slug]/configure?editItemId=cart-item-123`
3. Configuratorul preîncarcă datele
4. La finalizare: `updateItem()` în loc de `addItem()`

### Duplicare
Copiază produsul cu toate specificațiile și creează o nouă intrare în coș.

### Ștergere
Confirmă și elimină produsul din coș.

---

## 📱 Design responsive

### Desktop (>1024px)
- Grid 2 coloane
- CartSummary sticky pe dreapta
- Layout aerisit, prețuri bine vizibile

### Mobil (<768px)
- Layout 1 coloană
- CartSummary sticky la jos
- Butoane full-width
- Produs cu imagine sus, detalii jos

---

## 🎨 Branding

```css
Primary: #0066FF         (albastru)
Secondary: #111827       (negru)
Accent: #FACC15          (galben)
Background: #F9FAFB      (gri foarte ușor)
Border radius: 8px
Shadow-uri subtile
```

---

## 💾 Persistență

Datele sunt salvate automat în localStorage sub cheia `sanduta-cart-storage`.

Coșul se sincronizează automat la refresh, fără pierdere de date.

---

## 🔗 Integrare Header

Header-ul public include:
- Icon coș cu badge de notificare
- Număr total de produse (capped la 9+)
- Link către pagina cart
- Responsive pe mobil și desktop

---

## 📊 Calcule financiare

```
Subtotal = SUM(totalPrice pentru fiecare produs)

Discount = 
  - 5% dacă subtotal > 1000 RON
  - 0 în caz contrar

VAT = (Subtotal - Discount) × 19%

Total = Subtotal - Discount + VAT
```

---

## 🧪 Testare

Rulează scriptul de testare:
```bash
./scripts/test-cart-system.sh
```

**Test 1:** Adăugare produs
- Adaugă produs din configurator
- Verifica dacă apare în coș

**Test 2:** Editare produs
- Apasă "Editează configurarea"
- Modifica specificații
- Verifica actualizare în coș

**Test 3:** Ștergere produs
- Apasă "Șterge"
- Confirma acțiune
- Verifica ștergere

**Test 4:** Duplicare produs
- Apasă "Duplică"
- Verifica dacă apare copia

**Test 5:** Calcul total
- Verifica subtotal, TVA, total
- Verifica formula matematică

**Test 6:** Responsive
- Testează pe mobil și desktop
- Verifica layout-uri

---

## 🚀 Urmaturile etape

### 1. Checkout Page
Pagina de finalizare cu:
- Datele de contact
- Adresa de livrare
- Selectare metoda plată
- Recapitulare comandă

### 2. Payment Integration
- Stripe/PayPal integration
- Securitate și validare

### 3. Order Management
- Pagina de comenzi utilizator
- Status și tracking

### 4. Analytics
- Abandon rate
- Conversion tracking
- Popular products

---

## 📝 API Integration Points

Componentele sunt gata pentru integrare cu:
- **Backend:** POST /api/cart/items
- **Payment:** POST /api/orders/checkout
- **Verification:** GET /api/cart/validate

---

## ✅ Checklist implementare

- ✅ Cart store cu Zustand
- ✅ CartItem component cu preview și specificații
- ✅ CartList cu lista de produse
- ✅ CartSummary cu totaluri
- ✅ Pagina cart cu layout responsive
- ✅ Suport editare din configurator
- ✅ Indicator coș în header
- ✅ Persistență în localStorage
- ✅ Design modern și branding
- ✅ Testare completă

---

## 🎯 UX Highlights

1. **Claritate maxima** - Prețuri și detalii ușor de înțeles
2. **Acțiuni rapide** - Edit, duplicate, delete ușor accesibile
3. **Mobile-first** - Layout perfect pe orice ecran
4. **Încredere** - Badge-uri de siguranță și garanție
5. **Persistență** - Datele se salvează automat
6. **Intuitiv** - Fluxul este natural și clar

---

## 📞 Support

Pentru întrebări sau probleme, contactează echipa de development.
