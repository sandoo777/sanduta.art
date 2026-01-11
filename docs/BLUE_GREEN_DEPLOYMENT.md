# Blue-Green Deployment Strategy

## Overview
Blue-Green deployment permite deployment zero-downtime prin rularea a două medii identice (blue și green), făcând switch instant între ele.

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Load Balancer / Router              │
│         (Vercel / Cloudflare / Nginx)            │
└────────────┬─────────────────┬──────────────────┘
             │                 │
      ┌──────▼──────┐   ┌─────▼───────┐
      │    BLUE     │   │    GREEN    │
      │ (Current)   │   │   (New)     │
      │  v1.2.3     │   │   v1.2.4    │
      └─────────────┘   └─────────────┘
             │                 │
      ┌──────▼──────┐   ┌─────▼───────┐
      │  Database   │   │  Database   │
      │   (Shared)  │   │  (Shared)   │
      └─────────────┘   └─────────────┘
```

## Implementation with Vercel

### 1. Two Deployment Slots

```bash
# Blue (current production)
https://sanduta.art → blue-production

# Green (new version)
https://green.sanduta.art → green-production
```

### 2. Deployment Process

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  workflow_dispatch:
    inputs:
      target:
        description: 'Deployment target'
        required: true
        type: choice
        options:
          - blue
          - green
      action:
        description: 'Action to perform'
        required: true
        type: choice
        options:
          - deploy
          - switch
          - rollback

jobs:
  deploy:
    name: Deploy to ${{ github.event.inputs.target }}
    runs-on: ubuntu-latest
    if: github.event.inputs.action == 'deploy'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to ${{ github.event.inputs.target }}
        run: |
          if [ "${{ github.event.inputs.target }}" == "blue" ]; then
            ALIAS="blue.sanduta.art"
          else
            ALIAS="green.sanduta.art"
          fi
          
          vercel deploy --prod --alias $ALIAS \
            --token ${{ secrets.VERCEL_TOKEN }} \
            --scope ${{ secrets.VERCEL_ORG_ID }}

      - name: Run smoke tests
        run: |
          npm run smoke-tests -- \
            --environment ${{ github.event.inputs.target }} \
            --url https://${{ github.event.inputs.target }}.sanduta.art

  switch:
    name: Switch traffic to ${{ github.event.inputs.target }}
    runs-on: ubuntu-latest
    if: github.event.inputs.action == 'switch'
    
    steps:
      - name: Update DNS/Routing
        run: |
          # Update Vercel alias to point to new deployment
          if [ "${{ github.event.inputs.target }}" == "blue" ]; then
            SOURCE="blue.sanduta.art"
          else
            SOURCE="green.sanduta.art"
          fi
          
          # Point main domain to target
          vercel alias set $SOURCE sanduta.art \
            --token ${{ secrets.VERCEL_TOKEN }} \
            --scope ${{ secrets.VERCEL_ORG_ID }}

      - name: Verify switch
        run: |
          sleep 10
          curl -f https://sanduta.art/api/health || exit 1

      - name: Notify switch
        run: |
          node scripts/notifyBlueGreenSwitch.js \
            --target ${{ github.event.inputs.target }}

  rollback:
    name: Rollback to previous slot
    runs-on: ubuntu-latest
    if: github.event.inputs.action == 'rollback'
    
    steps:
      - name: Determine rollback target
        id: target
        run: |
          CURRENT="${{ github.event.inputs.target }}"
          if [ "$CURRENT" == "blue" ]; then
            echo "rollback_to=green" >> $GITHUB_OUTPUT
          else
            echo "rollback_to=blue" >> $GITHUB_OUTPUT
          fi

      - name: Switch back
        run: |
          TARGET="${{ steps.target.outputs.rollback_to }}"
          vercel alias set ${TARGET}.sanduta.art sanduta.art \
            --token ${{ secrets.VERCEL_TOKEN }} \
            --scope ${{ secrets.VERCEL_ORG_ID }}

      - name: Verify rollback
        run: |
          sleep 10
          curl -f https://sanduta.art/api/health || exit 1

      - name: Notify rollback
        run: |
          node scripts/notifyBlueGreenRollback.js \
            --from ${{ github.event.inputs.target }} \
            --to ${{ steps.target.outputs.rollback_to }}
```

## Alternative: Vercel Preview Deployments

### Strategy

1. **Blue (Production)**: Main production deployment
2. **Green (Preview)**: Preview deployment with unique URL
3. **Switch**: Promote preview to production

```bash
# Deploy to preview (green)
vercel deploy --token $VERCEL_TOKEN

# Get preview URL
PREVIEW_URL=$(vercel ls --token $VERCEL_TOKEN | head -n 1)

# Run tests on preview
npm run smoke-tests -- --url $PREVIEW_URL

# Promote to production (switch to green)
vercel promote $PREVIEW_URL --token $VERCEL_TOKEN

# Old production becomes new preview (blue for next deployment)
```

