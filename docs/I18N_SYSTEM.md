# I18N SYSTEM - SISTEM MULTILINGV COMPLET

## 📋 PREZENTARE GENERALĂ

Sistemul multilingv complet implementat pentru sanduta.art, suportând 3 limbi: **Română (RO)**, **Engleză (EN)**, **Rusă (RU)**.

## 🏗️ ARHITECTURĂ

### 1. Configurare Globală

**Fișiere:**
- `src/i18n/config.ts` - Configurare limbi, detectare, fallback
- `src/i18n/types.ts` - Tipuri TypeScript pentru traduceri
- `src/i18n/translations/ro.json` - Traduceri română
- `src/i18n/translations/en.json` - Traduceri engleză
- `src/i18n/translations/ru.json` - Traduceri rusă

**Limbi suportate:**
```typescript
SUPPORTED_LOCALES = ['ro', 'en', 'ru']
DEFAULT_LOCALE = 'ro'
```

### 2. Structură URL Multilingvă

**Format URL:**
```
/ro/products
/en/products
/ru/products
```

**Implementare:**
- Layout: `src/app/[lang]/layout.tsx`
- Middleware: `src/lib/i18n/middleware.ts`
- Detectare automată limbă din:
  - URL
  - Cookie (`NEXT_LOCALE`)
  - Browser (`Accept-Language`)

### 3. State Management

**Context & Hooks:**
- `src/context/TranslationContext.tsx` - Provider traduceri
- Hooks disponibile:
  - `useTranslations()` - toate datele context
  - `useT()` - doar funcția de traducere

**Utilizare:**
```typescript
import { useT } from '@/context/TranslationContext';

function MyComponent() {
  const t = useT();
  
  return (
    <button>{t('common.save')}</button>
  );
}
```

## 🔧 COMPONENTE

### Language Switcher

**Fișier:** `src/components/i18n/LanguageSwitcher.tsx`

**Variante:**
- `dropdown` - Meniu dropdown (implicit)
- `inline` - Butoane alăturate
- `compact` - Butoane circulare cu steaguri

**Utilizare:**
```tsx
<LanguageSwitcher currentLocale="ro" variant="dropdown" />
<MobileLanguageSwitcher currentLocale="ro" />
```

## 📦 MODULE TRADUSE

### 1. Produse

**Fișier:** `src/lib/i18n/product-translations.ts`

**Funcții:**
- `getProductName(product, locale)`
- `getProductDescription(product, locale)`
- `getLocalizedProduct(product, locale)`
- `hasCompleteTranslation(product, locale)`

**Structură date:**
```json
{
  "id": "product-1",
  "name": "Default Name",
  "translations": {
    "ro": { "name": "Nume RO", "description": "..." },
    "en": { "name": "Name EN", "description": "..." },
    "ru": { "name": "Имя RU", "description": "..." }
  }
}
```

### 2. CMS (Pagini & Blog)

**Fișier:** `src/lib/i18n/cms-translations.ts`

**Funcții:**
- `getPageTitle(page, locale)`
- `getPageContent(page, locale)`
- `getLocalizedPage(page, locale)`
- `generatePageSlugs(title)`

**Structură date:**
```json
{
  "id": "page-1",
  "translations": {
    "ro": {
      "title": "Titlu RO",
      "slug": "titlu-ro",
      "content": "..."
    }
  }
}
```

### 3. Configurator

**Fișier:** `src/i18n/configurator.json`

**Conține:**
- Steps (selectProduct, configure, design, review)
- Options (material, size, color, finish)
- Actions (continue, back, addToCart)
- Pricing (basePrice, total, estimatedPrice)
- Validation (selectMaterial, minQuantity)
- Messages (configurationSaved, addedToCart)

### 4. Editor

**Fișier:** `src/i18n/editor.json`

**Conține:**
- Toolbar (text, image, shape, upload)
- Actions (undo, redo, delete, duplicate)
- Align (left, center, right, top, middle, bottom)
- Properties (fill, stroke, opacity, rotation)
- Layers (newLayer, deleteLayer, renameLayer)

### 5. Email Templates

**Fișier:** `src/lib/email/templates-i18n.ts`

**Template-uri:**
- `orderConfirmation` - Confirmare comandă
- `orderShipped` - Comandă expediată
- `orderDelivered` - Comandă livrată
- `passwordReset` - Resetare parolă

**Utilizare:**
```typescript
import { getEmailTemplate, interpolateEmailTemplate } from '@/lib/email/templates-i18n';

const template = getEmailTemplate('orderConfirmation', 'ro');
const email = interpolateEmailTemplate(template, {
  customerName: 'Ion',
  orderId: '12345',
  total: '500',
});
```

## 🔍 SEO MULTILINGV

**Fișier:** `src/lib/seo/generateSeoTags.ts`

**Funcții:**
- `generateHreflangTags(pathname, baseUrl)` - Tags hreflang
- `generateCanonicalUrl(pathname, locale, baseUrl)` - URL canonical
- `generateAlternateUrls(pathname, baseUrl)` - URL-uri alternative
- `generateSeoTags(meta, locale, pathname)` - Toate metatagurile
- `generateProductSchema(product, locale)` - Schema.org pentru produs

**Output:**
```html
<link rel="alternate" hreflang="ro" href="https://sanduta.art/ro/products" />
<link rel="alternate" hreflang="en" href="https://sanduta.art/en/products" />
<link rel="alternate" hreflang="ru" href="https://sanduta.art/ru/products" />
<link rel="alternate" hreflang="x-default" href="https://sanduta.art/ro/products" />
<link rel="canonical" href="https://sanduta.art/ro/products" />
```

