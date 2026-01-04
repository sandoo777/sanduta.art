# Checkout System Implementation Guide

## Overview

This document describes the complete checkout system implementation for Sanduta Art. The system handles the entire order flow from customer data collection to order confirmation.

## Architecture

### Component Structure

```
/app/(public)/checkout/
├── page.tsx                          # Main checkout page
├── success/
│   └── page.tsx                      # Order success page
└── /components/public/checkout/
    ├── CheckoutCustomerForm.tsx      # Personal information form
    ├── CheckoutAddressForm.tsx       # Delivery address form
    ├── CheckoutDeliveryMethods.tsx   # Delivery options selection
    ├── CheckoutPaymentMethods.tsx    # Payment methods selection
    └── CheckoutSummary.tsx           # Order summary sidebar
```

### Modules

```
/modules/checkout/
└── useCheckout.ts                    # Core checkout logic and validation
```

## Components

### 1. CheckoutCustomerForm

**Path:** `src/components/public/checkout/CheckoutCustomerForm.tsx`

**Purpose:** Collect customer personal information

**Props:**
```typescript
interface CheckoutCustomerFormProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
  errors?: Record<string, string>;
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  taxId?: string;
}
```

**Features:**
- Text inputs for firstName, lastName, email, phone
- Optional fields: companyName, taxId
- Real-time validation feedback
- Error display with red styling
- Responsive 2-column grid (desktop) / 1-column (mobile)
- Data protection info box

**Validation Rules:**
- firstName: Required, minimum 2 characters
- lastName: Required, minimum 2 characters
- email: Required, valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- phone: Required, minimum 10 digits (allows spaces, dashes, +, parentheses)
- companyName: Optional
- taxId: Optional, valid Romanian format

### 2. CheckoutAddressForm

**Path:** `src/components/public/checkout/CheckoutAddressForm.tsx`

**Purpose:** Collect delivery address information

**Props:**
```typescript
interface CheckoutAddressFormProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
}

interface AddressData {
  country: string;
  city: string;
  street: string;
  number: string;
  apt?: string;
  postalCode: string;
}
```

**Features:**
- Country dropdown with 5 predefined options
- Text inputs for city, street, number, apartment, postal code
- Real-time address preview showing formatted address
- Romania-only delivery warning
- Responsive grid layout
- Error display with validation feedback

**Supported Countries:**
1. România
2. Ungaria
3. Bulgaria
4. Republica Moldova
5. Ucraina

**Validation Rules:**
- country: Required, must be from dropdown
- city: Required, minimum 2 characters
- street: Required, minimum 2 characters
- number: Required, alphanumeric
- apartment: Optional
- postalCode: Required, pattern validation for Romanian postal codes

### 3. CheckoutDeliveryMethods

**Path:** `src/components/public/checkout/CheckoutDeliveryMethods.tsx`

**Purpose:** Allow customer to select delivery method

**Props:**
```typescript
interface CheckoutDeliveryMethodsProps {
  selected: DeliveryMethod | null;
  onSelect: (method: DeliveryMethod) => void;
}

interface DeliveryMethod {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
}
```

**Available Methods:**

| ID | Name | Days | Price | Icon |
|---|---|---|---|---|
| standard | Curier Standard | 2–3 zile lucratoare | 35 RON | 🚚 |
| express | Curier Express | Următoarea zi lucrătoare | 75 RON | 🚚 |
| pickup | Ridicare din sediu | După producție (max 10 zile) | 0 RON | 📍 |

**Features:**
- Card-based selection UI
- Selected state with blue border and checkmark icon
- Price display
- Estimated delivery time
- Package insurance info box
- Responsive grid layout

### 4. CheckoutPaymentMethods

**Path:** `src/components/public/checkout/CheckoutPaymentMethods.tsx`

**Purpose:** Allow customer to select and configure payment method

**Props:**
```typescript
interface CheckoutPaymentMethodsProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'transfer' | 'pickup';
  icon?: string;
}
```

**Available Methods:**

| ID | Name | Type | Icon | Description |
|---|---|---|---|---|
| card | Card Bancar | card | 💳 | Pay now with card (Stripe) |
| cod | Ramburs (COD) | cash | 💵 | Pay on delivery |
| transfer | Transfer Bancar | transfer | 🏦 | Bank transfer (pre-payment) |
| pickup | Plată la Sediu | pickup | 🏢 | Pay in store |

**Card Payment Form:**
- Card number input with formatting (XXXX XXXX XXXX XXXX)
- Cardholder name (uppercase)
- Expiry date input (MM/YY)
- CVC input (3 digits)
- Security notice about Stripe encryption

**Transfer Details:**
Shows IBAN, BIC, and beneficiary information

