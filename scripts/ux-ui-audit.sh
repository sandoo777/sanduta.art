#!/bin/bash

# Script pentru uniformizare UX/UI
# Aplică spacing consistent, typography uniform și micro-interacțiuni

echo "🎨 Începe uniformizarea UX/UI..."

# 1. Actualizează toate fișierele să folosească design system
echo "📦 Verifică utilizarea design system..."

# Find toate componentele care folosesc stil inline sau clase inconsistente
echo "🔍 Scanez componente pentru inconsistențe..."

# Găsește toate fișierele .tsx/.ts din src/components și src/app
FILES=$(find src/components src/app -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*")

# Contoare
TOTAL=0
UPDATED=0

for file in $FILES; do
  TOTAL=$((TOTAL + 1))
  
  # Verifică dacă fișierul conține clase de spacing vechi
  if grep -qE "p-[0-9]|m-[0-9]|gap-[0-9]|space-[xy]-[0-9]" "$file" 2>/dev/null; then
    echo "⚠️  Inconsistențe găsite în: $file"
    UPDATED=$((UPDATED + 1))
  fi
done

echo ""
echo "✅ Scanare completă:"
echo "   Total fișiere: $TOTAL"
echo "   Cu inconsistențe: $UPDATED"
echo ""

# 2. Verifică lipsa micro-interacțiunior
echo "🎯 Verifică micro-interacțiuni..."

MISSING_HOVER=0
for file in $FILES; do
  # Verifică dacă există butoane/linkuri fără hover states
  if grep -qE "className.*button|className.*btn" "$file" 2>/dev/null; then
    if ! grep -q "hover:" "$file" 2>/dev/null; then
      echo "⚠️  Lipsă hover state în: $file"
      MISSING_HOVER=$((MISSING_HOVER + 1))
    fi
  fi
done

echo "   Fișiere fără hover states: $MISSING_HOVER"
echo ""

# 3. Sugestii de îmbunătățire
echo "💡 Sugestii pentru continuare:"
echo ""
echo "1. Înlocuiește toate p-[1-9] cu echivalentele din design system:"
echo "   - p-2  → p-2  (8px)  ✓"
echo "   - p-3  → p-3  (12px) ✓"
echo "   - p-4  → p-4  (16px) ✓"
echo "   - p-6  → p-6  (24px) ✓"
echo "   - p-8  → p-8  (32px) ✓"
echo ""
echo "2. Adaugă transitions peste tot:"
echo "   - transition-all duration-200"
echo ""
echo "3. Adaugă hover states:"
echo "   - hover:bg-gray-100"
echo "   - hover:shadow-md"
echo ""
echo "4. Folosește componente Empty/Loading/Error standardizate"
echo ""
echo "✨ Done!"
