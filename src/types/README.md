# Types Structure Documentation

Structura reorganizată a tipurilor TypeScript pentru sanduta.art.

## 📁 Fișiere

### Core Types

#### `models.ts`
**Scop**: Tipuri centrale Prisma și extensii pentru modele de bază de date

**Conținut**:
- Re-export modele Prisma: `User`, `Order`, `Product`, `Category`, etc.
- Enum-uri: `UserRole`, `OrderStatus`, `PaymentStatus`, `ProductionStatus`, etc.
- Model extensions cu relații: `UserWithRelations`, `OrderWithRelations`, `ProductWithRelations`
- Helper types: `OrderFile`, `MaterialUsage`, etc.
- Status label mappings: `ORDER_STATUS_LABELS`, `PAYMENT_STATUS_LABELS`, `PRODUCTION_STATUS_LABELS`
- Type guards: `isOrderWithRelations()`, `hasOrderItems()`, etc.

**Import example**:
```typescript
import { User, Order, OrderStatus, ORDER_STATUS_LABELS, OrderWithRelations } from '@/types/models';
```

---

#### `api.ts`
**Scop**: Tipuri pentru request/response API

**Conținut**:
- Generic responses: `ApiResponse<T>`, `ApiError`, `ServiceResult<T>`
- Request types: `CreateOrderRequest`, `UpdateOrderRequest`, `CreateProductRequest`, etc.
- Response types: `LoginResponse`, `OrderResponse`, `ProductResponse`, `StatsResponse`
- Search & filters: `SearchParams`, `OrderFilters`, `ProductFilters`, `UserFilters`
- Batch operations: `BatchUpdateRequest<T>`, `BatchDeleteRequest`, `BatchOperationResponse`
- File upload: `FileUploadRequest`, `FileUploadResponse`
- Webhooks: `WebhookPayload<T>`, `PaymentWebhook`, `ShippingWebhook`
- Validation: `ValidationError`, `ValidationResult`
- Metadata: `RequestMetadata`, `ResponseMetadata`

**Import example**:
```typescript
import { ApiResponse, CreateOrderRequest, ValidationError } from '@/types/api';
```

---

#### `pagination.ts`
**Scop**: Tipuri pentru paginare și liste paginate

**Conținut**:
- Core pagination: `PaginationParams`, `PaginatedResponse<T>`, `PaginationMeta`
- Cursor pagination: `CursorPaginationParams`, `CursorPaginatedResponse<T>`
- Offset pagination: `OffsetPaginationParams`, `OffsetPaginatedResponse<T>`
- With filters: `PaginatedRequest<F>`, `PaginatedResult<T, F>`
- Sort options: `SortOrder`, `SortOption`, `SortConfig`
- GraphQL style: `PageInfo`, `Edge<T>`, `Connection<T>`
- Helpers: `calculateOffset()`, `calculateTotalPages()`, `createPaginationMeta()`, `validatePaginationParams()`
- Prisma helpers: `toPrismaSkipTake()`, `toPrismaOrderBy()`
- Default configs: `DEFAULT_PAGINATION_LIMITS`, `DEFAULT_PAGINATION_CONFIG`

**Import example**:
```typescript
import { 
  PaginatedResponse, 
  PaginationParams, 
  createPaginationMeta,
  toPrismaSkipTake 
} from '@/types/pagination';
```

---

#### `reports.ts`
**Scop**: Tipuri pentru sistem de rapoarte și export

**Conținut**:
- Date ranges: `DateRange`, `DateRangeParams`, `DateRangePreset`
- Export: `ExportFormat`, `ExportOptions`, `ExportRequest`, `ExportResponse`
- Report types: `ReportType`, `ReportFilters`
- Sales reports: `SalesReportData`, `DailySalesData`, `TopProductData`, `TopCustomerData`
- Order reports: `OrderReportRow`, `OrderReportData`, `OrderReportSummary`
- Product reports: `ProductReportRow`, `ProductReportData`, `ProductReportSummary`
- Material reports: `MaterialReportRow`, `MaterialReportData`, `MaterialReportSummary`
- Customer reports: `CustomerReportRow`, `CustomerReportData`, `CustomerReportSummary`
- Inventory reports: `InventoryReportRow`, `InventoryReportData`, `InventoryReportSummary`
- Production reports: `ProductionReportRow`, `ProductionReportData`, `ProductionReportSummary`
- Financial reports: `FinancialReportRow`, `FinancialReportData`, `FinancialReportSummary`
- Performance reports: `PerformanceReportRow`, `PerformanceReportData`, `PerformanceReportSummary`
- Chart data: `ChartDataPoint`, `TimeSeriesDataPoint`, `ChartData`, `ChartDataset`
- Report generation: `ReportGenerationRequest`, `ReportGenerationResponse`
- Scheduling: `ReportScheduleFrequency`, `ReportSchedule`, `ScheduledReportRun`

**Import example**:
```typescript
import { 
  SalesReportData, 
  ExportFormat, 
  ReportType,
  ExportRequest 
} from '@/types/reports';
```

---

### Theme Types (Split Modular)

