# Product Builder System - Complete Specification

## 📋 Overview

Sistem complet de creare/editare produse pentru tipografie, cu suport pentru:
- Produse standard (preț fix)
- Produse configurabile (calculator dinamic)
- Produse custom (configurare manuală)

## 🗂️ Structură Fișiere

```
src/
├── app/admin/products/
│   ├── new/page.tsx ✅ (IMPLEMENTAT - versiune simplă)
│   └── [id]/edit/page.tsx (TODO)
├── components/admin/products/
│   ├── ProductBuilder.tsx (TODO - container principal)
│   ├── tabs/
│   │   ├── GeneralTab.tsx (TODO)
│   │   ├── OptionsTab.tsx (TODO)
│   │   ├── PricingTab.tsx (TODO)
│   │   ├── ProductionTab.tsx (TODO)
│   │   ├── SeoTab.tsx (TODO)
│   │   └── PreviewTab.tsx (TODO)
│   └── pricing/
│       ├── PriceBreaksTable.tsx (TODO)
│       ├── FormulaEditor.tsx (TODO)
│       └── PricePreview.tsx (TODO)
├── modules/products/
│   ├── types.ts ✅
│   ├── useProducts.ts ✅
│   ├── productBuilder.types.ts ✅
│   └── useProductBuilder.ts ✅
└── app/api/admin/products/
    ├── route.ts ✅ (GET, POST)
    ├── [id]/route.ts ✅ (GET, PATCH, DELETE)
    ├── [id]/duplicate/route.ts ✅
    └── full/ (TODO - endpoints pentru builder)
        ├── route.ts (POST)
        └── [id]/route.ts (GET, PATCH)
```

## 📊 Data Model (Prisma Schema)

### Product Extended Model
```prisma
model Product {
  // Basic (IMPLEMENTAT)
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  sku         String?     @unique
  description String?     @db.Text
  type        ProductType @default(STANDARD)
  price       Decimal     @default(0)
  categoryId  String
  active      Boolean     @default(true)
  
  // TO ADD:
  descriptionShort String?   @db.Text
  metaTitle        String?
  metaDescription  String?
  ogImage          String?
  
  // JSON Fields (pentru flexibilitate)
  options     Json?  // ProductOption[]
  dimensions  Json?  // ProductDimensions
  pricing     Json?  // ProductPricing
  production  Json?  // ProductProduction
  
  // Relations (IMPLEMENTAT)
  category    Category         @relation(...)
  images      ProductImage[]
  variants    ProductVariant[]
  orderItems  OrderItem[]
  
  // NEW Relations (TO ADD)
  materials   ProductMaterial[]
  printMethods ProductPrintMethod[]
  finishing   ProductFinishing[]
}

// NEW Models
model ProductMaterial {
  id         String   @id @default(cuid())
  productId  String
  materialId String
  priceModifier Decimal? @default(0)
  product    Product  @relation(...)
  material   Material @relation(...)
  @@unique([productId, materialId])
}

model ProductPrintMethod {
  id             String      @id @default(cuid())
  productId      String
  printMethodId  String
  product        Product     @relation(...)
  printMethod    PrintMethod @relation(...)
  @@unique([productId, printMethodId])
}

model ProductFinishing {
  id                 String             @id @default(cuid())
  productId          String
  finishingId        String
  priceModifier      Decimal?           @default(0)
  product            Product            @relation(...)
  finishing          FinishingOperation @relation(...)
  @@unique([productId, finishingId])
}
```

## 🏗️ Component Architecture

### 1. ProductBuilder (Main Container)

```tsx
<ProductBuilder mode="create|edit" productId?>
  <Tabs>
    <TabList sticky>
      - General
      - Options (dacă type === CONFIGURABLE)
      - Pricing
      - Production
      - SEO
      - Preview
    </TabList>
    
    <TabPanels>
      <GeneralTab />
      <OptionsTab />
      <PricingTab />
      <ProductionTab />
      <SeoTab />
      <PreviewTab />
    </TabPanels>
  </Tabs>
  
  <StickyActions>
    <Button variant="cancel">Cancel</Button>
    <Button variant="save">Save</Button>
  </StickyActions>
</ProductBuilder>
```

