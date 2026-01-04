# Orders UI Testing Guide

## Overview

Complete testing checklist for the Orders management UI in Admin Panel.

**Test Environment:**
- Dev Server: http://localhost:3000
- Admin Panel: http://localhost:3000/admin/orders
- Authentication Required: ADMIN or MANAGER role

---

## Test Suite

### Test 1: Orders List Page Display

**Objective:** Verify orders list renders correctly with all elements

**Steps:**
1. Navigate to `/admin/orders`
2. Verify page header displays "Começi"
3. Check search bar is visible
4. Verify filter dropdowns are present:
   - Status filter
   - Payment status filter
5. Check table/card list displays orders
6. Verify each order shows:
   - Order ID
   - Customer name
   - Customer email
   - Status badge (colored)
   - Payment status badge
   - Total price
   - Creation date
   - "Detalii" button

**Expected Result:** ✅ All elements render correctly, orders load from API

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 2: Search and Filter Functionality

**Objective:** Verify search and filters work correctly

**Steps:**
1. **Search Test:**
   - Type customer name in search bar
   - Verify filtered results appear
   - Clear search
   - Type order ID
   - Verify specific order appears

2. **Status Filter:**
   - Select "În așteptare" (PENDING)
   - Verify only pending orders show
   - Select "Confirmat" (CONFIRMED)
   - Verify only confirmed orders show
   - Reset to "Toate statusurile"

3. **Payment Status Filter:**
   - Select "Plătit" (PAID)
   - Verify only paid orders show
   - Select "În așteptare" (PENDING)
   - Verify only unpaid orders show
   - Reset filter

4. **Combined Filters:**
   - Apply search + status filter
   - Verify results match both criteria

**Expected Result:** ✅ Filters work independently and combined

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 3: Order Details Page Load

**Objective:** Verify order details page loads all sections

**Steps:**
1. From orders list, click "Detalii" on any order
2. Verify navigation to `/admin/orders/[id]`
3. Check header displays:
   - Order ID
   - Customer name
   - "Reîncarcă" button
4. Verify info cards show:
   - Total (with currency)
   - Source/Channel
   - Items count
   - Files count
5. Check manager section displays:
   - Status dropdown
   - Payment status dropdown
   - Operator assignment dropdown
6. Verify tabs are present:
   - Overview
   - Articole
   - Fișiere
   - Timeline

**Expected Result:** ✅ All sections load without errors

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 4: Order Status Update

**Objective:** Test status workflow manager functionality

**Steps:**
1. Open any order details page
2. Note current status
3. Click status dropdown in manager section
4. Select a different status (e.g., PENDING → CONFIRMED)
5. Verify:
   - Toast notification appears: "Status actualizat cu succes"
   - Page data refreshes
   - New status displays in dropdown
   - Status badge updates color

**Test Matrix:**
- [ ] PENDING → CONFIRMED (yellow → blue)
- [ ] CONFIRMED → IN_PROGRESS (blue → purple)
- [ ] IN_PROGRESS → READY (purple → green)
- [ ] READY → SHIPPED (green → indigo)
- [ ] SHIPPED → DELIVERED (indigo → dark green)
- [ ] Any → CANCELLED (→ red)

**Expected Result:** ✅ Status updates successfully with visual feedback

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 5: Payment Status Update

**Objective:** Test payment status manager

**Steps:**
1. Open order details page
2. Note current payment status
3. Click payment status dropdown
4. Change status (e.g., PENDING → PAID)
5. Verify:
   - Toast: "Status de plată actualizat cu succes"
   - Payment badge updates
   - Color changes accordingly

**Test Matrix:**
- [ ] PENDING → PAID (yellow → green)
- [ ] PENDING → PARTIAL (yellow → orange)
- [ ] PAID → REFUNDED (green → red)

**Expected Result:** ✅ Payment status updates correctly

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 6: Assign Operator

**Objective:** Test operator assignment functionality

**Steps:**
1. Open order details page
2. Check "Operator:" dropdown
3. Select an operator from the list
4. Verify:
   - Toast: "Operator alocat cu succes"
   - "Actual: [operator name]" displays
   - Dropdown shows selected operator
5. Test unassignment:
   - Select "- Nicio alocare -"
   - Verify operator is removed

**Expected Result:** ✅ Operator assignment works, displays name

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 7: Order Items Management

**Objective:** Test add/update/delete items with auto-recalculation

**Steps:**

**7A. Add Item:**
1. Go to "Articole" tab
2. Click "Adaugă articol" button
3. Fill form:
   - Product ID (use existing product ID)
   - Quantity: 2
   - Unit Price: 100.00
4. Click "Adaugă"
5. Verify:
   - Toast: "Articol adăugat cu succes"
   - New item appears in list
   - Line total = unitPrice × quantity
   - Order total recalculates

