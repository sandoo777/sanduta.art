# Upstash Setup Guide

Ghid pas cu pas pentru configurarea Upstash Redis și QStash pentru sistemul de optimizare performanță.

---

## 🚀 Prerequisites

✅ Dependencies instalate:
```bash
npm install @upstash/redis @upstash/qstash
```

---

## 1️⃣ Upstash Redis Setup

### Pasul 1: Creează cont
1. Accesează: **https://console.upstash.com/redis**
2. Sign up cu GitHub/Google sau email
3. Verifică email-ul (dacă e necesar)

### Pasul 2: Creează database Redis
1. Click pe **"Create Database"**
2. Configurare recomandată:
   - **Name**: `sanduta-cache` (sau orice nume)
   - **Type**: `Regional`
   - **Region**: `eu-central-1` (Frankfurt) - cel mai aproape de România
   - **Primary Region**: `eu-central-1`
   - **Read Region**: None (pentru free tier)
   - **Eviction**: ☑ Enable (recommended)

3. Click **"Create"**

### Pasul 3: Copiază credentials
După creare, vei vedea dashboard-ul database-ului:

1. Scroll până la **"REST API"** section
2. Copiază:
   - **UPSTASH_REDIS_REST_URL**: `https://your-name-12345.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AZabc...` (long token)

3. Adaugă în `.env`:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-name-12345.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AZabc123xyz..."
   ```

### Free Tier Limits
- ✅ **10,000 commands/day** (suficient pentru development)
- ✅ **256 MB storage**
- ✅ **TLS/SSL** encryption
- ✅ **Eviction** când storage-ul se umple

---

## 2️⃣ Upstash QStash Setup

### Pasul 1: Accesează QStash
1. În Upstash Console, click pe **"QStash"** din sidebar
2. Sau direct: **https://console.upstash.com/qstash**

### Pasul 2: Enable QStash
1. Dacă e prima dată, click **"Get Started"**
2. Accept Terms of Service

### Pasul 3: Copiază credentials
În QStash dashboard:

1. **QStash Token**:
   - Vizibil direct în dashboard (sau în Settings)
   - Format: `eyJ...` (JWT token)

2. **Signing Keys**:
   - Click pe **"Signing Keys"** tab
   - Vei vedea două keys:
     - **Current Signing Key**: `sig_...`
     - **Next Signing Key**: `sig_...`

3. Adaugă în `.env`:
   ```env
   QSTASH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   QSTASH_CURRENT_SIGNING_KEY="sig_abc123..."
   QSTASH_NEXT_SIGNING_KEY="sig_xyz789..."
   ```

### Free Tier Limits
- ✅ **500 messages/day** (suficient pentru development)
- ✅ **Signature verification**
- ✅ **Retry logic** (up to 3 retries)
- ✅ **Callback URL** support

---

## 3️⃣ Configure Environment

### Local Development (.env)
```env
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Upstash QStash
QSTASH_TOKEN="your-qstash-token"
QSTASH_CURRENT_SIGNING_KEY="sig_current_key"
QSTASH_NEXT_SIGNING_KEY="sig_next_key"

# App URL (pentru QStash callbacks)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production (Vercel)
1. Accesează: **https://vercel.com/your-project/settings/environment-variables**
2. Adaugă fiecare variabilă:
   - Key: `UPSTASH_REDIS_REST_URL`
   - Value: `https://your-redis...`
   - Environment: `Production`, `Preview`, `Development`

3. Repeat pentru toate variabilele

4. **Redeploy** project pentru a aplica noile environment variables

---

## 4️⃣ Verify Setup

### Test 1: Redis Connection
```typescript
// test-redis.ts
import { redisCache, CacheKeys } from '@/modules/cache/useRedis';

async function testRedis() {
  // Set value
  await redisCache.set('test:key', { message: 'Hello Redis!' }, 60000);
  
  // Get value
  const value = await redisCache.get('test:key');
  console.log('Redis value:', value);
  
  // Delete value
  await redisCache.del('test:key');
  console.log('✅ Redis working!');
}

testRedis();
```

Run:
```bash
npx tsx test-redis.ts
```

