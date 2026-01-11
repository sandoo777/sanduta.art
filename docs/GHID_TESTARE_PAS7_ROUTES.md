# 🧪 Ghid Testare PAS 7: Category Landing Pages & SEO URLs

**Obiectiv**: Verificare funcționalitate completă a sistemului de categorii cu URL-uri SEO-friendly

**Data**: 2026-01-10  
**Estimat**: 15-20 minute

---

## 🚀 Pregătire

### 1. Start development server

```bash
cd /workspaces/sanduta.art
npm run dev
```

**Verify**: Server rulează pe http://localhost:3002

### 2. Open în browser

```bash
# În dev container
"$BROWSER" http://localhost:3002
```

Sau manual: `http://localhost:3002`

---

## ✅ Test Suite

### TEST 1: Desktop Mega-Menu Navigation

#### Pasul 1.1: Hover pe "Categorii" în header
- [ ] Mega-menu se deschide cu 8 categorii principale
- [ ] Fiecare categorie are icon și nume
- [ ] Subcategoriile apar în listă (max 6 vizibile)

#### Pasul 1.2: Click pe categorie principală
**Test URL**: Click pe "🎴 Cărți de vizită"

**Expected behavior**:
- [ ] Navigate to: `/produse/carti-de-vizita`
- [ ] Page loads successfully (no 404)
- [ ] Breadcrumbs: `Acasă / Cărți de vizită`
- [ ] Category header shows:
  - Nume: "Cărți de vizită"
  - Icon: 🎴
  - Descriere categoriei
  - Product count badge
- [ ] Subcategories grid visible (dacă există)
- [ ] Product catalog shows products filtrate by category

#### Pasul 1.3: Click pe subcategorie
**Test URL**: Click pe "Cărți de vizită standard"

**Expected behavior**:
- [ ] Navigate to: `/produse/carti-de-vizita/carti-vizita-standard`
- [ ] Page loads successfully
- [ ] Breadcrumbs: `Acasă / Cărți de vizită / Cărți de vizită standard`
- [ ] Product count visible
- [ ] Products filtrate by subcategory

#### Pasul 1.4: Test toate 8 categorii principale
Repetă pașii 1.2-1.3 pentru:
- [ ] 📢 Marketing → `/produse/marketing`
- [ ] 🖼️ Foto & Artă → `/produse/foto-arta`
- [ ] 👕 Textile & Merch → `/produse/textile-merch`
- [ ] 📦 Ambalaje → `/produse/ambalaje`
- [ ] 🎁 Cadouri → `/produse/cadouri`
- [ ] 🏢 Corporate → `/produse/corporate`
- [ ] 📚 Papetărie → `/produse/papetarie`

---

### TEST 2: Mobile Navigation

#### Pasul 2.1: Resize browser la mobile (< 768px)
Sau folosește DevTools Device Toolbar (Cmd/Ctrl + Shift + M)

#### Pasul 2.2: Open mobile menu
- [ ] Click pe hamburger icon (☰)
- [ ] Mobile menu se deschide
- [ ] "Categorii" section vizibil

#### Pasul 2.3: Expand category
**Test**: Click pe "Cărți de vizită"

**Expected behavior**:
- [ ] Chevron rotates 90° (→ to ↓)
- [ ] Subcategories list expands
- [ ] Subcategories indented cu border-left

#### Pasul 2.4: Click parent category
**Test URL**: Click pe "Cărți de vizită" text

**Expected behavior**:
- [ ] Navigate to `/produse/carti-de-vizita`
- [ ] Mobile menu closes automatically
- [ ] Page loads corect

#### Pasul 2.5: Click subcategory
**Test URL**: Click pe "Cărți vizita standard"

**Expected behavior**:
- [ ] Navigate to `/produse/carti-de-vizita/carti-vizita-standard`
- [ ] Mobile menu closes
- [ ] Page loads corect

---

### TEST 3: Footer Navigation

#### Pasul 3.1: Scroll to footer
- [ ] "Categorii" section vizibilă
- [ ] 4 featured categories afișate:
  - 🎴 Cărți de vizită
  - 📢 Marketing
  - 🖼️ Foto & Artă
  - 👕 Textile & Merch

