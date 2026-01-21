#!/bin/bash
# Test G2.3 — Verificare API Endpoint Optimization

echo "================================================"
echo "  G2.3 API ENDPOINT OPTIMIZATION — VALIDATION"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Verificare fișiere API client
echo "📦 Test 1: API Client Files..."
if [ -f "src/lib/api/client.ts" ] && [ -f "src/lib/api/endpoints.ts" ] && [ -f "src/lib/api/index.ts" ]; then
  echo -e "  ${GREEN}✓${NC} All API client files exist"
else
  echo -e "  ${RED}✗${NC} Missing API client files"
  exit 1
fi

# Test 2: Count total files with fetch
echo ""
echo "📊 Test 2: Count Files with fetch('/api/'..."
TOTAL_FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "fetch(['\"]\/api\/" {} \; | wc -l)
echo -e "  ${YELLOW}ℹ${NC} Total files with API fetch: $TOTAL_FILES"

# Test 3: Count duplicate patterns
echo ""
echo "📉 Test 3: Duplicate API Endpoints..."
DUPLICATES=$(grep -r "fetch(['\"]\/api\/" src --include="*.tsx" --include="*.ts" | grep -E "(admin/users|admin/orders|admin/products|admin/theme|/categories[^/]|/products[^/]|/orders[^/])" | wc -l)
echo -e "  ${YELLOW}ℹ${NC} Duplicate calls to common endpoints: $DUPLICATES"

if [ "$DUPLICATES" -lt 40 ]; then
  echo -e "  ${GREEN}✓${NC} Duplicates reduced below target (< 40)"
else
  echo -e "  ${RED}✗${NC} Too many duplicates ($DUPLICATES >= 40)"
  exit 1
fi

# Test 4: TypeScript errors in API files
echo ""
echo "🔍 Test 4: TypeScript Errors..."
ERRORS=$(npx eslint src/lib/api/*.ts 2>&1 | grep -c "error" || echo "0")
if [ "$ERRORS" -eq "0" ]; then
  echo -e "  ${GREEN}✓${NC} No TypeScript errors in API files"
else
  echo -e "  ${RED}✗${NC} Found $ERRORS TypeScript errors"
  exit 1
fi

# Test 5: Verify refactored components
echo ""
echo "🔧 Test 5: Refactored Components..."
REFACTORED=(
  "src/app/admin/orders/components/AssignOperator.tsx"
  "src/app/admin/production/_components/AssignOperator.tsx"
  "src/app/admin/production/_components/JobModal.tsx"
  "src/app/(public)/produse/CatalogClient.tsx"
  "src/components/public/navigation/CategoriesMegaMenu.tsx"
  "src/components/public/navigation/MobileCategoriesMenu.tsx"
  "src/hooks/useCategories.ts"
)

ALL_OK=true
for file in "${REFACTORED[@]}"; do
  if grep -q "from '@/lib/api'" "$file" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $file uses API client"
  else
    echo -e "  ${RED}✗${NC} $file missing API client import"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = false ]; then
  exit 1
fi

# Test 6: Verify exports
echo ""
echo "📤 Test 6: API Exports..."
EXPORTS=$(grep -c "^export " src/lib/api/endpoints.ts)
if [ "$EXPORTS" -ge 30 ]; then
  echo -e "  ${GREEN}✓${NC} Found $EXPORTS exported functions"
else
  echo -e "  ${RED}✗${NC} Too few exports ($EXPORTS < 30)"
  exit 1
fi

# Summary
echo ""
echo "================================================"
echo -e "  ${GREEN}✓ ALL TESTS PASSED${NC}"
echo "================================================"
echo ""
echo "📊 Summary:"
echo "  • Total files with fetch: $TOTAL_FILES"
echo "  • Duplicate endpoint calls: $DUPLICATES (target: < 40)"
echo "  • API functions exported: $EXPORTS (target: >= 30)"
echo "  • Components refactored: 7"
echo "  • TypeScript errors: 0"
echo ""
echo "✅ G2.3 — API Endpoint Optimization VALIDATED"
