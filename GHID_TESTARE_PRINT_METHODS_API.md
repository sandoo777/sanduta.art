# Ghid Testare Manuală - API Print Methods

**Data**: 2026-05-27  
**Versiune**: 1.0

---

## ⚙️ Pregătire Test Environment

### 1. **Start Server**
```bash
npm run dev
# Serverul rulează pe http://localhost:3000
```

### 2. **Creare Date de Test**
```bash
npx tsx setup-test-data.ts
```

**Output așteptat**:
```
✓ Material category created: Test Category
✓ Material created: Test PVC White 3mm
✓ Material created: Test UV Ink Cyan
✓ Machine created: Test Roland LEF2-300
```

**IDs create**:
- **Material 1**: `test-mat-001` → Test PVC White 3mm
- **Material 2**: `test-mat-002` → Test UV Ink Cyan  
- **Machine**: `test-machine-001` → Test Roland LEF2-300

### 3. **Login Admin Panel**
- URL: http://localhost:3000/admin/login
- **Email**: admin@sanduta.art
- **Password**: admin123

---

## 🧪 Teste Endpoint-uri

### **Tool recomandat**: [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) (VS Code Extension) sau Postman

**Notă**: Toate request-urile necesită autentificare. După login în browser, cookies sunt setate automat.

---

## TEST 1: GET /api/admin/print-methods

### **Request**
```http
GET http://localhost:3000/api/admin/print-methods
```

### **Verificări**
- ✅ Status: 200 OK
- ✅ Response: Array de print methods
- ✅ Fiecare item conține: `id, name, type, baseCost, costPerM2, colorMode, active`
- ✅ Relații incluse: `compatibleMaterials[], compatibleEquipment[], consumables[]`
- ✅ _count object cu totals

### **Exemplu Response**
```json
[
  {
    "id": "pm-123",
    "name": "Digital Printing",
    "type": "Digital",
    "baseCost": 50,
    "costPerM2": 20,
    "colorMode": "Full Color",
    "active": true,
    "compatibleMaterials": [
      {
        "id": "test-mat-001",
        "name": "Test PVC White 3mm",
        "unit": "m2",
        "active": true
      }
    ],
    "compatibleEquipment": [
      {
        "id": "test-machine-001",
        "name": "Test Roland LEF2-300",
        "type": "UV Printer",
        "active": true
      }
    ],
    "consumables": [],
    "_count": {
      "compatibleMaterials": 1,
      "compatibleEquipment": 1,
      "consumables": 0,
      "productionJobs": 0
    }
  }
]
```

### **Test Variante**
#### GET cu filtru active
```http
GET http://localhost:3000/api/admin/print-methods?active=true
```
- ✅ Returnează doar print methods cu `active: true`

---

## TEST 2: POST /api/admin/print-methods

### **Request**
```http
POST http://localhost:3000/api/admin/print-methods
Content-Type: application/json

{
  "name": "UV Printing High Gloss",
  "type": "UV",
  "baseCost": 100,
  "costPerM2": 35,
  "colorMode": "CMYK + White + Varnish",
  "speed": "25 m²/h",
  "maxWidth": 3200,
  "maxHeight": 2000,
  "description": "UV printing for rigid materials with glossy finish",
  "active": true,
  "compatibleMaterialIds": ["test-mat-001"],
  "compatibleEquipmentIds": ["test-machine-001"]
}
```

### **Verificări**
- ✅ Status: 201 Created
- ✅ Response conține print method creat cu toate câmpurile
- ✅ `compatibleMaterials` și `compatibleEquipment` sunt populate
- ✅ Prisma Decimal convertit în number
- ✅ Dates în format ISO string

### **Test Validări**

#### Name duplicat → 409 Conflict
```json
{
  "name": "UV Printing High Gloss"  // Același nume
}
```
**Expected**: `409 Conflict` - "A print method with this name already exists"

#### Validare baseCost negativ → 400
```json
{
  "name": "Test Negative",
  "type": "UV",
  "baseCost": -10
}
```
**Expected**: `400 Bad Request` - Validation error

#### Material ID invalid → 400
```json
{
  "name": "Test Invalid Material",
  "type": "UV",
  "compatibleMaterialIds": ["invalid-id-999"]
}
```
**Expected**: `400 Bad Request` - "Invalid material IDs"

