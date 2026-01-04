# Reports & Analytics - Quick Testing Guide

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Server va rula pe `http://localhost:3000`

### 2. Get Admin Session Token

1. Deschide browser la `http://localhost:3000/login`
2. Login cu credențiale ADMIN:
   - Email: `admin@sanduta.art`
   - Password: *parola ta de admin*
3. Deschide DevTools (F12) → Application → Cookies
4. Copiază valoarea cookie-ului `next-auth.session-token`

### 3. Run Test Script
```bash
# Metoda 1: Prompt pentru token
./scripts/test-reports-api.sh

# Metoda 2: Token ca parametru
./scripts/test-reports-api.sh "your-session-token-here"
```

---

## 📊 Manual Testing per Endpoint

### 1. Overview KPIs
```bash
curl http://localhost:3000/api/admin/reports/overview \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq
```

**Expected output**:
```json
{
  "totalRevenue": 50000.00,
  "totalOrders": 250,
  "totalCustomers": 120,
  "totalProducts": 45,
  "avgOrderValue": 200.00,
  "monthlyRevenue": 12000.00,
  "monthlyOrders": 50,
  "monthlyGrowth": 15.5,
  "ordersGrowth": 12.3,
  "topSellingProduct": {
    "id": "...",
    "name": "Cutie Premium",
    "sales": 120
  }
}
```

### 2. Sales Analytics
```bash
curl http://localhost:3000/api/admin/reports/sales \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq '.salesByMonth'
```

**Check**:
- ✅ `salesByMonth` array cu 12 luni
- ✅ `salesByDay` array cu 30 zile
- ✅ `salesBySource` cu procente care sumează 100%
- ✅ `salesByStatus` cu PENDING, COMPLETED, CANCELLED

### 3. Products Analytics
```bash
curl http://localhost:3000/api/admin/reports/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq '.topSellingProducts | .[0:5]'
```

**Check**:
- ✅ Top 20 produse sortate după revenue
- ✅ `productsByCategory` cu agregări pe categorie
- ✅ `revenueByProduct` cu procente
- ✅ `productPerformance` cu metrici detaliate

### 4. Customers Analytics
```bash
curl http://localhost:3000/api/admin/reports/customers \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq '.customerLifetimeValue'
```

**Check**:
- ✅ `topCustomers` cu totalSpent > 0
- ✅ `customerLifetimeValue` cu average, median, total
- ✅ `customerSegments` cu high/medium/low
- ✅ `returningCustomers` cu count și percentage

### 5. Operators Analytics
```bash
curl http://localhost:3000/api/admin/reports/operators \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq '.operatorEfficiency'
```

**Check**:
- ✅ `operatorJobs` cu jobsCompleted și avgCompletionTime
- ✅ `completionTimesByOperator` cu min/max/avg times
- ✅ `operatorEfficiency` cu efficiency score 0-100
- ✅ `avgCompletionTimeAllOperators` > 0

### 6. Materials Analytics
```bash
curl http://localhost:3000/api/admin/reports/materials \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  | jq '.lowStockMaterials'
```

**Check**:
- ✅ `topConsumedMaterials` sortate după totalConsumed
- ✅ `consumptionByMonth` cu 12 luni
- ✅ `lowStockMaterials` cu currentStock < minStock
- ✅ `totalCost` calculat corect

---

## 🧪 Testing Checklist

### Authentication
- [ ] Request fără session token → 403 Unauthorized
- [ ] Request cu token invalid → 403 Unauthorized
- [ ] Request cu user role OPERATOR → 403 Unauthorized
- [ ] Request cu user role MANAGER → 200 OK
- [ ] Request cu user role ADMIN → 200 OK

### Data Validation
- [ ] Toate totalurile sunt > 0 (dacă există date)
- [ ] Procentele sumează 100% (unde e cazul)
- [ ] Datele lunare sunt sortate cronologic
- [ ] Top N liste sunt sortate corect (desc)
- [ ] CLV median ≤ average (în general)

