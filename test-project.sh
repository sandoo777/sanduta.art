#!/bin/bash

# Test script pentru sanduta.art
# Testează toate funcționalitățile principale

BASE_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "   TESTARE PROIECT SANDUTA.ART  "
echo "================================"
echo ""

# Test 1: Homepage
echo -n "1. Homepage (/)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 2: Login Page
echo -n "2. Login page (/login)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/login)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 3: Products Page
echo -n "3. Products page (/products)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/products)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 4: Register Page
echo -n "4. Register page (/register)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/register)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 5: Checkout Page
echo -n "5. Checkout page (/checkout)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/checkout)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 6: Admin redirect (no auth)
echo -n "6. Admin redirect without auth (/admin)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin)
if [ "$STATUS" = "307" ] || [ "$STATUS" = "302" ]; then
  echo -e "${GREEN}✓ OK (redirects $STATUS)${NC}"
else
  echo -e "${YELLOW}⚠ UNEXPECTED ($STATUS)${NC}"
fi

echo ""
echo "=== API TESTS ==="

# Test 7: Products API
echo -n "7. Products API (/api/products)... "
RESPONSE=$(curl -s $BASE_URL/api/products)
COUNT=$(echo $RESPONSE | jq -r 'length' 2>/dev/null)
if [ "$COUNT" -gt "0" ] 2>/dev/null; then
  echo -e "${GREEN}✓ OK ($COUNT products)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 8: Auth Session API
echo -n "8. Auth session API (/api/auth/session)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/auth/session)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 9: Auth Providers API
echo -n "9. Auth providers API (/api/auth/providers)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/auth/providers)
if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ OK ($STATUS)${NC}"
else
  echo -e "${RED}✗ FAILED ($STATUS)${NC}"
fi

# Test 10: Orders API (should be 401 without auth)
echo -n "10. Orders API без auth (/api/orders)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/orders)
if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✓ OK (requires auth)${NC}"
else
  echo -e "${YELLOW}⚠ UNEXPECTED ($STATUS)${NC}"
fi

echo ""
echo "=== DATABASE & ENVIRONMENT ==="

# Test 11: Database connection
echo -n "11. Database connection... "
cd /workspaces/sanduta.art
DB_TEST=$(npx prisma db push 2>&1 | grep -E "already in sync|successfully")
if [ ! -z "$DB_TEST" ]; then
  echo -e "${GREEN}✓ OK (connected)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 12: Environment variables
echo -n "12. Environment variables (.env)... "
if [ -f ".env" ]; then
  echo -e "${GREEN}✓ OK (exists)${NC}"
else
  echo -e "${RED}✗ FAILED (missing)${NC}"
fi

echo ""
echo "================================"
echo "   TESTARE COMPLETATĂ           "
echo "================================"
