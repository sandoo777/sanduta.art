#!/bin/bash

# Script de testare pentru Reports & Analytics API
# Usage: ./test-reports-api.sh [SESSION_TOKEN]

API_BASE="http://localhost:3000/api/admin/reports"
SESSION_TOKEN="${1:-}"

if [ -z "$SESSION_TOKEN" ]; then
  echo "⚠️  Warning: No session token provided"
  echo "Usage: $0 <session-token>"
  echo ""
  echo "To get your session token:"
  echo "1. Login to http://localhost:3000/login as admin"
  echo "2. Open browser DevTools (F12) → Application → Cookies"
  echo "3. Copy the value of 'next-auth.session-token'"
  echo ""
  read -p "Enter session token: " SESSION_TOKEN
fi

echo "🧪 Testing Reports & Analytics API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local name="$1"
  local endpoint="$2"
  local jq_filter="$3"
  
  echo -e "${BLUE}📊 Testing ${name}...${NC}"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/$endpoint" \
    -H "Cookie: next-auth.session-token=$SESSION_TOKEN")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
    if [ -n "$jq_filter" ]; then
      echo "$BODY" | jq "$jq_filter"
    else
      echo "$BODY" | jq '.'
    fi
  else
    echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
  fi
  
  echo ""
}

# 1. Test Overview
test_endpoint "Overview KPIs" "overview" '{
  totalRevenue,
  totalOrders,
  totalCustomers,
  totalProducts,
  avgOrderValue,
  monthlyRevenue,
  monthlyGrowth
}'

# 2. Test Sales
test_endpoint "Sales Analytics" "sales" '{
  totalRevenue,
  totalOrders,
  salesByMonth: .salesByMonth | length,
  salesByDay: .salesByDay | length,
  salesBySource: .salesBySource,
  salesByStatus: .salesByStatus
}'

# 3. Test Products
test_endpoint "Products Analytics" "products" '{
  totalProducts,
  totalRevenue,
  topSellingProducts: .topSellingProducts[0:3],
  categoriesCount: .productsByCategory | length
}'

# 4. Test Customers
test_endpoint "Customers Analytics" "customers" '{
  totalCustomers,
  topCustomers: .topCustomers[0:3],
  returningCustomers,
  customerLifetimeValue
}'

# 5. Test Operators
test_endpoint "Operators Analytics" "operators" '{
  totalJobs,
  totalCompletedJobs,
  avgCompletionTimeAllOperators,
  operatorJobs: .operatorJobs[0:3]
}'

# 6. Test Materials
test_endpoint "Materials Analytics" "materials" '{
  totalMaterials,
  totalConsumption,
  totalCost,
  topConsumedMaterials: .topConsumedMaterials[0:3],
  lowStockCount: .lowStockMaterials | length
}'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""

# Summary
echo -e "${YELLOW}📝 Test Summary:${NC}"
echo "• Overview: KPIs and growth metrics"
echo "• Sales: Monthly/daily trends, sources, channels"
echo "• Products: Top sellers, categories, performance"
echo "• Customers: Top spenders, CLV, segments"
echo "• Operators: Jobs completed, efficiency"
echo "• Materials: Consumption, costs, low stock"
echo ""
echo "For detailed testing, check individual endpoints:"
echo "curl $API_BASE/overview -H 'Cookie: next-auth.session-token=...' | jq"
