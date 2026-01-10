# Anexă - Detalii Complete Erori ESLint

**Data**: 2024-01-10  
**Raport principal**: [RAPORT_ERORI_ESLINT_RAMASE.md](RAPORT_ERORI_ESLINT_RAMASE.md)

---

## 📋 Top 10 Fișiere cu Erori Detaliate

### 1. src/modules/orders/useOrders.ts
**Total**: 12 erori  
**Tip**: 100% TypeScript `any` types  
**Severitate**: ⚠️ Medium  
**Efort estimat**: 2 ore

**Erori**:
- **Line 71:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 85:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 103:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 121:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 139:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- *...și încă 7 erori similare*

**Analiză**:
Hook-ul `useOrders` este central pentru managementul comenzilor. Toate erorile sunt `any` types în error handlers și callback functions.

**Pattern comun**:
```typescript
// Linia 71, 85, 103, etc.
const handleError = (error: any) => { ... }
const processCallback = (data: any) => { ... }
```

**Soluție recomandată**:
```typescript
// Definiți interfețe clare
interface OrderError {
  code: string;
  message: string;
  orderId?: string;
  details?: Record<string, unknown>;
}

interface OrderCallback {
  orderId: string;
  status: OrderStatus;
  updatedAt: Date;
}

// Folosiți în hook
const handleError = (error: OrderError) => { ... }
const processCallback = (data: OrderCallback) => { ... }
```

---

### 2. src/modules/notifications/useEmailNotifications.ts
**Total**: 10 erori  
**Tip**: TypeScript `any` types (8), React Hooks (2)  
**Severitate**: 🔴 High (React Hooks), ⚠️ Medium (any types)  
**Efort estimat**: 1.5 ore

**Erori**:
- **Line 33:71**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 53:24**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 108:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 120:24**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 136:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- *...și încă 5 erori (3 any types, 2 React Hooks)*

**Analiză**:
Hook pentru email notifications folosit în checkout și order confirmation. Probleme combinate: type safety + cascading renders.

**Soluție recomandată**:

**A. Fix TypeScript any types**:
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailData {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
  attachments?: Attachment[];
}

const sendEmail = async (emailData: EmailData) => { ... }
```

**B. Fix React Hooks (lines 53, 120)**:
```typescript
// ❌ Înainte
useEffect(() => {
  if (error) {
    setLoading(false);  // Cascading render
  }
}, [error]);

// ✅ După
const handleError = useCallback((err: Error) => {
  setLoading(false);
}, []);

useEffect(() => {
  if (error) {
    handleError(error);
  }
}, [error, handleError]);
```

---

### 3. src/lib/prisma-helpers.ts
**Total**: 8 erori  
**Tip**: 100% TypeScript `any` types  
**Severitate**: ⚠️ Medium  
**Efort estimat**: 2 ore

**Erori**:
- **Line 161:4**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 183:4**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 195:16**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 197:13**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 198:14**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- *...și încă 3 erori*

**Analiză**:
Utility functions pentru Prisma queries, folosite în toate API routes. Critical pentru type safety în database operations.

**Cod actual (probabil)**:
```typescript
// Line 161
export async function findMany(model: any, options: any) { ... }

// Line 183
export async function updateRecord(model: any, id: any, data: any) { ... }

// Lines 195-198
export function buildWhereClause(filters: any): any {
  const where: any = {};
  const orderBy: any = {};
  // ...
}
```

**Soluție recomandată**:
```typescript
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaModel = keyof PrismaClient;

interface FindManyOptions {
  where?: Prisma.InputJsonValue;
  include?: Record<string, boolean>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
}

// Line 161
export async function findMany<T>(
  model: PrismaModel,
  options: FindManyOptions
): Promise<T[]> {
  // implementation
}

// Line 183
export async function updateRecord<T>(
  model: PrismaModel,
  id: string,
  data: Prisma.InputJsonValue
): Promise<T> {
  // implementation
}

