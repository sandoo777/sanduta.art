# Launch Playbook - Procedură Oficială de Lansare

> **Ghid complet pentru lansarea în producție a platformei sanduta.art**
> 
> **Versiune**: 1.0  
> **Data**: 2026-01-10  
> **Status**: READY FOR LAUNCH

---

## 📋 Table of Contents

1. [Pre-Launch Checklist](#pre-launch-checklist)
2. [Launch Day Procedure](#launch-day-procedure)
3. [Post-Launch Monitoring](#post-launch-monitoring)
4. [Support Procedures](#support-procedures)
5. [Hotfix Pipeline](#hotfix-pipeline)
6. [Rollback Procedures](#rollback-procedures)
7. [Team Responsibilities](#team-responsibilities)
8. [Escalation Matrix](#escalation-matrix)
9. [Communication Templates](#communication-templates)
10. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 1. Pre-Launch Checklist

### T-7 Days: Final Preparations

#### **Technical Readiness**
- [ ] Run pre-launch audit: `npm run pre-launch:audit`
  - Expected score: ≥ 85/100
  - All critical checks must pass
- [ ] Run performance tests: `npm run pre-launch:performance`
  - LCP < 2.5s
  - TTFB < 200ms
  - Error rate < 1%
- [ ] Database backup created and verified
- [ ] Environment variables configured in production
- [ ] SSL certificates valid and auto-renewal configured
- [ ] CDN configured (Cloudinary for images)
- [ ] DNS configured correctly

#### **Security**
- [ ] Argon2id password hashing deployed
- [ ] 2FA enabled for all admin accounts
- [ ] Rate limiting configured
- [ ] CORS policies verified
- [ ] Security headers configured
- [ ] Sensitive data encrypted
- [ ] API keys rotated

#### **Monitoring & Alerts**
- [ ] Slack webhook configured for alerts
- [ ] Email alerts configured
- [ ] Uptime monitoring active (UptimeRobot/Pingdom)
- [ ] Error tracking configured (Sentry)
- [ ] Analytics installed (Google Analytics)
- [ ] Performance monitoring active

#### **Team Readiness**
- [ ] All team members briefed on launch procedure
- [ ] Support team trained on platform
- [ ] Escalation contacts confirmed
- [ ] Emergency contacts list updated
- [ ] Launch playbook distributed to team

### T-24 Hours: Code Freeze

#### **Code Freeze Rules**
- ⛔ **NO new features** after this point
- ⛔ **NO refactoring** unless critical
- ✅ **ONLY critical bug fixes** allowed
- ✅ **ONLY documentation updates** allowed

#### **Final Verification**
- [ ] All tests passing: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Smoke tests pass: `npm run smoke-tests`
- [ ] Database migrations reviewed
- [ ] Rollback plan confirmed

### T-1 Hour: Go/No-Go Decision

#### **Go Criteria**
- ✅ All critical pre-launch checks passed
- ✅ No critical bugs in staging
- ✅ Team ready and available
- ✅ Monitoring systems operational
- ✅ Backup and rollback plans confirmed
- ✅ Communication channels ready

#### **No-Go Criteria**
- 🚫 Critical bugs discovered
- 🚫 Security vulnerabilities found
- 🚫 Key team members unavailable
- 🚫 Monitoring systems down
- 🚫 Recent production incidents

**Decision Maker**: Technical Lead + Product Owner

---

## 2. Launch Day Procedure

### Step-by-Step Launch Process

#### **1. Pre-Launch Freeze Check (5 min)**

```bash
npm run launch
```

The launch script will automatically:
1. ✅ Verify git status (no uncommitted changes)
2. ✅ Validate environment variables
3. ✅ Create database backup
4. ✅ Run database migrations
5. ✅ Build application
6. ✅ Deploy to production
7. ✅ Regenerate ISR pages
8. ✅ Invalidate caches
9. ✅ Run health checks
10. ✅ Execute smoke tests
11. ✅ Activate monitoring
12. ✅ Send launch notification

**Manual Alternative** (if script fails):
```bash
# 1. Final commit check
git status
git pull origin main

# 2. Environment check
cat .env.production | grep -E "DATABASE_URL|NEXTAUTH_SECRET"

# 3. Database backup
npm run backup:db

# 4. Deploy
git push origin main  # Triggers Vercel/PM2 deploy
npx prisma migrate deploy

# 5. Verify
curl https://sanduta.art/api/health
npm run smoke-tests
```

#### **2. Immediate Post-Launch Checks (15 min)**

**Health Dashboard**:
```bash
# Monitor live:
npm run monitor:post-launch

# Or check manually:
curl https://sanduta.art/api/health
curl https://sanduta.art/
```

**Expected Responses**:
- Health endpoint: `{"status": "healthy"}`
- Homepage: HTTP 200
- Products page: HTTP 200
- API response time: < 500ms

**Critical Checks**:
- [ ] Homepage loads correctly
- [ ] Product catalog accessible
- [ ] Configurator functional
- [ ] Checkout flow works
- [ ] Admin panel accessible
- [ ] Database queries responding
- [ ] No 5xx errors in logs
- [ ] SSL certificate valid

#### **3. Smoke Tests (10 min)**

Run automated smoke tests:
```bash
npm run smoke-tests
```

**Manual Verification** (if automated tests fail):
1. **Guest Flow**: Browse → Product → Add to Cart → Checkout
2. **User Flow**: Register → Login → Place Order → View Orders
3. **Editor Flow**: Open Editor → Design → Export → Add to Cart
4. **Admin Flow**: Login → View Orders → Update Status → Generate Report

#### **4. Monitoring Activation (Ongoing)**

**24-Hour Intensive Monitoring**:
```bash
# Start live dashboard (runs for 24 hours):
npm run monitor:post-launch -- 24
```

**Manual Monitoring Checklist** (first hour):
- Check every **5 minutes** for first hour
- Check every **15 minutes** for next 3 hours
- Check every **hour** for rest of 24h period

**Key Metrics to Watch**:
- ✅ Error rate < 5%
- ✅ Response time < 2s average
- ✅ Uptime > 99%
- ✅ No critical errors
- ✅ Orders processing normally
- ✅ No queue backlogs

---

## 3. Post-Launch Monitoring

### 24-Hour Monitoring Plan

#### **Hour 0-1: Critical Period**
**Frequency**: Every 5 minutes  
**Team**: Full team on standby

**Monitor**:
- Real-time errors (Sentry)
- Response times (API health)
- User traffic (Analytics)
- Order completions
- System resources (CPU, memory)
- Database performance

**Thresholds**:
- Error rate > 5% → 🚨 **ALERT**
- Response time > 3s → ⚠️ **WARNING**
- No orders in 30 min → ⚠️ **INVESTIGATE**
- 5xx errors → 🚨 **CRITICAL**

#### **Hour 1-6: High Alert**
**Frequency**: Every 15 minutes  
**Team**: Tech lead + support on call

**Monitor**:
- Error trends
- Performance degradation
- User feedback/complaints
- Conversion rates
- Cart abandonment rates
- Production queue

**Actions**:
- Document any anomalies
- Investigate error patterns
- Respond to user issues within 10 minutes
- Prepare hotfixes if needed

#### **Hour 6-24: Standard Monitoring**
**Frequency**: Every hour  
**Team**: On-call support

**Monitor**:
- Overall system health
- Business metrics (orders, revenue)
- User behavior
- Production pipeline
- Error accumulation

### 72-Hour Extended Monitoring

#### **Day 1-3: Stabilization Period**
**Frequency**: 3x daily (morning, afternoon, evening)

**Daily Report Includes**:
- Total page views
- Total orders
- Total revenue
- Error rate
- Average response time
- Conversion rate
- Issues detected
- Issues resolved
- Recommendations

**Template**:
```markdown
## Day X Post-Launch Report

**Date**: YYYY-MM-DD
**Report Time**: HH:MM

### Key Metrics
- Page Views: X,XXX
- Orders: XXX
- Revenue: XXX,XXX MDL
- Error Rate: X.XX%
- Avg Response Time: XXXms
- Conversion Rate: X.XX%

### Status: ✅ STABLE / ⚠️ MINOR ISSUES / 🚨 CRITICAL

### Issues Detected
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Status: Investigating/In Progress/Resolved
   - ETA: [time]

### Actions Taken
1. [Action description]
   - Result: Success/Failed
   - Impact: [description]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

### Next Steps
- [Action 1]
- [Action 2]
```

---

## 4. Support Procedures

### Customer Support Scripts

#### **Issue: "Site is slow"**
```
1. Verify: Ask for specific page URL
2. Check: Run lighthouse audit on that page
3. Diagnose:
   - If LCP > 4s → escalate to tech team
   - If specific to user → check their connection
   - If widespread → check server status
4. Response: "We're investigating the performance issue. Expected resolution in [time]."
5. Follow-up: Update customer within 1 hour
```

#### **Issue: "Can't place order"**
```
1. Verify: Get exact error message
2. Check: Review checkout logs for user
3. Diagnose:
   - Payment gateway issue? → check Paynet status
   - Validation error? → guide user through correct format
   - System error? → escalate immediately
4. Response: "I see the issue. Let me help you complete your order."
5. Alternative: Offer manual order processing if critical
```

#### **Issue: "My design disappeared"**
```
1. Verify: Get user ID and approximate time
2. Check: Query database for user's saved designs
3. Recover:
   - If found in DB → restore from backup
   - If in localStorage → guide user to export
   - If truly lost → offer compensation/rebuild
4. Response: "I found your design! It's been restored."
5. Follow-up: Add to design auto-save backlog if needed
```

### Production Support Scripts

#### **Issue: "Order stuck in production"**
```
1. Check order status in admin panel
2. Verify production queue
3. Diagnose:
   - Missing design file? → regenerate from DB
   - Printer offline? → reassign to backup printer
   - Material shortage? → contact purchasing
4. Action: Update order status, notify customer of delay
5. Document: Log issue for process improvement
```

#### **Issue: "Printer not responding"**
```
1. Check printer status in admin
2. Restart printer software
3. If still down:
   - Reassign orders to backup printer
   - Notify production manager
   - Update customers with delays
4. Document downtime for metrics
```

### Admin Support Scripts

#### **Issue: "Can't access admin panel"**
```
1. Verify: Check username/email
2. Check: Is account active and role correct?
3. Reset:
   - Send password reset email
   - Verify 2FA if enabled
   - Check IP whitelist if configured
4. Test: Verify login works after reset
```

#### **Issue: "Report not generating"**
```
1. Check date range (too large?)
2. Verify database query timeout
3. Try:
   - Smaller date range
   - Export as CSV instead of PDF
   - Run query directly in database
4. If persistent → escalate to tech team
```

---

## 5. Hotfix Pipeline

### When to Use Hotfix Pipeline

**Hotfix Scenarios**:
- 🚨 **CRITICAL**: Site down, checkout broken, payment issues, data loss
- ⚠️ **HIGH**: Major feature broken, severe UX issue, security vulnerability
- ℹ️ **MEDIUM**: Minor bug affecting users, performance degradation

**Normal Release Scenarios** (wait for next release):
- New features
- Refactoring
- Minor UI tweaks
- Non-urgent bug fixes

### Hotfix Procedure

#### **1. Rapid Deployment (10-15 min)**

```bash
# Fix the bug in your code
# Commit with clear message
npm run hotfix -- "fix: critical bug in checkout flow"
```

**Automatic Steps**:
1. ✅ Pre-flight checks
2. ✅ Create hotfix branch
3. ✅ Build and quick test
4. ✅ Commit and push
5. ✅ Merge to main
6. ✅ Deploy to production
7. ✅ Health checks
8. ✅ Notify team

#### **2. Post-Hotfix Monitoring**

**Critical**: Monitor intensively for 30 minutes after hotfix
- Check error rates every minute
- Watch for new issues introduced
- Monitor user reports
- Verify fix actually works

#### **3. Rollback if Needed**

```bash
# If hotfix causes new issues:
npm run rollback -- <commit-hash>
```

**Rollback Checklist**:
- [ ] Notify team immediately
- [ ] Execute rollback command
- [ ] Verify rollback successful
- [ ] Document what went wrong
- [ ] Plan better fix

---

## 6. Rollback Procedures

### When to Rollback

**Immediate Rollback** (no discussion needed):
- Site completely down
- Data corruption detected
- Payment processing broken
- Security breach discovered
- Critical functionality broken

**Consider Rollback** (discuss with team):
- High error rate (>10%)
- Severe performance degradation
- Major feature not working
- Negative user feedback spike

### Rollback Steps

#### **Method 1: Automated Rollback**
```bash
npm run rollback -- <commit-hash>
```

#### **Method 2: Manual Rollback**
```bash
# 1. Revert last commit
git revert HEAD --no-edit
git push origin main

# 2. Redeploy
npm run build
pm2 reload ecosystem.config.js  # or wait for Vercel

# 3. Verify
npm run smoke-tests
curl https://sanduta.art/api/health
```

#### **Method 3: Database Rollback**
```bash
# If database migration caused issue:
npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup:
npm run restore:db -- backup-YYYY-MM-DD-HH-MM.sql
```

### Post-Rollback

1. **Verify Stability**:
   - Run smoke tests
   - Check error rates
   - Monitor for 30 minutes

2. **Communicate**:
   - Notify team of rollback
   - Update customers if affected
   - Post status update

3. **Root Cause Analysis**:
   - Document what happened
   - Identify why it wasn't caught
   - Improve testing/monitoring
   - Plan better fix

---

## 7. Team Responsibilities

### Launch Day Roles

#### **Technical Lead**
**Availability**: On-site, full attention  
**Responsibilities**:
- Execute launch procedure
- Monitor system health
- Make go/no-go decisions
- Coordinate technical team
- Handle critical issues

#### **DevOps/Infrastructure**
**Availability**: On-site, full attention  
**Responsibilities**:
- Monitor server resources
- Handle deployment issues
- Manage database performance
- Respond to infrastructure alerts

#### **Frontend Developer**
**Availability**: On-call  
**Responsibilities**:
- Monitor client-side errors
- Fix UI/UX issues
- Handle browser compatibility problems
- Support user testing

#### **Backend Developer**
**Availability**: On-call  
**Responsibilities**:
- Monitor API performance
- Fix server-side bugs
- Optimize database queries
- Handle integration issues

#### **Product Owner**
**Availability**: On-call  
**Responsibilities**:
- Monitor business metrics
- Coordinate with stakeholders
- Make priority decisions
- Handle customer escalations

#### **Customer Support Lead**
**Availability**: On-site, full attention  
**Responsibilities**:
- Monitor user feedback
- Triage customer issues
- Escalate technical problems
- Document common issues

#### **Support Team**
**Availability**: Full shifts covered  
**Responsibilities**:
- Respond to customer inquiries
- Guide users through platform
- Log issues and feedback
- Provide first-line support

### Communication Channels

**Primary**: Slack #launch-war-room  
**Secondary**: Phone/WhatsApp group  
**Emergency**: Direct calls to technical lead

**Update Frequency**:
- **First hour**: Every 15 minutes
- **Hour 1-6**: Every hour
- **Hour 6-24**: Every 3 hours
- **Day 2-3**: Daily summary

---

## 8. Escalation Matrix

### Issue Severity Levels

#### **P0 - CRITICAL** (Response: Immediate)
- Site completely down
- Payment processing broken
- Data loss/corruption
- Security breach
- No orders can be placed

**Escalation**: Immediate call to Tech Lead → CTO

#### **P1 - HIGH** (Response: < 15 min)
- Major feature broken
- High error rate (>10%)
- Severe performance issues
- Database connection issues
- Admin panel inaccessible

**Escalation**: Slack #launch-war-room → Tech Lead if no response in 15 min

#### **P2 - MEDIUM** (Response: < 1 hour)
- Minor feature broken
- Moderate error rate (5-10%)
- Non-critical API issues
- UI/UX problems
- Single printer offline

**Escalation**: Slack #support → assigned team member

#### **P3 - LOW** (Response: < 4 hours)
- Cosmetic issues
- Minor bugs
- Documentation errors
- Enhancement requests

**Escalation**: Create ticket, handle in normal flow

### Escalation Paths

```
Customer Support
      ↓
Support Lead
      ↓ (if technical)
Technical Team
      ↓ (if critical)
Tech Lead
      ↓ (if severity P0)
CTO
```

### Contact List

```
Technical Lead: [name] - [phone] - [email]
DevOps Lead: [name] - [phone] - [email]
Product Owner: [name] - [phone] - [email]
Support Lead: [name] - [phone] - [email]
CTO: [name] - [phone] - [email]
CEO: [name] - [phone] - [email]
```

---

## 9. Communication Templates

### Internal Announcements

#### **T-24h: Code Freeze Announcement**
```
🔒 CODE FREEZE in effect for sanduta.art launch

Effective: [date] at [time]
Duration: Until launch complete + 24h stabilization

Rules:
- ⛔ NO new features
- ⛔ NO refactoring
- ✅ ONLY critical bug fixes
- ✅ ONLY with approval from Tech Lead

Questions? Contact Tech Lead
```

#### **Launch Notification**
```
🚀 sanduta.art is now LIVE!

Launch completed: [time]
All systems: ✅ Operational
Initial checks: ✅ Passed

Team assignments:
- Monitoring: [names]
- Support: [names]
- On-call: [names]

War room: #launch-war-room
Next update: in 1 hour

Great work team! 🎉
```

#### **Issue Alert**
```
⚠️ ISSUE DETECTED - Priority [P0/P1/P2/P3]

Issue: [brief description]
Impact: [who is affected]
Status: [Investigating/In Progress/Resolved]
ETA: [estimated resolution time]

Assigned to: [name]
Escalated to: [name if escalated]

Updates will be posted every [frequency]
```

### Customer Communications

#### **Launch Announcement Email**
```
Subject: 🎉 sanduta.art is now live!

Dear [Name],

We're excited to announce that sanduta.art is now officially live!

What's new:
- ✨ Beautiful product configurator
- 🎨 Advanced design editor
- 📦 Seamless checkout experience
- 📱 Mobile-optimized interface

Start creating your custom designs today: [link]

Need help? Our support team is ready to assist you.

Best regards,
The sanduta.art Team
```

#### **Service Issue Notification**
```
Subject: Service Update - sanduta.art

Dear valued customers,

We're currently experiencing [issue description]. Our team is actively working on a resolution.

Impact: [what is affected]
Expected resolution: [time estimate]

We apologize for any inconvenience.

Status updates: [status page link]

Thank you for your patience,
The sanduta.art Team
```

#### **Issue Resolved Notification**
```
Subject: Service Restored - sanduta.art

Dear valued customers,

The issue affecting [component] has been resolved.

All systems are now operating normally.

We apologize for the disruption and thank you for your patience.

If you continue to experience any issues, please contact support.

Best regards,
The sanduta.art Team
```

---

## 10. FAQ & Troubleshooting

### Common Launch Day Issues

#### **Q: Site is slow after launch**
**A**: 
1. Check server resources (CPU, memory)
2. Verify CDN is serving assets
3. Check database query performance
4. Enable caching if disabled
5. Scale infrastructure if needed

#### **Q: High error rate detected**
**A**:
1. Check Sentry for error details
2. Identify most common error
3. Check if recent deploy caused it
4. Hotfix if critical, otherwise log for later
5. Monitor if error rate decreasing

#### **Q: No orders coming through**
**A**:
1. Test checkout flow manually
2. Check payment gateway status
3. Review checkout logs
4. Verify webhooks working
5. Check email notifications sending

#### **Q: Database connection issues**
**A**:
1. Check connection pool utilization
2. Verify DATABASE_URL correct
3. Test direct database connection
4. Check for query deadlocks
5. Restart database connection pool if needed

#### **Q: Admin panel not accessible**
**A**:
1. Verify admin user exists and is active
2. Check NEXTAUTH_SECRET is set
3. Test login API endpoint
4. Review middleware logs
5. Check session configuration

### Performance Troubleshooting

#### **Symptom: High response times**
**Diagnosis**:
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://sanduta.art/api/health

# Check database queries
npm run prisma studio
# Review slow queries in logs
```

**Solutions**:
- Add database indexes
- Enable API caching
- Optimize heavy queries
- Scale database if needed

#### **Symptom: High memory usage**
**Diagnosis**:
```bash
# Check process memory
pm2 monit

# Check for memory leaks
node --inspect scripts/check-memory.ts
```

**Solutions**:
- Restart processes
- Fix memory leaks in code
- Increase server memory
- Optimize image processing

#### **Symptom: Slow page loads**
**Diagnosis**:
```bash
# Run Lighthouse audit
npm run lighthouse

# Check bundle size
npm run analyze-bundle
```

**Solutions**:
- Optimize images (compress, lazy load)
- Code split large bundles
- Enable ISR for static pages
- Minimize third-party scripts

### Security Troubleshooting

#### **Symptom: Suspicious login attempts**
**Action**:
1. Enable rate limiting on `/api/auth/signin`
2. Check IP addresses in logs
3. Notify affected users
4. Consider temporary IP blocking
5. Enable 2FA for affected accounts

#### **Symptom: Unusual traffic patterns**
**Action**:
1. Check analytics for source
2. Verify it's not DDoS attack
3. Enable Cloudflare protection if needed
4. Rate limit suspicious IPs
5. Monitor for data exfiltration

---

## 📝 Launch Day Checklist Summary

### Pre-Launch (Day Before)
- [ ] Code freeze announced
- [ ] All tests passing
- [ ] Pre-launch audit complete (score ≥85)
- [ ] Team briefed
- [ ] Monitoring configured
- [ ] Backups created
- [ ] Go/no-go meeting scheduled

### Launch Day (H-Hour)
- [ ] Go/no-go decision made
- [ ] Launch script executed
- [ ] Smoke tests passed
- [ ] Monitoring activated
- [ ] Team notifications sent
- [ ] Customer announcement sent

### Post-Launch (First 24h)
- [ ] Hourly health checks
- [ ] Error monitoring active
- [ ] User feedback collected
- [ ] Issues documented
- [ ] Daily report generated

### Stabilization (Day 2-3)
- [ ] 3x daily monitoring
- [ ] Performance optimization
- [ ] Bug fixes deployed
- [ ] User feedback addressed
- [ ] Team retrospective scheduled

---

## 🚀 Launch Success Criteria

**Platform is considered successfully launched when**:
- ✅ Uptime > 99% for 72 hours
- ✅ Error rate < 2% sustained
- ✅ Response time < 1s average
- ✅ No critical issues for 48 hours
- ✅ Orders processing normally
- ✅ Customer satisfaction > 90%
- ✅ Team confident in system stability

**Congratulations! You're ready to launch! 🎉**

---

*Last updated: 2026-01-10*  
*Version: 1.0*  
*Maintained by: Technical Team*