**Features:**
- 2-column grid for payment options (responsive)
- Selected state with checkmark
- Conditional card form display
- Transfer details display
- Security badges
- Payment security info box

### 5. CheckoutSummary

**Path:** `src/components/public/checkout/CheckoutSummary.tsx`

**Purpose:** Display order summary and handle order placement

**Props:**
```typescript
interface CheckoutSummaryProps {
  isLoading?: boolean;
  isProcessing?: boolean;
  onPlaceOrder?: () => void;
}
```

**Features:**
- Cart items mini-list with quantities and prices
- Price breakdown:
  - Subtotal
  - Discount (if applicable)
  - VAT (19%)
  - Shipping (from selected delivery method)
  - Total (highlighted with gradient)
- Promo code input field
- "Place Order" CTA button
- "Continue Shopping" link
- Trust badges (Secure Payment, Fast Delivery)
- Sticky positioning on desktop
- Responsive layout

**Responsive Behavior:**
- Desktop (lg+): Sticky sidebar on right
- Mobile: Below forms, sticky CTA at bottom

### 6. Main Checkout Page

**Path:** `src/app/(public)/checkout/page.tsx`

**Purpose:** Orchestrate all checkout components and handle form flow

**Features:**
- Page header with breadcrumbs and title
- Error alert display
- 3-column layout:
  - Left (2 cols): All forms and selections
  - Right (1 col): Summary sidebar
- Form orchestration:
  - Customer form (Step 1)
  - Address form (Step 2)
  - Delivery methods (Step 3)
  - Payment methods (Step 4)
- Form validation on submit
- Error state management
- Loading state during order placement
- Mobile sticky bottom CTA

**Responsive Layout:**
```
Desktop (lg):        Tablet (md):        Mobile (< md):
Form | Form         Form                Form
Form | Form         Form                Form
     | Summary      Summary             Summary
```

### 7. Success Page

**Path:** `src/app/(public)/checkout/success/page.tsx`

**Purpose:** Display order confirmation

**Features:**
- Success checkmark animation
- Order details display:
  - Order number (formatted)
  - Total amount
  - Order date
  - Item count
  - Estimated delivery date
- Action buttons:
  - "View Order Details" (if logged in)
  - "Download Invoice"
  - "Continue Shopping"
- Info boxes:
  - Shipping info (tracking email)
  - Support info (contact details)
  - Account info (order history access)
- Help section with contact information
- Gradient background

## Core Module: useCheckout

**Path:** `src/modules/checkout/useCheckout.ts`

### Hook: `useCheckout()`

**Returns:**
```typescript
interface UseCheckoutReturn {
  placeOrder: (data: CheckoutPayload) => Promise<OrderResult>;
  isLoading: boolean;
  error: string | null;
}
```

### Functions

#### `validateCustomerData(data: CustomerData): Record<string, string>`

Validates customer information.

**Validation Rules:**
- firstName: Required, non-empty
- lastName: Required, non-empty
- email: Required, valid format
- phone: Required, min 10 digits

**Returns:** Object with field names as keys and error messages as values

#### `validateAddress(data: AddressData): Record<string, string>`

Validates delivery address.

**Validation Rules:**
- country: Required
- city: Required, non-empty
- street: Required, non-empty
- number: Required, non-empty
- postalCode: Required, valid format

**Returns:** Object with error details

#### `isValidEmail(email: string): boolean`

Validates email format using regex.

#### `isValidPhone(phone: string): boolean`

Validates phone number (minimum 10 digits after removing spaces/dashes).

#### `calculateTotals(shippingPrice: number): OrderTotals`

Calculates order totals including VAT and shipping.

**Returns:**
```typescript
interface OrderTotals {
  subtotal: number;
  discount: number;
  vat: number;
  shipping: number;
  total: number;
}
```

#### `placeOrder(payload: CheckoutPayload): Promise<OrderResult>`

Main function to submit the order.

**Parameters:**
```typescript
interface CheckoutPayload {
  customer: CustomerData;
  address: AddressData;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
}
```

**Returns:**
```typescript
interface OrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}
```

**Flow:**
1. Validates all data (customer, address)
2. Sends POST request to `/api/orders/create`
3. On success: clears cart and returns order ID
4. On error: returns error message

**API Endpoint:** `POST /api/orders/create`

**Request Body:**
```json
{
  "customer": {
    "firstName": string,
    "lastName": string,
    "email": string,
    "phone": string,
    "companyName"?: string,
    "taxId"?: string
  },
  "address": {
    "country": string,
    "city": string,
    "street": string,
    "number": string,
    "apt"?: string,
    "postalCode": string
  },
  "deliveryMethod": {
    "id": string,
    "name": string,
    "estimatedDays": string,
    "price": number
  },
  "paymentMethod": {
    "id": string,
    "name": string,
    "type": string,
    "icon"?: string
  },
  "items": CartItem[],
  "totals": OrderTotals
}
```

