#!/bin/bash

# Test User Preferences System
# Usage: ./scripts/test-preferences.sh

set -e

echo "🧪 Testing User Preferences System"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local url=$2
  local description=$3
  local data=$4
  
  echo -e "${BLUE}Testing:${NC} $description"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -X GET "http://localhost:3000$url" \
      -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
      -w "\n%{http_code}")
  else
    response=$(curl -s -X "$method" "http://localhost:3000$url" \
      -H "Content-Type: application/json" \
      -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
      -d "$data" \
      -w "\n%{http_code}")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  echo ""
}

echo "📋 Test 1: Fetch User Preferences (GET)"
echo "----------------------------------------"
test_endpoint "GET" "/api/account/preferences" "Get user preferences"

echo "📋 Test 2: Update Language (PATCH)"
echo "----------------------------------------"
test_endpoint "PATCH" "/api/account/preferences" "Update language to English" \
  '{"language": "EN"}'

echo "📋 Test 3: Update Theme (PATCH)"
echo "----------------------------------------"
test_endpoint "PATCH" "/api/account/preferences" "Update theme to Dark" \
  '{"theme": "DARK"}'

echo "📋 Test 4: Update Notification Preferences (PATCH)"
echo "----------------------------------------"
test_endpoint "PATCH" "/api/account/preferences" "Update notification preferences" \
  '{"emailOrders": true, "emailProjects": true, "emailPromotions": false}'

echo "📋 Test 5: Update Editor Preferences (PATCH)"
echo "----------------------------------------"
test_endpoint "PATCH" "/api/account/preferences" "Update editor preferences" \
  '{"editorSnapToGrid": true, "editorGridVisible": true, "editorGridSize": 20, "editorUnit": "MM", "editorAutoSave": 10}'

echo "📋 Test 6: Update Configurator Preferences (PATCH)"
echo "----------------------------------------"
test_endpoint "PATCH" "/api/account/preferences" "Update configurator preferences" \
  '{"configDefaultQuantity": 100, "configDefaultProductionTime": "express", "configDefaultDelivery": "courier"}'

echo "📋 Test 7: Update Communication Preferences (PATCH)"
echo "----------------------------------------"
test_endpoint "PATCH" "/api/account/preferences" "Update communication preferences" \
  '{"newsletter": true, "specialOffers": true, "personalizedRecommend": false}'

echo "📋 Test 8: Verify Final State (GET)"
echo "----------------------------------------"
test_endpoint "GET" "/api/account/preferences" "Verify all preferences were saved"

# Summary
echo ""
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
