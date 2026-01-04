# Configurator Produs - Pasul 1: Specificații

## 📋 Descriere

Primul pas al configuratorului permite utilizatorului să selecteze specificațiile principale ale produsului tipografic:
- **Dimensiune**: A6, A5, A4, Custom
- **Material**: 130g, 170g, 300g
- **Finisaje**: Laminare Mat, Laminare Lucioasă, UV Spot, Foil, Cornute
- **Cantitate**: Preset-uri (100, 250, 500, 1000, 2500) + input custom
- **Timp producție**: Standard (5-7 zile), Express (2-3 zile), Super Express (24h)

## 🎯 Caracteristici Implementate

### 1. Calcul Preț în Timp Real
- **Hook**: `usePriceCalculator()` - logic de calcul centralizată
- **Debouncing**: Recalculare după 180ms pentru optimizare
- **Breakdown detaliat**: Preț bază, finisaje, cantitate, producție
- **Sidebar sticky**: Preț mereu vizibil pe desktop
- **Mobile bar**: Bottom sticky bar cu preț + CTA pe mobil

### 2. UI/UX Premium
- **Design modern**: Carduri cu hover effects, shadows, active states
- **Iconuri**: Fiecare secțiune are icon + titlu + subtitlu
- **Active state**: Ring blue cu checkmark pentru opțiunea selectată
- **Multi-select**: Finisaje permit selectare multiplă
- **Responsive**: Grid 1→2→3 coloane, sidebar/mobile bar adaptat

### 3. Componente Stepper
- **Visual progress**: 4 pași cu indicare clară
- **Step activ**: Bold + blue color
- **Step completat**: Checkmark verde
- **Step viitor**: Gray + disabled

### 4. Breadcrumbs Navigation
- **3 niveluri**: Produse → Flyere A5 → Configurator
- **Links funcționale**: Navigare înapoi la catalog/produs
- **Separator**: Chevron icon între nivele

## 📂 Structură Fișiere

```
src/
├── modules/
│   └── configurator/
│       └── usePriceCalculator.ts          # Hook calcul preț
│
├── components/
│   └── public/
│       └── configurator/
│           ├── Step1Specifications.tsx    # UI Pasul 1
│           └── PriceSidebar.tsx           # Sidebar preț
│
└── app/
    └── (public)/
        └── produse/
            └── [slug]/
                └── configure/
                    └── page.tsx           # Pagină configurator
```

## 🔧 API Hook: usePriceCalculator

### Interfețe TypeScript

```typescript
export type Dimension = 'A6' | 'A5' | 'A4' | 'Custom';
export type Material = '130g' | '170g' | '300g';
export type Finish = 'laminated-mat' | 'laminated-glossy' | 'uv-spot' | 'foil' | 'rounded';
export type ProductionSpeed = 'standard' | 'express' | 'super-express';

export interface PriceSelection {
  dimension: Dimension;
  material: Material;
  finishes: Finish[];
  quantity: number;
  productionSpeed: ProductionSpeed;
}

export interface PriceBreakdown {
  basePrice: number;
  finishesPrice: number;
  quantityPrice: number;
  productionSpeedPrice: number;
  subtotal: number;
  tva: number;
  total: number;
}
```

### Funcții de Calcul

```typescript
const calculator = usePriceCalculator();

// Calcul preț bază (dimensiune + material)
calculator.calcBasePrice('A5', '170g') // → 180 RON

// Calcul preț finisaje
calculator.calcFinishPrice(['laminated-mat', 'uv-spot']) // → 50 RON

// Calcul preț cantitate (discount volume)
calculator.calcQuantityPrice(500, 180) // → discount 10%

// Calcul preț timp producție
calculator.calcProductionSpeedPrice('express') // → +30%

// Calcul total cu breakdown
calculator.calcTotal(selection) // → PriceBreakdown complet
```

### Logica Prețuri

**Prețuri Bază (RON):**
| Dimensiune | 130g | 170g | 300g |
|------------|------|------|------|
| A6         | 120  | 140  | 180  |
| A5         | 180  | 210  | 260  |
| A4         | 260  | 300  | 380  |
| Custom     | 300  | 350  | 450  |

**Finisaje (RON):**
- Laminare Mat: +15
- Laminare Lucioasă: +20
- UV Spot: +35
- Foil: +50
- Cornute: +10

**Discounturi Cantitate:**
- 100-249: 0%
- 250-499: -5%
- 500-999: -10%
- 1000-2499: -15%
- 2500+: -20%

**Timp Producție:**
- Standard (5-7 zile): 0%
- Express (2-3 zile): +30%
- Super Express (24h): +80%

**TVA:** 19%

## 🎨 UI Components

### Step1Specifications

**Structură:**
```tsx
<div className="space-y-8">
  {/* 1. Dimensiune */}
  <Section icon={SizeIcon} title="Dimensiune" subtitle="...">
    {dimensionOptions.map(option => (
      <Card onClick={setDimension} active={dimension === option.value}>
        {/* Icon, Label, Description, Checkmark */}
      </Card>
    ))}
  </Section>

  {/* 2. Material */}
  <Section icon={MaterialIcon} title="Material" subtitle="...">
    {/* Similar structure */}
  </Section>

  {/* 3. Finisaje (multi-select) */}
  <Section icon={FinishIcon} title="Finisaje" subtitle="...">
    {/* Toggle finishes array */}
  </Section>

  {/* 4. Cantitate */}
  <Section icon={QuantityIcon} title="Cantitate" subtitle="...">
    {/* Presets + custom input */}
  </Section>

  {/* 5. Timp producție */}
  <Section icon={ClockIcon} title="Timp de producție" subtitle="...">
    {/* Production speed options */}
  </Section>
</div>
```

