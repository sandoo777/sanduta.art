#!/bin/bash

# Test script pentru PAS 7: SEO URLs & Category Landing Pages
# Verifică implementarea rutelor și navigației

set -e

echo "🧪 PAS 7 TESTING SCRIPT"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3002"

# Check if server is running
echo "📡 Checking if dev server is running on port 3002..."
if ! lsof -ti:3002 > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not running on port 3002${NC}"
    echo ""
    echo "Please start the server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing: $description ... "
    
    # Make request and capture HTTP status
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC} ($status)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} ($status)"
        return 1
    fi
}

# Test counter
total_tests=0
passed_tests=0

echo "🔍 TESTING MAIN CATEGORY ROUTES"
echo "================================"
echo ""

# Main categories
main_categories=(
    "carti-de-vizita:Cărți de vizită"
    "marketing:Marketing"
    "foto-arta:Foto & Artă"
    "textile-merch:Textile & Merch"
    "ambalaje:Ambalaje"
    "cadouri:Cadouri"
    "corporate:Corporate"
    "papetarie:Papetărie"
)

for category in "${main_categories[@]}"; do
    IFS=':' read -r slug name <<< "$category"
    total_tests=$((total_tests + 1))
    
    if test_url "${BASE_URL}/produse/${slug}" "$name (/produse/${slug})"; then
        passed_tests=$((passed_tests + 1))
    fi
done

echo ""
echo "🔍 TESTING NESTED SUBCATEGORY ROUTES"
echo "====================================="
echo ""

# Sample subcategories
subcategories=(
    "carti-de-vizita/carti-vizita-standard:Cărți vizita standard"
    "marketing/flyere:Flyere"
    "foto-arta/canvas-personalizat:Canvas personalizat"
    "textile-merch/tricouri:Tricouri"
)

for subcategory in "${subcategories[@]}"; do
    IFS=':' read -r path name <<< "$subcategory"
    total_tests=$((total_tests + 1))
    
    if test_url "${BASE_URL}/produse/${path}" "$name (/produse/${path})"; then
        passed_tests=$((passed_tests + 1))
    fi
done

echo ""
echo "🔍 TESTING NAVIGATION COMPONENTS"
echo "================================="
echo ""

# Test homepage (should have mega-menu)
total_tests=$((total_tests + 1))
echo -n "Testing: Homepage with navigation ... "
response=$(curl -s "${BASE_URL}" 2>/dev/null)

if echo "$response" | grep -q "Categorii" && echo "$response" | grep -q "/produse/"; then
    echo -e "${GREEN}✅ OK${NC} (Navigation found)"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ FAIL${NC} (Navigation not found)"
fi

echo ""
echo "🔍 TESTING 404 HANDLING"
echo "======================="
echo ""

# Test invalid URLs (should return 404 or redirect)
invalid_urls=(
    "/produse/invalid-category"
    "/produse/marketing/invalid-subcategory"
)

for url in "${invalid_urls[@]}"; do
    total_tests=$((total_tests + 1))
    echo -n "Testing: $url (should 404) ... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${url}" 2>/dev/null)
    
    if [ "$status" = "404" ] || [ "$status" = "302" ]; then
        echo -e "${GREEN}✅ OK${NC} ($status)"
        passed_tests=$((passed_tests + 1))
    else
        echo -e "${YELLOW}⚠️  UNEXPECTED${NC} ($status - expected 404 or 302)"
    fi
done

echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo ""
echo -e "Total tests: ${BLUE}${total_tests}${NC}"
echo -e "Passed: ${GREEN}${passed_tests}${NC}"
echo -e "Failed: ${RED}$((total_tests - passed_tests))${NC}"
echo ""

# Calculate percentage
percentage=$((passed_tests * 100 / total_tests))

if [ $percentage -eq 100 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED! (100%)${NC}"
    echo ""
    echo "🎉 PAS 7 is working correctly!"
    echo ""
    echo "Next steps:"
    echo "  1. Manual testing in browser: http://localhost:3002"
    echo "  2. Check navigation (mega-menu, mobile menu, footer)"
    echo "  3. Verify SEO metadata (view page source)"
    echo "  4. Test breadcrumbs navigation"
    echo ""
    exit 0
elif [ $percentage -ge 80 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY PASSING ($percentage%)${NC}"
    echo ""
    echo "Some tests failed. Please check the errors above."
    echo ""
    exit 1
else
    echo -e "${RED}❌ MANY TESTS FAILED ($percentage%)${NC}"
    echo ""
    echo "Please fix the errors and run the tests again."
    echo ""
    exit 1
fi
