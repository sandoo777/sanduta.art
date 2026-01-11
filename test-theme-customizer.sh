#!/bin/bash

# Theme Customizer - Test Script
# Verifică toate componentele sistemului

echo "🎨 Theme Customizer - Verification Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
passed=0
failed=0

# Check function
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((passed++))
  else
    echo -e "${RED}✗${NC} $1 - MISSING"
    ((failed++))
  fi
}

echo "📁 Checking Files..."
echo ""

# Types
echo "1. Types & Configuration:"
check_file "src/types/theme.ts"
echo ""

# Components
echo "2. Theme Components:"
check_file "src/components/theme/BrandingSettings.tsx"
check_file "src/components/theme/ColorSettings.tsx"
check_file "src/components/theme/TypographySettings.tsx"
check_file "src/components/theme/LayoutSettings.tsx"
check_file "src/components/theme/ComponentsCustomization.tsx"
check_file "src/components/theme/HomepageBuilder.tsx"
check_file "src/components/theme/ThemePreview.tsx"
echo ""

# API Routes
echo "3. API Routes:"
check_file "src/app/api/admin/theme/route.ts"
check_file "src/app/api/admin/theme/versions/route.ts"
echo ""

# Frontend Integration
echo "4. Frontend Integration:"
check_file "src/lib/theme/applyTheme.ts"
echo ""

# Main Page
echo "5. Main Page:"
check_file "src/app/admin/theme/page.tsx"
echo ""

# Documentation
echo "6. Documentation:"
check_file "docs/THEME_CUSTOMIZER_SYSTEM.md"
check_file "docs/THEME_CUSTOMIZER_QUICK_START.md"
check_file "RAPORT_THEME_CUSTOMIZER_FINAL.md"
echo ""

# TypeScript Check
echo "7. TypeScript Compilation:"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} TypeScript compilation successful"
  ((passed++))
else
  echo -e "${RED}✗${NC} TypeScript compilation failed"
  ((failed++))
fi
echo ""

# Dependencies
echo "8. Dependencies:"
if npm list @dnd-kit/core > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} @dnd-kit/core installed"
  ((passed++))
else
  echo -e "${RED}✗${NC} @dnd-kit/core missing"
  ((failed++))
fi

if npm list @dnd-kit/sortable > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} @dnd-kit/sortable installed"
  ((passed++))
else
  echo -e "${RED}✗${NC} @dnd-kit/sortable missing"
  ((failed++))
fi

if npm list @dnd-kit/utilities > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} @dnd-kit/utilities installed"
  ((passed++))
else
  echo -e "${RED}✗${NC} @dnd-kit/utilities missing"
  ((failed++))
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Summary:"
echo -e "${GREEN}Passed:${NC} $passed"
echo -e "${RED}Failed:${NC} $failed"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "🚀 Next steps:"
  echo "  1. npm run dev"
  echo "  2. Navigate to http://localhost:3000/admin/theme"
  echo "  3. Login with admin@sanduta.art / admin123"
  echo "  4. Test all tabs: Branding, Colors, Typography, Layout, Components, Homepage, Preview"
  echo "  5. Save Draft → Publish"
  echo "  6. Check homepage (/) for applied theme"
  exit 0
else
  echo -e "${RED}❌ Some checks failed!${NC}"
  echo ""
  echo "Please fix the issues above and run the script again."
  exit 1
fi
