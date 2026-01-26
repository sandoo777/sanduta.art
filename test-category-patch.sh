#!/bin/bash

echo "Waiting for server to start..."
sleep 8

echo "Fetching categories..."
RESPONSE=$(curl -s "http://localhost:3000/api/admin/categories")

if [ -z "$RESPONSE" ]; then
  echo "❌ No response from server"
  exit 1
fi

echo "$RESPONSE" | jq -r 'if type == "array" and length > 0 then .[0] | "ID: \(.id)\nName: \(.name)\nSlug: \(.slug)" else "No categories found" end'

# Get the first category ID
CATEGORY_ID=$(echo "$RESPONSE" | jq -r '.[0].id')

if [ "$CATEGORY_ID" != "null" ] && [ -n "$CATEGORY_ID" ]; then
  echo ""
  echo "Testing PATCH endpoint with ID: $CATEGORY_ID"
  echo "Updating metaDescription..."
  
  PATCH_RESPONSE=$(curl -s -X PATCH "http://localhost:3000/api/admin/categories/$CATEGORY_ID" \
    -H "Content-Type: application/json" \
    -d '{"metaDescription": "Updated via API test - '$(date +%s)'"}')
  
  echo "PATCH Response:"
  echo "$PATCH_RESPONSE" | jq '.'
  
  # Check if successful
  if echo "$PATCH_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo "✅ PATCH request successful!"
  else
    echo "❌ PATCH request failed"
    echo "$PATCH_RESPONSE" | jq '.'
  fi
else
  echo "❌ Could not get category ID"
fi
