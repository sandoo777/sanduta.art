# Materials & Inventory Backend - Documentation

## Implementare Completă

Backend-ul pentru modulul Materials & Inventory a fost implementat complet cu următoarele componente:

## 1. Modele Prisma

### Material Model
```prisma
model Material {
  id          String          @id @default(cuid())
  name        String
  sku         String?         @unique
  unit        String          // ex: "kg", "m2", "ml", "pcs"
  stock       Float           @default(0)
  minStock    Float           @default(0)   // alert threshold
  costPerUnit Decimal         @default(0) @db.Decimal(10, 2)
  notes       String?         @db.Text
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  consumption MaterialUsage[]
  @@map("materials")
}
```

### MaterialUsage Model
```prisma
model MaterialUsage {
  id         String        @id @default(cuid())
  materialId String
  jobId      String
  quantity   Float
  createdAt  DateTime      @default(now())
  material   Material      @relation(fields: [materialId], references: [id], onDelete: Cascade)
  job        ProductionJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  @@map("material_usages")
}
```

### Migrare
Migrarea a fost creată și aplicată cu succes:
- `20260104170255_add_materials_inventory_models`

## 2. API Routes

### GET /api/admin/materials
**Descriere:** Lista toate materialele cu indicatori low stock și consum total

**Autorizare:** ADMIN sau MANAGER

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "sku": "string | null",
    "unit": "string",
    "stock": 100,
    "minStock": 20,
    "costPerUnit": 15.50,
    "notes": "string | null",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "lowStock": false,
    "totalConsumption": 50
  }
]
```

### POST /api/admin/materials
**Descriere:** Crează un material nou

**Autorizare:** ADMIN sau MANAGER

**Body:**
```json
{
  "name": "string (required)",
  "sku": "string (optional, unique)",
  "unit": "string (required)",
  "stock": 0,
  "minStock": 0,
  "costPerUnit": 0,
  "notes": "string (optional)"
}
```

**Validări:**
- `name` - obligatoriu, non-empty string
- `unit` - obligatoriu, non-empty string
- `stock` - număr >= 0
- `minStock` - număr >= 0
- `costPerUnit` - număr >= 0
- `sku` - unic (dacă există)

**Response:** Material creat (status 201)

### GET /api/admin/materials/[id]
**Descriere:** Obține un material cu istoricul de consum

**Autorizare:** ADMIN sau MANAGER

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "sku": "string | null",
  "unit": "string",
  "stock": 100,
  "minStock": 20,
  "costPerUnit": 15.50,
  "notes": "string | null",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "consumption": [
    {
      "id": "string",
      "quantity": 10,
      "createdAt": "datetime",
      "job": {
        "id": "string",
        "name": "string",
        "status": "string",
        "order": {
          "id": "string",
          "customerName": "string",
          "customerEmail": "string"
        }
      }
    }
  ]
}
```

### PATCH /api/admin/materials/[id]
**Descriere:** Actualizează un material

**Autorizare:** ADMIN sau MANAGER

**Body:** Orice câmp din:
```json
{
  "name": "string",
  "sku": "string",
  "unit": "string",
  "stock": 150,
  "minStock": 30,
  "costPerUnit": 20,
  "notes": "string"
}
```

**Validări:**
- Același set de validări ca la CREATE
- Verifică unicitatea SKU dacă se schimbă

**Response:** Material actualizat

### DELETE /api/admin/materials/[id]
**Descriere:** Șterge un material (doar dacă nu are consum)

**Autorizare:** ADMIN sau MANAGER

**Business Rule:** Nu permite ștergerea dacă există înregistrări MaterialUsage asociate

**Response (success):**
```json
{
  "success": true,
  "message": "Materialul a fost șters cu succes"
}
```

**Response (error - has consumption):**
```json
{
  "error": "Nu se poate șterge materialul deoarece are consum asociat",
  "consumptionCount": 5
}
```

### POST /api/admin/materials/[id]/consume
**Descriere:** Consumă material pentru un job de producție

**Autorizare:** ADMIN sau MANAGER

**Body:**
```json
{
  "jobId": "string (required)",
  "quantity": 25 (required, > 0)
}
```

**Validări:**
- `jobId` - valid și există în baza de date
- `quantity` - număr > 0
- `material.stock >= quantity` - stoc suficient

**Logică:**
1. Verifică dacă materialul și job-ul există
2. Verifică dacă există stoc suficient
3. Creează MaterialUsage record
4. Scade stocul material
5. Verifică dacă stocul a scăzut sub pragul minim

**Response (success):**
```json
{
  "success": true,
  "materialUsage": {
    "id": "string",
    "materialId": "string",
    "jobId": "string",
    "quantity": 25,
    "createdAt": "datetime"
  },
  "material": {
    "id": "string",
    "stock": 75,
    "minStock": 20,
    ...
  },
  "warning": {
    "message": "Atenție: Stocul este sub pragul minim!",
    "currentStock": 15,
    "minStock": 20
  } | null
}
```

**Response (error - insufficient stock):**
```json
{
  "error": "Stoc insuficient",
  "available": 10,
  "requested": 25
}
```

## 3. Protecție Acces

Toate rutele sunt protejate și verifică:
1. Utilizator autentificat (session)
2. Rol: `ADMIN` sau `MANAGER`

