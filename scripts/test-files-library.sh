#!/bin/bash

# Quick verification script for the Saved Files library experience

set -euo pipefail

FILES=(
  "src/modules/account/useSavedFilesLibrary.ts"
  "src/components/account/files/SavedFilesDashboard.tsx"
  "src/components/account/files/SavedFileCard.tsx"
  "src/components/account/files/FileVersionsModal.tsx"
  "src/components/account/files/DeleteFileModal.tsx"
  "src/components/account/files/ReuseFileModal.tsx"
  "src/app/(account)/dashboard/files/page.tsx"
  "src/components/public/configurator/SavedFilesPickerModal.tsx"
  "src/components/public/configurator/Step2UploadDesign.tsx"
  "src/__tests__/saved-files-library.test.ts"
)

printf '\n🧪 Saved Files Library Checklist\n'
printf '========================================\n'

missing=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    printf '✅ %s\n' "$file"
  else
    printf '❌ %s (lipsește)\n' "$file"
    missing=1
  fi
done

printf '\n⚙️  Rulez testele unitare dedicate...\n'
npm run test -- saved-files-library.test.ts

printf '\n========================================\n'
if [ "$missing" -eq 0 ]; then
  printf '✅ Biblioteca de fișiere este completă și testele au fost rulate.\n'
else
  printf '⚠️  Unele fișiere lipsesc — verifică ieșirea de mai sus.\n'
fi
