# 🚀 Ghid Rapid: Adăugare Inventar Tipografie

## Metoda 1: Import Automat (RECOMANDAT când PostgreSQL rulează)

```bash
cd /workspaces/sanduta.art
npx tsx prisma/seed-inventory.ts
```

**Rezultat:** Toate cele 40+ entități adăugate automat în ~30 secunde.

---

## Metoda 2: Import Manual prin Admin Panel

### Acces Admin Panel
1. Deschide: http://localhost:3000/admin
2. Login: `admin@sanduta.art` / `admin123`

### A. Materiale (14 bucăți) - `/admin/materials`

Clickează "Add Material" pentru fiecare:

**Materiale Foto:**
- Hârtie Foto Lucioasă | SKU: PHOTO-GLOSS-260 | m² | Stoc: 50 | Min: 10 | Cost: 25.50
- Hârtie Foto Mată | SKU: PHOTO-MATT-260 | m² | Stoc: 45 | Min: 10 | Cost: 24.00

**Office Papers:**
- Hârtie Offset 90g | SKU: OFFSET-90 | m² | Stoc: 200 | Min: 50 | Cost: 5.50
- Hârtie Offset 120g | SKU: OFFSET-120 | m² | Stoc: 150 | Min: 30 | Cost: 7.80
- Hârtie Offset 160g | SKU: OFFSET-160 | m² | Stoc: 100 | Min: 20 | Cost: 10.50

**Carton:**
- Carton 250g | SKU: CARD-250 | m² | Stoc: 80 | Min: 15 | Cost: 15.00
- Carton 300g | SKU: CARD-300 | m² | Stoc: 60 | Min: 10 | Cost: 18.50

**Speciale:**
- Autocolant PVC | SKU: VINYL-PVC | m² | Stoc: 40 | Min: 10 | Cost: 35.00
- Canvas | SKU: CANVAS-380 | m² | Stoc: 30 | Min: 5 | Cost: 45.00
- Hârtie Magnetică | SKU: MAGNETIC-SHEET | m² | Stoc: 20 | Min: 5 | Cost: 55.00
- Hârtie Reciclabilă | SKU: RECYCLED-100 | m² | Stoc: 70 | Min: 15 | Cost: 8.00
- Hârtie Colorată | SKU: COLOR-MIX-120 | m² | Stoc: 50 | Min: 10 | Cost: 9.50
- Hârtie Transparentă | SKU: TRANSPARENT-100 | m² | Stoc: 25 | Min: 5 | Cost: 22.00
- Hârtie Termică | SKU: THERMAL-80 | m² | Stoc: 60 | Min: 15 | Cost: 12.00

### B. Metode de Imprimare (8 bucăți) - `/admin/print-methods`

Clickează "Add Print Method":

1. Inkjet | Tip: Digital | Cost/m²: 8.50 | Viteză: 25 m²/oră | Max Width: 1118mm
2. Laser | Tip: Digital | Cost/m²: 6.00 | Viteză: 80 ppm | Max Width: 330mm
3. Sublimare | Tip: Transfer | Cost/m²: 12.00 | Viteză: 15 m²/oră | Max Width: 1600mm
4. UV | Tip: Digital | Cost/m²: 18.00 | Viteză: 30 m²/oră | Max Width: 2500mm
5. Eco-Solvent | Tip: Large Format | Cost/m²: 14.00 | Viteză: 20 m²/oră | Max Width: 1600mm
6. Termotransfer | Tip: Transfer | Cost/m²: 10.00 | Viteză: 40/oră | Max Width: 400mm
7. DTG | Tip: Textile | Cost/Foaie: 2.50 | Viteză: 30 tricouri/oră | Max Width: 400mm
8. DTF | Tip: Transfer | Cost/m²: 15.00 | Viteză: 25 m²/oră | Max Width: 600mm

### C. Finisaje (12 bucăți) - `/admin/finishing`

Clickează "Add Finishing":

1. Laminare Lucioasă | Tip: Laminare | Fix: 5.00 | /m²: 8.00 | Timp: 300s
2. Laminare Mată | Tip: Laminare | Fix: 5.00 | /m²: 8.00 | Timp: 300s
3. Capsare | Tip: Îndosariere | Fix: 2.00 | /buc: 0.10 | Timp: 60s
4. Spiralare | Tip: Îndosariere | Fix: 3.00 | /buc: 0.50 | Timp: 180s
5. Tăiere Contur | Tip: Tăiere | Fix: 10.00 | /m²: 12.00 | Timp: 600s
6. Biguire | Tip: Finisare | Fix: 2.00 | /buc: 0.05 | Timp: 120s
7. Perforare | Tip: Finisare | Fix: 1.50 | /buc: 0.03 | Timp: 90s
8. Pliere | Tip: Finisare | Fix: 1.00 | /buc: 0.05 | Timp: 60s
9. Îndosariere | Tip: Îndosariere | Fix: 5.00 | /buc: 1.00 | Timp: 300s
10. Colț Rotunjit | Tip: Finisare | Fix: 3.00 | /buc: 0.10 | Timp: 120s
11. Aplicare Magnet | Tip: Montaj | Fix: 5.00 | /m²: 20.00 | Timp: 180s
12. Aplicare Suport Rigid | Tip: Montaj | Fix: 8.00 | /m²: 25.00 | Timp: 300s

### D. Echipamente (6 bucăți) - `/admin/machines`

Clickează "Add Machine":

1. Epson SureColor P700 | Tip: Photo Inkjet | Cost/oră: 15.00 | Viteză: 13 min/A2
2. Canon imagePROGRAF PRO-300 | Tip: Photo Inkjet | Cost/oră: 18.00 | Viteză: 90s/A3
3. HP Latex 315 | Tip: Large Format | Cost/oră: 35.00 | Viteză: 23 m²/oră
4. Mimaki CJV300-160 | Tip: Print & Cut | Cost/oră: 40.00 | Viteză: 20 m²/oră
5. Xerox Versant 180 | Tip: Production | Cost/oră: 50.00 | Viteză: 80 ppm
6. Ricoh Pro C5300s | Tip: Production | Cost/oră: 55.00 | Viteză: 90 ppm

---

## ⏱️ Timp necesar

- **Import automat:** ~30 secunde
- **Import manual:** ~20-30 minute (cu copiere/lipire)

---

## ✅ Verificare Rapidă

După import, verifică:

```bash
# Verifică numărul de înregistrări
curl http://localhost:3000/api/admin/materials | jq length  # Ar trebui să fie 14
curl http://localhost:3000/api/admin/print-methods | jq length  # 8
curl http://localhost:3000/api/admin/finishing | jq length  # 12
curl http://localhost:3000/api/admin/machines | jq length  # 6
```

Sau deschide:
- http://localhost:3000/admin/materials
- http://localhost:3000/admin/print-methods
- http://localhost:3000/admin/finishing
- http://localhost:3000/admin/machines

---

## 🎯 Următorii Pași

1. ✅ Import inventar complet
2. 🔗 Configurare compatibilități materiale-metode
3. 🧪 Test creare produs nou în configurator
4. 📝 Test comandă cu calcul automat costuri
5. 📊 Verificare rapoarte costuri materiale

---

**Vezi detalii complete în:** `docs/INVENTORY_COMPLETE_DATA.md`