## Database Considerations

### Shared Database Approach

```
Blue ──┐
       ├──► PostgreSQL (Shared)
Green ─┘
```

**Pros**:
- Single source of truth
- No data synchronization needed
- Simple migrations

**Cons**:
- Schema changes must be backward compatible
- Both versions access same data

### Database Migration Strategy

```sql
-- Migrations must be backward compatible

-- Good: Add new column with default
ALTER TABLE products ADD COLUMN new_field VARCHAR(255) DEFAULT '';

-- Good: Add new table
CREATE TABLE new_feature (...);

-- Bad: Rename column (breaks old version)
-- ALTER TABLE products RENAME COLUMN old_name TO new_name;

-- Instead: Add new column, sync data, deprecate old
ALTER TABLE products ADD COLUMN new_name VARCHAR(255);
UPDATE products SET new_name = old_name;
-- Deploy new version
-- Remove old_name in next deployment
```

## Traffic Switching

### Vercel Alias Method

```bash
# Current production
blue.sanduta.art → Deployment A

# Deploy new version to green
green.sanduta.art → Deployment B

# Switch traffic (instant)
vercel alias set green.sanduta.art sanduta.art

# Rollback (instant)
vercel alias set blue.sanduta.art sanduta.art
```

### Gradual Traffic Switching (Canary)

```yaml
# Cloudflare Workers or similar
async function handleRequest(request) {
  // 10% to green, 90% to blue
  const rand = Math.random();
  
  if (rand < 0.1) {
    return fetch('https://green.sanduta.art' + request.url.pathname);
  } else {
    return fetch('https://blue.sanduta.art' + request.url.pathname);
  }
}
```

## Monitoring During Switch

### Key Metrics

1. **Response Time**: Should remain stable
2. **Error Rate**: Should not increase
3. **Active Users**: Should transfer smoothly
4. **Database Load**: Monitor connection pool

### Automated Rollback Triggers

```javascript
// scripts/autoRollback.js
const thresholds = {
  errorRate: 0.05,      // 5% error rate
  responseTime: 2000,   // 2 seconds
  successRate: 0.95,    // 95% success rate
};

async function monitorAndRollback() {
  const metrics = await getMetrics();
  
  if (metrics.errorRate > thresholds.errorRate ||
      metrics.responseTime > thresholds.responseTime ||
      metrics.successRate < thresholds.successRate) {
    
    console.log('🚨 Thresholds exceeded, rolling back!');
    await rollbackToBlue();
  }
}
```

## Testing Strategy

### Pre-Switch Tests

```bash
# 1. Deploy to green
vercel deploy --alias green.sanduta.art

# 2. Run smoke tests
npm run smoke-tests -- --url https://green.sanduta.art

# 3. Run load tests
npm run load-tests -- --url https://green.sanduta.art

# 4. Manual QA (optional)
echo "Review: https://green.sanduta.art"

# 5. Switch traffic
vercel alias set green.sanduta.art sanduta.art

# 6. Monitor for 5 minutes
npm run monitor -- --duration 5m

# 7. If all good, mark blue for next deployment
```

## Best Practices

1. **Always test green before switching**
2. **Keep blue running for instant rollback**
3. **Monitor metrics during and after switch**
4. **Use backward-compatible database migrations**
5. **Have automated rollback triggers**
6. **Document switch procedures**
7. **Schedule switches during low-traffic periods**
8. **Notify team before/after switches**

## Cost Considerations

### Vercel

- **Preview deployments**: Included in Pro plan
- **Multiple production deployments**: May require Enterprise plan
- **Recommendation**: Use preview deployments as "green"

### Alternative: Self-hosted

```
Nginx Load Balancer
├─ Blue:  Server 1 (Current)
└─ Green: Server 2 (New)

# Switch: Update Nginx upstream
upstream backend {
    server blue.internal:3000 weight=0;
    server green.internal:3000 weight=100;
}
```

## Implementation Checklist

- [ ] Setup blue and green deployment environments
- [ ] Configure DNS/routing for traffic switching
- [ ] Implement smoke tests for pre-switch validation
- [ ] Setup monitoring and alerting
- [ ] Configure automated rollback triggers
- [ ] Document switch procedures
- [ ] Test rollback process
- [ ] Train team on blue-green workflow
- [ ] Schedule first blue-green deployment
- [ ] Monitor and refine based on results

## Emergency Rollback

```bash
# Instant rollback (< 10 seconds)
vercel alias set blue.sanduta.art sanduta.art --token $VERCEL_TOKEN

# Verify
curl -f https://sanduta.art/api/health

# Notify team
node scripts/notifyEmergencyRollback.js
```

## Conclusion

Blue-Green deployment cu Vercel oferă:
- ✅ Zero downtime deployments
- ✅ Instant rollback (< 10 secunde)
- ✅ Siguranță crescută
- ✅ Testing în mediu identic cu producția

Costul: Complexitate crescută și resurse duble (temporary).
