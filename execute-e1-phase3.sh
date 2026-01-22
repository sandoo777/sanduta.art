#!/bin/bash

# Task E1 - Faza 3: Verificare Manuală Componente
# Autor: GitHub Copilot
# Data: 22 ianuarie 2026

echo "🔍 Task E1 - Faza 3: Verificare Manuală Componente"
echo "===================================================="
echo ""

# Verifică dacă suntem în directorul corect
if [ ! -d "src" ]; then
  echo "❌ Eroare: Nu suntem în rădăcina proiectului"
  exit 1
fi

# Funcție helper pentru verificare
check_component() {
  local name="$1"
  local main="$2"
  local duplicate="$3"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔎 Verificare: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ ! -f "$duplicate" ]; then
    echo "  ✅ Duplicatul nu există - deja șters"
    return
  fi
  
  echo "  📄 Principal: $main"
  echo "  📄 Duplicat:  $duplicate"
  echo ""
  
  # Verifică dacă duplicatul este importat
  local import_pattern=$(basename "$duplicate" .tsx)
  local import_count=$(grep -r "from.*$(dirname "$duplicate" | sed 's|src/||')/$import_pattern" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
  
  echo "  📊 Importuri găsite pentru duplicat: $import_count"
  
  if [ $import_count -eq 0 ]; then
    echo "  ✅ Safe to delete - nu este importat"
    echo ""
    read -p "  ❓ Șterge acum? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      rm "$duplicate"
      echo "  ✅ Șters: $duplicate"
    else
      echo "  ⏭️  Skip"
    fi
  else
    echo "  ⚠️  ATENȚIE: Componenta este folosită!"
    echo ""
    echo "  📋 Locații unde este importată:"
    grep -rn "from.*$(dirname "$duplicate" | sed 's|src/||')/$import_pattern" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -5
    echo ""
    echo "  📝 Acțiune necesară:"
    echo "     1. Verifică diferențele între principal și duplicat"
    echo "     2. Decide care să păstrezi"
    echo "     3. Refactorizează importurile"
    echo ""
    read -p "  ❓ Deschide fișierele pentru comparație? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "  📂 Deschid fișierele..."
      code --diff "$main" "$duplicate" 2>/dev/null || echo "  ⚠️  Nu s-au putut deschide fișierele"
    fi
  fi
}

echo "Această fază verifică componentele care necesită review manual."
echo "Pentru fiecare componentă, vei putea:"
echo "  - Vedea dacă e folosită"
echo "  - Compara cu versiunea principală"
echo "  - Decide dacă să o ștergi"
echo ""
read -p "Continuăm? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Anulat de utilizator"
  exit 0
fi

# 1. Dashboard Components
echo ""
echo "═══════════════════════════════════════════════════"
echo "📊 PARTEA 1: Dashboard Components"
echo "═══════════════════════════════════════════════════"

check_component "SalesChart (Manager)" \
  "src/components/admin/dashboard/SalesChart.tsx" \
  "src/app/manager/dashboard/_components/SalesChart.tsx"

check_component "SalesChart (Admin)" \
  "src/components/admin/dashboard/SalesChart.tsx" \
  "src/app/admin/dashboard/_components/SalesChart.tsx"

check_component "ProductionOverview" \
  "src/components/admin/dashboard/ProductionOverview.tsx" \
  "src/app/manager/dashboard/_components/ProductionOverview.tsx"

check_component "TopProducts" \
  "src/app/manager/dashboard/_components/TopProducts.tsx" \
  "src/app/admin/dashboard/_components/TopProducts.tsx"

# 2. Layout Components
echo ""
echo "═══════════════════════════════════════════════════"
echo "🎨 PARTEA 2: Layout Components"
echo "═══════════════════════════════════════════════════"

check_component "Header" \
  "src/components/layout/Header.tsx" \
  "src/components/public/Header.tsx"

check_component "Footer" \
  "src/components/Footer.tsx" \
  "src/components/public/Footer.tsx"

# 3. Alte Componente
echo ""
echo "═══════════════════════════════════════════════════"
echo "🔧 PARTEA 3: Alte Componente"
echo "═══════════════════════════════════════════════════"

check_component "ProductCard" \
  "src/components/public/catalog/ProductCard.tsx" \
  "src/components/admin/products/ProductCard.tsx"

check_component "AssignOperator" \
  "src/app/admin/orders/components/AssignOperator.tsx" \
  "src/app/admin/production/_components/AssignOperator.tsx"

# Verifică dacă avem modificări
echo ""
echo "═══════════════════════════════════════════════════"
echo "📝 Finalizare"
echo "═══════════════════════════════════════════════════"

if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo "📊 Modificări detectate:"
  git status --short
  echo ""
  read -p "Creez commit pentru modificările făcute? (y/n) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "Task E1 Faza 3: Verificare manuală și curățare componente

Componente verificate și șterse dacă nefolosite:
- Dashboard components (SalesChart, ProductionOverview, TopProducts)
- Layout components (Header, Footer)
- Alte componente (ProductCard, AssignOperator)

Detalii în RAPORT_E1_FINAL_DUPLICATE_COMPONENTS.md"
    
    echo "  ✅ Commit creat cu succes!"
  fi
else
  echo "✅ Nu există modificări"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Faza 3 completă!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🔍 Pasul următor: Build final"
echo "   npm run build"
echo "   npm run lint"
echo ""
echo "📌 Dacă totul trece, task E1 este complet!"
echo "   Vezi RAPORT_E1_FINAL_DUPLICATE_COMPONENTS.md pentru statistici"