#### Pasul 3.2: Test footer category links
**Test each link**:
- [ ] `/produse/carti-de-vizita` → works
- [ ] `/produse/marketing` → works
- [ ] `/produse/foto-arta` → works
- [ ] `/produse/textile-merch` → works

#### Pasul 3.3: "Vezi toate" link
- [ ] Click "Vezi toate →"
- [ ] Navigate to `/products` (catalog page)

---

### TEST 4: Direct URL Access

#### Pasul 4.1: Test main category URLs
Introdu manual în address bar:

```
http://localhost:3002/produse/carti-de-vizita
http://localhost:3002/produse/marketing
http://localhost:3002/produse/foto-arta
```

**Expected pentru fiecare**:
- [ ] Page loads (no 404)
- [ ] Category data displayed
- [ ] Breadcrumbs correct
- [ ] Products filtered by category

#### Pasul 4.2: Test nested URLs
```
http://localhost:3002/produse/carti-de-vizita/carti-vizita-standard
http://localhost:3002/produse/marketing/flyere
http://localhost:3002/produse/foto-arta/canvas-personalizat
```

**Expected pentru fiecare**:
- [ ] Page loads
- [ ] Subcategory data displayed  
- [ ] Breadcrumbs: Acasă / Parent / Child
- [ ] Products filtered

#### Pasul 4.3: Test invalid slugs (404 handling)
```
http://localhost:3002/produse/nu-exista
http://localhost:3002/produse/marketing/categorie-falsa
```

**Expected**:
- [ ] 404 page or redirect to /produse
- [ ] No server error (check console)

---

### TEST 5: Product Filtering

#### Pasul 5.1: Check initial filter state
**Navigate to**: `/produse/marketing`

**In browser DevTools**:
1. Open React DevTools (optional)
2. Check CatalogClient state
   - [ ] `filters.categoryId` is set to Marketing category ID
   - [ ] Products displayed match category

#### Pasul 5.2: Verify product display
- [ ] Only products from "Marketing" category visible
- [ ] Product count matches badge in header
- [ ] No products from other categories (ex: Cărți de vizită)

#### Pasul 5.3: Clear filter
- [ ] Click "Șterge filtre" sau similar button
- [ ] All products displayed (filter removed)

---

### TEST 6: SEO & Metadata

#### Pasul 6.1: View page source
**Navigate to**: `/produse/carti-de-vizita`

**Right-click** → "View Page Source"

**Check for**:
- [ ] `<title>` tag:
  ```html
  <title>Cărți de vizită | Sanduta.Art</title>
  ```
  (sau custom metaTitle din DB)

- [ ] `<meta name="description">` present
- [ ] OpenGraph tags:
  ```html
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:type" content="website" />
  ```

#### Pasul 6.2: Check H1 tag
- [ ] Page conține `<h1>` cu numele categoriei
- [ ] Only one H1 per page

#### Pasul 6.3: Validate with tools (optional)
**Google Rich Results Test**:
```
https://search.google.com/test/rich-results
```
Introdu URL: `http://localhost:3002/produse/marketing`
(Note: localhost nu funcționează, test după deploy)

---

### TEST 7: Breadcrumbs Navigation

#### Pasul 7.1: Test breadcrumb links
**Navigate to**: `/produse/marketing/flyere`

**Breadcrumbs**: `Acasă / Marketing / Flyere`

**Test fiecare link**:
- [ ] Click "Acasă" → `/` (homepage)
- [ ] Click "Marketing" → `/produse/marketing`
- [ ] "Flyere" nu e link (current page)

#### Pasul 7.2: Visual styling
- [ ] Breadcrumbs visible above category header
- [ ] Links underline on hover
- [ ] Current page (last item) not clickable
- [ ] Separator between items (/ sau >)

---

### TEST 8: Responsive Design

#### Pasul 8.1: Desktop (> 1024px)
**Navigate to**: `/produse/carti-de-vizita`

**Check**:
- [ ] Subcategories grid: 4 columns
- [ ] Product catalog: 3-4 columns
- [ ] Header mega-menu visible
- [ ] Footer layout: 4 columns

