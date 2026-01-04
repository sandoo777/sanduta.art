# Pagina de Detalii Comandă - Documentație Completă

## Prezentare Generală

Pagina de detalii comandă oferă o vizualizare completă și intuitivă a tuturor informațiilor relevante despre o comandă plasată de utilizator.

## Structură Fișiere

```
src/
├── app/(account)/dashboard/orders/[orderId]/
│   └── page.tsx                                 # Pagină principală detalii comandă
├── components/account/
│   ├── OrderStatusBar.tsx                       # Bară progres status comandă
│   ├── OrderTimeline.tsx                        # Timeline evenimente comandă
│   ├── OrderProducts.tsx                        # Listă produse din comandă
│   ├── OrderFiles.tsx                           # Listă fișiere atașate
│   ├── OrderDelivery.tsx                        # Informații livrare
│   ├── OrderPayment.tsx                         # Informații plată
│   ├── OrderAddress.tsx                         # Date client
│   └── OrderHistory.tsx                         # Istoric modificări
├── modules/account/
│   └── useOrderDetails.ts                       # Hook pentru state management
└── app/api/account/orders/[orderId]/
    └── details/route.ts                         # API endpoint detalii extinse
```

## Componente

### 1. OrderStatusBar
**Scop**: Vizualizare progres comandă printr-o bară de status interactivă.

**Features**:
- 5 etape de status: PENDING → IN_DESIGN → IN_PRODUCTION → READY_FOR_DELIVERY → DELIVERED
- Linie de progres animată
- Iconuri și label-uri pentru fiecare etapă
- Highlighting pentru status-ul curent
- Responsive design

**Props**:
```typescript
{
  currentStatus: string; // Status actual comandă
}
```

### 2. OrderTimeline
**Scop**: Afișare cronologică a evenimentelor importante din ciclul de viață al comenzii.

**Features**:
- Listă verticală de evenimente cu iconuri color-coded
- Tipuri de evenimente: success (verde), info (albastru), warning (galben)
- Timestamps formatate în română
- Descrieri detaliate pentru fiecare eveniment

**Props**:
```typescript
{
  events: TimelineEvent[];
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: "success" | "info" | "warning";
}
```

### 3. OrderProducts
**Scop**: Listare detaliată a produselor din comandă cu specificații și opțiune de recomandare.

**Features**:
- Card-uri produse cu imagini
- Specificații tehnice (dimensiuni, material, finisaje)
- Prețuri per unitate și total per linie
- Buton "Recomandă produs" pentru reordering
- Total comandă în footer

**Props**:
```typescript
{
  items: OrderItem[];
  currency: string;
  totalPrice: number;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  thumbnail?: string;
  specifications?: {
    dimension?: string;
    material?: string;
    finishes?: string[];
    productionTime?: string;
  };
}
```

### 4. OrderFiles
**Scop**: Gestionarea fișierelor atașate comenzii (uploads și fișiere din editor).

**Features**:
- Preview thumbnail-uri pentru fișiere imagine
- Badges de validare (OK/Warning/Error)
- Butoane de download
- Tipuri de fișiere: upload sau editor
- Dimensiune fișier afișată

**Props**:
```typescript
{
  files: OrderFile[];
}

interface OrderFile {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  type: "upload" | "editor";
  size?: string;
  validation?: "ok" | "warning" | "error";
  validationMessage?: string;
}
```

### 5. OrderDelivery
**Scop**: Informații despre livrare și tracking colet.

**Features**:
- Metodă de livrare afișată
- Status livrare cu badges color-coded
- Număr AWB cu link de tracking
- Estimare timp livrare
- Adresă completă de livrare

**Props**:
```typescript
{
  deliveryMethod?: string;
  deliveryStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  address?: string;
}
```

### 6. OrderPayment
**Scop**: Detalii despre plată și facturare.

**Features**:
- Status plată cu iconuri și badges (PENDING/PAID/FAILED/REFUNDED)
- Metodă de plată (Card/Cash/Transfer)
- Total plătit afișat prominent
- ID tranzacție
- Buton descărcare factură (pentru comenzi plătite)

**Props**:
```typescript
{
  paymentStatus: string;
  paymentMethod?: string;
  totalPrice: number;
  currency: string;
  transactionId?: string;
  orderId: string;
}
```

### 7. OrderAddress
**Scop**: Informații de contact și adresă client.

**Features**:
- Nume client cu icon
- Email clickable (mailto:)
- Telefon clickable (tel:)
- Adresă completă cu oraș
- Date companie (nume și CUI) dacă există

**Props**:
```typescript
{
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  company?: string;
  cui?: string;
}
```

### 8. OrderHistory
**Scop**: Audit trail complet al modificărilor comenzii.

**Features**:
- Listă evenimente cu user attribution
- Tipuri de utilizatori: admin, system, user
- Timestamps formatate
- Detalii adiționale pentru fiecare modificare
- Iconuri distinctive pentru fiecare tip de user

**Props**:
```typescript
{
  events: HistoryEvent[];
}

interface HistoryEvent {
  id: string;
  action: string;
  user: string;
  userType: "admin" | "system" | "user";
  timestamp: string;
  details?: string;
}
```