Răspuns pentru acces neautorizat:
```json
{
  "error": "Acces interzis"
}
```
Status: 403 Forbidden

## 4. Tranzacții Database

### Consum Material (Transaction)
Operațiunea de consum folosește o tranzacție Prisma pentru a asigura consistența datelor:

```typescript
const [materialUsage, updatedMaterial] = await prisma.$transaction([
  prisma.materialUsage.create({
    data: { materialId, jobId, quantity }
  }),
  prisma.material.update({
    where: { id: materialId },
    data: { stock: newStock }
  })
]);
```

Dacă oricare din operații eșuează, întreaga tranzacție este anulată (rollback).

## 5. Teste Implementate

Fișier: `src/__tests__/materials.test.ts`

### Test 1: Create Material
- ✅ Creează material cu succes
- ✅ Verifică SKU unic

### Test 2: Update Material
- ✅ Actualizează câmpuri
- ✅ Actualizează SKU dacă unic

### Test 3: Delete Material
- ✅ Nu permite ștergere cu consum
- ✅ Permite ștergere fără consum

### Test 4: Consume Material
- ✅ Scade stocul corect
- ✅ Creează MaterialUsage
- ✅ Returnează warning dacă stock < minStock
- ✅ Validează stoc suficient

### Test 5: Get Material
- ✅ Include consum + job info
- ✅ Ordonează consum descrescător

### Test 6: List Materials
- ✅ Include lowStock indicator
- ✅ Calculează totalConsumption
- ✅ Identifică materiale cu stoc scăzut

### Test 7: Validations
- ✅ Validează câmpuri obligatorii
- ✅ Validează valori numerice pozitive
- ✅ Tranzacții funcționează corect

## 6. Exemple de Utilizare

### Creare Material
```bash
curl -X POST http://localhost:3000/api/admin/materials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Folie PVC",
    "sku": "PVC-001",
    "unit": "m2",
    "stock": 500,
    "minStock": 50,
    "costPerUnit": 12.50,
    "notes": "Folie transparentă pentru print"
  }'
```

### Listare Materiale
```bash
curl http://localhost:3000/api/admin/materials
```

### Actualizare Stoc
```bash
curl -X PATCH http://localhost:3000/api/admin/materials/[id] \
  -H "Content-Type: application/json" \
  -d '{"stock": 600}'
```

### Consum Material
```bash
curl -X POST http://localhost:3000/api/admin/materials/[id]/consume \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-123",
    "quantity": 25
  }'
```

## 7. Integrare cu Production Jobs

Modelul `ProductionJob` a fost actualizat pentru a include relația cu MaterialUsage:

```prisma
model ProductionJob {
  ...
  materialUsages  MaterialUsage[]
  ...
}
```

Când un job de producție consumă materiale:
1. Se creează un MaterialUsage record
2. Se leagă de job prin `jobId`
3. Stocul materialului se actualizează automat
4. Istoricul de consum este accesibil prin job

## 8. Alerte Low Stock

Sistemul identifică automat materiale cu stoc scăzut:

**Indicator lowStock:**
```typescript
lowStock = material.stock < material.minStock
```

**Warning la consum:**
Dacă după consum stocul scade sub `minStock`, API-ul returnează un warning:
```json
{
  "warning": {
    "message": "Atenție: Stocul este sub pragul minim!",
    "currentStock": 15,
    "minStock": 20
  }
}
```

## 9. Status Implementare

| Componenta | Status |
|-----------|--------|
| Modele Prisma | ✅ Implementat |
| Migrare DB | ✅ Aplicat |
| API CRUD | ✅ Implementat |
| Consum Material | ✅ Implementat |
| Alerte Low Stock | ✅ Implementat |
| Integrare Production | ✅ Implementat |
| Protecție Acces | ✅ Implementat |
| Validări | ✅ Implementat |
| Tranzacții | ✅ Implementat |
| Teste | ✅ Implementat |

## 10. Next Steps (UI - TASK 9.2)

Backend-ul este complet și pregătit pentru:
- UI pentru Materials List
- UI pentru Create/Edit Material
- UI pentru Material Details cu consum
- UI pentru Consume Material în Production Jobs
- Dashboard cu alerte low stock
- Rapoarte consum material

## Fișiere Create/Modificate

1. **prisma/schema.prisma** - Modele Material și MaterialUsage
2. **prisma/migrations/20260104170255_add_materials_inventory_models/** - Migrare DB
3. **src/app/api/admin/materials/route.ts** - GET și POST pentru liste
4. **src/app/api/admin/materials/[id]/route.ts** - GET, PATCH, DELETE pentru material individual
5. **src/app/api/admin/materials/[id]/consume/route.ts** - POST pentru consum
6. **src/__tests__/materials.test.ts** - Teste unitare complete
7. **scripts/test-materials.ts** - Script de testare manuală
8. **docs/MATERIALS_BACKEND.md** - Această documentație

## Concluzie

✅ Backend-ul Materials & Inventory este **complet implementat** și funcțional:
- Toate operațiile CRUD funcționează
- Logica de consum cu tranzacții
- Alerte low stock
- Integrare cu Production Jobs
- Validări complete
- Protecție acces ADMIN/MANAGER
- Teste comprehensive

Sistemul este pregătit pentru UI development (TASK 9.2).
