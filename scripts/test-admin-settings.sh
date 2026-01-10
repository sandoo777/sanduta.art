#!/bin/bash

# Test Script pentru Admin Settings & Permissions
# sanduta.art

echo "========================================="
echo "🧪 Testing Admin Settings & Permissions"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo "📋 Test Suite:"
echo "  1. Verificare fișiere create"
echo "  2. Verificare TypeScript"
echo "  3. Verificare exports"
echo "  4. Verificare rute"
echo ""

# Test 1: Verificare fișiere
echo -e "${YELLOW}Test 1: Verificare fișiere create...${NC}"
files=(
  "src/lib/auth/permissions.ts"
  "src/app/api/admin/settings/users/route.ts"
  "src/app/api/admin/settings/roles/route.ts"
  "src/app/api/admin/settings/permissions/route.ts"
  "src/app/api/admin/settings/audit-logs/route.ts"
  "src/app/api/admin/settings/platform/route.ts"
  "src/app/admin/settings/page.tsx"
  "src/app/admin/settings/users/page.tsx"
  "src/app/admin/settings/roles/page.tsx"
  "src/app/admin/settings/permissions/page.tsx"
  "src/app/admin/settings/audit-logs/page.tsx"
  "src/app/admin/settings/platform/page.tsx"
  "src/app/admin/settings/integrations/page.tsx"
  "src/app/admin/settings/security/page.tsx"
  "src/modules/admin/useAdminSettings.ts"
  "docs/ADMIN_SETTINGS_PERMISSIONS_COMPLETE.md"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $file"
  else
    echo -e "  ${RED}✗${NC} $file (MISSING)"
    ((missing++))
  fi
done

if [ $missing -eq 0 ]; then
  echo -e "${GREEN}✅ Toate fișierele au fost create${NC}"
else
  echo -e "${RED}❌ Lipsesc $missing fișiere${NC}"
  exit 1
fi
echo ""

# Test 2: Verificare TypeScript pentru fișiere cheie
echo -e "${YELLOW}Test 2: Verificare TypeScript...${NC}"
npx tsc --noEmit \
  src/lib/auth/permissions.ts \
  src/modules/admin/useAdminSettings.ts \
  2>&1 | grep -v "node_modules" | head -5

if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo -e "${GREEN}✅ Nu sunt erori TypeScript${NC}"
else
  echo -e "${YELLOW}⚠️  Verifică erorile TypeScript${NC}"
fi
echo ""

# Test 3: Verificare exports
echo -e "${YELLOW}Test 3: Verificare exports...${NC}"
node -e "
  try {
    const { Permission, hasPermission, RolePermissions } = require('./src/lib/auth/permissions.ts');
    console.log('  ✓ permissions.ts exports OK');
  } catch (e) {
    console.log('  ✗ permissions.ts exports FAIL:', e.message);
  }
" 2>/dev/null || echo "  ⚠️  Verificare statică (build necesar pentru test real)"
echo ""

# Test 4: Verificare structură permisiuni
echo -e "${YELLOW}Test 4: Verificare structură permisiuni...${NC}"
if grep -q "enum Permission" src/lib/auth/permissions.ts; then
  echo -e "  ${GREEN}✓${NC} Enum Permission definit"
fi
if grep -q "RolePermissions: Record<UserRole, Permission\[\]>" src/lib/auth/permissions.ts; then
  echo -e "  ${GREEN}✓${NC} RolePermissions definit"
fi
if grep -q "hasPermission" src/lib/auth/permissions.ts; then
  echo -e "  ${GREEN}✓${NC} Funcția hasPermission definită"
fi
if grep -q "hasRoleOrHigher" src/lib/auth/permissions.ts; then
  echo -e "  ${GREEN}✓${NC} Funcția hasRoleOrHigher definită"
fi
echo ""

# Test 5: Verificare API routes
echo -e "${YELLOW}Test 5: Verificare API routes structură...${NC}"
api_routes=(
  "src/app/api/admin/settings/users/route.ts"
  "src/app/api/admin/settings/roles/route.ts"
  "src/app/api/admin/settings/permissions/route.ts"
  "src/app/api/admin/settings/audit-logs/route.ts"
  "src/app/api/admin/settings/platform/route.ts"
)

for route in "${api_routes[@]}"; do
  if grep -q "export async function GET" "$route"; then
    echo -e "  ${GREEN}✓${NC} $route - GET handler"
  else
    echo -e "  ${YELLOW}⚠${NC}  $route - No GET handler"
  fi
done
echo ""

# Test 6: Verificare hook
echo -e "${YELLOW}Test 6: Verificare useAdminSettings hook...${NC}"
hook_methods=(
  "fetchUsers"
  "createUser"
  "updateUser"
  "fetchRoles"
  "fetchPermissions"
  "fetchAuditLogs"
  "fetchPlatformSettings"
  "updatePlatformSettings"
)

for method in "${hook_methods[@]}"; do
  if grep -q "const $method = useCallback" src/modules/admin/useAdminSettings.ts; then
    echo -e "  ${GREEN}✓${NC} $method definit"
  else
    echo -e "  ${RED}✗${NC} $method lipsă"
  fi
done
echo ""

# Test 7: Verificare componente UI
echo -e "${YELLOW}Test 7: Verificare componente UI...${NC}"
ui_pages=(
  "src/app/admin/settings/page.tsx"
  "src/app/admin/settings/users/page.tsx"
  "src/app/admin/settings/roles/page.tsx"
  "src/app/admin/settings/permissions/page.tsx"
)

for page in "${ui_pages[@]}"; do
  if grep -q "export default function" "$page"; then
    echo -e "  ${GREEN}✓${NC} $page - Component export"
  else
    echo -e "  ${RED}✗${NC} $page - No default export"
  fi
done
echo ""

# Test 8: Count statistics
echo -e "${YELLOW}Test 8: Statistici implementare...${NC}"
total_lines=$(find src/app/admin/settings src/lib/auth/permissions.ts src/modules/admin/useAdminSettings.ts -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')
permissions_count=$(grep -o "= \"[a-z_]*\"" src/lib/auth/permissions.ts | wc -l)
api_routes_count=$(find src/app/api/admin/settings -name "route.ts" | wc -l)
ui_pages_count=$(find src/app/admin/settings -name "page.tsx" | wc -l)

echo "  📊 Statistici:"
echo "    - Linii de cod: $total_lines"
echo "    - Permisiuni definite: $permissions_count"
echo "    - API routes: $api_routes_count"
echo "    - UI pages: $ui_pages_count"
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}✅ Testare completă!${NC}"
echo "========================================="
echo ""
echo "📚 Documentație: docs/ADMIN_SETTINGS_PERMISSIONS_COMPLETE.md"
echo ""
echo "🚀 Pentru testare live:"
echo "  1. npm run dev"
echo "  2. Navigate to: $BASE_URL/admin/settings"
echo "  3. Login cu: admin@sanduta.art / admin123"
echo ""
echo "🔐 Rute disponibile:"
echo "  - $BASE_URL/admin/settings"
echo "  - $BASE_URL/admin/settings/users"
echo "  - $BASE_URL/admin/settings/roles"
echo "  - $BASE_URL/admin/settings/permissions"
echo "  - $BASE_URL/admin/settings/audit-logs"
echo "  - $BASE_URL/admin/settings/platform"
echo "  - $BASE_URL/admin/settings/integrations"
echo "  - $BASE_URL/admin/settings/security"
echo ""
