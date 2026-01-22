#!/bin/bash

# Task E1 - Faza 1: Ștergere în Siguranță
# Autor: GitHub Copilot
# Data: 22 ianuarie 2026

echo "🗑️  Task E1 - Faza 1: Ștergere Componente Duplicate (SAFE)"
echo "============================================================"
echo ""

# Verifică dacă suntem în directorul corect
if [ ! -d "src" ]; then
  echo "❌ Eroare: Nu suntem în rădăcina proiectului"
  exit 1
fi

# Creează backup branch
echo "📦 Creez branch pentru modificări..."
git checkout -b task-e1-remove-duplicates 2>/dev/null || echo "Branch deja există"

# Counter pentru fișiere șterse
deleted=0
skipped=0

# Funcție pentru ștergere sigură
safe_delete() {
  local file="$1"
  if [ -f "$file" ]; then
    echo "  ✅ Șterge: $file"
    rm "$file"
    ((deleted++))
  else
    echo "  ⚠️  Skip (nu există): $file"
    ((skipped++))
  fi
}

# 1. KpiCard duplicates
echo ""
echo "📊 [1/7] Șterge KpiCard duplicates..."
safe_delete "src/app/manager/dashboard/_components/KpiCard.tsx"
safe_delete "src/app/admin/dashboard/_components/KpiCard.tsx"

# 2. OrderTimeline duplicates (3 fișiere)
echo ""
echo "⏱️  [2/7] Șterge OrderTimeline duplicates (3 fișiere)..."
safe_delete "src/components/account/orders/OrderTimeline.tsx"
safe_delete "src/components/orders/OrderTimeline.tsx"
safe_delete "src/app/admin/orders/components/OrderTimeline.tsx"

# 3. OrderFiles duplicates (2 fișiere)
echo ""
echo "📎 [3/7] Șterge OrderFiles duplicates (2 fișiere)..."
safe_delete "src/components/account/orders/OrderFiles.tsx"
safe_delete "src/components/orders/OrderFiles.tsx"

# 4. OrderProducts
echo ""
echo "🛒 [4/7] Șterge OrderProducts duplicate..."
safe_delete "src/components/account/orders/OrderProducts.tsx"

# 5. Alte componente Orders (5 fișiere)
echo ""
echo "📦 [5/7] Șterge alte componente Orders (5 fișiere)..."
safe_delete "src/components/account/orders/OrderAddress.tsx"
safe_delete "src/components/account/orders/OrderStatusBar.tsx"
safe_delete "src/components/account/orders/OrderPayment.tsx"
safe_delete "src/components/account/orders/OrderDelivery.tsx"
safe_delete "src/components/account/orders/OrderHistory.tsx"

# 6. LanguageSwitcher
echo ""
echo "🌐 [6/7] Șterge LanguageSwitcher duplicate..."
safe_delete "src/components/common/LanguageSwitcher.tsx"

# 7. OrdersList
echo ""
echo "📋 [7/7] Șterge OrdersList duplicate..."
safe_delete "src/app/admin/orders/OrdersList.tsx"

# Curăță directoare goale
echo ""
echo "🧹 Curăță directoare goale..."
rmdir src/components/account/orders/ 2>/dev/null && echo "  ✅ Șters: src/components/account/orders/" || echo "  ⚠️  Director nu este gol sau nu există"
rmdir src/components/orders/ 2>/dev/null && echo "  ✅ Șters: src/components/orders/" || echo "  ⚠️  Director nu este gol sau nu există"
rmdir src/app/admin/orders/components/ 2>/dev/null && echo "  ✅ Șters: src/app/admin/orders/components/" || echo "  ⚠️  Director nu este gol sau nu există"

# Statistici
echo ""
echo "============================================================"
echo "📊 Statistici:"
echo "  ✅ Fișiere șterse: $deleted"
echo "  ⚠️  Fișiere skip: $skipped"
echo ""

# Verifică dacă avem modificări
if [ $deleted -gt 0 ]; then
  echo "📝 Creez commit..."
  git add -A
  git commit -m "Task E1 Faza 1: Șterge $deleted componente duplicate (safe deletions)

- Șterge KpiCard duplicates din app/manager și app/admin
- Șterge OrderTimeline duplicates (4 versiuni -> 1)
- Șterge OrderFiles duplicates (3 versiuni -> 1)
- Șterge toate duplicatele din src/components/account/orders/
- Șterge LanguageSwitcher duplicate din common/
- Șterge OrdersList duplicate din app/admin/orders/

Total: $deleted fișiere șterse

Toate componentele șterse aveau 0 importuri (nefolosite).
Componentele principale rămân în src/components/account/."
  
  echo ""
  echo "✅ Commit creat cu succes!"
  echo ""
  echo "🔍 Pasul următor: Rulează build pentru verificare"
  echo "   npm run build"
  echo ""
  echo "📌 Dacă build-ul trece, continuă cu Faza 2:"
  echo "   vezi RAPORT_E1_FINAL_DUPLICATE_COMPONENTS.md"
else
  echo "⚠️  Nu s-au șters fișiere - posibil să fi fost deja șterse"
fi

echo ""
echo "============================================================"
echo "✅ Faza 1 completă!"