**Props:**
```typescript
interface Step1SpecificationsProps {
  selection: PriceSelection;
  onSelectionChange: (key: keyof PriceSelection, value: any) => void;
}
```

**Clase Active State:**
```tsx
const activeClasses = isActive
  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
  : 'border-gray-200 hover:border-blue-400 hover:shadow-md';
```

### PriceSidebar

**Structură:**
```tsx
<aside className="lg:sticky lg:top-24 h-fit">
  {/* Header */}
  <h3>Preț estimat</h3>
  <p className="text-3xl font-bold text-blue-600">{total} RON</p>

  {/* Breakdown */}
  <div className="space-y-2 text-sm">
    <BreakdownRow label="Preț bază" value={basePrice} />
    <BreakdownRow label="Finisaje" value={finishesPrice} />
    <BreakdownRow label="Discount cantitate" value={-quantityDiscount} />
    <BreakdownRow label="Timp producție" value={productionSpeedPrice} />
    <Separator />
    <BreakdownRow label="Subtotal" value={subtotal} />
    <BreakdownRow label="TVA (19%)" value={tva} />
    <Separator />
    <BreakdownRow label="Total" value={total} bold />
  </div>

  {/* CTA */}
  <button className="w-full bg-blue-600">
    Continuă la pasul 2
  </button>

  {/* Trust signals */}
  <TrustBadges />
</aside>
```

**Debounced Recalculation:**
```typescript
useEffect(() => {
  const handle = setTimeout(() => {
    setBreakdown(calculator.calcTotal(selection));
  }, 180);
  return () => clearTimeout(handle);
}, [selection, calculator]);
```

### Pagina Configure

**Layout Desktop:**
```tsx
<div className="grid lg:grid-cols-[1fr_380px] gap-8">
  {/* Left: Step content */}
  <div>
    <Breadcrumbs />
    <Stepper currentStep={1} />
    <Step1Specifications />
  </div>

  {/* Right: Sticky sidebar */}
  <PriceSidebar className="hidden lg:block" />
</div>
```

**Layout Mobile:**
```tsx
{/* Mobile sticky bottom bar */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
  <div className="flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-600">Total estimat</p>
      <p className="text-2xl font-bold text-blue-600">{total} RON</p>
    </div>
    <button>Continuă →</button>
  </div>
</div>
```

## 🧪 Testare

### Script Automat

```bash
chmod +x scripts/test-configurator-step1.sh
./scripts/test-configurator-step1.sh
```

**Verificări:**
- ✅ Structură fișiere
- ✅ Hook price calculator
- ✅ Step1Specifications componente
- ✅ PriceSidebar integrare
- ✅ Pagină configurator layout
- ✅ Responsive design
- ✅ Branding aplicat
- ✅ UX features

### Testare Manuală

1. **Pornește dev server:**
   ```bash
   npm run dev
   ```

2. **Accesează pagina:**
   ```
   http://localhost:3000/produse/flyere-a5/configure
   ```

3. **Verifică funcționalități:**
   - [ ] Selectează dimensiune → preț se actualizează instant
   - [ ] Selectează material → preț se recalculează
   - [ ] Toggle finisaje (multi-select) → preț include toate
   - [ ] Schimbă cantitate → preț aplică discount volume
   - [ ] Selectează timp producție → preț se ajustează
   - [ ] Verifică breakdown detaliat în sidebar
   - [ ] Testează responsive (resize browser):
     - Desktop: Sidebar sticky în dreapta
     - Mobile: Bottom sticky bar
   - [ ] Verifică breadcrumbs navigare
   - [ ] Verifică stepper vizual

4. **Verifică UX:**
   - [ ] Hover effects pe carduri
   - [ ] Active state cu ring blue + checkmark
   - [ ] Iconuri vizibile pentru toate secțiunile
   - [ ] Preț mereu vizibil (sidebar/mobile bar)
   - [ ] Loading smooth (debounce 180ms)

## 🚀 Next Steps

### Pasul 2: Personalizare
- [ ] Upload fișier design
- [ ] Template-uri presetate
- [ ] Editor text simplu
- [ ] Previzualizare design

### Pasul 3: Upload Fișiere
- [ ] Drag & drop zone
- [ ] Validare fișiere (format, dimensiune)
- [ ] Preview fișier încărcat
- [ ] Multiple file support

### Pasul 4: Sumar & Checkout
- [ ] Review toate specificațiile
- [ ] Modificare rapidă orice pas
- [ ] Integrare opțiuni livrare
- [ ] Integrare plată PayNet

### Îmbunătățiri Backend
- [ ] API endpoint save configuration
- [ ] Persistare configurație în DB
- [ ] Restore configurație din draft
- [ ] Email notificare comandă

## 📚 Referințe

**Fișiere cheie:**
- [usePriceCalculator.ts](../src/modules/configurator/usePriceCalculator.ts)
- [Step1Specifications.tsx](../src/components/public/configurator/Step1Specifications.tsx)
- [PriceSidebar.tsx](../src/components/public/configurator/PriceSidebar.tsx)
- [configure/page.tsx](../src/app/(public)/produse/[slug]/configure/page.tsx)

**Dependencies:**
- Next.js 16.1.1 (App Router)
- TypeScript (strict mode)
- Tailwind CSS (utility-first)
- Framer Motion (animations)

**Design System:**
- Primary: `blue-600` (#0066FF)
- Accent: `yellow-400` (#FACC15)
- Border radius: `rounded-lg` (8px)
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`
- Spacing: Tailwind 8px scale

---

**Status:** ✅ Pasul 1 COMPLET  
**Data finalizare:** 4 ianuarie 2026  
**Testat:** ✅ Script automat + testare manuală  
**Deployed:** Ready pentru integrare