// Lines 195-198
export function buildWhereClause(
  filters: Record<string, unknown>
): Prisma.InputJsonValue {
  const where: Record<string, unknown> = {};
  const orderBy: Record<string, 'asc' | 'desc'> = {};
  // ...
  return where;
}
```

---

### 4. src/modules/notifications/useNotifications.ts
**Total**: 8 erori  
**Tip**: TypeScript `any` types (6), React Hooks (2)  
**Severitate**: 🔴 High (React Hooks), ⚠️ Medium (any types)  
**Efort estimat**: 1.5 ore

**Erori**:
- **Line 39:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 73:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 94:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 138:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 161:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- *...și încă 3 erori (1 any, 2 React Hooks)*

**Analiză**:
Hook pentru in-app notifications (bell icon). Folosit în header și dashboard.

**Pattern similar cu useEmailNotifications**:
```typescript
// Lines 39, 73, 94, 138, 161
const fetchNotifications = async (filters: any) => { ... }
const markAsRead = async (id: string): Promise<any> => { ... }
const deleteNotification = async (id: string): Promise<any> => { ... }
```

**Soluție recomandată**:
```typescript
import { Notification, NotificationType } from '@prisma/client';

interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

const fetchNotifications = async (
  filters: NotificationFilters
): Promise<NotificationResponse[]> => { ... }

const markAsRead = async (id: string): Promise<void> => { ... }
const deleteNotification = async (id: string): Promise<void> => { ... }
```

---

### 5. src/modules/settings/useSettings.ts
**Total**: 7 erori  
**Tip**: 100% TypeScript `any` types  
**Severitate**: ⚠️ Medium  
**Efort estimat**: 1 oră

**Erori**:
- **Line 50:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 69:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 96:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 123:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 143:19**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- *...și încă 2 erori*

**Analiză**:
Hook pentru managementul setărilor globale (theme, language, notifications preferences).

**Cod actual (probabil)**:
```typescript
// Lines 50, 69, 96, 123, 143, 163, 190
const getSetting = (key: string): any => { ... }
const updateSetting = (key: string, value: any): Promise<any> => { ... }
```

**Soluție recomandată**:
```typescript
// Definiți structura setărilor
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ro' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    analytics: boolean;
    cookies: boolean;
  };
}

type SettingsKey = keyof AppSettings;
type SettingsValue<K extends SettingsKey> = AppSettings[K];

// Type-safe getter
function getSetting<K extends SettingsKey>(
  key: K
): SettingsValue<K> | undefined {
  // implementation
}

// Type-safe setter
async function updateSetting<K extends SettingsKey>(
  key: K,
  value: SettingsValue<K>
): Promise<void> {
  // implementation
}
```

---

### 6. src/app/admin/settings/platform/page.tsx
**Total**: 6 erori  
**Tip**: TypeScript `any` types (4), Undefined components (2)  
**Severitate**: 🔴 High (undefined), ⚠️ Medium (any)  
**Efort estimat**: 45 min

**Erori**:
- **Line 74:70**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 197:52**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 287:53**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 335:54**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 376:50**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- *...și încă 1 eroare (undefined component)*

**Analiză**:
Pagină de setări platform în admin dashboard. **Notă**: Unele erori ar putea fi deja fixate în commit anterior.

**Soluție recomandată**:

**A. Fix any types în event handlers**:
```typescript
// ❌ Înainte (lines 74, 197, 287, 335, 376)
const handleChange = (e: any) => {
  setValue(e.target.value);
};

// ✅ După
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Pentru select
const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setValue(e.target.value);
};

