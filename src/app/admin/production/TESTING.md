# Production Workflow UI - Testing Guide

Ghid complet pentru testarea tuturor funcționalităților din Production Workflow.

## 📋 Prerequisites

1. **Backend funcțional:**
   ```bash
   # Verifică că API-ul funcționează
   curl http://localhost:3000/api/admin/production
   ```

2. **User autentificat cu rol:** ADMIN, MANAGER sau OPERATOR

3. **Date de test:**
   - Cel puțin 1 comandă în sistem
   - Cel puțin 1 user cu rol MANAGER sau OPERATOR

---

## 🧪 Test Scenarios

### **Test 1: Accesare Production Board**

**Obiectiv:** Verifică că board-ul Kanban se afișează corect

**Pași:**
1. Login ca ADMIN/MANAGER/OPERATOR
2. Click "Production" în sidebar
3. Așteptă loading

**Rezultat așteptat:**
✅ Board cu 5 coloane (PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELED)
✅ Header cu "Production Workflow"
✅ Search bar și filtru priority
✅ Buton "Create Job"
✅ Counter joburi per coloană (poate fi 0)

**Screenshot locație:** `/admin/production`

---

### **Test 2: Creare Job Nou**

**Obiectiv:** Creează un job de producție nou

**Pași:**
1. Pe board, click "Create Job"
2. Modal se deschide
3. Fill:
   - **Name:** "Test Job - Printare 100 flyere"
   - **Order:** Select first order din dropdown
   - **Priority:** HIGH
   - **Due Date:** Select 7 zile în viitor
   - **Notes:** "Job de test pentru verificare"
   - **Operator:** Select first operator
4. Click "Create Job"

**Rezultat așteptat:**
✅ Modal se închide
✅ Board se reîmprospătează
✅ Noul job apare în coloana PENDING
✅ Job card afișează:
  - Name: "Test Job - Printare 100 flyere"
  - Priority badge: HIGH (orange)
  - Order ID
  - Customer name
  - Assigned operator (avatar + name)
  - Due date (7 zile)

**API Call verificat:**
```bash
POST /api/admin/production
{
  "orderId": "...",
  "name": "Test Job - Printare 100 flyere",
  "priority": "HIGH",
  "dueDate": "2026-01-11",
  "notes": "Job de test pentru verificare",
  "assignedToId": "..."
}
```

---

### **Test 3: Search Funcțional**

**Obiectiv:** Verifică că search filtrează joburile

**Pași:**
1. Pe board, în search bar, type: "flyere"
2. Press Enter sau click search icon

**Rezultat așteptat:**
✅ Board afișează doar joburi care conțin "flyere" în:
  - Job name
  - Order ID
  - Customer name
✅ Coloanele goale afișează "No jobs"

**Test Search Scenarios:**
- Search by job name: "flyere" → găsește jobul de test
- Search by order ID: "ORDER-123" → găsește joburi pentru acea comandă
- Search by customer: "Popescu" → găsește joburi pentru clientul Popescu
- Search empty: "" → afișează toate joburile

---

### **Test 4: Filtrare după Priority**

**Obiectiv:** Filtrează joburi după prioritate

**Pași:**
1. Pe board, click dropdown "All Priorities"
2. Select "HIGH"

**Rezultat așteptat:**
✅ Board afișează doar joburi cu priority HIGH
✅ Alte priorities (LOW, NORMAL, URGENT) sunt ascunse
✅ Counter coloane updatat

**Test Priority Filters:**
- Filter LOW → vezi doar LOW priority jobs
- Filter NORMAL → vezi doar NORMAL priority jobs
- Filter HIGH → vezi doar HIGH priority jobs
- Filter URGENT → vezi doar URGENT priority jobs
- Clear filters → vezi toate joburile

---

### **Test 5: Navighează la Job Details**

**Obiectiv:** Click pe job card navighează la pagina detalii

**Pași:**
1. Pe board, click pe un job card (test jobul creat)
2. Așteptă loading

**Rezultat așteptat:**
✅ Navighează la `/admin/production/[id]`
✅ Header afișează job name
✅ Status badge + Priority badge
✅ "Created..." timestamp
✅ 4 tabs: Overview, Order, Notes, Timeline
✅ Sidebar cu 3 dropdowns:
  - Status Manager
  - Priority Manager
  - Assign Operator

