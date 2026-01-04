#!/bin/bash

# Test script for Settings API
# Usage: ./test-settings-api.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="$BASE_URL/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Settings API Test Suite"
echo "========================================="
echo ""

# Test 1: Create a test user (as ADMIN)
echo -e "${YELLOW}Test 1: Create new user${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/settings/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "role": "OPERATOR",
    "active": true
  }')

if echo "$CREATE_RESPONSE" | grep -q '"id"'; then
  echo -e "${GREEN}✓ User created successfully${NC}"
  USER_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "User ID: $USER_ID"
else
  echo -e "${RED}✗ Failed to create user${NC}"
  echo "$CREATE_RESPONSE"
fi
echo ""

# Test 2: List all users
echo -e "${YELLOW}Test 2: List all users${NC}"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/admin/settings/users")

if echo "$LIST_RESPONSE" | grep -q '"email"'; then
  echo -e "${GREEN}✓ Users listed successfully${NC}"
  USER_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"id"' | wc -l)
  echo "Total users: $USER_COUNT"
else
  echo -e "${RED}✗ Failed to list users${NC}"
  echo "$LIST_RESPONSE"
fi
echo ""

# Test 3: Get single user
if [ ! -z "$USER_ID" ]; then
  echo -e "${YELLOW}Test 3: Get single user${NC}"
  GET_RESPONSE=$(curl -s -X GET "$API_URL/admin/settings/users/$USER_ID")
  
  if echo "$GET_RESPONSE" | grep -q '"email"'; then
    echo -e "${GREEN}✓ User retrieved successfully${NC}"
  else
    echo -e "${RED}✗ Failed to get user${NC}"
    echo "$GET_RESPONSE"
  fi
  echo ""
fi

# Test 4: Update user
if [ ! -z "$USER_ID" ]; then
  echo -e "${YELLOW}Test 4: Update user${NC}"
  UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/admin/settings/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Updated Test User",
      "active": false
    }')
  
  if echo "$UPDATE_RESPONSE" | grep -q '"name":"Updated Test User"'; then
    echo -e "${GREEN}✓ User updated successfully${NC}"
  else
    echo -e "${RED}✗ Failed to update user${NC}"
    echo "$UPDATE_RESPONSE"
  fi
  echo ""
fi

# Test 5: Update user password
if [ ! -z "$USER_ID" ]; then
  echo -e "${YELLOW}Test 5: Update user password${NC}"
  PASSWORD_RESPONSE=$(curl -s -X PATCH "$API_URL/admin/settings/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "password": "newpassword123"
    }')
  
  if echo "$PASSWORD_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Password updated successfully${NC}"
  else
    echo -e "${RED}✗ Failed to update password${NC}"
    echo "$PASSWORD_RESPONSE"
  fi
  echo ""
fi

# Test 6: System Settings - Get all
echo -e "${YELLOW}Test 6: Get system settings${NC}"
SETTINGS_GET_RESPONSE=$(curl -s -X GET "$API_URL/admin/settings/system")

if echo "$SETTINGS_GET_RESPONSE" | grep -q '"settings"'; then
  echo -e "${GREEN}✓ System settings retrieved successfully${NC}"
else
  echo -e "${RED}✗ Failed to get system settings${NC}"
  echo "$SETTINGS_GET_RESPONSE"
fi
echo ""

# Test 7: System Settings - Update
echo -e "${YELLOW}Test 7: Update system settings${NC}"
SETTINGS_UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/admin/settings/system" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "company_name": "Sanduta Print",
      "company_email": "contact@sanduta.art",
      "default_currency": "MDL",
      "low_stock_threshold": "10",
      "timezone": "Europe/Chisinau"
    }
  }')

if echo "$SETTINGS_UPDATE_RESPONSE" | grep -q '"message"'; then
  echo -e "${GREEN}✓ System settings updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update system settings${NC}"
  echo "$SETTINGS_UPDATE_RESPONSE"
fi
echo ""

# Test 8: Verify settings were saved
echo -e "${YELLOW}Test 8: Verify settings persistence${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$API_URL/admin/settings/system")

if echo "$VERIFY_RESPONSE" | grep -q '"company_name":"Sanduta Print"'; then
  echo -e "${GREEN}✓ Settings persisted correctly${NC}"
else
  echo -e "${RED}✗ Settings not persisted${NC}"
  echo "$VERIFY_RESPONSE"
fi
echo ""

# Test 9: Try to delete user (protect last admin)
if [ ! -z "$USER_ID" ]; then
  echo -e "${YELLOW}Test 9: Delete non-admin user (should succeed)${NC}"
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/admin/settings/users/$USER_ID")
  
  if echo "$DELETE_RESPONSE" | grep -q '"message"'; then
    echo -e "${GREEN}✓ User deleted successfully${NC}"
  else
    echo -e "${RED}✗ Failed to delete user${NC}"
    echo "$DELETE_RESPONSE"
  fi
  echo ""
fi

# Test 10: Try to create duplicate email
echo -e "${YELLOW}Test 10: Try to create user with duplicate email${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/settings/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate User",
    "email": "testuser@example.com",
    "password": "password123"
  }')

if echo "$DUPLICATE_RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✓ Duplicate email correctly rejected${NC}"
else
  echo -e "${RED}✗ Duplicate email was not rejected${NC}"
  echo "$DUPLICATE_RESPONSE"
fi
echo ""

echo "========================================="
echo "Test Suite Completed"
echo "========================================="
