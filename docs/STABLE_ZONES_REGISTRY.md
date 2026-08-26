# 🟢 STABLE ZONES REGISTRY — Production-Ready Modules

**Purpose:** Document stable, production-tested code that should NOT be modified without careful consideration  
**Status:** ✅ ACTIVE REGISTRY  
**Last Updated:** 2026-01-25

---

## 📋 What is a Stable Zone?

A **Stable Zone** is a module, component, or pattern that is:
- ✅ **Production-tested** (deployed and working in production)
- ✅ **Well-documented** (has comprehensive docs)
- ✅ **Fully tested** (manual QA passed, zero known bugs)
- ✅ **Performance-optimized** (no known bottlenecks)
- ✅ **Security-hardened** (auth, validation, error handling complete)

**Rule:** Modifications to Stable Zones require:
1. Architecture review
2. Testing plan
3. Backward compatibility check
4. Documentation update
5. Staged rollout (if breaking)

---

## 🏛️ CORE ARCHITECTURE (Tier 1 — CRITICAL)

### 1. Server Component Safety Layer

**Location:** `src/lib/serverSafe.ts`

**Status:** 🟢 **STABLE — DO NOT MODIFY**

**Functions:**
```typescript
safeRedirect(path: string): never
validateServerData<T>(data: T | null | undefined, errorMsg: string): T
fetchServerData<T>(fetcher: () => Promise<T>, options?: FetchOptions): Promise<T>
serverSafe<T>(fn: () => Promise<T>, options?: ServerSafeOptions): Promise<T>
withServerSafety(Component: ComponentType): ComponentType
```

**Usage:**
- ✅ **100% of Server Components** use `safeRedirect()`
- ✅ **All param validation** uses `validateServerData()`
- ✅ **All Prisma queries** wrapped in `fetchServerData()`

**Protection:**
- Prevents NEXT_REDIRECT crashes
- Timeout protection (10s default)
- Automatic retry (2x default)
- Type-safe validation
- Error logging

**Tests:**
- ✅ Manual QA: PASSED
- ✅ Production deployment: STABLE
- ✅ Zero 502 errors related to this module

**Documentation:**
- `docs/SERVER_COMPONENT_SAFETY_GUIDE.md` (comprehensive)

**Modification Criteria:**
- ❌ **NO changes** without architecture review
- ✅ Can extend with new utility functions
- ✅ Can adjust default timeout/retries via options
- ❌ **DO NOT** change core function signatures

**Last Modified:** 2026-01-23  
**Review Date:** 2026-04-01 (quarterly)

---

### 2. Auth Prefetch Safety (AuthLink)

**Location:** `src/components/common/links/AuthLink.tsx`

**Status:** 🟢 **STABLE — DO NOT MODIFY**

**Component:**
```typescript
<AuthLink href="/account/orders" prefetch={false}>
  Orders
</AuthLink>
```

**Usage:**
- ✅ **32/32 auth route files** use AuthLink
- ✅ **100% coverage** in auth routes
- ✅ **Zero prefetch crashes** after rollout

**Protection:**
- Prevents prefetch-induced auth crashes
- Disables prefetch by default on auth routes
- Can override with `prefetch={true}` if safe

**Tests:**
- ✅ Hover test: No prefetch, no crash
- ✅ Click test: Smooth redirect
- ✅ Logged-in test: Page loads correctly

**Documentation:**
- `docs/AUTH_LINK_COMPONENT.md` (usage guide)
- `RAPORT_FINAL_AUTH_PREFETCH.md` (implementation report)

**Modification Criteria:**
- ❌ **DO NOT** change `prefetch={false}` default
- ✅ Can add props (className, style, etc.)
- ✅ Can extend with analytics tracking
- ❌ **DO NOT** remove type safety

**Last Modified:** 2026-01-25  
**Review Date:** 2026-04-01 (quarterly)

---

### 3. Authentication System