---

### **Test 6: Update Status (PENDING → IN_PROGRESS)**

**Obiectiv:** Schimbă status și verifică auto-set startedAt

**Pași:**
1. Pe job details page (PENDING job)
2. Sidebar → Status dropdown
3. Select "In Progress"
4. Așteptă update

**Rezultat așteptat:**
✅ Status badge updatat: IN_PROGRESS (blue)
✅ Dropdown arată "In Progress"
✅ Overview tab → "Started At" are timestamp (nu mai e "N/A")
✅ Timeline tab → eveniment nou "Job Started"

**API Call verificat:**
```bash
PATCH /api/admin/production/[id]
{
  "status": "IN_PROGRESS"
}

Response includes: startedAt: "2026-01-04T10:30:00.000Z"
```

---

### **Test 7: Update Status (IN_PROGRESS → COMPLETED)**

**Obiectiv:** Schimbă status la COMPLETED și verifică auto-set completedAt

**Pași:**
1. Pe job details page (IN_PROGRESS job)
2. Sidebar → Status dropdown
3. Select "Completed"
4. Așteptă update

**Rezultat așteptat:**
✅ Status badge updatat: COMPLETED (green)
✅ Dropdown arată "Completed"
✅ Overview tab → "Completed At" are timestamp (nu mai e "N/A")
✅ Timeline tab → eveniment nou "Job Completed"

**API Call verificat:**
```bash
PATCH /api/admin/production/[id]
{
  "status": "COMPLETED"
}

Response includes: completedAt: "2026-01-04T11:00:00.000Z"
```

---

### **Test 8: Update Priority**

**Obiectiv:** Schimbă priority și verifică UI update

**Pași:**
1. Pe job details page (job cu priority HIGH)
2. Sidebar → Priority dropdown
3. Select "Urgent"
4. Așteptă update

**Rezultat așteptat:**
✅ Priority badge updatat: URGENT (red)
✅ Dropdown arată "Urgent"
✅ Back to board → job card afișează URGENT badge

**API Call verificat:**
```bash
PATCH /api/admin/production/[id]
{
  "priority": "URGENT"
}
```

---

### **Test 9: Assign Operator**

**Obiectiv:** Asignează un operator jobului

**Pași:**
1. Pe job details page (job unassigned)
2. Sidebar → Assign Operator dropdown
3. Select un operator (MANAGER sau OPERATOR)
4. Așteptă update

**Rezultat așteptat:**
✅ Display current operator (avatar + name + email)
✅ Dropdown arată operatorul selectat
✅ Timeline tab → eveniment "Operator Assigned"
✅ Back to board → job card afișează avatar operator

**API Call verificat:**
```bash
PATCH /api/admin/production/[id]
{
  "assignedToId": "user123"
}

Response includes: assignedTo: { id, name, email }
```

---

### **Test 10: Unassign Operator**

**Obiectiv:** Șterge asignarea operatorului

**Pași:**
1. Pe job details page (job assigned)
2. Sidebar → Assign Operator dropdown
3. Select "Unassigned"
4. Așteptă update

**Rezultat așteptat:**
✅ Display current operator dispare
✅ Dropdown arată "Unassigned"
✅ Back to board → job card afișează "Unassigned" text + gray icon

**API Call verificat:**
```bash
PATCH /api/admin/production/[id]
{
  "assignedToId": null
}
```

---

### **Test 11: Edit Notes**

**Obiectiv:** Adaugă/editează note job

**Pași:**
1. Pe job details page
2. Click tab "Notes"
3. Click "Edit"
4. Type în textarea: "Client solicită verificare culori înainte de print"
5. Click "Save Notes"

**Rezultat așteptat:**
✅ Edit mode → display mode
✅ Notes afișate cu text nou
✅ Whitespace preserved (line breaks)

**API Call verificat:**
```bash
PATCH /api/admin/production/[id]
{
  "notes": "Client solicită verificare culori înainte de print"
}
```

**Test Notes Scenarios:**
- Add notes când job nou (fără notes) → "No notes added yet" dispare
- Edit notes existente → text updatat
- Clear notes (delete all text) → "No notes added yet" reapare
- Cancel edit → text resetat la versiunea anterioară

---

