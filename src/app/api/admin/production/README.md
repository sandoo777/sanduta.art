# Production Workflow API Documentation

API complet pentru gestionarea job-urilor de producție legate de comenzi.

## Autentificare

Toate endpoint-urile necesită autentificare și unul din rolurile: `ADMIN`, `MANAGER`, `OPERATOR`.

## Modele de Date

### ProductionJob
```typescript
{
  id: string;              // CUID
  orderId: string;         // Reference to Order
  name: string;            // Job name/description
  status: ProductionStatus;
  priority: ProductionPriority;
  assignedToId?: string;   // User ID (MANAGER/OPERATOR)
  startedAt?: Date;        // Auto-set when status → IN_PROGRESS
  completedAt?: Date;      // Auto-set when status → COMPLETED
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enums

**ProductionStatus:**
- `PENDING` - Job creat, nu a început
- `IN_PROGRESS` - Job în lucru
- `ON_HOLD` - Job suspendat temporar
- `COMPLETED` - Job finalizat
- `CANCELED` - Job anulat

**ProductionPriority:**
- `LOW` - Prioritate scăzută
- `NORMAL` - Prioritate normală (default)
- `HIGH` - Prioritate ridicată
- `URGENT` - Urgent

## Endpoint-uri

### 1. GET /api/admin/production
Lista tuturor job-urilor de producție cu filtrare.

**Query Parameters:**
- `status` (string, optional): Filtrare după status
- `priority` (string, optional): Filtrare după prioritate
- `assignedToId` (string, optional): Filtrare după operator asignat
- `orderId` (string, optional): Filtrare după comandă

**Response:** (200 OK)
```json
{
  "jobs": [
    {
      "id": "cljk1234567890",
      "orderId": "order123",
      "name": "Printare 100 bannere",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assignedToId": "user123",
      "startedAt": "2024-01-04T10:00:00.000Z",
      "completedAt": null,
      "dueDate": "2024-01-10T23:59:59.000Z",
      "notes": "Client solicită verificare culori",
      "createdAt": "2024-01-04T09:00:00.000Z",
      "updatedAt": "2024-01-04T10:00:00.000Z",
      "order": {
        "id": "order123",
        "customerName": "Ion Popescu",
        "totalPrice": 2500.00,
        "status": "IN_PRODUCTION"
      },
      "assignedTo": {
        "id": "user123",
        "name": "Maria Operator",
        "email": "maria@example.com"
      }
    }
  ]
}
```

**Sortare:**
- Prioritate (descendent) → HIGH și URGENT apar primele
- Data creării (descendent) → Cele mai noi primele

### 2. POST /api/admin/production
Creează un job de producție nou.

**Request Body:**
```json
{
  "orderId": "order123",           // Required
  "name": "Printare bannere",      // Required
  "priority": "HIGH",              // Optional: LOW|NORMAL|HIGH|URGENT
  "dueDate": "2024-01-10",         // Optional: ISO date string
  "notes": "Verifică culori",      // Optional
  "assignedToId": "user123"        // Optional: Must be MANAGER or OPERATOR
}
```

**Validări:**
- `orderId` - Required, order trebuie să existe
- `name` - Required, non-empty
- `priority` - Optional, default: NORMAL
- `assignedToId` - Optional, user trebuie să existe și să aibă rol MANAGER sau OPERATOR

**Response:** (201 Created)
```json
{
  "id": "cljk1234567890",
  "orderId": "order123",
  "name": "Printare bannere",
  "status": "PENDING",
  "priority": "HIGH",
  "assignedToId": "user123",
  "startedAt": null,
  "completedAt": null,
  "dueDate": "2024-01-10T00:00:00.000Z",
  "notes": "Verifică culori",
  "createdAt": "2024-01-04T10:00:00.000Z",
  "updatedAt": "2024-01-04T10:00:00.000Z",
  "order": {
    "id": "order123",
    "customerName": "Ion Popescu",
    "totalPrice": 2500.00,
    "status": "PENDING"
  },
  "assignedTo": {
    "id": "user123",
    "name": "Maria Operator",
    "email": "maria@example.com"
  }
}
```

**Erori:**
- 400: "Order ID is required"
- 400: "Name is required"
- 404: "Order not found"
- 404: "Assigned user not found"
- 400: "Assigned user must be MANAGER or OPERATOR"
- 400: "Invalid priority"

### 3. GET /api/admin/production/[id]
Obține detalii complete despre un job, inclusiv order cu items și customer.

**Response:** (200 OK)
```json
{
  "id": "cljk1234567890",
  "orderId": "order123",
  "name": "Printare bannere",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignedToId": "user123",
  "startedAt": "2024-01-04T10:00:00.000Z",
  "completedAt": null,
  "dueDate": "2024-01-10T00:00:00.000Z",
  "notes": "Verifică culori",
  "createdAt": "2024-01-04T09:00:00.000Z",
  "updatedAt": "2024-01-04T10:00:00.000Z",
  "order": {
    "id": "order123",
    "customerName": "Ion Popescu",
    "totalPrice": 2500.00,
    "status": "IN_PRODUCTION",
    "orderItems": [
      {
        "id": "item1",
        "quantity": 100,
        "unitPrice": 25.00,
        "lineTotal": 2500.00,
        "product": {
          "id": "prod1",
          "name": "Banner 2x1m",
          "price": 25.00
        }
      }
    ],
    "customer": {
      "id": "cust1",
      "name": "Ion Popescu",
      "email": "ion@example.com",
      "phone": "+40721234567"
    }
  },
  "assignedTo": {
    "id": "user123",
    "name": "Maria Operator",
    "email": "maria@example.com",
    "role": "OPERATOR"
  }
}
```

**Erori:**
- 404: "Production job not found"

### 4. PATCH /api/admin/production/[id]
Actualizează un job de producție.

**Request Body** (toate câmpurile sunt opționale):
```json
{
  "name": "Printare 150 bannere",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "dueDate": "2024-01-08",
  "notes": "Client solicită livrare rapidă",
  "assignedToId": "user456"
}
```

**Logică Automată pentru Status:**

1. **PENDING → IN_PROGRESS:**
   - Setează `startedAt = now()` (dacă nu e deja setat)

2. **Orice → COMPLETED:**
   - Setează `completedAt = now()` (dacă nu e deja setat)

3. **COMPLETED → Orice altceva:**
   - Resetează `completedAt = null`

**Validări:**
- `status` - Doar valorile din enum: PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELED
- `priority` - Doar valorile din enum: LOW, NORMAL, HIGH, URGENT
- `assignedToId` - User trebuie să existe și să aibă rol MANAGER sau OPERATOR

**Response:** (200 OK)
```json
{
  "id": "cljk1234567890",
  "orderId": "order123",
  "name": "Printare 150 bannere",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "assignedToId": "user456",
  "startedAt": "2024-01-04T10:15:00.000Z",
  "completedAt": null,
  "dueDate": "2024-01-08T00:00:00.000Z",
  "notes": "Client solicită livrare rapidă",
  "createdAt": "2024-01-04T09:00:00.000Z",
  "updatedAt": "2024-01-04T11:00:00.000Z",
  "order": {
    "id": "order123",
    "customerName": "Ion Popescu",
    "totalPrice": 2500.00,
    "status": "IN_PRODUCTION"
  },
  "assignedTo": {
    "id": "user456",
    "name": "Andrei Manager",
    "email": "andrei@example.com"
  }
}
```

**Erori:**
- 404: "Production job not found"
- 400: "Invalid status"
- 400: "Invalid priority"
- 404: "Assigned user not found"
- 400: "Assigned user must be MANAGER or OPERATOR"

### 5. DELETE /api/admin/production/[id]
Șterge un job de producție.

**Reguli de Ștergere:**
- ✅ Permis: status = `PENDING`, `ON_HOLD`, `CANCELED`
- ❌ Blocat: status = `IN_PROGRESS`, `COMPLETED`

**Response:** (200 OK)
```json
{
  "message": "Production job deleted successfully"
}
```

**Erori:**
- 404: "Production job not found"
- 400: "Cannot delete job with status IN_PROGRESS"
- 400: "Cannot delete job with status COMPLETED"

## Exemple de Utilizare

### Creare Job
```bash
curl -X POST "http://localhost:3000/api/admin/production" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "orderId": "clj123456",
    "name": "Printare 100 flyere A5",
    "priority": "HIGH",
    "dueDate": "2024-01-10",
    "assignedToId": "user123"
  }'