**Location:** `src/modules/auth/nextauth.ts`

**Status:** 🟢 **STABLE — MODIFY WITH CARE**

**Configuration:**
```typescript
export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: { jwt, session },
  pages: { signIn: '/login' },
};
```

**Features:**
- JWT-based sessions (30 day expiry)
- Bcrypt password hashing
- Role-based access (ADMIN, MANAGER, OPERATOR, VIEWER)
- Type-safe session with `session.user.role`

**Usage:**
- ✅ Server Components: `getServerSession(authOptions)`
- ✅ Client Components: `useSession()`
- ✅ API Routes: `requireAuth()`, `requireRole()`

**Tests:**
- ✅ Login flow: WORKS
- ✅ Logout flow: WORKS
- ✅ Session persistence: WORKS
- ✅ Role-based access: WORKS

**Documentation:**
- `.github/copilot-instructions.md` (NextAuth section)

**Modification Criteria:**
- ⚠️ **CAREFUL** — auth is critical
- ✅ Can add new OAuth providers
- ✅ Can adjust session maxAge
- ❌ **DO NOT** change JWT strategy without migration
- ❌ **DO NOT** remove role from session

**Last Modified:** 2025-12-15  
**Review Date:** 2026-04-01 (quarterly)

---

### 4. Auth Helpers (API Protection)

**Location:** `src/lib/auth-helpers.ts`

**Status:** 🟢 **STABLE — DO NOT MODIFY**

**Functions:**
```typescript
requireAuth(): Promise<{ user: User, error?: never } | { user?: never, error: NextResponse }>
requireRole(roles: UserRole[]): Promise<...>
```

**Usage:**
- ✅ **100% of protected API routes** use `requireAuth()` or `requireRole()`

**Protection:**
- Returns error response directly (no throw)
- Type-safe return values
- Proper HTTP status codes (401, 403)

**Tests:**
- ✅ No auth: Returns 401
- ✅ Wrong role: Returns 403
- ✅ Correct role: Returns user

**Documentation:**
- `.github/copilot-instructions.md` (API protection section)

**Modification Criteria:**
- ❌ **DO NOT** change return type signature
- ✅ Can add logging
- ✅ Can add rate limiting
- ❌ **DO NOT** throw errors (return instead)

**Last Modified:** 2025-11-20  
**Review Date:** 2026-04-01 (quarterly)

---

### 5. Middleware (Route Protection)

**Location:** `middleware.ts`

**Status:** 🟢 **STABLE — MODIFY WITH CARE**

**Configuration:**
```typescript
export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/manager/:path*', '/operator/:path*'],
};
```

**Protection:**
- `/account/*` → Authenticated users only
- `/admin/*` → ADMIN role only
- `/manager/*` → ADMIN + MANAGER roles
- `/operator/*` → ADMIN + OPERATOR roles

**Tests:**
- ✅ Unauthenticated access: Redirects to `/`
- ✅ Wrong role: Redirects to `/`
- ✅ Correct role: Allows access

**Documentation:**
- `FINAL_APP_ROUTER_RULES.md` (Middleware section)

**Modification Criteria:**
- ⚠️ **CAREFUL** — runs on every matched request
- ✅ Can add new protected routes
- ✅ Can adjust role checks
- ❌ **DO NOT** add expensive operations (DB queries)
- ❌ **DO NOT** change matcher without testing

**Last Modified:** 2025-10-10  
**Review Date:** 2026-04-01 (quarterly)

---

## 🔧 UTILITIES & HELPERS (Tier 2 — IMPORTANT)

### 6. Logging System

**Location:** `src/lib/logger.ts`

**Status:** 🟢 **STABLE — EXTEND ONLY**

**Functions:**
```typescript
logger.info(tag: string, message: string, context?: object)
logger.error(tag: string, message: string, context?: object)
logApiError(tag: string, error: unknown)
createErrorResponse(message: string, status: number, details?: any)
```

