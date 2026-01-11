# 🚀 Launch Quick Start Guide

> **Ghid rapid pentru executarea lansării oficiale sanduta.art**
> 
> **Timp estimat**: 30 minute  
> **Dificultate**: Mediu  
> **Requires**: Terminal access, Git, Node.js

---

## ⚡ TL;DR - Launch în 3 Comenzi

```bash
# 1. Verificare pre-lansare
npm run pre-launch:audit

# 2. Lansare oficială
npm run launch

# 3. Monitorizare 24h
npm run monitor:post-launch -- 24
```

**Gata!** Platforma este live și monitorizată. 🎉

---

## 📋 Prerequisites (5 min)

### 1. Environment Variables

Verifică că toate variabilele sunt setate în `.env.production`:

```bash
# Required pentru lansare
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://sanduta.art"
PAYNET_API_KEY="..."
PAYNET_SECRET="..."
NOVA_POSHTA_API_KEY="..."
RESEND_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."

# Optional dar recomandat
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
DEPLOY_PLATFORM="pm2"  # sau "vercel"
```

### 2. Deployment Platform

**Opțiune A - PM2** (recommended pentru VPS):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

**Opțiune B - Vercel** (recommended pentru cloud):
```bash
npm install -g vercel
vercel link
vercel env pull .env.production
```

### 3. Slack Webhook (optional)

1. Mergi la https://api.slack.com/messaging/webhooks
2. Creează webhook pentru workspace-ul tău
3. Copiază URL-ul și adaugă în `.env.production`
4. Test: `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test notification"}'`

---

## 🎯 Launch Procedure (20 min)

### Step 1: Pre-Launch Verification (5 min)

```bash
# Run complete audit
npm run pre-launch:audit

# Expected output:
# ✅ Performance checks: PASS
# ✅ Security checks: PASS
# ✅ Functionality checks: PASS
# 
# Final Score: 85/100
# Status: READY TO LAUNCH ✅
```

**Dacă score < 80**: Rezolvă critical issues înainte de lansare.

### Step 2: Launch Execution (10 min)

```bash
# Execute launch script
npm run launch

# Va rula automat:
# [1/12] Pre-launch freeze check... ✅
# [2/12] Environment validation... ✅
# [3/12] Database backup... ✅
# [4/12] Database migrations... ✅
# [5/12] Build application... ✅
# [6/12] Deploy to production... ✅
# [7/12] ISR regeneration... ✅
# [8/12] Cache invalidation... ✅
# [9/12] Health checks... ✅
# [10/12] Smoke tests... ✅
# [11/12] Monitoring activation... ✅
# [12/12] Post-launch verification... ✅
#
# ✅ LAUNCH SUCCESSFUL!
# Report saved to: LAUNCH_REPORT.md
```

**Output Files**:
- `LAUNCH_REPORT.md` - Detailed launch report
- Slack notification sent (if configured)

### Step 3: Immediate Verification (5 min)

**Manual checks** (while monitoring starts):

```bash
# 1. Check homepage
curl -I https://sanduta.art
# Expected: HTTP/2 200

# 2. Check API health
curl https://sanduta.art/api/health
# Expected: {"status":"healthy"}

# 3. Quick smoke tests
npm run smoke-tests:full
# Expected: All tests pass (16/16)
```

**Browser checks**:
1. Open https://sanduta.art
2. Browse products
3. Add to cart
4. Test configurator
5. Check admin panel login

---

## 📊 Post-Launch Monitoring (continuous)

### Start Live Monitoring

```bash
# Monitor for 24 hours
npm run monitor:post-launch -- 24

# Output:
# ================================================================================
# 📊 POST-LAUNCH MONITORING DASHBOARD
# ⏰ 2026-01-15 10:15:00
# ================================================================================
#
# 🚦 TRAFFIC
#    Page Views: 1,234
#    Unique Visitors: 567
#    Bounce Rate: 45.2%
#    Avg Session: 3m 24s
#
# 🛒 ORDERS
#    Total: 12
#    Completed: 8
#    Pending: 4
#    Revenue: 24,567 MDL
#    Avg Order Value: 2,047 MDL
#
# ⚠️  ERRORS
#    Total: 15
#    Error Rate: 0.12%
#    Critical: 0
#
# ⚡ PERFORMANCE
#    Avg Response: 234ms
#    P95 Response: 567ms
#    Uptime: 100.00%
#
# 💰 CONVERSIONS
#    Visit → Cart: 12.3%
#    Cart → Checkout: 45.6%
#    Checkout → Order: 78.9%
#    Overall Rate: 4.32%
#    Cart Abandonment: 21.1%
#
# ================================================================================
# Next refresh in 60s | Press Ctrl+C to stop
# ================================================================================
```

### Monitoring Schedule

**First Hour** (critical):
- Check dashboard every **5 minutes**
- Watch for critical alerts
- Respond immediately to issues

**Hours 1-6** (high alert):
- Check every **15 minutes**
- Monitor trends
- Deploy hotfixes if needed

**Hours 6-24** (standard):
- Check every **hour**
- Generate reports
- Plan optimizations

---

## 🚨 Emergency Procedures

### If Critical Issue Detected

**1. Assess Severity**:
```bash
# Check error logs
npm run monitor:post-launch

# Review alerts in Slack
# Check Sentry dashboard
```