### Test 2: QStash Connection
```typescript
// test-qstash.ts
import { QueueTasks } from '@/modules/queue/useQueue';

async function testQStash() {
  const messageId = await QueueTasks.generateReport('test', {
    type: 'test-report',
  });
  
  console.log('Message ID:', messageId);
  console.log('✅ QStash working!');
}

testQStash();
```

Run:
```bash
npx tsx test-qstash.ts
```

---

## 5️⃣ Usage Examples

### Redis Cache
```typescript
import { redisCache, CacheKeys, CacheTTL } from '@/modules/cache/useRedis';

// Cache product
await redisCache.set(
  CacheKeys.product('123'),
  productData,
  CacheTTL.long // 24 hours
);

// Get from cache
const product = await redisCache.get(CacheKeys.product('123'));

// Invalidate pattern
await redisCache.invalidate('product:*');
```

### Queue Tasks
```typescript
import { QueueTasks } from '@/modules/queue/useQueue';

// Generate PDF invoice in background
await QueueTasks.generatePdfInvoice('order-123');

// Generate report
await QueueTasks.generateReport('sales', {
  month: '2026-01',
  format: 'pdf',
});

// Send bulk emails
await QueueTasks.sendBulkEmail({
  templateId: 'newsletter',
  recipients: ['user1@example.com', 'user2@example.com'],
});
```

---

## 🔍 Troubleshooting

### Redis Connection Error
```
Error: Failed to connect to Redis
```

**Soluții**:
1. Verifică `UPSTASH_REDIS_REST_URL` și `UPSTASH_REDIS_REST_TOKEN`
2. Asigură-te că database-ul Redis este activ în Upstash Console
3. Check dacă IP-ul nu e blocat (Upstash ar trebui să permită toate IP-urile)

### QStash Signature Verification Failed
```
Error: Invalid signature
```

**Soluții**:
1. Verifică `QSTASH_CURRENT_SIGNING_KEY` și `QSTASH_NEXT_SIGNING_KEY`
2. Asigură-te că folosești key-urile corecte din QStash Console → Signing Keys
3. Check dacă `NEXT_PUBLIC_APP_URL` este setat corect

### Rate Limit Exceeded (Free Tier)
```
Error: Daily limit exceeded
```

**Soluții**:
1. **Redis**: 10K commands/day - optimizează cache TTL, invalidate mai puțin frecvent
2. **QStash**: 500 messages/day - batch tasks, reduce frequency
3. **Upgrade**: Consider paid tier dacă e necesar:
   - Redis: $0.2/100K commands
   - QStash: $1/10K messages

---

## 📊 Monitoring

### Redis Dashboard
- **URL**: https://console.upstash.com/redis/[your-db-id]
- **Metrics**:
  - Total commands (daily)
  - Storage usage
  - Command latency
  - Key count

### QStash Dashboard
- **URL**: https://console.upstash.com/qstash
- **Metrics**:
  - Messages sent (daily)
  - Success rate
  - Failed messages
  - Retry attempts

---

## 💡 Best Practices

### Redis
1. **Use TTL**: Setează expiration pentru toate key-urile
2. **Pattern naming**: Folosește prefixe consistente (`product:`, `user:`, etc.)
3. **Invalidate proactively**: Clear cache-ul când data se schimbă
4. **Monitor usage**: Check daily commands în dashboard

### QStash
1. **Idempotent tasks**: Fă task-urile safe pentru retry
2. **Timeout handling**: Setează timeout-uri rezonabile (default: 30s)
3. **Error handling**: Logează erorile pentru debugging
4. **Batch operations**: Group multiple tasks când e posibil

---

## 🎯 Next Steps

După configurare:

1. ✅ **Run tests** pentru a verifica conexiunea
2. ✅ **Deploy to Vercel** cu environment variables
3. ✅ **Monitor usage** în Upstash Console
4. ✅ **Optimize TTL values** based on usage patterns
5. ✅ **Setup alerts** (optional) pentru rate limits

---

**Status**: 🚀 Ready to optimize performance!

_Ultima actualizare: 11 Ianuarie 2026_