**Expected Response (Success):**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20250103-001",
  "success": true
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Type Definitions

### CustomerData
```typescript
interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  taxId?: string;
}
```

### AddressData
```typescript
interface AddressData {
  country: string;
  city: string;
  street: string;
  number: string;
  apt?: string;
  postalCode: string;
}
```

### DeliveryMethod
```typescript
interface DeliveryMethod {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
}
```

### PaymentMethod
```typescript
interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'transfer' | 'pickup';
  icon?: string;
}
```

### CheckoutData
```typescript
interface CheckoutData {
  customer: CustomerData;
  address: AddressData;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  totals: OrderTotals;
  createdAt: Date;
}
```

## State Management

### Form State
All form states are managed using React's `useState`:
- `customerData`: CustomerData object
- `addressData`: AddressData object
- `selectedDelivery`: DeliveryMethod | null
- `selectedPayment`: PaymentMethod | null
- `formErrors`: Object with field-level errors
- `orderError`: Top-level error message
- `currentStep`: Progress indicator (1-4)

### Cart Integration
Uses `useCartStore()` from `@/modules/cart/cartStore`:
- `items`: Cart items array
- `getTotals()`: Returns totals including subtotal, VAT, discount
- `clearCart()`: Empties cart after successful order

### Loading State
- `isLoading`: Set during order submission
- Disables CTA button to prevent duplicate submissions

## Styling

### Design System