### Performance
- [ ] Prima cerere (fără cache) < 500ms
- [ ] A doua cerere (cu cache) < 10ms
- [ ] Response size < 10 KB per endpoint
- [ ] No N+1 query issues (check logs)

### Edge Cases
- [ ] Database gol → returnează 0 pentru toate totalurile
- [ ] Un singur record → nu crashuiește calculele
- [ ] Diviziune la zero → handled gracefully
- [ ] Date null în agregări → ignorate corect

---

## 🐛 Common Issues

### Issue: 403 Unauthorized
**Cauză**: Session token invalid sau expirat  
**Fix**: 
1. Logout și login din nou
2. Copiază un token fresh din cookies

### Issue: Empty arrays în response
**Cauză**: Nu există date în database pentru perioada specificată  
**Fix**:
1. Adaugă date de test cu `npm run seed`
2. Verifică că există Orders, Products, Materials, etc.

### Issue: Cache prea agresiv (date nu se actualizează)
**Cauză**: TTL cache 5 minute  
**Fix**:
1. Așteaptă 5 minute
2. Sau restart server pentru cache clear

### Issue: Slow queries (>1s)
**Cauză**: Lipsă indexuri database  
**Fix**:
```sql
-- Adaugă indexuri necesare (vezi docs/REPORTS_BACKEND.md)
CREATE INDEX idx_orders_created_at ON "Order"("createdAt");
CREATE INDEX idx_orders_customer_id ON "Order"("customerId");
-- etc.
```

---

## 📈 Performance Testing

### Load Testing cu Apache Bench
```bash
# Test Overview endpoint
ab -n 100 -c 10 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  http://localhost:3000/api/admin/reports/overview

# Expected:
# - Requests per second: > 50
# - Mean time per request: < 200ms (with cache)
```

### Memory Profiling
```bash
# Start server with profiling
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Monitor memory usage
watch -n 1 'ps aux | grep node | grep -v grep'
```

---

## 📊 Sample Data Setup

Pentru testare completă, asigură-te că ai:

```bash
# Seed database cu date de test
npm run seed

# Verifică că ai:
# - ≥ 100 Orders (ultimele 12 luni)
# - ≥ 50 Customers
# - ≥ 20 Products în 5+ categorii
# - ≥ 50 ProductionJobs (completed și in-progress)
# - ≥ 10 Materials cu usage records
```

### Create Sample Reports Data
```sql
-- Verifică distribuția comenzilor pe luni
SELECT 
  DATE_TRUNC('month', "createdAt") as month,
  COUNT(*) as orders,
  SUM("totalPrice") as revenue
FROM "Order"
GROUP BY month
ORDER BY month DESC
LIMIT 12;

-- Verifică top produse
SELECT 
  p.name,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.price * oi.quantity) as total_revenue
FROM "OrderItem" oi
JOIN "Product" p ON p.id = oi."productId"
GROUP BY p.id, p.name
ORDER BY total_revenue DESC
LIMIT 10;
```

---

## ✅ Success Criteria

Task 10.1 este considerat complet când:

- [x] Toate cele 6 endpoint-uri returnează 200 OK
- [x] Response-urile au structura corectă conform types
- [x] Nu există erori TypeScript în `npm run build`
- [x] Cache funcționează (a 2-a request e mai rapidă)
- [x] Autentificare și autorizare funcționează
- [x] Documentație completă în `docs/REPORTS_BACKEND.md`
- [x] Script de testare `scripts/test-reports-api.sh`

---

## 🎯 Next: Task 10.2

După ce backend-ul e testat și validat:

1. Implementare UI Dashboard cu grafice
2. Date range picker pentru perioadă customizabilă
3. Export rapoarte în PDF/CSV
4. Real-time updates (optional)
5. Drill-down pentru detalii

---

**Status**: ✅ Backend Complete  
**Ready for**: UI Implementation  
**Last Updated**: Ianuarie 2025
