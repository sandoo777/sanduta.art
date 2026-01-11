# 🚀 Next Steps: Configure Upstash Credentials

**Status**: ✅ Dependencies installed, ⏳ Credentials needed

---

## 📋 Quick Checklist

- [x] Install `@upstash/redis` și `@upstash/qstash`
- [x] Create `.env` file with placeholder values
- [ ] **Create Upstash Redis database** ← YOU ARE HERE
- [ ] **Create Upstash QStash account**
- [ ] **Update `.env` with real credentials**
- [ ] Test Redis connection
- [ ] Test QStash connection
- [ ] Deploy to Vercel

---

## 🔥 Quick Start (5 minutes)

### Step 1: Redis Setup (2 min)

1. **Go to**: https://console.upstash.com/redis
2. **Sign up** cu GitHub (fastest)
3. **Create Database**:
   - Name: `sanduta-cache`
   - Region: `eu-central-1` (Frankfurt)
   - Click "Create"
4. **Copy credentials** din "REST API" section:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-db-12345.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AZabc123..."
   ```
5. **Paste în `.env`** (local) și **Vercel Environment Variables** (production)

### Step 2: QStash Setup (2 min)

1. **În aceeași console Upstash**, click pe **"QStash"** (sidebar)
2. **Get Started** (accept terms)
3. **Copy credentials**:
   - Main token (vizibil în dashboard)
   - Signing Keys (tab "Signing Keys")
   ```env
   QSTASH_TOKEN="eyJhbG..."
   QSTASH_CURRENT_SIGNING_KEY="sig_abc..."
   QSTASH_NEXT_SIGNING_KEY="sig_xyz..."
   ```
4. **Paste în `.env`** și **Vercel**

### Step 3: Test (1 min)

```bash
# Test Redis
npm run dev
# Navigate to http://localhost:3000
# Check console for "Redis connected" (or similar)

# Test QStash
# Create a test API endpoint or use existing queue tasks
```

---

## 📝 Update .env File

Replace placeholders în `.env`:

```env
# FROM (current):
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
QSTASH_TOKEN="your-qstash-token"

# TO (actual values from Upstash Console):
UPSTASH_REDIS_REST_URL="https://merry-starfish-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AZabc123xyzDEF456..."
QSTASH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
QSTASH_CURRENT_SIGNING_KEY="sig_8Kxe2vPq9..."
QSTASH_NEXT_SIGNING_KEY="sig_9Laf3wQr0..."
```

---

## 🌐 Vercel Environment Variables

1. Go to: https://vercel.com/sandoo777/sanduta-art/settings/environment-variables
2. Add each variable:
   - **Key**: `UPSTASH_REDIS_REST_URL`
   - **Value**: `https://your-db...` (from Upstash)
   - **Environment**: Check `Production`, `Preview`, `Development`
3. Repeat for all 5 Upstash variables
4. **Redeploy** (automatic after adding env vars)

---

## ✅ Verification

### Check Redis:
```bash
# In Upstash Console → Redis → Your Database
# You should see:
- Status: Active ✅
- Commands: 0 (will increase when app uses it)
- Storage: 0 B
```

### Check QStash:
```bash
# In Upstash Console → QStash
# You should see:
- Status: Active ✅
- Messages: 0 (will increase when background jobs run)
```

### Check App:
```bash
npm run dev
# Open browser console
# Should NOT see any Upstash connection errors
```

---

## 📚 Full Documentation

Pentru ghid complet pas-cu-pas cu screenshot-uri și troubleshooting:
👉 **[UPSTASH_SETUP_GUIDE.md](UPSTASH_SETUP_GUIDE.md)**

---

## 🎯 What Happens After Setup

Once credentials are configured:

1. **Redis Cache** va începe să cache-uiască:
   - Product listings
   - User sessions
   - API responses
   - Dashboard KPIs

2. **QStash Queue** va procesa în background:
   - PDF invoice generation
   - Email sending
   - Report generation
   - Image processing

3. **Performance** va crește:
   - API response: 60-80% mai rapid
   - DB queries: 50-80% mai rapid
   - Cache hit rate: 0% → 80%+

---

## 💡 Tips

- **Free tier** e suficient pentru development și small traffic
- **Monitor usage** în Upstash Console daily
- **Upgrade** când atingi limits (rare pentru majoritatea app-urilor)
- **Security**: Nu commita `.env` în git (already în `.gitignore`)

---

**Status după configurare**: 🎉 **FULLY OPERATIONAL**

_Created: 11 Ianuarie 2026_
