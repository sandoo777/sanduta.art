# I18N QUICK START GUIDE

## 🚀 Start Rapid - 5 Minute Setup

### 1. Verifică Instalarea

```bash
# Verifică că toate fișierele sunt prezente
ls src/i18n/
ls src/i18n/translations/
```

**Trebuie să vezi:**
- ✅ `config.ts`
- ✅ `types.ts`
- ✅ `translations/ro.json`
- ✅ `translations/en.json`
- ✅ `translations/ru.json`

### 2. Test Rapid în Browser

```bash
npm run dev
```

**Accesează:**
- http://localhost:3000/ro → Română
- http://localhost:3000/en → Engleză
- http://localhost:3000/ru → Rusă

### 3. Schimbă Limba

Click pe **Language Switcher** din header → Selectează limba dorită → Pagina se reîncarcă cu noua limbă

### 4. Adaugă Traduceri în Componenta Ta

```tsx
'use client';
import { useT } from '@/context/TranslationContext';

export function MyComponent() {
  const t = useT();
  
  return (
    <button>{t('common.save')}</button>
  );
}
```

### 5. Administrează Traduceri

**Acces:** http://localhost:3000/admin/dashboard/translations

**Funcționalități:**
- Caută traduceri
- Editează toate limbile
- Export/Import JSON

## 📝 Comenzi Utile

```bash
# Testează sistemul i18n
npm test i18n

# Adaugă câmp traduceri în Prisma
npx prisma migrate dev --name add_i18n_support

# Verifică traducerile sunt complete
npm run check:translations
```

## 🎯 Exemple Rapide

### Client Component

```tsx
import { useT } from '@/context/TranslationContext';

function ProductCard() {
  const t = useT();
  return <button>{t('product.addToCart')}</button>;
}
```

### Server Component

```tsx
import { loadTranslations, createTranslateFunction } from '@/lib/i18n/translations';

async function Page({ params }: { params: { lang: 'ro' | 'en' | 'ru' } }) {
  const translations = await loadTranslations(params.lang);
  const t = createTranslateFunction(params.lang, translations);
  
  return <h1>{t('nav.home')}</h1>;
}
```

### API Route

```typescript
import { getLocalizedProduct } from '@/lib/i18n/product-translations';

export async function GET(req: NextRequest) {
  const locale = req.cookies.get('NEXT_LOCALE')?.value || 'ro';
  const product = await getProduct();
  return NextResponse.json(getLocalizedProduct(product, locale));
}
```

## ✅ Checklist Implementare

- [ ] Paginile publice funcționează cu `/ro`, `/en`, `/ru`
- [ ] Language Switcher afișat în header
- [ ] Cookie `NEXT_LOCALE` se salvează la schimbare limbă
- [ ] Produsele afișează traduceri corecte
- [ ] SEO tags (hreflang) sunt prezente
- [ ] Emailuri folosesc template-ul corect per limbă
- [ ] Admin poate edita traduceri

## 🆘 Probleme Comune

**Problema:** URL-ul nu conține limba (`/products` în loc de `/ro/products`)

**Soluție:** Verifică că middleware-ul este activ:
```typescript
// middleware.ts
export const config = {
  matcher: ["/((?!api|_next|static|.*\\.).*)"€],
};
```

**Problema:** Traducerile nu se încarcă

**Soluție:** Verifică că fișierele JSON există:
```bash
ls src/i18n/translations/
```

**Problema:** Language Switcher nu schimbă limba

**Soluție:** Verifică cookie-ul:
```javascript
document.cookie // trebuie să conțină NEXT_LOCALE
```

## 📚 Resurse

- **Documentație completă:** `/docs/I18N_SYSTEM.md`
- **Teste:** `src/__tests__/i18n.test.ts`
- **Exemple:** `src/app/[lang]/page.tsx`

---

**Gata!** Sistemul multilingv este funcțional. Pentru detalii complete, vezi [I18N_SYSTEM.md](./I18N_SYSTEM.md)
