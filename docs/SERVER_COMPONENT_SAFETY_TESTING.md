# 🧪 Ghid de Testare — Server Component Safety

**Manual testing guide pentru verificarea implementării complete**

---

## ✅ Pre-Test Checklist

Înainte de a începe testarea, verifică:

- [ ] Development server rulează: `npm run dev`
- [ ] Database este accesibilă: `npm run prisma:studio`
- [ ] Ai cont de test: `admin@sanduta.art` / `admin123`
- [ ] Browser DevTools deschis (Console + Network tabs)

---

## 🎯 Test Suite

### Test 1: Auth Redirect (Unauthenticated Access)

**Obiectiv:** Verifică că redirect-ul fără autentificare funcționează fără crash.

**Pași:**
1. Logout din aplicație (sau deschide incognito window)
2. Accesează direct: `http://localhost:3000/account/orders`
3. Observă redirect automat la `/auth/signin` sau `/login`

**Expected:**
- ✅ Redirect smooth (307 Temporary Redirect)
- ✅ Nu apare 502 Error
- ✅ Ajungi la login page fără crash
- ✅ În console: `[ServerSafe] Redirecting to: /auth/signin`

**Actual:** _________________

---

### Test 2: Session Validation

**Obiectiv:** Verifică că validateServerData() previne null reference errors.

**Pași:**
1. Login cu user valid: `admin@sanduta.art` / `admin123`
2. Accesează: `http://localhost:3000/account/orders`
3. Verifică că pagina se încarcă corect cu comenzi

**Expected:**
- ✅ Pagina se încarcă fără erori
- ✅ Nu apare "User ID not found in session"
- ✅ Comenzile se afișează corect
- ✅ În console: Fără erori

**Actual:** _________________

---

### Test 3: Prefetch Safety

**Obiectiv:** Verifică că prefetch nu crash-ează paginile.

**Pași:**
1. Login în aplicație
2. Navighează la homepage sau dashboard
3. Hover peste link-uri cu `<Link prefetch>` (ex: "Comenzile mele")
4. Verifică în Network tab: vezi request-uri de prefetch
5. Click pe link

**Expected:**
- ✅ Prefetch se execută în background (vezi în Network)
- ✅ Nu apare 502 Error la prefetch
- ✅ Click pe link funcționează instant (data deja prefetch-ată)
- ✅ Fără crash-uri în console

**Actual:** _________________

---

### Test 4: Role Check Protection

**Obiectiv:** Verifică că role check redirect-ează corect unauthorized users.

**Pași:**
1. Login cu user NON-admin (creează user cu role `VIEWER`)
2. Accesează direct: `http://localhost:3000/manager/orders`
3. Observă redirect la homepage `/`

**Expected:**
- ✅ Redirect la `/` (homepage)
- ✅ Nu apare 502 Error
- ✅ Message: "Nu ai permisiunea să accesezi această pagină" (optional)
- ✅ În console: `[ServerSafe] Redirecting to: /`

**Actual:** _________________

---

### Test 5: Prisma Query Timeout

**Obiectiv:** Verifică că fetchServerData() handle-ează timeout-uri.

**Simulare:**
1. Temporar, modifică timeout în `src/app/account/addresses/page.tsx`:
   ```typescript
   const addresses = await fetchServerData(
     () => prisma.address.findMany({ where: { userId } }),
     { timeout: 1, retries: 1 }  // ← 1ms timeout pentru test
   );
   ```
2. Accesează `/account/addresses`
3. Observă că fetch timeout-ează și retry-ează

**Expected:**
- ✅ În console: `[ServerSafe] Fetching data (attempt 1/2)`
- ✅ În console: `[ServerSafe] Fetching data (attempt 2/2)`
- ✅ Apoi throw error sau display fallback
- ✅ Nu freeze aplicația
- ⚠️ **UNDO** modificarea după test!

**Actual:** _________________

---

### Test 6: Dynamic Route Params

**Obiectiv:** Verifică că params validation funcționează.

**Pași:**
1. Login în aplicație
2. Accesează o comandă validă: `/account/orders/[valid-id]`
3. Modifică ID în URL la ceva invalid: `/account/orders/999999`
4. Observă comportamentul

**Expected:**
- ✅ Pentru ID valid: pagina se încarcă
- ✅ Pentru ID invalid: redirect la `/account/orders` SAU 404 page
- ✅ Nu apare null reference error
- ✅ Nu crash-ează aplicația

**Actual:** _________________

---