#### `theme.ts` (Index)
**Scop**: Re-export toate tipurile theme din module separate + ThemeConfig principal

**Conținut**:
- `ThemeConfig` - interfață principală
- Re-exports din toate modulele theme
- `ThemeVariables` - CSS variables mapping

**Import example**:
```typescript
import { ThemeConfig, ColorPalette, ButtonStyle } from '@/types/theme';
```

---

#### `theme-branding.ts`
**Scop**: Branding configuration (logo, social media, email)

**Conținut**:
- `BrandingConfig` - logo, siteName, tagline, email, social media

**Import example**:
```typescript
import { BrandingConfig } from '@/types/theme-branding';
```

---

#### `theme-colors.ts`
**Scop**: Color palette definitions

**Conținut**:
- `ColorPalette` - primary, secondary, accent, success, warning, error, info, background, surface, text, border

**Import example**:
```typescript
import { ColorPalette } from '@/types/theme-colors';
```

---

#### `theme-typography.ts`
**Scop**: Typography and font configurations

**Conținut**:
- `TypographyConfig` - fontFamily, fontSize, fontWeight, lineHeight, headings
- `HeadingStyle` - specific heading configurations

**Import example**:
```typescript
import { TypographyConfig, HeadingStyle } from '@/types/theme-typography';
```

---

#### `theme-layout.ts`
**Scop**: Layout configurations (header, footer, spacing)

**Conținut**:
- `LayoutConfig` - header, footer, container, spacing, borderRadius

**Import example**:
```typescript
import { LayoutConfig } from '@/types/theme-layout';
```

---

#### `theme-components.ts`
**Scop**: Component styles (button, card, input, badge, alert, modal)

**Conținut**:
- `ComponentsConfig` - all component styles
- Individual styles: `ButtonStyle`, `CardStyle`, `InputStyle`, `BadgeStyle`, `AlertStyle`, `ModalStyle`
- `ComponentVariant` - variant configurations

**Import example**:
```typescript
import { ComponentsConfig, ButtonStyle, ComponentVariant } from '@/types/theme-components';
```

---

#### `theme-homepage.ts`
**Scop**: Homepage builder block types

**Conținut**:
- `HomepageBlock` - generic block interface
- `BlockType` - union type of all block types
- `BlockConfig` - base config interface
- Specific configs: `HeroBlockConfig`, `GridBannersConfig`, `FeaturedProductsConfig`, `CategoriesConfig`, `TestimonialsConfig`, `TextImageConfig`, `NewsletterConfig`, `CustomHtmlConfig`

**Import example**:
```typescript
import { 
  HomepageBlock, 
  BlockType, 
  HeroBlockConfig,
  FeaturedProductsConfig 
} from '@/types/theme-homepage';
```

---

### Other Types

#### `next-auth.d.ts`
**Scop**: NextAuth type extensions

**Conținut**:
- Session type extensions
- JWT type extensions
- User type extensions

---

## 🎯 Migration Guide

### From Old Structure

**Înainte (all in one file or scattered)**:
```typescript
// Scattered across multiple domain folders or huge single files
import { Order } from '@prisma/client';
import { ApiResponse } from '@/lib/types';
```

**Acum (organized by purpose)**:
```typescript
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '@/types/models';
import { ApiResponse, CreateOrderRequest } from '@/types/api';
import { PaginatedResponse, PaginationParams } from '@/types/pagination';
import { SalesReportData } from '@/types/reports';
import { ThemeConfig, ColorPalette } from '@/types/theme';
```

### Key Benefits

1. **Separation of Concerns**: Fiecare fișier are un scop clar
2. **Better Tree-Shaking**: Import doar ce ai nevoie
3. **Maintainability**: Mai ușor de găsit și editat tipuri
4. **Scalability**: Adaugă noi tipuri fără să afectezi alte fișiere
5. **Documentation**: Fiecare modul e self-contained
6. **Backward Compatibility**: `theme.ts` re-exportă tot pentru compatibilitate

---

## 📋 Checklist for New Types

Când adaugi tipuri noi:

- [ ] Determină categoria (models, api, pagination, reports, theme)
- [ ] Adaugă în fișierul potrivit
- [ ] Documentează cu JSDoc dacă e complex
- [ ] Export explicit din fișier
- [ ] Adaugă exemple în acest README
- [ ] Update imports în codebase dacă e necesar

---

## 🔍 Quick Reference

### Tipuri comune pe categorie

**Database Models**: `models.ts`
- User, Order, Product, Category, Customer, Material, ProductionJob

**API Communication**: `api.ts`
- ApiResponse, ApiError, Create*Request, Update*Request, *Response

**Lists & Pagination**: `pagination.ts`
- PaginatedResponse, PaginationParams, PaginationMeta

**Reports & Analytics**: `reports.ts`
- SalesReportData, OrderReportData, ProductReportData, ExportFormat

**UI Theming**: `theme-*.ts`
- ThemeConfig, ColorPalette, TypographyConfig, ComponentsConfig

---

**Last Updated**: 2026-01-10  
**Task**: G1.1 - Creare structura types/ modulară