**Colors:**
- Primary: `#0066FF` (Blue)
- Accent: `#FACC15` (Yellow)
- Secondary: `#111827` (Dark Gray)
- Background: `#F9FAFB` (Light Gray)
- Error: Red (#DC2626)
- Success: Green (#10B981)

**Border Radius:** 8px (rounded-lg)

**Shadows:** shadow-sm

**Typography:**
- Headings: Bold, gray-900
- Body: Regular, gray-600
- Errors: Red text, small size
- Labels: Medium weight, gray-700

**Form Inputs:**
- Border: 1px gray-300
- Focus: ring-2 ring-[#0066FF]
- Error state: Border red, background red-50
- Success state: Border green, background green-50

**Buttons:**
- Primary: #0066FF background, white text
- Hover: Darker blue (#0052CC)
- Disabled: Gray background
- Transition: All 200ms

### Responsive Breakpoints

```css
Mobile:    < 640px  (sm)
Tablet:    640-1024 (md, lg)
Desktop:   > 1024px (xl, 2xl)

Grid:
- Desktop: grid-cols-3
- Tablet:  grid-cols-2 (with conditional stacking)
- Mobile:  grid-cols-1 (stack vertically)
```

## Validation Rules

### Customer Data
```
firstName:
  - Required
  - Min 2 characters
  - Only letters and spaces

lastName:
  - Required
  - Min 2 characters
  - Only letters and spaces

email:
  - Required
  - Valid email format
  - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

phone:
  - Required
  - Min 10 digits
  - Allows: +, spaces, dashes, parentheses

companyName:
  - Optional
  - Max 100 characters

taxId:
  - Optional
  - Format: ROnnnnnnnn (10 digits after RO)
```

### Address Data
```
country:
  - Required
  - Must be from predefined list

city:
  - Required
  - Min 2 characters

street:
  - Required
  - Min 2 characters

number:
  - Required
  - Alphanumeric

apartment:
  - Optional
  - Max 5 characters

postalCode:
  - Required
  - Format: XXXXXX (6 digits for Romania)
```

### Delivery Method
```
- Required
- Must be selected before order submission
- Updates shipping cost in summary
```

### Payment Method
```
- Required
- Must be selected before order submission
- If card: Card details must be valid
  - Number: 16 digits
  - Expiry: MM/YY format
  - CVC: 3 digits
```

## Error Handling

### Field-Level Errors
- Displayed below each input
- Red text color
- Input has red border and light red background
- Cleared on valid input

### Form-Level Errors
- Toast/Alert at top of form
- Red background with icon
- Contains main error message
- Dismissible

### API Errors
- Displayed in alert box at top of page
- User can retry by clicking "Place Order" again
- Loading state prevents duplicate submissions

### Validation Flow
1. User clicks "Place Order"
2. All forms validated
3. If errors: Display field errors and alert
4. If valid: Show loading state
5. Submit to API
6. Handle response: Success → Redirect to success page, Error → Show error alert

## Testing

### Unit Tests
- Email validation regex
- Phone validation (digit extraction)
- Postal code validation
- Required field validation

### Integration Tests
- Form state updates
- Error display
- Form submission with valid data
- Cart integration
- Success page redirect

### E2E Tests
- Complete checkout flow
- Form validation with invalid data
- Delivery method selection updates summary
- Payment method selection shows appropriate form
- Order placement and success page

### Test Script
Run: `./scripts/test-checkout-system.sh`

Covers:
- Page load tests
- Form validation tests
- Delivery methods display
- Payment methods display
- Order placement flow
- Responsive design
- Error handling
- Cart integration

## Performance Considerations

1. **Component Lazy Loading:** Consider lazy-loading payment form for card input
2. **Form Optimization:** Use `useCallback` for event handlers
3. **Cart Integration:** Memoize `getTotals()` to prevent unnecessary recalculations
4. **Summary Sidebar:** Sticky positioning optimized with CSS position:sticky
5. **Images:** No images in checkout flow for fast load
6. **Bundle Size:** Lucide icons are tree-shakeable (small bundle impact)

## Accessibility

1. **Labels:** All inputs have associated labels
2. **Error Messages:** Clear error text tied to fields
3. **ARIA:** Error regions marked with aria-invalid
4. **Keyboard Navigation:** All fields keyboard accessible
5. **Focus Management:** Focus ring visible on all inputs
6. **Color Contrast:** All text meets WCAG AA standards
7. **Form Structure:** Logical tab order

## Security

1. **Client-Side Validation:** Prevents obviously invalid submissions
2. **Server-Side Required:** All validation must be repeated server-side
3. **Card Data:** Not transmitted through our servers (use Stripe)
4. **HTTPS Required:** All checkout traffic must be encrypted
5. **CSRF Protection:** Include CSRF tokens in form submissions
6. **Rate Limiting:** Implement on `/api/orders/create` endpoint
7. **Input Sanitization:** Server-side HTML escaping for all inputs

## Future Enhancements

1. **Address Autocomplete:** Google Places integration
2. **Stripe Integration:** Full card payment processing
3. **Guest Checkout:** Optional login
4. **Order History:** View past orders
5. **Wishlist:** Save items for later
6. **Coupon System:** Discount code validation
7. **Shipping Calculator:** Real-time shipping rates
8. **Tax Calculator:** Dynamic VAT calculation by country
9. **Order Tracking:** Real-time shipment tracking
10. **Email Notifications:** Order confirmation emails

## API Integration

### Required Endpoints

#### POST /api/orders/create
Creates a new order

**Request:**
```typescript
{
  customer: CustomerData,
  address: AddressData,
  deliveryMethod: DeliveryMethod,
  paymentMethod: PaymentMethod,
  items: CartItem[],
  totals: OrderTotals
}
```

**Response (Success - 201):**
```typescript
{
  id: string,
  orderNumber: string,
  success: true
}
```

**Response (Error - 400/500):**
```typescript
{
  success: false,
  message: string
}
```

#### GET /api/orders/{orderId}
Retrieves order details for success page

**Response:**
```typescript
{
  id: string,
  orderNumber: string,
  customer: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  },
  address: AddressData,
  items: CartItem[],
  total: number,
  estimatedDeliveryDate?: string,
  createdAt: string
}
```

#### GET /api/orders
Retrieves user's orders (requires auth)

**Response:**
```typescript
{
  orders: Array<{
    id: string,
    orderNumber: string,
    total: number,
    status: string,
    createdAt: string
  }>
}
```

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| useCheckout.ts | 220 | Core validation & order logic |
| CheckoutCustomerForm.tsx | 150 | Customer data form |
| CheckoutAddressForm.tsx | 160 | Address form |
| CheckoutDeliveryMethods.tsx | 130 | Delivery selection |
| CheckoutPaymentMethods.tsx | 220 | Payment methods |
| CheckoutSummary.tsx | 200 | Order summary sidebar |
| checkout/page.tsx | 280 | Main checkout page |
| checkout/success/page.tsx | 220 | Success page |
| test-checkout-system.sh | 400 | Test script |

**Total:** ~1,970 lines of code

## Troubleshooting

### Issue: Form not validating
- Check that `handleValidateAll()` is called before `placeOrder()`
- Verify error state is set correctly
- Check browser console for errors

### Issue: Cart not clearing after order
- Verify `useCartStore()` is imported correctly
- Check that `clearCart()` is called in `placeOrder()` success handler
- Ensure cart store is properly initialized

### Issue: Success page not loading
- Check that order ID is passed in URL: `/checkout/success?orderId=...`
- Verify `/api/orders/{orderId}` endpoint is implemented
- Check network tab for API errors

### Issue: Payment form not showing
- Verify `selectedPayment?.id === 'card'` condition
- Check that `setShowCardForm(true)` is called
- Verify card form component is not hidden with CSS

### Issue: Summary not updating
- Check that `getTotals()` is called on each render
- Verify cart store updates trigger component re-render
- Confirm delivery method price updates summary shipping cost

## Links & References

- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