**Usage:**
- ✅ All API routes use `logApiError()`
- ✅ All errors logged with context
- ✅ Structured logging format

**Output Format:**
```
[2026-01-25T12:34:56.789Z] [INFO] [API:Products] Fetching products { userId: 'abc123' }
```

**Tests:**
- ✅ Logs to console in dev
- ✅ Structured output
- ✅ Context included

**Documentation:**
- `docs/RELIABILITY.md` (logging section)

**Modification Criteria:**
- ✅ Can add new log levels (warn, debug)
- ✅ Can add integrations (Sentry, DataDog)
- ❌ **DO NOT** change log format (breaks parsing)
- ❌ **DO NOT** remove context parameter

**Last Modified:** 2025-09-15  
**Review Date:** 2026-04-01 (quarterly)

---

### 7. Validation Library

**Location:** `src/lib/validation.ts`

**Status:** 🟢 **STABLE — EXTEND ONLY**

**Functions:**
```typescript
validateEmail(email: string): ValidationError[]
validateCheckoutForm(data: CheckoutFormData): ValidationError[]
validateProductForm(data: ProductFormData): ValidationError[]
```

**Return Type:**
```typescript
type ValidationError = {
  field: string;
  message: string;
};
```

**Usage:**
- ✅ All forms use validation before submit
- ✅ API routes validate input
- ✅ Consistent error format

**Tests:**
- ✅ Valid input: Returns []
- ✅ Invalid input: Returns errors
- ✅ Edge cases: Handled

**Documentation:**
- `.github/copilot-instructions.md` (validation section)

**Modification Criteria:**
- ✅ Can add new validation functions
- ✅ Can extend existing validators
- ❌ **DO NOT** change return type
- ❌ **DO NOT** throw errors (return validation errors instead)

**Last Modified:** 2025-08-20  
**Review Date:** 2026-04-01 (quarterly)

---

### 8. Database Client

**Location:** `src/lib/prisma.ts`

**Status:** 🟢 **STABLE — DO NOT MODIFY**

**Export:**
```typescript
export const prisma = new PrismaClient();
```

**Usage:**
- ✅ Single global instance (prevents connection pool exhaustion)
- ✅ Used in Server Components and API routes only
- ❌ **NEVER** import in Client Components

**Configuration:**
- Singleton pattern
- Auto-connect on first query
- Graceful shutdown on process exit

**Tests:**
- ✅ Connection works
- ✅ Queries execute
- ✅ Transactions work

**Documentation:**
- `README.md` (database section)

**Modification Criteria:**
- ❌ **DO NOT** change to multiple instances
- ✅ Can add Prisma middleware (logging, soft delete)
- ❌ **DO NOT** expose to client side

**Last Modified:** 2025-07-10  
**Review Date:** 2026-04-01 (quarterly)

---

## 🎨 UI COMPONENTS (Tier 3 — STABLE)

### 9. UI Component Library

**Location:** `src/components/ui/`

**Status:** 🟢 **STABLE — EXTEND WITH CARE**

**Components:**
- Button, Card, Input, Select, Badge, Modal, Dropdown, Tabs, etc.

**Export:**
```typescript
export { Button, Card, Input } from '@/components/ui';
```

**Features:**
- TailwindCSS styling
- Type-safe props
- Variants support (primary, secondary, danger, etc.)
- Accessibility (ARIA labels, keyboard navigation)

**Tests:**
- ✅ Visual QA: PASSED
- ✅ Accessibility audit: PASSED
- ✅ Responsive: WORKS

**Documentation:**
- `docs/UI_COMPONENTS.md` (comprehensive examples)

**Modification Criteria:**
- ✅ Can add new variants
- ✅ Can extend props (className, style)
- ❌ **DO NOT** change core API (breaking change)
- ❌ **DO NOT** remove existing variants (backward compatibility)

