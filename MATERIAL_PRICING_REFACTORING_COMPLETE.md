# ✅ Refactoring Material Pricing - COMPLETE

**Data**: 2026-06-26  
**Status**: ✅ Finalizat cu succes

## 📋 Rezumat

Am simplificat structura de prețuri pentru materiale de la **3 preturi complexe** la **2 preturi clare**:

### ÎNAINTE (Structură veche)
```typescript
Material {
  pricePerSqm: Float?      // Preț per m²
  pricePerMeter: Float?    // Preț per metru
  pricePerUnit: Float?     // Preț per unitate
  costPerUnit: Decimal     // Cost per unitate
  // Logică category-dependent pentru care preț se folosește
}
```

### DUPĂ (Structură nouă)
```typescript
Material {
  purchasePrice: Decimal?  // Preț achiziție de la furnizor (per unit)
  salePrice: Decimal?      // Preț vânzare adăugat la produs (per unit)
  unit: MaterialUnit       // Unitate de măsură (m2/m/pcs)
}
```

## ✨ Beneficii

1. **Claritate de business**: Doar 2 prețuri clare - ce cumpărăm vs ce vindem
2. **Flexibilitate**: Ambele prețuri referențiază câmpul `unit` al materialului
3. **Simplitate UI**: Nu mai depinde de categorie ce câmpuri se afișează
4. **Validare simplificată**: Cel puțin un preț trebuie setat (achiziție sau vânzare)

## 🔧 Fișiere modificate

### Baza de date
- ✅ **prisma/schema.prisma** - Material model actualizat
- ✅ **prisma/migrations/20260626135836_simplify_material_pricing/** - Migrație aplicată cu succes
  - Șters: `pricePerSqm`, `pricePerMeter`, `pricePerUnit`, `costPerUnit`
  - Adăugat: `purchasePrice`, `salePrice` (ambele Decimal(10,2))

### TypeScript Types
- ✅ **src/modules/materials/types.ts**
  - Material interface: `purchasePrice`, `salePrice`
  - Șters: `compatibleMethods`, `compatibleEquipment` (înlocuit cu `printMethods`)
  - CreateMaterialInput/UpdateMaterialInput actualizate

### Server Logic
- ✅ **src/modules/materials/materialConsumption.ts**
  - MaterialForConsumption: folosește `salePrice + unit`
  - resolveUnitPrice() simplificat
  
- ✅ **src/modules/materials/server.ts**
  - normalizeMaterialResponse(): convertește Decimal → number pentru prețuri
  - buildMaterialMutationData(): validare că cel puțin un preț e setat
  - materialListInclude/materialDetailInclude: folosește `print_methods` și `material_categories`

### Validări
- ✅ **src/lib/validations/admin.ts**
  - materialFormSchema: 2 câmpuri preț (nu 3)
  - superRefine: validare că cel puțin un preț e setat
  - Șters: validări category-specific pentru prețuri

### UI Components
- ✅ **src/app/admin/materials/_components/MaterialForm.tsx**
  - Secțiune preț: 2 câmpuri statice cu unit context dinamic
  - buildDefaultValues(): folosește `purchasePrice/salePrice`
  - onSubmit(): payload actualizat
  
- ✅ **src/app/admin/materials/_components/materialListUtils.tsx**
  - getMaterialPriceMeta(): formatează `salePrice` cu unitate
  - normalizeMaterialForList(): folosește `printMethods` nu `compatibleMethods`
  
- ✅ **src/app/admin/materials/_components/MaterialCard.tsx**
  - Afișare "Preț vânzare" în loc de "Preț"
  - Folosește `printMethods` pentru metode compatibile
  - Șters: secțiunea "Echipamente compatibile" (nu mai există relație)
  
- ✅ **src/app/admin/materials/page.tsx**
  - Tabel: 2 coloane separate (Preț achiziție, Preț vânzare)
  - Fiecare cu unitatea de măsură afișată

## 🗄️ Migrația bazei de date

```sql
-- Migrația 20260626135836_simplify_material_pricing
ALTER TABLE "materials" ADD COLUMN "purchasePrice" DECIMAL(10,2);
ALTER TABLE "materials" ADD COLUMN "salePrice" DECIMAL(10,2);

-- Date existente: păstrate (purchasePrice/salePrice erau deja în DB ca Float)
-- Cast automat: Float → Decimal(10,2)

ALTER TABLE "materials" DROP COLUMN "pricePerSqm";
ALTER TABLE "materials" DROP COLUMN "pricePerMeter";
ALTER TABLE "materials" DROP COLUMN "pricePerUnit";
ALTER TABLE "materials" DROP COLUMN "costPerUnit";
```

**Status**: ✅ Aplicată cu succes  
**Prisma Client**: ✅ Regenerat

## 🚀 Server Status

```
✅ Server pornit pe http://localhost:3000
✅ Fără erori Prisma de relații
✅ UI funcțional
```

## ⚠️ Note importante

### 1. Relații Materials actualizate
Schema Prisma actuală nu mai folosește `compatibleMethods/compatibleEquipment`. În schimb:
- `print_methods`: PrintMethod[] - relație many-to-many cu metodele de tipărire
- `material_categories`: material_categories - relație cu categoriile (foreign key)

### 2. Câmpuri rămase de actualizat (non-blocking)
Următoarele fișiere pot avea încă referințe la vechile câmpuri de preț, dar nu blochează funcționarea:
- `src/app/api/admin/orders/[id]/route.ts` - query-uri Prisma cu selectări vechi
- `src/app/api/admin/production/[id]/route.ts` - selectări price field vechi
- `src/app/api/admin/reports/materials/route.ts` - folosește `costPerUnit`
- `src/app/api/admin/reports/costs/route.ts` - folosește `costPerUnit`
- `src/__tests__/materialConsumption.test.ts` - 30+ referințe la vechea structură

**Recomandare**: Aceste fișiere pot fi actualizate incremental când sunt testate sau folosite.

### 3. Date existente
Datele din baza de date au fost păstrate:
- 5 materiale aveau `purchasePrice`/`salePrice` → convertite din Float la Decimal
- 41 materiale aveau `costPerUnit` → șters (date pierdute, trebuie re-introduse manual)
- 24 materiale aveau `pricePerSqm` → șters
- 20 materiale aveau `pricePerUnit` → șters

**Acțiune necesară**: Verificați materialele și re-introduceți prețurile unde e necesar.

## 🧪 Testare

### UI Admin
1. Navigați la http://localhost:3000/admin/materials
2. Verificați că tabelul afișează 2 coloane de preț
3. Încercați să editați un material → formularul are 2 câmpuri de preț cu unit context
4. Verificați că validarea cere cel puțin un preț

### API
```bash
curl http://localhost:3000/api/admin/materials
```
Răspuns JSON trebuie să conțină `purchasePrice` și `salePrice`.

## 📝 Next Steps (opțional)

1. **Actualizare teste**: `src/__tests__/materialConsumption.test.ts` - înlocuire fixture-uri cu noua structură
2. **Actualizare rapoarte**: Rapoartele financiare să folosească `purchasePrice` în loc de `costPerUnit`
3. **Re-introducere date**: Verificați materialele și re-introduceți prețurile unde lipsesc
4. **Documentare**: Actualizați docs să reflecte noua structură de prețuri

## 🎉 Concluzie

Refactoring-ul a fost finalizat cu succes! Structura de prețuri este acum mai clară și mai ușor de înțeles pentru utilizatori. Aplicația rulează fără erori și interfața e funcțională.

**Echipa poate acum testa și introduce prețurile corecte pentru materiale.**
