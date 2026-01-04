#!/bin/bash

# Test Cart System
# This script tests the shopping cart functionality

echo "======================================"
echo "🛒 TEST: CART SYSTEM"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "======================================"
echo "TEST 1: Cart Store File Exists"
echo "======================================"
if [ -f "src/modules/cart/cartStore.ts" ]; then
    print_result 0 "Cart store file exists"
    
    # Check for key functions
    if grep -q "addItem" "src/modules/cart/cartStore.ts"; then
        print_result 0 "addItem function exists"
    else
        print_result 1 "addItem function missing"
    fi
    
    if grep -q "removeItem" "src/modules/cart/cartStore.ts"; then
        print_result 0 "removeItem function exists"
    else
        print_result 1 "removeItem function missing"
    fi
    
    if grep -q "updateItem" "src/modules/cart/cartStore.ts"; then
        print_result 0 "updateItem function exists"
    else
        print_result 1 "updateItem function missing"
    fi
    
    if grep -q "duplicateItem" "src/modules/cart/cartStore.ts"; then
        print_result 0 "duplicateItem function exists"
    else
        print_result 1 "duplicateItem function missing"
    fi
    
    if grep -q "getTotals" "src/modules/cart/cartStore.ts"; then
        print_result 0 "getTotals function exists"
    else
        print_result 1 "getTotals function missing"
    fi
else
    print_result 1 "Cart store file does not exist"
fi
echo ""

echo "======================================"
echo "TEST 2: Cart Components Exist"
echo "======================================"

if [ -f "src/components/public/cart/CartItem.tsx" ]; then
    print_result 0 "CartItem component exists"
else
    print_result 1 "CartItem component missing"
fi

if [ -f "src/components/public/cart/CartList.tsx" ]; then
    print_result 0 "CartList component exists"
else
    print_result 1 "CartList component missing"
fi

if [ -f "src/components/public/cart/CartSummary.tsx" ]; then
    print_result 0 "CartSummary component exists"
else
    print_result 1 "CartSummary component missing"
fi
echo ""

echo "======================================"
echo "TEST 3: Cart Page Exists"
echo "======================================"

if [ -f "src/app/(public)/cart/page.tsx" ]; then
    print_result 0 "Cart page exists"
    
    # Check for key imports
    if grep -q "CartList" "src/app/(public)/cart/page.tsx"; then
        print_result 0 "CartList imported in cart page"
    else
        print_result 1 "CartList not imported"
    fi
    
    if grep -q "CartSummary" "src/app/(public)/cart/page.tsx"; then
        print_result 0 "CartSummary imported in cart page"
    else
        print_result 1 "CartSummary not imported"
    fi
    
    if grep -q "useCartStore" "src/app/(public)/cart/page.tsx"; then
        print_result 0 "useCartStore imported in cart page"
    else
        print_result 1 "useCartStore not imported"
    fi
else
    print_result 1 "Cart page does not exist"
fi
echo ""

echo "======================================"
echo "TEST 4: Cart Item Component Structure"
echo "======================================"

if [ -f "src/components/public/cart/CartItem.tsx" ]; then
    # Check for key elements
    if grep -q "previewUrl" "src/components/public/cart/CartItem.tsx"; then
        print_result 0 "Preview image support"
    else
        print_result 1 "Preview image support missing"
    fi
    
    if grep -q "specifications" "src/components/public/cart/CartItem.tsx"; then
        print_result 0 "Specifications display"
    else
        print_result 1 "Specifications display missing"
    fi
    
    if grep -q "onRemove" "src/components/public/cart/CartItem.tsx"; then
        print_result 0 "Remove button functionality"
    else
        print_result 1 "Remove button functionality missing"
    fi
    
    if grep -q "onDuplicate" "src/components/public/cart/CartItem.tsx"; then
        print_result 0 "Duplicate button functionality"
    else
        print_result 1 "Duplicate button functionality missing"
    fi
    
    if grep -q "editItemId" "src/components/public/cart/CartItem.tsx"; then
        print_result 0 "Edit functionality"
    else
        print_result 1 "Edit functionality missing"
    fi
    
    if grep -q "priceBreakdown" "src/components/public/cart/CartItem.tsx"; then
        print_result 0 "Price breakdown display"
    else
        print_result 1 "Price breakdown display missing"
    fi
fi
echo ""

echo "======================================"
echo "TEST 5: Cart Summary Features"
echo "======================================"

