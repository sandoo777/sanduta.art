Title: Fix materials create/edit persist suppliers and primary supplier

Description:
- What changed
- Files modified
- Why this fix was needed

Verification steps:
1. Open /admin/materials/new and create a material with suppliers.
2. Check the Network payload contains `primarySupplierId`, `suppliers` and the relevant material fields.
3. Check DB in Prisma Studio that the material is created and supplier links exist.
4. Run smoke tests locally: `npx vitest run src/__tests__/MaterialCreateForm.smoke.test.tsx`

Checklist:
- [ ] Unit tests updated
- [ ] E2E smoke tests added
- [ ] CI smoke job green
- [ ] Temporary logging added and scheduled for removal after verification
- [ ] No route-level payload filtering left behind
- [ ] DB relation persists correctly