### 2. GeneralTab Component

**Câmpuri:**
```tsx
- name: string (required)
- slug: string (auto-generated, editable)
- sku: string (optional)
- categoryId: select (required)
- type: radio (STANDARD | CONFIGURABLE | CUSTOM)
- descriptionShort: textarea
- descriptionLong: rich-text-editor
- images: multi-upload
- active: toggle
```

**Validări:**
- name: min 3, max 100 chars
- slug: unique, lowercase, no spaces
- category: must exist in DB

### 3. OptionsTab Component (pentru CONFIGURABLE)

**Secțiuni:**

#### 3.1 Dimensions
```tsx
{
  widthMin: number (mm),
  widthMax: number (mm),
  heightMin: number (mm),
  heightMax: number (mm),
  unit: 'mm' | 'cm' | 'm'
}
```

#### 3.2 Materials
```tsx
<MaterialSelector
  selectedMaterials={[{ id, priceModifier? }]}
  onChange={...}
/>
// Încarcă din /api/admin/materials
// Permite selectare multiple
// Optional: adaugă price modifier per material
```

#### 3.3 Print Methods
```tsx
<PrintMethodSelector
  selectedMethods={[{ id }]}
  onChange={...}
/>
// Încarcă din /api/admin/print-methods
```

#### 3.4 Finishing
```tsx
<FinishingSelector
  selectedFinishing={[{ id, priceModifier? }]}
  onChange={...}
/>
// Încarcă din /api/admin/finishing
```

#### 3.5 Custom Options
```tsx
<OptionsBuilder
  options={[
    {
      name: 'Orientare',
      type: 'radio',
      required: true,
      values: [
        { label: 'Portret', value: 'portrait', priceModifier: 0 },
        { label: 'Peisaj', value: 'landscape', priceModifier: 0 }
      ]
    },
    {
      name: 'Perforare',
      type: 'checkbox',
      required: false,
      values: [
        { label: 'Cu perforare', value: 'yes', priceModifier: 5 }
      ]
    }
  ]}
/>
```

### 4. PricingTab Component

**Pricing Types:**
```tsx
enum PricingType {
  FIXED = 'fixed',           // 100 MDL per produs
  PER_UNIT = 'per_unit',     // 10 MDL × cantitate
  PER_SQM = 'per_sqm',       // 50 MDL × m²
  PER_WEIGHT = 'per_weight', // 5 MDL × kg
  FORMULA = 'formula'        // calculat dinamic
}
```

#### 4.1 Base Price
```tsx
<input type="number" name="basePrice" />
```

#### 4.2 Price Breaks (Volume Pricing)
```tsx
<PriceBreaksTable
  breaks={[
    { minQty: 1,    maxQty: 49,   price: 10 },
    { minQty: 50,   maxQty: 99,   price: 8 },
    { minQty: 100,  maxQty: null, price: 6 }
  ]}
/>
```

#### 4.3 Discounts
```tsx
<DiscountBuilder
  discounts={[
    { type: 'percentage', value: 10, minQty: 50 },
    { type: 'fixed', value: 20, minQty: 100 }
  ]}
/>
```

#### 4.4 Formula Editor (pentru FORMULA type)
```tsx
<FormulaEditor
  formula="(width * height / 10000) * materialCost + printCost + finishingCost"
  variables={[
    'width', 'height', 'area', 'quantity',
    'materialCost', 'printCost', 'finishingCost', 'machineCost'
  ]}
/>
```

#### 4.5 Price Preview
```tsx
<PricePreview
  pricing={currentPricing}
  testInputs={{
    width: 500,
    height: 700,
    quantity: 100,
    material: 'vinyl-gloss'
  }}
  result={calculatedPrice}
/>
```

### 5. ProductionTab Component