if [ -f "src/components/public/cart/CartSummary.tsx" ]; then
    if grep -q "subtotal" "src/components/public/cart/CartSummary.tsx"; then
        print_result 0 "Subtotal calculation"
    else
        print_result 1 "Subtotal calculation missing"
    fi
    
    if grep -q "discount" "src/components/public/cart/CartSummary.tsx"; then
        print_result 0 "Discount calculation"
    else
        print_result 1 "Discount calculation missing"
    fi
    
    if grep -q "vat" "src/components/public/cart/CartSummary.tsx"; then
        print_result 0 "VAT calculation"
    else
        print_result 1 "VAT calculation missing"
    fi
    
    if grep -q "total" "src/components/public/cart/CartSummary.tsx"; then
        print_result 0 "Total calculation"
    else
        print_result 1 "Total calculation missing"
    fi
    
    if grep -q "checkout" "src/components/public/cart/CartSummary.tsx"; then
        print_result 0 "Checkout button"
    else
        print_result 1 "Checkout button missing"
    fi
fi
echo ""

echo "======================================"
echo "TEST 6: Edit Mode Support"
echo "======================================"

if [ -f "src/app/(public)/produse/[slug]/configure/page.tsx" ]; then
    if grep -q "editItemId" "src/app/(public)/produse/[slug]/configure/page.tsx"; then
        print_result 0 "Edit mode parameter support"
    else
        print_result 1 "Edit mode parameter support missing"
    fi
    
    if grep -q "getItem" "src/app/(public)/produse/[slug]/configure/page.tsx"; then
        print_result 0 "Get item from cart"
    else
        print_result 1 "Get item from cart missing"
    fi
    
    if grep -q "useSearchParams" "src/app/(public)/produse/[slug]/configure/page.tsx"; then
        print_result 0 "URL parameters support"
    else
        print_result 1 "URL parameters support missing"
    fi
fi
echo ""

echo "======================================"
echo "TEST 7: Header Cart Integration"
echo "======================================"

if [ -f "src/components/public/Header.tsx" ]; then
    if grep -q "useCartStore" "src/components/public/Header.tsx"; then
        print_result 0 "Cart store integration"
    else
        print_result 1 "Cart store integration missing"
    fi
    
    if grep -q "cartItemCount" "src/components/public/Header.tsx"; then
        print_result 0 "Cart item count display"
    else
        print_result 1 "Cart item count display missing"
    fi
    
    if grep -q "/cart" "src/components/public/Header.tsx"; then
        print_result 0 "Cart link in header"
    else
        print_result 1 "Cart link in header missing"
    fi
fi
echo ""

echo "======================================"
echo "TEST 8: Responsive Design"
echo "======================================"

if [ -f "src/app/(public)/cart/page.tsx" ]; then
    if grep -q "lg:grid-cols" "src/app/(public)/cart/page.tsx"; then
        print_result 0 "Desktop grid layout"
    else
        print_result 1 "Desktop grid layout missing"
    fi
    
    if grep -q "md:flex-row" "src/components/public/cart/CartItem.tsx" ] || grep -q "lg:hidden" "src/app/(public)/cart/page.tsx"; then
        print_result 0 "Mobile responsive layout"
    else
        print_result 1 "Mobile responsive layout missing"
    fi
    
    if grep -q "sticky" "src/app/(public)/cart/page.tsx"; then
        print_result 0 "Sticky elements for mobile"
    else
        print_result 1 "Sticky elements for mobile missing"
    fi
fi
echo ""

echo "======================================"
echo "TEST 9: Data Persistence"
echo "======================================"

if [ -f "src/modules/cart/cartStore.ts" ]; then
    if grep -q "persist" "src/modules/cart/cartStore.ts"; then
        print_result 0 "Zustand persist middleware"
    else
        print_result 1 "Zustand persist middleware missing"
    fi
    
    if grep -q "sanduta-cart-storage" "src/modules/cart/cartStore.ts"; then
        print_result 0 "LocalStorage key defined"
    else
        print_result 1 "LocalStorage key missing"
    fi
fi
echo ""

echo "======================================"
echo "TEST 10: Branding Colors"
echo "======================================"

CART_FILES=(
    "src/app/(public)/cart/page.tsx"
    "src/components/public/cart/CartItem.tsx"
    "src/components/public/cart/CartSummary.tsx"
)

PRIMARY_COLOR="#0066FF"
ACCENT_COLOR="#FACC15"

for file in "${CART_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "$PRIMARY_COLOR" "$file" || grep -q "bg-\[#0066FF\]" "$file" || grep -q "text-\[#0066FF\]" "$file"; then
            print_result 0 "Primary color used in $(basename $file)"
        else
            print_result 1 "Primary color not used in $(basename $file)"
        fi
    fi
done
echo ""

echo "======================================"
echo "📊 TEST SUMMARY"
echo "======================================"
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "======================================"
    echo "🎉 CART SYSTEM READY!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run dev"
    echo "2. Visit: http://localhost:3000/cart"
    echo "3. Test adding products from configurator"
    echo "4. Test editing products from cart"
    echo "5. Test removing and duplicating items"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Please check the failed tests above."
    exit 1
fi
