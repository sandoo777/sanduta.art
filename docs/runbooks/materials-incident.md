Invalid `prisma.supplier.create()` invocation: { data: { name: "\"TEX-PLAST GRUP\" SRL", email: "sanduta.art@gmail.com", ~~~~~ phones: [ "+37379543485", "+37368500382" ], address: "str. Constructorilor, 12, Chișinău, MD2059", website: null, codFiscal: "1010600007382", preferredChannel: "email", notes: "5555", defaultLeadTimeDays: 7, createdBy: "cmtd4esua00002sdidsfj2kqy", ? id?: String, ? contactEmail?: String | Null, ? apiEndpoint?: String | Null, ? apiKey?: String | Null, ? defaultCurrency?: String, ? createdAt?: DateTime, ? updatedAt?: DateTime, ? primaryMaterials?: MaterialCreateNestedManyWithoutPrimarySupplierInput, ? materialSuppliers?: MaterialSupplierCreateNestedManyWithoutSupplierInput, ? purchaseOrders?: PurchaseOrderCreateNestedManyWithoutSupplierInput, ? reorderRules?: ReorderRuleCreateNestedManyWithoutSupplierInput } } Unknown argument `email`. Available options are marked with ?.# Runbook incident materials

## Scop
Acest runbook este folosit la prima alertă pentru probleme la create/edit material, în special când providerul / furnizorii nu se persista sau payload-ul nu conține câmpurile necesare.

## Nota de compatibilitate recentă
- UI-ul de creare/edit material nu mai afișează secțiunea „Metode tipărire compatibile”.
- Payload-ul trimis la submit păstrează doar `printMethodIds` (dacă există). Nu se mai trimite `compatibleMethods`.
- Serverul rămâne compatibil cu requesturile vechi care încă includ `compatibleMethods`, dar nu îl mai obligă ca câmp necesar.

## Reguli unitate -> proprietăți (canonical)
- `m2`: `formatId`, `formatName`, `width_mm`, `height_mm`, `thickness`, `density`, `wastePercent`.
- `meter`: `width_mm`, `thickness`, `density`, `wastePercent`.
- `sheet`: `formatId`, `formatName`, `width_mm`, `height_mm`, `thickness`, `density`, `packaging*`, `wastePercent`.
- `kg` / `gram` / `liter` / `ml`: fără dimensiuni (`width_mm`, `height_mm`) și fără `thickness`; se păstrează `density`/`consumptionRate` dacă sunt relevante.
- `pcs`: poate păstra dimensiuni opționale (`width_mm`, `height_mm`) și `thickness`.

Aplicare:
- UI ascunde controalele irelevante pentru unitatea selectată.
- Serverul normalizează requestul și ignoră câmpurile nerelevante pe unitate (cu debug log doar în non-production).

## Comportament COALA (nou)
- Pentru materiale de tip COALA (compat: `materialType=COALA` sau `unit=sheet`), câmpurile duplicate de dimensiune din formular sunt ascunse.
- UI cere selectarea unui `Format`; mesajul informativ apare lângă selectorul de format.
- Serverul normalizează temporar payload-ul:
  - `materialType=COALA` -> `SUPORT_FOI`
  - `gramaj_g` / `weight` -> `density`
  - `sheets_per_box` / `foi_per_cutie` -> `packagingQty`
  - dacă există `formatId`, `width_mm` și `height_mm` sunt suprascrise din format.

## Pas 1 — reproducere
1. Deschide http://localhost:3000/admin/materials/new.
2. Completează formularul cu:
   - `name`
   - `materialType`
   - `width_mm`
   - `height_mm`
   - `unit`
   - 2 furnizori
   - `primarySupplierId` setat
3. Apasă `Create`.

## Pas 2 — colectare dovezi
1. Deschide DevTools → Network.
2. Selectează request-ul `POST /api/admin/materials`.
3. Salvează payload-ul JSON într-un fișier numit `last_payload.json`.
4. Deschide DevTools → Console și salvează orice eroare JS.
5. Verifică server logs în terminal; caută linia:
   `DEBUG POST /api/admin/materials body:`
6. Dacă nu există logul, adaugă temporar în route:

```ts
const body = await request.json();
console.debug('[DEBUG] POST /api/admin/materials body:', JSON.stringify(body));
```

## Pas 3 — analiză rapidă
- Dacă payload-ul conține `gramaj_g`, `primarySupplierId`, `suppliers`: problema este la server / DB persist.
- Dacă payload-ul nu conține aceste câmpuri: problema este la client state / form submit.
- Pentru COALA este acceptabil ca payload-ul client să nu trimită `width_mm`/`height_mm`; serverul le normalizează din `formatId`.

## Pas 4 — remediere rapidă
### Client missing fields
- Verifică `handleSubmit()` din `src/components/MaterialCreateForm.tsx`.
- Caută `suppliersList` / `primarySupplierId` / `gramaj_g`.
- Asigură că payload-ul este exact:

```ts
const payload = {
  name: values.name,
  materialType: values.materialType,
  width_mm: values.width_mm,
  height_mm: values.height_mm,
  gramaj_g: values.gramaj_g,
  unit: values.unit,
  formatId: values.formatId || null,
  primarySupplierId: values.primarySupplierId || null,
  suppliers: suppliersList || []
};
```

### Server missing persist
- Verifică `src/app/api/admin/materials/route.ts`.
- Verifică `createMaterial(body)` și relațiile Prisma:

```ts
await prisma.material.create({
  data: {
    name: body.name,
    materialType: body.materialType,
    width_mm: body.width_mm,
    height_mm: body.height_mm,
    gramaj_g: body.gramaj_g,
    primarySupplier: body.primarySupplierId ? { connect: { id: body.primarySupplierId } } : undefined,
    suppliers: body.suppliers?.length ? {
      create: body.suppliers.map((supplier) => ({
        supplier: { connect: { id: supplier.supplierId } },
        supplierSku: supplier.supplierSku,
        unitCost: supplier.unitCost,
        leadTimeDays: supplier.leadTimeDays,
      }))
    } : undefined,
  }
});
```

## Pas 5 — verificare
1. Repetă create-ul.
2. Verifică Network + server log + DB (Prisma Studio).
3. Confirma că `Material.primarySupplierId` și `MaterialSupplier` au fost create.

## Escalare
Dacă nu se remediază în 30 minute:
- anunță owner-ul / echipa responsabilă;
- atașează `last_payload.json` și server logs;
- marchează incidentul ca `investigation in progress`.

## Curățare
1. Elimină logurile temporare.
2. Rulează smoke tests locale.
3. Marchează incidentul ca `closed` după confirmarea persistării.

## Rollback rapid
1. Revert commit-ul de schimbare formular/API COALA.
2. Verifică faptul că payload-ul revine la forma anterioară.
3. Rulează testele materialelor înainte de redeploy.
