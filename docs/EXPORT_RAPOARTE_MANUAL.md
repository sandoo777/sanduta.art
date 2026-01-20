# 📊 Manual de utilizare Export Rapoarte - Admin Panel

## Caracteristici implementate

### Formate disponibile
- **Excel (.xlsx)**: Pentru analiză și manipulare date
- **PDF**: Pentru printare și partajare
- **CSV**: Pentru import în alte sisteme

### Tipuri rapoarte
1. **Sales Report** - Vânzări și revenue
2. **Orders Report** - Toate comenzile cu detalii
3. **Products Report** - Catalog produse și performanță
4. **Inventory Report** - Stoc materiale și valoare
5. **Operators Report** - Performanță operatori

## Utilizare în cod

### Import component
```tsx
import { ExportButton } from '@/components/admin/ExportButton';
```

### Exemple utilizare

#### 1. Export raport vânzări (cu date range)
```tsx
<ExportButton
  reportType="sales"
  dateRange={{
    start: '2024-01-01',
    end: '2024-12-31'
  }}
  label="Export Sales"
/>
```

#### 2. Export comenzi (cu filtru status)
```tsx
<ExportButton
  reportType="orders"
  filters={{ status: 'DELIVERED' }}
  label="Export Delivered Orders"
/>
```

#### 3. Export produse (cu filtru categorie)
```tsx
<ExportButton
  reportType="products"
  filters={{ 
    categoryId: 'clx123...',
    active: true 
  }}
  label="Export Active Products"
/>
```

#### 4. Export inventar (low stock)
```tsx
<ExportButton
  reportType="inventory"
  filters={{ 
    lowStock: true,
    threshold: 10 
  }}
  label="Export Low Stock"
/>
```

#### 5. Export performanță operatori
```tsx
<ExportButton
  reportType="operators"
  dateRange={{
    start: startDate,
    end: endDate
  }}
  label="Export Operators Performance"
/>
```

## Integrare în pagini admin

### Admin Reports Page (`/admin/reports`)

```tsx
// src/app/admin/reports/page.tsx
import { ExportButton } from '@/components/admin/ExportButton';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        
        <ExportButton
          reportType="sales"
          dateRange={dateRange}
          label="Download Report"
        />
      </div>

      {/* Charts and tables */}
    </div>
  );
}
```

### Admin Orders Page (`/admin/orders`)

```tsx
// src/app/admin/orders/page.tsx
import { ExportButton } from '@/components/admin/ExportButton';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        
        <div className="flex gap-2">
          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          <ExportButton
            reportType="orders"
            filters={statusFilter !== 'all' ? { status: statusFilter } : {}}
            label="Export Orders"
          />
        </div>
      </div>

      {/* Orders table */}
    </div>
  );
}
```

### Admin Products Page (`/admin/products`)

```tsx
// src/app/admin/products/page.tsx
import { ExportButton } from '@/components/admin/ExportButton';

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Catalog</h1>
        
        <ExportButton
          reportType="products"
          filters={{ active: true }}
          label="Export Active Products"
        />
      </div>

      {/* Products grid */}
    </div>
  );
}
```

## Structură date exportate

### Sales Report (Excel/CSV)
```
Columns:
- Order Number
- Customer Name
- Customer Email
- Total Price
- Status
- Payment Status
- Date
- Items Count

Summary sheet (Excel only):
- Total Revenue
- Total Orders
- Average Order Value
- Period
```

### Orders Report
```
Columns:
- Order Number
- Customer Name
- Customer Email
- Total Price
- Status
- Payment Status
- Delivery Status
- Created At
- Items (comma-separated)
```

### Products Report
```
Columns:
- Name
- SKU
- Category
- Price
- Active
- Total Orders
- Created At
```

### Inventory Report
```
Columns:
- Name
- SKU
- Stock
- Min Stock
- Unit
- Cost Per Unit
- Total Value
- Status (IN_STOCK/LOW_STOCK/OUT_OF_STOCK)
```

### Operators Report
```
Columns:
- Name
- Email
- Role
- Total Jobs
- Completed Jobs
- Efficiency (%)
- Assigned Orders
```

## API Endpoint