#### Pasul 8.2: Tablet (768px - 1024px)
**Resize browser sau use DevTools**

**Check**:
- [ ] Subcategories grid: 3 columns
- [ ] Product catalog: 2-3 columns
- [ ] Mega-menu still accessible

#### Pasul 8.3: Mobile (< 768px)
**Check**:
- [ ] Subcategories grid: 2 columns
- [ ] Product catalog: 1-2 columns
- [ ] Mobile menu replaces mega-menu
- [ ] Footer stacks to 1 column

---

### TEST 9: Performance

#### Pasul 9.1: Lighthouse audit
**In Chrome DevTools**:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
   - [x] SEO
4. Run audit on `/produse/marketing`

**Expected scores**:
- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

#### Pasul 9.2: Network tab
**Check**:
- [ ] Category data loads fast (< 200ms)
- [ ] No unnecessary API calls
- [ ] Images lazy-loaded

---

### TEST 10: Edge Cases

#### Pasul 10.1: Category fără produse
**Create test**: Category cu 0 products

**Expected**:
- [ ] Page loads
- [ ] "Nu există produse" message
- [ ] No error în console

#### Pasul 10.2: Category fără subcategorii
**Navigate to**: Category fără children (ex: leaf category)

**Expected**:
- [ ] No subcategories grid
- [ ] Product catalog directly visible

#### Pasul 10.3: Parent category fără descriere
**Expected**:
- [ ] Page loads
- [ ] Header shows name only (no description)

---

## 🐛 Bug Tracking

### Issues Found

| # | Issue | Severity | Page | Status |
|---|-------|----------|------|--------|
| 1 | | | | |
| 2 | | | | |

**Template pentru raportare**:
```
Issue #: 
Description: 
Steps to reproduce:
  1. 
  2.
Expected: 
Actual: 
Browser: 
Screenshot: 
```

---

## ✅ Final Checklist

### Critical (Must pass)
- [ ] All main category URLs work (`/produse/[slug]`)
- [ ] All subcategory URLs work (`/produse/[parent]/[child]`)
- [ ] Navigation links updated (mega-menu, mobile, footer)
- [ ] Product filtering by category works
- [ ] No 500 errors în console
- [ ] Breadcrumbs navigation functional

### Important (Should pass)
- [ ] SEO metadata present (title, description, OG tags)
- [ ] Responsive design works (desktop, tablet, mobile)
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] 404 handling for invalid slugs

### Nice to have
- [ ] Lighthouse SEO > 90
- [ ] Animations smooth
- [ ] Accessibility score > 90

---

## 📸 Screenshots Needed

### For documentation
1. **Desktop mega-menu** - hover state cu subcategories
2. **Mobile menu** - expanded category
3. **Category page** - `/produse/marketing` full page
4. **Subcategory page** - `/produse/marketing/flyere`
5. **Breadcrumbs** - navigație
6. **Lighthouse scores** - performance audit

**Save to**: `docs/screenshots/pas7/`

---

## 🚀 Post-Testing

### If all tests pass ✅

1. **Create summary report**
   ```bash
   # docs/RAPORT_PAS7_TESTING_RESULTS.md
   ```

2. **Update main documentation**
   ```bash
   # Update PRODUCT_CATEGORIES_STRUCTURE.md
   # Mark PAS 7 as ✅ TESTAT
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "✅ PAS 7 complete: SEO URLs tested and verified"
   ```

4. **Move to PAS 8**: Breadcrumbs & Schema.org markup

### If tests fail ❌

1. **Document issues** în Bug Tracking section
2. **Fix critical issues** before proceeding
3. **Re-test** după fixes
4. **Update documentation** with known issues

---

## 🎯 Success Criteria

**PAS 7 considered complete when**:
- ✅ All Critical tests pass
- ✅ 90%+ Important tests pass
- ✅ No server errors (500)
- ✅ Performance acceptable
- ✅ Documentation updated

---

**Tester**: _____________  
**Date completed**: _____________  
**Results**: ⬜ PASS / ⬜ FAIL / ⬜ PARTIAL

**Notes**:
```
[Space for testing notes]
```
