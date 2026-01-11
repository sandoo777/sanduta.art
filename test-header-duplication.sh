#!/bin/bash

# Test pentru verificare duplicare Header în toate secțiunile platformei
# Test toate paginile pentru a verifica că Header apare o singură dată

set -e

echo "=================================================="
echo "🔍 TEST DUPLICARE HEADER - VERIFICARE COMPLETĂ"
echo "=================================================="
echo ""

# Verifică că serverul rulează
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "❌ Serverul nu rulează pe localhost:3000"
    echo "   Rulează: npm run dev"
    exit 1
fi

echo "✅ Server activ pe localhost:3000"
echo ""

# Funcție pentru a testa o pagină
test_page() {
    local url="$1"
    local page_name="$2"
    local should_have_header="$3" # "yes", "no", "custom"
    
    echo "📄 Testing: $page_name ($url)"
    
    # Fetch pagina
    response=$(curl -s "$url")
    
    # Numără câte headere există (căutăm tag-uri <header> sau componente Header)
    header_count=$(echo "$response" | grep -o '<header' | wc -l)
    
    # Verifică prezența ConditionalHeader sau Header în răspuns
    if echo "$response" | grep -q "ConditionalHeader\|components/public/Header\|components/layout/Header"; then
        contains_header="yes"
    else
        contains_header="no"
    fi
    
    # Validare
    case "$should_have_header" in
        "yes")
            if [ "$header_count" -eq 1 ]; then
                echo "   ✅ Header prezent o singură dată"
            elif [ "$header_count" -eq 0 ]; then
                echo "   ⚠️  Header ABSENT (se aștepta 1)"
            else
                echo "   ❌ DUPLICARE DETECTATĂ: $header_count headere găsite!"
                return 1
            fi
            ;;
        "no")
            if [ "$header_count" -eq 0 ]; then
                echo "   ✅ Header corect absent"
            else
                echo "   ❌ Header NU TREBUIE SĂ FIE PREZENT: $header_count găsite!"
                return 1
            fi
            ;;
        "custom")
            if [ "$header_count" -eq 1 ]; then
                echo "   ✅ Header custom prezent (1 header)"
            elif [ "$header_count" -eq 0 ]; then
                echo "   ⚠️  Header absent"
            else
                echo "   ❌ DUPLICARE: $header_count headere găsite!"
                return 1
            fi
            ;;
    esac
    
    echo ""
    return 0
}

# Test rezultate
failed_tests=0
total_tests=0

echo "=================================================="
echo "📋 TESTARE PAGINI PUBLICE (trebuie să aibă Header)"
echo "=================================================="
echo ""

# Pagini publice - trebuie să aibă ConditionalHeader
pages_public=(
    "http://localhost:3000|Homepage"
    "http://localhost:3000/produse|Produse"
    "http://localhost:3000/about|About"
    "http://localhost:3000/contact|Contact"
    "http://localhost:3000/cart|Cart"
    "http://localhost:3000/checkout|Checkout"
    "http://localhost:3000/blog|Blog"
)

for page in "${pages_public[@]}"; do
    IFS='|' read -r url name <<< "$page"
    total_tests=$((total_tests + 1))
    if ! test_page "$url" "$name" "yes"; then
        failed_tests=$((failed_tests + 1))
    fi
done

echo "=================================================="
echo "🔐 TESTARE ZONE AUTENTIFICATE (Header custom)"
echo "=================================================="
echo ""

# Note: Aceste teste pot eșua dacă nu ești autentificat
# În producție ar trebui testate cu sesiune activă

pages_auth=(
    "http://localhost:3000/account|User Panel"
    "http://localhost:3000/manager|Manager Panel"
    "http://localhost:3000/operator|Operator Panel"
    "http://localhost:3000/admin|Admin Panel"
)

for page in "${pages_auth[@]}"; do
    IFS='|' read -r url name <<< "$page"
    total_tests=$((total_tests + 1))
    # Testăm că are un header custom (nu ConditionalHeader)
    if ! test_page "$url" "$name" "custom"; then
        failed_tests=$((failed_tests + 1))
    fi
done

echo "=================================================="
echo "✨ TESTARE EDITOR (fără Header standard)"
echo "=================================================="
echo ""

# Editor - nu trebuie să aibă Header standard
total_tests=$((total_tests + 1))
if ! test_page "http://localhost:3000/editor" "Editor" "custom"; then
    failed_tests=$((failed_tests + 1))
fi

echo "=================================================="
echo "📊 REZULTATE TEST"
echo "=================================================="
echo ""
echo "Total teste: $total_tests"
echo "Teste passed: $((total_tests - failed_tests))"
echo "Teste failed: $failed_tests"
echo ""

if [ "$failed_tests" -eq 0 ]; then
    echo "✅ TOATE TESTELE AU TRECUT!"
    echo ""
    echo "🎉 Nu există duplicări de Header pe platformă."
    exit 0
else
    echo "❌ UNELE TESTE AU EȘUAT"
    echo ""
    echo "⚠️  Verifică manual paginile marcate mai sus."
    exit 1
fi
