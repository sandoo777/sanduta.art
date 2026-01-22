# G2.3 - Inventar Componente Frontend Public pentru Standardizare

**Data:** 2026-01-22  
**Task:** Identificare componente custom care trebuie standardizate conform Task D1  
**Scope:** Pagini publice critice (Home, Catalog, Cart, Checkout)

---

## 📊 Executive Summary

### Statistici Generale

| Categorie | Total | Standardizate | Custom | % Completare |
|-----------|-------|---------------|--------|--------------|
| **Buttons** | 28 | 2 (7%) | 26 (93%) | 7% |
| **Cards** | 16 | 0 (0%) | 16 (100%) | 0% |
| **Inputs** | 11 | 0 (0%) | 11 (100%) | 0% |
| **Modals** | 1 | 1 (100%) | 0 (0%) | 100% |
| **TOTAL** | **56** | **3 (5%)** | **53 (95%)** | **5%** |

### ⚠️ Constatare Majoră

**95% din componentele UI analizate sunt custom și trebuie standardizate!**

---

## 🎯 Prioritizare

### 🔴 CRITICAL (1 component)

#### ProductCard
**File:** [src/components/public/catalog/ProductCard.tsx](src/components/public/catalog/ProductCard.tsx)

- **Motivație:** Cel mai folosit component din aplicație
- **Impact:** Foarte mare - afișat în homepage, toate listele catalog, search results
- **Probleme:**
  - Custom motion.div cu hover effects complexe
  - 2 butoane custom (quick view + configure)
  - Badge system custom
  - Card complet custom
- **Efort estimat:** 4-6 ore
- **Recomandare:** REFACTOR COMPLET cu prioritate maximă

---

### 🟠 HIGH (6 componente)

#### 1. CartItem
**File:** [src/components/public/cart/CartItem.tsx](src/components/public/cart/CartItem.tsx)

- Complex card cu 3 butoane custom
- Central în UX checkout flow
- **Butoane custom:**
  - Edit configuration (primary)
  - Duplicate (outline)
  - Remove (danger)
- **Efort:** 1-2 ore

#### 2. CartSummary
**File:** [src/components/public/cart/CartSummary.tsx](src/components/public/cart/CartSummary.tsx)

- CTA principal pentru checkout
- Button custom cu loading/disabled states
- Card custom sticky
- **Efort:** 1-1.5 ore

#### 3. CheckoutForm
**File:** [src/app/(public)/checkout/page.tsx](src/app/(public)/checkout/page.tsx)

- 5+ inputs custom (text, email, tel)
- Radio buttons custom pentru delivery/payment
- Submit button custom cu states
- **Efort:** 2-3 ore

#### 4. FeaturedCategories
**File:** [src/components/public/home/FeaturedCategories.tsx](src/components/public/home/FeaturedCategories.tsx)

- 6 category cards custom cu hover effects complexe
- Homepage visibility mare
- **Efort:** 1-1.5 ore

#### 5. PopularProducts
**File:** [src/components/public/home/PopularProducts.tsx](src/components/public/home/PopularProducts.tsx)

- Product cards custom (wrapper pentru ProductCard)
- 2 CTA buttons cu custom classes
- Homepage visibility
- **Efort:** 1 oră

#### 6. ProductQuickView
**File:** [src/components/public/catalog/ProductQuickView.tsx](src/components/public/catalog/ProductQuickView.tsx)

- ✅ Modal deja standardizat (bun exemplu!)
- ❌ 2 CTA buttons custom
- **Efort:** 0.5-1 oră

---

### 🟡 MEDIUM (6 componente)

#### 1. Hero (Homepage)
- 2 buttons cu custom classes override
- Variant conflicts (outline cu culori custom)
- **Efort:** 0.5-1 oră

#### 2. FinalCTA (Homepage)
- 2 buttons pe fundal colorat (inverse variant)
- Custom hover effects
- **Efort:** 0.5-1 oră

#### 3. Filters (Catalog)
- Select custom
- 2 number inputs (min/max price)
- Multiple checkboxes custom
- **Efort:** 2-3 ore

#### 4. CartList
- Empty state card (ar trebui EmptyState UI)
- 1 CTA button custom
- **Efort:** 0.5 ore

#### 5. WhyChooseUs
- 6 benefit cards cu hover effects
- **Efort:** 1 oră

#### 6. Testimonials
- Testimonial cards custom
- Carousel dots (păstrează custom - specific)
- **Efort:** 1 oră

