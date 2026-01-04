# Customers API Documentation

API-uri complete pentru gestionarea clienților cu funcționalități CRM (note, tag-uri, statistici).

## Autentificare

Toate endpoint-urile necesită autentificare și rol de `ADMIN` sau `MANAGER`.

## Endpoint-uri

### 1. GET /api/admin/customers
Lista tuturor clienților cu paginare, căutare și filtrare.

**Query Parameters:**
- `page` (number, default: 1): Numărul paginii
- `limit` (number, default: 20): Număr de rezultate per pagină
- `search` (string): Căutare după nume sau email
- `sortBy` (string): Câmp pentru sortare (name, email, createdAt)
- `sortOrder` (string): Ordinea sortării (asc, desc)

**Response:**
```json
{
  "customers": [
    {
      "id": 1,
      "name": "Ion Popescu",
      "email": "ion@example.com",
      "phone": "+40721234567",
      "company": "SC Example SRL",
      "address": "Str. Principală 123",
      "city": "București",
      "country": "România",
      "createdAt": "2024-01-04T10:00:00.000Z",
      "updatedAt": "2024-01-04T10:00:00.000Z",
      "_count": {
        "orders": 5,
        "notes": 2,
        "tags": 3
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### 2. POST /api/admin/customers
Creează un client nou.

**Request Body:**
```json
{
  "name": "Maria Ionescu",
  "email": "maria@example.com",
  "phone": "+40731234567",
  "company": "SC Nou SRL",
  "address": "Str. Secundară 45",
  "city": "Cluj-Napoca",
  "country": "România"
}
```

**Validări:**
- `name` (required): Numele clientului
- `email` (optional): Format valid, unic în sistem
- `phone` (optional): Număr de telefon
- `company`, `address`, `city`, `country` (optional)

**Response:** (201 Created)
```json
{
  "id": 2,
  "name": "Maria Ionescu",
  "email": "maria@example.com",
  "phone": "+40731234567",
  "company": "SC Nou SRL",
  "address": "Str. Secundară 45",
  "city": "Cluj-Napoca",
  "country": "România",
  "createdAt": "2024-01-04T11:00:00.000Z",
  "updatedAt": "2024-01-04T11:00:00.000Z"
}
```

**Erori:**
- 400: "Name is required"
- 400: "Invalid email format"
- 409: "Customer with this email already exists"

### 3. GET /api/admin/customers/[id]
Obține detalii complete despre un client, inclusiv statistici.

**Response:**
```json
{
  "id": 1,
  "name": "Ion Popescu",
  "email": "ion@example.com",
  "phone": "+40721234567",
  "company": "SC Example SRL",
  "address": "Str. Principală 123",
  "city": "București",
  "country": "România",
  "createdAt": "2024-01-04T10:00:00.000Z",
  "updatedAt": "2024-01-04T10:00:00.000Z",
  "notes": [
    {
      "id": 1,
      "content": "Client important, preferă livrare rapidă",
      "createdAt": "2024-01-04T10:30:00.000Z",
      "createdBy": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "tags": [
    {
      "id": 1,
      "label": "VIP",
      "color": "#FF0000"
    },
    {
      "id": 2,
      "label": "B2B",
      "color": "#0000FF"
    }
  ],
  "orders": [
    {
      "id": 101,
      "status": "COMPLETED",
      "total": 299.99,
      "createdAt": "2024-01-01T09:00:00.000Z"
    }
  ],
  "statistics": {
    "totalOrders": 5,
    "totalSpent": 1249.95,
    "lastOrderDate": "2024-01-03T14:00:00.000Z"
  }
}
```

**Statistici calculate:**
- `totalOrders`: Numărul total de comenzi
- `totalSpent`: Suma totală cheltuită (RON)
- `lastOrderDate`: Data ultimei comenzi

**Erori:**
- 404: "Customer not found"

### 4. PATCH /api/admin/customers/[id]
Actualizează datele unui client.

**Request Body** (toate câmpurile sunt opționale):
```json
{
  "name": "Ion Popescu Updated",
  "email": "ion.new@example.com",
  "phone": "+40721234999",
  "company": "SC Updated SRL",
  "address": "Str. Nouă 100",
  "city": "Iași",
  "country": "România"
}
```

**Response:** (200 OK)
```json
{
  "id": 1,
  "name": "Ion Popescu Updated",
  "email": "ion.new@example.com",
  // ... restul câmpurilor actualizate
}
```

**Validări:**
- Email trebuie să fie unic (dacă se schimbă)
- Format email valid

**Erori:**
- 404: "Customer not found"
- 400: "Invalid email format"
- 409: "Customer with this email already exists"

### 5. DELETE /api/admin/customers/[id]
Șterge un client (doar dacă nu are comenzi).

**Response:** (200 OK)
```json
{
  "message": "Customer deleted successfully"
}
```

**Protecție:**
- Clienții cu comenzi **NU pot fi șterși**
- Returnează eroare 400 cu detalii

**Erori:**
- 404: "Customer not found"
- 400: "Cannot delete customer with existing orders. Customer has X order(s)."

### 6. POST /api/admin/customers/[id]/notes
Adaugă o notă pentru un client.

**Request Body:**
```json
{
  "content": "Client a solicitat discount pentru comenzi mari"
}
```

**Response:** (201 Created)
```json
{
  "id": 3,
  "customerId": 1,
  "content": "Client a solicitat discount pentru comenzi mari",
  "createdById": 1,
  "createdAt": "2024-01-04T12:00:00.000Z"
}
```

**Note:**
- `createdById` este automat setat la utilizatorul curent
- Notele apar în ordine cronologică inversă (cele mai noi primele)

**Validări:**
- `content` (required): Textul notei

**Erori:**
- 404: "Customer not found"
- 400: "Content is required"

### 7. DELETE /api/admin/customers/[id]/notes/[noteId]
Șterge o notă a unui client.

**Response:** (200 OK)
```json
{
  "message": "Note deleted successfully"
}
```

**Validări:**
- Verifică că nota aparține clientului specificat

**Erori:**
- 404: "Customer not found"
- 404: "Note not found for this customer"

### 8. POST /api/admin/customers/[id]/tags
Adaugă un tag pentru un client.

**Request Body:**
```json
{
  "label": "Premium",
  "color": "#FFD700"
}
```

**Response:** (201 Created)
```json
{
  "id": 4,
  "customerId": 1,
  "label": "Premium",
  "color": "#FFD700"
}
```

**Validări:**
- `label` (required): Textul tag-ului
- `color` (optional): Codul hex al culorii (default: #808080)

**Erori:**
- 404: "Customer not found"
- 400: "Label is required"

### 9. DELETE /api/admin/customers/[id]/tags/[tagId]
Șterge un tag al unui client.

**Response:** (200 OK)
```json
{
  "message": "Tag deleted successfully"
}
```

**Validări:**
- Verifică că tag-ul aparține clientului specificat

**Erori:**
- 404: "Customer not found"
- 404: "Tag not found for this customer"

## Exemple de Utilizare

### Căutare clienți
```bash
# Căutare după nume sau email
curl -X GET "http://localhost:3000/api/admin/customers?search=popescu" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Paginare
curl -X GET "http://localhost:3000/api/admin/customers?page=2&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Sortare
curl -X GET "http://localhost:3000/api/admin/customers?sortBy=createdAt&sortOrder=desc" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Crearea unui client
```bash
curl -X POST "http://localhost:3000/api/admin/customers" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+40721234567"
  }'
```

### Adăugare notă
```bash
curl -X POST "http://localhost:3000/api/admin/customers/1/notes" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "content": "Client preferă livrare prin curier privat"
  }'
```

### Adăugare tag
```bash
curl -X POST "http://localhost:3000/api/admin/customers/1/tags" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "label": "VIP",
    "color": "#FF0000"
  }'
```

## Cod HTTP Status

- **200**: Success (GET, PATCH, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validare eșuată)
- **401**: Unauthorized (lipsă autentificare sau rol insuficient)
- **404**: Not Found (resursă inexistentă)
- **409**: Conflict (email duplicat)
- **500**: Internal Server Error

## Rate Limiting

În producție, se recomandă implementarea rate limiting:
- 100 requests/minut per IP pentru GET
- 20 requests/minut per IP pentru POST/PATCH/DELETE

## Securitate

- Toate endpoint-urile verifică rolul utilizatorului (ADMIN/MANAGER)
- Email-urile sunt validate pentru format și unicitate
- Ștergerea clienților cu comenzi este blocată
- Notele și tag-urile sunt legate de clientul corect

## Performanță

- Căutarea folosește indecși pe câmpurile `name` și `email`
- Statisticile sunt calculate on-demand (consider caching pentru volume mari)
- Paginarea default: 20 rezultate per pagină
