# Monitoring & Observability System

## Overview

Comprehensive monitoring and observability system for sanduta.art e-commerce platform, providing real-time insights into system health, performance, security, and user experience.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Setup](#setup)
4. [Usage](#usage)
5. [Alerts](#alerts)
6. [Dashboard](#dashboard)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Client)                   │
│  - Web Vitals Tracking                              │
│  - Error Tracking (Sentry)                          │
│  - Custom Metrics                                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              API Layer (Next.js)                     │
│  - API Monitoring Middleware                         │
│  - Request/Response Tracking                         │
│  - Rate Limiting                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           Monitoring Modules                         │
│  ┌───────────┬────────────┬──────────────┐         │
│  │  Logger   │  Metrics   │  Profiler    │         │
│  ├───────────┼────────────┼──────────────┤         │
│  │ DB Monitor│  Queue     │  Security    │         │
│  └───────────┴────────────┴──────────────┘         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│          External Services (Optional)                │
│  - Logtail / Datadog / Elastic                      │
│  - Grafana Loki                                      │
│  - Sentry                                            │
│  - Slack / Email Alerts                              │
└─────────────────────────────────────────────────────┘
```

---

## Components

### 1. Core Logger (`useLogger`)

**Purpose:** Centralized structured logging with multiple severity levels

**Features:**
- Multiple log levels: info, warning, error, critical, audit, performance, security
- Structured JSON format
- Context enrichment (userId, IP, timestamp)
- Automatic log aggregation to external services

**Usage:**
```typescript
import { useLogger, LogCategory } from '@/modules/monitoring/useLogger';

const logger = useLogger();

// Info log
await logger.info(LogCategory.API, 'User created', { userId: '123' });

// Error log
await logger.error(LogCategory.DATABASE, 'Query failed', error, { query: 'SELECT ...' });

// Security log
await logger.security('Failed login attempt', { ip: '1.2.3.4', username: 'admin' });
```

**Log Categories:**
- `API` - API requests and responses
- `AUTH` - Authentication events
- `ORDERS` - Order processing
- `PRODUCTION` - Production workflow
- `EDITOR` - Design editor operations
- `ERRORS` - Application errors
- `SECURITY` - Security events
- `DATABASE` - Database operations
- `QUEUE` - Queue processing
- `SYSTEM` - System events

### 2. Performance Metrics (`useMetrics`)

**Purpose:** Track performance metrics and web vitals

**Metrics Tracked:**
- **Web Vitals:** TTFB, LCP, FID, CLS
- **Server:** Response time, DB query time, API calls
- **Queue:** Processing time, wait time
- **Cache:** Hit/miss ratio
- **ISR:** Regeneration time

**Usage:**
```typescript
import { useMetrics, MetricType } from '@/modules/monitoring/useMetrics';

const metrics = useMetrics();

// Record API response time
await metrics.recordApiCall(250, '/api/products', 'GET', 200);

// Record DB query time
await metrics.recordDbQuery(150, 'SELECT * FROM products WHERE ...');

// Record cache hit
await metrics.recordCacheHit('product:123');

// Get metrics summary
const summary = metrics.getMetricsSummary(MetricType.API_CALL, 3600000);
console.log(`Avg: ${summary.avg}ms, P95: ${summary.p95}ms`);
```

**Thresholds:**
- TTFB: 800ms
- LCP: 2500ms
- FID: 100ms
- CLS: 0.1
- Server Response: 500ms
- DB Query: 200ms

### 3. Database Monitoring (`useDbMonitoring`)

**Purpose:** Monitor database performance and health

**Features:**
- Slow query detection (>200ms)
- Query statistics by model and operation
- Connection pool monitoring
- Index efficiency analysis
- Deadlock detection
- Database size tracking

**Usage:**
```typescript
import { useDbMonitoring } from '@/modules/monitoring/useDbMonitoring';
import { prisma } from '@/lib/db';

const dbMonitor = useDbMonitoring();

// Create monitored Prisma client
const monitoredPrisma = dbMonitor.createMonitoredClient();

// Check health
const health = await dbMonitor.checkHealth(prisma);
console.log(`DB Status: ${health.status}`);
console.log(`Avg Query Time: ${health.averageQueryTime}ms`);

// Get slow queries
const slowQueries = dbMonitor.getSlowQueries(200, 10);

// Analyze indexes
const indexAnalysis = await dbMonitor.analyzeIndexEfficiency(prisma);
```

### 4. Queue Monitoring (`useQueueMonitoring`)

**Purpose:** Track job queue performance and health

**Features:**
- Active/pending/failed job tracking
- Processing time metrics
- Retry count monitoring
- Success rate calculation
- Queue health status

**Usage:**
```typescript
import { useQueueMonitoring, JobType } from '@/modules/monitoring/useQueueMonitoring';

const queue = useQueueMonitoring();

// Register a job
const job = await queue.registerJob('job-1', JobType.EMAIL, { to: 'user@example.com' });

// Start processing
await queue.startJob('job-1');

// Complete successfully
await queue.completeJob('job-1');

// Or fail with error
await queue.failJob('job-1', new Error('Connection timeout'));

// Get statistics
const stats = queue.getStats();
console.log(`Success Rate: ${stats.successRate * 100}%`);
console.log(`Avg Processing Time: ${stats.averageProcessingTime}ms`);
```

**Job Types:**
- `EMAIL` - Email sending
- `IMAGE_PROCESSING` - Image manipulation
- `ORDER_PROCESSING` - Order fulfillment
- `REPORT_GENERATION` - Report creation
- `BACKUP` - System backup
- `CLEANUP` - Data cleanup
- `NOTIFICATION` - Push notifications

### 5. Alerting System (`useAlerts`)

**Purpose:** Send alerts when thresholds are exceeded

**Alert Channels:**
- Slack (via webhook)
- Email (via Resend API)
- SMS (critical only)

**Alert Triggers:**
- API response time > 500ms
- DB query > 200ms
- Queue job failure
- 5xx error spike
- Login failure spike
- Storage > 90% full
- CPU > 80%
- Memory > 80%
- Service downtime

**Usage:**
```typescript
import { useAlerts, AlertSeverity } from '@/modules/monitoring/useAlerts';

const alerts = useAlerts();

// Send custom alert
await alerts.sendAlert(
  AlertSeverity.WARNING,
  'High Memory Usage',
  'Memory usage is at 85%',
  { memoryPercent: 85 }
);

// Send predefined alerts
await alerts.alertSlowApiResponse('/api/products', 750);
await alerts.alertSlowDbQuery('SELECT * FROM orders...', 350);
await alerts.alertQueueJobFailed('email', 'job-123', 'SMTP timeout');

// Acknowledge alert
await alerts.acknowledgeAlert('alert-id', 'admin-user-id');

// Get unacknowledged alerts
const unacked = alerts.getUnacknowledgedAlerts();
```

### 6. Security Monitoring (`useSecurityMonitoring`)

**Purpose:** Detect and track security threats

**Features:**
- Brute-force attack detection
- XSS attempt logging
- SQL injection detection
- File upload validation
- Permission escalation tracking
- IP blocking
- Security event analysis

**Usage:**
```typescript
import { useSecurityMonitoring, SecurityEventType } from '@/modules/monitoring/useSecurityMonitoring';

const security = useSecurityMonitoring();

// Track login attempt
const blocked = await security.trackLoginAttempt('1.2.3.4', 'user-1', false);

// Detect XSS
const xssDetected = await security.detectXssAttempt(
  userInput,
  '1.2.3.4',
  'user-1'
);

// Detect SQL injection
const sqlDetected = await security.detectSqlInjection(
  userInput,
  '1.2.3.4'
);

// Track file upload
const uploadBlocked = await security.trackFileUpload(
  'file.exe',
  1024000,
  'application/octet-stream',
  '1.2.3.4'
);

// Get statistics
const stats = security.getStatistics(86400000); // Last 24h
```

**Brute Force Protection:**
- Max 5 failed attempts per 5 minutes
- Automatic IP blocking for 1 hour
- Alert sent to admins

### 7. Performance Profiler (`useProfiler`)

**Purpose:** Profile code execution for optimization

**Features:**
- Function profiling
- Endpoint profiling
- Call stack tracking
- Memory usage tracking
- Bottleneck detection
- Flamegraph generation

**Usage:**
```typescript
import { useProfiler, Profile } from '@/modules/monitoring/useProfiler';

const profiler = useProfiler();

// Profile a function
const result = await profiler.profileFunction('myFunction', async () => {
  // Your code here
  return await heavyOperation();
});

// Manual profiling
const id = profiler.start('customOperation', 'function');
await doSomething();
const duration = await profiler.end(id);

// Decorator for methods
class MyService {
  @Profile('MyService.processOrder')
  async processOrder(orderId: string) {
    // Method implementation
  }
}

// Get results
const topProfiles = profiler.getTopProfiles(20);
const bottlenecks = profiler.getBottlenecks(20);
const exportedData = profiler.exportResults();
```

---

## Setup

### 1. Environment Variables

Add to `.env`:

```bash
# Logging Services (optional, choose one or more)
LOGTAIL_TOKEN=your_logtail_token
DATADOG_API_KEY=your_datadog_key
ELASTIC_URL=https://your-elastic-instance.com
LOKI_URL=https://your-loki-instance.com

# Sentry (Frontend Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
ALERT_EMAIL_RECIPIENTS=admin@sanduta.art,ops@sanduta.art
ALERT_SMS_NUMBERS=+1234567890,+0987654321

# Metrics Endpoint (optional custom endpoint)
METRICS_ENDPOINT=https://your-metrics-service.com/api/metrics
```

### 2. Install Dependencies

```bash
npm install @sentry/nextjs web-vitals
```

### 3. Initialize Sentry

Add to `src/app/layout.tsx`:

```typescript
import { initSentry } from '@/lib/sentry';

// Initialize in production
if (process.env.NODE_ENV === 'production') {
  initSentry();
}
```

### 4. Add Web Vitals Tracking

Add to `src/app/layout.tsx`:

```typescript
import { initWebVitals } from '@/lib/webVitals';

// In client component or useEffect
useEffect(() => {
  initWebVitals();
}, []);
```

### 5. Apply API Monitoring Middleware

Wrap your API routes:

```typescript
import { monitorApi } from '@/middleware/apiMonitoring';

export const GET = monitorApi(async (request) => {
  // Your API logic
  return NextResponse.json({ data: '...' });
});
```

### 6. Setup Monitored Database

In `src/lib/db.ts`:

```typescript
import { useDbMonitoring } from '@/modules/monitoring/useDbMonitoring';

const dbMonitor = useDbMonitoring();
export const prisma = dbMonitor.createMonitoredClient();
```

---

## Usage

### API Endpoints

#### Health Check
```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T10:00:00.000Z",
  "uptime": 86400000,
  "checks": {
    "api": { "status": "healthy" },
    "database": { "status": "healthy", "metrics": {...} },
    "queue": { "status": "healthy", "metrics": {...} },
    "storage": { "status": "healthy" },
    "external": { "status": "healthy", "services": {...} }
  }
}
```

#### Client Logs
```bash
POST /api/logs
Content-Type: application/json

{
  "level": "error",
  "category": "editor",
  "message": "Failed to save design",
  "context": { "designId": "123" }
}
```

#### Client Metrics
```bash
POST /api/metrics
Content-Type: application/json

{
  "type": "lcp",
  "value": 1500,
  "context": { "page": "/products" }
}
```

#### Admin Alerts (Auth Required)
```bash
GET /api/admin/monitoring/alerts
POST /api/admin/monitoring/alerts/{id}/acknowledge
```

#### Admin Security (Auth Required)
```bash
GET /api/admin/monitoring/security
```

---

## Alerts

### Configuration

Configure alert channels in `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL_RECIPIENTS=admin1@sanduta.art,admin2@sanduta.art
ALERT_SMS_NUMBERS=+40123456789
```

### Alert Severity Levels

1. **INFO** - Informational, no action required
2. **WARNING** - Potential issue, monitor
3. **ERROR** - Issue occurred, investigate
4. **CRITICAL** - Critical issue, immediate action required (sent via all channels including SMS)

### Common Alerts

| Alert | Trigger | Severity |
|-------|---------|----------|
| Slow API Response | Response time > 500ms | WARNING |
| Very Slow API | Response time > 2s | ERROR |
| Slow DB Query | Query time > 200ms | WARNING |
| Very Slow Query | Query time > 1s | ERROR |
| Queue Job Failed | Job permanently failed | ERROR |
| 5xx Error Spike | 10+ errors in 5min | CRITICAL |
| Login Failure Spike | 20+ failures in 5min | ERROR |
| Storage Full | Usage > 90% | WARNING |
| Storage Critical | Usage > 95% | CRITICAL |
| High CPU | CPU > 80% | WARNING |
| Critical CPU | CPU > 95% | CRITICAL |
| Service Down | Health check fails | CRITICAL |

---

## Dashboard

Access: `/dashboard/monitoring` (Admin only)

### Features

1. **System Health Overview**
   - Overall status indicator
   - Individual component status
   - Uptime display
   - Last check timestamp

2. **Real-time Metrics**
   - API performance graphs
   - Database query statistics
   - Queue job status
   - Cache hit rates

3. **Recent Alerts**
   - Alert list with severity
   - Acknowledge functionality
   - Alert history

4. **Security Events**
   - Recent security events
   - Blocked IPs
   - Event severity
   - Event timeline

5. **Database Performance**
   - Total queries
   - Average query time
   - Slow query count
   - Connection pool status

6. **Queue Status**
   - Pending jobs
   - Active jobs
   - Completed jobs
   - Failed jobs
   - Success rate

7. **External Services**
   - Paynet status
   - Nova Poshta status
   - Resend status
   - Cloudinary status

### Auto-refresh

Dashboard auto-refreshes every 30 seconds (can be toggled on/off).

---

## Configuration

### Thresholds

Modify in respective module files:

**Metrics** (`useMetrics.ts`):
```typescript
const THRESHOLDS = {
  ttfb: 800,
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  server_response: 500,
  db_query: 200,
  api_call: 500,
};
```

**Database** (`useDbMonitoring.ts`):
```typescript
const SLOW_QUERY_THRESHOLD_MS = 200;
const VERY_SLOW_QUERY_THRESHOLD_MS = 1000;
```

**Security** (`useSecurityMonitoring.ts`):
```typescript
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 300000; // 5 minutes
const BLOCK_DURATION_MS = 3600000; // 1 hour
```

### Rate Limits

**API Monitoring** (`apiMonitoring.ts`):
```typescript
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
```

**Alerts** (`useAlerts.ts`):
```typescript
rateLimitWindowMs: 300000, // 5 minutes
maxAlertsPerWindow: 10,
```

---

## Best Practices

### 1. Logging

✅ **DO:**
- Use appropriate log levels
- Include context in logs
- Log user actions for audit
- Log performance metrics

❌ **DON'T:**
- Log sensitive data (passwords, tokens)
- Over-log (every function call)
- Log in tight loops
- Include PII without consent

### 2. Metrics

✅ **DO:**
- Track critical user paths
- Monitor slow operations
- Use consistent metric names
- Aggregate metrics for analysis

❌ **DON'T:**
- Track unnecessary metrics
- Create too granular metrics
- Ignore metric thresholds

### 3. Alerts

✅ **DO:**
- Set meaningful thresholds
- Acknowledge alerts promptly
- Create alert runbooks
- Test alert channels

❌ **DON'T:**
- Alert on every minor issue
- Ignore repeated alerts
- Set unrealistic thresholds
- Forget to document actions

### 4. Security

✅ **DO:**
- Monitor failed logins
- Track suspicious activity
- Block malicious IPs
- Review security logs regularly

❌ **DON'T:**
- Ignore security events
- Disable brute-force protection
- Allow unlimited retries
- Forget to unblock legitimate IPs

### 5. Performance

✅ **DO:**
- Profile slow operations
- Optimize database queries
- Use caching effectively
- Monitor queue health

❌ **DON'T:**
- Profile in production heavily
- Ignore bottlenecks
- Over-optimize prematurely
- Forget to clear old data

---

## Troubleshooting

### Logs not appearing

1. Check environment variables (LOGTAIL_TOKEN, etc.)
2. Verify network connectivity to log services
3. Check console for errors
4. Ensure logger is initialized

### Metrics not recorded

1. Verify `/api/metrics` endpoint is accessible
2. Check browser console for fetch errors
3. Ensure web-vitals package is installed
4. Check metrics threshold configuration

### Alerts not sent

1. Verify SLACK_WEBHOOK_URL or ALERT_EMAIL_RECIPIENTS
2. Check alert rate limits
3. Test webhook/email manually
4. Check alert logs in console

### Dashboard not loading

1. Verify user has ADMIN role
2. Check `/api/health` endpoint
3. Check browser console for errors
4. Verify API routes are accessible

### High memory usage

1. Clear old metrics: `metrics.clearOldMetrics()`
2. Clear old logs: `logger.clearLogs()`
3. Clear queue history: `queue.clearOldJobs()`
4. Clear security events: `security.clearOldEvents()`

---

## API Reference

See inline documentation in module files for complete API reference:

- `src/modules/monitoring/useLogger.ts`
- `src/modules/monitoring/useMetrics.ts`
- `src/modules/monitoring/useDbMonitoring.ts`
- `src/modules/monitoring/useQueueMonitoring.ts`
- `src/modules/monitoring/useAlerts.ts`
- `src/modules/monitoring/useSecurityMonitoring.ts`
- `src/modules/monitoring/useProfiler.ts`

---

## Support

For issues or questions:
- Check logs in monitoring dashboard
- Review security events
- Check health endpoint
- Contact: ops@sanduta.art
