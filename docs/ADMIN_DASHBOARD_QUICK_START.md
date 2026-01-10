# Quick Start Guide - Admin Dashboard

## 🚀 Acces

**URL:** `http://localhost:3000/dashboard`

**Autentificare necesară:**
- **Role:** ADMIN sau MANAGER
- **Credentials test:**
  - Email: `admin@sanduta.art`
  - Password: `admin123`

---

## 📊 Componente Dashboard

### 1. **KPI Cards** (7 metrici)
- Vânzări astăzi (RON)
- Comenzi astăzi
- În producție
- Profit estimat
- Timp mediu producție (ore)
- Rata livrare la timp (%)
- Utilizare echipamente (%)

**Auto-refresh:** 60 secunde

### 2. **Sales Chart**
**Filtre disponibile:**
- Perioada: Zi / Săptămână / Lună / An
- Tip grafic: Line / Bar
- Comparație: ON/OFF (cu perioada anterioară)

**Interacțiuni:**
- Hover pentru valori exacte
- Toggle pentru tip grafic
- Legendă pentru comparații

### 3. **Orders Overview**
**Donut chart** cu 9 statusuri:
- PENDING (galben)
- IN_PREPRODUCTION (mov)
- IN_DESIGN (portocaliu)
- IN_PRODUCTION (albastru)
- IN_PRINTING (cyan)
- QUALITY_CHECK (indigo)
- READY_FOR_DELIVERY (emerald)
- DELIVERED (verde)
- CANCELLED (roșu)

### 4. **Production Overview**
**4 metrici + Throughput Chart:**
- Active (în producție acum)
- Delayed (întârziate)
- Completed Today (finalizate azi)
- Queued (în așteptare)
- Throughput: bar chart ultimele 7 zile

### 5. **Machines Utilization**
**Listă echipamente:**
- Status: active / idle / maintenance
- Progress bars cu utilizare %
- Active time vs Idle time
- Color coding: verde (≥80%), albastru (≥50%), portocaliu (<50%)

### 6. **Operator Performance**
**Top 5 operatori:**
- KPI Score (color-coded)
- Jobs Completed
- Avg Time per job
- Accuracy %
- Errors count

### 7. **Recent Orders**
**Tabel ultimele 10 comenzi:**
- Order # (cu link către detalii)
- Client (nume + email)
- Total (RON)
- Status (badge colorat)
- Date (relative: "5 min în urmă")
- Acțiune: "Vezi" detalii

**Auto-refresh:** 30 secunde

### 8. **Alerts Panel**
**Notificări critice:**
- **Error** (roșu): comenzi întârziate, producție blocată
- **Warning** (portocaliu): comenzi fără fișiere
- **Info** (albastru): comenzi noi, mentenanță

**Filtre:** Toate / Erori / Avertizări / Info

**Auto-refresh:** 30 secunde

---

## 🔧 API Endpoints

```
GET /api/admin/analytics/kpis
GET /api/admin/analytics/sales?period=week&compare=true
GET /api/admin/analytics/orders
GET /api/admin/analytics/production
GET /api/admin/analytics/machines
GET /api/admin/analytics/operators
GET /api/admin/analytics/recent-orders?limit=10
GET /api/admin/analytics/alerts
```

**Autorizare:** Bearer token (NextAuth session)

---

## 📱 Responsive Design

- **Mobile (< 640px):** 1 coloană
- **Tablet (640-1024px):** 2 coloane
- **Desktop (> 1024px):** 3-7 coloane (optimizat)

---

## 🔄 Auto-Refresh

| Componentă | Interval |
|------------|----------|
| KPI Cards | 60s |
| Sales Chart | 60s |
| Orders Overview | 60s |
| Production Overview | 60s |
| Machines | 60s |
| Operators | 60s |
| Recent Orders | 30s |
| Alerts | 30s |

**Notă:** Intervale pot fi ajustate în fiecare componentă.

---

## 🛠️ Development

### Start dev server
```bash
npm run dev
```

### Build pentru producție
```bash
npm run build
npm start
```

### Test API endpoints
```bash
# Cu curl (după autentificare)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/analytics/kpis
```

---

## 📚 Documentație Completă

Vezi [RAPORT_ADMIN_DASHBOARD.md](./RAPORT_ADMIN_DASHBOARD.md) pentru:
- Arhitectură detaliată
- Specificații API
- Type definitions
- Security & Performance
- Îmbunătățiri viitoare

---

## 🐛 Troubleshooting

### Dashboard nu se încarcă
1. Verifică că ești autentificat
2. Verifică rolul (trebuie ADMIN sau MANAGER)
3. Check console pentru erori API

### Date nu se actualizează
1. Verifică conexiunea la baza de date
2. Check Prisma schema (Order, User models)
3. Verifică logs API în terminal

### Grafice arată date greșite
1. Verifică că ai comenzi în DB
2. Check că paymentStatus='PAID' pentru vânzări
3. Verifică statusurile comenzilor

---

## 🎯 Next Steps

1. **Integrare date reale:**
   - Machines utilization (actual equipment data)
   - Operator performance (ProductionLog table)
   
2. **Îmbunătățiri:**
   - Export dashboard (PDF/Excel)
   - Date range picker personalizat
   - Push notifications pentru alerte

3. **Optimizări:**
   - Server-side caching
   - WebSocket pentru real-time updates
   - Dashboard widgets customizabile

---

**Questions?** Check docs sau contactează echipa de dezvoltare.

**Status:** ✅ Production Ready (v1.0)
