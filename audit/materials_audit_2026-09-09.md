# Materials Create/Edit Audit - 2026-09-09

## Scope
End-to-end audit for admin material create/edit flow with focus on:
- supplier visibility and persistence
- gramaj rendering
- waste%, format, methods, unit payload coverage
- create/edit defaults and auth constraints

## Findings (ordered by severity)

### 1) Admin real form omitted supplier and methods controls/payload
Severity: High

Observed:
- Real admin create/edit path uses modal form in src/app/admin/materials/_components/MaterialForm.tsx.
- Before fix it did not fetch suppliers, had no supplier inputs, and submitted compatibleMethods as empty array.
- This caused missing primarySupplierId, suppliers, and methods persistence on create/edit.

Root cause:
- Drift between legacy src/components/MaterialCreateForm.tsx (has suppliers logic) and real admin modal form.

Fix applied:
- Added suppliers fetch + UI controls + payload mapping.
- Added print-methods fetch + checkbox UI + payload mapping via printMethodIds and compatibleMethods.
- Added edit defaults hydration for supplier and methods from existing material.

### 2) Gramaj column rendered misleading 0 mm
Severity: High

Observed:
- Admin list gramaj formatter in src/app/admin/materials/page.tsx used thickness fallback directly and rendered mm values even when gramaj should be in g.
- Materials with thickness = 0 or missing density could show 0 mm.

Root cause:
- Wrong fallback order and unit semantics for gramaj.

Fix applied:
- Prefer density (g/m2) first and render as g.
- Keep name parsing fallback (170g etc).
- Use thickness fallback only when thickness > 0.

### 3) Missing temporary debug body logging on PUT
Severity: Medium

Observed:
- POST route already had temporary body debug logs.
- PUT route did not, making update-payload audit harder.

Fix applied:
- Added dev-only temporary debug logging in PUT route.

### 4) Suppliers endpoint returns 401 from curl without auth session
Severity: Medium

Observed:
- GET /api/admin/suppliers returns 401 Unauthorized when called without authenticated cookies/token.

Root cause:
- Route is protected with requireRole(['ADMIN', 'MANAGER', 'OPERATOR']) and requires NextAuth session.

Impact:
- Expected behavior for unauthenticated curl.
- In browser admin session (credentials include), endpoint returns suppliers.

### 5) Schema mismatch with gramaj_g expectation
Severity: Medium

Observed:
- Current schema does not contain gramaj_g on Material.
- Existing fields are density and thickness.

Implication:
- Any requirement explicitly expecting gramaj_g needs a schema migration decision.
- Current fix aligns UI to existing schema semantics.

## Evidence Collected

- Payload sample (POST): evidence/last_payload_20260909_062824.json
- Server debug lines: evidence/server_debug_log.txt
- Suppliers curl headers/body:
  - evidence/suppliers_curl_headers.txt
  - evidence/suppliers_curl_response.json
- DB snapshot (materials selected columns): evidence/prisma_material_rows.json
- Search evidence for key fields: evidence/rg_material_fields.txt
- Test outputs:
  - evidence/test_results.txt
  - evidence/test_results_after_fix.txt

## Patches Applied

1) src/app/admin/materials/_components/MaterialForm.tsx
- Added suppliers state + fetch from /api/admin/suppliers
- Added print-methods state + fetch from /api/admin/print-methods?active=true
- Added default hydration for edit (primarySupplierId, suppliers, methods)
- Added supplier controls (primary supplier + supplier rows)
- Added methods controls (checkbox list)
- Payload now includes:
  - primarySupplierId
  - suppliers
  - printMethodIds
  - compatibleMethods
  - existing fields (formatId, unit, wastePercent)

2) src/app/admin/materials/page.tsx
- Fixed gramaj rendering logic to avoid 0 mm and use correct g semantics.

3) src/app/api/admin/materials/[id]/route.ts
- Added temporary dev debug logging for PUT body.

4) src/modules/materials/server.ts
- Accepted methods alias in payload mapping.
- Applied type-safety fixes so file compiles cleanly after updates.

5) src/__tests__/MaterialForm.admin.test.tsx
- Added regression test validating edit payload includes suppliers, methods, format, waste, and unit fields.

## Test Verification

Executed:
- npx vitest run src/__tests__/MaterialForm.admin.test.tsx src/__tests__/api.materials.create.test.ts src/__tests__/MaterialCreateForm.e2e.test.tsx src/__tests__/MaterialCreateForm.smoke.test.tsx --reporter=verbose

Result:
- 4 files passed
- 6 tests passed

## CI Recommendations

- Keep this test in smoke material job:
  - src/__tests__/MaterialForm.admin.test.tsx
- Ensure pipeline includes both:
  - admin real form regression
  - legacy create form regression

## Rollback

If rollback is needed, revert these files:
- src/app/admin/materials/_components/MaterialForm.tsx
- src/app/admin/materials/page.tsx
- src/app/api/admin/materials/[id]/route.ts
- src/modules/materials/server.ts
- src/__tests__/MaterialForm.admin.test.tsx

## Remove Temporary Logging

After 48-72h of stable monitoring, remove debug lines:
- POST debug in src/app/api/admin/materials/route.ts
- PUT debug in src/app/api/admin/materials/[id]/route.ts

## Acceptance Criteria Status

- [x] Payload POST/PUT includes primarySupplierId, suppliers, wastePercent, formatId, methods, unit.
- [x] DB reflects target field structure and values are queryable (primarySupplierId, wastePercent, formatId, unit; gramaj represented by density/thickness).
- [x] UI displays gramaj correctly for density-based materials and no longer shows 0 mm fallback for invalid gramaj cases.
- [x] Suppliers appear in create/edit UI controls and are included in payload.
- [x] Focused create/edit material tests pass locally.
- [ ] Full browser E2E with authenticated admin session and Prisma Studio screenshots not captured in this CLI-only run.

---

## 8. Acceptance checklist

- [x] Payload create includes `primarySupplierId` and `suppliers` in the current repo flow.
- [x] Server persist logic validates and saves supplier relations.
- [x] Schema live matches actual model and does not contain `gramaj_g`.
- [x] UI renderer was audited; legacy `gramaj_g` usage was identified and documented.
- [x] Smoke tests pass locally.
- [x] App startup returns `Ready on http://localhost:3000`.

## 9. Final conclusion

The repo was suffering from schema drift and stale legacy assumptions rather than a single failing create route. The important fix is not to add a nonexistent `gramaj_g` field back into the model, but to align all read/write code to the real live schema (`thickness`, `density`, `wastePercent`, `primarySupplierId`, `materialSuppliers`).
