#!/bin/bash

# Script de testare pentru biblioteca de template-uri
echo "🧪 Testare Biblioteca de Template-uri - Editor Design"
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

test_case "templateList.ts exists" "[ -f 'src/modules/editor/templates/templateList.ts' ]"
test_case "TemplateCard.tsx exists" "[ -f 'src/components/public/editor/templates/TemplateCard.tsx' ]"
test_case "TemplatePreviewModal.tsx exists" "[ -f 'src/components/public/editor/templates/TemplatePreviewModal.tsx' ]"
test_case "TemplateLibrary.tsx exists" "[ -f 'src/components/public/editor/templates/TemplateLibrary.tsx' ]"

echo ""
echo "🔍 2. Verificare Conținut templateList.ts"
echo "-----------------------------------"

test_case "Template interface defined" "grep -q 'export interface Template' src/modules/editor/templates/templateList.ts"
test_case "TemplateCategory type defined" "grep -q 'export type TemplateCategory' src/modules/editor/templates/templateList.ts"
test_case "templates array exported" "grep -q 'export const templates' src/modules/editor/templates/templateList.ts"
test_case "filterTemplates function exists" "grep -q 'export const filterTemplates' src/modules/editor/templates/templateList.ts"
test_case "categories array exported" "grep -q 'export const categories' src/modules/editor/templates/templateList.ts"
test_case "styles array exported" "grep -q 'export const styles' src/modules/editor/templates/templateList.ts"
test_case "At least 6 templates defined" "[ $(grep -c 'id:.*flyer\|card\|poster\|social\|banner' src/modules/editor/templates/templateList.ts) -ge 6 ]"

echo ""
echo "🎨 3. Verificare TemplateCard Component"
echo "-----------------------------------"

test_case "TemplateCard imports Template" "grep -q \"import.*Template.*from.*templateList\" src/components/public/editor/templates/TemplateCard.tsx"
test_case "TemplateCard has TemplateCardProps" "grep -q 'interface TemplateCardProps' src/components/public/editor/templates/TemplateCard.tsx"
test_case "TemplateCard displays template name" "grep -q 'template.name' src/components/public/editor/templates/TemplateCard.tsx"
test_case "TemplateCard shows category badge" "grep -q 'template.category' src/components/public/editor/templates/TemplateCard.tsx"
test_case "TemplateCard has hover effect" "grep -q 'group-hover' src/components/public/editor/templates/TemplateCard.tsx"
test_case "TemplateCard has onPreview callback" "grep -q 'onPreview' src/components/public/editor/templates/TemplateCard.tsx"

echo ""
echo "🔎 4. Verificare TemplatePreviewModal Component"
echo "-----------------------------------"

test_case "TemplatePreviewModal imports Template" "grep -q \"import.*Template.*from.*templateList\" src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplatePreviewModal has props interface" "grep -q 'interface TemplatePreviewModalProps' src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplatePreviewModal shows template description" "grep -q 'template.description' src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplatePreviewModal shows canvas size" "grep -q 'template.canvasSize' src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplatePreviewModal shows dominant colors" "grep -q 'template.dominantColors' src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplatePreviewModal has 'Use Template' button" "grep -q 'Folosește.*template\|onUseTemplate' src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplatePreviewModal has close button" "grep -q 'onClose' src/components/public/editor/templates/TemplatePreviewModal.tsx"

echo ""
echo "📚 5. Verificare TemplateLibrary Component"
echo "-----------------------------------"

test_case "TemplateLibrary imports filterTemplates" "grep -q 'filterTemplates' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary imports TemplateCard" "grep -q \"import.*TemplateCard\" src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary imports TemplatePreviewModal" "grep -q \"import.*TemplatePreviewModal\" src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplateLibrary has search input" "grep -q 'searchQuery\|MagnifyingGlassIcon' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary has category filters" "grep -q 'selectedCategory' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary has style filters" "grep -q 'selectedStyle' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary uses useMemo for filtering" "grep -q 'useMemo' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary renders TemplateCard in grid" "grep -q 'grid.*TemplateCard' src/components/public/editor/templates/TemplateLibrary.tsx"

echo ""
echo "⚙️  6. Verificare editorStore Updates"
echo "-----------------------------------"