### **Test 12: View Timeline**

**Obiectiv:** Verifică timeline evenimente

**Pași:**
1. Pe job details page (job cu history)
2. Click tab "Timeline"

**Rezultat așteptat:**
✅ Listă evenimente sortate newest first
✅ Evenimente afișate (depinde de job history):
  - "Job Created" (green icon) - întotdeauna prezent
  - "Job Started" (blue icon) - dacă startedAt exists
  - "Job Completed" (blue icon) - dacă completedAt exists
  - "Operator Assigned" (purple icon) - dacă assignedTo exists
✅ Fiecare eveniment are:
  - Icon color-coded
  - Title
  - Description
  - Timestamp (format: "4 ianuarie 2026, 10:30")

**Timeline Empty State:**
- Job nou creat (fără history) → doar "Job Created"

---

### **Test 13: View Order Tab**

**Obiectiv:** Verifică detalii comandă

**Pași:**
1. Pe job details page
2. Click tab "Order"

**Rezultat așteptat:**
✅ Customer Information card:
  - Name
  - Email
  - Phone (dacă există)
✅ Order Items list:
  - Product name
  - Quantity × Unit Price
  - Line Total per item
✅ Grand Total la final (bold, large)

**Order Tab Scenarios:**
- Order cu 1 item → afișează 1 card
- Order cu multiple items → afișează toate cardurile
- Order fără customer → Customer Information card nu apare

---

### **Test 14: Responsive Mobile (< 768px)**

**Obiectiv:** Verifică UI pe mobil

**Pași:**
1. Deschide DevTools
2. Toggle device toolbar
3. Select iPhone 12 Pro sau similar
4. Navighează la `/admin/production`

**Rezultat așteptat:**
✅ Kanban board scroll orizontal smooth
✅ Job cards width 320px (fixed)
✅ Search bar full width
✅ Priority filter full width
✅ "Create Job" button full width

**Job Details Mobile:**
✅ Tabs scroll orizontal
✅ Sidebar afișat sub main content (single column)
✅ All dropdowns full width

---

### **Test 15: Responsive Tablet (768px-1024px)**

**Obiectiv:** Verifică UI pe tablet

**Pași:**
1. DevTools → iPad Air sau similar
2. Navighează la `/admin/production`

**Rezultat așteptat:**
✅ Kanban board scroll orizontal
✅ Job cards visible 2-3 coloane
✅ Search bar și filtru pe same row

**Job Details Tablet:**
✅ Single column layout (sidebar sub content)

---

### **Test 16: Responsive Desktop (> 1024px)**

**Obiectiv:** Verifică UI pe desktop

**Pași:**
1. DevTools → Responsive 1920x1080
2. Navighează la `/admin/production`

**Rezultat așteptat:**
✅ Kanban board flex layout (toate coloanele visible)
✅ Max width 1600px centered
✅ No horizontal scroll (unless >5 columns)

**Job Details Desktop:**
✅ 2 columns layout (2/3 main + 1/3 sidebar)
✅ Max width 1200px centered
✅ Sidebar sticky (scroll independent)

---

### **Test 17: Error Handling - Invalid Order**

**Obiectiv:** Verifică validare create job

**Pași:**
1. Click "Create Job"
2. Fill doar name: "Test Invalid"
3. Leave order empty
4. Click "Create Job"

**Rezultat așteptat:**
✅ Form NU se submitteză
✅ Error message sub order dropdown: "Order is required"
✅ Order field border red

---

### **Test 18: Error Handling - Invalid Name**

**Obiectiv:** Verifică validare name required

**Pași:**
1. Click "Create Job"
2. Leave name empty
3. Select order
4. Click "Create Job"

**Rezultat așteptat:**
✅ Form NU se submitteză
✅ Error message sub name input: "Job name is required"
✅ Name field border red

---

### **Test 19: Loading States**

**Obiectiv:** Verifică loading indicators

**Test Locations:**

1. **Board loading:**
   - Refresh page `/admin/production`
   - Vezi spinner central (4 secunde max)

2. **Job details loading:**
   - Click job card
   - Vezi spinner central (2 secunde max)

3. **Modal loading:**
   - Open create modal
   - Vezi "Loading..." în dropdown orders (1 secunde)

4. **Update loading:**
   - Change status
   - Dropdown disabled cu opacity-50

