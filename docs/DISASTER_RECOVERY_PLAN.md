# Disaster Recovery Plan (DRP)
**Platform**: sanduta.art  
**Version**: 1.0.0  
**Last Updated**: 11 Ianuarie 2026

---

## 📋 Overview

Acest document descrie procedurile complete de recuperare în caz de dezastru pentru platforma sanduta.art. Scopul este minimizarea downtime-ului și pierderii de date în orice scenariu.

---

## 🎯 Recovery Objectives

### RTO (Recovery Time Objective)
Timpul maxim acceptabil pentru restabilirea sistemului:

| Scenariu | RTO Target | Priority |
|----------|------------|----------|
| Database corruption | **2 ore** | CRITICAL |
| File loss | **4 ore** | HIGH |
| Full system failure | **6 ore** | HIGH |
| Configuration loss | **1 oră** | MEDIUM |
| Ransomware attack | **12 ore** | CRITICAL |

### RPO (Recovery Point Objective)
Pierderea maximă acceptabilă de date:

| Type | RPO Target | Backup Frequency |
|------|------------|------------------|
| Database | **15 minute** | Incremental: 15 min |
| Files | **1 oră** | Hourly snapshots |
| Configurations | **24 ore** | Daily |
| Logs | **1 oră** | Real-time replication |

---

## 🚨 Disaster Scenarios

### Scenario 1: Database Corruption

**Symptoms:**
- Application errors referencing database
- Data inconsistencies
- Unable to connect to database
- Corrupted query results

**Immediate Actions:**
1. **Stop** application immediately (prevent further corruption)
   ```bash
   pm2 stop sanduta-app
   # or
   systemctl stop sanduta
   ```

2. **Verify** backup availability
   ```bash
   cd /backups/daily
   ls -lh | head -5
   ```

3. **Create** emergency dump (if possible)
   ```bash
   pg_dump sanduta > /tmp/emergency_dump.sql
   ```

**Recovery Steps:**

```bash
# 1. Identify latest valid backup
cd /backspaces/sanduta.art
npm run backup:list

# 2. Test restore (dry run)
npm run backup:test-restore -- --backup-id=<backup_id>

# 3. Execute restore
npm run backup:restore -- --mode=database --backup-id=<backup_id>

# 4. Verify database integrity
npm run backup:verify-db

# 5. Restart application
pm2 start sanduta-app
npm run health:check
```

**Estimated Recovery Time:** 1-2 hours  
**Data Loss:** Maximum 15 minutes (last incremental backup)

---

### Scenario 2: Ransomware Attack

**Symptoms:**
- Files encrypted with .locked/.encrypted extension
- Ransom note files present
- Unable to access files
- Database encrypted

**Immediate Actions:**

1. **DISCONNECT** from network immediately
   ```bash
   # Disconnect server from network
   ifconfig eth0 down
   # OR pull network cable
   ```

2. **STOP** all services
   ```bash
   systemctl stop nginx
   systemctl stop sanduta
   pm2 kill
   ```

3. **ISOLATE** infected server
   - Do NOT turn off (preserves forensic data)
   - Block at firewall level
   - Prevent spread to backups

4. **NOTIFY** authorities and security team
   - Document attack timeline
   - Preserve logs
   - Contact cybersecurity consultant

**Recovery Steps:**

```bash
# 1. Provision NEW clean server
# - Do NOT use infected server
# - Use fresh OS install

# 2. Restore from PRE-ATTACK backup
# - Identify backup BEFORE attack
# - Usually 24-48h old backup

npm run backup:list -- --before-date=<attack_date>

# 3. Restore to new server
npm run backup:restore:full -- --backup-id=<pre_attack_id> --target=<new_server>

# 4. Scan restored data for malware
clamscan -r /var/www/sanduta.art

# 5. Update ALL credentials
npm run security:rotate-credentials

# 6. Implement additional security
npm run security:harden

# 7. Monitor for 48h before going live
npm run monitoring:enable --mode=paranoid
```

**Estimated Recovery Time:** 8-12 hours  
**Data Loss:** 24-48 hours (pre-attack backup)  
**Post-Recovery:** Full security audit required

---

### Scenario 3: Complete File Loss

**Symptoms:**
- Uploads directory empty/missing
- Media files not loading
- Product images 404
- Editor files missing

**Immediate Actions:**

1. **Verify** scope of loss
   ```bash
   ls -la /var/www/sanduta.art/public/uploads
   ls -la /var/www/sanduta.art/storage
   ```