## State Management Hook

### useOrderDetails()

**Funcții**:

1. **fetchOrder(orderId)**: Fetch detalii complete comandă de la API
2. **getTrackingLink(trackingNumber, courier)**: Generează link tracking pentru curier
3. **generateTimeline(orderData)**: Creează timeline evenimente din date comandă
4. **generateHistory(orderData)**: Creează istoric modificări din date comandă

**State**:
```typescript
{
  order: OrderDetails | null;
  loading: boolean;
  error: string | null;
}
```

**Returnat**:
```typescript
{
  order,
  loading,
  error,
  fetchOrder,
  getTrackingLink,
  generateTimeline,
  generateHistory,
}
```

## API Endpoint

### GET /api/account/orders/[orderId]/details

**Autentificare**: Necesită sesiune NextAuth validă

**Răspuns**:
```typescript
{
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryStatus: string;
  deliveryMethod?: string;
  trackingNumber?: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  company?: string;
  cui?: string;
  
  // Delivery
  deliveryAddress?: string;
  city?: string;
  
  // Items
  items: OrderItem[];
  
  // Files
  files: OrderFile[];
  
  // Timeline
  timeline: TimelineEvent[];
  
  // History
  history: HistoryEvent[];
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `404`: Order not found
- `500`: Server error

## Layout Pagină

```
┌─────────────────────────────────────────────────────────────┐
│ [← Înapoi] Comandă #ABC123                                  │
│ Plasată pe 15 decembrie 2024, 14:30                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [Status Progress Bar: 5 steps]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────────────┐
│ MAIN CONTENT (2/3)      │ SIDEBAR (1/3)                   │
│                         │                                 │
│ ┌─────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ Products            │ │ │ Payment                     │ │
│ └─────────────────────┘ │ └─────────────────────────────┘ │
│                         │                                 │
│ ┌─────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ Files               │ │ │ Delivery                    │ │
│ └─────────────────────┘ │ └─────────────────────────────┘ │
│                         │                                 │
│ ┌─────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ Timeline            │ │ │ Customer Address            │ │
│ └─────────────────────┘ │ └─────────────────────────────┘ │
│                         │                                 │
│ ┌─────────────────────┐ │                                 │
│ │ History             │ │                                 │
│ └─────────────────────┘ │                                 │
└─────────────────────────┴─────────────────────────────────┘
```

## Routing

- **URL**: `/dashboard/orders/[orderId]`
- **Parametru dinamic**: `orderId` (CUID din baza de date)
- **Navigare înapoi**: Link către `/dashboard/orders`

## Flow de Date

1. Utilizator accesează pagină → useEffect trigger
2. Hook fetchOrder() → API call la `/api/account/orders/[orderId]/details`
3. API verifică autentificare → fetch date din Prisma
4. API generează timeline și history
5. API returnează OrderDetails complet
6. Hook actualizează state
7. Componentele primesc date via props
8. UI se renderizează cu toate detaliile

## Securitate

- Toate request-urile necesită sesiune NextAuth validă
- API verifică ownership-ul comenzii (userId === order.userId)
- Tracking links generate server-side pentru a preveni manipularea
- Fișiere servite prin rute protejate

## Testare

### Test Manual

```bash
# Accesează pagină detalii comandă
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/dashboard/orders/clx123abc456

# Test API endpoint
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/account/orders/clx123abc456/details
```

### Test Scenarii

1. ✅ Comandă existentă cu toate datele
2. ✅ Comandă fără fișiere atașate
3. ✅ Comandă fără tracking number
4. ✅ Comandă anulată
5. ✅ Comandă livrată cu factură
6. ✅ Acces neautorizat (401)
7. ✅ Comandă inexistentă (404)

## Extensii Viitoare

- [ ] Real-time updates cu WebSocket/SSE
- [ ] Notificări push pentru status changes
- [ ] Chat cu support pentru comenzi
- [ ] Export PDF al detaliilor comenzii
- [ ] Galerie foto produse finite
- [ ] Rating și review după livrare
- [ ] Tracking live pe hartă
- [ ] Scanare AWB cu QR code

## Performance

- Lazy loading pentru imagini produse
- Pagination pentru istoric (dacă > 20 evenimente)
- Caching API response cu SWR/React Query
- Optimistic UI pentru reorder action

## Accessibility

- Toate iconurile au aria-label
- Color contrast WCAG AA compliant
- Keyboard navigation support
- Screen reader friendly timestamps
- Focus indicators vizibili

## Styling

- **Framework**: Tailwind CSS
- **Palette principale**:
  - Primary: #0066FF (blue)
  - Success: green-600
  - Warning: yellow-600
  - Error: red-600
- **Icons**: Heroicons v2 (outline + solid)
- **Fonts**: System font stack
- **Responsive**: Mobile-first, breakpoints la `lg` (1024px)

---

**Creat**: 4 ianuarie 2025  
**Autor**: GitHub Copilot  
**Versiune**: 1.0
