# 📱 Ghid testare responsive design - sanduta.art

## Verificare rapidă (5 minute)

### 1. Breakpoints principale
```
Mobile:  320px - 767px
Tablet:  768px - 1023px
Desktop: 1024px+
```

### 2. Pagini critice de testat

#### Homepage `/`
- [ ] **Mobile (375px)**: Meniu hamburger funcțional, imagini optimizate
- [ ] **Tablet (768px)**: Grid 2 coloane produse featured
- [ ] **Desktop (1280px)**: Full header cu toate meniurile

#### Products `/products`
- [ ] **Mobile**: 1 coloană produse, filtre în modal/drawer
- [ ] **Tablet**: 2 coloane produse, filtre în sidebar colapsabil
- [ ] **Desktop**: 3-4 coloane produse, filtre permanente lateral

#### Product Detail `/products/[id]`
- [ ] **Mobile**: Imagini fullwidth, galerie swipe
- [ ] **Tablet**: Imagini 50%, info 50% side-by-side
- [ ] **Desktop**: Imagini 60%, info 40%, thumbnails vizibile

#### Cart `/cart`
- [ ] **Mobile**: Lista stack vertical, CTA sticky bottom
- [ ] **Tablet**: Tabel simplu cu qty inline
- [ ] **Desktop**: Tabel complet cu toate coloanele

#### Checkout `/checkout`
- [ ] **Mobile**: Form multi-step (1 secțiune pe ecran)
- [ ] **Tablet**: 2 coloane (form + summary)
- [ ] **Desktop**: 3 coloane cu sidebar fix

#### Admin Dashboard `/admin`
- [ ] **Mobile**: Menu colapsabil, carduri stack
- [ ] **Tablet**: Sidebar permanent, grid 2col stats
- [ ] **Desktop**: Full layout 3col, toate graficele

## Chrome DevTools method (recomandat)

### Setup rapid
1. Deschide Developer Tools (`F12` sau `Cmd+Option+I`)
2. Toggle device toolbar (`Ctrl+Shift+M` sau `Cmd+Shift+M`)
3. Selectează preset device SAU custom dimensions

### Preseturi utile
```
iPhone SE:      375x667
iPhone 12 Pro:  390x844
iPad:           768x1024
iPad Pro:       1024x1366
Desktop HD:     1920x1080
```

### Test workflow
```bash
# 1. Pornește serverul
npm run dev

# 2. Deschide browser la localhost:3000

# 3. Pentru fiecare pagină:
- Test Mobile First (375px)
- Zoom In/Out pentru readability
- Rotate landscape (pentru mobile)
- Test Tablet (768px)
- Test Desktop (1280px, 1920px)

# 4. Screenshot compare (optional)
- Chrome DevTools > Device Toolbar > More options > Capture screenshot
```

## Test checklist detaliat

### Layout & Structure
- [ ] **Container widths**: Nu overflow pe mobile
- [ ] **Padding/Margins**: Consistent pe toate breakpoints
- [ ] **Grid/Flex**: Se adaptează corect (1col→2col→3col)
- [ ] **Sidebar**: Colapsează în hamburger pe mobile
- [ ] **Footer**: Stack vertical pe mobile, horizontal pe desktop

### Typography
- [ ] **Font sizes**: Readable fără zoom (minim 16px body pe mobile)
- [ ] **Line height**: 1.5-1.8 pentru confort citit
- [ ] **Headings**: Scale corespunzător (H1: 24px mobile, 40px desktop)
- [ ] **Text truncation**: `...` pentru titluri lungi în carduri

### Images & Media
- [ ] **Responsive images**: `srcset` pentru densități diferite
- [ ] **Aspect ratio**: Păstrat pe toate breakpoints
- [ ] **Loading**: Lazy load pentru imagini off-screen
- [ ] **Gallery**: Swipe pe mobile, click pe desktop

### Navigation
- [ ] **Header**: 
  - Mobile: Logo + hamburger + cart icon
  - Desktop: Full menu horizontal
- [ ] **Hamburger menu**: 
  - Deschide smooth (slide-in animation)
  - Overlay backdrop (blur background)
  - Close button vizibil
- [ ] **Breadcrumbs**: Hidden pe mobile SAU scroll horizontal