---

### 🟢 LOW (1 component)

#### QuantitySelector
**File:** [src/components/public/cart/QuantitySelector.tsx](src/components/public/cart/QuantitySelector.tsx)

- Component specialized pentru quantity
- **Recomandare:** Păstrează custom dar asigură consistență vizuală
- **Efort:** 0 ore (doar verificare)

---

## 📋 Inventar Detaliat

### HOME Page

#### Buttons (6 total)

| Component | File | Line | Status | Variant | Priority |
|-----------|------|------|--------|---------|----------|
| Hero CTA Primary | Hero.tsx | 50 | ✅ OK | primary | low |
| Hero CTA Outline | Hero.tsx | 56 | ⚠️ Custom classes | outline | medium |
| Popular Products CTA | PopularProducts.tsx | 91 | ⚠️ Custom hover | outline | medium |
| View All Products | PopularProducts.tsx | 105 | ⚠️ Custom classes | outline | medium |
| Final CTA Primary | FinalCTA.tsx | 33 | ⚠️ Inverse colors | custom | medium |
| Final CTA Contact | FinalCTA.tsx | 40 | ⚠️ Ghost white | outline | medium |

#### Cards (4 total)

| Component | File | Content | Status | Priority |
|-----------|------|---------|--------|----------|
| Product Cards | PopularProducts.tsx | Product grid items | ❌ Custom | high |
| Category Cards | FeaturedCategories.tsx | 6 categories | ❌ Custom | high |
| Benefit Cards | WhyChooseUs.tsx | 6 benefits | ❌ Custom | medium |
| Testimonial Cards | Testimonials.tsx | Testimonials | ❌ Custom | medium |

---

### PRODUCT CARD Component

#### Buttons (2)
- Quick View button (icon) - ❌ Custom
- Configure CTA - ❌ Custom

#### Cards (1)
- **CRITICAL:** motion.div wrapper cu badges, image, price, specs - REFACTOR COMPLET

---

### CART Page

#### Buttons (5 total)

| Component | File | Action | Status | Variant | Priority |
|-----------|------|--------|--------|---------|----------|
| Explore Products | CartList.tsx | Empty state CTA | ❌ Custom | primary | high |
| Checkout CTA | CartSummary.tsx | Proceed to checkout | ❌ Custom | primary | high |
| Edit Configuration | CartItem.tsx | Edit item | ❌ Custom | primary | high |
| Duplicate Item | CartItem.tsx | Duplicate | ❌ Custom | outline | high |
| Remove Item | CartItem.tsx | Delete | ❌ Custom | danger | high |

#### Cards (3)

| Component | File | Content | Status | Priority |
|-----------|------|---------|--------|----------|
| Empty State | CartList.tsx | No items message | ⚠️ Custom (use EmptyState) | medium |
| Cart Item | CartItem.tsx | Item details + actions | ❌ Custom | high |
| Cart Summary | CartSummary.tsx | Totals + CTA | ❌ Custom | high |

#### Inputs (1)
- QuantitySelector - ⚠️ Keep custom (specialized)

---

### CHECKOUT Page

#### Buttons (2)

| Component | Action | Status | Variant | Priority |
|-----------|--------|--------|---------|----------|
| Back to Cart | Navigate back | ❌ Custom | ghost | medium |
| Submit Order | Form submit | ❌ Custom + states | primary | high |

#### Cards (3)

| Component | Content | Status | Priority |
|-----------|---------|--------|----------|
| Form Container | Checkout form | ❌ Custom | high |
| Error Alert | Error message | ⚠️ Create Alert UI | medium |
| Order Summary | Sticky sidebar | ❌ Custom | high |

#### Inputs (5+)

| Type | Name | Status | Priority |
|------|------|--------|----------|
| text | customerName | ❌ Custom | high |
| email | customerEmail | ❌ Custom | high |
| tel | customerPhone | ❌ Custom | high |
| radio | deliveryMethod | ⚠️ Create Radio UI | medium |
| radio | paymentMethod | ⚠️ Create Radio UI | medium |
| text | deliveryAddress | ❌ Custom | high |

---

### CATALOG (Filters + Quick View)

#### Buttons (6)