// Pentru textarea
const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setValue(e.target.value);
};
```

**B. Verificați imports pentru componente nedefinite**:
```typescript
import { Settings, Save, AlertTriangle } from 'lucide-react';
```

---

### 7. src/hooks/useDebounce.ts
**Total**: 5 erori  
**Tip**: TypeScript `any` types (4), Cannot call impure function (1)  
**Severitate**: 🔴 High (impure function), ⚠️ Medium (any)  
**Efort estimat**: 1 oră

**Erori**:
- **Line 25:58**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 25:68**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 56:46**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 56:56**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 73:39**: `Cannot call impure function during render` - React Compiler error

**Analiză**:
Hook pentru debouncing inputs (search, filters). Folosit în multe componente.

**Cod actual (probabil)**:
```typescript
// Line 25
export function useDebounce<T = any>(value: T, delay: number = 500): any {
  const [debouncedValue, setDebouncedValue] = useState<any>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Line 56
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: any[]) => void {
  // ...
}

// Line 73
const result = someImpureFunction(); // ❌ Called during render
```

**Soluție recomandată**:
```typescript
// Fix any types
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Fix callback types
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// Fix impure function call (Line 73)
// ❌ Înainte
const MyComponent = () => {
  const result = someImpureFunction(); // Called during render
  return <div>{result}</div>;
};

// ✅ După
const MyComponent = () => {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    const data = someImpureFunction();
    setResult(data);
  }, []);
  
  return <div>{result}</div>;
};
```

---

### 8. src/lib/novaposhta.ts
**Total**: 5 erori  
**Tip**: 100% TypeScript `any` types  
**Severitate**: ⚠️ Medium  
**Efort estimat**: 1 oră

**Erori**:
- **Line 39:51**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 39:65**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 115:56**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 133:52**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 148:45**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any

**Analiză**:
Nova Poshta API integration - critical pentru delivery management.

**Cod actual (probabil)**:
```typescript
// Line 39
export async function searchCities(query: string): Promise<any> {
  const response: any = await fetch(API_URL, { ... });
  return response.data;
}

// Line 115
export async function getPickupPoints(cityRef: string): Promise<any> { ... }

// Line 133
export async function createShipment(data: any): Promise<any> { ... }

// Line 148
export async function trackShipment(ttn: string): Promise<any> { ... }
```

**Soluție recomandată**:
```typescript
// Definiți interfețe pentru Nova Poshta API
interface NovaPoshtaCity {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  Area: string;
  AreaDescription: string;
}

interface NovaPoshtaWarehouse {
  Ref: string;
  Description: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  ScheduleString: string;
}

interface ShipmentData {
  sender: {
    cityRef: string;
    address: string;
    contactPerson: string;
    phone: string;
  };
  recipient: {
    cityRef: string;
    address: string;
    contactPerson: string;
    phone: string;
  };
  cargo: {
    weight: number;
    volume: number;
    cost: number;
    description: string;
  };
}

interface ShipmentResponse {
  Ref: string;
  IntDocNumber: string;
  CostOnSite: number;
}

interface TrackingInfo {
  Number: string;
  Status: string;
  StatusCode: string;
  DateCreated: string;
  DateScan: string;
  WarehouseRecipient: string;
}

// Line 39
export async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
  const response = await fetch(API_URL, { ... });
  const data = await response.json();
  return data.data as NovaPoshtaCity[];
}

// Line 115
export async function getPickupPoints(
  cityRef: string
): Promise<NovaPoshtaWarehouse[]> {
  // implementation
}

// Line 133
export async function createShipment(
  data: ShipmentData
): Promise<ShipmentResponse> {
  // implementation
}

// Line 148
export async function trackShipment(ttn: string): Promise<TrackingInfo> {
  // implementation
}
```

---

### 9. src/modules/materials/useMaterials.ts
**Total**: 5 erori  
**Tip**: TypeScript `any` types (4), React Hooks (1)  
**Severitate**: 🔴 High (hooks), ⚠️ Medium (any)  
**Efort estimat**: 1 oră

**Erori**:
- **Line 67:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 96:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 119:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 131:14**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 154:21**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any

**Analiză**:
Hook pentru managementul materialelor (tipărire, broderie). Folosit în admin panel și configurator.

**Soluție recomandată**:
```typescript
import { Material, MaterialType, MaterialCategory } from '@prisma/client';

