#!/bin/bash

# Script de verificare rapidă pentru Configurator - Pasul 2 (Upload / Design)

echo "🧪 TEST CONFIGURATOR - PASUL 2"
echo "========================================"

files=(
  "src/modules/configurator/useFileValidation.ts"
  "src/components/public/configurator/FileUpload.tsx"
  "src/components/public/configurator/FilePreview.tsx"
  "src/components/public/configurator/DesignEntry.tsx"
  "src/components/public/configurator/Step2UploadDesign.tsx"
  "src/app/(public)/produse/[slug]/configure/step-2/page.tsx"
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
echo "🔍 Verificare hook validare fișiere..."
grep -q "validateFile" src/modules/configurator/useFileValidation.ts && echo "✅ validateFile prezent" || echo "❌ validateFile lipsă"
grep -q "overallStatus" src/modules/configurator/useFileValidation.ts && echo "✅ overallStatus prezent" || echo "❌ overallStatus lipsă"

echo ""
echo "📂 Verificare FileUpload + Preview..."
grep -q "FileUpload" src/components/public/configurator/FileUpload.tsx && echo "✅ FileUpload component" || echo "❌ FileUpload lipsă"
grep -q "FilePreview" src/components/public/configurator/FilePreview.tsx && echo "✅ FilePreview component" || echo "❌ FilePreview lipsă"

echo ""
echo "🎨 Verificare DesignEntry..."
grep -q "DesignEntry" src/components/public/configurator/DesignEntry.tsx && echo "✅ DesignEntry component" || echo "❌ DesignEntry lipsă"

echo ""
echo "🧭 Verificare Step2UploadDesign..."
grep -q "Step2UploadDesign" src/components/public/configurator/Step2UploadDesign.tsx && echo "✅ Step2UploadDesign component" || echo "❌ Step2UploadDesign lipsă"
grep -q "Continuă la pasul 3" src/components/public/configurator/Step2UploadDesign.tsx && echo "✅ CTA pasul 3" || echo "❌ CTA lipsă"

echo ""
echo "🛰️ Verificare pagină step-2..."
STEP2_PATH="src/app/(public)/produse/[slug]/configure/step-2/page.tsx"
grep -q "Upload / Design" "$STEP2_PATH" && echo "✅ Conținut pasul 2" || echo "❌ Conținut pasul 2 lipsă"
grep -q "Stepper" "$STEP2_PATH" && echo "✅ Stepper prezent" || echo "❌ Stepper lipsă"

echo ""
echo "📊 Verificare PriceSidebar status fișier..."
grep -q "fileStatus" src/components/public/configurator/PriceSidebar.tsx && echo "✅ fileStatus integrat" || echo "❌ fileStatus lipsă"
grep -q "continueLabel" src/components/public/configurator/PriceSidebar.tsx && echo "✅ Prop continueLabel" || echo "❌ Prop continueLabel lipsă"

echo ""
echo "========================================"
if [ "$all_exist" = true ]; then
  echo "✅ Toate fișierele cheie există"
else
  echo "⚠️  Unele fișiere lipsesc"
fi

echo "Done."
