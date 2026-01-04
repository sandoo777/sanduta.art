# Dashboard Utilizator - Documentație Completă

## 📋 Prezentare generală

Dashboard-ul utilizatorului este un sistem complet de gestionare a contului personal, care permite utilizatorilor să:
- Vizualizeze și gestioneze comenzile
- Acceseze și editeze proiectele salvate
- Gestioneze adresele de livrare
- Actualizeze datele personale
- Schimbe parola și configureze setările contului

## 🏗️ Structură

### Pagini principale

```
/dashboard                          - Pagina principală (quick links)
/dashboard/orders                   - Lista comenzilor
/dashboard/orders/[orderId]         - Detalii comandă
/dashboard/projects                 - Lista proiectelor
/dashboard/addresses                - Gestionare adrese
/dashboard/profile                  - Date personale
/dashboard/settings                 - Setări cont
```

### Componente

```
src/components/account/
├── AccountSidebar.tsx             - Navigare laterală
├── orders/
│   └── OrdersList.tsx            - Lista comenzilor
├── projects/
│   └── ProjectsList.tsx          - Lista proiectelor
├── addresses/
│   └── AddressList.tsx           - Gestionare adrese
└── profile/
    └── ProfileForm.tsx           - Formular profil
```

### API Endpoints

```
GET    /api/account/profile         - Obține datele utilizatorului
PATCH  /api/account/profile         - Actualizează profilul

GET    /api/account/orders          - Lista comenzilor utilizatorului
GET    /api/account/orders/[id]    - Detalii comandă
GET    /api/account/orders/[id]/details - Detalii extinse comandă (v2)

GET    /api/account/projects        - Lista proiectelor
```

## 🎨 Pagina de Detalii Comandă (New!)

### Features Complete

1. **Status Progress Bar** - Bară vizuală cu 5 etape de progres
2. **Timeline Evenimente** - Cronologie completă a comenzii
3. **Produse cu Detalii** - Specificații tehnice, imagini, prețuri
4. **Manager Fișiere** - Download și validare fișiere atașate
5. **Tracking Livrare** - AWB, status, estimare timp
6. **Informații Plată** - Status, metodă, factură download
7. **Date Contact** - Client info cu email/telefon clickable
8. **Istoric Modificări** - Audit trail complet

### Componente Specializate

```
src/components/account/
├── OrderStatusBar.tsx       - Bară progres 5 etape
├── OrderTimeline.tsx        - Timeline evenimente
├── OrderProducts.tsx        - Card-uri produse
├── OrderFiles.tsx           - Manager fișiere
├── OrderDelivery.tsx        - Info livrare + tracking
├── OrderPayment.tsx         - Detalii plată + factură
├── OrderAddress.tsx         - Date contact client
└── OrderHistory.tsx         - Audit trail modificări
```

### Documentație Detaliată

Pentru informații complete despre implementarea paginii de detalii comandă:
- [ORDER_DETAILS_PAGE.md](./ORDER_DETAILS_PAGE.md) - Documentație tehnică completă
- [ORDER_DETAILS_QUICK_START.md](./ORDER_DETAILS_QUICK_START.md) - Ghid rapid de început
- [ORDER_DETAILS_FINAL_REPORT.md](./ORDER_DETAILS_FINAL_REPORT.md) - Raport final implementare
DELETE /api/account/projects/[id]  - Șterge proiect
POST   /api/account/projects/[id]/duplicate - Duplică proiect

GET    /api/account/addresses       - Lista adreselor
POST   /api/account/addresses       - Adaugă adresă nouă
PATCH  /api/account/addresses/[id] - Actualizează adresă
DELETE /api/account/addresses/[id] - Șterge adresă
POST   /api/account/addresses/[id]/default - Setează ca implicită

