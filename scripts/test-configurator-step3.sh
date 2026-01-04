#!/bin/bash

# Script de verificare rapidă pentru Configurator - Pasul 3 (Upsell)

echo "🧪 TEST CONFIGURATOR - PASUL 3"
echo "========================================"

files=(
  "src/modules/configurator/useUpsellEngine.ts"
  "src/components/public/configurator/UpsellQuantity.tsx"
  "src/components/public/configurator/UpsellFinishes.tsx"
  "src/components/public/configurator/CrossSellProducts.tsx"
  "src/components/public/configurator/Step3Upsell.tsx"
  "src/app/(public)/produse/[slug]/configure/step-3/page.tsx"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - lipsă"
    all_exist=false
  fi
done

echo ""
echo "🔍 Verificare hook upsell engine..."
grep -q "getQuantityUpsell" src/modules/configurator/useUpsellEngine.ts && echo "✅ getQuantityUpsell prezent" || echo "❌ getQuantityUpsell lipsă"
grep -q "getFinishUpsell" src/modules/configurator/useUpsellEngine.ts && echo "✅ getFinishUpsell prezent" || echo "❌ getFinishUpsell lipsă"
grep -q "getCrossSellProducts" src/modules/configurator/useUpsellEngine.ts && echo "✅ getCrossSellProducts prezent" || echo "❌ getCrossSellProducts lipsă"

echo ""
echo "📈 Verificare componente upsell..."
grep -q "UpsellQuantity" src/components/public/configurator/UpsellQuantity.tsx && echo "✅ UpsellQuantity" || echo "❌ UpsellQuantity lipsă"
grep -q "UpsellFinishes" src/components/public/configurator/UpsellFinishes.tsx && echo "✅ UpsellFinishes" || echo "❌ UpsellFinishes lipsă"
grep -q "CrossSellProducts" src/components/public/configurator/CrossSellProducts.tsx && echo "✅ CrossSellProducts" || echo "❌ CrossSellProducts lipsă"

echo ""
echo "🧭 Verificare Step3Upsell..."
grep -q "Step3Upsell" src/components/public/configurator/Step3Upsell.tsx && echo "✅ Step3Upsell component" || echo "❌ Step3Upsell lipsă"
grep -q "Continuă la pasul 4" src/components/public/configurator/Step3Upsell.tsx && echo "✅ CTA pasul 4" || echo "❌ CTA lipsă"

echo ""
echo "🛰️ Verificare pagină step-3..."
STEP3_PATH="src/app/(public)/produse/[slug]/configure/step-3/page.tsx"
grep -q "Upsell inteligent" "$STEP3_PATH" && echo "✅ Conținut pasul 3" || echo "❌ Conținut pasul 3 lipsă"
grep -q "Stepper" "$STEP3_PATH" && echo "✅ Stepper prezent" || echo "❌ Stepper lipsă"

echo ""
echo "📊 Verificare PriceSidebar upsells..."
grep -q "upsells" src/components/public/configurator/PriceSidebar.tsx && echo "✅ Upsell list integrat" || echo "❌ Upsell list lipsă"

echo "========================================"
if [ "$all_exist" = true ]; then
  echo "✅ Toate fișierele cheie există"
else
  echo "⚠️  Unele fișiere lipsesc"
fi

echo "Done."
