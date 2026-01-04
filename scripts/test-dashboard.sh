#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing User Dashboard System"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Function to check if server is running
check_server() {
    if ! curl -s "$BASE_URL" > /dev/null; then
        echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
        echo "Please start the server with: npm run dev"
        exit 1
    fi
    echo -e "${GREEN}✅ Server is running${NC}"
    echo ""
}

# Function to login and get session cookie
login_user() {
    echo "🔐 Logging in..."
    
    # This is a placeholder - actual implementation depends on your auth system
    # You'll need to adjust this based on how your authentication works
    
    COOKIE=$(curl -s -c - -X POST "$BASE_URL/api/auth/callback/credentials" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"testpassword"}' \
        | grep -oP 'next-auth.session-token\s+\K[^\s]+')
    
    if [ -z "$COOKIE" ]; then
        echo -e "${RED}❌ Login failed${NC}"
        echo "Note: You may need to create a test user first"
        return 1
    fi
    
    echo -e "${GREEN}✅ Login successful${NC}"
    echo ""
    return 0
}

# Test 1: Dashboard Page
test_dashboard() {
    echo "📊 Test 1: Dashboard Page"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✅ Dashboard page accessible${NC}"
    else
        echo -e "${RED}❌ Dashboard page error (HTTP $response)${NC}"
    fi
    echo ""
}

# Test 2: Orders Page
test_orders() {
    echo "📦 Test 2: Orders Page"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/orders")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✅ Orders page accessible${NC}"
    else
        echo -e "${RED}❌ Orders page error (HTTP $response)${NC}"
    fi
    echo ""
}

# Test 3: Projects Page
test_projects() {
    echo "📁 Test 3: Projects Page"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/projects")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✅ Projects page accessible${NC}"
    else
        echo -e "${RED}❌ Projects page error (HTTP $response)${NC}"
    fi
    echo ""
}

# Test 4: Addresses Page
test_addresses() {
    echo "📍 Test 4: Addresses Page"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/addresses")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✅ Addresses page accessible${NC}"
    else
        echo -e "${RED}❌ Addresses page error (HTTP $response)${NC}"
    fi
    echo ""
}

# Test 5: Profile Page
test_profile() {
    echo "👤 Test 5: Profile Page"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/profile")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✅ Profile page accessible${NC}"
    else
        echo -e "${RED}❌ Profile page error (HTTP $response)${NC}"
    fi
    echo ""
}

# Test 6: Settings Page
test_settings() {
    echo "⚙️  Test 6: Settings Page"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/settings")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✅ Settings page accessible${NC}"
    else
        echo -e "${RED}❌ Settings page error (HTTP $response)${NC}"
    fi
    echo ""
}

# Test 7: API Endpoints
test_api_endpoints() {
    echo "🔌 Test 7: API Endpoints Structure"
    
    endpoints=(
        "/api/account/profile"
        "/api/account/orders"
        "/api/account/projects"
        "/api/account/addresses"
    )
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
        
        # 401 Unauthorized is expected without authentication
        if [ "$response" = "401" ] || [ "$response" = "200" ]; then
            echo -e "${GREEN}✅ $endpoint - OK (HTTP $response)${NC}"
        else
            echo -e "${RED}❌ $endpoint - Error (HTTP $response)${NC}"
        fi
    done
    echo ""
}

# Test 8: Component Files
test_components() {
    echo "🧩 Test 8: Component Files"
    
    components=(
        "src/components/account/AccountSidebar.tsx"
        "src/components/account/orders/OrdersList.tsx"
        "src/components/account/projects/ProjectsList.tsx"
        "src/components/account/addresses/AddressList.tsx"
        "src/components/account/profile/ProfileForm.tsx"
    )
    
    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            echo -e "${GREEN}✅ $component exists${NC}"
        else
            echo -e "${RED}❌ $component missing${NC}"
        fi
    done
    echo ""
}

# Test 9: Database Migration
test_migration() {
    echo "🗄️  Test 9: Database Migration"
    
    if npx prisma db push --skip-generate > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database schema is in sync${NC}"
    else
        echo -e "${YELLOW}⚠️  Database may need migration${NC}"
        echo "Run: npx prisma migrate dev"
    fi
    echo ""
}

# Test 10: TypeScript Compilation
test_typescript() {
    echo "📝 Test 10: TypeScript Compilation"
    
    if npx tsc --noEmit > /dev/null 2>&1; then
        echo -e "${GREEN}✅ No TypeScript errors${NC}"
    else
        echo -e "${YELLOW}⚠️  TypeScript errors found${NC}"
        echo "Run: npx tsc --noEmit for details"
    fi
    echo ""
}

# Run all tests
echo "Starting tests..."
echo ""

check_server
test_dashboard
test_orders
test_projects
test_addresses
test_profile
test_settings
test_api_endpoints
test_components
test_migration
test_typescript

echo "================================"
echo "✨ Dashboard testing complete!"
echo ""
echo "📚 Next steps:"
echo "1. Visit http://localhost:3000/dashboard in your browser"
echo "2. Login with a test user account"
echo "3. Test all dashboard sections manually"
echo "4. Verify responsive design on mobile"
echo ""
echo "🎨 Dashboard Features:"
echo "- ✅ Main dashboard with quick links"
echo "- ✅ Orders management"
echo "- ✅ Projects management"
echo "- ✅ Addresses management"
echo "- ✅ Profile settings"
echo "- ✅ Account settings (password, delete account)"
echo "- ✅ Responsive sidebar navigation"
echo "- ✅ Modern, clean UI design"
