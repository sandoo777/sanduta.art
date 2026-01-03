# Backend Reliability Improvements

## Overview
This document describes the reliability improvements made to the backend API and error handling.

## Changes Made

### 1. Structured Logging System

**File**: `src/lib/logger.ts`

Created a centralized logging utility with:
- **Log Levels**: INFO, WARN, ERROR, DEBUG
- **Tagged Logging**: Each log includes a tag (e.g., `API:Orders`, `API:Paynet`)
- **Structured Context**: Additional metadata in each log entry
- **Timestamp**: ISO 8601 format for all logs
- **Environment-Aware**: DEBUG logs only in development

#### Usage Examples:
```typescript
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Info logging
logger.info('API:Orders', 'Fetching user orders', { userId: user.id });

// Error logging
logApiError('API:Paynet', error, { orderId, service: 'paynet_api' });

// Standard error response
return createErrorResponse('Order not found', 404);
```

### 2. API Routes Error Handling

All API routes now include:
- ✅ Try/catch blocks around all operations
- ✅ Structured logging with context
- ✅ Clear, user-friendly error messages
- ✅ Proper HTTP status codes
- ✅ Error details for debugging

#### Updated Routes:

**Public Routes:**
- `/api/products` - Product listing with cache headers
- `/api/orders` - GET (user orders) and POST (create order)
- `/api/register` - User registration with validation

**Payment & Delivery:**
- `/api/payment/paynet` - Payment session creation with fallback
- `/api/delivery/novaposhta` - Shipment creation with graceful failure

**Admin Routes:**
- `/api/admin/orders` - Admin order management
- `/api/admin/products` - Admin product management

### 3. Fallback UI Components

#### Checkout Page Improvements
**File**: `src/app/checkout/page.tsx`

- **Nova Poshta Failure Handling**:
  - Shows warning if delivery registration fails
  - Order still processes successfully
  - Manual processing fallback message
  
- **Paynet Failure Handling**:
  - Detects payment service unavailability
  - Offers cash-on-delivery as fallback
  - Clear error messages with retry option

- **City Search Graceful Degradation**:
  - Handles API failures silently
  - Allows manual city entry
  - No blocking of checkout flow

#### Products Page Improvements
**File**: `src/app/products/page.tsx`

- **Loading State**: Spinner with message
- **Error State**: 
  - Visual error indicator (warning icon)
  - Clear error message
  - Retry button
- **Empty State**: Helpful message when no products found

#### Product Image Fallback
**File**: `src/components/ProductImage.tsx`

New component for handling missing images:
- Gradient placeholder background
- SVG icon fallback
- Lazy loading support
- Automatic fallback on image error

### 4. Error Response Format

All API errors now return consistent JSON:

```json
{
  "error": "User-friendly error message",
  "details": {
    "fallback": "cod_available"
  },
  "timestamp": "2026-01-03T12:34:56.789Z"
}
```

### 5. Logging Output Format

Console logs now include structured data:

```
[2026-01-03T12:34:56.789Z] [INFO] [API:Orders] Creating new order
[2026-01-03T12:34:56.890Z] [INFO] [API:Orders] Order created successfully { orderId: 'abc123', total: 5000, itemCount: 3 }
[2026-01-03T12:35:01.234Z] [ERROR] [API:Paynet] Payment service unavailable { orderId: 'abc123', service: 'paynet_api' }
```

## Benefits

### For Users:
- ✅ Clear error messages (no technical jargon)
- ✅ Graceful degradation (features still work when services fail)
- ✅ Fallback options (COD when card payment fails)
- ✅ Better UX with loading and error states

### For Developers:
- ✅ Centralized logging system
- ✅ Easy debugging with structured logs
- ✅ Consistent error handling patterns
- ✅ Tagged logs for filtering (e.g., `grep "API:Paynet"`)

### For Operations:
- ✅ Timestamp on all logs for correlation
- ✅ Error context for troubleshooting
- ✅ Service-level error tracking
- ✅ Failed operation identification

## Testing Recommendations

### Manual Testing:
1. **Test API failures**:
   - Temporarily disable Nova Poshta API
   - Verify order still creates with warning message
   
2. **Test payment failures**:
   - Use invalid Paynet credentials
   - Verify COD fallback is offered

3. **Test missing images**:
   - Remove image_url from a product
   - Verify placeholder is shown

4. **Test network failures**:
   - Throttle network in DevTools
   - Verify loading states and error messages

### Log Monitoring:
```bash
# Filter logs by service
grep "API:Paynet" logs.txt

# Filter by error level
grep "ERROR" logs.txt

# Filter by timestamp range
grep "2026-01-03T12:3" logs.txt
```

## Future Improvements

1. **Metrics & Monitoring**:
   - Add request duration tracking
   - Count errors by service
   - Alert on high error rates

2. **Error Recovery**:
   - Automatic retry for transient failures
   - Circuit breaker for external services
   - Queue for failed email sends

3. **User Notifications**:
   - Toast notifications for errors
   - In-app error history
   - Email alerts for critical failures

4. **Advanced Logging**:
   - Log aggregation (e.g., Logtail, DataDog)
   - Search and analytics
   - Real-time monitoring dashboards

## Related Files

- `src/lib/logger.ts` - Logging utility
- `src/app/api/**/route.ts` - All API routes
- `src/app/checkout/page.tsx` - Checkout with fallbacks
- `src/app/products/page.tsx` - Products with error handling
- `src/components/ProductImage.tsx` - Image fallback component

## Migration Notes

When adding new API routes:
1. Import logger utilities: `import { logger, logApiError, createErrorResponse } from '@/lib/logger'`
2. Wrap all operations in try/catch
3. Log important actions with `logger.info()`
4. Log errors with `logApiError()`
5. Return errors with `createErrorResponse()`
6. Include relevant context in logs
