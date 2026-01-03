# Email Notifications Setup

## Overview

Email notifications are automatically sent when a new order is created. The system uses [Resend](https://resend.com) for reliable email delivery.

## Features

- **Customer Confirmation Email**: Sent to the customer with order details, delivery information, and next steps
- **Admin Alert Email**: Sent to admin with order details and action items
- **Professional Templates**: Built with React Email for responsive, beautiful emails
- **Async Sending**: Emails are sent in the background to avoid slowing down order creation

## Email Templates

### 1. Order Confirmation (Customer)

**Location**: `src/emails/order-confirmation.tsx`

**Content**:
- Success message with green checkmark
- Order number and date
- Customer information
- List of ordered items with images
- Total breakdown (subtotal + shipping)
- Payment and delivery details
- Tracking number (if available)
- Next steps timeline (4 steps)
- Link to view order online

**Sent to**: Customer's email address

---

### 2. Admin New Order Alert

**Location**: `src/emails/admin-new-order.tsx`

**Content**:
- Alert notification with bell icon
- Order number and date
- Customer contact information (name, email, phone)
- List of ordered items with images
- Total breakdown
- Payment method and status
- Delivery details (method, address, warehouse)
- Action items checklist
- Link to admin panel

**Sent to**: Admin email (configured via `ADMIN_EMAIL`)

---

## Setup Instructions

### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Navigate to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it (e.g., "Sanduta Art Production")
4. Copy the generated key (starts with `re_`)

### 3. Verify Domain (Recommended for Production)

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `sanduta.art`)
4. Add DNS records as instructed
5. Wait for verification (usually a few minutes)

**Note**: Without domain verification, emails can only be sent to verified addresses.

### 4. Configure Environment Variables

Add to your Vercel environment variables (or `.env.local` for development):

```bash
# Resend API Key (required)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Admin email to receive order notifications (required)
ADMIN_EMAIL="admin@sanduta.art"

# Sender email (should match verified domain)
EMAIL_FROM="Sanduta Art <noreply@sanduta.art>"

# Your site URL (for email links)
NEXTAUTH_URL="https://sanduta.art"
```

### 5. Deploy to Vercel

1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Add environment variables in Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add `RESEND_API_KEY`
   - Add `ADMIN_EMAIL`
   - Add `EMAIL_FROM` (optional, defaults to `noreply@sanduta.art`)

---

## Testing

### Development Testing

1. Use Resend's test mode for development:

```bash
# In .env.local
RESEND_API_KEY="re_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ADMIN_EMAIL="your-email@example.com"
EMAIL_FROM="Test Store <noreply@sanduta.art>"
```

2. Create a test order through your app
3. Check Resend dashboard for sent emails
4. Verify emails arrive in your inbox

### Production Testing

1. After deploying, create a real order
2. Check customer email for confirmation
3. Check admin email for notification
4. Verify all order details are correct

---

## Email Flow

```
Order Created
     ↓
Order API (/api/orders)
     ↓
sendOrderEmails()
     ↓
┌────────────────────────────────────┐
│                                    │
│  sendOrderConfirmationEmail()     │  sendAdminNewOrderEmail()
│  → Customer's email               │  → Admin's email
│                                    │
└────────────────────────────────────┘
```

---

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly
2. **Check Domain**: Verify your domain in Resend dashboard
3. **Check Logs**: Look for errors in Vercel logs or console
4. **Check Spam**: Emails might be in spam folder
5. **Check Limits**: Free tier has sending limits (100 emails/day)

### Domain Verification Issues

1. Wait 15-30 minutes after adding DNS records
2. Use [MXToolbox](https://mxtoolbox.com) to verify DNS propagation
3. Ensure DNS records match exactly (including trailing dots)

### Email Template Issues

1. Test templates locally with React Email dev server:
   ```bash
   npx email dev
   ```
2. Preview templates at http://localhost:3000

---

## Email Service Details

### Resend Limits (Free Tier)

- **100 emails/day**
- **1 domain verification**
- **All core features**

For higher limits, upgrade to paid plan ($20/month for 50,000 emails).

### Alternative: SMTP Configuration

If you prefer SMTP over Resend, modify `src/lib/email.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  // Use nodemailer instead of Resend
}
```

---

## Customization

### Change Email Styling

Edit styles in `src/emails/order-confirmation.tsx` and `src/emails/admin-new-order.tsx`:

```typescript
const main = {
  backgroundColor: '#f6f9fc', // Change background
  fontFamily: 'Arial, sans-serif', // Change font
};
```

### Add More Email Types

Create new templates in `src/emails/`:

1. `order-shipped.tsx` - When order ships
2. `order-delivered.tsx` - When order is delivered
3. `order-cancelled.tsx` - When order is cancelled

Then add functions to `src/lib/email.ts`:

```typescript
export async function sendOrderShippedEmail(data: OrderEmailData) {
  // Implementation
}
```

### Modify Email Content

Edit the JSX in template files:

```tsx
// Add a new section
<Section style={customSection}>
  <Heading style={h3}>Special Instructions</Heading>
  <Text style={paragraph}>Your custom message here</Text>
</Section>
```

---

## Production Checklist

- [ ] Resend account created
- [ ] API key generated and added to Vercel
- [ ] Domain verified in Resend
- [ ] Admin email configured
- [ ] Test order completed successfully
- [ ] Customer received confirmation email
- [ ] Admin received notification email
- [ ] Email links work correctly
- [ ] All order details display properly
- [ ] Emails look good on mobile and desktop

---

## Support

- **Resend Documentation**: https://resend.com/docs
- **React Email**: https://react.email/docs
- **Issue Tracking**: Check server logs in Vercel dashboard

---

## Notes

- Emails are sent asynchronously to avoid blocking order creation
- Failed email sends are logged but don't prevent order creation
- Email templates are responsive and work across all email clients
- Tracking numbers are included when available
- All currency amounts are displayed in UAH (грн)