**Last Modified:** 2025-06-05  
**Review Date:** 2026-04-01 (quarterly)

---

## 🔌 INTEGRATIONS (Tier 4 — EXTERNAL)

### 10. Payment Integration (Paynet)

**Location:** `src/lib/paynet.ts`

**Status:** 🟡 **STABLE — TEST BEFORE CHANGES**

**Functions:**
```typescript
createPayment(order: Order): Promise<PaymentResponse>
verifyPaymentSignature(data: PaymentData, signature: string): boolean
```

**Features:**
- HMAC SHA256 signature verification
- Fallback to COD on error
- Retry logic (3x)

**Tests:**
- ✅ Payment creation: WORKS
- ✅ Signature verification: WORKS
- ✅ Error handling: Fallback to COD

**Documentation:**
- `docs/PAYNET_INTEGRATION.md`

**Modification Criteria:**
- ⚠️ **TEST IN SANDBOX** before production
- ✅ Can adjust retry count
- ❌ **DO NOT** change signature algorithm (breaks integration)
- ❌ **DO NOT** remove COD fallback

**Last Modified:** 2025-12-01  
**Review Date:** 2026-02-01 (quarterly — payment critical)

---

### 11. Shipping Integration (Nova Poshta)

**Location:** `src/lib/novaposhta.ts`

**Status:** 🟡 **STABLE — TEST BEFORE CHANGES**

**Functions:**
```typescript
searchCities(query: string): Promise<City[]>
getPickupPoints(cityRef: string): Promise<PickupPoint[]>
createShipment(data: ShipmentData): Promise<ShipmentResponse>
trackShipment(trackingNumber: string): Promise<TrackingInfo>
```

**Features:**
- City search (debounced)
- Pickup point selection
- Shipment creation
- Tracking

**Tests:**
- ✅ City search: WORKS
- ✅ Pickup points: LOADS
- ✅ Shipment creation: WORKS

**Documentation:**
- `docs/NOVA_POSHTA_INTEGRATION.md`

**Modification Criteria:**
- ⚠️ **TEST IN SANDBOX** before production
- ✅ Can add new API methods
- ❌ **DO NOT** change existing function signatures
- ❌ **DO NOT** remove error handling

**Last Modified:** 2025-11-15  
**Review Date:** 2026-02-01 (quarterly — shipping critical)

---

### 12. Email Service (Resend)

**Location:** `src/lib/email.ts`, `src/emails/*.tsx`

**Status:** 🟢 **STABLE — EXTEND ONLY**

**Functions:**
```typescript
sendOrderConfirmationEmail(order: Order): Promise<void>
sendAdminNewOrderEmail(order: Order): Promise<void>
sendPasswordResetEmail(user: User, token: string): Promise<void>
```

**Templates:**
- `src/emails/OrderConfirmation.tsx`
- `src/emails/AdminNewOrder.tsx`
- `src/emails/PasswordReset.tsx`

