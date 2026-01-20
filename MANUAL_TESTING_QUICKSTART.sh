#!/bin/bash

# 🧪 Quick Start Manual Testing - sanduta.art
# Acest script verifică rapid funcționalitatea noilor features

echo "🚀 Starting manual testing session..."
echo ""

# Check if server is running
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "❌ Server not running on port 3000"
    echo "▶️  Starting server..."
    npm run dev &
    SERVER_PID=$!
    sleep 5
else
    echo "✅ Server already running on port 3000"
fi

echo ""
echo "📋 MANUAL TESTING CHECKLIST"
echo "=========================="
echo ""

echo "1️⃣ LOGIN ADMIN"
echo "   URL: http://localhost:3000/admin/login"
echo "   Email: admin@sanduta.art"
echo "   Password: admin123"
echo "   ✓ Check: Redirects to /admin after login"
echo ""

echo "2️⃣ TIMELINE & NOTES (New Feature)"
echo "   URL: http://localhost:3000/admin/orders"
echo "   Steps:"
echo "   - Click pe un order"
echo "   - Scroll to 'Timeline' section"
echo "   - Verifică events afișate (status_change, note_added, etc)"
echo "   - Click 'Add Note'"
echo "   - Type message și toggle 'Internal Note'"
echo "   - Submit și verifică că apare în timeline"
echo "   ✓ Check: Timeline auto-refresh, note appear instantly"
echo ""

echo "3️⃣ ESTIMATED DELIVERY DATE (New Field)"
echo "   URL: http://localhost:3000/admin/orders/[id]"
echo "   Steps:"
echo "   - Găsește order cu status DELAYED"
echo "   - Verifică câmpul 'Estimated Delivery Date'"
echo "   - Update date picker cu dată nouă"
echo "   - Save și verifică că se salvează"
echo "   ✓ Check: Date picker funcțional, salvare success"
echo ""

echo "4️⃣ EXPORT RAPOARTE (New Feature)"
echo "   URL: http://localhost:3000/admin/reports"
echo "   Steps:"
echo "   - Click buton 'Export' (top-right)"
echo "   - Selectează 'Export as Excel'"
echo "   - Verifică download .xlsx file"
echo "   - Deschide Excel și verifică columns"
echo "   - Repeat pentru PDF și CSV"
echo "   ✓ Check: All 3 formats download successfully"
echo ""

echo "5️⃣ RESPONSIVE DESIGN"
echo "   URL: http://localhost:3000"
echo "   Steps:"
echo "   - Open Chrome DevTools (F12)"
echo "   - Toggle device toolbar (Ctrl+Shift+M)"
echo "   - Test iPhone SE (375px)"
echo "     * Menu hamburger funcțional"
echo "     * Product cards stack vertical"
echo "     * Checkout form fullwidth"
echo "   - Test iPad (768px)"
echo "     * Sidebar permanent"
echo "     * Product grid 2 columns"
echo "   - Test Desktop (1920px)"
echo "     * Full layout 3 columns"
echo "     * All features visible"
echo "   ✓ Check: No horizontal scroll, readable text"
echo ""

echo "6️⃣ MACHINES & OPERATORS (Real Data Integration)"
echo "   URL: http://localhost:3000/admin/production"
echo "   Steps:"
echo "   - Verifică lista machines (no mock data)"
echo "   - Click pe machine și verifică real specs"
echo "   - Navigate to Operators tab"
echo "   - Verifică operators list cu jobs count"
echo "   ✓ Check: Real data from database, no [Mock] labels"
echo ""

echo "7️⃣ EMAIL TESTING"
echo "   URL: Browser console (Network tab)"
echo "   Steps:"
echo "   - POST /api/admin/test/email"
echo "   - Check response pentru email IDs"
echo "   - Verifică inbox (admin@sanduta.art)"
echo "   - Check Resend dashboard pentru delivery status"
echo "   ✓ Check: Emails sent successfully, delivery confirmed"
echo ""

echo "8️⃣ API HEALTH CHECK"
echo "   URLs to test:"
echo "   - GET /api/admin/orders/[id]/timeline"
echo "   - POST /api/admin/orders/[id]/notes"
echo "   - PATCH /api/admin/orders/[id]/notes/[noteId]"
echo "   - DELETE /api/admin/orders/[id]/notes/[noteId]"
echo "   - POST /api/admin/reports/export-advanced"
echo "   ✓ Check: All return 200 OK, no 500 errors"
echo ""

echo "=========================="
echo ""
echo "🌐 URLs Quick Access:"
echo "   Admin Panel:  http://localhost:3000/admin"
echo "   Orders:       http://localhost:3000/admin/orders"
echo "   Products:     http://localhost:3000/admin/products"
echo "   Reports:      http://localhost:3000/admin/reports"
echo "   Production:   http://localhost:3000/admin/production"
echo ""

echo "📊 Testing Tools:"
echo "   Prisma Studio: npm run prisma:studio"
echo "   Lighthouse:    Chrome DevTools > Lighthouse tab"
echo "   Network:       Chrome DevTools > Network tab"
echo ""

echo "🐛 Known Issues (Non-blocking):"
echo "   - next.config.ts warning: 'reactCompiler' unrecognized (ignore)"
echo "   - npm vulnerabilities: 10 (7 low, 3 high) - non-critical"
echo ""

echo "✅ When all tests PASS:"
echo "   1. Create git commit: git commit -m 'feat: timeline, notes, export, responsive'"
echo "   2. Push to GitHub: git push origin main"
echo "   3. Deploy to Vercel: vercel --prod"
echo "   4. Monitor production: Check /docs/PRODUCTION_DEPLOYMENT.md"
echo ""

echo "📝 Report bugs in: https://github.com/sanduta-art/sanduta.art/issues"
echo ""

# Keep script running to show URLs
read -p "Press Enter to finish testing session..."

# Cleanup (optional)
if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping server..."
    kill $SERVER_PID 2>/dev/null
fi

echo "Testing session complete! 🎉"