interface MaterialFilters {
  type?: MaterialType[];
  category?: MaterialCategory;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

interface MaterialResponse {
  id: string;
  name: string;
  type: MaterialType;
  category: MaterialCategory;
  price: number;
  stock: number;
  properties: MaterialProperties;
}

interface MaterialProperties {
  color?: string;
  size?: string;
  weight?: number;
  thickness?: number;
}

// Lines 67, 96, 119, 131, 154
const fetchMaterials = async (
  filters: MaterialFilters
): Promise<MaterialResponse[]> => { ... }

const updateMaterial = async (
  id: string,
  data: Partial<MaterialResponse>
): Promise<MaterialResponse> => { ... }
```

---

### 10. src/app/api/admin/settings/platform/route.ts
**Total**: 4 erori  
**Tip**: 100% TypeScript `any` types  
**Severitate**: ⚠️ Medium  
**Efort estimat**: 30 min

**Erori**:
- **Line 207:28**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 207:41**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 207:47**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any
- **Line 227:25**: `Unexpected any. Specify a different type` - @typescript-eslint/no-explicit-any

**Analiză**:
API route pentru platform settings. Toate erorile pe linia 207 (probabil destructuring).

**Cod actual (probabil)**:
```typescript
// Line 207 - Multiple any types
const { setting1, setting2, setting3, ...rest }: any = await req.json();

// Line 227
const updatedSettings: any = await prisma.settings.update({ ... });
```

**Soluție recomandată**:
```typescript
// Definiți interfața pentru request body
interface PlatformSettingsRequest {
  siteName?: string;
  siteUrl?: string;
  contactEmail?: string;
  supportPhone?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

// Line 207
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PlatformSettingsRequest;
    
    // Validare cu zod (recomandat)
    const validatedBody = platformSettingsSchema.parse(body);
    
    // Line 227
    const updatedSettings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: validatedBody,
      create: validatedBody,
    });
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return createErrorResponse('Failed to update settings', 500);
  }
}

// Zod schema pentru validare
import { z } from 'zod';

const platformSettingsSchema = z.object({
  siteName: z.string().optional(),
  siteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  supportPhone: z.string().regex(/^\+?[0-9\s\-()]+$/).optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});
```

---

## 📚 Resurse Utile

### Type Definitions

**Prisma**:
```typescript
// Generate după schema
npx prisma generate

// Import types
import { User, Order, Product, Prisma } from '@prisma/client';
import type { User as PrismaUser } from '@prisma/client';
```

**React**:
```typescript
import type {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
} from 'react';

// Event handlers
const handleChange = (e: ChangeEvent<HTMLInputElement>) => { ... };
const handleSubmit = (e: FormEvent<HTMLFormElement>) => { ... };
const handleClick = (e: MouseEvent<HTMLButtonElement>) => { ... };
```

**Next.js**:
```typescript
import type { NextRequest, NextResponse } from 'next/server';
import type { Metadata, ResolvingMetadata } from 'next';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // implementation
}
```

### Tools

**TypeScript Playground**: https://www.typescriptlang.org/play  
**Prisma Schema Viewer**: https://prisma.io/docs/concepts/components/prisma-schema  
**React TypeScript Cheatsheet**: https://react-typescript-cheatsheet.netlify.app/

---

## ✅ Summary

**Total erori analizate**: 68 din 241 (top 10 fișiere)  
**Tipuri de erori**:
- TypeScript `any` types: 58 (85.3%)
- React Hooks: 5 (7.4%)
- Undefined components: 2 (2.9%)
- Impure function: 1 (1.5%)
- Other: 2 (2.9%)

**Next step**: Începeți cu fișierele marcate 🔴 High priority, apoi continuați cu ⚠️ Medium.

---

**Raport generat de**: GitHub Copilot  
**Data**: 2024-01-10  
**Versiune**: 1.0