**Features:**
- React email templates
- Transactional emails
- Async sending (doesn't block API)

**Tests:**
- ✅ Emails sent
- ✅ Templates render correctly
- ✅ Async sending works

**Documentation:**
- `docs/EMAIL_SETUP.md`

**Modification Criteria:**
- ✅ Can add new email templates
- ✅ Can update existing templates (preview first!)
- ❌ **DO NOT** remove async sending
- ❌ **DO NOT** block API responses on email

**Last Modified:** 2025-10-20  
**Review Date:** 2026-04-01 (quarterly)

---

## 📊 DATABASE SCHEMA (Tier 5 — FOUNDATIONAL)

### 13. Prisma Schema

**Location:** `prisma/schema.prisma`

**Status:** 🟢 **STABLE — MIGRATIONS ONLY**

**Models:**
- User (role: ADMIN|MANAGER|OPERATOR|VIEWER)
- Order (status: PENDING→IN_PRODUCTION→DELIVERED)
- OrderItem → Product → Category
- Payment (status, via Paynet)
- Delivery (via Nova Poshta)

**Enums:**
```prisma
enum UserRole { ADMIN, MANAGER, OPERATOR, VIEWER }
enum OrderStatus { PENDING, IN_PRODUCTION, DELIVERED, CANCELLED }
enum PaymentStatus { PENDING, PAID, FAILED, REFUNDED }
```

**Tests:**
- ✅ Migrations run successfully
- ✅ Relations work
- ✅ Enums typed correctly

**Documentation:**
- `README.md` (database section)
- `.github/copilot-instructions.md` (Prisma section)

**Modification Criteria:**
- ✅ Can add new models (with migration)
- ✅ Can add new fields (with migration)
- ❌ **DO NOT** remove fields without data migration
- ❌ **DO NOT** change enum values (breaking change)
- ✅ **ALWAYS** create migration: `npx prisma migrate dev`

**Last Modified:** 2025-05-10  
**Review Date:** 2026-04-01 (quarterly)

---

## 🚨 MODIFICATION PROCESS

### When You Need to Modify a Stable Zone

#### Step 1: Risk Assessment

- [ ] **Is this a bug fix?** → Allowed (test thoroughly)
- [ ] **Is this a feature addition?** → Allowed (extend, don't modify)
- [ ] **Is this a breaking change?** → Requires architecture review

#### Step 2: Documentation

- [ ] Update function JSDoc
- [ ] Update related documentation files
- [ ] Add migration guide (if breaking)

#### Step 3: Testing

- [ ] Write tests (unit + integration)
- [ ] Manual QA in dev environment
- [ ] Deploy to staging
- [ ] Manual QA in staging
- [ ] Monitor for 24 hours

#### Step 4: Rollout

- [ ] Feature flag (if possible)
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Rollback plan ready

#### Step 5: Update Registry

- [ ] Update this file (STABLE_ZONES_REGISTRY.md)
- [ ] Update "Last Modified" date
- [ ] Update "Review Date" (next quarter)
- [ ] Notify team in Slack/email

---

## 🔍 MONITORING STABLE ZONES

### Weekly Checks

- [ ] Zero 502 errors related to stable zones
- [ ] Auth flows working (login, logout, protected routes)
- [ ] API routes responding (< 500ms average)
- [ ] Database queries performant (< 100ms average)

### Monthly Reviews

- [ ] Review modification log (were any stable zones changed?)
- [ ] Check for breaking changes in dependencies
- [ ] Update documentation if needed
- [ ] Team training on new patterns

### Quarterly Audits

- [ ] Full regression testing
- [ ] Performance benchmarking
- [ ] Security review
- [ ] Dependency updates (minor versions only)
- [ ] Architecture review meeting

---

## 📈 ZONE STATUS LEGEND

- 🟢 **STABLE** — Production-tested, do not modify without review
- 🟡 **STABLE (TEST FIRST)** — Stable but requires sandbox testing
- 🔵 **EXTEND ONLY** — Can add new functions, don't change existing
- 🟠 **MODIFY WITH CARE** — Critical system, extra testing required
- 🔴 **DEPRECATED** — Will be removed, migrate to replacement

---

## 🎯 SUMMARY

**Total Stable Zones:** 13

**Tier Breakdown:**
- Tier 1 (CRITICAL): 5 zones
- Tier 2 (IMPORTANT): 3 zones
- Tier 3 (STABLE): 1 zone
- Tier 4 (EXTERNAL): 3 zones
- Tier 5 (FOUNDATIONAL): 1 zone

**Modification Rule:**
> **If in doubt, don't modify. Extend instead.**

**Golden Principle:**
> Stable zones are stable because they work. Respect that.

---

**Last Updated:** 2026-01-25  
**Maintained By:** Architecture Team  
**Next Review:** 2026-04-01 (Q2 2026)
