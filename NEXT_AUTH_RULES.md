# NEXT-AUTH — REGULI DE CONFIGURARE ȘI UTILIZARE

**Data ultimei actualizări**: 25 Ianuarie 2026  
**Scop**: Prevenirea erorilor CLIENT_FETCH_ERROR și menținerea stabilității autentificării

---

## 📋 REZUMAT EXECUTIV

Acest document stabilește regulile stricte pentru implementarea și menținerea NextAuth în aplicația sanduta.art. Respectarea acestor reguli PREVINE CLIENT_FETCH_ERROR, endpoint-uri invalide și loop-uri de autentificare.

**STATUS ACTUAL**: ✅ Configurația este STABILĂ și FUNCȚIONALĂ  
**Ultima verificare**: 25 Ianuarie 2026, 13:00 UTC

---

## 🏗️ ARHITECTURA NEXT-AUTH

### 1. SINGLE SOURCE OF TRUTH — authOptions

**REGULA #1**: `authOptions` trebuie definit într-un SINGUR loc și importat peste tot.

**Locație**: `src/modules/auth/nextauth.ts`

```typescript
// ✅ CORECT — Definiție unică în nextauth.ts
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      // ... configurare
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // ÎNTOTDEAUNA returnează token valid
      return token;
    },
    async session({ session, token }) {
      // ÎNTOTDEAUNA returnează session valid
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
```

**❌ INTERZIS**: Nu duplica authOptions în alte fișiere!

```typescript
// ❌ NU FACE ASTA în route.ts sau oriunde altundeva
const authOptions = { ... }; // INTERZIS!
```

---

### 2. HANDLER NEXT-AUTH — Simplitate Maximă

**REGULA #2**: Handler-ul NextAuth trebuie să fie MINIMAL — doar import + export.

**Locație**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
// ✅ CORECT — 8 linii, fără logică suplimentară
import NextAuth from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**❌ INTERZIS**:
- Nu adăuga try/catch în handler
- Nu adăuga middleware custom în acest fișier
- Nu modifica request/response manual
- Nu adăuga logging custom înaintea handler-ului

---

### 3. MIDDLEWARE — Excludere Explicită a /api/auth/*

**REGULA #3**: Middleware-ul NU trebuie să intercepteze rutele NextAuth.

**Locație**: `middleware.ts`

```typescript
// ✅ CORECT — Matcher exclude /api/*
export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/operator/:path*",
    "/account/:path*",
    // EXCLUS explicit: /api, /api/auth, /_next, static, files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
```

**❌ INTERZIS**: Nu folosi matcher-e care interceptează /api/auth/:path*

```typescript
// ❌ NU FACE ASTA
matcher: ["/((?!_next|static).*)"] // prea general!
```

**Verificare obligatorie**:
```bash
# Testează că middleware nu blochează NextAuth
curl http://localhost:3000/api/auth/session
# Trebuie să returneze JSON valid (nu redirect sau error)
```

---

## 🔐 CONSUM DE SESIUNE — Patternuri Standard

### 4. SERVER COMPONENTS — getServerSession()

**REGULA #4**: În Server Components, folosește DOAR `getServerSession(authOptions)`.

```typescript
// ✅ CORECT — Server Component
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Logică server-side cu session.user
  return <div>Welcome {session.user.name}</div>;
}
```

**❌ INTERZIS în Server Components**:
- Nu folosi `useSession()` (este hook React, client-only)
- Nu apela `fetch('/api/auth/session')` — loop infinit!
- Nu folosi `getSession()` deprecated

---

### 5. CLIENT COMPONENTS — useSession()

**REGULA #5**: În Client Components, folosește DOAR hook-ul `useSession()`.

```typescript
// ✅ CORECT — Client Component
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProfileClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // redirect în progress
  }

  return <div>Welcome {session.user.name}</div>;
}
```

**❌ INTERZIS în Client Components**:
- Nu apela manual `fetch('/api/auth/session')` — useSession face asta automat
- Nu folosi `getServerSession()` (server-only)
- Nu verifica session în useEffect fără status check

---

### 6. LAYOUT-URI — Pattern Hybrid Server + Client

**REGULA #6**: Layout-urile trebuie să folosească pattern-ul corect pentru tipul lor.

#### Layout Root (Server Component)
```typescript
// ✅ CORECT — src/app/layout.tsx
import { Providers } from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Layout Protejat (Client Component)
```typescript
// ✅ CORECT — src/app/admin/layout.tsx
'use client';

