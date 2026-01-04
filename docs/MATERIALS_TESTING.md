# Materials & Inventory - Testing Guide

## Backend Implementation Status: ✅ COMPLETE

Toate componentele backend-ului pentru modulul Materials & Inventory au fost implementate cu succes.

## Quick Start

### 1. Verificare Migrare
```bash
npm run prisma:generate
```

### 2. Pornire Server
```bash
npm run dev
```

### 3. Testare API

#### Opțiune A: Script Automat (necesită autentificare)
```bash
./scripts/test-materials-api.sh
```

#### Opțiune B: Manual cu curl

**Autentificare**: Toate API-urile necesită autentificare ca ADMIN sau MANAGER.

**1. Creare Material**
```bash
curl -X POST http://localhost:3000/api/admin/materials \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
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

**2. Listare Materiale**
```bash
curl http://localhost:3000/api/admin/materials \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**3. Actualizare Material**
```bash
curl -X PATCH http://localhost:3000/api/admin/materials/MATERIAL_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"stock": 600, "minStock": 75}'
```

**4. Consum Material**
```bash
curl -X POST http://localhost:3000/api/admin/materials/MATERIAL_ID/consume \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "jobId": "JOB_ID",
    "quantity": 25
  }'
```

**5. Detalii Material cu Istoric**
```bash
curl http://localhost:3000/api/admin/materials/MATERIAL_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**6. Ștergere Material**
```bash
curl -X DELETE http://localhost:3000/api/admin/materials/MATERIAL_ID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## API Endpoints

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/api/admin/materials` | Lista toate materialele cu metrics |
| POST | `/api/admin/materials` | Crează material nou |
| GET | `/api/admin/materials/[id]` | Detalii material cu istoric consum |
| PATCH | `/api/admin/materials/[id]` | Actualizează material |
| DELETE | `/api/admin/materials/[id]` | Șterge material (fără consum) |
| POST | `/api/admin/materials/[id]/consume` | Consumă material pentru job |

## Features Implementate

### ✅ CRUD Complet
- Create: Validări complete, SKU unic
- Read: Lista cu metrics, detalii cu istoric
- Update: Toate câmpurile, validări
- Delete: Protejat (nu permite cu consum)

### ✅ Material Consumption
- Consum material pentru Production Jobs
- Scădere automată stoc
- Creare istoric MaterialUsage
- Verificare stoc suficient
- Alerte low stock

### ✅ Metrics & Analytics
- `lowStock`: indicator automat (stock < minStock)
- `totalConsumption`: sumă totală consum
- Istoric detaliat cu job și order info

### ✅ Security
- Autentificare obligatorie
- Rol: ADMIN sau MANAGER
- Validări input complete

### ✅ Data Integrity
- Tranzacții pentru consum (atomic)
- Foreign keys cu Cascade
- Validări business rules

## Database Schema

### Material
```prisma
model Material {
  id          String          @id @default(cuid())
  name        String
  sku         String?         @unique
  unit        String
  stock       Float           @default(0)
  minStock    Float           @default(0)
  costPerUnit Decimal         @default(0)
  notes       String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  consumption MaterialUsage[]
}
```

### MaterialUsage
```prisma
model MaterialUsage {
  id         String        @id @default(cuid())
  materialId String
  jobId      String
  quantity   Float
  createdAt  DateTime      @default(now())
  material   Material      @relation(...)
  job        ProductionJob @relation(...)
}
```

## Production Integration

Modelul `ProductionJob` a fost actualizat:
```prisma
model ProductionJob {
  ...
  materialUsages  MaterialUsage[]
  ...
}
```

Când creezi/vezi un Production Job, poți:
- Vedea toate materialele consumate
- Adăuga consum nou de materiale
- Tracker total cost materiale

## Response Examples

### Lista Materiale
```json
[
  {
    "id": "clx...",
    "name": "Folie PVC",
    "sku": "PVC-001",
    "unit": "m2",
    "stock": 475,
    "minStock": 50,
    "costPerUnit": 12.50,
    "notes": "...",
    "createdAt": "2026-01-04T...",
    "updatedAt": "2026-01-04T...",
    "lowStock": false,
    "totalConsumption": 25
  }
]
```

### Consum Material (cu warning)
```json
{
  "success": true,
  "materialUsage": {
    "id": "clx...",
    "materialId": "...",
    "jobId": "...",
    "quantity": 25,
    "createdAt": "..."
  },
  "material": {
    "id": "...",
    "stock": 15,
    "minStock": 20,
    ...
  },
  "warning": {
    "message": "Atenție: Stocul este sub pragul minim!",
    "currentStock": 15,
    "minStock": 20
  }
}
```

## TypeScript Note

După generarea Prisma Client, este posibil ca VS Code să afișeze erori TypeScript temporare. Acestea dispar după:
1. Restart TypeScript Server (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")
2. Sau rebuild: `npm run build`

Erorile nu afectează funcționalitatea runtime - API-urile funcționează corect.

## Next Steps (UI Development)

Backend-ul este gata pentru:
1. **UI Materials List** - tabel cu toate materialele, filter low stock
2. **UI Create/Edit Material** - formular CRUD
3. **UI Material Details** - detalii + istoric consum
4. **UI Consume Material** - în Production Job view
5. **Dashboard Low Stock** - alerte materiale cu stoc scăzut
6. **Reports** - rapoarte consum și costuri

Vezi [MATERIALS_BACKEND.md](./MATERIALS_BACKEND.md) pentru documentație completă API.

## Troubleshooting

### Error: "material" property doesn't exist on PrismaClient
**Soluție**: Regenerează Prisma Client
```bash
npm run prisma:generate
```

### Error: SASL password error
**Soluție**: Verifică variabila `DATABASE_URL` în `.env`

### Error: 403 Acces interzis
**Soluție**: Autentifică-te ca ADMIN sau MANAGER

## Files Created

1. `prisma/schema.prisma` - Modele Material, MaterialUsage
2. `prisma/migrations/20260104170255_add_materials_inventory_models/` - Migrare DB
3. `src/app/api/admin/materials/route.ts` - GET, POST
4. `src/app/api/admin/materials/[id]/route.ts` - GET, PATCH, DELETE
5. `src/app/api/admin/materials/[id]/consume/route.ts` - POST consum
6. `src/__tests__/materials.test.ts` - Teste unitare
7. `scripts/test-materials.ts` - Script testare manuală
8. `scripts/test-materials-api.sh` - Script testare API
9. `docs/MATERIALS_BACKEND.md` - Documentație completă
10. `docs/MATERIALS_TESTING.md` - Acest ghid

---

**Status**: ✅ Backend complet implementat și funcțional
**Ready for**: UI Development (TASK 9.2)
