# ✅ ARCHITECTURAL CHECKLIST — Pre-Feature Development Guide

**Purpose:** Prevent regressions, ensure code quality, maintain architecture consistency  
**Status:** ✅ MANDATORY for all new features  
**Last Updated:** 2026-01-25

---

## 📋 How to Use This Checklist

1. **Before Writing Code:** Complete "Pre-Development" section
2. **During Development:** Follow component-specific checklist
3. **Before Committing:** Complete "Pre-Commit" section
4. **Before PR:** Complete "Pre-PR" section

---

## 🚀 PRE-DEVELOPMENT CHECKLIST

### 1. Architecture Planning

- [ ] **Component Type Decided**
  - [ ] Server Component (default for data fetching, auth)
  - [ ] Client Component (interactive UI, hooks, browser APIs)
  - [ ] API Route (data mutations, external APIs)
  - [ ] Middleware (global auth, redirects)

- [ ] **Data Flow Mapped**
  - [ ] Server → Client (props)
  - [ ] Client → API Route → Server (mutations)
  - [ ] Database access plan (Prisma queries)

- [ ] **Auth Requirements Clear**
  - [ ] Public (no auth)
  - [ ] Authenticated (any logged-in user)
  - [ ] Role-based (ADMIN, MANAGER, OPERATOR, VIEWER)

- [ ] **File Location Determined**
  ```
  src/app/           → Pages, layouts, API routes
  src/components/    → Reusable components
  src/lib/           → Utilities, helpers
  src/modules/       → Feature modules
  ```

---

### 2. Dependency Check

- [ ] **Imports Planned**
  - [ ] Using `@/` path alias (not relative paths)
  - [ ] No circular dependencies
  - [ ] Server-only imports not in Client Components
  - [ ] Client-only hooks not in Server Components

- [ ] **Third-party Libraries Verified**
  - [ ] Client-only libraries have `'use client'`
  - [ ] Server-only libraries not exposed to browser
  - [ ] Package.json updated if new dependency

---

### 3. Safety Wrappers Identified

- [ ] **Server Safety**
  - [ ] Using `safeRedirect()` instead of `redirect()`
  - [ ] Using `validateServerData()` for params
  - [ ] Using `fetchServerData()` for DB queries

- [ ] **Auth Safety**
  - [ ] Using `requireAuth()` or `requireRole()` in API routes
  - [ ] Using `getServerSession()` in Server Components
  - [ ] Using `useSession()` in Client Components

- [ ] **Navigation Safety**
  - [ ] Using `AuthLink` in auth routes
  - [ ] Using `Link` in public routes

---

## 🏗️ COMPONENT-SPECIFIC CHECKLISTS

### 📄 Server Component (page.tsx, layout.tsx)

#### Structure
- [ ] **No `'use client'` directive** (default Server Component)
- [ ] **Component is async function** (`async function Page()`)
- [ ] **Exports as default** (`export default function Page()`)

#### Params & Search Params
- [ ] **Params awaited** (`const { id } = await params`)
- [ ] **Params validated** (`validateServerData(id, 'ID missing')`)
- [ ] **Search params awaited** (`const { sort } = await searchParams`)

#### Authentication
- [ ] **Auth check at top**
  ```typescript
  const session = await getServerSession(authOptions);
  if (!session) return safeRedirect('/login');
  ```
- [ ] **User ID validated**
  ```typescript
  const userId = validateServerData(session.user?.id, 'User ID missing');
  ```
- [ ] **Role check if needed**
  ```typescript
  if (session.user.role !== 'ADMIN') return safeRedirect('/');
  ```

#### Data Fetching
- [ ] **Using `fetchServerData()` wrapper**
  ```typescript
  const data = await fetchServerData(
    () => prisma.model.findMany(),
    { timeout: 10000, retries: 2 }
  );
  ```
- [ ] **Error handling via wrapper** (no try/catch needed)
- [ ] **Timeout set** (default 10s acceptable)

#### Redirects
- [ ] **Using `safeRedirect()`** (not `redirect()`)
- [ ] **Always `return` after redirect**
  ```typescript
  if (!session) return safeRedirect('/login');
  ```

#### Imports
- [ ] **No React hooks** (`useState`, `useEffect`, etc.)
- [ ] **No browser APIs** (window, localStorage, etc.)
- [ ] **No event handlers** (onClick, onChange, etc.)
- [ ] **Only server-safe imports**

---

### 🖱️ Client Component

#### Structure
- [ ] **Has `'use client'` at top** (first line of file)
- [ ] **Component is regular function** (not async)
- [ ] **Exported as named or default**

