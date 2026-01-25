#!/bin/bash

echo "🧪 Testing /api/orders endpoint..."
echo ""

# Test without authentication (should return 401)
echo "1. Testing without authentication:"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:3000/api/orders
echo ""
echo "---"
echo ""

# Test with invalid token (should return 401)
echo "2. Testing with invalid token:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer invalid-token" \
  http://localhost:3000/api/orders
echo ""
echo "---"
echo ""

echo "✅ Test completed. Check server logs for detailed output."
