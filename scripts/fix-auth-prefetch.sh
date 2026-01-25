#!/bin/bash
# Auto-fix prefetch issues by replacing Link with AuthLink in auth routes

set -e

echo "🔧 AUTH PREFETCH AUTO-FIX"
echo ""

# Files
AUTH_FILES=(
  "src/components/account/orders/OrdersList.tsx"
  "src/components/account/projects/ProjectCard.tsx"
  "src/app/account/orders/OrdersClient.tsx"
  "src/app/account/projects/ProjectsClient.tsx"
  "src/app/admin/page.tsx"
)

SUCCESS=0

for FILE in "${AUTH_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    continue
  fi
  
  if grep -q "AuthLink" "$FILE" 2>/dev/null; then
    echo "✅ $FILE (already fixed)"
    ((SUCCESS++))
    continue
  fi
  
  if ! grep -q "from 'next/link'" "$FILE" 2>/dev/null && \
     ! grep -q 'from "next/link"' "$FILE" 2>/dev/null; then
    continue
  fi
  
  echo "🔨 $FILE"
  
  sed -i "s/import Link from 'next\/link'/import { AuthLink } from '@\/components\/common\/links\/AuthLink'/g" "$FILE"
  sed -i 's/import Link from "next\/link"/import { AuthLink } from "@\/components\/common\/links\/AuthLink"/g' "$FILE"
  sed -i 's/<Link/<AuthLink/g' "$FILE"
  sed -i 's/<\/Link>/<\/AuthLink>/g' "$FILE"
  
  ((SUCCESS++))
done

echo ""
echo "✅ Fixed $SUCCESS files"