### POST `/api/admin/reports/export-advanced`

**Request body:**
```json
{
  "reportType": "sales",
  "format": "excel",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "filters": {
    "status": "DELIVERED",
    "categoryId": "clx123..."
  }
}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel)
- Content-Type: `application/pdf` (PDF)
- Content-Type: `text/csv` (CSV)
- Content-Disposition: `attachment; filename="sales-report-1234567890.xlsx"`

**Permisiuni:**
- Role required: `ADMIN` sau `MANAGER`

## Styling și UX

### Buton dropdown
- Hover effect pe fiecare opțiune
- Icoane colorate (Excel = verde, PDF = roșu, CSV = albastru)
- Loading state cu spinner
- Disabled state când export în progres
- Backdrop pentru închidere dropdown la click outside

### Mobile responsive
```tsx
// Buton fullwidth pe mobile
<div className="w-full sm:w-auto">
  <ExportButton
    reportType="sales"
    dateRange={dateRange}
    label="Export"
  />
</div>
```

## Error handling

### Client-side
```tsx
// ExportButton.tsx
try {
  const response = await fetch('/api/admin/reports/export-advanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportType, format, dateRange, filters })
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  // Download logic...
} catch (error) {
  console.error('Export error:', error);
  alert('Failed to export report. Please try again.');
}
```

### Server-side
```typescript
// route.ts
try {
  const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  // Validate input
  if (!reportType || !format) {
    return createErrorResponse('Report type and format are required', 400);
  }

  // Generate report...
} catch (error) {
  logApiError('API:ReportsExport', error);
  return createErrorResponse('Failed to export report', 500);
}
```

## Performance optimization

### Large datasets
- Limit rows la 10,000 pentru Excel/CSV
- PDF limitat la 50 rânduri detaliate (rest summarized)
- Pagination recommendation pentru > 50,000 records

### Caching
```typescript
// Cache report data pentru 5 minute
const cacheKey = `report:${reportType}:${JSON.stringify(filters)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return generateExcel(reportType, JSON.parse(cached));
}

const data = await fetchReportData();
await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
```

## Testing

### Manual test
```bash
# 1. Start server
npm run dev

# 2. Login ca ADMIN
# URL: http://localhost:3000/admin/login

# 3. Navigate to Reports
# URL: http://localhost:3000/admin/reports

# 4. Click "Export" → Select format
# 5. Verify download starts
# 6. Open file și check data
```

### Automated test
```typescript
// src/__tests__/reports-export.test.ts
import { describe, it, expect } from 'vitest';

describe('Reports Export API', () => {
  it('generates Excel file for sales report', async () => {
    const response = await fetch('/api/admin/reports/export-advanced', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reportType: 'sales',
        format: 'excel',
        dateRange: { start: '2024-01-01', end: '2024-12-31' }
      })
    });

    expect(response.ok).toBe(true);
    expect(response.headers.get('content-type')).toContain('spreadsheet');
    
    const blob = await response.blob();
    expect(blob.size).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Download nu pornește
- Verifică permissions (ADMIN/MANAGER role)
- Check browser Console pentru erori
- Verifică Network tab pentru status 500/401

### Excel corupt
- Verifică versiunea ExcelJS (`npm list exceljs`)
- Check că toate rows au aceleași keys
- Verifică Buffer.from() compatibility

### PDF blank/incomplete
- Verifică PDFKit version
- Check că doc.end() se apelează
- Verifică Promise resolve în generateReportPDF

### CSV encoding issues
- Use UTF-8 BOM pentru Excel compatibility
- Escape commas și quotes în values
- Verifică line endings (CRLF vs LF)

## Future improvements

- [ ] Export background job pentru reports > 10,000 rows
- [ ] Email delivery pentru large files
- [ ] Custom columns selection
- [ ] Multi-sheet Excel (summary + details)
- [ ] Charts în PDF export
- [ ] Scheduled reports (daily/weekly email)

---

**Documentație completă implementată în:**
- `/src/app/api/admin/reports/export-advanced/route.ts`
- `/src/components/admin/ExportButton.tsx`
- `/docs/RESPONSIVE_TESTING_GUIDE.md`
