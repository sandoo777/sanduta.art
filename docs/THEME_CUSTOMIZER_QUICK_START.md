# Theme Customizer - Quick Start Guide

## 🚀 Start în 5 minute

### 1. Accesare (30 sec)

```bash
# Pornește serverul
npm run dev

# Navighează la:
http://localhost:3000/admin/theme
```

**Login**: `admin@sanduta.art` / `admin123`

---

### 2. Primul theme customization (2 min)

#### **Tab: Colors**
1. Click pe **"Colors"** tab
2. Schimbă **Primary Color** → ex: `#FF6B6B` (roșu)
3. Observă **Contrast Checker** (trebuie AA sau AAA)
4. Click **"Preview"** tab → vezi schimbarea live

#### **Tab: Branding**
1. Click pe **"Branding"** tab
2. Modifică **Site Name** → ex: "Magazinul meu"
3. Adaugă **Instagram** link → ex: https://instagram.com/shop
4. Click **"Preview"** → vezi în header

---

### 3. Salvare și publicare (1 min)

1. Click **"💾 Save Draft"** (top-right)
   - ✅ Succes: "Theme saved as draft!"

2. Click **"🚀 Publish"**
   - ⚠️ Confirmare: "Are you sure?"
   - ✅ Succes: "Theme published successfully!"

3. Navighează la **homepage** (/) → vezi tema nouă live!

---

### 4. Homepage Builder (1.5 min)

1. Click **"Homepage"** tab

2. **Add Hero Block**:
   - Click pe "🎯 Hero Banner"
   - În **Block Settings** (dreapta):
     - Title: "Bun venit!"
     - Subtitle: "Produse unice"
     - CTA Text: "Vezi produse"
     - CTA Link: "/products"

3. **Add Featured Products**:
   - Click pe "⭐ Featured Products"
   - Setează **Limit**: 8
   - Product IDs: "1,2,3,4"

4. **Reorder** (drag & drop):
   - Trage block-ul Hero în sus/jos cu ⋮⋮

5. **Save & Publish**

---

## 📋 Checklist rapid testare

### Branding (30 sec)
- [ ] Schimbă site name
- [ ] Adaugă social link (Instagram/Facebook)

### Colors (45 sec)
- [ ] Schimbă primary color
- [ ] Verifică contrast (trebuie verde "AA" sau "AAA")

### Typography (30 sec)
- [ ] Schimbă **Primary Font** → ex: "Poppins"
- [ ] Vezi preview-ul

### Layout (30 sec)
- [ ] Toggle **Sticky Header** on/off
- [ ] Schimbă **Logo Position** → Center

### Components (30 sec)
- [ ] Modifică **Button Border Radius** → ex: "999px" (pill)
- [ ] Activează **Card Hover Effect**

### Homepage (1 min)
- [ ] Adaugă 1 Hero block
- [ ] Adaugă 1 Featured Products block
- [ ] Drag & drop pentru reordonare

### Preview (30 sec)
- [ ] Switch **Device Modes** (Desktop/Tablet/Mobile)
- [ ] Verifică responsive

### Publish (20 sec)
- [ ] Save Draft
- [ ] Publish
- [ ] Verifică pe homepage (/)

**Total time**: ~5 minute pentru testare completă

---

## 🎨 Examples rapide

### Ex 1: Tema "Ocean Blue"
```javascript
Colors:
  Primary: #0EA5E9 (sky blue)
  Secondary: #06B6D4 (cyan)
  Accent: #F59E0B (amber)

Typography:
  Primary Font: "Open Sans"
  Heading Font: "Montserrat"

Components:
  Button Radius: 0.5rem (rounded)
  Card Shadow: md (medium)
```

### Ex 2: Tema "Forest Green"
```javascript
Colors:
  Primary: #10B981 (emerald)
  Secondary: #059669 (green)
  Accent: #F59E0B (amber)

Typography:
  Primary Font: "Inter"
  Heading Font: "Playfair Display"

Components:
  Button Radius: 0.25rem (sharp)
  Card Shadow: lg (large)
```

### Ex 3: Tema "Sunset"
```javascript
Colors:
  Primary: #F59E0B (amber)
  Secondary: #EF4444 (red)
  Accent: #8B5CF6 (purple)

Typography:
  Primary Font: "Lato"
  Heading Font: "Raleway"

Components:
  Button Radius: 9999px (pill)
  Card Shadow: sm (small)
```

---

## ⚡ Comenzi rapide

### Development
```bash
npm run dev           # Start server
npm run build         # Build production
npm run lint          # Check errors
```

### Database
```bash
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev # Run migrations
```

### Testing manual
1. `/admin/theme` - Theme Customizer
2. `/` - Homepage (verifică tema published)
3. `/products` - Catalog (verifică culori/fonts)
4. `/admin` - Admin dashboard (verifică că tema nu afectează admin UI)

---

## 🐛 Troubleshooting rapid

### ❌ "Theme not loading"
**Fix**:
```bash
# Verifică în browser console
# Ar trebui să vezi fetch la /api/admin/theme

# Verifică în Prisma Studio:
npx prisma studio
# Caută în "Setting" table → "theme_published"
```

### ❌ "Changes not applying"
**Fix**:
1. Verifică că ai dat **Save Draft**
2. Apoi **Publish** (nu uita!)
3. Refresh homepage (Ctrl+F5)

### ❌ "Preview not working"
**Fix**:
```javascript
// Verifică în browser DevTools console
// Căută erori în iframe

// Dacă nu merge, deschide în new tab:
// Click "↗️ Open" button
```

### ❌ "Contrast checker shows Fail"
**Fix**:
- Schimbă culoarea până apare "AA" sau "AAA"
- Verde = OK, Roșu = Not accessible
- Țintește minimum 4.5:1 ratio

---

## 📞 Need help?

### Documentation completă:
- `docs/THEME_CUSTOMIZER_SYSTEM.md` - Full docs (3500+ words)

### API Testing:
```bash
# GET current theme
curl http://localhost:3000/api/admin/theme

# GET draft
curl http://localhost:3000/api/admin/theme?version=draft
```

### Prisma:
```bash
# Vezi toate settings
npx prisma studio
# → Settings table → caută "theme_draft" și "theme_published"
```

---

**Succes!** În 5 minute ai un theme customizer funcțional. 🎉