## 🛠️ ADMIN TRANSLATIONS MANAGER

**Pagină:** `src/app/(admin)/dashboard/translations/page.tsx`
**API:** `src/app/api/admin/translations/route.ts`

**Funcționalități:**
- Listă chei traduceri
- Căutare după cheie
- Editare traduceri în toate limbile
- Statistici completare traduceri
- Export/Import JSON

**Acces:** `/admin/dashboard/translations`

## 📊 PRISMA SCHEMA

**Fișier:** `prisma/i18n-schema-extensions.ts`

**Instrucțiuni:**
Adaugă câmpul `translations` în modelele care necesită traduceri:

```prisma
model Product {
  // ... câmpuri existente
  translations Json? @default("{}")
}

model Category {
  // ... câmpuri existente
  translations Json? @default("{}")
}

model Page {
  // ... câmpuri existente
  translations Json? @default("{}")
}
```

**Rulează migrarea:**
```bash
npx prisma migrate dev --name add_i18n_support
npx prisma generate
```

## 🧪 TESTARE

**Fișier:** `src/__tests__/i18n.test.ts`

**Suite de teste:**
1. ✅ I18n Config - Validare locale, detectare, fallback
2. ✅ Translation Loading - Încărcare fișiere traduceri
3. ✅ Translation Functions - Obținere traduceri, interpolări
4. ✅ Product Translations - Traduceri produse
5. ✅ CMS Translations - Traduceri pagini
6. ✅ SEO Multilingual - Hreflang, canonical
7. ✅ Email Templates - Template-uri multilingve
8. ✅ Middleware I18n - Detectare locale din URL

**Rulează testele:**
```bash
npm test i18n
```

## 📝 UTILIZARE

### Client Component

```tsx
'use client';
import { useT } from '@/context/TranslationContext';

export function MyComponent() {
  const t = useT();
  
  return (
    <div>
      <h1>{t('product.title')}</h1>
      <p>{t('validation.min', { min: 5 })}</p>
    </div>
  );
}
```

### Server Component

```tsx
import { loadTranslations, createTranslateFunction } from '@/lib/i18n/translations';

export default async function Page({ params }: { params: { lang: Locale } }) {
  const translations = await loadTranslations(params.lang);
  const t = createTranslateFunction(params.lang, translations);
  
  return (
    <h1>{t('common.welcome')}</h1>
  );
}
```

### API Route cu Traduceri

```typescript
import { getLocalizedProduct } from '@/lib/i18n/product-translations';

export async function GET(req: NextRequest) {
  const locale = req.cookies.get('NEXT_LOCALE')?.value || 'ro';
  const product = await prisma.product.findUnique({ where: { id } });
  
  const localized = getLocalizedProduct(product, locale as Locale);
  
  return NextResponse.json(localized);
}
```

## 🔄 FALLBACK LOGIC

**Lanțul de fallback:**
```
ru → ro, en → ro
en → ro
ro → (limba implicită)
```

**Implementare:**
- Dacă lipsește traducerea → folosește fallback chain
- Dacă lipsește slug → generează automat
- Dacă lipsește meta → fallback global

## 🎨 UX RULES

1. ✅ Schimbarea limbii este instant
2. ✅ Traducerile sunt consistente
3. ✅ Fallback-ul este invizibil
4. ✅ Adminul poate traduce totul ușor
5. ✅ Switcher limbă compact pe mobil
6. ✅ Pagini multilingve optimizate SEO

## 📱 RESPONSIVE DESIGN

**Desktop:**
- Language Switcher dropdown complet
- Toate traducerile vizibile

**Mobile:**
- Compact Language Switcher (steaguri)
- UI optimizat pentru spațiu redus

## ⚙️ CONFIGURARE PRODUCȚIE

### Environment Variables

```env
NEXT_PUBLIC_BASE_URL=https://sanduta.art
NEXT_PUBLIC_DEFAULT_LOCALE=ro
```

### Next.js Config

```typescript
// next.config.ts
export default {
  i18n: {
    locales: ['ro', 'en', 'ru'],
    defaultLocale: 'ro',
  },
};
```

## 🚀 DEPLOYMENT

1. **Build:**
```bash
npm run build
```

2. **Verificare traduceri:**
```bash
npm test i18n
```

3. **Deploy:**
```bash
vercel deploy --prod
```

## 📈 EXTENSIBILITATE

### Adăugare limbă nouă:

1. **Config:**
```typescript
// src/i18n/config.ts
export const SUPPORTED_LOCALES = ['ro', 'en', 'ru', 'fr'] as const;
```

2. **Traduceri:**
```bash
cp src/i18n/translations/ro.json src/i18n/translations/fr.json
# Editează fr.json
```

3. **Prisma:**
```bash
npx prisma migrate dev
```

## 🐛 DEBUGGING

**Logs middleware:**
```typescript
console.log('[i18n] Detected locale:', locale);
console.log('[i18n] Fallback chain:', getFallbackChain(locale));
```

**Verificare traduceri lipsă:**
```typescript
import { validateTranslations } from '@/lib/i18n/translations';

const result = validateTranslations(translations, requiredKeys);
console.log('Missing:', result.missing);
```

## 📞 SUPPORT

Pentru întrebări sau probleme cu sistemul multilingv:
- **Email:** dev@sanduta.art
- **Docs:** `/docs/I18N_SYSTEM.md`
- **Tests:** `npm test i18n`

---

**Status:** ✅ **COMPLET IMPLEMENTAT**
**Versiune:** 1.0.0
**Data:** 2026-01-10