```

### Lista Joburi cu Filtre
```bash
# Toate joburile IN_PROGRESS
curl "http://localhost:3000/api/admin/production?status=IN_PROGRESS" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Joburi URGENT asignate unui operator
curl "http://localhost:3000/api/admin/production?priority=URGENT&assignedToId=user123" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Toate joburile pentru o comandă specifică
curl "http://localhost:3000/api/admin/production?orderId=order123" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Update Status cu Time Tracking
```bash
# Start job (setează startedAt automat)
curl -X PATCH "http://localhost:3000/api/admin/production/jobId123" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'

# Complete job (setează completedAt automat)
curl -X PATCH "http://localhost:3000/api/admin/production/jobId123" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Asignare Operator
```bash
curl -X PATCH "http://localhost:3000/api/admin/production/jobId123" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "assignedToId": "user456"
  }'
```

### Ștergere Job
```bash
curl -X DELETE "http://localhost:3000/api/admin/production/jobId123" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

## Workflow Tipic

### 1. Creare Job la Primirea Comenzii
```
POST /api/admin/production
{
  "orderId": "order123",
  "name": "Printare 100 bannere",
  "priority": "NORMAL",
  "dueDate": "2024-01-15"
}
Status: PENDING
```

### 2. Asignare Operator
```
PATCH /api/admin/production/job123
{
  "assignedToId": "operator1"
}
```

### 3. Start Producție
```
PATCH /api/admin/production/job123
{
  "status": "IN_PROGRESS"
}
→ startedAt se setează automat
```

### 4. Finalizare
```
PATCH /api/admin/production/job123
{
  "status": "COMPLETED"
}
→ completedAt se setează automat
```

### 5. Tracking Time
```
Duration = completedAt - startedAt
```

## Cod HTTP Status

- **200**: Success (GET, PATCH, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validare eșuată, reguli business)
- **401**: Unauthorized (lipsă autentificare sau rol insuficient)
- **404**: Not Found (job, order sau user inexistent)
- **500**: Internal Server Error

## Securitate

- Toate rutele verifică autentificare + rol (ADMIN/MANAGER/OPERATOR)
- Validare user role pentru asignare (doar MANAGER/OPERATOR)
- Protecție ștergere pentru joburi active (IN_PROGRESS/COMPLETED)
- Validare enum-uri pentru status și priority

## Best Practices

1. **Filtrare eficientă**: Folosește query params pentru filtre
2. **Time tracking automat**: Status transitions setează timestamps
3. **Protecție date**: Nu șterge joburi finalizate
4. **Prioritizare**: Lista sortează după prioritate
5. **Asignare validată**: Doar MANAGER/OPERATOR pot fi asignați

## Next Steps (UI Implementation)

Pentru UI, vezi [TASK 8.2] - Production Workflow Frontend cu:
- Lista joburi cu filtre
- Kanban board (status columns)
- Time tracking display
- Assign operator dropdown
- Status transitions buttons
