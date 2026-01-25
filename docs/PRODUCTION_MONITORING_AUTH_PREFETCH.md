# Production Monitoring — Auth Prefetch Safety

## 📊 Overview

Monitorizarea în production pentru a valida efectivitatea AuthLink solution și pentru a detecta eventuale regrесии.

---

## 🎯 Key Metrics

### 1. **502 Errors** (Critical)

**Target:** 0 errors/hour

**Query (if using Vercel Analytics):**
```sql
SELECT 
  COUNT(*) as error_count,
  path,
  timestamp
FROM logs
WHERE status_code = 502
  AND timestamp > NOW() - INTERVAL '24 hours'
  AND (path LIKE '/account%' OR path LIKE '/admin%')
GROUP BY path, timestamp
ORDER BY error_count DESC;
```

**Alert Setup:**
- **Threshold:** > 0 errors in 5 minutes
- **Severity:** Critical
- **Action:** Immediate investigation
- **Notification:** Slack + PagerDuty

**Expected Behavior:**
- **Before AuthLink:** 5-10 errors/hour
- **After AuthLink:** 0 errors/hour ✅

---

### 2. **Auth Redirect Rate**

**Target:** Stable rate (no spikes)

**Metric:** `/login` redirects per hour

**Query:**
```sql
SELECT 
  COUNT(*) as redirect_count,
  DATE_TRUNC('hour', timestamp) as hour
FROM logs
WHERE status_code = 307
  AND redirect_location = '/login'
GROUP BY hour
ORDER BY hour DESC
LIMIT 24;
```

**Baseline:** ~50-100 redirects/hour (normal unauthenticated traffic)

**Alert Setup:**
- **Threshold:** > 3x baseline (sustained for 10 min)
- **Severity:** Warning
- **Action:** Check if auth service down

**Expected Behavior:**
- **Rate should NOT spike** after AuthLink (prefetch no longer triggers redirects)

---

### 3. **Prefetch Request Volume**

**Target:** Reduced prefetch in auth routes

**Metric:** Requests with `purpose: prefetch` header

**Query:**
```sql
SELECT 
  COUNT(*) as prefetch_count,
  path
FROM logs
WHERE headers->>'purpose' = 'prefetch'
  AND (path LIKE '/account%' OR path LIKE '/admin%')
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY path
ORDER BY prefetch_count DESC;
```

**Expected Behavior:**
- **Before:** High prefetch volume on hover
- **After:** 0 prefetch requests for AuthLink routes ✅

**Note:** Prefetch pe homepage/catalog ar trebui să rămână activ (public routes)

---

### 4. **Navigation Performance**

**Target:** Maintain acceptable TTI despite disabled prefetch

**Metrics:**
- **Time to Interactive (TTI):** < 2s
- **First Contentful Paint (FCP):** < 1s
- **Largest Contentful Paint (LCP):** < 2.5s

**Query (Vercel Web Vitals):**
```javascript
// pages/_app.tsx
export function reportWebVitals(metric) {
  if (metric.name === 'FCP' || metric.name === 'LCP' || metric.name === 'TTI') {
    // Log to analytics
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        path: window.location.pathname,
      }),
    });
  }
}
```

**Alert Setup:**
- **FCP > 1.5s:** Warning
- **LCP > 3s:** Warning
- **TTI > 3s:** Critical

**Expected Impact:**
- Slight increase (100-200ms) on first click to auth route ✅ ACCEPTABLE
- No impact on subsequent navigations (data cached)

---

### 5. **User Session Health**

**Target:** No auth session crashes

**Metrics:**
- Session termination rate (unexpected logouts)
- `getServerSession()` failure rate
- JWT validation errors

**Query:**
```sql
SELECT 
  COUNT(*) as session_errors,
  error_message
FROM logs
WHERE error_message LIKE '%session%'
  OR error_message LIKE '%JWT%'
  OR error_message LIKE '%getServerSession%'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY error_message;
```

**Alert Setup:**
- **Threshold:** > 10 errors/hour
- **Severity:** Warning
- **Action:** Check auth service + NextAuth config

---

## 🚨 Alert Configuration

### Vercel

```json
// vercel.json
{
  "alerts": [
    {
      "name": "Auth Prefetch 502 Errors",
      "rule": "status_code = 502 AND (path LIKE '/account%' OR path LIKE '/admin%')",
      "threshold": 1,
      "period": "5m",
      "action": "slack",
      "channel": "#alerts-critical"
    },
    {
      "name": "High Auth Redirect Rate",
      "rule": "status_code = 307 AND redirect_location = '/login'",
      "threshold": 300,
      "period": "10m",
      "action": "slack",
      "channel": "#alerts-warning"
    },
    {
      "name": "Slow Auth Navigation",
      "rule": "path LIKE '/account%' AND ttfb > 2000",
      "threshold": 50,
      "period": "5m",
      "action": "slack",
      "channel": "#alerts-performance"
    }
  ]
}
```

### Sentry

```javascript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

// Middleware pentru captarea 502 errors
export function captureAuthPrefetchError(error: Error, req: Request) {
  if (
    error.message.includes('NEXT_REDIRECT') &&
    error.stack?.includes('prefetch')
  ) {
    Sentry.captureException(error, {
      tags: {
        type: 'auth-prefetch-crash',
        route: req.url,
        fixed: 'should_be_zero', // After AuthLink rollout
      },
      level: 'error',
      fingerprint: ['auth-prefetch-crash', req.url],
    });
    
    // Alert critical
    Sentry.captureMessage('Auth Prefetch Crash Detected', {
      level: 'critical',
      extra: {
        route: req.url,
        note: 'This should NOT happen after AuthLink rollout',
      },
    });
  }
}
```