#### Auth
- [ ] **Using `useSession()` hook**
  ```typescript
  const { data: session, status } = useSession();
  ```
- [ ] **Loading state handled**
  ```typescript
  if (status === 'loading') return <Spinner />;
  ```
- [ ] **Unauthenticated redirect**
  ```typescript
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status]);
  ```

#### Navigation
- [ ] **Using `useRouter()` for programmatic navigation**
  ```typescript
  const router = useRouter();
  router.push('/path');
  ```
- [ ] **NOT using `redirect()`** (Server only)

#### State Management
- [ ] **Using React hooks** (`useState`, `useEffect`, etc.)
- [ ] **State properly typed** (TypeScript interfaces)
- [ ] **State updates are immutable** (no direct mutations)

#### Data Fetching
- [ ] **Fetching via API routes** (not Prisma directly)
- [ ] **Loading state shown**
  ```typescript
  const [loading, setLoading] = useState(true);
  ```
- [ ] **Error state handled**
  ```typescript
  const [error, setError] = useState<string | null>(null);
  ```
- [ ] **Errors logged**
  ```typescript
  .catch(err => logger.error('Component', 'Fetch failed', { err }))
  ```

#### Forms
- [ ] **Using controlled inputs** (`value` + `onChange`)
- [ ] **Validation before submit**
- [ ] **Submit handler is async**
- [ ] **Loading state during submit**
- [ ] **Error messages displayed**

#### Imports
- [ ] **NO `prisma` import** (server-only)
- [ ] **NO `getServerSession` import** (server-only)
- [ ] **NO `redirect` import** (server-only)
- [ ] **Only client-safe imports**

---

### 🔌 API Route (route.ts)

#### Structure
- [ ] **Named exports** (`export async function GET()`, `POST()`, etc.)
- [ ] **Request parameter typed** (`req: NextRequest`)
- [ ] **Returns `NextResponse`**

#### Auth Protection
- [ ] **Auth check at top**
  ```typescript
  const { user, error } = await requireAuth();
  if (error) return error;
  ```
- [ ] **Or role-based**
  ```typescript
  const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;
  ```

#### Logging
- [ ] **Request logged**
  ```typescript
  logger.info('API:Route', 'Request received', { userId: user.id });
  ```
- [ ] **Errors logged**
  ```typescript
  logApiError('API:Route', err);
  ```

#### Error Handling
- [ ] **Wrapped in try/catch**
  ```typescript
  try {
    // ... logic
  } catch (err) {
    logApiError('API:Route', err);
    return createErrorResponse('Internal error', 500);
  }
  ```
- [ ] **Proper HTTP status codes**
  - 200 OK
  - 201 Created
  - 400 Bad Request (validation)
  - 401 Unauthorized (no auth)
  - 403 Forbidden (wrong role)
  - 404 Not Found
  - 500 Internal Server Error

#### Input Validation
- [ ] **Body parsed safely**
  ```typescript
  const body = await req.json();
  ```
- [ ] **Validation applied**
  ```typescript
  const errors = validateProductForm(body);
  if (errors.length > 0) {
    return createErrorResponse('Validation failed', 400, errors);
  }
  ```
- [ ] **Query params validated**

#### Response
- [ ] **Always returns JSON** (`NextResponse.json()`)
- [ ] **Includes status code**
- [ ] **No exposed internal errors** (log instead)

---

### 🛡️ Middleware

#### Structure
- [ ] **Exports `middleware` function**
- [ ] **Returns `NextResponse`**
- [ ] **Has `config.matcher`** (performance)

#### Auth Check
- [ ] **Using `withAuth()` wrapper** (NextAuth)
- [ ] **Token checked** (`req.nextauth.token`)
- [ ] **Role verified** (`token.role`)

#### Redirects
- [ ] **Using `NextResponse.redirect()`**
- [ ] **Proper URL construction** (`new URL('/', req.url)`)

