#!/bin/bash
# Script automat pentru refactorizare loading/error states

echo "🔄 Refactorizare loading/error states..."
echo ""

# Counter
SUCCESS=0
FAILED=0

# Function pentru refactorizare
refactor_file() {
  local FILE=$1
  local COMPONENT=$2
  
  echo "  Processing: $FILE"
  
  # Check if LoadingState is already imported
  if grep -q "LoadingState" "$FILE"; then
    echo "    ✓ Already uses LoadingState"
    ((SUCCESS++))
    return
  fi
  
  # Check for custom spinners
  if grep -q "animate-spin" "$FILE"; then
    echo "    ⚠ Found custom spinner - needs manual refactoring"
    ((FAILED++))
    return
  fi
  
  echo "    - No custom spinner found"
  ((SUCCESS++))
}

# Scan all admin pages
echo "📁 Scanning admin pages..."
find src/app/admin -name "*.tsx" -type f | while read file; do
  refactor_file "$file" "LoadingState"
done

echo ""
echo "📊 Summary:"
echo "  ✓ Success: $SUCCESS files"
echo "  ✗ Need manual: $FAILED files"