---

## 📈 Dashboard Setup

### Grafana

**Dashboard:** Auth Prefetch Safety Monitor

**Panels:**

1. **502 Error Rate**
   ```promql
   sum(rate(http_requests_total{status="502", path=~"/account.*|/admin.*"}[5m]))
   ```

2. **Auth Redirect Rate**
   ```promql
   sum(rate(http_requests_total{status="307", redirect="/login"}[5m]))
   ```

3. **Prefetch Volume**
   ```promql
   sum(rate(http_requests_total{purpose="prefetch", path=~"/account.*|/admin.*"}[5m]))
   ```

4. **Navigation Performance (p95)**
   ```promql
   histogram_quantile(0.95, 
     sum(rate(http_request_duration_seconds_bucket{path=~"/account.*|/admin.*"}[5m])) by (le)
   )
   ```

**Import:** `grafana-auth-prefetch-dashboard.json`

---

## 🧪 Validation Tests

### 1. Smoke Test (Production)

```bash
# Check that prefetch is disabled on auth routes
curl -I https://sanduta.art/account/orders \
  -H "Purpose: prefetch" \
  -H "Cookie: next-auth.session-token=EXPIRED"

# Expected: No 502, clean response
```

### 2. Load Test

```bash
# Simulate 100 users hovering over auth links
ab -n 1000 -c 100 \
   -H "Purpose: prefetch" \
   https://sanduta.art/account/dashboard

# Monitor: 502 errors should be 0
```

### 3. Real User Monitoring (RUM)

```javascript
// pages/_app.tsx
useEffect(() => {
  // Track auth navigation clicks
  const links = document.querySelectorAll('a[href^="/account"], a[href^="/admin"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const start = performance.now();
      
      // Track navigation time
      window.addEventListener('load', () => {
        const duration = performance.now() - start;
        
        fetch('/api/analytics/auth-nav', {
          method: 'POST',
          body: JSON.stringify({
            path: link.href,
            duration,
            prefetchDisabled: link.classList.contains('AuthLink'),
          }),
        });
      }, { once: true });
    });
  });
}, []);
```

---

## 📅 Review Schedule

### Daily (First Week)

- Check 502 error count (should be 0)
- Review auth redirect rate (should be stable)
- Monitor user complaints (support tickets)

### Weekly (First Month)

- Analyze navigation performance trends
- Review prefetch volume (should be 0 for auth routes)
- Check coverage (should remain 100%)

### Monthly (Ongoing)

- Full metrics review
- Compare before/after stats
- Update alert thresholds if needed

---

## 📊 Success Criteria

**Week 1 Targets:**

- ✅ Zero 502 errors related to prefetch
- ✅ Auth redirect rate stable (no spikes)
- ✅ No user complaints about slow navigation
- ✅ 100% AuthLink coverage maintained

**Month 1 Targets:**

- ✅ Sustained 0 prefetch-related crashes
- ✅ Performance degradation < 200ms (acceptable)
- ✅ Zero regressions (no new unsafe Links)
- ✅ Team adoption (all new code uses AuthLink)

---

## 🔄 Incident Response

### If 502 Errors Detected

1. **Immediate:**
   - Check affected route in logs
   - Verify AuthLink usage: `grep -r "next/link" <file>`
   - Apply fix: `./scripts/fix-auth-prefetch.sh`
   - Deploy hotfix

2. **Investigation:**
   - Identify root cause (new code? revert?)
   - Check if pre-commit hook bypassed
   - Review PR that introduced issue

3. **Prevention:**
   - Update ESLint rule if pattern missed
   - Add test case to catch pattern
   - Team training on AuthLink usage

### If Performance Degraded

1. **Baseline Check:**
   - Compare to pre-AuthLink metrics
   - Identify if > 200ms degradation

2. **Optimization:**
   - Consider selective prefetch re-enable (low-risk routes)
   - Check if data fetching optimized
   - Review Server Component caching

3. **Rollback Plan:**
   - If critical: temporarily re-enable prefetch with `<AuthLink prefetch={true}>`
   - Fix underlying performance issue
   - Disable prefetch again

---

## 🛠️ Tools

### Required

- **Vercel Analytics** — Built-in logs + alerts
- **Sentry** — Error tracking + crash reports
- **Google Analytics / Posthog** — User behavior tracking

### Optional

- **Grafana** — Custom dashboards
- **DataDog** — Advanced APM
- **LogRocket** — Session replay (for debugging navigation issues)

---

## 📝 Reporting Template

**Weekly Auth Prefetch Health Report**

```markdown
# Week of YYYY-MM-DD

## Metrics
- 502 Errors: 0 (✅ Target: 0)
- Auth Redirects: 85/hour (✅ Stable)
- Prefetch Volume (auth routes): 0 (✅ Target: 0)
- Avg Navigation Time: +150ms (✅ < 200ms acceptable)

## Incidents
- None

## Changes
- Applied AuthLink to 2 new pages
- Coverage: 100% (32/32 files)

## Actions
- None required

## Next Week
- Continue monitoring
- Review Q1 performance trends
```

---

## 🚀 Next Steps

1. **Setup Vercel Alerts** — Configure JSON above
2. **Install Sentry Tracking** — Add monitoring code
3. **Create Grafana Dashboard** — Import panels
4. **Weekly Review** — First 4 weeks critical
5. **Document Learnings** — Update runbook

---

**Last Updated:** 2026-01-25
**Status:** Production Ready ✅
**Owner:** DevOps + Backend Team
