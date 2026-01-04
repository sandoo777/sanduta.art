#!/bin/bash
# Script de testare pentru sistemul de export

echo "════════════════════════════════════════════════════════════"
echo "  🧪 TESTARE SISTEM EXPORT - Sanduta.Art Editor"
echo "════════════════════════════════════════════════════════════"
echo ""

# Culori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcție test
test_feature() {
    echo -e "${YELLOW}▶${NC} Test: $1"
    if [ "$2" = "OK" ]; then
        echo -e "${GREEN}  ✓ PASS${NC}"
    else
        echo -e "${RED}  ✗ FAIL${NC}"
    fi
    echo ""
}

echo "📦 1. Verificare module export..."
if [ -f "src/modules/editor/export/exportEngine.ts" ]; then
    test_feature "exportEngine.ts exists" "OK"
else
    test_feature "exportEngine.ts exists" "FAIL"
fi

if [ -f "src/modules/editor/export/colorConversion.ts" ]; then
    test_feature "colorConversion.ts exists" "OK"
else
    test_feature "colorConversion.ts exists" "FAIL"
fi

if [ -f "src/modules/editor/export/exportTypes.ts" ]; then
    test_feature "exportTypes.ts exists" "OK"
else
    test_feature "exportTypes.ts exists" "FAIL"
fi

echo "🎨 2. Verificare componente UI..."
if [ -f "src/components/public/editor/export/ExportPanel.tsx" ]; then
    test_feature "ExportPanel.tsx exists" "OK"
else
    test_feature "ExportPanel.tsx exists" "FAIL"
fi

if [ -f "src/components/public/editor/export/ExportPreview.tsx" ]; then
    test_feature "ExportPreview.tsx exists" "OK"
else
    test_feature "ExportPreview.tsx exists" "FAIL"
fi

echo "🔧 3. Verificare integrare..."
if grep -q "ExportPanel" "src/components/public/editor/EditorTopbar.tsx"; then
    test_feature "EditorTopbar integration" "OK"
else
    test_feature "EditorTopbar integration" "FAIL"
fi

if grep -q "data-canvas-container" "src/components/public/editor/EditorCanvas.tsx"; then
    test_feature "Canvas data attribute" "OK"
else
    test_feature "Canvas data attribute" "FAIL"
fi

if grep -q "Toaster" "src/components/public/editor/EditorLayout.tsx"; then
    test_feature "Toast notifications" "OK"
else
    test_feature "Toast notifications" "FAIL"
fi

echo "📚 4. Verificare dependințe..."
if grep -q "jspdf" "package.json"; then
    test_feature "jsPDF installed" "OK"
else
    test_feature "jsPDF installed" "FAIL"
fi

if grep -q "html2canvas" "package.json"; then
    test_feature "html2canvas installed" "OK"
else
    test_feature "html2canvas installed" "FAIL"
fi

if grep -q "react-hot-toast" "package.json"; then
    test_feature "react-hot-toast installed" "OK"
else
    test_feature "react-hot-toast installed" "FAIL"
fi

echo "🔍 5. Verificare funcționalități export..."
echo -e "${YELLOW}▶${NC} Funcții în exportEngine:"

if grep -q "exportPNG" "src/modules/editor/export/exportEngine.ts"; then
    echo -e "${GREEN}  ✓ exportPNG()${NC}"
fi

if grep -q "exportSVG" "src/modules/editor/export/exportEngine.ts"; then
    echo -e "${GREEN}  ✓ exportSVG()${NC}"
fi

if grep -q "exportPDF" "src/modules/editor/export/exportEngine.ts"; then
    echo -e "${GREEN}  ✓ exportPDF()${NC}"
fi

if grep -q "exportPrintReady" "src/modules/editor/export/exportEngine.ts"; then
    echo -e "${GREEN}  ✓ exportPrintReady()${NC}"
fi

if grep -q "validateExport" "src/modules/editor/export/exportEngine.ts"; then
    echo -e "${GREEN}  ✓ validateExport()${NC}"
fi

if grep -q "drawCropMarks" "src/modules/editor/export/exportEngine.ts"; then
    echo -e "${GREEN}  ✓ drawCropMarks()${NC}"
fi

echo ""

echo "🎨 6. Verificare conversie CMYK..."
if grep -q "rgbToCmyk" "src/modules/editor/export/colorConversion.ts"; then
    echo -e "${GREEN}  ✓ rgbToCmyk()${NC}"
fi

if grep -q "hexToCmyk" "src/modules/editor/export/colorConversion.ts"; then
    echo -e "${GREEN}  ✓ hexToCmyk()${NC}"
fi

if grep -q "cmykToRgb" "src/modules/editor/export/colorConversion.ts"; then
    echo -e "${GREEN}  ✓ cmykToRgb()${NC}"
fi

if grep -q "isPrintSafe" "src/modules/editor/export/colorConversion.ts"; then
    echo -e "${GREEN}  ✓ isPrintSafe()${NC}"
fi

if grep -q "makePrintSafe" "src/modules/editor/export/colorConversion.ts"; then
    echo -e "${GREEN}  ✓ makePrintSafe()${NC}"
fi

echo ""

echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ TESTARE COMPLETĂ!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Testare manuală recomandată:"
echo "   1. Deschide editorul: http://localhost:3000/editor/new"
echo "   2. Adaugă elemente (text, forme, imagini)"
echo "   3. Click pe butonul 'Exportă' din topbar"
echo "   4. Testează fiecare format:"
echo "      • PNG - rezoluție 300 DPI"
echo "      • SVG - grafică vectorială"
echo "      • PDF - document standard"
echo "      • Print Ready - cu bleed și crop marks"
echo "   5. Verifică previzualizarea"
echo "   6. Verifică notificările toast"
echo "   7. Testează pe mobil (panel fullscreen)"
echo ""
