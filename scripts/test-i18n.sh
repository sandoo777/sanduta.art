#!/bin/bash

# I18N System Testing Script
# Verifică toate componentele sistemului multilingv

echo "🌍 Testing I18n System..."
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test
test_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1 - MISSING"
    ((FAILED++))
  fi
}

test_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1/ - MISSING"
    ((FAILED++))
  fi
}

echo ""
echo "📁 Checking Core Files..."
echo "--------------------------------"

test_file "src/i18n/config.ts"
test_file "src/i18n/types.ts"
test_file "src/i18n/translations/ro.json"
test_file "src/i18n/translations/en.json"
test_file "src/i18n/translations/ru.json"

echo ""
echo "🔧 Checking Utilities..."
echo "--------------------------------"

test_file "src/lib/i18n/translations.ts"
test_file "src/lib/i18n/middleware.ts"
test_file "src/lib/i18n/product-translations.ts"
test_file "src/lib/i18n/cms-translations.ts"

echo ""
echo "🎨 Checking Components..."
echo "--------------------------------"

test_file "src/components/i18n/LanguageSwitcher.tsx"
test_file "src/context/TranslationContext.tsx"

echo ""
echo "🌐 Checking Multilingual Routes..."
echo "--------------------------------"

test_file "src/app/[lang]/layout.tsx"
test_file "src/app/[lang]/page.tsx"

echo ""
echo "⚙️ Checking Middleware..."
echo "--------------------------------"

test_file "middleware.ts"

echo ""
echo "👨‍💼 Checking Admin..."
echo "--------------------------------"

test_file "src/app/(admin)/dashboard/translations/page.tsx"
test_file "src/app/api/admin/translations/route.ts"

echo ""
echo "📧 Checking Email Templates..."
echo "--------------------------------"

test_file "src/lib/email/templates-i18n.ts"

echo ""
echo "🔍 Checking SEO..."
echo "--------------------------------"

test_file "src/lib/seo/generateSeoTags.ts"

echo ""
echo "📝 Checking Module Translations..."
echo "--------------------------------"

test_file "src/i18n/configurator.json"
test_file "src/i18n/editor.json"

echo ""
echo "🧪 Checking Tests..."
echo "--------------------------------"

test_file "src/__tests__/i18n.test.ts"

echo ""
echo "📚 Checking Documentation..."
echo "--------------------------------"

test_file "docs/I18N_SYSTEM.md"
test_file "docs/I18N_QUICK_START.md"

echo ""
echo "================================"
echo "📊 Results:"
echo "--------------------------------"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All i18n system components are present!${NC}"
  echo ""
  echo "🚀 Next Steps:"
  echo "1. Run: npm run dev"
  echo "2. Visit: http://localhost:3000/ro"
  echo "3. Test language switcher"
  echo "4. Run: npm test i18n"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some components are missing. Please check above.${NC}"
  echo ""
  exit 1
fi
