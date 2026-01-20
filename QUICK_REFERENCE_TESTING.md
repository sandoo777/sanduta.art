# 🚀 Quick Reference - Testare Manuală sanduta.art

## Start rapid (1 minut)

```bash
# 1. Start server
npm run dev

# 2. Deschide browser
# URL: http://localhost:3000

# 3. Login admin
# Email: admin@sanduta.art
# Password: admin123
```

## Features noi de testat

### 1. Timeline & Notes (Audit Trail)
**URL:** `http://localhost:3000/admin/orders`

**Steps:**
1. Click pe un order din listă
2. Scroll la secțiunea "Timeline"
3. Verifică events: `status_change`, `note_added`, `payment_update`
4. Click "Add Note"
5. Type message: "Test note pentru client"
6. Toggle OFF "Internal Note" (pentru client vizibil)
7. Submit → verifică că apare instant în timeline

**API Test:**
```bash
# Get timeline
curl http://localhost:3000/api/admin/orders/ORDER_ID/timeline

# Create note
curl -X POST http://localhost:3000/api/admin/orders/ORDER_ID/notes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test API note","isInternal":true}'
```

---

### 2. Estimated Delivery Date
**URL:** `http://localhost:3000/admin/orders/ORDER_ID`

**Steps:**
1. Găsește order cu status "DELAYED"
2. Verifică câmpul "Estimated Delivery Date"
3. Click pe date picker
4. Selectează dată viitoare (ex: +7 zile)
5. Save changes
6. Refresh page → verifică că data s-a salvat

---

### 3. Export Rapoarte (PDF/Excel/CSV)
**URL:** `http://localhost:3000/admin/reports`

**Steps:**
1. Click buton "Export" (top-right corner)
2. Selectează format:
   - **Export as Excel** → download `.xlsx`
   - **Export as PDF** → download `.pdf`
   - **Export as CSV** → download `.csv`
3. Deschide fișierul descărcat
4. Verifică:
   - Excel: Columns formatate, summary sheet
   - PDF: Readable, nu trunchiat
   - CSV: UTF-8 encoding, comma-separated

**API Test:**
```bash
# Export sales report as Excel
curl -X POST http://localhost:3000/api/admin/reports/export-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "sales",
    "format": "excel",
    "dateRange": {"start": "2024-01-01", "end": "2024-12-31"}
  }' \
  --output sales-report.xlsx

# Deschide Excel:
open sales-report.xlsx  # macOS
xdg-open sales-report.xlsx  # Linux
```

**Report Types:**
- `sales` - Vânzări și revenue
- `orders` - Toate comenzile
- `products` - Catalog produse
- `inventory` - Stoc materiale
- `operators` - Performanță operatori

---

### 4. Responsive Design
**URL:** `http://localhost:3000`

**Steps:**
1. Open Chrome DevTools: `F12` sau `Cmd+Option+I`
2. Toggle device toolbar: `Ctrl+Shift+M` sau `Cmd+Shift+M`
3. Test breakpoints:

#### Mobile (375px - iPhone SE)
- Menu hamburger funcțional ✓
- Product cards stack vertical (1 coloană) ✓
- Checkout form fullwidth ✓
- No horizontal scroll ✓

#### Tablet (768px - iPad)
- Sidebar permanent ✓
- Product grid 2 coloane ✓
- Checkout 2 coloane (form + summary) ✓

#### Desktop (1920px)
- Full layout 3 coloane ✓
- All menu items visible ✓
- Product grid 3-4 coloane ✓

**Quick Test Pagini:**
- Homepage: `/`
- Products: `/products`
- Product detail: `/products/PRODUCT_ID`
- Cart: `/cart`
- Checkout: `/checkout`
- Admin: `/admin`

---

### 5. Real Data Integration
**URL:** `http://localhost:3000/admin/production`

**Verificare:**
- ✅ Machines list: Real data (no `[Mock]` labels)
- ✅ Operators list: Real users din database
- ✅ Production jobs: Real assignments

**API Check:**
```bash
# Machines
curl http://localhost:3000/api/admin/machines

# Operators
curl http://localhost:3000/api/admin/users?role=OPERATOR

# Production jobs
curl http://localhost:3000/api/admin/production/jobs
```

---

## Troubleshooting

### Server nu pornește
```bash
# Kill process pe port 3000
fuser -k 3000/tcp

# Repornește
npm run dev
```

### 401 Unauthorized
```bash
# Re-login la admin
# URL: http://localhost:3000/admin/login
# Email: admin@sanduta.art
# Password: admin123
```

### Download nu funcționează (Export)
1. Check browser Console pentru erori
2. Check Network tab → status 500?
3. Verifică permissions (ADMIN/MANAGER role)

### Timeline gol
1. Verifică că order ID există
2. Check database: `npm run prisma:studio`
3. Create manual event via API

---

## Lighthouse Audit (Performance Check)

```bash
# 1. Build production
npm run build

# 2. Start production server
npm start

# 3. Open Chrome Incognito
# URL: http://localhost:3000

# 4. DevTools → Lighthouse tab
# - Device: Mobile
# - Categories: Performance, Accessibility, Best Practices, SEO
# - Generate report

# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 90
# SEO: > 90
```

---

## Email Testing

### Test email sending
```bash
# API call
curl -X POST http://localhost:3000/api/admin/test/email

# Check inbox: admin@sanduta.art
# Check Resend dashboard: https://resend.com/dashboard
```

### Verify delivery
1. Login Resend: https://resend.com/login
2. Navigate to "Emails" tab
3. Check recent sends:
   - ✅ Delivered (green)
   - ❌ Bounced (red)
   - ⏳ Pending (yellow)

---

## Database Inspect

```bash
# Open Prisma Studio
npm run prisma:studio

# URL: http://localhost:5555

# Tables to check:
# - OrderTimeline (new events)
# - OrderNote (new notes)
# - Order (estimatedDeliveryDate field)
# - Material (inventory data)
# - User (operators list)
```

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Production server

# Database
npm run prisma:studio    # Database UI
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations
npm run prisma:seed      # Seed test data

# Testing
npm test                 # Vitest
npm run test:ui          # Vitest UI
npm run lint             # ESLint check

# Production
vercel --prod            # Deploy Vercel
vercel logs --prod       # Production logs
```

---

## Documentation Links

- **Admin Panel**: [ADMIN_PANEL_REZUMAT.md](./ADMIN_PANEL_REZUMAT.md)
- **Production Deploy**: [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)
- **Responsive Testing**: [docs/RESPONSIVE_TESTING_GUIDE.md](./docs/RESPONSIVE_TESTING_GUIDE.md)
- **Export Manual**: [docs/EXPORT_RAPOARTE_MANUAL.md](./docs/EXPORT_RAPOARTE_MANUAL.md)
- **Final Report**: [RAPORT_FINAL_TIMELINE_EXPORT_RESPONSIVE.md](./RAPORT_FINAL_TIMELINE_EXPORT_RESPONSIVE.md)

---

## Checklist Pre-Production

- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Build successful: `npm run build`
- [ ] Manual testing complete (vezi MANUAL_TESTING_QUICKSTART.sh)
- [ ] Responsive verified (mobile, tablet, desktop)
- [ ] Email sending works (check Resend dashboard)
- [ ] Database migrations applied: `npx prisma migrate status`
- [ ] Environment variables set: `.env.production`
- [ ] Production deploy: `vercel --prod`
- [ ] Post-deploy monitoring: Check logs, errors, performance

---

**Status:** 🟢 **PRODUCTION READY**  
**Last updated:** 2026-01-20  
**Next step:** Deploy to production → [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)
