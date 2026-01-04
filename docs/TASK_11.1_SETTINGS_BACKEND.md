# Backend Settings Module - Implementare Completă

## Sumar Implementare

Backend-ul complet pentru modulul Settings a fost implementat cu succes, incluzând gestionarea utilizatorilor, rolurilor, permisiunilor și configurărilor globale ale sistemului.

---

## 1. Modificări Prisma Schema

### 1.1 Actualizare Enum UserRole

```prisma
enum UserRole {
  ADMIN
  MANAGER
  OPERATOR
  VIEWER
}
```

**Modificări față de versiunea anterioară:**
- Înlocuit `CLIENT` cu `VIEWER`
- Clarificat ierarhia de roluri

### 1.2 Actualizare Model User

```prisma
model User {
  id            String    @id @default(cuid())
  name          String                    // Required
  email         String    @unique
  password      String                    // Required
  role          UserRole  @default(OPERATOR)
  active        Boolean   @default(true)  // NEW
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt     // Fixed
  
  // Relations
  accounts       Account[]
  sessions       Session[]
  orders         Order[]
  assignedOrders Order[]          @relation("AssignedOrders")
  customerNotes  CustomerNote[]   @relation("CustomerNotes")
  productionJobs ProductionJob[]  @relation("AssignedProductionJobs")

  @@map("users")
}
```

**Câmpuri noi/modificate:**
- `name`: acum required
- `password`: acum required
- `active`: câmp nou pentru activare/dezactivare cont
- `role`: default schimbat la `OPERATOR`
- `updatedAt`: fix pentru actualizare automată

### 1.3 Model Nou: SystemSetting

```prisma
model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt

  @@map("system_settings")
}
```

**Exemple de keys:**
- `company_name`: numele companiei
- `company_email`: email contact
- `default_currency`: valuta implicită (MDL, EUR, USD)
- `low_stock_threshold`: pragul minim pentru alerte stoc
- `timezone`: fusul orar (ex: Europe/Chisinau)

---

## 2. API Routes Implementate

### 2.1 Users Management

#### GET `/api/admin/settings/users`
- **Permisiuni:** ADMIN, MANAGER, OPERATOR (read-only)
- **Răspuns:** Listă cu toți utilizatorii (fără parole)

```json
[
  {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "OPERATOR",
    "active": true,
    "createdAt": "2026-01-04T...",
    "updatedAt": "2026-01-04T..."
  }
]
```

#### POST `/api/admin/settings/users`
- **Permisiuni:** ADMIN, MANAGER
- **Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "OPERATOR",
  "active": true
}
```

**Validări:**
- `name` required, non-empty
- `email` required, unique
- `password` required, min 6 caractere
- `role` poate fi setat doar de ADMIN
- Password hashuit automat cu bcrypt

#### GET `/api/admin/settings/users/[id]`
- **Permisiuni:** ADMIN, MANAGER, OPERATOR
- **Răspuns:** Utilizator individual (fără parolă)

#### PATCH `/api/admin/settings/users/[id]`
- **Permisiuni:** ADMIN, MANAGER
- **Body:** (toate opționale)
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "role": "MANAGER",
  "active": false
}
```

**Reguli speciale:**
- Email: verificare unicitate
- Password: hash nou dacă se schimbă
- Role: doar ADMIN poate modifica
- MANAGER nu poate schimba roluri

#### DELETE `/api/admin/settings/users/[id]`
- **Permisiuni:** doar ADMIN
- **Protecții:**
  - Nu permite ștergerea propriului cont
  - Nu permite ștergerea ultimului ADMIN

---

### 2.2 System Settings

#### GET `/api/admin/settings/system`
- **Permisiuni:** ADMIN, MANAGER
- **Răspuns:**
```json
{
  "settings": {
    "company_name": "Sanduta Print",
    "company_email": "contact@sanduta.art",
    "default_currency": "MDL",
    "low_stock_threshold": "10",
    "timezone": "Europe/Chisinau"
  },
  "raw": [...]
}
```

#### PATCH `/api/admin/settings/system`
- **Permisiuni:** ADMIN, MANAGER
- **Body:**
```json
{
  "settings": {
    "company_name": "New Name",
    "new_key": "new_value"
  }
}
```

**Funcționalitate:**
- Upsert: creează key dacă nu există, update dacă există
- Toate valorile sunt string (conversie în UI)
- Batch update pentru multiple settings

---

## 3. Logica de Permisiuni

### 3.1 Ierarhie Roluri

```
ADMIN (full access)
  ├─ Gestionare utilizatori (full CRUD)
  ├─ Modificare roluri
  └─ Gestionare system settings

MANAGER (management access)
  ├─ Gestionare utilizatori (CRUD, fără roluri)
  ├─ Gestionare system settings
  └─ Read-only pentru tot

OPERATOR (operational access)
  ├─ Vizualizare utilizatori (read-only)
  └─ Fără acces la system settings

VIEWER (read-only access)
  └─ Vizualizare utilizatori (read-only)
```

### 3.2 Helper Functions

Fișier: `/src/lib/auth-helpers.ts`

```typescript
// Verifică autentificare
requireAuth()

// Verifică rol specific
requireRole(['ADMIN', 'MANAGER'])

// Permission checks
canManageUsers(role)        // ADMIN || MANAGER
canManageRoles(role)        // ADMIN only
canManageSystemSettings(role) // ADMIN || MANAGER
canViewUsers(role)          // ADMIN || MANAGER || OPERATOR
```