| Component | File | Action | Status | Priority |
|-----------|------|--------|--------|----------|
| Reset Filters | Filters.tsx | Clear all | ❌ Custom | medium |
| Open Filters (Mobile) | Filters.tsx | Show drawer | ❌ Custom | medium |
| Close Drawer | Filters.tsx | Hide drawer | ❌ Custom | low |
| Quick View CTA | ProductQuickView.tsx | Configure | ❌ Custom | high |
| View Details | ProductQuickView.tsx | Full page | ❌ Custom | high |

#### Cards (2)

| Component | Content | Status | Priority |
|-----------|---------|--------|----------|
| Filters Sidebar | Desktop filters | ❌ Custom | medium |

#### Inputs (4)

| Type | Field | Status | Priority |
|------|-------|--------|----------|
| select | categoryId | ❌ Custom | high |
| number | minPrice | ❌ Custom | medium |
| number | maxPrice | ❌ Custom | medium |
| checkbox | productTypes[] | ⚠️ Create Checkbox UI | medium |
| checkbox | materials[] | ⚠️ Create Checkbox UI | medium |

#### Modals (1)
- ✅ **ProductQuickView** - folosește Modal UI corect!

---

## 🎬 Plan de Acțiune

### Faza 1: CRITICAL (Săptămâna 1)

**Total estimat: 4-6 ore**

1. **ProductCard** - REFACTOR COMPLET
   - Înlocuiește motion.div cu `<Card>`
   - Button quick view → `<Button variant="ghost" size="icon">`
   - Button configure → `<Button variant="primary">`
   - Standardizează badges, hover effects
   - Testează în toate contexte (home, catalog, search)

---

### Faza 2: HIGH PRIORITY (Săptămâna 2)

**Total estimat: 8-11 ore**

#### Cart Components (3-4 ore)
1. **CartItem**
   - Card wrapper → `<Card>`
   - Edit button → `<Button as="link" variant="primary">`
   - Duplicate → `<Button variant="outline">`
   - Remove → `<Button variant="danger">`

2. **CartSummary**
   - Card wrapper → `<Card>` sticky
   - Checkout button → `<Button variant="primary" loading={...}>`

3. **CartList**
   - Empty state → `<EmptyState>` (sau Card cu styling minimal)
   - CTA → `<Button as="link" variant="primary">`

#### Checkout Form (2-3 ore)
4. **CheckoutForm**
   - Toate `<input>` → `<Input label={...} required />`
   - Radio groups → Creează `<Radio>` component sau folosește `<FormField type="radio">`
   - Submit button → `<Button type="submit" loading={loading}>`
   - Error alert → Creează `<Alert variant="error">` sau folosește `<ErrorState>`

#### Home Components (2-3 ore)
5. **PopularProducts**
   - Button "Vezi toate" → `<Button variant="outline">` fără custom classes

6. **FeaturedCategories**
   - Cards → `<Card>` cu hover standardizat

7. **ProductQuickView**
   - CTA buttons → `<Button variant="primary">` și `<Button variant="outline">`

---

### Faza 3: MEDIUM PRIORITY (Săptămâna 3)

**Total estimat: 6-9 ore**

#### Homepage (2-3 ore)
1. **Hero**
   - Outline button → Decide: creează `variant="inverse"` sau folosește existent fără override

2. **FinalCTA**
   - Buttons pe fundal colorat → Decide: `variant="ghost-white"` sau alt approach

3. **WhyChooseUs**
   - Benefit cards → `<Card>` cu hover standardizat

4. **Testimonials**
   - Cards → `<Card>` cu structură consistentă

#### Catalog Filters (2-3 ore)
5. **Filters**
   - Select → `<Select options={...} />`
   - Number inputs → `<Input type="number" />`
   - Checkboxes → Creează `<Checkbox>` component sau `<FormField type="checkbox">`
   - Reset button → `<Button variant="ghost">`
   - Mobile drawer button → `<Button variant="outline">`

---

### Faza 4: NEW COMPONENTS (Opțional)

Dacă nu există deja în `src/components/ui/`:

1. **Alert** component
   - Variants: error, success, warning, info
   - Props: title, description, icon, onClose
   - Usage: checkout errors, cart notifications

2. **Radio** component
   - Props: name, value, checked, label
   - Group wrapper: RadioGroup
   - Usage: checkout delivery/payment options

3. **Checkbox** component
   - Props: name, checked, label
   - Usage: filters, terms acceptance

4. **EmptyState** component (verifică dacă există)
   - Props: icon, title, description, action
   - Usage: empty cart, no search results

---

## 📈 Estimări Finale

