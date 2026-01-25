# Copilot Instructions for sanduta.art

**E-commerce платформа с Next.js 16, NextAuth, Prisma, PostgreSQL**

## 🏗️ Архитектура

### Стек
- **Next.js 16.1.1** (App Router) — фронтенд + серверные API (`src/app/`)
- **React 19.2.3** — UI с React Compiler
- **Prisma 7.2.0 + PostgreSQL** — ORM, схема в `prisma/schema.prisma`
- **NextAuth 4.24.13** — аутентификация с JWT (стратегия session)
- **TailwindCSS 4** — стилизация
- **Vitest 4.0.16** — тестирование (`src/__tests__/`)

### Структура данных (Prisma)
```
User (role: ADMIN|MANAGER|OPERATOR|VIEWER)
  └─ Order (status: PENDING→IN_PRODUCTION→DELIVERED)
      ├─ OrderItem → Product → Category
      ├─ Payment (status, via Paynet)
      └─ Delivery (via Nova Poshta)
```

**Ключевые enums**: `UserRole`, `OrderStatus`, `PaymentStatus`, `ProductionStatus` — всегда используйте типы из `@prisma/client`

## 🔐 Аутентификация и авторизация

### NextAuth конфигурация
- Файл: `src/modules/auth/nextauth.ts` (экспорт `authOptions`)
- **Session**: JWT, maxAge 30 дней
- **Provider**: CredentialsProvider (email/password, bcrypt)
- **Callbacks**: `jwt()` добавляет `role`, `session()` прокидывает в клиент

### Типы NextAuth
```typescript
// src/types/next-auth.d.ts
Session.user: { id, email, name?, role: UserRole }
JWT: { role: UserRole }
```

### Защита роутов

**Middleware** (`middleware.ts`):
```typescript
/admin → только ADMIN
/manager → ADMIN + MANAGER  
/operator → ADMIN + OPERATOR
```

**API защита** (`src/lib/auth-helpers.ts`):
```typescript
// В route.ts:
import { requireRole } from '@/lib/auth-helpers';

const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
if (error) return error;
// user.role доступен
```

**Важно**: всегда используйте `requireAuth()` или `requireRole()` в API роутах, никогда не доверяйте клиентским данным.

## 🛠️ Рабочие процессы

### Разработка
```bash
npm run dev              # http://localhost:3000
npm run prisma:studio    # БД UI
npm run lint             # ESLint проверка
```

### База данных
```bash
npx prisma migrate dev   # Создать миграцию
npx prisma migrate deploy # Применить миграции
npm run prisma:seed      # Наполнить тестовыми данными (prisma/seed.ts)
```

**Seed данные**: создаёт `admin@sanduta.art` / `admin123`, тестовые продукты, категории.

### Тестирование
```bash
npm test                 # Vitest (watch mode)
npm run test:ui          # Vitest UI
npm run test:coverage    # Покрытие кода
```

**Конфиг**: `vitest.config.ts`, setup: `src/__tests__/setup.ts`, environment: `happy-dom`

**Паттерн тестов**:
```typescript
// src/__tests__/paynet.test.ts
import { describe, it, expect, vi } from 'vitest';
// Мокировать fetch через vi.stubGlobal
```

## 📝 Конвенции кода

### Валидация (`src/lib/validation.ts`)
```typescript
import { validateCheckoutForm, validateEmail } from '@/lib/validation';

const errors = validateCheckoutForm(data); // ValidationError[]
if (errors.length > 0) return /* ... */;
```
**Не дублируйте** логику валидации — используйте готовые функции.

### Логирование (`src/lib/logger.ts`)
```typescript
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

logger.info('API:Orders', 'Creating order', { userId });
logger.error('API:Paynet', 'Payment failed', { error, orderId });

// Стандартные ошибки:
return createErrorResponse('Order not found', 404);
```

**Структура логов**: `[timestamp] [level] [tag] message { context }`

### API Route паттерн
```typescript
// src/app/api/admin/orders/route.ts
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // 1. Проверка роли
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    // 2. Логирование запроса
    logger.info('API:Orders', 'Fetching orders', { userId: user.id });

    // 3. Бизнес-логика
    const orders = await prisma.order.findMany({ /* ... */ });

    // 4. Возврат ответа
    return NextResponse.json(orders);
  } catch (err) {
    logApiError('API:Orders', err);
    return createErrorResponse('Failed to fetch orders', 500);
  }
}
```

**Всегда**: try/catch, логирование, проверка роли, понятные HTTP статусы.

### Server Component Safety (`src/lib/serverSafe.ts`)
```typescript
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

// Server Component pattern:
export default async function Page() {
  try {
    // 1. Auth check с safeRedirect
    const session = await getServerSession(authOptions);
    if (!session) return safeRedirect('/login');
    
    // 2. Validate data
    const userId = validateServerData(session?.user?.id, 'User ID missing');
    
    // 3. Fetch with timeout + retry
    const data = await fetchServerData(
      () => prisma.table.findMany({ where: { userId } }),
      { timeout: 10000, retries: 2 }
    );
    
    return <ClientComponent data={data} />;
  } catch (error) {
    logger.error('Page', 'Failed', { error });
    throw error; // Next.js error boundary
  }
}
```

**Функции защиты:**
- `safeRedirect(path)` — защищает redirect(), позволяет NEXT_REDIRECT
- `validateServerData<T>(data, msg)` — проверяет data !== null/undefined, type-safe
- `fetchServerData(fetcher, opts)` — Prisma wrapper с timeout (10s) + retry (2x)
- `serverSafe(fn, opts)` — generic async wrapper с fallback
- `withServerSafety(Component)` — HOC для page-level защиты