**Rezultat așteptat:**
✅ Toate loading states vizibile
✅ UI disabled în timpul update
✅ No double-submit possible

---

### **Test 20: Empty States**

**Obiectiv:** Verifică empty states

**Test Scenarios:**

1. **Board empty column:**
   - Board fără joburi în COMPLETED
   - Vezi icon + "No jobs" în coloana COMPLETED

2. **Timeline empty:**
   - Job nou creat (fără history)
   - Timeline tab → doar "Job Created"

3. **Notes empty:**
   - Job fără notes
   - Notes tab → "No notes added yet" (italic, gray)

4. **Search no results:**
   - Search "xyz123nonexistent"
   - Toate coloanele afișează "No jobs"

**Rezultat așteptat:**
✅ Empty states friendly și clear
✅ Icons + text explicativ
✅ No confusing blank spaces

---

## 🎯 Test Summary Checklist

| Test | Feature | Status |
|------|---------|--------|
| 1  | Board display | ⬜ |
| 2  | Create job | ⬜ |
| 3  | Search | ⬜ |
| 4  | Filter priority | ⬜ |
| 5  | Navigate details | ⬜ |
| 6  | Update status (start) | ⬜ |
| 7  | Update status (complete) | ⬜ |
| 8  | Update priority | ⬜ |
| 9  | Assign operator | ⬜ |
| 10 | Unassign operator | ⬜ |
| 11 | Edit notes | ⬜ |
| 12 | View timeline | ⬜ |
| 13 | View order | ⬜ |
| 14 | Mobile responsive | ⬜ |
| 15 | Tablet responsive | ⬜ |
| 16 | Desktop responsive | ⬜ |
| 17 | Error - invalid order | ⬜ |
| 18 | Error - invalid name | ⬜ |
| 19 | Loading states | ⬜ |
| 20 | Empty states | ⬜ |

---

## 🐛 Common Issues & Solutions

### **Issue 1: Board nu se încarcă**
**Symptom:** Spinner infinit pe board

**Soluții:**
1. Check API: `curl http://localhost:3000/api/admin/production`
2. Check auth: User are rol ADMIN/MANAGER/OPERATOR?
3. Check console pentru errors
4. Check Network tab pentru 401/403

---

### **Issue 2: Dropdown-uri goale (orders, operators)**
**Symptom:** Modal deschis, dropdown orders gol

**Soluții:**
1. Check API orders: `curl http://localhost:3000/api/admin/orders`
2. Check API users: `curl http://localhost:3000/api/admin/users?role=MANAGER`
3. Verifică există comenzi în sistem
4. Verifică există useri cu rol MANAGER/OPERATOR

---

### **Issue 3: Update nu funcționează**
**Symptom:** Click dropdown, selectez, nimic nu se întâmplă

**Soluții:**
1. Check console pentru errors
2. Check Network tab pentru PATCH request
3. Verifică response status (200 vs 400/500)
4. Check validation errors în response body

---

### **Issue 4: Timeline nu afișează evenimente**
**Symptom:** Timeline tab gol sau doar "Job Created"

**Explicație:** Timeline se generează din job data:
- `startedAt` → "Job Started" event
- `completedAt` → "Job Completed" event
- `assignedTo` → "Operator Assigned" event

**Soluție:** Update job (change status, assign operator) pentru a genera evenimente

---

### **Issue 5: Search nu funcționează**
**Symptom:** Type în search, nu se filtrează

**Soluție:**
1. Press Enter sau click search icon (nu e live search)
2. Check că jobs au `name`, `orderId`, `order.customerName` populat
3. Search e case-insensitive

---

## 📊 Performance Benchmarks

**Target Performance:**
- Board load: < 2 secunde (100 jobs)
- Job details load: < 1 secundă
- Update operations: < 500ms
- Search filter: < 100ms (client-side)

**Optimizări:**
- Client-side search (no API spam)
- Minimal re-renders (React.memo on cards)
- Lazy load job details (nu fetch la board)

---

## ✅ Testing Complete!

După completarea tuturor testelor:
1. Mark toate checkbox-urile
2. Documentează orice issues găsite
3. Create GitHub issues pentru bug-uri
4. Production ready! 🚀

---

**Happy Testing! 🧪**
