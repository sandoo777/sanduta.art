# Settings Backend - Quick Start Guide

## Implementare Finalizată ✅

Backend-ul complet pentru modulul Settings este implementat și funcțional.

---

## 🚀 Quick Start

### 1. Verificare Migrare

Migrația a fost aplicată automat:
```bash
npx prisma migrate deploy
```

### 2. Regenerare Prisma Client (dacă e necesar)

```bash
npx prisma generate
```

### 3. Testare Backend

#### Test TypeScript (Database)
```bash
npx tsx scripts/test-settings.ts
```

#### Test API (HTTP)
```bash
# Pornește serverul mai întâi
npm run dev

# În alt terminal:
./scripts/test-settings-api.sh
```

---

## 📋 API Endpoints Disponibile

### Users Management

```bash
# List users
GET /api/admin/settings/users

# Create user
POST /api/admin/settings/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "OPERATOR",
  "active": true
}

# Get user
GET /api/admin/settings/users/[id]

# Update user
PATCH /api/admin/settings/users/[id]
{
  "name": "New Name",
  "active": false
}

# Delete user
DELETE /api/admin/settings/users/[id]
```

### System Settings

```bash
# Get all settings
GET /api/admin/settings/system

# Update settings
PATCH /api/admin/settings/system
{
  "settings": {
    "company_name": "Sanduta Print",
    "company_email": "contact@sanduta.art",
    "default_currency": "MDL"
  }
}
```

---

## 🔐 Permissions

### Role Hierarchy

```
ADMIN
├─ Full access to everything
├─ Can manage users (including roles)
├─ Can delete users (except self and last admin)
└─ Can manage system settings

MANAGER
├─ Can manage users (except roles)
├─ Can view all users
└─ Can manage system settings

OPERATOR
├─ Can view users (read-only)
└─ No access to system settings

VIEWER
└─ Can view users (read-only)
```

---

## 🛡️ Security Features

- ✅ **Password Hashing:** bcrypt with 10 rounds
- ✅ **Self-deletion Protection:** Users can't delete themselves
- ✅ **Last Admin Protection:** Can't delete the last admin
- ✅ **Email Uniqueness:** Enforced at DB and API level
- ✅ **Active Status Check:** Inactive users can't access system
- ✅ **Role Hierarchy:** MANAGER can't change roles
- ✅ **Session-based Auth:** NextAuth with DB lookup

---

## 📊 Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String                    // Required
  email         String    @unique
  password      String                    // Required, hashed
  role          UserRole  @default(OPERATOR)
  active        Boolean   @default(true)  // New field
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### SystemSetting Model
```prisma
model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String                        // Always string
  updatedAt DateTime @updatedAt
}
```

### UserRole Enum
```prisma
enum UserRole {
  ADMIN
  MANAGER
  OPERATOR
  VIEWER
}
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Create user with all fields
- [ ] Create user without optional fields
- [ ] Try duplicate email (should fail)
- [ ] Update user name and email
- [ ] Update user password
- [ ] Change role (as ADMIN)
- [ ] Try change role as MANAGER (should fail)
- [ ] Deactivate user
- [ ] Try delete self (should fail)
- [ ] Delete user (as ADMIN)
- [ ] Try delete last admin (should fail)
- [ ] Get all system settings
- [ ] Update system settings (create new keys)
- [ ] Verify settings persistence

### Permission Testing

- [ ] ADMIN can do everything
- [ ] MANAGER can manage users (except roles)
- [ ] MANAGER can manage settings
- [ ] OPERATOR can only view users
- [ ] OPERATOR can't access settings
- [ ] VIEWER can only view users

---

## 🔧 Troubleshooting

### Issue: "Unknown argument `active`"
**Solution:** Regenerate Prisma Client
```bash
npx prisma generate
```

### Issue: "SASL: SCRAM-SERVER-FIRST-MESSAGE"
**Solution:** Check database connection in `.env`
```bash
# Make sure DATABASE_URL is correct
echo $DATABASE_URL
```

### Issue: "User not found or inactive"
**Solution:** Check if user is active in database
```sql
SELECT id, email, active FROM users WHERE email = 'your@email.com';
```

### Issue: Build errors with Role import
**Solution:** Types are fixed in `/src/lib/types-prisma.ts`
- Use `Role.ADMIN` for enum access
- Import `UserRole` from `@prisma/client` for types

---

## 📝 Example Requests

### cURL Examples

```bash
# Create user
curl -X POST http://localhost:3000/api/admin/settings/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "OPERATOR"
  }'

# Update settings
curl -X PATCH http://localhost:3000/api/admin/settings/system \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "company_name": "My Company",
      "low_stock_threshold": "5"
    }
  }'
```

---

## 📚 Documentation

Full documentation: [`/docs/TASK_11.1_SETTINGS_BACKEND.md`](./TASK_11.1_SETTINGS_BACKEND.md)

---

## ✅ Status

**Backend Status:** ✅ COMPLETE  
**Tests Status:** ✅ PASSING  
**Ready for:** Task 11.2 (Settings UI)

**Last Updated:** 4 ianuarie 2026