**7B. Update Quantity:**
1. Find any item in list
2. Click "-" button (decrease quantity)
3. Verify:
   - Toast: "Cantitate actualizată"
   - Line total updates
   - Order total recalculates
4. Click "+" button (increase quantity)
5. Verify same updates occur

**7C. Delete Item:**
1. Click trash icon on any item
2. Confirm deletion dialog
3. Verify:
   - Toast: "Articol șters cu succes"
   - Item removed from list
   - Order total recalculates

**Expected Result:** ✅ All CRUD operations work, totals recalculate automatically

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 8: File Manager

**Objective:** Test file attachment functionality

**Steps:**

**8A. Add File:**
1. Go to "Fișiere" tab
2. Click "Adaugă fișier"
3. Fill form:
   - URL: `https://example.com/invoice.pdf`
   - Name: `Invoice 2026-001`
4. Click "Adaugă"
5. Verify:
   - Toast: "Fișier adăugat cu succes"
   - File appears in list with:
     - File icon
     - Name
     - Creation timestamp
     - Download button
     - Delete button

**8B. Delete File:**
1. Click trash icon on any file
2. Confirm deletion: "Ștergi acest fișier?"
3. Verify:
   - Toast: "Fișier șters cu succes"
   - File removed from list

**8C. Download File:**
1. Click download icon
2. Verify new tab opens with file URL

**Expected Result:** ✅ Files can be added, deleted, and accessed

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 9: Timeline Display

**Objective:** Verify timeline shows order events

**Steps:**
1. Go to "Timeline" tab
2. Verify timeline displays:
   - "Comandă creată" event (green dot)
   - Current status event (blue dot)
   - Current payment status event (purple dot)
   - Items count event (yellow dot, if items > 0)
   - Files count event (indigo dot, if files > 0)
3. Check each event shows:
   - Colored icon
   - Event title in Romanian
   - Formatted timestamp (DD.MM.YYYY HH:MM)
4. Verify vertical line connects events

**Expected Result:** ✅ Timeline displays all events chronologically

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 10: Responsive Design

**Objective:** Verify UI adapts to different screen sizes

**Steps:**

**Desktop (>1024px):**
1. View orders list
2. Verify table layout displays
3. Check all columns visible

**Tablet (768px-1024px):**
1. Resize browser
2. Verify table remains functional
3. Check tabs scroll horizontally if needed

**Mobile (<768px):**
1. Resize to mobile view
2. Verify orders display as cards
3. Check tabs are scrollable
4. Verify timeline is vertical
5. Test all interactive elements are clickable

**Expected Result:** ✅ UI is fully responsive across all breakpoints

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 11: Error Handling

**Objective:** Verify graceful error handling

**Steps:**

**11A. Network Error:**
1. Disconnect network
2. Try to update order status
3. Verify error toast displays
4. Reconnect network
5. Retry operation

**11B. Invalid Data:**
1. Try adding item with quantity = 0
2. Verify validation error: "Completează toate câmpurile"
3. Try adding item with empty product ID
4. Verify validation prevents submission

**11C. Not Found:**
1. Navigate to `/admin/orders/invalid-id-xxx`
2. Verify error message: "Comanda nu a fost găsită"
3. Verify "Înapoi la comenzi" link works

**Expected Result:** ✅ Errors display user-friendly messages

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

### Test 12: Loading States

**Objective:** Verify loading indicators display during API calls

**Steps:**
1. Open order details page
2. Click status dropdown and change status
3. Verify dropdown shows disabled state during update
4. Add new item
5. Verify "Se adaugă..." text appears on button
6. Delete item
7. Verify loading state during deletion

**Expected Result:** ✅ Loading states prevent double-submissions

**Status:** [ ] Pass [ ] Fail

**Notes:**

---

## Test Summary

**Total Tests:** 12  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___

**Overall Status:** [ ] ✅ All Pass [ ] ⚠️ Issues Found [ ] ❌ Critical Failures

---

## Known Issues

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| 1 | | | |
| 2 | | | |

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Performance Checklist

- [ ] Orders list loads in < 2 seconds
- [ ] Order details loads in < 1 second
- [ ] Status updates respond in < 500ms
- [ ] No console errors
- [ ] No memory leaks after 10 status updates

---

## Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] Dropdowns are keyboard navigable
- [ ] Tab order is logical
- [ ] Error messages are announced to screen readers
- [ ] Color contrast meets WCAG AA standards

---

## Next Steps After Testing

1. ✅ Fix any critical issues
2. ✅ Document workarounds for minor issues
3. ✅ Update user documentation if needed
4. ✅ Deploy to staging environment
5. ✅ Conduct UAT (User Acceptance Testing)
6. ✅ Deploy to production

---

## Testing Notes

**Tester Name:**  
**Test Date:**  
**Environment:** Dev / Staging / Production  
**Build Version:** commit `4a2df15`

**Additional Comments:**