2. **Check** if files deleted or permission issue
   ```bash
   # Check recent deletions
   find /var/www/sanduta.art -name "*.jpg" -mtime -1
   
   # Check permissions
   ls -la /var/www/sanduta.art/public/
   ```

**Recovery Steps:**

```bash
# 1. List available file backups
npm run backup:list -- --category=FILES

# 2. Restore files only
npm run backup:restore -- --mode=files --backup-id=<backup_id>

# 3. Fix permissions
chown -R www-data:www-data /var/www/sanduta.art/public/uploads
chmod -R 755 /var/www/sanduta.art/public/uploads

# 4. Verify files restored
npm run files:verify

# 5. Clear CDN cache (if using)
npm run cdn:purge

# 6. Test file access
curl -I https://sanduta.art/uploads/test-image.jpg
```

**Estimated Recovery Time:** 2-4 hours  
**Data Loss:** Maximum 1 hour (last file backup)

---

### Scenario 4: Provider Downtime

**Symptoms:**
- Server unreachable
- DNS not resolving
- Complete service unavailability
- Provider status page shows outage

**Immediate Actions:**

1. **Verify** provider status
   - Check provider status page
   - Check social media
   - Contact support

2. **Activate** failover (if configured)
   ```bash
   # Switch DNS to backup provider
   # Update CloudFlare/DNS settings
   ```

3. **Communicate** with users
   - Update status page
   - Social media announcement
   - Email notification to critical users

**Recovery Steps:**

```bash
# IF FAILOVER AVAILABLE:

# 1. Spin up server on alternate provider
terraform apply -var="provider=backup"

# 2. Restore latest backup
npm run backup:restore:full -- --backup-id=latest --target=<backup_server>

# 3. Update DNS
# Point domain to new IP

# 4. Verify functionality
npm run health:check -- --url=<backup_url>

# 5. Monitor until primary recovered
npm run monitoring:enable

# IF NO FAILOVER:

# Wait for provider recovery
# Communicate ETAs to users
# Prepare compensation/credits if applicable
```

**Estimated Recovery Time:** 4-8 hours (with failover), 24+ hours (without)  
**Data Loss:** Depends on last successful backup to alternate location

---

### Scenario 5: Configuration Loss

**Symptoms:**
- Application using default settings
- Theme customizations missing
- API integrations not working
- Email not sending

**Immediate Actions:**

1. **Check** what configurations are missing
   ```bash
   # Check environment variables
   printenv | grep -i "sanduta\|database\|api"
   
   # Check config files
   ls -la /var/www/sanduta.art/.env
   ```

2. **Verify** database settings table exists
   ```sql
   SELECT * FROM settings LIMIT 5;
   ```

**Recovery Steps:**

```bash
# 1. List config backups
npm run backup:list -- --category=CONFIG

# 2. Restore config only
npm run backup:restore -- --mode=config --backup-id=<backup_id>

# 3. Restart application
pm2 restart sanduta-app

# 4. Verify settings applied
npm run config:verify

# 5. Test critical features
npm run test:integration
```

**Estimated Recovery Time:** 30 minutes - 1 hour  
**Data Loss:** Maximum 24 hours (last config backup)

---

## 👥 Roles & Responsibilities

### Incident Commander
**Role:** Overall coordination and decision making  
**Contact:** Owner / CTO  
**Responsibilities:**
- Declare disaster state
- Coordinate recovery teams
- Communication with stakeholders
- Final approval for production deployment

### Database Administrator
**Role:** Database recovery  
**Contact:** DevOps Lead  
**Responsibilities:**
- Database backup/restore
- Data integrity verification
- Performance optimization post-recovery

### System Administrator
**Role:** Infrastructure recovery  
**Contact:** System Admin  
**Responsibilities:**
- Server provisioning
- File system recovery
- Network configuration
- Security hardening

### Application Developer
**Role:** Application recovery  
**Contact:** Lead Developer  
**Responsibilities:**
- Application deployment
- Configuration restoration
- Feature testing
- Bug fixes

### Security Officer
**Role:** Security assessment  
**Contact:** Security Lead  
**Responsibilities:**
- Incident forensics
- Security vulnerability assessment
- Credential rotation
- Access control restoration

---

## 📞 Emergency Contacts

### Internal Team
| Role | Name | Primary | Secondary |
|------|------|---------|-----------|
| Incident Commander | [Name] | +40-XXX-XXX-XXX | email@sanduta.art |
| Database Admin | [Name] | +40-XXX-XXX-XXX | email@sanduta.art |
| System Admin | [Name] | +40-XXX-XXX-XXX | email@sanduta.art |
| Developer Lead | [Name] | +40-XXX-XXX-XXX | email@sanduta.art |

