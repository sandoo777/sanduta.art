#!/bin/bash

# Task E1 - Faza 2: Refactorizare Pagination
# Autor: GitHub Copilot
# Data: 22 ianuarie 2026

echo "🔄 Task E1 - Faza 2: Refactorizare Pagination"
echo "=============================================="
echo ""

# Verifică dacă suntem în directorul corect
if [ ! -d "src" ]; then
  echo "❌ Eroare: Nu suntem în rădăcina proiectului"
  exit 1
fi

# Verifică dacă componenta există
if [ ! -f "src/components/public/catalog/Pagination.tsx" ]; then
  echo "⚠️  Pagination duplicate nu există - posibil deja șters"
  exit 0
fi

# 1. Găsește toate importurile
echo "🔍 Caut importuri pentru Pagination din catalog..."
echo ""

imports=$(grep -rn "from.*public/catalog/Pagination" src/ --include="*.tsx" --include="*.ts")

if [ -z "$imports" ]; then
  echo "✅ Nu există importuri - component safe to delete"
  rm src/components/public/catalog/Pagination.tsx
  echo "  ✅ Șters: src/components/public/catalog/Pagination.tsx"
  
  git add src/components/public/catalog/Pagination.tsx
  git commit -m "Task E1 Faza 2: Șterge Pagination duplicate (nefolosit)

Componenta src/components/public/catalog/Pagination.tsx nu era folosită.
Componenta standard rămâne în src/components/ui/Pagination.tsx."
  
  echo ""
  echo "✅ Faza 2 completă!"
  exit 0
fi

# 2. Afișează importurile găsite
echo "📋 Importuri găsite:"
echo "$imports"
echo ""

# 3. Întreabă pentru confirmare
read -p "Vrei să refactorizezi automat aceste importuri? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Anulat de utilizator"
  echo ""
  echo "📝 Pentru refactorizare manuală:"
  echo "   1. Deschide fiecare fișier de mai sus"
  echo "   2. Înlocuiește import-ul cu:"
  echo "      import { Pagination } from '@/components/ui/Pagination'"
  echo "   3. Șterge src/components/public/catalog/Pagination.tsx"
  exit 0
fi

# 4. Refactorizează automat
echo ""
echo "🔄 Refactorizez importuri..."

# Găsește fișierele unice
files=$(echo "$imports" | cut -d: -f1 | sort -u)

for file in $files; do
  echo "  📝 Procesez: $file"
  
  # Backup
  cp "$file" "$file.bak"
  
  # Înlocuiește importul
  # Din: from '@/components/public/catalog/Pagination'
  # În:  from '@/components/ui/Pagination'
  sed -i "s|from ['\"]\@\?/\?components/public/catalog/Pagination['\"]|from '@/components/ui/Pagination'|g" "$file"
  
  # Verifică dacă s-a schimbat ceva
  if diff -q "$file" "$file.bak" > /dev/null; then
    echo "    ⚠️  Nicio schimbare - verifică manual"
    mv "$file.bak" "$file"  # Restore
  else
    echo "    ✅ Refactorizat cu succes"
    rm "$file.bak"
  fi
done

# 5. Șterge duplicatul
echo ""
echo "🗑️  Șterge componenta duplicată..."
rm src/components/public/catalog/Pagination.tsx
echo "  ✅ Șters: src/components/public/catalog/Pagination.tsx"

# 6. Commit
echo ""
echo "📝 Creez commit..."
git add -A
git commit -m "Task E1 Faza 2: Refactorizează Pagination la versiunea UI

- Înlocuit import din '@/components/public/catalog/Pagination'
- Cu import din '@/components/ui/Pagination'
- Șters componenta duplicată

Fișiere afectate:
$(echo "$files" | sed 's/^/- /')"

echo ""
echo "✅ Faza 2 completă!"
echo ""
echo "🔍 Pasul următor: Rulează build pentru verificare"
echo "   npm run build"
echo ""
echo "📌 Dacă build-ul trece, continuă cu Faza 3:"
echo "   vezi RAPORT_E1_FINAL_DUPLICATE_COMPONENTS.md"
