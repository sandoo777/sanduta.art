#!/bin/bash

# Task E1: Analiza componente duplicate
echo "🔍 Analizez componentele din proiect..."

# Verifică dacă directoarele există
if [ ! -d "src" ]; then
  echo "❌ Directorul src/ nu există"
  exit 1
fi

# 1. Găsește toate componentele React
echo ""
echo "📁 Găsesc toate componentele React..."
find src -type f \( -name "*.tsx" -o -name "*.jsx" \) | grep -v ".test." | grep -v ".spec." | sort > /tmp/all-components.txt
total_components=$(wc -l < /tmp/all-components.txt)
echo "✅ Găsite $total_components componente"

# 2. Identifică componente cu același basename
echo ""
echo "🔎 Identific componente cu același nume..."
find src -type f \( -name "*.tsx" -o -name "*.jsx" \) | grep -v ".test." | grep -v ".spec." | sed 's/.*\///' | sort | uniq -c | sort -rn | awk '$1 > 1 {print $2}' > /tmp/duplicate-names.txt

echo "Componente cu același nume găsite:"
cat /tmp/duplicate-names.txt

# 3. Lista componentelor standardizate din ui/
echo ""
echo "📚 Identific componentele standardizate din src/components/ui/..."
if [ -d "src/components/ui" ]; then
  find src/components/ui -type f -name "*.tsx" | sed 's/.*\///' | sed 's/\.tsx$//' | sort > /tmp/ui-components.txt
  echo "Componente UI standardizate:"
  cat /tmp/ui-components.txt
else
  touch /tmp/ui-components.txt
  echo "⚠️  Directorul src/components/ui/ nu există"
fi

# 4. Găsește toate Button-urile
echo ""
echo "🔘 Găsesc toate Button-urile..."
find src -type f -name "*.tsx" | xargs grep -l "export.*Button" | grep -v ".test." | grep -v ".spec."

# 5. Găsește toate Card-urile
echo ""
echo "🃏 Găsesc toate Card-urile..."
find src -type f -name "*.tsx" | xargs grep -l "export.*Card" | grep -v ".test." | grep -v ".spec."

# 6. Găsește toate Input-urile
echo ""
echo "⌨️  Găsesc toate Input-urile..."
find src -type f -name "*.tsx" | xargs grep -l "export.*Input" | grep -v ".test." | grep -v ".spec."

# 7. Găsește toate Modal-urile/Dialog-urile
echo ""
echo "🪟 Găsesc toate Modal/Dialog-urile..."
find src -type f -name "*.tsx" | xargs grep -l "export.*\(Modal\|Dialog\)" | grep -v ".test." | grep -v ".spec."

echo ""
echo "✅ Analiza preliminară completă!"
