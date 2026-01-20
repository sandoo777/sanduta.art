# 📋 Admin Forms Inventory - F2.4

**Data**: 2026-01-10  
**Total Forms**: 12 identificate

---

## 🎯 Formulare Identificate

### P1 - Priority 1 (Critical)
1. **ProductForm** (`AdminProducts.tsx`) — Creare/editare produse
2. **CategoryModal** (`admin/categories/_components/CategoryModal.tsx`) — Categorii
3. **UserModal** (`admin/settings/users/_components/UserModal.tsx`) — Users management
4. **CustomerModal** (`admin/customers/_components/CustomerModal.tsx`) — Customer management

### P2 - Priority 2 (Important)
5. **MaterialModal** (`admin/materials/_components/MaterialModal.tsx`) — Materials
6. **MaterialConsumption** (`admin/materials/_components/MaterialConsumption.tsx`) — Material tracking
7. **MachineForm** (`admin/machines/_components/MachineForm.tsx`) — Machines/Printers
8. **JobModal** (`admin/production/_components/JobModal.tsx`) — Production jobs
9. **FinishingForm** (`admin/finishing/_components/FinishingForm.tsx`) — Finishing methods
10. **PrintMethodForm** (`admin/print-methods/_components/PrintMethodForm.tsx`) — Print methods

### P3 - Priority 3 (Nice to have)
11. **SystemSettingsForm** (`admin/settings/system/_components/SystemSettingsForm.tsx`) — System settings
12. **Production Search Form** (`admin/production/page.tsx`) — Search form (simple)

---

## 📊 Status Implementation

| Form | Priority | File | Status |
|------|----------|------|--------|
| ProductForm | P1 | AdminProducts.tsx | ⏳ Pending |
| CategoryModal | P1 | categories/_components/CategoryModal.tsx | ⏳ Pending |
| UserModal | P1 | settings/users/_components/UserModal.tsx | ⏳ Pending |
| CustomerModal | P1 | customers/_components/CustomerModal.tsx | ⏳ Pending |
| MaterialModal | P2 | materials/_components/MaterialModal.tsx | ⏳ Pending |
| MaterialConsumption | P2 | materials/_components/MaterialConsumption.tsx | ⏳ Pending |
| MachineForm | P2 | machines/_components/MachineForm.tsx | ⏳ Pending |
| JobModal | P2 | production/_components/JobModal.tsx | ⏳ Pending |
| FinishingForm | P2 | finishing/_components/FinishingForm.tsx | ⏳ Pending |
| PrintMethodForm | P2 | print-methods/_components/PrintMethodForm.tsx | ⏳ Pending |
| SystemSettingsForm | P3 | settings/system/_components/SystemSettingsForm.tsx | ⏳ Pending |
| ProductionSearch | P3 | production/page.tsx | ⏳ Pending |

---

## 🎯 Strategy

### Phase 1: P1 Forms (Critical) — 4 forms
Focus pe formulare cruciale pentru operațiuni zilnice:
- Products (creare/editare produse)
- Categories (organizare catalog)
- Users (team management)
- Customers (client management)

### Phase 2: P2 Forms (Important) — 6 forms
Formulare pentru producție și resurse:
- Materials & consumption tracking
- Machines/Printers
- Production jobs
- Finishing & Print methods

### Phase 3: P3 Forms (Nice to have) — 2 forms
Formulare secundare:
- System settings
- Simple search forms

---

## 📝 Implementation Plan

1. ✅ Identificare formulare (12 total)
2. ⏳ Creare `src/lib/validations/admin.ts` cu schemas
3. ⏳ Refactorizare P1 forms (4)
4. ⏳ Refactorizare P2 forms (6)
5. ⏳ Refactorizare P3 forms (2)
6. ⏳ Testing & validation
7. ⏳ Documentation & commit

**Estimare**: ~4-6 ore pentru toate formularele

---

**Autor**: GitHub Copilot  
**Data**: 2026-01-10
