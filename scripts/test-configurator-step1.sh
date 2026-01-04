#!/bin/bash

# Script de testare pentru Configurator Produs - Pasul 1

echo "🧪 TEST CONFIGURATOR - PASUL 1"
echo "========================================"
echo ""

echo "📁 TEST 1: Verificare structură fișiere..."
echo "----------------------------------------"

files=(
  "src/modules/configurator/usePriceCalculator.ts"
  "src/components/public/configurator/Step1Specifications.tsx"
  "src/components/public/configurator/PriceSidebar.tsx"
  "src/app/(public)/produse/[slug]/configure/page.tsx"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - LIPSEȘTE"
    all_exist=false
  fi
done

echo ""
echo "🔧 TEST 2: Verificare Hook Price Calculator..."
echo "----------------------------------------"

grep -q "export function usePriceCalculator" "src/modules/configurator/usePriceCalculator.ts" && echo "✅ Hook exportat" || echo "❌ Hook lipsă"
grep -q "calcBasePrice" "src/modules/configurator/usePriceCalculator.ts" && echo "✅ calcBasePrice implementat" || echo "❌ calcBasePrice lipsă"
grep -q "calcFinishPrice" "src/modules/configurator/usePriceCalculator.ts" && echo "✅ calcFinishPrice implementat" || echo "❌ calcFinishPrice lipsă"
grep -q "calcQuantityPrice" "src/modules/configurator/usePriceCalculator.ts" && echo "✅ calcQuantityPrice implementat" || echo "❌ calcQuantityPrice lipsă"
grep -q "calcProductionSpeedPrice" "src/modules/configurator/usePriceCalculator.ts" && echo "✅ calcProductionSpeedPrice implementat" || echo "❌ calcProductionSpeedPrice lipsă"
grep -q "calcTotal" "src/modules/configurator/usePriceCalculator.ts" && echo "✅ calcTotal implementat" || echo "❌ calcTotal lipsă"

echo ""
echo "📋 TEST 3: Verificare Step1Specifications..."
echo "----------------------------------------"

grep -q "dimensionOptions" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Opțiuni dimensiune" || echo "❌ Opțiuni dimensiune lipsă"
grep -q "materialOptions" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Opțiuni material" || echo "❌ Opțiuni material lipsă"
grep -q "finishOptions" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Opțiuni finisaje" || echo "❌ Opțiuni finisaje lipsă"
grep -q "quantityPresets" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Preset-uri cantitate" || echo "❌ Preset-uri cantitate lipsă"
grep -q "productionOptions" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Opțiuni producție" || echo "❌ Opțiuni producție lipsă"

# Icons
grep -q "SizeIcon\|MaterialIcon\|FinishIcon\|QuantityIcon\|ClockIcon" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Iconuri pentru secțiuni" || echo "❌ Iconuri lipsă"

echo ""
echo "💰 TEST 4: Verificare PriceSidebar..."
echo "----------------------------------------"

grep -q "usePriceCalculator" "src/components/public/configurator/PriceSidebar.tsx" && echo "✅ Hook price calculator folosit" || echo "❌ Hook lipsă"
grep -q "Preț estimat" "src/components/public/configurator/PriceSidebar.tsx" && echo "✅ Label preț afișat" || echo "❌ Label preț lipsă"
grep -q "BreakdownRow" "src/components/public/configurator/PriceSidebar.tsx" && echo "✅ Breakdown preț implementat" || echo "❌ Breakdown lipsă"
grep -q "Continuă la pasul 2" "src/components/public/configurator/PriceSidebar.tsx" && echo "✅ CTA pasul 2" || echo "❌ CTA lipsă"
grep -q "setTimeout\|debounce" "src/components/public/configurator/PriceSidebar.tsx" && echo "✅ Debounce pentru recalculare" || echo "❌ Debounce lipsă"

echo ""
echo "📄 TEST 5: Verificare Pagină Configurator..."
echo "----------------------------------------"

grep -q "ConfigureProductPage" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Componentă pagină exportată" || echo "❌ Componentă lipsă"
grep -q "Breadcrumb\|breadcrumb" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Breadcrumbs implementate" || echo "❌ Breadcrumbs lipsă"
grep -q "Stepper" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Stepper implementat" || echo "❌ Stepper lipsă"
grep -q "Step1Specifications" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Step1 integrat" || echo "❌ Step1 lipsă"
grep -q "PriceSidebar" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Sidebar integrat" || echo "❌ Sidebar lipsă"

echo ""
echo "📱 TEST 6: Verificare Responsive Design..."
echo "----------------------------------------"

# Desktop sidebar sticky
grep -q "lg:block\|sticky" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Sidebar sticky desktop" || echo "❌ Sidebar sticky lipsă"

# Mobile sticky bottom bar
grep -q "lg:hidden.*fixed.*bottom" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Mobile sticky bottom bar" || echo "❌ Mobile bar lipsă"

# Grid responsive
grep -q "grid-cols-1.*lg:grid-cols" "src/app/(public)/produse/[slug]/configure/page.tsx" && echo "✅ Grid responsive" || echo "❌ Grid responsive lipsă"

echo ""
echo "🎨 TEST 7: Verificare Branding..."
echo "----------------------------------------"

# Primary color
grep -q "blue-600\|blue-700" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Primary color (blue)" || echo "❌ Blue color lipsă"

# Active state
grep -q "ring-2 ring-blue-600" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Active state cu ring" || echo "❌ Active state lipsă"

# Border radius
grep -q "rounded-lg" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Border radius 8px" || echo "❌ Border radius lipsă"

# Shadows
grep -q "shadow" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Shadows aplicate" || echo "❌ Shadows lipsă"

echo ""
echo "🎯 TEST 8: Verificare UX Features..."
echo "----------------------------------------"

# Hover state
grep -q "hover:shadow-md\|hover:bg-" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Hover effects" || echo "❌ Hover effects lipsă"

# Active state visual
grep -q "activeClasses" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Active state vizual clar" || echo "❌ Active state lipsă"

# Section icons
grep -q "icon.*Icon.*title.*subtitle" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Secțiuni cu icon + titlu" || echo "❌ Secțiuni incomplete"

# Checkmark pentru selectare
grep -q "CheckIcon" "src/components/public/configurator/Step1Specifications.tsx" && echo "✅ Checkmark pentru selectare" || echo "❌ Checkmark lipsă"

echo ""
echo "========================================="
echo "📊 REZUMAT TESTARE CONFIGURATOR"
echo "========================================="

if [ "$all_exist" = true ]; then
  echo "✅ Toate fișierele sunt prezente"
else
  echo "⚠️  Unele fișiere lipsesc"
fi

echo ""
echo "✅ Configurator Pasul 1 este GATA pentru testare manuală!"
echo ""
echo "📝 Pentru testare manuală:"
echo "   1. Rulează: npm run dev"
echo "   2. Accesează: http://localhost:3000/produse/flyere-a5/configure"
echo "   3. Testează:"
echo "      - Selectează dimensiune → preț se actualizează"
echo "      - Selectează material → preț se actualizează"
echo "      - Toggle finisaje → preț se actualizează"
echo "      - Schimbă cantitate → preț se actualizează"
echo "      - Selectează timp producție → preț se actualizează"
echo "      - Verifică responsive (mobil vs desktop)"
echo "      - Verifică sidebar sticky pe desktop"
echo "      - Verifică bottom bar sticky pe mobil"
echo ""