**Caracteristici:**
- Obține user complet din DB cu rol
- Verifică dacă utilizatorul este activ
- Returnează NextResponse cu erori standard

---

## 4. Securitate

### 4.1 Password Hashing
- **Algoritm:** bcrypt
- **Rounds:** 10
- **Validare:** min 6 caractere

### 4.2 Protecții Implementate
1. **Self-deletion protection:** Utilizatorul nu poate șterge propriul cont
2. **Last admin protection:** Nu se poate șterge ultimul ADMIN
3. **Email uniqueness:** Verificare unicitate la create/update
4. **Active status:** Utilizatori inactivi nu pot face login
5. **Role hierarchy:** MANAGER nu poate schimba roluri

### 4.3 Autentificare
- **Mechanism:** NextAuth.js session-based
- **Verificare:** pe fiecare request prin `requireAuth()`
- **Database lookup:** la fiecare request pentru rol actualizat

---

## 5. Testing

### 5.1 Test Suite

**Fișier:** `/scripts/test-settings.ts`

Tests implementate:
1. ✓ Create User
2. ✓ Password Hashing & Verification
3. ✓ Update User (name, active status)
4. ✓ Update Password (with new hash)
5. ✓ List Users
6. ✓ Get Single User
7. ✓ Email Uniqueness Validation
8. ✓ Count Admin Users
9. ✓ Create System Settings (upsert)
10. ✓ Read System Settings
11. ✓ Update System Setting
12. ✓ Role-Based Permission Matrix
13. ✓ Delete Test User (cleanup)

**Rulare teste:**
```bash
npx tsx scripts/test-settings.ts
```

### 5.2 API Test Script

**Fișier:** `/scripts/test-settings-api.sh`

Tests API endpoints:
1. Create new user
2. List all users
3. Get single user
4. Update user
5. Update password
6. System settings GET
7. System settings PATCH
8. Verify persistence
9. Delete user
10. Duplicate email validation

**Rulare:**
```bash
./scripts/test-settings-api.sh
```

---

## 6. Migrare Database

### Migrare Aplicată

```bash
npx prisma migrate dev --name add_settings_models
```

**Fișier migrare:** `20260104183356_add_settings_models`

**Modificări:**
- Actualizat enum `UserRole`
- Adăugat câmp `active` la `User`
- Creat tabel `system_settings`
- Modificări în constraints

**⚠️ Warning:** Valoarea `CLIENT` din enum `UserRole` a fost ștearsă. Dacă există înregistrări cu această valoare, migrarea va eșua.

---

## 7. Types & Exports

### 7.1 Types Actualizate

**Fișier:** `/src/lib/types-prisma.ts`

```typescript
// Export UserRole enum from Prisma
export { UserRole } from "@prisma/client";

// Role object for backward compatibility
export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
};

// Type guard
export function isRole(value: string): value is Role {
  return ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'].includes(value);
}
```

**Utilizare:**
```typescript
// Ca enum
if (user.role === Role.ADMIN) { ... }

// Ca type
import { UserRole } from "@prisma/client";
const role: UserRole = "ADMIN";
```

---

## 8. Integrare cu Frontend

### 8.1 Endpoint-uri Disponibile

Pregătite pentru Task 11.2 (Settings UI):

```
GET    /api/admin/settings/users          - Listă utilizatori
POST   /api/admin/settings/users          - Creare user
GET    /api/admin/settings/users/[id]     - Detalii user
PATCH  /api/admin/settings/users/[id]     - Update user
DELETE /api/admin/settings/users/[id]     - Ștergere user

GET    /api/admin/settings/system         - Settings sistem
PATCH  /api/admin/settings/system         - Update settings
```

### 8.2 Response Format Standard

**Success:**
```json
{
  "id": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized
- `403` - Forbidden (permissions)
- `404` - Not Found
- `500` - Server Error

---

## 9. Următorii Pași

### Pentru Task 11.2 (Settings UI):

1. **Users Management UI:**
   - Tabel cu listă utilizatori
   - Form pentru create/edit user
   - Modal de confirmare pentru delete
   - Filtrare după rol și status

2. **System Settings UI:**
   - Form pentru editare settings
   - Grupare pe categorii
   - Validare client-side
   - Preview pentru schimbări

3. **Permissions UI:**
   - Matrix vizual de permisiuni
   - Explicații pentru fiecare rol
   - Warnings pentru acțiuni sensibile

---

## 10. Checklist Implementare

- [x] Actualizare Prisma schema
- [x] Migrare database
- [x] API routes pentru Users (CRUD)
- [x] API routes pentru System Settings
- [x] Helper functions pentru autentificare
- [x] Helper functions pentru permisiuni
- [x] Password hashing
- [x] Validări și protecții
- [x] Test suite TypeScript
- [x] Test script bash
- [x] Types și exports
- [x] Documentație completă

---

## 11. Concluzie

Backend-ul pentru modulul Settings este complet implementat și testat. Toate endpoint-urile sunt funcționale, securizate și documentate. Sistemul de permisiuni este robust și flexibil.

**Status:** ✅ READY FOR FRONTEND (Task 11.2)

**Data implementării:** 4 ianuarie 2026