POST   /api/account/password        - Schimbă parola
POST   /api/account/delete          - Șterge contul
```

## 🎨 Design System

### Culori

```css
Primary:     #0066FF  (Albastru)
Secondary:   #111827  (Gri închis)
Accent:      #FACC15  (Galben)
Background:  #F9FAFB  (Gri deschis)
Success:     #10B981  (Verde)
Warning:     #F59E0B  (Portocaliu)
Error:       #EF4444  (Roșu)
```

### Typography

- Font family: Inter (system font stack)
- Headings: font-bold
- Body text: font-normal
- Small text: text-sm

### Spacing

- Container padding: px-4 sm:px-6 lg:px-8
- Section spacing: space-y-6 sau space-y-8
- Card padding: p-6
- Border radius: rounded-lg (8px)

## 📱 Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Sidebar Navigation

**Desktop (lg+)**
- Sidebar vizibil permanent
- Width: 288px (w-72)
- Position: fixed/static

**Mobile (< lg)**
- Sidebar ascuns implicit
- Toggle button în colțul stânga-sus
- Slide-in overlay la deschidere
- Click pe overlay pentru închidere

### Grid Systems

**Orders & Addresses**
```jsx
grid grid-cols-1 md:grid-cols-2 gap-4/6
```

**Projects**
```jsx
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
```

**Dashboard Quick Links**
```jsx
grid grid-cols-1 md:grid-cols-2 gap-6
```

## 🔐 Autentificare & Securitate

### Protecție rute

Toate rutele dashboard sunt protejate prin middleware NextAuth:

```typescript
// src/app/(account)/dashboard/layout.tsx
const session = await getServerSession(authOptions);
if (!session) {
  redirect("/login");
}
```

### API Authentication

Toate endpoint-urile API verifică sesiunea:

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Schimbarea parolei

- Minimum 8 caractere
- Validare parolă curentă
- Hash cu bcrypt

### Ștergerea contului

- Validare cu parolă
- Confirmare dublă
- Cascadă pe toate datele asociate

## 📊 State Management

### Hook personalizat: useAccount

```typescript
const {
  // Data
  orders,
  projects,
  addresses,
  profile,
  loading,
  error,

  // Actions
  fetchOrders,
  fetchOrder,
  fetchProjects,
  deleteProject,
  duplicateProject,
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = useAccount();
```

### Data Flow

1. **Initial Load**: useEffect fetchează toate datele
2. **User Action**: Apel funcție din hook
3. **API Call**: Fetch cu validare sesiune
4. **Update State**: Re-fetch sau update local
5. **UI Update**: React re-render

## 🗄️ Database Schema

### User Model Extensions

```prisma
model User {
  // ... existing fields
  phone         String?
  company       String?
  cui           String?
  addresses     Address[]
}
```

### Address Model

```prisma
model Address {
  id         String   @id @default(cuid())
  userId     String
  name       String
  phone      String
  address    String
  city       String
  country    String   @default("Moldova")
  postalCode String?
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### EditorProject Model Updates

```prisma
model EditorProject {
  id        String   @id @default(cuid())
  name      String
  userId    String
  data      String   @db.Text  // JSON stringified project data
  thumbnail String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

## 🧪 Testare

### Script de testare

```bash
./scripts/test-dashboard.sh
```

### Manual Testing Checklist

**Dashboard principal**
- [ ] Quick links funcționează
- [ ] Mesaj welcome cu numele utilizatorului
- [ ] Layout responsive

**Comenzi**
- [ ] Lista se încarcă corect
- [ ] Filtrare după status
- [ ] Detalii comandă afișate complet
- [ ] Status badges colorate corect
- [ ] Tracking info vizibil

**Proiecte**
- [ ] Lista proiectelor se încarcă
- [ ] Thumbnail-uri afișate
- [ ] Editare proiect → redirect la editor
- [ ] Duplicare proiect funcționează
- [ ] Ștergere cu confirmare

**Adrese**
- [ ] Listă adrese
- [ ] Adăugare adresă nouă
- [ ] Editare adresă existentă
- [ ] Ștergere cu confirmare
- [ ] Setare adresă implicită
- [ ] Badge "Implicită" vizibil

**Profil**
- [ ] Date pre-populate din DB
- [ ] Update funcționează
- [ ] Mesaj success
- [ ] Validare câmpuri obligatorii

**Setări**
- [ ] Schimbare parolă cu validare
- [ ] Ștergere cont cu confirmare dublă
- [ ] Preferințe notificări (UI placeholder)

**Sidebar**
- [ ] Desktop: vizibil permanent
- [ ] Mobile: slide-in cu overlay
- [ ] Highlight secțiune activă
- [ ] Logout funcționează

## 🚀 Deploy Checklist

### Pre-deployment

- [ ] Migrare Prisma rulată: `npx prisma migrate deploy`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] Build successful: `npm run build`

### Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
```

### Post-deployment

- [ ] Test autentificare
- [ ] Test toate paginile dashboard
- [ ] Test responsive pe mobile
- [ ] Verifică performanță (< 3s load time)
- [ ] Test toate API endpoints

## 🎯 Best Practices

### Performance

1. **Server Components**: Folosite pentru layout și pagini statice
2. **Client Components**: Doar pentru interactivitate
3. **Data Fetching**: Paralel când este posibil
4. **Images**: Optimizate, lazy loaded
5. **Code Splitting**: Automatic prin Next.js

### Accessibility

1. **Semantic HTML**: header, nav, main, section
2. **ARIA Labels**: pe butoane icon-only
3. **Keyboard Navigation**: tab order logic
4. **Color Contrast**: WCAG AA compliance
5. **Focus States**: vizibile pe toate elementele

### Code Quality

1. **TypeScript**: Strict mode, no any
2. **Component Structure**: Un job per component
3. **Error Handling**: Try-catch pe toate API calls
4. **Loading States**: Spinner/skeleton pentru UX
5. **Success Messages**: Feedback vizual pentru actions

## 📚 Resurse

### Documentație

- [Next.js App Router](https://nextjs.org/docs/app)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)

### Componente similare

- [src/app/admin](../src/app/admin) - Dashboard admin (referință)
- [src/components/layout](../src/components/layout) - Layout components

## 🐛 Troubleshooting

### Eroare: "Unauthorized"

**Cauză**: Sesiune expirată sau invalidă
**Soluție**: Re-login în aplicație

### Eroare: "User not found"

**Cauză**: Inconsistență în baza de date
**Soluție**: Verifică că user-ul există în DB

### Sidebar nu apare pe mobile

**Cauză**: JavaScript nu se încarcă sau state management issue
**Soluție**: Verifică console pentru erori

### Datele nu se actualizează

**Cauză**: Fetch nu se re-trigger
**Soluție**: Verifică dependency arrays în useEffect

### Schema Prisma out of sync

**Cauză**: Migrare nu a fost rulată
**Soluție**: `npx prisma migrate dev`

## 🔄 Actualizări viitoare

### Phase 1 (Current) ✅
- [x] Dashboard principal
- [x] Comenzi și detalii
- [x] Proiecte
- [x] Adrese
- [x] Profil
- [x] Setări cont

### Phase 2 (Next)
- [ ] Notificări real-time
- [ ] Istoric activitate
- [ ] Wishlist / Favorite
- [ ] Review system pentru comenzi
- [ ] Export comandă ca PDF
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] Dashboard analytics pentru user
- [ ] Puncte fidelitate / Rewards
- [ ] Social features (share projects)
- [ ] Advanced search & filters
- [ ] Dark mode
- [ ] PWA support

## 📞 Support

Pentru probleme sau întrebări despre dashboard:

1. **Verifică documentația**: docs/DASHBOARD_USER.md
2. **Rulează testele**: `./scripts/test-dashboard.sh`
3. **Check logs**: Console browser și server logs
4. **Contact**: development team

---

**Creat**: 2026-01-04
**Ultima actualizare**: 2026-01-04
**Versiune**: 1.0.0
