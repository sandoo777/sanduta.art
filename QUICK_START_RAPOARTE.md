# 🚀 Quick Start - Sistem Rapoarte

## Acces Rapid

```bash
# Start development server
npm run dev

# Navigate to reports dashboard
http://localhost:3000/dashboard/reports
```

## 📊 Rapoarte Disponibile

| Raport | URL | API Endpoint | Descriere |
|--------|-----|--------------|-----------|
| 💰 **Sales** | `/dashboard/reports/sales` | `GET /api/admin/reports/sales` | Revenue, produse top, clienți top |
| 📦 **Orders** | `/dashboard/reports/orders` | `GET /api/admin/reports/orders` | Status comenzi, plăți, livrări |
| 🏭 **Production** | `/dashboard/reports/production` | `GET /api/admin/reports/production` | Eficiență, bottlenecks, job tracking |
| 💸 **Costs** | `/dashboard/reports/costs` | `GET /api/admin/reports/costs` | Materiale, manoperă, overhead |
| 📈 **Profitability** | `/dashboard/reports/profitability` | `GET /api/admin/reports/profitability` | Marje profit, ROI, breakdown |
| ⚙️ **Machines** | `/dashboard/reports/machines` | `GET /api/admin/reports/machines` | Utilizare, uptime, mentenanță |
| 👷 **Operators** | `/dashboard/reports/operators` | `GET /api/admin/reports/operators` | KPIs, productivitate, calitate |
| 👥 **Customers** | `/dashboard/reports/customers` | `GET /api/admin/reports/customers` | LTV, segmente, preferințe |

## 🔐 Permisiuni

```typescript
ADMIN:    Acces complet la toate rapoartele
MANAGER:  Acces la Sales, Orders, Production, Costs
OPERATOR: Acces doar la Production, Machines
```

## 📤 Export Funcționalitate

**Formate disponibile:**
- CSV - pentru import în alte sisteme
- XLSX - Excel cu formatare
- PDF - pentru prezentări

**Cum să exporți:**
1. Deschide un raport
2. Click pe butonul "Export"
3. Selectează formatul dorit
4. Download automat

Sau folosește **Export Center:**
```
http://localhost:3000/dashboard/reports/export
```

## 🔧 API Usage

### Exemplu: Sales Report

```typescript
// Frontend (useReports hook)
const { fetchSalesReport } = useReports();

const data = await fetchSalesReport({
  dateRange: {
    from: new Date('2026-01-01'),
    to: new Date('2026-01-31')
  }
});

// Direct API call
const response = await fetch('/api/admin/reports/sales?from=2026-01-01&to=2026-01-31');
const report = await response.json();
```

### Response Structure

```json
{
  "metrics": {
    "totalRevenue": 150000,
    "averageOrderValue": 750,
    "totalOrders": 200,
    "growthRate": 12.5
  },
  "byCategory": [
    {
      "category": "Business Cards",
      "revenue": 50000,
      "orders": 80,
      "percentage": 33.3
    }
  ],
  "topCustomers": [
    {
      "customerId": "user_123",
      "customerName": "Acme Corp",
      "totalRevenue": 15000,
      "ordersCount": 20
    }
  ]
}
```

## 📝 Componente Principale

### 1. useReports Hook
```typescript
import { useReports } from '@/modules/admin/useReports';

const { 
  fetchSalesReport,
  fetchOrdersReport,
  // ... 6 more fetch functions
  loading,
  error 
} = useReports();
```

### 2. useExports Hook
```typescript
import { useExports } from '@/modules/admin/useExports';

const { 
  exportSales,
  exportOrders,
  // ... 6 more export functions
  loading 
} = useExports();

// Usage
await exportSales('xlsx', dateRange);
```

### 3. ReportLayout Component
```typescript
import { ReportLayout, DateRangePicker, MetricCard } from '@/components/reports/ReportLayout';

<ReportLayout
  title="Sales Report"
  description="Revenue analytics"
  icon={<Icon />}
  onRefresh={loadData}
  onExport={exportData}
  loading={loading}
>
  {/* Your report content */}
</ReportLayout>
```

## 🎨 UI Components Used

- `Card` - pentru secțiuni
- `Button` - actions (primary/secondary/ghost)
- `StatusBadge` - pentru status-uri color-coded
- `MetricCard` - pentru KPIs
- `DateRangePicker` - pentru filtrare date

## 🐛 Debugging

### Verifică logs
```bash
# În browser console
# Toate operațiile sunt loggate via logger

# În terminal (server)
npm run dev
# Logs vor apărea pentru fiecare API call
```

### Common Issues

**1. API returnează 401 Unauthorized**
```typescript
// Verifică că ești autentificat:
// Navigate to /login și autentifică-te ca ADMIN
```

**2. No data în rapoarte**
```typescript
// Verifică că ai date în baza de date pentru perioada selectată
// Sau ajustează date range în DateRangePicker
```

**3. Export nu funcționează**
```typescript
// Verifică browser console pentru erori
// Asigură-te că ai permisiuni de download
```

## 📚 Documentație Completă

- [TODO_LIST_FINALIZAT.md](TODO_LIST_FINALIZAT.md) - Status complet proiect
- [RAPORT_SISTEM_RAPOARTE_FINAL.md](RAPORT_SISTEM_RAPOARTE_FINAL.md) - Detalii tehnice
- [docs/RELIABILITY.md](docs/RELIABILITY.md) - Error handling patterns

## 🚀 Next Steps (Optional)

### Adaugă Recharts Charts
```bash
npm install recharts

# Apoi în fiecare pagină de raport:
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={report.byPeriod}>
  <Line dataKey="revenue" stroke="#3B82F6" />
  <XAxis dataKey="date" />
  <YAxis />
</LineChart>
```

### Adaugă Tests
```bash
npm run test

# Create test files:
src/__tests__/useReports.test.ts
src/__tests__/api/reports.test.ts
```

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 10 Ianuarie 2026
