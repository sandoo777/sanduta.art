# Backup & Disaster Recovery System
## Complete Documentation

**Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backup Types](#backup-types)
4. [Storage Strategy](#storage-strategy)
5. [Versioning & Retention](#versioning--retention)
6. [Restore Procedures](#restore-procedures)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Security](#security)
9. [Testing](#testing)
10. [CLI Usage](#cli-usage)
11. [API Reference](#api-reference)
12. [Dashboard](#dashboard)

---

## 🎯 Overview

The Backup & Disaster Recovery system provides comprehensive data protection for the sanduta.art platform with:

- **Automated backups** every 15 minutes (incremental) + daily (full)
- **Multi-tier storage** with cross-region replication
- **Point-in-time recovery** to any 15-minute interval
- **Granular restore** options (full, partial, or specific items)
- **Encrypted backups** with AES-256
- **Automated testing** monthly for reliability
- **Real-time monitoring** with Slack/Email alerts

### Key Metrics

| Metric | Value |
|--------|-------|
| **RTO** (Recovery Time Objective) | 2-4 hours |
| **RPO** (Recovery Point Objective) | 15 minutes |
| **Backup Frequency** | Every 15 minutes |
| **Retention Period** | 90 days |
| **Encryption** | AES-256 |
| **Compression Ratio** | ~70% |
| **Storage Redundancy** | 3x (primary + 2 replicas) |

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Backup System                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Backup     │  │   Restore    │  │  Monitoring  │  │
│  │   Engine     │  │   Engine     │  │   Engine     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                            │                             │
│                  ┌─────────┴─────────┐                   │
│                  │  Version Manager  │                   │
│                  └─────────┬─────────┘                   │
│                            │                             │
│         ┌──────────────────┼──────────────────┐          │
│         │                  │                  │          │
│    ┌────▼────┐      ┌─────▼──────┐    ┌─────▼────┐     │
│    │Database │      │   Files    │    │  Config  │     │
│    │ Backup  │      │   Backup   │    │  Backup  │     │
│    └────┬────┘      └─────┬──────┘    └─────┬────┘     │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                            │                             │
│                  ┌─────────▼─────────┐                   │
│                  │  Storage Layer    │                   │
│                  │  (S3/GCS/Azure)   │                   │
│                  └───────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Backup Trigger → Backup Engine
    │
    ├─→ Database Dump → Compress → Encrypt → Upload
    ├─→ File Snapshot → Compress → Encrypt → Upload
    └─→ Config Export → Compress → Encrypt → Upload
                                      │
                                      ▼
                            Storage (Multi-Region)
                                      │
                                      ▼
                            Monitoring & Verification
```

---

## 💾 Backup Types

### 1. Database Backup

**What's included**:
- All tables and data
- Schema and indexes
- Sequences and views
- Stored procedures
- User permissions

**Frequency**:
- Full: Daily at 2 AM UTC
- Incremental: Every 15 minutes

**Size**: ~50-500 MB compressed

**Method**:
```bash
npm run backup:create -- --type database
```

### 2. Files Backup

**What's included**:
- Editor projects
- Uploaded media
- Product images
- PDF invoices
- User avatars
- CMS attachments

**Frequency**:
- Full: Weekly
- Incremental: Every 15 minutes

**Size**: ~1-10 GB compressed

**Method**:
```bash
npm run backup:create -- --type files
```

### 3. Configuration Backup

**What's included**:
- Theme settings
- CMS pages
- Blog posts
- SEO settings
- Marketing campaigns
- Roles & permissions
- Integration configs
- Notification templates

**Frequency**:
- On every change
- Full: Daily

**Size**: ~1-5 MB

**Method**:
```bash
npm run backup:create -- --type configuration
```

### 4. Full System Backup

**What's included**:
- Database + Files + Configuration
- Application settings
- Environment variables (encrypted)

**Frequency**:
- Daily at 2 AM UTC

**Size**: ~2-15 GB compressed

**Method**:
```bash
npm run backup:create -- --type full
```

---

## 🗄️ Storage Strategy

### Primary Storage

**Provider**: AWS S3 / Google Cloud Storage / Azure Blob  
**Region**: eu-central-1 (Frankfurt)  
**Redundancy**: 3x (cross-availability zones)  
**Access**: Private, encrypted

### Secondary Storage

**Provider**: Different provider than primary  
**Region**: us-east-1 (Virginia)  
**Purpose**: Disaster recovery, geographic redundancy

### Storage Structure

```
backups/
├── database/
│   ├── daily/
│   │   ├── 2026-01-11/
│   │   │   ├── full-02-00.sql.gz.enc
│   │   │   └── metadata.json
│   │   └── 2026-01-10/
│   ├── incremental/
│   │   └── 2026-01-11/
│   │       ├── incr-08-15.sql.gz.enc
│   │       ├── incr-08-30.sql.gz.enc
│   │       └── ...
│   └── weekly/
├── files/
│   ├── daily/
│   ├── incremental/
│   └── weekly/
├── configuration/
│   └── snapshots/
└── full/
    ├── daily/
    └── manual/
```

### Retention Policy

| Backup Type | Retention Period | Reason |
|-------------|------------------|--------|
| Incremental | 7 days | Short-term recovery |
| Daily | 30 days | Standard recovery |
| Weekly | 12 weeks | Medium-term recovery |
| Monthly | 12 months | Long-term recovery |
| Manual | Permanent | Critical milestones |

### Storage Costs (Estimated)

| Component | Size | Cost/Month |
|-----------|------|------------|
| Database backups | ~50 GB | $1-2 |
| File backups | ~200 GB | $5-10 |
| Configuration | ~5 GB | $0.10 |
| Replication | 2x | +100% |
| **Total** | ~510 GB | **$12-24** |

---

## 🔄 Versioning & Retention

### Version Management

Each backup has:
- **Unique ID**: UUID v4
- **Timestamp**: ISO 8601 format
- **Type**: database/files/configuration/full
- **Size**: Bytes (compressed + encrypted)
- **Status**: pending/completed/failed
- **Checksum**: SHA-256 hash
- **Parent**: Previous version (for incrementals)

### Metadata Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "database",
  "category": "daily",
  "timestamp": "2026-01-11T02:00:00Z",
  "size": 52428800,
  "compressed_size": 15728640,
  "encrypted": true,
  "checksum": "sha256:abc123...",
  "parent_id": "440e8400-e29b-41d4-a716-446655440001",
  "storage_path": "s3://backups/database/daily/2026-01-11/",
  "status": "completed",
  "created_by": "system",
  "tags": ["auto", "production"]
}
```

### Automatic Cleanup

Old backups are automatically deleted based on retention policy:

```bash
# Runs daily at 3 AM UTC
npm run backup:cleanup
```

**Cleanup Logic**:
- Incremental > 7 days → Delete
- Daily > 30 days → Delete
- Weekly > 12 weeks → Delete
- Monthly > 12 months → Archive to cold storage
- Manual → Never delete (requires manual action)

---

## 🔧 Restore Procedures

### Restore Modes

#### 1. Full Restore

Restores everything: database + files + configuration

```bash
npm run backup:restore -- \
  --type full \
  --backup-id <id> \
  --target production
```

**Use Case**: Complete system recovery after disaster  
**Duration**: 2-4 hours  
**Downtime**: Yes (maintenance mode)

#### 2. Database Only Restore

Restores only database

```bash
npm run backup:restore -- \
  --type database \
  --backup-id <id> \
  --target production
```

**Use Case**: Database corruption or data loss  
**Duration**: 30-60 minutes  
**Downtime**: Yes (brief)

#### 3. Files Only Restore

Restores only files

```bash
npm run backup:restore -- \
  --type files \
  --backup-id <id> \
  --target production
```

**Use Case**: File storage loss  
**Duration**: 1-2 hours  
**Downtime**: Partial (file uploads disabled)

#### 4. Granular Restore

Restores specific items

```bash
npm run backup:restore -- \
  --type granular \
  --backup-id <id> \
  --item "products:product-123" \
  --target production
```

**Use Case**: Single item recovery  
**Duration**: 5-10 minutes  
**Downtime**: No

#### 5. Point-in-Time Restore

Restores to specific timestamp

```bash
npm run backup:restore -- \
  --type database \
  --timestamp "2026-01-11T10:30:00Z" \
  --target production
```

**Use Case**: Undo recent changes  
**Duration**: 30-60 minutes  
**Downtime**: Yes

### Restore Workflow

```
1. Select Backup
   └─→ Verify backup integrity
       └─→ Check dependencies
           └─→ Estimate restore time

2. Prepare System
   └─→ Enable maintenance mode
       └─→ Stop write operations
           └─→ Create pre-restore snapshot

3. Execute Restore
   └─→ Download backup
       └─→ Decrypt & decompress
           └─→ Apply to system

4. Verification
   └─→ Run integrity checks
       └─→ Test critical functions
           └─→ Compare checksums

5. Finalize
   └─→ Disable maintenance mode
       └─→ Monitor for issues
           └─→ Send notifications
```

---

## 📊 Monitoring & Alerts

### Health Checks

**Automated Checks** (every hour):
- Backup completion status
- Storage space available
- Backup integrity
- Replication status
- Last successful backup time

```bash
npm run backup:health-check
```

### Alert Conditions

**Critical Alerts** (Slack + Email):
- Backup failed
- Storage >90% full
- Backup integrity check failed
- No successful backup in 24 hours
- Restore operation failed

**Warning Alerts** (Slack):
- Backup took >2x normal time
- Storage >75% full
- Replication lag >1 hour
- Checksum mismatch (auto-retry)

### Weekly Report

**Sent every Monday 9 AM**:
- Total backups created
- Storage usage trend
- Failed backups (if any)
- Restore tests performed
- Recommendations

Example:
```
📊 Backup Report (Jan 5-11, 2026)

✅ Backups Created: 672 (100% success)
   - Database: 336
   - Files: 168
   - Config: 168

💾 Storage Used: 245 GB / 500 GB (49%)
   - Growth: +12 GB this week

🔄 Restore Tests: 4 (all passed)

⚠️ Warnings: None

🎯 Recommendations:
   - Consider archiving backups >60 days
   - Storage usage normal
```

---

## 🔒 Security

### Encryption

**At Rest**:
- Algorithm: AES-256-GCM
- Key Management: AWS KMS / Google Cloud KMS
- Key Rotation: Every 90 days
- Key Storage: Encrypted, separate from data

**In Transit**:
- Protocol: TLS 1.3
- Certificate: Let's Encrypt (auto-renewal)

### Access Control

**Backup Access**:
- Role: ADMIN only
- 2FA: Required
- Audit Logging: All access logged

**Restore Operations**:
- Role: ADMIN + OWNER only
- Approval: 2-person rule for production
- Confirmation: Multiple confirmations required

### Audit Trail

All backup/restore operations logged:

```json
{
  "timestamp": "2026-01-11T10:30:00Z",
  "action": "backup:restore",
  "user": "admin@sanduta.art",
  "backup_id": "550e8400...",
  "target": "production",
  "status": "success",
  "duration": 1847,
  "ip": "203.0.113.1"
}
```

---

## 🧪 Testing

### Automated Tests

**Monthly** (1st of each month):
```bash
npm run backup:test-restore -- --type database
npm run backup:test-restore -- --type files
```

**Quarterly** (every 3 months):
```bash
npm run backup:test-restore -- --type full
```

### Test Checklist

- [ ] Database backup creates successfully
- [ ] Files backup creates successfully
- [ ] Backup is encrypted
- [ ] Backup is compressed
- [ ] Backup uploaded to storage
- [ ] Backup integrity verified
- [ ] Backup can be downloaded
- [ ] Backup can be decrypted
- [ ] Backup can be restored
- [ ] Restored data matches original
- [ ] Application works after restore
- [ ] Performance is acceptable

### Test Environment

All restore tests run in **isolated staging environment**:
- Separate database
- Separate file storage
- No impact on production
- Full logging enabled

---

## 💻 CLI Usage

### Create Backup

```bash
# Full backup
npm run backup:create -- --type full

# Database only
npm run backup:create -- --type database

# Files only
npm run backup:create -- --type files --category media

# Manual backup with description
npm run backup:create -- --type full --manual --description "Pre-deployment backup"
```

### List Backups

```bash
# List all backups
npm run backup:list

# Filter by type
npm run backup:list -- --type database --limit 10

# Filter by date
npm run backup:list -- --from 2026-01-01 --to 2026-01-11

# Show details
npm run backup:list -- --verbose
```

### Restore Backup

```bash
# Restore latest
npm run backup:restore -- --type database --latest

# Restore specific backup
npm run backup:restore -- --backup-id 550e8400-e29b-41d4-a716-446655440000

# Point-in-time restore
npm run backup:restore -- --timestamp "2026-01-11T10:30:00Z"

# Dry run (preview)
npm run backup:restore -- --backup-id <id> --dry-run
```

### Verify Backup

```bash
# Verify specific backup
npm run backup:verify -- --backup-id <id>

# Verify all recent backups
npm run backup:verify -- --last 24h

# Deep verification (restore to temp)
npm run backup:verify -- --backup-id <id> --deep
```

### Monitor Backups

```bash
# Health check
npm run backup:health-check

# Watch mode (real-time)
npm run backup:monitor -- --watch

# Generate report
npm run backup:report -- --format pdf --output ./report.pdf
```

---

## 🌐 API Reference

### GET /api/admin/backups

List all backups

**Query Parameters**:
- `type`: database|files|configuration|full
- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `from`: ISO date
- `to`: ISO date

**Response**:
```json
{
  "backups": [...],
  "total": 672,
  "page": 1,
  "limit": 20
}
```

### POST /api/admin/backups

Create new backup

**Body**:
```json
{
  "type": "database",
  "manual": true,
  "description": "Pre-deployment backup"
}
```

**Response**:
```json
{
  "id": "550e8400...",
  "status": "pending",
  "message": "Backup initiated"
}
```

### POST /api/admin/backups/restore

Restore backup

**Body**:
```json
{
  "backupId": "550e8400...",
  "target": "production",
  "dryRun": false
}
```

**Response**:
```json
{
  "restoreId": "660e8400...",
  "status": "in_progress",
  "estimatedDuration": 3600
}
```

### GET /api/admin/backups/health

Check backup system health

**Response**:
```json
{
  "status": "healthy",
  "lastBackup": "2026-01-11T10:30:00Z",
  "storageUsed": 245000000000,
  "storageAvailable": 255000000000,
  "replicationStatus": "synced"
}
```

---

## 🎛️ Dashboard

Access: `https://sanduta.art/admin/dashboard/backups`

**Features**:
- Visual backup timeline
- Storage usage chart
- Quick restore buttons
- Health status indicators
- Recent activity log
- Manual backup creation
- Backup download
- Scheduled tasks

**Screenshots**: See `/docs/screenshots/backup-dashboard/`

---

## 📞 Support

**Documentation**: `/docs/BACKUP_SYSTEM.md`  
**Disaster Recovery Plan**: `/src/modules/backup/DISASTER_RECOVERY_PLAN.md`  
**CLI Help**: `npm run backup:help`  
**Issues**: GitHub Issues

---

## ✅ Quick Start Checklist

- [ ] Review [Disaster Recovery Plan](./DISASTER_RECOVERY_PLAN.md)
- [ ] Configure storage credentials (AWS/GCS/Azure)
- [ ] Set up encryption keys (KMS)
- [ ] Configure alerts (Slack/Email)
- [ ] Test backup creation
- [ ] Test restore procedure
- [ ] Schedule automated tests
- [ ] Train team members
- [ ] Document custom procedures

---

**Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Maintained By**: DevOps Team
