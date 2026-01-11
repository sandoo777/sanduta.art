#!/bin/bash

# PAS 8.2: Frontend Testing - Navigation & Filtering
# Verifică că toate funcționalitățile frontend funcționează corect

set -e

echo "🎨 PAS 8.2: FRONTEND TESTING"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3002"

# Check if server is running
echo "📡 Checking server status..."
if ! lsof -ti:3002 > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not running on port 3002${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server running${NC}"
echo ""

echo "📝 FRONTEND TESTING CHECKLIST"
echo "=============================="
echo ""

cat << 'CHECKLIST'
🔍 TEST 1: MEGA-MENU NAVIGATION (Desktop)
==========================================

1. Open homepage: http://localhost:3002
2. Hover over "Categorii" in header
   [ ] Mega-menu opens smoothly
   [ ] Shows all 8 main categories with icons
   [ ] Each category shows up to 6 subcategories
   [ ] Hover effects work (color change)

3. Click on main category (e.g., "Cărți de vizită")
   [ ] Navigates to /produse/carti-de-vizita
   [ ] Page loads without errors
   [ ] Breadcrumbs show: Acasă / Cărți de vizită
   [ ] Category header displays correctly

4. Click on subcategory (e.g., "Cărți vizita standard")
   [ ] Navigates to /produse/carti-de-vizita/carti-vizita-standard
   [ ] Breadcrumbs show: Acasă / Cărți de vizită / Cărți vizita standard
   [ ] Products filtered by subcategory

5. Test "Vezi toate" link
   [ ] Shows all subcategories count
   [ ] Links to parent category page


🔍 TEST 2: MOBILE NAVIGATION
=============================

1. Resize browser to mobile (< 768px) or use DevTools
2. Click hamburger menu (☰)
   [ ] Mobile menu slides in from left/right
   [ ] "Categorii" section visible

3. Click on a parent category
   [ ] Subcategories expand with animation
   [ ] Chevron rotates to indicate expanded state
   [ ] Subcategories are indented

4. Click on parent category name
   [ ] Navigates to category page
   [ ] Mobile menu closes automatically

5. Click on subcategory
   [ ] Navigates to subcategory page
   [ ] Mobile menu closes

6. Click outside menu
   [ ] Menu closes


🔍 TEST 3: FOOTER CATEGORIES
==============================

1. Scroll to footer
   [ ] "Categorii" section shows 4 featured categories
   [ ] Categories have icons and names

2. Click each featured category
   [ ] Cărți de vizită → /produse/carti-de-vizita ✓
   [ ] Marketing → /produse/marketing ✓
   [ ] Foto & Artă → /produse/foto-arta ✓
   [ ] Textile & Merch → /produse/textile-merch ✓


🔍 TEST 4: CATEGORY PAGES
===========================

Test URL: /produse/marketing

1. Page Structure
   [ ] SEO-friendly URL (lowercase, hyphens)
   [ ] Page title in browser tab correct
   [ ] H1 shows category name with icon

2. Breadcrumbs (with schema.org)
   [ ] Breadcrumbs visible below header
   [ ] "Acasă" link works → /
   [ ] Category name is current (not clickable)
   [ ] Schema.org markup in page source (script tag with @type: BreadcrumbList)

3. Category Header
   [ ] Icon displays correctly (📢 for Marketing)
   [ ] Category name prominent
   [ ] Description visible
   [ ] Product count badge shows correct number
   [ ] Subcategory count visible

4. Subcategories Grid
   [ ] Grid layout: 2 columns (mobile), 3-4 (desktop)
   [ ] Each card shows: icon, name, description, product count
   [ ] Hover effect on cards
   [ ] Click on subcategory → correct URL

5. Product Catalog
   [ ] Products filtered by category automatically
   [ ] Product count matches header badge
   [ ] Products display in grid
   [ ] Pagination works (if many products)


🔍 TEST 5: SUBCATEGORY PAGES
==============================

Test URL: /produse/marketing/flyere

1. Page Load
   [ ] URL is SEO-friendly
   [ ] Page loads without 404
   [ ] No console errors

2. Breadcrumbs
   [ ] Shows: Acasă / Marketing / Flyere
   [ ] Parent link works → /produse/marketing
   [ ] Schema.org markup present

3. Content
   [ ] Subcategory name and icon
   [ ] Description (if available)
   [ ] Product count
   [ ] Products filtered by subcategory


🔍 TEST 6: PRODUCT FILTERING
==============================

On category page: /produse/marketing

1. Initial Load
   [ ] Products auto-filtered by category
   [ ] Only Marketing products visible
   [ ] No products from other categories

2. Filter Sidebar/Panel
   [ ] Category filter shows "Marketing" selected
   [ ] Can see other filter options (price, etc.)

3. Search within category
   [ ] Search box works
   [ ] Results stay within category

4. Clear filters
   [ ] "Clear filters" button works
   [ ] Shows all products (not just category)


🔍 TEST 7: SEO & METADATA
==========================

1. View Page Source (/produse/marketing)
   [ ] <title> tag: "Marketing | Sanduta.Art" or custom metaTitle
   [ ] <meta name="description"> present
   [ ] <meta property="og:title"> present
   [ ] <meta property="og:description"> present
   [ ] schema.org BreadcrumbList JSON-LD present

2. Google Rich Results Test (after deploy)
   [ ] Visit: https://search.google.com/test/rich-results
   [ ] Test production URL
   [ ] Breadcrumbs rich snippet detected


🔍 TEST 8: RESPONSIVE DESIGN
==============================

Test breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

1. Mobile (< 768px)
   [ ] Mega-menu hidden, hamburger visible
   [ ] Category header text readable
   [ ] Subcategories grid: 2 columns
   [ ] Product grid: 1-2 columns
   [ ] Breadcrumbs wrap properly

2. Tablet (768px - 1024px)
   [ ] Mega-menu still accessible
   [ ] Subcategories grid: 3 columns
   [ ] Product grid: 2-3 columns

3. Desktop (> 1024px)
   [ ] Mega-menu with hover
   [ ] Subcategories grid: 4 columns
   [ ] Product grid: 3-4 columns
   [ ] Wide layout utilizes space


🔍 TEST 9: EDGE CASES
======================

1. Category without products
   [ ] Page loads
   [ ] Shows "Nu există produse" message
   [ ] No errors

2. Category without subcategories
   [ ] No subcategories grid
   [ ] Products display immediately

3. Invalid category slug
   Test URL: /produse/invalid-slug
   [ ] 404 page or redirect
   [ ] No server error

4. Invalid subcategory
   Test URL: /produse/marketing/invalid-subcategory
   [ ] 404 page
   [ ] Graceful error handling


🔍 TEST 10: PERFORMANCE
========================

1. Lighthouse Audit (Chrome DevTools)
   Test URL: /produse/marketing
   
   [ ] Performance Score > 80
   [ ] Accessibility Score > 90
   [ ] Best Practices > 90
   [ ] SEO Score > 90

2. Page Load Speed
   [ ] Category page loads < 2 seconds
   [ ] Images lazy-load
   [ ] No layout shift (CLS)

3. Network Tab
   [ ] No unnecessary API calls
   [ ] Static assets cached
   [ ] Images optimized

CHECKLIST

echo ""
echo "📊 TESTING SUMMARY"
echo "=================="
echo ""
echo -e "${BLUE}Frontend testing checklist generated.${NC}"
echo ""
echo "To test:"
echo "  1. Open http://localhost:3002 in browser"
echo "  2. Follow the checklist above"
echo "  3. Mark each item as you test"
echo ""
echo "Next step: UX Verification"
echo "  ./scripts/test-pas8-ux.sh"
echo ""