#### Equipment ID invalid → 400
```json
{
  "name": "Test Invalid Equipment",
  "type": "UV",
  "compatibleEquipmentIds": ["invalid-machine-999"]
}
```
**Expected**: `400 Bad Request` - "Invalid equipment IDs"

---

## TEST 3: GET /api/admin/print-methods/[id]

### **Request**
```http
GET http://localhost:3000/api/admin/print-methods/{printMethodId}
```
*Înlocuiește `{printMethodId}` cu ID-ul returnat din POST*

### **Verificări**
- ✅ Status: 200 OK
- ✅ Response: Single print method cu TOATE relațiile
- ✅ `compatibleMaterials` array complet
- ✅ `compatibleEquipment` array complet
- ✅ `consumables` array (gol inițial)
- ✅ `_count` include: compatibleMaterials, compatibleEquipment, consumables, **productionJobs**, **productPrintMethods**

### **Test Edge Case**

#### ID inexistent → 404
```http
GET http://localhost:3000/api/admin/print-methods/invalid-id-999
```
**Expected**: `404 Not Found` - "Print method not found"

---

## TEST 4: PUT /api/admin/print-methods/[id]

### **Request**
```http
PUT http://localhost:3000/api/admin/print-methods/{printMethodId}
Content-Type: application/json

{
  "name": "UV Printing High Gloss UPDATED",
  "baseCost": 120,
  "costPerM2": 40,
  "colorMode": "CMYK + White + Varnish + Spot UV",
  "compatibleMaterialIds": ["test-mat-001", "test-mat-002"],
  "active": true
}
```

### **Verificări**
- ✅ Status: 200 OK
- ✅ Câmpurile sunt actualizate
- ✅ **Atomic Update**: `compatibleMaterialIds` ÎNLOCUIEȘTE complet lista veche (nu adaugă)
- ✅ Response conține print method actualizat cu relații

### **Test Atomic Update**

1. **Crează print method cu Material 1**:
   ```json
   { "compatibleMaterialIds": ["test-mat-001"] }
   ```

2. **Update cu Material 2 DOAR**:
   ```json
   { "compatibleMaterialIds": ["test-mat-002"] }
   ```

3. **Verifică GET response**:
   - ✅ `compatibleMaterials` conține DOAR Material 2
   - ❌ Material 1 NU mai există în listă

---

## TEST 5: POST /api/admin/print-methods/[id]/consumables

### **Request**
```http
POST http://localhost:3000/api/admin/print-methods/{printMethodId}/consumables
Content-Type: application/json

{
  "materialId": "test-mat-002",
  "costPerSqm": 5.5,
  "costPerJob": 10,
  "active": true,
  "notes": "UV ink for glossy finish"
}
```

### **Verificări**
- ✅ Status: 201 Created
- ✅ Response: Consumable creat cu `material` object enriched
- ✅ `material.name`, `material.unit`, `material.stock` sunt incluse

### **Exemplu Response**
```json
{
  "id": "pmc-123",
  "printMethodId": "pm-456",
  "materialId": "test-mat-002",
  "costPerSqm": 5.5,
  "costPerJob": 10,
  "active": true,
  "notes": "UV ink for glossy finish",
  "material": {
    "id": "test-mat-002",
    "name": "Test UV Ink Cyan",
    "unit": "ml",
    "stock": 5000,
    "pricePerUnit": 0.15,
    "active": true
  }
}
```

### **Test Validări**

#### Lipsă cost fields → 400
```json
{
  "materialId": "test-mat-002"
  // Lipsesc costPerSqm și costPerJob
}
```
**Expected**: `400 Bad Request` - "At least one cost field is required"

#### Duplicate (printMethodId + materialId) → 409
```json
{
  "materialId": "test-mat-002"  // Aceeași combinație
}
```
**Expected**: `409 Conflict` - "Consumable already exists for this print method"

---

## TEST 6: GET /api/admin/print-methods/[id]/consumables

### **Request**
```http
GET http://localhost:3000/api/admin/print-methods/{printMethodId}/consumables
```

### **Verificări**
- ✅ Status: 200 OK
- ✅ Response: Array de consumables
- ✅ Fiecare item conține `material` object
- ✅ Sort: createdAt DESC (cel mai recent primul)

---

## TEST 7: PATCH /api/admin/print-methods/[id]/consumables/[consumableId]

### **Request**
```http
PATCH http://localhost:3000/api/admin/print-methods/{printMethodId}/consumables/{consumableId}
Content-Type: application/json

{
  "costPerSqm": 7.5,
  "costPerJob": 15,
  "notes": "Updated: Premium UV ink for high gloss",
  "active": true
}
```