**Когда использовать:**
- ❗ **ВСЕГДА** `safeRedirect()` вместо `redirect()` в Server Components
- ❗ **ВСЕГДА** `validateServerData()` для session.user.id, params.id
- ❗ **ВСЕГДА** `fetchServerData()` для Prisma queries
- ❗ **ВСЕГДА** return перед `safeRedirect()`

**Документация**: `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`

### UI компоненты (`src/components/ui/`)
```typescript
import { Button, Card, Badge, Input, Select } from '@/components/ui';

// Варианты Button: primary, secondary, danger, success, ghost
<Button variant="primary" loading={isLoading}>
  Сохранить
</Button>

// Badge авто-стилизуется по значению:
<Badge value="PENDING" />  // Жёлтый
<Badge value="DELIVERED" /> // Зелёный
```

**Документация**: `docs/UI_COMPONENTS.md` — примеры всех вариантов.

## 🔌 Интеграции

### Paynet (платежи)
- Файл: `src/lib/paynet.ts`
- Сигнатура: HMAC SHA256 с `PAYNET_SECRET`
- **Важно**: fallback на COD при ошибке API
- Тесты: `src/__tests__/paynet.test.ts`

### Nova Poshta (доставка)
- Файл: `src/lib/novaposhta.ts`
- Методы: `searchCities()`, `getPickupPoints()`, `createShipment()`, `trackShipment()`
- Тесты: `src/__tests__/novaposhta.test.ts`

### Resend (email)
- Файл: `src/lib/email.ts`, шаблоны: `src/emails/*.tsx`
- Функции: `sendOrderConfirmationEmail()`, `sendAdminNewOrderEmail()`
- Шаблоны: React компоненты с `@react-email/components`
- **Важно**: отправка асинхронная, не блокирует API

### Все ключи API
```env
# .env (never commit!)
NEXTAUTH_SECRET=...
DATABASE_URL=...
PAYNET_API_KEY=...
PAYNET_SECRET=...
NOVA_POSHTA_API_KEY=...
RESEND_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
```

## 🧩 Специфичные паттерны

### State management
```typescript
// Context API для корзины: src/context/CartContext.tsx
const { cart, addToCart, clearCart } = useCart();
```
**Не используйте** Redux — проект на Context API + server state через fetch.

### Админ-панель
```
src/app/admin/
  ├─ orders/      # Управление заказами
  ├─ products/    # CRUD продуктов
  ├─ customers/   # Клиенты
  ├─ production/  # Производство
  └─ reports/     # Отчёты (sales, products, materials)
```

**API**: все в `src/app/api/admin/`, защищены `requireRole(['ADMIN'])`

**Документация**: `docs/ADMIN_PANEL_*` (6 файлов)

### Editor/Configurator
- Модуль: `src/modules/editor/`
- Экспорт: PNG/PDF/SVG через `exportEngine.ts`
- Используется в `src/app/editor/` и `src/app/products/[id]/`

### Модульная структура
```
src/modules/
  ├─ auth/         # NextAuth конфиг
  ├─ editor/       # Редактор дизайна
  ├─ reports/      # Отчёты (types, hooks)
  └─ ...
```

**Используйте** модули для переиспользуемой логики.

## 📚 Документация

### Основные файлы
- `README.md` — обзор проекта, quick start
- `docs/RELIABILITY.md` — error handling, logging паттерны
- `docs/UI_COMPONENTS.md` — примеры всех UI компонентов
- `docs/TESTING.md` — стратегия и примеры тестов
- `docs/EMAIL_SETUP.md` — настройка Resend, шаблоны

### Быстрый старт для новичков
1. Запустить: `npm run dev` (не забыть `.env`)
2. Логин: `admin@sanduta.art` / `admin123`
3. Админка: http://localhost:3000/admin
4. Prisma Studio: `npm run prisma:studio`
5. Тесты: `npm test`

## ⚡ Производительность

- **Cache headers**: `/api/products` кэшируется (см. `docs/PERFORMANCE_OPTIMIZATION.md`)
- **Prisma queries**: используйте `select` для минимизации данных, `include` с осторожностью
- **Изображения**: Cloudinary CDN + Next.js Image оптимизация

## ⚠️ Частые ошибки

1. **Middleware не работает**: проверьте `matcher` в `middleware.ts`, убедитесь что NEXTAUTH_SECRET задан
2. **"No default export" в API route**: используйте `export async function GET/POST`
3. **Prisma типы недоступны**: запустите `npm run postinstall` (или `npx prisma generate`)
4. **CORS ошибки**: API роуты должны быть на том же домене, внешние API через серверные роуты
5. **404 в продакшене**: проверьте `vercel.json` rewrites, убедитесь что роут экспортирует функцию

## 🎯 Чек-лист для новых фич

- [ ] API роут защищён через `requireRole()`
- [ ] Добавлены try/catch + логирование через `logger`
- [ ] Валидация через `src/lib/validation.ts`
- [ ] UI использует компоненты из `src/components/ui/`
- [ ] Написаны тесты в `src/__tests__/`
- [ ] Обновлена документация в `docs/` (если нужно)
- [ ] Проверены типы TypeScript (`npm run lint`)

---

_Последнее обновление: 2026-01-10. При изменении архитектуры обновляйте этот файл. Вопросы → см. `docs/` или README._
