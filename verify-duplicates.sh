#!/bin/bash

echo "🔍 Verificare detaliată a duplicatelor..."
echo ""

# 1. Verifică Pagination
echo "📄 Pagination duplicates:"
echo "  UI: src/components/ui/Pagination.tsx"
grep -r "from.*ui/Pagination" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Public: src/components/public/catalog/Pagination.tsx"
grep -r "from.*public/catalog/Pagination" src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 2. Verifică KpiCard
echo "🏷️  KpiCard duplicates:"
echo "  Root: src/components/KpiCard.tsx"
grep -r "from.*components/KpiCard" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Manager: src/app/manager/dashboard/_components/KpiCard.tsx"
grep -r "from.*manager.*KpiCard" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Admin: src/app/admin/dashboard/_components/KpiCard.tsx"
grep -r "from.*admin.*dashboard.*KpiCard" src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 3. Verifică Footer
echo "🦶 Footer duplicates:"
echo "  Root: src/components/Footer.tsx"
grep -r "from.*components/Footer" src/ --include="*.tsx" --include="*.ts" | grep -v "public/Footer" | wc -l
echo "  Public: src/components/public/Footer.tsx"
grep -r "from.*public/Footer" src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 4. Verifică Header
echo "🎩 Header duplicates:"
echo "  Layout: src/components/layout/Header.tsx"
grep -r "from.*layout/Header" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Public: src/components/public/Header.tsx"
grep -r "from.*public/Header" src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 5. Verifică OrderTimeline (4 duplicate!)
echo "⏱️  OrderTimeline duplicates (MOST duplicates!):"
echo "  Account: src/components/account/OrderTimeline.tsx"
grep -r "from.*account/OrderTimeline" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Account/orders: src/components/account/orders/OrderTimeline.tsx"
grep -r "from.*account/orders/OrderTimeline" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Orders: src/components/orders/OrderTimeline.tsx"
grep -r "from.*components/orders/OrderTimeline" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Admin: src/app/admin/orders/components/OrderTimeline.tsx"
grep -r "from.*admin/orders.*OrderTimeline" src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 6. Verifică SalesChart
echo "📊 SalesChart duplicates:"
echo "  Admin/dashboard: src/components/admin/dashboard/SalesChart.tsx"
grep -r "from.*components/admin/dashboard/SalesChart" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Manager app: src/app/manager/dashboard/_components/SalesChart.tsx"
grep -r "from.*manager.*SalesChart" src/ --include="*.tsx" --include="*.ts" | wc -l
echo "  Admin app: src/app/admin/dashboard/_components/SalesChart.tsx"
grep -r "from.*admin/dashboard/_components/SalesChart" src/ --include="*.tsx" --include="*.ts" | wc -l
echo ""

echo "✅ Verificare completă!"
