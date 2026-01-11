#!/bin/bash

# PAS 8.1: Admin Testing - Categories CRUD Operations
# Verifică că toate operațiile CRUD funcționează corect în admin

set -e

echo "🔧 PAS 8.1: ADMIN CATEGORIES TESTING"
echo "====================================="
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
    echo ""
    echo "Please start the server:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Server running${NC}"
echo ""

echo "🔐 ADMIN AUTHENTICATION TEST"
echo "============================="
echo ""

# Test admin login page accessibility
echo -n "Testing admin login page ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/admin/login" 2>/dev/null)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAIL${NC} (Status: $status)"
fi

echo ""
echo "📊 ADMIN CATEGORIES PAGE TEST"
echo "=============================="
echo ""

# Test categories admin page (should redirect to login if not authenticated)
echo -n "Testing /admin/categories endpoint ... "
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/admin/categories" 2>/dev/null)

if [ "$status" = "200" ] || [ "$status" = "302" ] || [ "$status" = "307" ]; then
    echo -e "${GREEN}✅ OK${NC} (Status: $status)"
else
    echo -e "${RED}❌ FAIL${NC} (Status: $status)"
fi

echo ""
echo "🔍 DATABASE VERIFICATION"
echo "========================"
echo ""

# Check categories in database
echo "Checking categories in database..."
echo ""

# Run prisma studio check (non-interactive)
echo "Categories count:"
npx prisma db execute --stdin <<SQL 2>/dev/null | tail -n +2
SELECT 
  'Total Categories' as metric,
  COUNT(*) as count
FROM "Category"
UNION ALL
SELECT 
  'Main Categories' as metric,
  COUNT(*) as count
FROM "Category"
WHERE "parentId" IS NULL
UNION ALL
SELECT 
  'Subcategories' as metric,
  COUNT(*) as count
FROM "Category"
WHERE "parentId" IS NOT NULL
UNION ALL
SELECT 
  'Active Categories' as metric,
  COUNT(*) as count
FROM "Category"
WHERE active = true;
SQL

echo ""
echo "📝 MANUAL TESTING CHECKLIST"
echo "============================"
echo ""

cat << 'CHECKLIST'
Please verify the following manually in the browser:

1. ADMIN LOGIN (http://localhost:3002/admin/login)
   [ ] Login page loads
   [ ] Can login with admin credentials
   [ ] Redirects to admin dashboard after login

2. CATEGORIES LIST (/admin/categories)
   [ ] All 93 categories visible
   [ ] Columns: Name, Slug, Icon, Parent, Products, Status, Actions
   [ ] Pagination works (if many categories)
   [ ] Search/filter works

3. CATEGORY VIEW/EDIT
   [ ] Click "Edit" on a category
   [ ] Form loads with current data
   [ ] Can see: name, slug, icon, description, parent, metadata
   [ ] "Active" toggle visible

4. CATEGORY UPDATE
   [ ] Change category name
   [ ] Change description
   [ ] Toggle active status
   [ ] Click "Save"
   [ ] Success message appears
   [ ] Changes reflected in list

5. CATEGORY ACTIVATION/DEACTIVATION
   [ ] Deactivate a category (toggle OFF)
   [ ] Check frontend - category disappears from menu
   [ ] Reactivate category (toggle ON)
   [ ] Check frontend - category reappears

6. CATEGORY RELATIONSHIPS
   [ ] Parent categories show children count
   [ ] Click parent → see all children
   [ ] Children show parent name

7. PRODUCT COUNT
   [ ] Categories show correct product count
   [ ] Click on product count → see products in that category

8. SLUG VALIDATION
   [ ] Try to create category with invalid slug (spaces, capitals)
   [ ] Should show validation error
   [ ] Try to create duplicate slug
   [ ] Should show error

9. CATEGORY DELETE (if implemented)
   [ ] Try to delete category with products
   [ ] Should show warning or prevent deletion
   [ ] Delete empty category
   [ ] Should succeed

10. BREADCRUMBS IN ADMIN
    [ ] Navigate: Categories → Edit Category
    [ ] Breadcrumbs show: Dashboard / Categories / Edit

CHECKLIST

echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo ""
echo -e "${BLUE}Automated checks completed.${NC}"
echo "Please complete the manual testing checklist above."
echo ""
echo "Next step: Run frontend testing"
echo "  ./scripts/test-pas8-frontend.sh"
echo ""