```tsx
<ProductionWorkflow
  operations={[
    {
      name: 'Imprimare',
      machineId: 'hp-latex-570',
      timeMinutes: 30,
      order: 1
    },
    {
      name: 'Laminare',
      machineId: 'gmp-laminator',
      timeMinutes: 15,
      order: 2
    }
  ]}
  estimatedTime={45}
  notes="Verifică calibrarea înainte de print"
/>
```

### 6. SeoTab Component

```tsx
- metaTitle: string (max 60 chars)
- metaDescription: textarea (max 160 chars)
- ogImage: upload
- slug: readonly (from General)
```

### 7. PreviewTab Component

```tsx
<ProductPreview mode="product|configurator">
  {mode === 'product' && <ProductPagePreview product={data} />}
  {mode === 'configurator' && <ConfiguratorPreview product={data} />}
</ProductPreview>
```

## 🔌 API Endpoints

### POST /api/admin/products/full
Creare produs complet cu toate relațiile

**Body:**
```json
{
  "name": "Flyere A5 Premium",
  "slug": "flyere-a5-premium",
  "type": "CONFIGURABLE",
  "categoryId": "cat-123",
  "options": [
    {
      "name": "Orientare",
      "type": "radio",
      "required": true,
      "values": [...]
    }
  ],
  "dimensions": {
    "widthMin": 148,
    "widthMax": 148,
    "heightMin": 210,
    "heightMax": 210,
    "unit": "mm"
  },
  "compatibleMaterials": ["mat-1", "mat-2"],
  "compatiblePrintMethods": ["pm-1"],
  "compatibleFinishing": ["fin-1", "fin-2"],
  "pricing": {
    "type": "per_unit",
    "basePrice": 10,
    "priceBreaks": [...]
  },
  "production": {
    "operations": [...],
    "estimatedTime": 45
  },
  "seo": {
    "metaTitle": "...",
    "metaDescription": "..."
  }
}
```

### GET /api/admin/products/[id]/full
Obține produs cu toate relațiile

**Response:**
```json
{
  "id": "prod-123",
  "name": "Flyere A5 Premium",
  ...
  "materials": [
    {
      "id": "mat-1",
      "name": "Vinyl Gloss",
      "priceModifier": 5
    }
  ],
  "printMethods": [...],
  "finishing": [...]
}
```

### PATCH /api/admin/products/[id]/full
Update produs complet

## 🧪 Validation Rules

### General
- name: required, 3-100 chars
- slug: required, unique, lowercase
- categoryId: required, must exist

### Options (pentru CONFIGURABLE)
- dimensions: if set, all min/max must be positive
- compatibleMaterials: min 1 required
- options: each option must have at least 1 value

### Pricing
- basePrice: >= 0
- priceBreaks: sorted by minQty, no overlaps
- formula: valid JavaScript expression

### Production
- operations: order must be sequential (1, 2, 3...)
- machineId: must exist if provided

## 💾 State Management Pattern

```tsx
const useProductBuilder = () => {
  const [formData, setFormData] = useState<CreateFullProductInput>({
    name: '',
    slug: '',
    type: 'STANDARD',
    categoryId: '',
    active: true,
    pricing: {
      type: 'fixed',
      basePrice: 0,
      priceBreaks: []
    }
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };
  
  const validate = () => {
    const errs = validateProduct(formData);
    setErrors(errs);
    return errs.length === 0;
  };
  
  const save = async () => {
    if (!validate()) return;
    
    if (mode === 'create') {
      await createFullProduct(formData);
    } else {
      await updateFullProduct(productId, formData);
    }
  };
  
  return { formData, updateField, save, errors, isDirty };
};
```

## 🎨 UX Patterns

### 1. Progressive Disclosure
- Tab "Options" vizibil doar dacă `type === CONFIGURABLE`
- Price breaks optional, afișat doar dacă user click "Add volume pricing"
- Formula editor avansat, ascuns în collapsible

### 2. Live Preview
- Preț calculat în timp real în PricingTab
- Preview SEO în SeoTab (cum arată în Google)
- Preview configurator în PreviewTab

