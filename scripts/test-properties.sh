#!/bin/bash

# Script de testare pentru Properties Panel
echo "🧪 Testare Properties Panel - Editor Design"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# Test function
test_case() {
  local test_name="$1"
  local test_command="$2"
  
  echo -n "Testing: $test_name... "
  
  if eval "$test_command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((pass_count++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((fail_count++))
  fi
}

echo "📋 1. Verificare Structură Fișiere"
echo "-----------------------------------"

test_case "PropertiesPanel.tsx exists" "[ -f 'src/components/public/editor/properties/PropertiesPanel.tsx' ]"
test_case "TextProperties.tsx exists" "[ -f 'src/components/public/editor/properties/TextProperties.tsx' ]"
test_case "ImageProperties.tsx exists" "[ -f 'src/components/public/editor/properties/ImageProperties.tsx' ]"
test_case "ShapeProperties.tsx exists" "[ -f 'src/components/public/editor/properties/ShapeProperties.tsx' ]"

echo ""
echo "🎨 2. Verificare PropertiesPanel"
echo "-----------------------------------"

test_case "PropertiesPanel imports EditorElement" "grep -q 'EditorElement' src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has TextProperties import" "grep -q \"import.*TextProperties\" src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has ImageProperties import" "grep -q \"import.*ImageProperties\" src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has ShapeProperties import" "grep -q \"import.*ShapeProperties\" src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has accordion sections" "grep -q 'expandedSections' src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has empty state" "grep -q 'Selectează un element' src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has general properties" "grep -q 'Poziție\|Position' src/components/public/editor/properties/PropertiesPanel.tsx"
test_case "PropertiesPanel has specific properties" "grep -q 'Proprietăți Text\|Proprietăți Imagine\|Proprietăți Formă' src/components/public/editor/properties/PropertiesPanel.tsx"

echo ""
echo "📝 3. Verificare TextProperties"
echo "-----------------------------------"

test_case "TextProperties has font family" "grep -q 'fontFamily\|Font family' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has font size" "grep -q 'fontSize' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has font weight" "grep -q 'fontWeight' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has color picker" "grep -q 'type=\"color\"' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has preset colors" "grep -q 'PRESET_COLORS' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has text alignment" "grep -q 'textAlign' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has line height" "grep -q 'lineHeight' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has letter spacing" "grep -q 'letterSpacing' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has text transform" "grep -q 'textTransform' src/components/public/editor/properties/TextProperties.tsx"
test_case "TextProperties has background color" "grep -q 'backgroundColor' src/components/public/editor/properties/TextProperties.tsx"

echo ""
echo "🖼️ 4. Verificare ImageProperties"
echo "-----------------------------------"

test_case "ImageProperties has replace button" "grep -q 'Înlocuiește.*magine\|Replace' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has file input" "grep -q 'type=\"file\"' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has brightness filter" "grep -q 'brightness' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has contrast filter" "grep -q 'contrast' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has saturation filter" "grep -q 'saturation' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has blur filter" "grep -q 'blur' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has object fit" "grep -q 'objectFit' src/components/public/editor/properties/ImageProperties.tsx"
test_case "ImageProperties has reset filters button" "grep -q 'Resetează' src/components/public/editor/properties/ImageProperties.tsx"

echo ""
echo "⬜ 5. Verificare ShapeProperties"
echo "-----------------------------------"

test_case "ShapeProperties has shape type selector" "grep -q 'rectangle.*circle.*triangle' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has fill color" "grep -q 'fill' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has stroke/border" "grep -q 'stroke' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has stroke width" "grep -q 'strokeWidth' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has stroke style" "grep -q 'strokeStyle.*solid.*dashed' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has border radius" "grep -q 'borderRadius' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has shadow toggle" "grep -q 'shadow' src/components/public/editor/properties/ShapeProperties.tsx"
test_case "ShapeProperties has shadow offset" "grep -q 'offsetX.*offsetY' src/components/public/editor/properties/ShapeProperties.tsx"

echo ""
echo "⚙️  6. Verificare EditorElement Interface"
echo "-----------------------------------"

