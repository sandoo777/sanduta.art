# Notificări - Quick Start Guide

## Setup rapid (5 minute)

### 1. Verificare instalare
```bash
./scripts/test-notifications.sh
```

### 2. Structura implementată

```
prisma/
  └── schema.prisma (NotificationType enum + Notification model)
  
src/
  ├── app/
  │   ├── api/account/notifications/
  │   │   ├── route.ts (GET - listă notificări)
  │   │   ├── [notificationId]/route.ts (PATCH/DELETE)
  │   │   ├── mark-all-read/route.ts (POST)
  │   │   ├── [notificationId]/archive/route.ts (POST)
  │   │   └── unread-count/route.ts (GET)
  │   └── (account)/dashboard/notifications/page.tsx
  │
  ├── components/account/notifications/
  │   ├── NotificationCard.tsx
  │   ├── NotificationsList.tsx
  │   └── NotificationsDropdown.tsx
  │
  └── modules/notifications/
      └── notificationsStore.ts (Zustand store)
```

### 3. Utilizare în componente

#### Afișare număr necitite
```tsx
'use client';
import { useNotificationsStore } from '@/modules/notifications/notificationsStore';

export default function MyComponent() {
  const { unreadCount } = useNotificationsStore();
  
  return <div>Notificări: {unreadCount}</div>;
}
```

#### Lista notificări
```tsx
'use client';
import { useEffect } from 'react';
import { useNotificationsStore } from '@/modules/notifications/notificationsStore';

export default function NotificationsPage() {
  const { notifications, fetchNotifications } = useNotificationsStore();
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  return (
    <div>
      {notifications.map(n => (
        <div key={n.id}>{n.title}</div>
      ))}
    </div>
  );
}
```

### 4. Creare notificări (Backend)

#### În API Route
```typescript
import { prisma } from '@/lib/prisma';

// După creare comandă
await prisma.notification.create({
  data: {
    userId: user.id,
    type: 'ORDER',
    title: 'Comandă nouă',
    message: 'Comanda #12345 a fost plasată',
    link: '/dashboard/orders/12345'
  }
});
```

#### Tipuri disponibile
- `ORDER` - Notificări comenzi
- `PROJECT` - Notificări proiecte  
- `FILE` - Notificări fișiere
- `SYSTEM` - Notificări sistem

### 5. Features disponibile

✅ **Badge în header** - Afișează număr necitite  
✅ **Dropdown** - Ultimele 5 notificări  
✅ **Pagină completă** - `/dashboard/notifications`  
✅ **Filtrare** - Categorii și status citit/necitit  
✅ **Acțiuni** - Marcare citit, arhivare, ștergere  
✅ **Infinite scroll** - Auto-load la scroll  
✅ **Auto-refresh** - Polling la 30s  
✅ **Responsive** - Mobile/Tablet/Desktop  

### 6. Test manual rapid

1. **Deschide aplicația** și autentifică-te
2. **Header** - Vezi badge-ul cu notificări (dacă există)
3. **Click pe bell icon** - Vezi dropdown cu ultimele notificări
4. **Navighează la** `/dashboard/notifications` - Vezi lista completă
5. **Test acțiuni:**
   - Click pe notificare necitită -> marchează citit
   - Click "Arhivează" -> dispare din listă
   - Toggle "Doar necitite" -> filtrează
   - Schimbă categoria -> filtrează pe tip

### 7. API Testing cu curl

#### Get notificări
```bash
curl -X GET "http://localhost:3000/api/account/notifications?category=all&limit=10" \
  -H "Cookie: next-auth.session-token=..."
```

#### Mark as read
```bash
curl -X PATCH "http://localhost:3000/api/account/notifications/{id}" \
  -H "Cookie: next-auth.session-token=..."
```

#### Unread count
```bash
curl -X GET "http://localhost:3000/api/account/notifications/unread-count" \
  -H "Cookie: next-auth.session-token=..."
```

### 8. Creare date de test

```sql
-- Direct în PostgreSQL
INSERT INTO notifications (id, "userId", type, title, message, link, read, archived, "createdAt", "updatedAt")
VALUES 
  ('test1', 'USER_ID', 'ORDER', 'Test Order', 'Message', '/orders/1', false, false, NOW(), NOW()),
  ('test2', 'USER_ID', 'PROJECT', 'Test Project', 'Message', '/projects/1', false, false, NOW(), NOW()),
  ('test3', 'USER_ID', 'FILE', 'Test File', 'Message', '/files/1', true, false, NOW(), NOW());
```

Sau prin Prisma Studio:
```bash
npx prisma studio
```

### 9. Common Issues

❌ **Badge nu apare**  
→ Verifică că utilizatorul este autentificat

❌ **Erori TypeScript**  
→ Rulează `npx prisma generate`

❌ **Notificările nu se încarcă**  
→ Verifică console și network tab

❌ **Infinite scroll nu funcționează**  
→ Verifică că `hasMore` este true

### 10. Next Steps

Pentru funcționalități avansate:
- 📡 Implementare WebSocket pentru real-time push
- 🔔 Toast notifications pentru notificări noi
- ⚙️ Setări preferințe notificări
- 📧 Email notifications
- 📊 Analytics notificări

Vezi [NOTIFICATIONS_SYSTEM.md](./NOTIFICATIONS_SYSTEM.md) pentru documentație completă.

---

**Sistemul este gata de producție!** 🚀
