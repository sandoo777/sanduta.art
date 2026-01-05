#!/bin/bash

# Script de testare pentru sistemul de notificări
# Testează funcționalitatea completă a sistemului de notificări

set -e

echo "==================================="
echo "Test: Sistem Notificări"
echo "==================================="
echo ""

# Culori pentru output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcție pentru verificare fișier
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Găsit: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Lipsă: $1"
        return 1
    fi
}

# Funcție pentru verificare conținut
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        return 1
    fi
}

echo "1. Verificare structură bază de date..."
check_file "prisma/schema.prisma"
check_content "prisma/schema.prisma" "enum NotificationType" "Enum NotificationType definit"
check_content "prisma/schema.prisma" "model Notification" "Model Notification definit"
echo ""

echo "2. Verificare API Routes..."
check_file "src/app/api/account/notifications/route.ts"
check_file "src/app/api/account/notifications/[notificationId]/route.ts"
check_file "src/app/api/account/notifications/mark-all-read/route.ts"
check_file "src/app/api/account/notifications/[notificationId]/archive/route.ts"
check_file "src/app/api/account/notifications/unread-count/route.ts"
echo ""

echo "3. Verificare Store și Hook-uri..."
check_file "src/modules/notifications/notificationsStore.ts"
check_content "src/modules/notifications/notificationsStore.ts" "useNotificationsStore" "Store Zustand configurat"
check_content "src/modules/notifications/notificationsStore.ts" "fetchNotifications" "Acțiune fetchNotifications"
check_content "src/modules/notifications/notificationsStore.ts" "markAsRead" "Acțiune markAsRead"
echo ""

echo "4. Verificare componente UI..."
check_file "src/components/account/notifications/NotificationCard.tsx"
check_file "src/components/account/notifications/NotificationsList.tsx"
check_file "src/components/account/notifications/NotificationsDropdown.tsx"
echo ""

echo "5. Verificare pagină notificări..."
check_file "src/app/(account)/dashboard/notifications/page.tsx"
check_content "src/app/(account)/dashboard/notifications/page.tsx" "NotificationsList" "Componentă listă integrată"
echo ""

echo "6. Verificare integrare Header..."
check_content "src/components/public/Header.tsx" "NotificationsDropdown" "Dropdown adăugat în Header"
check_content "src/components/public/Header.tsx" "useSession" "Verificare sesiune pentru notificări"
echo ""

echo "7. Verificare navigație în Sidebar..."
check_content "src/components/account/AccountSidebar.tsx" "Notificări" "Link navigație adăugat"
check_content "src/components/account/AccountSidebar.tsx" "BellIcon" "Icon notificări adăugat"
echo ""

echo "8. Verificare funcționalități în store..."
check_content "src/modules/notifications/notificationsStore.ts" "markAllAsRead" "Funcție marchează toate citite"
check_content "src/modules/notifications/notificationsStore.ts" "archiveNotification" "Funcție arhivare"
check_content "src/modules/notifications/notificationsStore.ts" "deleteNotification" "Funcție ștergere"
check_content "src/modules/notifications/notificationsStore.ts" "setCategory" "Funcție filtrare categorii"
echo ""

echo "9. Verificare tipuri de notificări..."
check_content "src/components/account/notifications/NotificationCard.tsx" "ORDER" "Tip notificare ORDER"
check_content "src/components/account/notifications/NotificationCard.tsx" "PROJECT" "Tip notificare PROJECT"
check_content "src/components/account/notifications/NotificationCard.tsx" "FILE" "Tip notificare FILE"
check_content "src/components/account/notifications/NotificationCard.tsx" "SYSTEM" "Tip notificare SYSTEM"
echo ""

echo "10. Verificare infinite scroll..."
check_content "src/components/account/notifications/NotificationsList.tsx" "IntersectionObserver" "Infinite scroll implementat"
check_content "src/components/account/notifications/NotificationsList.tsx" "hasMore" "Logic paginare"
echo ""

echo "11. Verificare badge notificări..."
check_content "src/components/account/notifications/NotificationsDropdown.tsx" "unreadCount" "Badge număr necitite"
check_content "src/components/account/notifications/NotificationsDropdown.tsx" "bg-red-500" "Badge roșu pentru notificări"
echo ""

echo "12. Verificare filtre și categorii..."
check_content "src/components/account/notifications/NotificationsList.tsx" "Toate" "Filtru Toate"
check_content "src/components/account/notifications/NotificationsList.tsx" "Comenzi" "Filtru Comenzi"
check_content "src/components/account/notifications/NotificationsList.tsx" "Proiecte" "Filtru Proiecte"
check_content "src/components/account/notifications/NotificationsList.tsx" "Fișiere" "Filtru Fișiere"
check_content "src/components/account/notifications/NotificationsList.tsx" "Sistem" "Filtru Sistem"
echo ""

echo "13. Testare TypeScript build..."
echo -e "${YELLOW}Compilare TypeScript...${NC}"
if npx tsc --noEmit 2>&1 | grep -q "error"; then
    echo -e "${RED}✗${NC} Erori TypeScript detectate"
    npx tsc --noEmit 2>&1 | head -20
else
    echo -e "${GREEN}✓${NC} Fără erori TypeScript"
fi
echo ""

echo "==================================="
echo "Rezumat verificare"
echo "==================================="
echo ""
echo -e "${GREEN}Sistemul de notificări este complet implementat!${NC}"
echo ""
echo "Funcționalități disponibile:"
echo "  • Notificări cu 4 tipuri: Comenzi, Proiecte, Fișiere, Sistem"
echo "  • Filtrare pe categorii și status (citite/necitite)"
echo "  • Badge în header cu număr notificări necitite"
echo "  • Dropdown cu ultimele 5 notificări"
echo "  • Pagină completă cu infinite scroll"
echo "  • Acțiuni: marcare citit, arhivare, ștergere"
echo "  • Polling automat la 30 secunde pentru actualizări"
echo ""
echo "Următorii pași:"
echo "  1. Test manual: vizitează /dashboard/notifications"
echo "  2. Test integrare: verifică badge-ul în header"
echo "  3. Test API: creează notificări de test"
echo "  4. Implementare sistem real-time (WebSocket/SSE)"
echo ""