test_case "EditorElement has lineHeight" "grep -q 'lineHeight' src/modules/editor/editorStore.ts"
test_case "EditorElement has letterSpacing" "grep -q 'letterSpacing' src/modules/editor/editorStore.ts"
test_case "EditorElement has textTransform" "grep -q 'textTransform' src/modules/editor/editorStore.ts"
test_case "EditorElement has backgroundColor" "grep -q 'backgroundColor' src/modules/editor/editorStore.ts"
test_case "EditorElement has brightness" "grep -q 'brightness' src/modules/editor/editorStore.ts"
test_case "EditorElement has contrast" "grep -q 'contrast' src/modules/editor/editorStore.ts"
test_case "EditorElement has saturation" "grep -q 'saturation' src/modules/editor/editorStore.ts"
test_case "EditorElement has blur" "grep -q 'blur' src/modules/editor/editorStore.ts"
test_case "EditorElement has strokeStyle" "grep -q 'strokeStyle' src/modules/editor/editorStore.ts"
test_case "EditorElement has shadow object" "grep -q 'shadow.*{' src/modules/editor/editorStore.ts"

echo ""
echo "🔗 7. Verificare Integration"
echo "-----------------------------------"

test_case "EditorSidebarRight imports PropertiesPanel" "grep -q \"import.*PropertiesPanel\" src/components/public/editor/EditorSidebarRight.tsx"
test_case "EditorSidebarRight renders PropertiesPanel" "grep -q '<PropertiesPanel' src/components/public/editor/EditorSidebarRight.tsx"
test_case "EditorSidebarRight has properties tab" "grep -q \"activeTab.*===.*'properties'\" src/components/public/editor/EditorSidebarRight.tsx"

echo ""
echo "🎯 8. Verificare UI Controls"
echo "-----------------------------------"

test_case "Has slider inputs (range)" "grep -q 'type=\"range\"' src/components/public/editor/properties/*.tsx"
test_case "Has color pickers" "grep -q 'type=\"color\"' src/components/public/editor/properties/*.tsx"
test_case "Has numeric inputs" "grep -q 'type=\"number\"' src/components/public/editor/properties/*.tsx"
test_case "Has dropdown selects" "grep -q '<select' src/components/public/editor/properties/*.tsx"
test_case "Has checkboxes" "grep -q 'type=\"checkbox\"' src/components/public/editor/properties/*.tsx"
test_case "Has textareas" "grep -q '<textarea' src/components/public/editor/properties/*.tsx"

echo ""
echo "🎨 9. Verificare Branding & Styling"
echo "-----------------------------------"

test_case "Uses primary color #0066FF" "grep -q '#0066FF' src/components/public/editor/properties/*.tsx"
test_case "Uses accent color #FACC15" "grep -q '#FACC15' src/components/public/editor/properties/*.tsx"
test_case "Has focus ring styles" "grep -q 'focus:ring' src/components/public/editor/properties/*.tsx"
test_case "Has rounded corners" "grep -q 'rounded' src/components/public/editor/properties/*.tsx"
test_case "Has transition effects" "grep -q 'transition' src/components/public/editor/properties/*.tsx"

echo ""
echo "📱 10. Verificare Responsive Design"
echo "-----------------------------------"

test_case "Has grid layouts" "grep -q 'grid' src/components/public/editor/properties/*.tsx"
test_case "Has flex layouts" "grep -q 'flex' src/components/public/editor/properties/*.tsx"
test_case "Has responsive classes" "grep -q 'md:\|lg:\|sm:' src/components/public/editor/properties/*.tsx"
test_case "Has overflow handling" "grep -q 'overflow' src/components/public/editor/properties/*.tsx"

echo ""
echo "=================================================="
echo -e "📊 ${GREEN}Tests Passed: $pass_count${NC}"
echo -e "📊 ${RED}Tests Failed: $fail_count${NC}"
echo -e "📊 Total Tests: $((pass_count + fail_count))"

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ Some tests failed${NC}"
  exit 1
fi