### Test 7: Test Session Page

**Obiectiv:** Verifică că test-session page display-ează corect session data.

**Pași:**
1. Login în aplicație
2. Accesează: `http://localhost:3000/test-session`
3. Verifică că session data este afișat

**Expected:**
- ✅ Status: "✅ Authenticated"
- ✅ Session JSON display corect (user, role, etc.)
- ✅ Nu apare "Session user data is missing"
- ✅ Fără erori în console

**Actual:** _________________

---

### Test 8: Multiple Rapid Navigation

**Obiectiv:** Stress test — navighează rapid între pagini protejate.

**Pași:**
1. Login în aplicație
2. Click rapid între:
   - `/account/orders`
   - `/account/addresses`
   - `/account/projects`
   - `/manager/orders` (dacă ești admin)
3. Repetă 5-10 ori

**Expected:**
- ✅ Toate paginile se încarcă corect
- ✅ Fără 502 errors
- ✅ Fără memory leaks (check DevTools Performance)
- ✅ Navigation smooth

**Actual:** _________________

---

### Test 9: Browser Back/Forward

**Obiectiv:** Verifică că browser navigation funcționează cu protecțiile.

**Pași:**
1. Login și navighează: Home → Orders → Order Detail
2. Click "Back" în browser (de 2 ori)
3. Click "Forward" în browser (de 2 ori)
4. Repetă de câteva ori

**Expected:**
- ✅ Back/Forward funcționează smooth
- ✅ Fără re-fetch inutile (data cached)
- ✅ Fără 502 errors
- ✅ State-ul paginii se păstrează

**Actual:** _________________

---

### Test 10: Network Offline Simulation

**Obiectiv:** Verifică behavior la pierderea conexiunii.

**Pași:**
1. Login în aplicație
2. Deschide DevTools → Network tab
3. Setează "Offline" mode
4. Încearcă să navighezi la `/account/orders`

**Expected:**
- ✅ fetchServerData() timeout după 10s
- ✅ Error message clar: "Failed to load"
- ✅ Nu freeze aplicația
- ✅ Retry logic se execută (2 încercări)

**Actual:** _________________

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Auth Redirect | ⬜ Pass / ⬜ Fail | |
| 2. Session Validation | ⬜ Pass / ⬜ Fail | |
| 3. Prefetch Safety | ⬜ Pass / ⬜ Fail | |
| 4. Role Check | ⬜ Pass / ⬜ Fail | |
| 5. Prisma Timeout | ⬜ Pass / ⬜ Fail | |
| 6. Dynamic Params | ⬜ Pass / ⬜ Fail | |
| 7. Test Session Page | ⬜ Pass / ⬜ Fail | |
| 8. Rapid Navigation | ⬜ Pass / ⬜ Fail | |
| 9. Back/Forward | ⬜ Pass / ⬜ Fail | |
| 10. Offline Mode | ⬜ Pass / ⬜ Fail | |

**Overall:** _____ / 10 tests passed

---

## 🐛 Common Issues & Fixes

### Issue 1: "User ID not found in session"

**Cauză:** Session nu conține user.id  
**Fix:** Verifică NextAuth callback-urile în `src/modules/auth/nextauth.ts`

### Issue 2: Timeout prea mic

**Cauză:** fetchServerData() timeout default (10s) prea mic pentru query complex  
**Fix:** Crește timeout:
```typescript
await fetchServerData(
  () => prisma.query(...),
  { timeout: 30000 }  // 30s
);
```

### Issue 3: Redirect loop

**Cauză:** Middleware și safeRedirect() conflict  
**Fix:** Verifică `middleware.ts` matcher pattern

---

## 🚀 Production Testing

După ce toate testele locale trec, testează în production:

### Vercel Preview Deploy:
```bash
git push origin main
# Așteaptă Vercel preview deploy
# Testează pe preview URL
```

### Monitoring în Production:
1. **Sentry/DataDog:** Monitorizează 502 errors
2. **Vercel Analytics:** Verifică page load times
3. **Console Logs:** Verifică `[ServerSafe]` logs în Vercel logs

---

## ✅ Sign-off

**Tester:** _________________  
**Date:** _________________  
**Environment:** ⬜ Local / ⬜ Staging / ⬜ Production  
**Status:** ⬜ All tests passed / ⬜ Issues found (see notes)

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

---

**Ghid creat:** 2025-01-25  
**Pentru suport:** Vezi `docs/SERVER_COMPONENT_SAFETY_GUIDE.md`