| Fază | Componente | Ore Estimate | Prioritate |
|------|------------|--------------|------------|
| **Faza 1** | ProductCard | 4-6 | CRITICAL |
| **Faza 2** | Cart + Checkout + QV | 8-11 | HIGH |
| **Faza 3** | Home + Filters | 6-9 | MEDIUM |
| **Faza 4** | New Components | 3-5 | OPTIONAL |
| **TOTAL** | **53 components** | **21-31 ore** | - |

---

## 🎨 Decizii de Design Necesare

### 1. Button Variants
**Întrebare:** Creăm variants noi sau folosim existenți?

Cazuri:
- Buttons pe fundal colorat (FinalCTA) - `variant="inverse"`?
- Outline buttons cu culori custom - consolidăm la `variant="outline"` standard?

**Recomandare:** 
- ✅ Adaugă `variant="inverse"` pentru text dark pe fundal light
- ✅ Elimină custom color overrides, folosește theme colors

### 2. Card Hover Effects
**Întrebare:** Ce hover effects standardizăm?

Cazuri:
- Shadow lift (common)
- Image scale (ProductCard, FeaturedCategories)
- Border accent (FeaturedCategories)
- Bottom border (WhyChooseUs)

**Recomandare:**
- ✅ Card UI standard: shadow lift la hover
- ✅ Custom hover effects rămân pe component-specific classes
- ✅ Documentează pattern în UI components guide

### 3. Form Components
**Întrebare:** Creăm Radio și Checkbox sau folosim FormField?

**Recomandare:**
- ✅ Creează componente dedicate pentru reusability
- ✅ Radio + RadioGroup pentru grouped options
- ✅ Checkbox pentru single/multiple choices
- ✅ FormField wrapper pentru integration cu react-hook-form

---

## ✅ Exemple Bune (Keep as Reference)

### Modal Usage
**File:** [src/components/public/catalog/ProductQuickView.tsx](src/components/public/catalog/ProductQuickView.tsx)

```tsx
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  {/* content */}
</Modal>
```

✅ **Perfect!** Folosește Modal UI corect, cu props standard.

### Button Usage (partial)
**File:** [src/components/public/home/Hero.tsx](src/components/public/home/Hero.tsx)

```tsx
<Button size="lg" className="group w-full sm:w-auto">
  Comandă acum
  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
</Button>
```

✅ **Aproape perfect!** Folosește Button UI, doar className pentru layout (OK).

---

## 🚨 Anti-Patterns de Evitat

### ❌ Custom Button Classes
```tsx
// BAD
<button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4">
  Click me
</button>

// GOOD
<Button variant="primary" size="lg">
  Click me
</Button>
```

### ❌ Override Button Variant Colors
```tsx
// BAD
<Button variant="outline" className="border-primary text-primary hover:bg-primary">
  Click
</Button>

// GOOD
<Button variant="primary">
  Click
</Button>
// SAU
<Button variant="outline"> {/* folosește culorile default */}
  Click
</Button>
```

### ❌ Custom Card Structure
```tsx
// BAD
<div className="bg-white rounded-lg shadow-sm p-6">
  <h3 className="font-bold">Title</h3>
  <p>Content</p>
</div>

// GOOD
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### ❌ Custom Inputs
```tsx
// BAD
<input 
  type="text" 
  className="w-full px-4 py-2 border rounded-lg focus:ring-2"
  placeholder="Name"
/>

// GOOD
<Input 
  type="text"
  label="Name"
  placeholder="Enter your name"
/>
```

---

## 📚 Resurse

- [UI Components Guide](docs/UI_COMPONENTS.md)
- [Button Documentation](src/components/ui/Button.tsx)
- [Card Documentation](src/components/ui/Card.tsx)
- [Input Documentation](src/components/ui/Input.tsx)
- [Modal Documentation](src/components/ui/Modal.tsx)
- [Form Documentation](src/components/ui/Form.tsx)

---

## 🔄 Next Steps

1. ✅ **Review raport** cu echipa
2. ✅ **Decide variants** noi (inverse, ghost-white)
3. ✅ **Create missing components** (Alert, Radio, Checkbox)
4. 🚀 **START Faza 1** - ProductCard refactor
5. 📊 **Track progress** - update completion rate

---

**Generated:** 2026-01-22  
**Version:** 1.0  
**Status:** Ready for Review  
**Next Review:** După Faza 1 (ProductCard completion)
