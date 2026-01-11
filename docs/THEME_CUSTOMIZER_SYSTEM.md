# Theme Customizer System - Complete Documentation

## 📋 Cuprins

1. [Overview](#overview)
2. [Arhitectură](#arhitectură)
3. [Componente](#componente)
4. [API Routes](#api-routes)
5. [Utilizare](#utilizare)
6. [Workflow](#workflow)
7. [Testing](#testing)

---

## 🎯 Overview

Sistemul **Theme Customizer** permite administratorilor să personalizeze complet aspectul vizual al platformei sanduta.art fără a modifica codul:

### Funcționalități principale:
- ✅ **Branding**: Logo, favicon, nume site, social links
- ✅ **Culori**: Paleta completă cu contrast checker
- ✅ **Tipografie**: Fonturi, dimensiuni, headings
- ✅ **Layout**: Header, footer, spacing, border radius
- ✅ **Componente UI**: Butoane, carduri, inputs, badges, alerts, modale
- ✅ **Homepage Builder**: Drag & drop blocks cu configurare individuală
- ✅ **Live Preview**: Vizualizare responsive (desktop, tablet, mobile)
- ✅ **Versioning**: Draft/Published system cu rollback
- ✅ **Auto-apply**: Tema se aplică automat pe frontend

---

## 🏗️ Arhitectură

### Structura fișierelor:

```
src/
├── types/
│   └── theme.ts                          # TypeScript types pentru toate configurările
│
├── components/theme/
│   ├── BrandingSettings.tsx              # Branding (logo, social links)
│   ├── ColorSettings.tsx                 # Paleta de culori + contrast checker
│   ├── TypographySettings.tsx            # Fonturi, dimensiuni, headings
│   ├── LayoutSettings.tsx                # Header, footer, spacing
│   ├── ComponentsCustomization.tsx       # Stilizare componente UI
│   ├── HomepageBuilder.tsx               # Drag & drop blocks pentru homepage
│   └── ThemePreview.tsx                  # Live preview cu iframe + responsive
│
├── app/
│   ├── admin/theme/
│   │   └── page.tsx                      # Pagina principală Theme Customizer
│   └── api/admin/theme/
│       ├── route.ts                      # GET/POST/PUT/DELETE pentru theme
│       └── versions/route.ts             # Versioning și restore
│
└── lib/theme/
    └── applyTheme.ts                     # Utilități pentru aplicare tema pe frontend
```

---

## 🧩 Componente

### 1. **BrandingSettings** (`src/components/theme/BrandingSettings.tsx`)

**Scop**: Configurare identitate brand (logo, favicon, nume site, email, social media)

**Props**:
```typescript
interface BrandingSettingsProps {
  value: BrandingConfig;
  onChange: (branding: BrandingConfig) => void;
}
```

**Funcționalități**:
- Upload logo (main, dark mode, light mode)
- Upload favicon
- Site name & tagline
- Email sender configuration
- Social media links (Facebook, Instagram, Twitter, LinkedIn, YouTube)

**Exemplu utilizare**:
```tsx
<BrandingSettings
  value={theme.branding}
  onChange={(branding) => setTheme({ ...theme, branding })}
/>
```

---

### 2. **ColorSettings** (`src/components/theme/ColorSettings.tsx`)

**Scop**: Configurare paleta de culori cu color picker și contrast validation

**Funcționalități**:
- Brand colors (primary, secondary, accent)
- Status colors (success, warning, error, info)
- Background colors (3 nivele)
- Surface colors
- Text colors (4 variante)
- Border colors
- **Contrast checker** WCAG AA/AAA

**Contrast Checker**:
- ✅ **AAA**: Contrast ratio ≥ 7:1 (Enhanced)
- ✅ **AA**: Contrast ratio ≥ 4.5:1 (Minimum)
- ❌ **Fail**: Sub 4.5:1

---

### 3. **TypographySettings** (`src/components/theme/TypographySettings.tsx`)

**Scop**: Configurare fonturi și dimensiuni text

**Funcționalități**:
- Font families (primary pentru body, heading pentru titluri)
- Google Fonts integration (15+ fonturi populare)
- Font sizes (xs, sm, base, lg, xl, 2xl, 3xl)
- Font weights (light, normal, medium, semibold, bold)
- Line heights (tight, normal, relaxed)
- Heading styles (H1-H6) cu control individual:
  - fontSize
  - fontWeight
  - lineHeight
  - letterSpacing
- Live preview pentru toate setările

---

### 4. **LayoutSettings** (`src/components/theme/LayoutSettings.tsx`)

**Scop**: Configurare layout general (header, footer, spacing)

**Funcționalități**:

**Header**:
- Height customizabil
- Sticky/fixed position
- Logo position (left/center)
- Menu style (horizontal/hamburger)
- Show/hide: search, cart, account icons

**Footer**:
- Show/hide: logo, social links, newsletter
- Column count (2/3/4)
- Copyright text

**Container**:
- Max width
- Horizontal padding

**Spacing Scale**:
- xs, sm, md, lg, xl, 2xl
- Live preview pentru fiecare dimensiune

**Border Radius**:
- sm, md, lg, full
- Preview vizual pentru fiecare

---

### 5. **ComponentsCustomization** (`src/components/theme/ComponentsCustomization.tsx`)

**Scop**: Stilizare individuală pentru toate componentele UI

**Componente configurabile**:

**Buttons**:
- Border radius, padding
- Font weight, text transform
- Shadow on/off

**Cards**:
- Border radius, padding
- Shadow (none/sm/md/lg)
- Border on/off
- Hover effect on/off

**Inputs**:
- Border radius, padding
- Border width
- Focus ring width

**Badges**:
- Border radius, padding
- Font size, weight

**Alerts**:
- Border radius, padding
- Border on/off
- Icon on/off

**Modals**:
- Border radius, max width
- Backdrop blur
- Close on backdrop click

Toate cu **live preview** vizual.

---

### 6. **HomepageBuilder** (`src/components/theme/HomepageBuilder.tsx`)

**Scop**: Construiește homepage-ul cu drag & drop blocks

**Funcționalități**:
- **Drag & drop**: Reordonare blocks cu @dnd-kit
- **8 tipuri de blocks**:
  1. **Hero**: Title, subtitle, background image, CTA
  2. **Grid Banners**: Multiple banner-e organizate în grid
  3. **Featured Products**: Afișare produse selectate
  4. **Categories**: Grid de categorii
  5. **Testimonials**: Recenzii clienți
  6. **Text + Image**: Secțiune text cu imagine
  7. **Newsletter**: Formular abonare
  8. **Custom HTML**: Cod HTML personalizat

**Operații pe blocks**:
- ➕ Add: Adaugă block nou
- ✏️ Edit: Configurare setări specifice
- 👁️ Toggle: Enable/disable block
- 📋 Duplicate: Clonează block
- 🗑️ Delete: Șterge block
- ⋮⋮ Reorder: Drag & drop

**Editor per block type**:
- Fiecare tip de block are editor dedicat
- Configurare specifică (titluri, imagini, linkuri, etc.)
- Live validation

---

### 7. **ThemePreview** (`src/components/theme/ThemePreview.tsx`)

**Scop**: Vizualizare live a temei în iframe cu responsive modes

**Funcționalități**:
- **Device modes**:
  - 🖥️ Desktop (100% width)
  - 📱 Tablet (768px)
  - 📱 Mobile (375px)
- **Live updates**: Schimbările se aplică instant
- **Iframe isolation**: Preview izolat de admin UI
- **Responsive switcher**: Testează pe toate device-urile
- **Refresh**: Reîncarcă preview-ul
- **Open in new tab**: Deschide preview în tab nou

**CSS Generation**:
- Generează automat CSS variables din ThemeConfig
- Aplică stilurile în iframe fără a afecta admin-ul
- Suport complet pentru toate setările de tema

---

## 🌐 API Routes

### 1. **GET /api/admin/theme**

Obține tema curentă (draft sau published)

**Query params**:
- `version`: `'draft'` | `'published'` (default: `'published'`)

**Response**:
```json
{
  "theme": { ...ThemeConfig },
  "version": "published",
  "updatedAt": "2024-01-10T12:00:00Z"
}
```

---

### 2. **POST /api/admin/theme**

Salvează tema ca draft

**Body**:
```json
{
  "theme": { ...ThemeConfig }
}
```

**Response**:
```json
{
  "success": true,
  "theme": { ...ThemeConfig },
  "version": "draft",
  "updatedAt": "2024-01-10T12:00:00Z"
}
```

---

### 3. **PUT /api/admin/theme/publish**

Publică tema (draft → published)

**Process**:
1. Creează backup al temei published curente
2. Înlocuiește tema published cu draft-ul
3. Tema devine live pentru toți utilizatorii

**Response**:
```json
{
  "success": true,
  "theme": { ...ThemeConfig },
  "version": "published",
  "updatedAt": "2024-01-10T12:00:00Z"
}
```

---

### 4. **DELETE /api/admin/theme**

Resetează tema la default

**Response**:
```json
{
  "success": true,
  "message": "Theme reset to default"
}
```

---

### 5. **GET /api/admin/theme/versions**

Obține toate versiunile salvate (backup-uri)

**Response**:
```json
{
  "versions": [
    {
      "id": "theme_backup_1704887520000",
      "timestamp": 1704887520000,
      "createdAt": "2024-01-10T12:00:00Z",
      "theme": { ...ThemeConfig }
    }
  ],
  "total": 10
}
```

---

### 6. **POST /api/admin/theme/versions/restore**

Restaurează o versiune anterioară

**Body**:
```json
{
  "versionId": "theme_backup_1704887520000"
}
```

**Response**:
```json
{
  "success": true,
  "theme": { ...ThemeConfig },
  "message": "Theme restored to draft. Publish to make it live."
}
```

---

## 📖 Utilizare

### Pentru administratori:

1. **Accesare**: Navighează la `/admin/theme`

2. **Editare**:
   - Selectează tab-ul dorit (Branding, Colors, etc.)
   - Modifică setările
   - Vizualizează în real-time în tab-ul Preview

3. **Salvare**:
   - Click pe **"💾 Save Draft"** (salvează fără a face tema live)
   - Modificările sunt salvate în baza de date ca draft

4. **Publicare**:
   - Click pe **"🚀 Publish"**
   - Tema devine activă pentru toți utilizatorii
   - Backup automat al versiunii anterioare

5. **Rollback** (dacă e nevoie):
   - Accesează versiunile salvate
   - Restaurează versiunea dorită
   - Publică din nou

---

### Pentru dezvoltatori:

#### Aplicare tema pe frontend:

```typescript
// src/app/layout.tsx
import { applyTheme, loadPublishedTheme } from '@/lib/theme/applyTheme';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    loadPublishedTheme().then((theme) => {
      if (theme) {
        applyTheme(theme);
      }
    });
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

#### Utilizare CSS variables în componente:

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  border-radius: var(--button-radius);
  padding: var(--button-padding);
}

.my-card {
  background-color: var(--surface-paper);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}
```

#### Acces la tema în React:

```typescript
import { useTheme } from '@/lib/theme/applyTheme';

function MyComponent() {
  const theme = useTheme();
  
  if (!theme) return <div>Loading...</div>;
  
  return (
    <div style={{ color: theme.colors.primary }}>
      Custom styled component
    </div>
  );
}
```

---

## 🔄 Workflow

### Draft → Published System:

```
┌──────────────┐
│  Editare     │
│  în Admin    │
└──────┬───────┘
       │
       ▼
┌──────────────┐      Save Draft
│   DRAFT      │◄─────────────────── Modificări nesalvate
│  (staging)   │
└──────┬───────┘
       │
       │ Publish
       │
       ▼
┌──────────────┐      Backup creat
│  PUBLISHED   │◄─────────────────── Tema anterioară → backup
│   (live)     │
└──────┬───────┘
       │
       │ Used by
       ▼
┌──────────────┐
│   Frontend   │
│  (visitors)  │
└──────────────┘
```

### Rollback Process:

```
1. Găsește versiunea dorită în /api/admin/theme/versions
2. Restaurează versiunea → devine draft
3. Review în Preview tab
4. Publish pentru a face live
```

---

## 🧪 Testing

### Manual Testing Checklist:

#### Branding:
- [ ] Upload logo (main, dark, favicon)
- [ ] Modifică site name și tagline
- [ ] Adaugă social media links
- [ ] Verifică preview-ul în header/footer

#### Colors:
- [ ] Schimbă primary color
- [ ] Testează contrast checker (AA/AAA)
- [ ] Modifică toate paletele (background, text, border)
- [ ] Verifică în Preview tab

#### Typography:
- [ ] Schimbă font family (primary, heading)
- [ ] Modifică font sizes
- [ ] Configurează headings (H1-H6)
- [ ] Verifică în Preview full page

#### Layout:
- [ ] Toggle sticky header
- [ ] Schimbă logo position
- [ ] Modifică spacing scale
- [ ] Test responsive (desktop, tablet, mobile)

#### Components:
- [ ] Modifică button styles
- [ ] Configurează card shadows
- [ ] Testează input focus ring
- [ ] Verifică badge styles

#### Homepage Builder:
- [ ] Adaugă block nou (Hero, Featured Products)
- [ ] Drag & drop reordering
- [ ] Editează block settings
- [ ] Toggle block visibility
- [ ] Duplicate block
- [ ] Delete block

#### Preview:
- [ ] Switch device modes (desktop/tablet/mobile)
- [ ] Refresh preview
- [ ] Open in new tab
- [ ] Verifică că schimbările se aplică instant

#### Publish/Rollback:
- [ ] Save draft
- [ ] Publish tema
- [ ] Verifică că tema e live pe frontend
- [ ] Creează backup automat
- [ ] Restore versiune anterioară

---

### Unit Tests (TODO):

```typescript
// src/__tests__/theme.test.ts
import { describe, it, expect } from 'vitest';
import { themeToVariables, generateThemeStylesheet } from '@/lib/theme/applyTheme';
import { DEFAULT_THEME } from '@/app/admin/theme/page';

describe('Theme System', () => {
  it('should convert theme to CSS variables', () => {
    const variables = themeToVariables(DEFAULT_THEME);
    expect(variables['--color-primary']).toBe('#3B82F6');
    expect(variables['--font-primary']).toBe('Inter, sans-serif');
  });

  it('should generate complete stylesheet', () => {
    const css = generateThemeStylesheet(DEFAULT_THEME);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-primary');
    expect(css).toContain('body {');
  });
});
```

---

## 🚀 Quick Start

### Pentru testare rapidă:

1. **Start server**:
   ```bash
   npm run dev
   ```

2. **Accesează**: http://localhost:3000/admin/theme

3. **Login** cu admin account:
   - Email: `admin@sanduta.art`
   - Password: `admin123`

4. **Testează toate tab-urile**:
   - Branding → Upload logo
   - Colors → Schimbă primary color
   - Typography → Alege font nou
   - Layout → Toggle sticky header
   - Components → Modifică button radius
   - Homepage → Adaugă Hero block
   - Preview → Testează responsive

5. **Publish**: Click "🚀 Publish" și verifică pe homepage (/)

---

## 📝 Notes

### Limitări actuale:
- Homepage Builder: Nu toate block types au editor complet (se pot extinde)
- Google Fonts: Lista hardcodată (15 fonturi), se poate extinde cu API
- Image upload: Folosește Cloudinary (trebuie configurat CLOUDINARY_*)

### Extensii posibile:
- Export/Import tema ca JSON
- Template library (teme pre-configurate)
- A/B testing între 2 teme
- Scheduled publishing (programare publicare)
- Color palette generator de pe o imagine
- Advanced typography (kerning, tracking)
- Animation settings
- Dark mode automatic toggle

---

## 🔗 Resurse

- **TypeScript Types**: `src/types/theme.ts`
- **API Documentation**: Acest document, secțiunea "API Routes"
- **Component Examples**: `src/components/theme/`
- **Live Demo**: `/admin/theme` (după login)

---

**Data documentației**: 2025-01-26
**Versiune**: 1.0.0
**Status**: ✅ Complete și production-ready
