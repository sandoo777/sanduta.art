#!/bin/bash

# Script pentru actualizarea importurilor de tip barrel file
# Acesta înlocuiește importurile din '@/components/ui' cu importuri directe

echo "🔧 Actualizare importuri barrel files..."

# Funcție pentru actualizarea unui fișier
update_imports() {
    local file="$1"
    echo "  📝 Actualizare: $file"
    
    # Mapping-uri pentru componente UI
    sed -i 's|from '"'"'@/components/ui'"'"';|from '"'"'@/components/ui/TEMP'"'"';|g' "$file"
    sed -i 's|LoadingState } from|LoadingState } from '"'"'@/components/ui/LoadingState'"'"';|g' "$file"
    sed -i 's|ErrorState } from|ErrorState } from '"'"'@/components/ui/ErrorState'"'"';|g' "$file"
    sed -i 's|EmptyState } from|EmptyState } from '"'"'@/components/ui/EmptyState'"'"';|g' "$file"
    sed -i 's|EmptySearch } from|EmptySearch } from '"'"'@/components/ui/EmptyState'"'"';|g' "$file"
    sed -i 's|Button } from|Button } from '"'"'@/components/ui/Button'"'"';|g' "$file"
    sed -i 's|Card } from|Card } from '"'"'@/components/ui/Card'"'"';|g' "$file"
    sed -i 's|CardHeader } from|CardHeader } from '"'"'@/components/ui/Card'"'"';|g' "$file"
    sed -i 's|CardTitle } from|CardTitle } from '"'"'@/components/ui/Card'"'"';|g' "$file"
    sed -i 's|CardContent } from|CardContent } from '"'"'@/components/ui/Card'"'"';|g' "$file"
    sed -i 's|CardFooter } from|CardFooter } from '"'"'@/components/ui/Card'"'"';|g' "$file"
    sed -i 's|Input } from|Input } from '"'"'@/components/ui/Input'"'"';|g' "$file"
    sed -i 's|Select } from|Select } from '"'"'@/components/ui/Select'"'"';|g' "$file"
    sed -i 's|Table } from|Table } from '"'"'@/components/ui/Table'"'"';|g' "$file"
    sed -i 's|Badge } from|Badge } from '"'"'@/components/ui/Badge'"'"';|g' "$file"
    sed -i 's|StatusBadge } from|StatusBadge } from '"'"'@/components/ui/Badge'"'"';|g' "$file"
    sed -i 's|Modal } from|Modal } from '"'"'@/components/ui/Modal'"'"';|g' "$file"
    sed -i 's|PageTitle } from|PageTitle } from '"'"'@/components/ui/SectionTitle'"'"';|g' "$file"
    sed -i 's|SectionTitle } from|SectionTitle } from '"'"'@/components/ui/SectionTitle'"'"';|g' "$file"
    
    # Revert TEMP
    sed -i 's|from '"'"'@/components/ui/TEMP'"'"';||g' "$file"
}

# Găsește toate fișierele care importă din @/components/ui
files=$(grep -rl "from '@/components/ui';" src/ 2>/dev/null || echo "")

if [ -z "$files" ]; then
    echo "✅ Nu există fișiere cu importuri barrel file"
    exit 0
fi

for file in $files; do
    if [ -f "$file" ]; then
        update_imports "$file"
    fi
done

echo "✅ Actualizare completă!"