test_case "editorStore imports Template" "grep -q \"import.*Template.*from.*templates\" src/modules/editor/editorStore.ts"
test_case "editorStore has loadTemplate function" "grep -q 'loadTemplate.*Template' src/modules/editor/editorStore.ts"
test_case "loadTemplate sets elements" "grep -q 'elements:.*template.elements' src/modules/editor/editorStore.ts"
test_case "loadTemplate sets canvasSize" "grep -q 'canvasSize:.*template.canvasSize' src/modules/editor/editorStore.ts"
test_case "loadTemplate has confirmation" "grep -q 'confirm' src/modules/editor/editorStore.ts"
test_case "loadTemplate adjusts zoom" "grep -q 'zoom.*=\|set.*zoom' src/modules/editor/editorStore.ts"
test_case "loadTemplate saves to history" "grep -q 'saveToHistory' src/modules/editor/editorStore.ts"

echo ""
echo "🔗 7. Verificare EditorSidebarLeft Integration"
echo "-----------------------------------"

test_case "EditorSidebarLeft imports TemplateLibrary" "grep -q \"import.*TemplateLibrary\" src/components/public/editor/EditorSidebarLeft.tsx"
test_case "EditorSidebarLeft has showTemplateLibrary state" "grep -q 'showTemplateLibrary' src/components/public/editor/EditorSidebarLeft.tsx"
test_case "EditorSidebarLeft imports loadTemplate" "grep -q 'loadTemplate' src/components/public/editor/EditorSidebarLeft.tsx"
test_case "Templates tool opens library" "grep -q \"templates.*setShowTemplateLibrary\" src/components/public/editor/EditorSidebarLeft.tsx"
test_case "TemplateLibrary renders conditionally" "grep -q 'showTemplateLibrary.*&&.*TemplateLibrary' src/components/public/editor/EditorSidebarLeft.tsx"
test_case "TemplateLibrary has onSelectTemplate" "grep -q 'onSelectTemplate.*loadTemplate' src/components/public/editor/EditorSidebarLeft.tsx"

echo ""
echo "🎯 8. Verificare TypeScript Types"
echo "-----------------------------------"

test_case "Template has id field" "grep -q 'id:.*string' src/modules/editor/templates/templateList.ts"
test_case "Template has name field" "grep -q 'name:.*string' src/modules/editor/templates/templateList.ts"
test_case "Template has category field" "grep -q 'category:.*TemplateCategory' src/modules/editor/templates/templateList.ts"
test_case "Template has canvasSize field" "grep -q 'canvasSize:.*{.*width.*height.*}' src/modules/editor/templates/templateList.ts"
test_case "Template has elements array" "grep -q 'elements:.*EditorElement' src/modules/editor/templates/templateList.ts"
test_case "Template has dominantColors" "grep -q 'dominantColors:.*string' src/modules/editor/templates/templateList.ts"

echo ""
echo "📦 9. Verificare Template Data"
echo "-----------------------------------"

test_case "Flyer template exists" "grep -q \"id:.*'flyer\" src/modules/editor/templates/templateList.ts"
test_case "Business card template exists" "grep -q \"id:.*'business-card\|card\" src/modules/editor/templates/templateList.ts"
test_case "Poster template exists" "grep -q \"id:.*'poster\" src/modules/editor/templates/templateList.ts"
test_case "Social media template exists" "grep -q \"id:.*'social\" src/modules/editor/templates/templateList.ts"
test_case "Banner template exists" "grep -q \"id:.*'banner\" src/modules/editor/templates/templateList.ts"
test_case "Templates have Romanian text" "grep -q 'EVENIMENT\|Data:\|Ianuarie' src/modules/editor/templates/templateList.ts"

echo ""
echo "🎨 10. Verificare UI/UX Features"
echo "-----------------------------------"

test_case "TemplateCard has hover scale effect" "grep -q 'hover:scale\|group-hover:scale' src/components/public/editor/templates/TemplateCard.tsx"
test_case "TemplatePreviewModal has fade animation" "grep -q 'animate-fade\|animation.*fade' src/components/public/editor/templates/TemplatePreviewModal.tsx"
test_case "TemplateLibrary has results count" "grep -q 'template.*găsite\|găsit' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary has empty state" "grep -q 'Niciun template' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "TemplateLibrary has reset filters button" "grep -q 'Resetează\|reset' src/components/public/editor/templates/TemplateLibrary.tsx"
test_case "Templates tool has icon" "grep -q 'DocumentDuplicateIcon.*templates' src/components/public/editor/EditorSidebarLeft.tsx"

echo ""
echo "=================================================="
echo -e "📊 ${GREEN}Tests Passed: $pass_count${NC}"
echo -e "📊 ${RED}Tests Failed: $fail_count${NC}"
echo -e "📊 Total Tests: $((pass_count + fail_count))"

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
