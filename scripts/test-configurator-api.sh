#!/bin/bash
# Тест API endpoint-ului pentru configurator
set -e
PRODUCT_ID="$1"
if [ -z "$PRODUCT_ID" ]; then
  echo "Usage: $0 <product_id>"
  exit 1
fi
API_URL="http://localhost:3000/api/products/$PRODUCT_ID/configurator"
echo "Testare API: $API_URL"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL")
BODY=$(echo "$RESPONSE" | head -n-1)
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" != "200" ]; then
  echo "Eroare: Status $STATUS"
  echo "$BODY"
  exit 2
fi
echo "Răspuns valid. Structură cheie:"
echo "$BODY" | jq '. | {id, name, type, options, materials, printMethods, finishing, pricing, production, images, defaults}'