### **Verificări**
- ✅ Status: 200 OK
- ✅ Response: Consumable actualizat
- ✅ Doar câmpurile trimise sunt actualizate (partial update)

### **Test Edge Case**

#### consumableId nu aparține printMethodId → 404
```http
PATCH http://localhost:3000/api/admin/print-methods/pm-123/consumables/wrong-cid-456
```
**Expected**: `404 Not Found` - "Consumable not found for this print method"

---

## TEST 8: DELETE /api/admin/print-methods/[id]/consumables/[consumableId]

### **Request**
```http
DELETE http://localhost:3000/api/admin/print-methods/{printMethodId}/consumables/{consumableId}
```

### **Verificări**
- ✅ Status: 200 OK
- ✅ Response: `{ "success": true, "message": "..." }`
- ✅ GET consumables nu mai returnează consumable-ul șters

---

## TEST 9: DELETE /api/admin/print-methods/[id]

### **Request**
```http
DELETE http://localhost:3000/api/admin/print-methods/{printMethodId}
```

### **Verificări CRITICAL**

#### **Scenariul 1: Print Method NU e folosit**
- ✅ Status: 200 OK
- ✅ Response: `{ "success": true, "message": "..." }`
- ✅ GET nu mai returnează print method-ul șters
- ✅ Consumables asociate sunt șterse CASCADE

#### **Scenariul 2: Print Method E FOLOSIT în Production Jobs**
*Trebuie mai întâi să creezi un ProductionJob care folosește acest print method*

**Expected**: `409 Conflict`
```json
{
  "error": "Cannot delete print method",
  "message": "This print method is in use in 3 production jobs and 5 products. Please remove these references before deleting.",
  "usage": {
    "productionJobs": 3,
    "products": 5
  }
}
```

---

## ✅ Checklist Testare Completă

### **Funcționalități Core**
- [ ] GET lista print methods (cu și fără filtru `?active=true`)
- [ ] POST creare print method cu compatibilități
- [ ] GET single print method cu toate relațiile
- [ ] PUT update atomic (înlocuire completă compatibilități)
- [ ] DELETE cu verificare utilizare (409 dacă folosit)

### **Consumabile Indirecte**
- [ ] POST creare consumabil
- [ ] GET listă consumabile
- [ ] PATCH update consumabil
- [ ] DELETE consumabil

### **Validări**
- [ ] Name unic (409 pe duplicat)
- [ ] baseCost ≥ 0 (400 pe negativ)
- [ ] compatibleMaterialIds valid (400 pe ID inexistent)
- [ ] compatibleEquipmentIds valid (400 pe ID inexistent)
- [ ] Consumable: cel puțin un cost field (400 dacă lipsesc ambele)
- [ ] Consumable: unique (printMethodId + materialId) → 409

### **Edge Cases**
- [ ] GET cu ID inexistent → 404
- [ ] DELETE print method folosit → 409 cu detalii usage
- [ ] PATCH consumable wrong printMethodId → 404
- [ ] DELETE consumable inexistent → 404

### **Relații & Integritate**
- [ ] Atomic update compatibilități (set + connect pattern)
- [ ] CASCADE delete consumables când print method șters
- [ ] _count objects corecte în response-uri

---

## 🐛 Troubleshooting

### **401 Unauthorized**
- Verifică că ești logat în browser la http://localhost:3000/admin/login
- Cookies trebuie să fie setate (next-auth.session-token)

### **404 Not Found pe endpoint**
- Verifică că serverul rulează: `npm run dev`
- URL corect: `http://localhost:3000/api/admin/print-methods`

### **500 Internal Server Error**
- Verifică logs în terminal unde rulează `npm run dev`
- Verifică că database-ul e pornit și migrațiile aplicate

### **Prisma Client Error**
- Regenerează client: `npx prisma generate`
- Reîncearcă serverul

---

## 📊 Rezultat Așteptat Final

După testare completă:
- ✅ Toate cele 7 endpoint-uri funcționează
- ✅ Toate validările sunt active
- ✅ Relații many-to-many funcționează atomic
- ✅ Delete cu usage checks funcționează
- ✅ Consumabile CRUD complet funcțional
- ✅ TypeScript 100% type-safe
- ✅ Logging consistent în console

---

**Good luck testing! 🚀**
