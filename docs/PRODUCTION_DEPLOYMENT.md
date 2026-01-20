# Production Deployment & Monitoring Guide

## 🚀 **Deploy pe Production**

### **1. Pre-deployment Checklist**

```bash
# Verificare build local
npm run build

# Rulare teste
npm test
npm run test:e2e

# Verificare variabile de mediu
cat .env.example  # Review necesare pentru production
```

#### **Variabile de mediu obligatorii:**

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://sanduta.art"
NEXTAUTH_SECRET="<generate cu: openssl rand -base64 32>"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Sanduta Art <noreply@sanduta.art>"

# Payment (Paynet)
PAYNET_API_KEY="..."
PAYNET_SECRET="..."
PAYNET_MERCHANT_ID="..."

# Shipping (Nova Poshta)
NOVA_POSHTA_API_KEY="..."

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="https://sanduta.art"
NODE_ENV="production"
```

### **2. Deployment Steps (Vercel)**

#### **A. Prima deployare:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... (toate celelalte variabile)

# Deploy
vercel --prod
```

#### **B. Deploy automat cu GitHub:**

1. **Connect repository la Vercel:**
   - https://vercel.com/new
   - Import `sandoo777/sanduta.art`
   - Configure project settings

2. **Environment Variables în Vercel Dashboard:**
   - Settings → Environment Variables
   - Add toate variabilele din `.env.example`
   - Separate values pentru Production/Preview/Development

3. **Build Settings:**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Auto-deploy:**
   - Push pe `main` → Production deploy
   - Push pe alte branch-uri → Preview deploy

#### **C. Database Setup (Production):**

```bash
# Option 1: Vercel Postgres
# https://vercel.com/docs/storage/vercel-postgres

# Option 2: External PostgreSQL (Supabase, Railway, etc.)
# 1. Create database
# 2. Add DATABASE_URL to Vercel env
# 3. Run migrations:
npx prisma migrate deploy
```

### **3. Post-deployment Configuration**

#### **A. Domain Setup:**

1. **Custom Domain:**
   - Vercel Dashboard → Domains
   - Add `sanduta.art` și `www.sanduta.art`
   - Update DNS records (A/CNAME)

2. **SSL Certificate:**
   - Automatic cu Vercel (Let's Encrypt)
   - Verifică: https://sanduta.art (trebuie HTTPS)

#### **B. Email Domain Verification (Resend):**

1. **Accesează:** https://resend.com/domains
2. **Add Domain:** `sanduta.art`
3. **Add DNS Records:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   
   Type: TXT  
   Name: resend._domainkey
   Value: [provided by Resend]
   
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:admin@sanduta.art
   ```

4. **Verify Domain** în Resend dashboard
5. **Update EMAIL_FROM:**
   ```env
   EMAIL_FROM="Sanduta Art <comenzi@sanduta.art>"
   ```

#### **C. Payment Gateway (Paynet):**

1. **Production API Keys:**
   - Request production credentials from Paynet
   - Update `PAYNET_API_KEY`, `PAYNET_SECRET`

2. **Webhook URL:**
   ```
   https://sanduta.art/api/webhooks/paynet
   ```

3. **Test transaction** în production mode

#### **D. Nova Poshta API:**

1. **Verifică API Key** funcționează în production
2. **Test endpoints:**
   ```bash
   curl https://sanduta.art/api/novaposhta/cities?query=Chisinau
   ```

---

## 📊 **Monitoring Email Delivery**

### **1. Resend Dashboard Monitoring**

#### **Access:** https://resend.com/emails

#### **Key Metrics:**

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| **Delivery Rate** | > 95% | < 90% |
| **Bounce Rate** | < 5% | > 10% |
| **Open Rate** | > 20% | < 10% |
| **Spam Complaints** | 0% | Any complaint |
| **Response Time** | < 2s | > 5s |

### **2. Email Types și Monitoring**

#### **A. Transactional Emails (Critical):**

```typescript
// Order Confirmation - Priority: HIGH
// Expected delivery: < 1 minute
// Alert if: Not delivered in 5 minutes

// Order Status Update - Priority: HIGH  
// Expected delivery: < 2 minutes

// Password Reset - Priority: CRITICAL
// Expected delivery: < 30 seconds
```

#### **B. Admin Notifications:**

```typescript
// New Order Alert - Priority: NORMAL
// Expected delivery: < 5 minutes

// Low Stock Alert - Priority: NORMAL
// Can be batched (daily summary)
```

### **3. API Endpoints pentru Monitoring**

#### **Test Email Sending:**

```bash
# Send test emails
POST https://sanduta.art/api/admin/test/email
Authorization: Bearer <admin-token>

# Response:
{
  "status": "success",
  "results": {
    "customerEmail": { "id": "...", "success": true },
    "adminEmail": { "id": "...", "success": true }
  },
  "instructions": [...]
}
```

#### **Email Statistics:**

```bash
# Get monitoring setup info
GET https://sanduta.art/api/admin/monitoring/email-stats
Authorization: Bearer <admin-token>

# Response includes:
# - Metrics to monitor
# - Setup instructions  
# - Best practices
# - Alert thresholds
```

### **4. Webhook Setup (Optional but Recommended)**

#### **Create Webhook Endpoint:**

```bash
# Endpoint: /api/webhooks/resend
# Events: email.delivered, email.bounced, email.complained
```

```typescript
// src/app/api/webhooks/resend/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  switch (body.type) {
    case 'email.delivered':
      // Log successful delivery
      await logEmailDelivery(body.data);
      break;
      
    case 'email.bounced':
      // Alert on bounce
      await handleEmailBounce(body.data);
      break;
      
    case 'email.complained':
      // CRITICAL: Spam complaint
      await handleSpamComplaint(body.data);
      break;
  }
}
```

#### **Configure în Resend:**

1. Dashboard → Webhooks → Add Webhook
2. URL: `https://sanduta.art/api/webhooks/resend`
3. Events: Select all email events
4. Secret: Generate și save în `RESEND_WEBHOOK_SECRET`