### External Vendors
| Provider | Service | Support | SLA |
|----------|---------|---------|-----|
| Vercel | Hosting | support@vercel.com | 24h response |
| AWS | Storage | AWS Support Console | 1h response (Business) |
| Cloudflare | CDN/DNS | support@cloudflare.com | 2h response (Pro) |
| Upstash | Redis/Queue | support@upstash.com | 24h response |

---

## 🔄 Recovery Workflow

### Phase 1: Assessment (15-30 minutes)
1. Identify disaster type
2. Assess scope and impact
3. Determine RTO/RPO requirements
4. Assemble recovery team
5. Declare disaster state

### Phase 2: Containment (30-60 minutes)
1. Stop affected services
2. Prevent further damage
3. Isolate affected systems
4. Secure data/logs
5. Begin forensics (if attack)

### Phase 3: Recovery (2-8 hours)
1. Identify recovery point
2. Provision resources (if needed)
3. Execute restore procedures
4. Verify data integrity
5. Test functionality

### Phase 4: Validation (1-2 hours)
1. Run test suite
2. Verify critical features
3. Check data consistency
4. Performance testing
5. Security scan

### Phase 5: Production (30 minutes)
1. Update DNS (if needed)
2. Enable monitoring
3. Gradual traffic ramp-up
4. User communication
5. Post-incident review scheduling

### Phase 6: Post-Mortem (1 week)
1. Document timeline
2. Root cause analysis
3. Identify improvements
4. Update DRP
5. Implement preventive measures

---

## 🧪 Testing Schedule

### Monthly Tests
- **Database Restore Test**: First Monday, 2 AM
- **File Restore Test**: Second Monday, 2 AM
- **Config Restore Test**: Third Monday, 2 AM

### Quarterly Tests
- **Full Restore Test**: First Sunday of Q1, Q2, Q3, Q4
- **Disaster Simulation**: Full team exercise
- **DRP Review**: Update procedures based on changes

### Annual Tests
- **Multi-Region Failover**: Test complete regional failure
- **Ransomware Simulation**: Test isolation and recovery
- **Provider Migration**: Test migration to alternate provider

---

## 📊 Success Metrics

### Recovery Metrics
- **Mean Time To Detect (MTTD)**: < 5 minutes
- **Mean Time To Respond (MTTR)**: < 15 minutes
- **Mean Time To Recovery (MTTR)**: Per RTO targets
- **Data Loss**: Per RPO targets

### Backup Metrics
- **Backup Success Rate**: > 99.9%
- **Backup Completion Time**: < 30 minutes
- **Restore Success Rate**: > 99%
- **Integrity Check Pass Rate**: 100%

---

## 🔐 Security Considerations

### During Recovery
- Change ALL passwords/API keys
- Verify no backdoors installed
- Check audit logs for suspicious activity
- Enable enhanced monitoring
- Restrict access during recovery

### Post-Recovery
- Security audit
- Penetration testing
- Update security policies
- Staff security training
- Implement additional controls

---

## 📚 Related Documents
- Backup System Documentation: `/docs/BACKUP_SYSTEM.md`
- Security Policy: `/docs/SECURITY_SYSTEM.md`
- Runbook: `/docs/OPERATIONS_RUNBOOK.md`
- Incident Response: `/docs/INCIDENT_RESPONSE.md`

---

## ✅ Checklist

### Pre-Disaster Preparation
- [ ] Backup system operational
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Team trained
- [ ] Contacts updated
- [ ] External vendors documented
- [ ] Recovery procedures tested

### During Disaster
- [ ] Incident declared
- [ ] Team assembled
- [ ] Scope assessed
- [ ] Containment actions taken
- [ ] Recovery initiated
- [ ] Stakeholders notified

### Post-Disaster
- [ ] System recovered
- [ ] Functionality verified
- [ ] Users notified
- [ ] Post-mortem scheduled
- [ ] DRP updated
- [ ] Preventive measures implemented

---

**Review Cycle**: This DRP should be reviewed quarterly and updated after any:
- Infrastructure changes
- New services added
- Disaster events (real or simulated)
- Regulatory changes
- Technology updates

**Document Owner**: CTO / DevOps Lead  
**Last Tested**: [Date of last full DR test]  
**Next Test**: [Date of next scheduled test]
