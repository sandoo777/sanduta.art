#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "  VERIFICARE STRUCTURĂ PUBLICĂ SITE"
echo "═══════════════════════════════════════════════════════"
echo ""

# Verifică fișiere create
echo "✓ Verificare fișiere create:"
echo ""

files=(
  "src/app/(public)/layout.tsx"
  "src/app/(public)/page.tsx"
  "src/app/(public)/about/page.tsx"
  "src/app/(public)/contact/page.tsx"
  "src/app/(public)/terms/page.tsx"
  "src/app/(public)/privacy/page.tsx"
  "src/components/public/Header.tsx"
  "src/components/public/Footer.tsx"
  "src/components/public/index.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file MISSING"
  fi
done

echo ""
echo "✓ Verificare branding în globals.css:"
echo ""

if grep -q "color-primary: #0066FF" src/app/globals.css; then
  echo "  ✓ Primary color #0066FF"
fi

if grep -q "color-secondary: #111827" src/app/globals.css; then
  echo "  ✓ Secondary color #111827"
fi

if grep -q "color-accent: #FACC15" src/app/globals.css; then
  echo "  ✓ Accent color #FACC15"
fi

if grep -q "color-background: #F9FAFB" src/app/globals.css; then
  echo "  ✓ Background color #F9FAFB"
fi

echo ""
echo "✓ Verificare componente Header:"
echo ""

if grep -q "Logo" src/components/public/Header.tsx; then
  echo "  ✓ Logo inclus"
fi

if grep -q "hamburger" src/components/public/Header.tsx; then
  echo "  ✓ Mobile menu (hamburger)"
fi

if grep -q "sticky" src/components/public/Header.tsx; then
  echo "  ✓ Sticky navigation"
fi

if grep -q "Comandă acum" src/components/public/Header.tsx; then
  echo "  ✓ CTA button 'Comandă acum'"
fi

echo ""
echo "✓ Verificare componente Footer:"
echo ""

if grep -q "social" src/components/public/Footer.tsx; then
  echo "  ✓ Social icons"
fi

if grep -q "grid" src/components/public/Footer.tsx; then
  echo "  ✓ Grid layout"
fi

if grep -q "copyright" src/components/public/Footer.tsx; then
  echo "  ✓ Copyright section"
fi

echo ""
echo "✓ Verificare TypeScript erori în componentele noi:"
echo ""

npx tsc --noEmit src/components/public/*.tsx 2>&1 | grep -q "error" && echo "  ✗ Erori găsite" || echo "  ✓ Fără erori TypeScript"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  VERIFICARE COMPLETATĂ"
echo "═══════════════════════════════════════════════════════"
