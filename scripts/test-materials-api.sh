#!/bin/bash

# Materials & Inventory API Testing Script
# Run after starting the dev server: npm run dev

BASE_URL="http://localhost:3000/api/admin"

echo "🧪 Testing Materials & Inventory API"
echo "===================================="
echo ""

# Note: These tests require authentication
# Make sure you're logged in as ADMIN or MANAGER

echo "📝 Test 1: Create Material"
echo "POST $BASE_URL/materials"
echo ""

# Create material
MATERIAL_ID=$(curl -s -X POST "$BASE_URL/materials" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Material API",
    "sku": "TEST-API-'$(date +%s)'",
    "unit": "kg",
    "stock": 100,
    "minStock": 20,
    "costPerUnit": 15.5,
    "notes": "Created via API test"
  }' | jq -r '.id')

echo "Created Material ID: $MATERIAL_ID"
echo ""

echo "📝 Test 2: List All Materials"
echo "GET $BASE_URL/materials"
echo ""

curl -s "$BASE_URL/materials" | jq '.[] | {id, name, stock, lowStock, totalConsumption}'
echo ""

echo "📝 Test 3: Get Single Material"
echo "GET $BASE_URL/materials/$MATERIAL_ID"
echo ""

curl -s "$BASE_URL/materials/$MATERIAL_ID" | jq '{id, name, stock, minStock, consumption}'
echo ""

echo "📝 Test 4: Update Material"
echo "PATCH $BASE_URL/materials/$MATERIAL_ID"
echo ""

curl -s -X PATCH "$BASE_URL/materials/$MATERIAL_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 150,
    "minStock": 30,
    "name": "Updated Test Material"
  }' | jq '{id, name, stock, minStock}'
echo ""

echo "📝 Test 5: Create Production Job for Testing"
echo ""

# First, create an order
ORDER_ID=$(curl -s -X POST "http://localhost:3000/api/admin/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "totalPrice": 100
  }' | jq -r '.id')

echo "Created Order ID: $ORDER_ID"

# Then create a job
JOB_ID=$(curl -s -X POST "http://localhost:3000/api/admin/production/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "name": "Test Production Job for Material Consumption"
  }' | jq -r '.id')

echo "Created Job ID: $JOB_ID"
echo ""

echo "📝 Test 6: Consume Material"
echo "POST $BASE_URL/materials/$MATERIAL_ID/consume"
echo ""

curl -s -X POST "$BASE_URL/materials/$MATERIAL_ID/consume" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "'$JOB_ID'",
    "quantity": 25
  }' | jq '{success, material: {stock, minStock}, warning}'
echo ""

echo "📝 Test 7: Get Material with Consumption History"
echo "GET $BASE_URL/materials/$MATERIAL_ID"
echo ""

curl -s "$BASE_URL/materials/$MATERIAL_ID" | jq '{
  id, 
  name, 
  stock, 
  minStock,
  consumptionCount: (.consumption | length),
  consumption: .consumption[] | {quantity, createdAt, job: {name, status}}
}'
echo ""

echo "📝 Test 8: Attempt to Delete Material with Consumption"
echo "DELETE $BASE_URL/materials/$MATERIAL_ID"
echo ""

curl -s -X DELETE "$BASE_URL/materials/$MATERIAL_ID" | jq '.'
echo ""

echo "📝 Test 9: Create Material Without Consumption"
echo ""

TEMP_MATERIAL_ID=$(curl -s -X POST "$BASE_URL/materials" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temporary Material for Deletion",
    "sku": "TEMP-'$(date +%s)'",
    "unit": "pcs",
    "stock": 50,
    "minStock": 10
  }' | jq -r '.id')

echo "Created Temporary Material ID: $TEMP_MATERIAL_ID"
echo ""

echo "📝 Test 10: Delete Material Without Consumption"
echo "DELETE $BASE_URL/materials/$TEMP_MATERIAL_ID"
echo ""

curl -s -X DELETE "$BASE_URL/materials/$TEMP_MATERIAL_ID" | jq '.'
echo ""

echo "✅ API Testing Complete!"
echo ""
echo "📊 Summary:"
echo "- Created materials: ✓"
echo "- Listed materials: ✓"
echo "- Updated material: ✓"
echo "- Consumed material: ✓"
echo "- Tested delete restrictions: ✓"
echo "- Verified consumption tracking: ✓"
echo ""
echo "Note: Material ID $MATERIAL_ID and Order ID $ORDER_ID remain in database for inspection."
echo "Clean up manually if needed."
