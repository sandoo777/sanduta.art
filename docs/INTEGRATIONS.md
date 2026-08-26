# Integrations

## Paynet (payments)
- File: `src/lib/paynet.ts`
- Signature: HMAC SHA256 with `PAYNET_SECRET`
- Fallback to COD on API error
- Tests: `src/__tests__/paynet.test.ts`

## Nova Poshta (delivery)
- File: `src/lib/novaposhta.ts`
- Methods: `searchCities()`, `getPickupPoints()`, `createShipment()`, `trackShipment()`
- Tests: `src/__tests__/novaposhta.test.ts`

## Resend (email)
- File: `src/lib/email.ts`, templates: `src/emails/*.tsx`
- Functions: `sendOrderConfirmationEmail()`, `sendAdminNewOrderEmail()`
- Templates: React components with `@react-email/components`
- Send is async — does not block API response
- Setup guide: `docs/EMAIL_SETUP.md`

## Cloudinary (images)
- Used via Next.js Image component + Cloudinary CDN
- Upload in admin panel product forms

## Environment Variables
```env
NEXTAUTH_SECRET=
DATABASE_URL=
PAYNET_API_KEY=
PAYNET_SECRET=
NOVA_POSHTA_API_KEY=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
Never commit `.env`. Use `.env.example` as template.
