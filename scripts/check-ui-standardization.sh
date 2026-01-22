#!/bin/bash

# Script pentru verificare progres standardizare UI componente
# Usage: ./scripts/check-ui-standardization.sh

echo "🔍 Verificare Standardizare UI - Frontend Public"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_custom_buttons=0
total_custom_cards=0
total_custom_inputs=0
standardized_buttons=0
standardized_cards=0
standardized_inputs=0

echo "📊 Analiza fișierelor..."
echo ""

# Function to check file
check_file() {
  local file=$1
  local name=$(basename $file)
  
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    return
  fi
  
  # Count custom buttons (className=".*bg-.*hover:bg-.*")
  custom_btns=$(grep -c 'className=".*bg-.*hover:bg-' "$file" 2>/dev/null || echo 0)
  
  # Count Button imports
  has_button_import=$(grep -c "from '@/components/ui'" "$file" 2>/dev/null || echo 0)
  
  # Count custom cards (className=".*bg-white.*rounded.*shadow)
  custom_cards=$(grep -c 'className=".*bg-white.*rounded.*shadow' "$file" 2>/dev/null || echo 0)
  
  # Count custom inputs
  custom_inputs=$(grep -c '<input.*className=' "$file" 2>/dev/null || echo 0)
  
  if [ $custom_btns -gt 0 ] || [ $custom_cards -gt 0 ] || [ $custom_inputs -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $name${NC}"
    [ $custom_btns -gt 0 ] && echo "   - Custom buttons: $custom_btns"
    [ $custom_cards -gt 0 ] && echo "   - Custom cards: $custom_cards"
    [ $custom_inputs -gt 0 ] && echo "   - Custom inputs: $custom_inputs"
    [ $has_button_import -gt 0 ] && echo -e "   - ${GREEN}✓${NC} Has UI imports"
    echo ""
  fi
  
  total_custom_buttons=$((total_custom_buttons + custom_btns))
  total_custom_cards=$((total_custom_cards + custom_cards))
  total_custom_inputs=$((total_custom_inputs + custom_inputs))
}

echo "🏠 HOME Components"
echo "-------------------"
check_file "src/components/public/home/Hero.tsx"
check_file "src/components/public/home/PopularProducts.tsx"
check_file "src/components/public/home/FeaturedCategories.tsx"
check_file "src/components/public/home/WhyChooseUs.tsx"
check_file "src/components/public/home/Testimonials.tsx"
check_file "src/components/public/home/FinalCTA.tsx"

echo ""
echo "🛒 CART Components"
echo "-------------------"
check_file "src/components/public/cart/CartList.tsx"
check_file "src/components/public/cart/CartItem.tsx"
check_file "src/components/public/cart/CartSummary.tsx"

echo ""
echo "💳 CHECKOUT Components"
echo "----------------------"
check_file "src/app/(public)/checkout/page.tsx"

echo ""
echo "📦 CATALOG Components"
echo "---------------------"
check_file "src/components/public/catalog/ProductCard.tsx"
check_file "src/components/public/catalog/ProductQuickView.tsx"
check_file "src/components/public/catalog/Filters.tsx"

echo ""
echo "================================================"
echo "📈 REZULTATE FINALE"
echo "================================================"
echo ""
echo -e "${RED}Custom Buttons detectate: $total_custom_buttons${NC}"
echo -e "${RED}Custom Cards detectate: $total_custom_cards${NC}"
echo -e "${RED}Custom Inputs detectate: $total_custom_inputs${NC}"
echo ""

total_custom=$((total_custom_buttons + total_custom_cards + total_custom_inputs))
echo -e "${YELLOW}Total componente custom: $total_custom${NC}"
echo ""

if [ $total_custom -gt 40 ]; then
  echo -e "${RED}❌ CRITIC: Peste 40 componente custom necesită standardizare!${NC}"
  echo ""
  echo "Pași recomandați:"
  echo "1. Consultă RAPORT_G2_3_FRONTEND_PUBLIC_INVENTORY.md"
  echo "2. Începe cu ProductCard (CRITICAL priority)"
  echo "3. Continuă cu Cart components (HIGH priority)"
elif [ $total_custom -gt 20 ]; then
  echo -e "${YELLOW}⚠️  WARNING: Peste 20 componente custom necesită atenție${NC}"
  echo ""
  echo "Progres bun, continuă standardizarea!"
elif [ $total_custom -gt 0 ]; then
  echo -e "${GREEN}✓ Progres bun! Sub 20 componente custom rămase${NC}"
else
  echo -e "${GREEN}🎉 EXCELENT! Toate componentele sunt standardizate!${NC}"
fi

echo ""
echo "Pentru detalii complete, vezi:"
echo "  - RAPORT_G2_3_FRONTEND_PUBLIC_INVENTORY.json"
echo "  - RAPORT_G2_3_FRONTEND_PUBLIC_INVENTORY.md"
echo ""