#### Performance
- [ ] **Matcher configured** (don't run on all routes)
- [ ] **No expensive operations** (DB queries)
- [ ] **Fast execution** (< 10ms)

---

## 🔍 PRE-COMMIT CHECKLIST

### Code Quality
- [ ] **TypeScript errors: 0** (`npm run type-check` or IDE)
- [ ] **ESLint errors: 0** (`npm run lint`)
- [ ] **No console.log** (use `logger` instead)
- [ ] **No commented-out code** (delete or explain)
- [ ] **No TODO comments** (create GitHub issue instead)

### Imports
- [ ] **All imports use `@/` alias** (no `../../`)
- [ ] **No unused imports** (ESLint catches)
- [ ] **Organized by category** (React → third-party → internal → types)
- [ ] **No circular dependencies** (`madge --circular src/`)

### Server Component Safety
- [ ] **All `redirect()` → `safeRedirect()`**
- [ ] **All `redirect()` have `return`**
- [ ] **All params `await`ed**
- [ ] **All params validated**
- [ ] **All DB queries wrapped** (`fetchServerData()`)

### Client Component Safety
- [ ] **Has `'use client'` directive**
- [ ] **No `prisma` import**
- [ ] **No `redirect()` usage** (use `router.push()`)
- [ ] **Errors logged** (`logger`)

### API Route Safety
- [ ] **Has auth check** (`requireAuth` or `requireRole`)
- [ ] **Has try/catch**
- [ ] **Has logging**
- [ ] **Has validation**
- [ ] **Returns proper status codes**

### Auth Route Navigation
- [ ] **All auth route links use `AuthLink`**
- [ ] **No `Link` from `next/link` in:**
  - `/account/**`
  - `/admin/**`
  - `/manager/**`
  - `/operator/**`

### Testing
- [ ] **Manual test passed** (local dev)
- [ ] **Edge cases considered** (empty state, error state)
- [ ] **Auth flow tested** (logged in + logged out)

---

## 📝 PRE-PR CHECKLIST

### Documentation
- [ ] **Code comments for complex logic**
- [ ] **JSDoc for public APIs**
- [ ] **README updated** (if public-facing feature)
- [ ] **Types exported** (if reusable)

### Git
- [ ] **Branch from `main`**
- [ ] **Descriptive commit messages**
- [ ] **No merge conflicts**
- [ ] **Pre-commit hook passed** (AuthLink check)

### Review Preparation
- [ ] **PR description complete**
  - What: Feature description
  - Why: Problem solved
  - How: Technical approach
  - Testing: How to test
- [ ] **Screenshots** (if UI change)
- [ ] **Breaking changes noted** (if any)

### Testing in Staging
- [ ] **Deployed to staging**
- [ ] **Manual smoke test**
- [ ] **Auth flows tested**
- [ ] **Error scenarios tested**

### Performance
- [ ] **No performance regressions** (Lighthouse score)
- [ ] **Images optimized** (use `next/image`)
- [ ] **Bundle size checked** (no huge dependencies)

### Security
- [ ] **No secrets in code** (use env vars)
- [ ] **Input validated** (XSS, SQL injection prevented)
- [ ] **Auth properly enforced**
- [ ] **CORS configured** (if API route)

---

## 🎯 FEATURE-SPECIFIC CHECKLISTS

### 🛒 E-commerce Features

#### Product Listing
- [ ] Pagination implemented (API + UI)
- [ ] Filters work (category, price, etc.)
- [ ] Search works (debounced input)
- [ ] Images lazy-loaded (`next/image`)
- [ ] SEO metadata added (`generateMetadata()`)

#### Product Detail
- [ ] Dynamic route (`[id]/page.tsx`)
- [ ] Params validated
- [ ] 404 handled (product not found)
- [ ] Images optimized
- [ ] Related products loaded

#### Shopping Cart
- [ ] Cart state managed (Context API)
- [ ] Persisted (localStorage or API)
- [ ] Quantity validation (min/max)
- [ ] Price calculations correct
- [ ] Clear cart functionality

#### Checkout
- [ ] Form validation (all fields)
- [ ] Payment integration tested (Paynet)
- [ ] Shipping integration tested (Nova Poshta)
- [ ] Email confirmation sent (Resend)
- [ ] Order created in DB
- [ ] Redirect to success page

---

### 👤 User Management

#### Registration
- [ ] Email validation (format)
- [ ] Password strength check (min 8 chars)
- [ ] Duplicate email check
- [ ] Email verification sent
- [ ] User created in DB
- [ ] Auto-login after registration

#### Login
- [ ] Credentials validated
- [ ] Session created (NextAuth)
- [ ] Redirect to dashboard
- [ ] "Remember me" works
- [ ] Error messages clear

#### Password Reset
- [ ] Email sent with reset link
- [ ] Token validated (expires after 1 hour)
- [ ] Password updated in DB
- [ ] Confirmation email sent
- [ ] Redirect to login

---

### 🛠️ Admin Panel

#### Data Tables
- [ ] Sorting works (all columns)
- [ ] Filtering works (search, category, etc.)
- [ ] Pagination works (page size configurable)
- [ ] Bulk actions work (delete, export)
- [ ] Loading state shown

#### Forms
- [ ] Create works (new record)
- [ ] Edit works (existing record)
- [ ] Delete works (with confirmation)
- [ ] Validation on submit
- [ ] Success/error toast shown

#### Reports
- [ ] Date range picker works
- [ ] Data exports (CSV, PDF)
- [ ] Charts render correctly
- [ ] Data accurate (double-check calculations)
- [ ] Loading state during fetch

---

## 🚨 CRITICAL SAFETY CHECKS

### Before Merge to Main

- [ ] ✅ **Zero TypeScript errors**
- [ ] ✅ **Zero ESLint errors**
- [ ] ✅ **All tests passing** (if any)
- [ ] ✅ **Pre-commit hook passing**
- [ ] ✅ **Staging deployment successful**
- [ ] ✅ **Manual QA passed**
- [ ] ✅ **Code review approved** (1+ reviewer)

### Architecture Compliance

- [ ] ✅ **Server Components don't use hooks**
- [ ] ✅ **Client Components have `'use client'`**
- [ ] ✅ **All `redirect()` → `safeRedirect()` + return**
- [ ] ✅ **Auth routes use `AuthLink`**
- [ ] ✅ **API routes have auth check**
- [ ] ✅ **Params awaited and validated**

### No Regressions

- [ ] ✅ **Existing features still work**
- [ ] ✅ **No new 502 errors** (check logs)
- [ ] ✅ **Auth flows intact** (login, logout, protected routes)
- [ ] ✅ **Performance maintained** (Lighthouse score)

---

## 📊 METRICS TO TRACK

### Performance
- **Lighthouse Score:** > 90 (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size:** < 200KB gzipped (main bundle)
- **TTI (Time to Interactive):** < 2s
- **LCP (Largest Contentful Paint):** < 2.5s

### Reliability
- **502 Errors:** 0/hour (after AuthLink rollout)
- **API Success Rate:** > 99.9%
- **Uptime:** > 99.9%

### Code Quality
- **TypeScript Coverage:** 100% (strict mode)
- **ESLint Errors:** 0
- **Test Coverage:** > 80% (if tests exist)

---

## 🛠️ DEBUGGING CHECKLIST

### If Build Fails

1. [ ] Check TypeScript errors (`npm run type-check`)
2. [ ] Check ESLint errors (`npm run lint`)
3. [ ] Check circular dependencies (`madge --circular src/`)
4. [ ] Check import paths (`@/` alias configured?)
5. [ ] Check `'use client'` directive (if using hooks)

### If 502 Error in Production

1. [ ] Check for unsafe `Link` in auth routes → use `AuthLink`
2. [ ] Check for `redirect()` without `safeRedirect()` wrapper
3. [ ] Check for missing `return` before `redirect()`
4. [ ] Check server logs for actual error
5. [ ] Check Sentry for error details

### If Auth Not Working

1. [ ] Check `NEXTAUTH_SECRET` env var set
2. [ ] Check `NEXTAUTH_URL` correct
3. [ ] Check middleware `matcher` includes route
4. [ ] Check Server Component uses `getServerSession()`
5. [ ] Check Client Component uses `useSession()`

### If Data Not Loading

1. [ ] Check API route auth (`requireAuth()`)
2. [ ] Check Prisma query (`fetchServerData()` wrapper)
3. [ ] Check params validated (`validateServerData()`)
4. [ ] Check Client Component fetch (API endpoint correct?)
5. [ ] Check network tab for 401/403/500 errors

---

## 🎓 LEARNING RESOURCES

### Internal Docs
- **FINAL_APP_ROUTER_RULES.md** — Architecture rules
- **IMPORT_RULES.md** — Import organization
- **docs/AUTH_LINK_COMPONENT.md** — AuthLink usage
- **docs/SERVER_COMPONENT_SAFETY_GUIDE.md** — Server safety
- **docs/AUTOMATION_AUTH_PREFETCH.md** — Pre-commit hooks

### External Resources
- **Next.js 16 Docs:** https://nextjs.org/docs
- **React 19 Docs:** https://react.dev
- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://next-auth.js.org

---

## 🎯 FINAL SIGN-OFF

### Before Marking Feature Complete

I certify that:

- [ ] All checklists above completed ✅
- [ ] No shortcuts taken (no `// @ts-ignore`, no `any` types)
- [ ] Documentation updated
- [ ] Team notified of new feature
- [ ] Monitoring alerts configured (if needed)
- [ ] Ready for production deployment 🚀

**Developer:** _______________  
**Date:** _______________  
**Feature:** _______________

---

**Status:** ✅ MANDATORY CHECKLIST  
**Last Updated:** 2026-01-25  
**Next Review:** After 50 features shipped (track learnings)