import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingState />;
  }

  // Middleware deja verifică autentificarea
  // Acest check este redundant dar safe
  if (!session || session.user.role !== 'ADMIN') {
    return <UnauthorizedState />;
  }

  return <AdminUI>{children}</AdminUI>;
}
```

**❌ INTERZIS**:
- Nu face `getServerSession()` în layout Client Component
- Nu uita `'use client'` când folosești `useSession()`
- Nu face redirect în layout Client Component — lasă middleware-ul să facă asta

---

## 🛡️ MIDDLEWARE — Protecție Rute

### 7. VERIFICARE ROLURI — getToken()

**REGULA #7**: Middleware-ul folosește `getToken()` pentru verificare roluri.

```typescript
// ✅ CORECT — middleware.ts
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Admin routes — doar ADMIN
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Manager routes — ADMIN + MANAGER
  if (path.startsWith("/manager")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "MANAGER" && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}
```

**❌ INTERZIS**:
- Nu folosi `getSession()` în middleware (nu funcționează)
- Nu verifica session din cookies manual
- Nu bloca /api/auth/* în matcher

---

## 📡 API ROUTES — Protecție Backend

### 8. API PROTECTION — requireRole Helper

**REGULA #8**: API routes folosesc helper-ul `requireRole()` pentru protecție.

```typescript
// ✅ CORECT — src/app/api/admin/orders/route.ts
import { requireRole } from '@/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  // user.id, user.role disponibile
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}
```

**Helper implementation** (`src/lib/auth-helpers.ts`):
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { NextResponse } from 'next/server';

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      ),
    };
  }

  return { user: session.user, error: null };
}
```

---

## 🚫 ANTI-PATTERNS — Nu Faceți Niciodată

### ❌ ANTI-PATTERN #1: Fetch manual de session în Server Component
```typescript
// ❌ NU FACE ASTA
export default async function Page() {
  const res = await fetch('http://localhost:3000/api/auth/session');
  const session = await res.json();
  // LOOP INFINIT + 502 error!
}
```

**✅ SOLUȚIE**: Folosește `getServerSession(authOptions)`

---

### ❌ ANTI-PATTERN #2: Callbacks care returnează null/undefined
```typescript
// ❌ NU FACE ASTA
callbacks: {
  async session({ session, token }) {
    if (!token) return null; // CLIENT_FETCH_ERROR!
  }
}
```

**✅ SOLUȚIE**: Întotdeauna returnează obiect valid
```typescript
callbacks: {
  async session({ session, token }) {
    if (!token) return session; // returnează session gol dar valid
    // ... modificări
    return session;
  }
}
```

---

### ❌ ANTI-PATTERN #3: Try/catch care înghite erori fără return
```typescript
// ❌ NU FACE ASTA
export default async function Page() {
  try {
    const session = await getServerSession(authOptions);
  } catch (e) {
    console.error(e);
    // NU returnezi nimic = pagină goală!
  }
  return <div>Content</div>;
}
```

**✅ SOLUȚIE**: Întotdeauna gestionează cazul de eroare
```typescript
export default async function Page() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error(e);
    redirect('/error');
  }

  if (!session) redirect('/login');
  return <div>Content</div>;
}
```

---

### ❌ ANTI-PATTERN #4: Middleware care interceptează /api/auth
```typescript
// ❌ NU FACE ASTA
export const config = {
  matcher: ["/:path*"], // interceptează TOATE rutele!
};
```

**✅ SOLUȚIE**: Exclude explicit /api
```typescript
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
```

---

## ✅ CHECKLIST DE VALIDARE

Folosește acest checklist pentru a verifica configurația NextAuth:

### Verificare Handler
- [ ] `route.ts` are exact 8 linii (import + handler + export)
- [ ] Nu există logică suplimentară în `route.ts`
- [ ] `authOptions` este importat din `nextauth.ts`

### Verificare authOptions
- [ ] `authOptions` este definit o singură dată în `src/modules/auth/nextauth.ts`
- [ ] `providers` array nu este gol
- [ ] `callbacks.jwt` returnează întotdeauna `token`
- [ ] `callbacks.session` returnează întotdeauna `session`
- [ ] `secret` este setat din `process.env.NEXTAUTH_SECRET`
- [ ] `session.strategy` este `"jwt"`

### Verificare Middleware
- [ ] Matcher exclude explicit `/api/*`
- [ ] Matcher exclude `/_next/static`, `/_next/image`, `favicon.ico`
- [ ] Middleware folosește `getToken()` din `next-auth/jwt`
- [ ] Nu există try/catch care înghite erori fără return

### Verificare Consum Sesiune
- [ ] Server Components folosesc `getServerSession(authOptions)`
- [ ] Client Components folosesc `useSession()` hook
- [ ] Nu există apeluri `fetch('/api/auth/session')` în cod
- [ ] Nu există `getSession()` deprecated

### Verificare Layout-uri
- [ ] Root layout nu face verificări auth (lasă Providers)
- [ ] Layout-uri protejate au `'use client'` când folosesc `useSession()`
- [ ] Layout-uri nu fac redirect (middleware face asta)

