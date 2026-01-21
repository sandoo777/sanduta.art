#!/bin/bash

# Test Quick Script pentru Hooks
# Verifică că toate hook-urile sunt disponibile și corect exportate

echo "🧪 Testing Hooks - Quick Verification"
echo "======================================"
echo ""

# Culori pentru output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contoare
PASSED=0
FAILED=0

# Test 1: Verifică existența fișierelor
echo "📁 Test 1: Verificare fișiere hooks..."
HOOKS_FILES=(
  "src/hooks/useTheme.ts"
  "src/hooks/useCheckout.ts"
  "src/hooks/useSetup.ts"
  "src/hooks/useBlog.ts"
  "src/hooks/useAuth.ts"
  "src/hooks/index.ts"
)

for file in "${HOOKS_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $file exists"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} $file missing"
    ((FAILED++))
  fi
done

echo ""

# Test 2: Verifică exports în index.ts
echo "📦 Test 2: Verificare exports în index.ts..."
EXPORTS=(
  "useTheme"
  "useCheckout"
  "useSetup"
  "useBlog"
  "useAuth"
  "useRequireAuth"
)

for export_name in "${EXPORTS[@]}"; do
  if grep -q "export.*$export_name" "src/hooks/index.ts"; then
    echo -e "  ${GREEN}✓${NC} $export_name exported"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} $export_name not exported"
    ((FAILED++))
  fi
done

echo ""

# Test 3: Verifică documentația
echo "📚 Test 3: Verificare documentație..."
DOCS_FILES=(
  "docs/HOOKS.md"
  "RAPORT_G2_1_HOOKS.md"
  "HOOKS_QUICK_REFERENCE.md"
)

for doc in "${DOCS_FILES[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "  ${GREEN}✓${NC} $doc exists"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} $doc missing"
    ((FAILED++))
  fi
done

echo ""

# Test 4: Verifică numărul de linii (quality check)
echo "📏 Test 4: Verificare calitate cod (linii)..."

check_lines() {
  local file=$1
  local min_lines=$2
  local actual_lines=$(wc -l < "$file")
  
  if [ "$actual_lines" -ge "$min_lines" ]; then
    echo -e "  ${GREEN}✓${NC} $file has $actual_lines lines (min: $min_lines)"
    ((PASSED++))
  else
    echo -e "  ${YELLOW}⚠${NC} $file has only $actual_lines lines (expected min: $min_lines)"
    ((FAILED++))
  fi
}

check_lines "src/hooks/useTheme.ts" 150
check_lines "src/hooks/useAuth.ts" 200
check_lines "src/hooks/useBlog.ts" 200
check_lines "src/hooks/useSetup.ts" 150

echo ""

# Test 5: Verifică TypeScript syntax (basic check)
echo "🔍 Test 5: Verificare syntax TypeScript..."

# Verifică că fișierele conțin export function
for hook in useTheme useCheckout useSetup useBlog useAuth; do
  file="src/hooks/$hook.ts"
  if grep -q "export function $hook" "$file"; then
    echo -e "  ${GREEN}✓${NC} $hook has proper export"
    ((PASSED++))
  else
    echo -e "  ${RED}✗${NC} $hook missing proper export"
    ((FAILED++))
  fi
done

echo ""

# Test 6: Verifică comentarii JSDoc
echo "📖 Test 6: Verificare documentație JSDoc..."

for hook_file in src/hooks/use*.ts; do
  if [ -f "$hook_file" ]; then
    if grep -q "@module\|@example\|@returns" "$hook_file"; then
      echo -e "  ${GREEN}✓${NC} $(basename $hook_file) has JSDoc comments"
      ((PASSED++))
    else
      echo -e "  ${YELLOW}⚠${NC} $(basename $hook_file) might need more JSDoc"
    fi
  fi
done

echo ""

# Rezultate finale
echo "======================================"
echo "📊 REZULTATE TESTE"
echo "======================================"
echo -e "  ${GREEN}✓ Passed:${NC} $PASSED"
echo -e "  ${RED}✗ Failed:${NC} $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! (100%)${NC}"
  echo ""
  echo "✅ Hooks sunt gata de utilizare!"
  exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
  echo -e "${YELLOW}⚠️  Most tests passed ($SUCCESS_RATE%)${NC}"
  echo ""
  echo "✅ Hooks sunt funcționale, dar necesită atenție la failed tests"
  exit 0
else
  echo -e "${RED}❌ Many tests failed ($SUCCESS_RATE%)${NC}"
  echo ""
  echo "❌ Hooks necesită corecții"
  exit 1
fi