### 3. Validation Feedback
```tsx
<FormField
  label="Nume Produs"
  error={errors.name}
  required
>
  <input {...} />
</FormField>
```

### 4. Dirty State Warning
```tsx
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = 'Ai modificări nesalvate';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

## 🧩 Reusable Components

### MaterialSelector
```tsx
import { MaterialSelector } from '@/components/admin/products/MaterialSelector';

<MaterialSelector
  selectedIds={formData.compatibleMaterials}
  onChange={(ids) => updateField('compatibleMaterials', ids)}
  allowPriceModifiers={true}
/>
```

### PriceBreaksTable
```tsx
<PriceBreaksTable
  breaks={formData.pricing.priceBreaks}
  onChange={(breaks) => updateField('pricing.priceBreaks', breaks)}
/>
```

### FormulaEditor
```tsx
<FormulaEditor
  formula={formData.pricing.formula}
  variables={AVAILABLE_VARIABLES}
  onChange={(formula) => updateField('pricing.formula', formula)}
  onValidate={(isValid) => setFormulaValid(isValid)}
/>
```

## 📈 Implementation Priority

### Phase 1 (COMPLETED ✅)
- [x] Basic product CRUD
- [x] Product list page with filters
- [x] Simple add/edit form
- [x] Types and hooks foundation

### Phase 2 (CURRENT - IN PROGRESS)
- [x] useProductBuilder hook ✅
- [x] productBuilder.types.ts ✅
- [ ] ProductBuilder container with tabs
- [ ] GeneralTab implementation
- [ ] Basic PricingTab (no formulas yet)

### Phase 3 (NEXT)
- [ ] OptionsTab with materials/methods integration
- [ ] PriceBreaksTable component
- [ ] ProductionTab basic
- [ ] SeoTab

### Phase 4 (ADVANCED)
- [ ] Formula editor with validation
- [ ] Live preview calculator
- [ ] PreviewTab with configurator simulation
- [ ] Advanced production workflow

### Phase 5 (POLISH)
- [ ] Drag & drop for images
- [ ] Rich text editor for descriptions
- [ ] Bulk operations
- [ ] Import/Export templates

## 🚀 Quick Start Guide

### Pentru a continua implementarea:

1. **Creează ProductBuilder container:**
```bash
touch src/components/admin/products/ProductBuilder.tsx
```

2. **Implementează tabs-urile în ordine:**
```bash
mkdir -p src/components/admin/products/tabs
touch src/components/admin/products/tabs/{General,Options,Pricing}Tab.tsx
```

3. **Creează API endpoints pentru builder:**
```bash
mkdir -p src/app/api/admin/products/full
touch src/app/api/admin/products/full/{route.ts,[id]/route.ts}
```

4. **Adaugă câmpurile noi în Prisma:**
```prisma
// În prisma/schema.prisma
model Product {
  // ... existente
  descriptionShort String?   @db.Text
  metaTitle        String?
  metaDescription  String?
  options          Json?
  dimensions       Json?
  pricing          Json?
  production       Json?
}
```

5. **Rulează migrarea:**
```bash
npx prisma migrate dev --name add_product_builder_fields
```

## 📝 Notes

- Sistemul actual de produse (simplu) funcționează perfect ✅
- Product Builder este o extensie avansată pentru configurabile
- Implementarea poate fi făcută incremental
- Backward compatibility menținută cu produse existente
- Toate tipurile sunt deja definite în `productBuilder.types.ts` ✅
- Hook-ul `useProductBuilder` este gata de folosit ✅

## 🔗 Related Documentation

- [PRODUCTS_MANAGEMENT.md](./PRODUCTS_MANAGEMENT.md) - Sistem actual
- [MATERIALS_BACKEND.md](./MATERIALS_BACKEND.md) - Integrare materiale
- [TASK_10.1_SUMMARY.md](./TASK_10.1_SUMMARY.md) - Print methods
- [FINISHING_OPERATIONS_REPORT.md](./FINISHING_OPERATIONS_REPORT.md) - Finishing
- [MACHINES_SYSTEM.md] - Equipment integration (TODO)