**2. Deploy Hotfix** (if needed):
```bash
# Fix the bug in code
# Then:
npm run hotfix -- "fix: critical bug in [component]"

# Automatic:
# - Creates hotfix branch
# - Builds and tests
# - Deploys to production
# - Runs health checks
# - Notifies team
```

**3. Rollback** (if hotfix fails):
```bash
# Get commit hash from LAUNCH_REPORT.md
npm run rollback -- <commit-hash>

# Automatic:
# - Reverts commit
# - Redeploys
# - Verifies health
# - Notifies team
```

---

## 📝 Reporting

### Generate 24h Report

După 24 ore, folosește template-ul pentru raport:

```bash
# Open template
cat docs/POST_LAUNCH_REPORT_TEMPLATE.md

# Fill in with data from monitoring dashboard
# Save as: POST_LAUNCH_24H_REPORT.md

# Share with team via Slack/Email
```

### Key Metrics to Include

- **Traffic**: Page views, visitors, bounce rate
- **Orders**: Total, revenue, conversion rate
- **Errors**: Count, rate, critical issues
- **Performance**: Response times, uptime
- **Incidents**: Hotfixes deployed, issues resolved

---

## ✅ Success Checklist

### Launch Day (T+0)
- [ ] Pre-launch audit passed (score ≥85)
- [ ] Launch script executed successfully
- [ ] All smoke tests passed (16/16)
- [ ] Monitoring dashboard started
- [ ] Team notified via Slack
- [ ] Manual verification complete

### First Hour (T+1h)
- [ ] No critical errors detected
- [ ] Error rate < 5%
- [ ] Response time < 2s
- [ ] Orders coming through
- [ ] No queue backlogs
- [ ] Team confident

### First 24 Hours (T+24h)
- [ ] Uptime > 99%
- [ ] Error rate < 2%
- [ ] At least 10 orders processed
- [ ] 24h report generated
- [ ] Any hotfixes documented
- [ ] Team retrospective scheduled

### First 72 Hours (T+72h)
- [ ] Platform stable
- [ ] No critical incidents for 48h
- [ ] User feedback collected
- [ ] 72h report generated
- [ ] Optimization plan created
- [ ] Enter stabilization phase

---

## 💡 Tips & Best Practices

### Before Launch

1. **Test în staging first**:
   ```bash
   # Set staging environment
   export NEXTAUTH_URL=https://staging.sanduta.art
   npm run launch
   ```

2. **Communicate cu team**:
   - Announce code freeze 24h before
   - Schedule launch meeting
   - Confirm all team members available

3. **Prepare rollback plan**:
   - Note current commit hash
   - Keep previous version accessible
   - Test rollback procedure

### During Launch

1. **Monitor closely**:
   - Keep monitoring dashboard visible
   - Watch Slack for alerts
   - Check error logs frequently

2. **Document everything**:
   - Note any anomalies
   - Save error messages
   - Screenshot dashboard at milestones

3. **Communicate status**:
   - Update team every 15 min first hour
   - Post in Slack war room
   - Notify stakeholders of success

### After Launch

1. **Don't relax too soon**:
   - Keep monitoring for 24h minimum
   - Stay available for issues
   - Document lessons learned

2. **Gather feedback**:
   - Collect user comments
   - Review analytics
   - Identify quick wins

3. **Plan improvements**:
   - Create backlog from feedback
   - Schedule optimization sprints
   - Update documentation

---

## 📚 Additional Resources

### Documentation

- **Complete Guide**: [docs/LAUNCH_PLAYBOOK.md](docs/LAUNCH_PLAYBOOK.md)
- **Report Template**: [docs/POST_LAUNCH_REPORT_TEMPLATE.md](docs/POST_LAUNCH_REPORT_TEMPLATE.md)
- **Final Report**: [RAPORT_LAUNCH_SYSTEM_FINAL.md](RAPORT_LAUNCH_SYSTEM_FINAL.md)

### Scripts

- **Launch**: [scripts/launch.ts](scripts/launch.ts)
- **Smoke Tests**: [scripts/smoke-tests.ts](scripts/smoke-tests.ts)
- **Monitoring**: [scripts/post-launch-monitor.ts](scripts/post-launch-monitor.ts)
- **Hotfix**: [scripts/hotfix.ts](scripts/hotfix.ts)

### Commands

```bash
# All available launch commands
npm run launch                  # Main deployment
npm run smoke-tests:full        # Post-launch tests
npm run monitor:post-launch     # Live monitoring
npm run hotfix                  # Rapid bugfix deploy
npm run rollback                # Emergency rollback
npm run pre-launch:audit        # Readiness check
npm run pre-launch:performance  # Performance test
```

---

## 🎉 You're Ready!

Sistemul de lansare este **COMPLET** și **TESTAT**.

**Next Steps**:
1. Review acest guide cu team-ul
2. Schedule launch meeting
3. Execute pre-launch checklist
4. **GO FOR LAUNCH!** 🚀

**Questions?** Consultă [LAUNCH_PLAYBOOK.md](docs/LAUNCH_PLAYBOOK.md) pentru detalii complete.

---

**Good luck with your launch! 🎊**

*Last updated: 2026-01-10*  
*Version: 1.0*
