# 🧪 Quick Testing Guide - Materials & Inventory

## Access URL
```
http://localhost:3000/admin/materials
```

## Quick Test Steps

### ✅ Test 1: View Materials List (30 sec)
1. Navigate to `/admin/materials`
2. ✓ Vezi listă materials (sau mesaj "Nu există materiale")
3. ✓ Vezi search bar
4. ✓ Vezi filtere (Low stock, Unit)
5. ✓ Vezi buton "Add Material"

**Expected**: Pagină încărcată cu UI complet

---

### ✅ Test 2: Create Material (1 min)
1. Click "Add Material"
2. Fill form:
   - **Name**: Folie PVC Test
   - **SKU**: TEST-001
   - **Unit**: m2 (select)
   - **Stock**: 50
   - **Min Stock**: 10
   - **Cost**: 12.50
   - **Notes**: Material test
3. Click "Creează"
4. ✓ Toast "Material creat cu succes"
5. ✓ Material apare în listă

**Expected**: Material creat și vizibil

---

### ✅ Test 3: Search & Filter (30 sec)
1. Type în search: "PVC"
2. ✓ Vezi doar materiale cu PVC în nume/SKU
3. Select unit filter: "m2"
4. ✓ Vezi doar materiale cu unit=m2
5. Check "Doar stoc scăzut"
6. ✓ Vezi doar materiale cu stock < minStock
7. Click "Resetează filtre"
8. ✓ Vezi toate materialele

**Expected**: Filtre funcționează corect

---

### ✅ Test 4: View Material Details (30 sec)
1. Click "Vezi detalii" pe un material
2. ✓ Vezi header cu nume + SKU
3. ✓ Vezi stats grid (Stock, Min Stock, Cost, Valoare)
4. ✓ Vezi 4 tabs: Overview, Consumption, Jobs, Notes
5. Click pe fiecare tab
6. ✓ Toate tabs se încarcă

**Expected**: Toate tabs funcționează

---

### ✅ Test 5: Edit Material (1 min)
1. În detalii material, click "Editează"
2. Modifică:
   - Stock: 100 (în loc de 50)
   - Min Stock: 20 (în loc de 10)
3. Click "Salvează"
4. ✓ Toast "Material actualizat"
5. ✓ Stats grid afișează noile valori

**Expected**: Update funcționează

---

### ✅ Test 6: Create Production Job (pentru test consum) (1 min)
1. Navigate to `/admin/production`
2. Click "Add Job"
3. Create job:
   - **Name**: Test Job pentru Material
   - Select un order existent
4. Notează ID-ul job-ului

**Expected**: Job creat

---

### ✅ Test 7: Consume Material (1 min)
1. Înapoi la detalii material
2. Tab "Consumption"
3. Click "Consumă Material"
4. Select job creat mai devreme
5. Enter quantity: 15
6. Click "Consumă"
7. ✓ Toast success (sau warning dacă low stock)
8. ✓ Stocul scade (100 → 85)
9. ✓ Istoric consum afișează operația
10. ✓ Stats grid actualizat

**Expected**: Consum funcționează, stoc scade

---

### ✅ Test 8: View Jobs Tab (30 sec)
1. Tab "Jobs"
2. ✓ Vezi job-ul care a consumat material
3. ✓ Vezi cantitate consumată (15)
4. ✓ Vezi cost materiale
5. ✓ Vezi sumar cu totale

**Expected**: Jobs tab afișează corect

---

### ✅ Test 9: Edit Notes (30 sec)
1. Tab "Notes"
2. Click "Editează"
3. Write: "Furnizor: Test SRL, Specificații: PVC transparent"
4. Click "Salvează"
5. ✓ Toast success
6. ✓ Notes actualizate

**Expected**: Notes salvate

---

### ✅ Test 10: Low Stock Alert (1 min)
1. Editează materialul
2. Set Stock: 5 (sub Min Stock de 20)
3. Save
4. ✓ Badge roșu "Stoc scăzut"
5. ✓ Alert roșu în header detalii
6. Lista materials:
7. ✓ Alert general "X materiale au stoc scăzut"
8. Check filter "Doar stoc scăzut"
9. ✓ Materialul apare în listă

**Expected**: Low stock detection funcționează

---

### ✅ Test 11: Delete Material (30 sec)

**Scenario A: Cu consum (should fail)**
1. În detalii material cu consum
2. Click "Șterge"
3. ✓ Mesaj: "Nu poate fi șters, are X înregistrări consum"
4. ✓ Buton Delete disabled

**Scenario B: Fără consum (should work)**
1. Create material nou (fără consum)
2. Click "Șterge"
3. Confirm
4. ✓ Toast success
5. ✓ Redirect la listă
6. ✓ Material dispărut din listă

**Expected**: Delete protection funcționează

---

### ✅ Test 12: Responsive (30 sec)
1. Resize browser → mobile width
2. ✓ Tabel devine carduri
3. ✓ Tabs scrollable
4. ✓ Modal full-width
5. ✓ Forms stack vertical

**Expected**: Responsive corect

---

### ✅ Test 13: Validation (1 min)
1. Create material nou
2. Try submit fără Name → ✓ Error
3. Try submit fără Unit → ✓ Error
4. Try negative Stock → ✓ Error
5. Try consume > disponibil → ✓ Error "Stoc insuficient"

**Expected**: Toate validările funcționează

---

## 🐛 Common Issues & Fixes

### Issue: "Acces interzis"
**Fix**: Loghează-te ca ADMIN sau MANAGER

### Issue: Materials list empty
**Fix**: Create primul material cu "Add Material"

### Issue: No jobs in dropdown
**Fix**: Create un Production Job mai întâi

### Issue: TypeScript errors
**Fix**: `npm run prisma:generate`

### Issue: Build errors
**Fix**: Restart TypeScript Server (Cmd+Shift+P → "TypeScript: Restart")

---

## 📊 Test Results Summary

After completing all tests, you should have:
- ✅ 2-3 materials created
- ✅ 1+ consumption records
- ✅ 1+ production job linked
- ✅ Notes saved
- ✅ Low stock alerts working
- ✅ All CRUD operations verified
- ✅ Responsive design confirmed
- ✅ Validations tested

---

## 🎉 Success Criteria

✅ All 13 tests pass
✅ No errors in console
✅ Toast notifications work
✅ Data persists after refresh
✅ UI responsive
✅ Color coding correct

**Total Testing Time**: ~10-15 minutes

---

## 📸 Screenshots Checklist

For documentation, capture:
1. [ ] Materials list (desktop)
2. [ ] Materials list (mobile)
3. [ ] Add/Edit modal
4. [ ] Material details - Overview
5. [ ] Material details - Consumption
6. [ ] Material details - Jobs
7. [ ] Low stock alert
8. [ ] Consume material modal
9. [ ] Filter active states

---

## Next Steps

After successful testing:
1. ✅ Create real materials for production
2. ✅ Set realistic min stock levels
3. ✅ Train staff on material consumption workflow
4. ✅ Monitor low stock alerts regularly
5. ✅ Use notes for supplier info

**Happy Testing! 🚀**
