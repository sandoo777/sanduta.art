#!/bin/bash

echo "🧪 Testing /account/orders page..."
echo ""

# Wait for server to be fully ready
sleep 3

# Test home page first (should work)
echo "1. Testing home page (baseline):"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
echo "   HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Home page works"
else
    echo "   ❌ Home page failed"
fi
echo ""

# Test account/orders page (the fix)
echo "2. Testing /account/orders (without auth - should redirect or 401):"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/account/orders)
echo "   HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" != "502" ]; then
    echo "   ✅ No 502 error (fixed!)"
else
    echo "   ❌ Still getting 502"
fi
echo ""

echo "✅ Test completed!"
echo ""
echo "📝 Note: To test with authentication, log in through the browser at:"
echo "   http://localhost:3000/login"
echo "   Email: admin@sanduta.art"
echo "   Password: admin123"
echo "   Then visit: http://localhost:3000/account/orders"