### Forms
- [ ] **Input fields**: Fullwidth pe mobile, max-width pe desktop
- [ ] **Labels**: Above inputs pe mobile, inline posibil pe desktop
- [ ] **Buttons**: Fullwidth pe mobile, auto-width pe desktop
- [ ] **Validation**: Mesaje eroare vizibile sub input
- [ ] **Keyboard**: Input type corect (email, tel, number)

### Tables
- [ ] **Mobile**: Card layout SAU horizontal scroll
- [ ] **Tablet**: Simplificat (hidden non-essential columns)
- [ ] **Desktop**: Full table cu toate coloanele

### Interactions
- [ ] **Touch targets**: Minim 44x44px pentru butoane/links
- [ ] **Hover states**: Doar pe desktop (no-hover on touch)
- [ ] **Swipe gestures**: Carousel, image gallery pe mobile
- [ ] **Scroll behavior**: Smooth, no horizontal overflow

### Performance
- [ ] **Load time**: < 3s pe 3G network (Chrome DevTools > Network throttling)
- [ ] **Images**: Optimizate (WebP, dimensiuni corecte)
- [ ] **JS bundle**: Code splitting pentru heavy components
- [ ] **CSS**: Critical CSS inline, rest async

## Tools & Extensions

### Browser extensions
```
- Responsive Viewer (Chrome): Test multiple devices simultan
- Viewport Resizer (Chrome): Quick resize shortcuts
- Lighthouse (built-in): Performance & accessibility audit
```

### Online tools
```
- BrowserStack: Real device testing (paid)
- LambdaTest: Cross-browser testing (free tier)
- Responsively App: Desktop app cu multiple viewports
```

## Common issues & fixes

### Horizontal scroll pe mobile
```css
/* Fix overflow */
body, html {
  overflow-x: hidden;
}

/* Check for elements cu width > 100vw */
* {
  box-sizing: border-box;
}
```

### Text prea mic pe mobile
```css
/* Minimum font size */
body {
  font-size: clamp(16px, 2vw, 18px);
}
```

### Images distorsionate
```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### Buttons prea mici pentru touch
```css
button, a {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}
```

## TailwindCSS responsive prefixes

```jsx
{/* Mobile first approach */}
<div className="
  p-4 sm:p-6 md:p-8    // Padding crește cu ecranul
  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  // Coloane responsive
  text-sm md:text-base lg:text-lg  // Font scaling
">
  <button className="
    w-full sm:w-auto     // Fullwidth mobile, auto desktop
    text-sm sm:text-base // Text size
    px-4 py-2 sm:px-6 sm:py-3  // Padding
  ">
    Submit
  </button>
</div>
```

## Testing script automated (optional)

```javascript
// test-responsive.js
const puppeteer = require('puppeteer');

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 }
];

const pages = ['/', '/products', '/cart', '/admin'];

(async () => {
  const browser = await puppeteer.launch();
  
  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    
    for (const url of pages) {
      await page.goto(`http://localhost:3000${url}`);
      await page.screenshot({ 
        path: `screenshots/${viewport.name}-${url.replace('/', 'home')}.png`,
        fullPage: true 
      });
    }
    
    await page.close();
  }
  
  await browser.close();
})();
```

## Final checklist production

- [ ] **Manual test pe 3 device-uri fizice** (minim 1 iOS, 1 Android, 1 Desktop)
- [ ] **Lighthouse audit** (Mobile: >90 Performance, >95 Accessibility)
- [ ] **Cross-browser** (Chrome, Safari, Firefox, Edge)
- [ ] **Orientations** (Portrait & Landscape pentru mobile/tablet)
- [ ] **Touch events** (scroll, swipe, pinch-zoom disabled unde trebuie)
- [ ] **Font loading** (FOUT/FOIT handled cu font-display: swap)
- [ ] **Images lazy load** (verificat cu Network tab throttling)

## Resources

- TailwindCSS Responsive: https://tailwindcss.com/docs/responsive-design
- Chrome DevTools Device Mode: https://developer.chrome.com/docs/devtools/device-mode
- Web.dev Responsive: https://web.dev/responsive-web-design-basics

---

**Pro tip**: Testează întotdeauna pe device-uri reale înainte de production deploy! Simulatoarele nu prind toate edge cases (notch, safe-area, keyboard overlay, etc.)