### **5. Daily Monitoring Checklist**

```markdown
□ Check Resend Dashboard (https://resend.com/emails)
□ Verify delivery rate > 95%
□ Review bounce rate < 5%
□ Check spam complaints = 0
□ Review failed emails și retry
□ Monitor response times
□ Check email queue size
```

### **6. Alert Rules**

#### **Setup Alerts:**

```typescript
// Alert conditions
if (bounceRate > 10%) {
  sendSlackAlert('High bounce rate detected');
  reviewEmailList();
}

if (deliveryRate < 90%) {
  sendSlackAlert('Low delivery rate - check DNS');
  verifyDNSRecords();
}

if (spamComplaint > 0) {
  sendSlackAlert('CRITICAL: Spam complaint received');
  reviewEmailContent();
  checkUnsubscribeLink();
}
```

### **7. Best Practices**

✅ **DO:**
- Use verified domain (`@sanduta.art`)
- Add unsubscribe link pentru marketing
- Keep transactional emails separate from marketing
- Test emails before production
- Monitor daily stats
- Clean bounce list regularly
- Respect user preferences

❌ **DON'T:**
- Send marketing emails without consent
- Use generic domains (gmail, yahoo)
- Ignore bounce notifications
- Send too frequently
- Use misleading subject lines
- Forget to test in production

---

## 🔍 **Health Checks**

### **System Health Endpoints:**

```bash
# Database connection
GET /api/health/db

# Email service
GET /api/health/email

# Payment gateway
GET /api/health/payment

# All services
GET /api/health
```

### **Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-20T18:45:00Z",
  "services": {
    "database": { "status": "up", "responseTime": 45 },
    "email": { "status": "up", "provider": "resend" },
    "payment": { "status": "up", "provider": "paynet" },
    "storage": { "status": "up", "provider": "cloudinary" }
  }
}
```

---

## 📈 **Performance Monitoring**

### **Vercel Analytics:**

1. Enable in Dashboard: Settings → Analytics
2. Monitor:
   - Page load times
   - Core Web Vitals (LCP, FID, CLS)
   - Error rates
   - Traffic patterns

### **Custom Logging:**

```typescript
// Already implemented in src/lib/logger.ts
logger.info('API:Orders', 'Order created', { orderId });
logger.error('API:Payment', 'Payment failed', { error });
```

### **Production Logs:**

```bash
# View logs in Vercel
vercel logs --prod

# Or in Dashboard:
# https://vercel.com/sandoo777/sanduta.art/logs
```

---

## 🚨 **Troubleshooting**

### **Email Not Delivered:**

1. Check Resend Dashboard pentru delivery status
2. Verify DNS records (SPF, DKIM, DMARC)
3. Check spam folder
4. Review bounce reason
5. Test cu `/api/admin/test/email`

### **Database Connection Issues:**

```bash
# Test connection
npx prisma db push --skip-generate

# Check migrations
npx prisma migrate status
```

### **Build Failures:**

```bash
# Check build logs
vercel logs --build

# Common fixes:
- Clear cache: vercel --force
- Check TypeScript errors
- Verify all env vars set
```

---

## ✅ **Go-Live Checklist**

```markdown
□ All environment variables configured
□ Database migrations applied
□ Domain DNS configured correctly
□ SSL certificate active (HTTPS)
□ Email domain verified în Resend
□ Test order completed successfully
□ Payment gateway tested (production keys)
□ Monitoring dashboards accessible
□ Error tracking configured
□ Backup strategy în place
□ Team notified of deployment
□ Documentation updated
□ Support email configured
```

**Status:** Ready for production deployment! 🚀

**Next Steps:**
1. Run `vercel --prod` to deploy
2. Test critical flows (order, payment, email)
3. Monitor dashboards for 24h
4. Document any issues