### Verificare API Routes
- [ ] Toate API routes protejate folosesc `requireRole()` helper
- [ ] Nu există verificări de session fără try/catch
- [ ] Toate cazurile returnează NextResponse valid

---

## 🧪 TESTARE — Proceduri de Validare

### Test 1: Endpoint /api/auth/session
```bash
# 1. Pornește server
npm run dev

# 2. Testează răspuns fără autentificare
curl -s http://localhost:3000/api/auth/session
# Trebuie să returneze: {}

# 3. Login manual și verifică session
# (folosește browser DevTools > Application > Cookies > copiază next-auth.session-token)
curl -s -H "Cookie: next-auth.session-token=TOKEN_HERE" \
  http://localhost:3000/api/auth/session
# Trebuie să returneze JSON valid cu user data
```

**Criteriu de succes**: Endpoint returnează ÎNTOTDEAUNA JSON valid (nu string gol, nu HTML)

---

### Test 2: Login/Logout Flow
```bash
# 1. Deschide browser la http://localhost:3000/login
# 2. Login cu: admin@sanduta.art / admin123
# 3. Verifică redirect la homepage
# 4. Accesează /account — nu trebuie să redirecteze la login
# 5. Logout
# 6. Încearcă /account — trebuie redirect la /login
```

**Criteriu de succes**: Nu apar erori CLIENT_FETCH_ERROR în console

---

### Test 3: Middleware Protection
```bash
# 1. Logout complet
# 2. Încearcă să accesezi:
curl -i http://localhost:3000/admin
# Trebuie să returneze 307 redirect la /login

# 3. Login ca user normal (nu admin)
# 4. Încearcă /admin
# Trebuie să returneze 307 redirect la /unauthorized
```

---

### Test 4: Prefetch Stability
```bash
# 1. Login
# 2. Deschide homepage
# 3. Hover peste Link-uri (nu da click)
# 4. Verifică Network tab — nu trebuie să apară 502 errors
```

---

## 🔧 DEBUGGING — Rezolvare Probleme

### Problemă: CLIENT_FETCH_ERROR în console

**Cauze posibile**:
1. `authOptions.callbacks` returnează `null` sau `undefined`
2. Handler NextAuth are logică customizată buggy
3. Middleware interceptează `/api/auth/*`
4. NEXTAUTH_SECRET lipsește sau diferă între componente

**Soluție**:
```bash
# 1. Verifică callbacks returnează întotdeauna valori
# 2. Simplifică route.ts la 8 linii standard
# 3. Actualizează matcher middleware
# 4. Verifică .env:
grep NEXTAUTH_SECRET .env
# Trebuie să returneze: NEXTAUTH_SECRET=supersecretkey
```

---

### Problemă: /api/auth/session returnează string gol

**Cauze posibile**:
1. authOptions nu este exportat corect
2. Handler nu folosește authOptions importat
3. Eroare de import circular

**Soluție**:
```bash
# 1. Verifică src/modules/auth/nextauth.ts:
# export const authOptions = { ... }

# 2. Verifică route.ts:
# import { authOptions } from "@/modules/auth/nextauth";

# 3. Șterge cache:
rm -rf .next
npm run dev
```

---

### Problemă: Session nu persistă după refresh

**Cauze posibile**:
1. `session.strategy` nu este `"jwt"`
2. Cookies nu sunt setate corect
3. NEXTAUTH_URL lipsește

**Soluție**:
```bash
# 1. Verifică authOptions:
session: { strategy: "jwt" }

# 2. Verifică .env:
NEXTAUTH_URL=http://localhost:3000

# 3. Verifică cookies în browser:
# Application > Cookies > localhost:3000
# Trebuie să vezi: next-auth.session-token, next-auth.csrf-token
```

---

## 📚 RESURSE OFICIALE

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js with Next.js 15 App Router](https://next-auth.js.org/configuration/nextjs)
- [JWT Session Strategy](https://next-auth.js.org/configuration/options#session)
- [Middleware Guide](https://next-auth.js.org/configuration/nextjs#middleware)

---

## 🎯 VIITOARE MODIFICĂRI AUTH

**ÎNAINTE** de a modifica orice legat de NextAuth:

1. [ ] Citește acest document complet
2. [ ] Verifică că modificarea ta nu încalcă nicio regulă
3. [ ] Testează local cu procedurile din secțiunea Testing
4. [ ] Verifică că `npm run build` nu aruncă erori
5. [ ] Testează login/logout flow complet
6. [ ] Actualizează acest document dacă adaugi reguli noi

---

**IMPORTANT**: Respectarea acestor reguli GARANTEAZĂ stabilitatea autentificării.  
**ORICE abatere** poate cauza CLIENT_FETCH_ERROR, loop-uri de redirect sau session pierdut.

---

_Document creat: 25 Ianuarie 2026_  
_Ultima actualizare: 25 Ianuarie 2026, 13:00 UTC_  
_Responsabil: @sandoo777_
