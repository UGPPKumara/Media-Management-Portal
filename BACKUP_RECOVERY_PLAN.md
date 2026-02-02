# Backup & Recovery Plan
## Media Management Portal

---

| **Document Info** | |
|-------------------|-----------------|
| **Version** | 1.0 |
| **Date** | 2026-02-02 |
| **Classification** | Internal |
| **Owner** | IT Operations Team |

---

## 1. Purpose

This document defines the backup and disaster recovery procedures for the Media Management Portal to ensure business continuity and data protection.

---

## 2. Backup Strategy Overview

### 2.1 Backup Objectives

| Objective | Target |
|-----------|--------|
| **Recovery Point Objective (RPO)** | 6 hours maximum data loss |
| **Recovery Time Objective (RTO)** | 4 hours to full recovery |
| **Backup Retention** | 30 days |
| **Offsite Replication** | Daily |

### 2.2 Data Classification

| Data Type | Criticality | Backup Frequency |
|-----------|-------------|------------------|
| Database (users, posts) | Critical | Every 6 hours |
| Uploaded Media Files | High | Daily |
| Application Code | Medium | On deployment |
| Configuration Files | High | Weekly |
| System Logs | Low | Daily (7-day retention) |

---

## 3. Backup Schedule

### 3.1 Database Backups

| Backup Type | Frequency | Time | Retention |
|-------------|-----------|------|-----------|
| Full Backup | Daily | 02:00 AM | 30 days |
| Incremental | Every 6 hours | 08:00, 14:00, 20:00 | 7 days |
| Transaction Log | Hourly | XX:00 | 24 hours |

### 3.2 File System Backups

| Content | Frequency | Time | Retention |
|---------|-----------|------|-----------|
| /uploads (media) | Daily | 03:00 AM | 30 days |
| /uploads/profiles | Daily | 03:00 AM | 30 days |
| /uploads/company | Weekly | 03:00 AM Sunday | 90 days |

### 3.3 Configuration Backups

| Content | Frequency | Retention |
|---------|-----------|-----------|
| .env files | Weekly | 90 days |
| Nginx config | On change | 90 days |
| PM2 ecosystem | On change | 90 days |

---

## 4. Backup Procedures

### 4.1 Database Backup Script

```bash
#!/bin/bash
# /scripts/backup-database.sh

# Configuration
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="media_portal"
DB_USER="backup_user"
DB_PASS="${DB_BACKUP_PASSWORD}"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Full backup
mysqldump -u $DB_USER -p$DB_PASS \
    --single-transaction \
    --routines \
    --triggers \
    $DB_NAME > $BACKUP_DIR/db_full_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_full_$DATE.sql

# Verify backup
if [ -f "$BACKUP_DIR/db_full_$DATE.sql.gz" ]; then
    echo "[$(date)] Database backup successful: db_full_$DATE.sql.gz"
else
    echo "[$(date)] ERROR: Database backup failed!"
    exit 1
fi

# Delete old backups (older than 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to offsite storage (optional)
# aws s3 cp $BACKUP_DIR/db_full_$DATE.sql.gz s3://your-bucket/backups/
```

### 4.2 Media Files Backup Script

```bash
#!/bin/bash
# /scripts/backup-media.sh

# Configuration
SOURCE_DIR="/var/www/media-portal/backend/uploads"
BACKUP_DIR="/backups/media"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Incremental backup using rsync
rsync -avz --delete \
    $SOURCE_DIR/ \
    $BACKUP_DIR/latest/

# Create dated archive weekly
if [ $(date +%u) -eq 7 ]; then
    tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C $BACKUP_DIR latest/
    
    # Delete archives older than 30 days
    find $BACKUP_DIR -name "media_*.tar.gz" -mtime +30 -delete
fi

echo "[$(date)] Media backup completed"
```

### 4.3 Cron Jobs Setup

```bash
# Edit crontab: crontab -e

# Database full backup - daily at 2 AM
0 2 * * * /scripts/backup-database.sh >> /var/log/backup-db.log 2>&1

# Database incremental - every 6 hours
0 8,14,20 * * * /scripts/backup-database-incremental.sh >> /var/log/backup-db.log 2>&1

# Media backup - daily at 3 AM
0 3 * * * /scripts/backup-media.sh >> /var/log/backup-media.log 2>&1

# Config backup - weekly on Sunday at 4 AM
0 4 * * 0 /scripts/backup-config.sh >> /var/log/backup-config.log 2>&1

# Upload to offsite - daily at 5 AM
0 5 * * * /scripts/sync-offsite.sh >> /var/log/backup-offsite.log 2>&1
```

---

## 5. Backup Storage

### 5.1 Storage Locations

| Location | Type | Purpose |
|----------|------|---------|
| `/backups/` | Local disk | Primary backup storage |
| Cloud Storage | S3/GCS/Azure | Offsite replication |
| External NAS | Network | Secondary local storage |

### 5.2 Storage Requirements

| Data Type | Current Size | Growth/Month | 30-Day Storage |
|-----------|--------------|--------------|----------------|
| Database | 500 MB | 100 MB | 3 GB |
| Media Files | 10 GB | 2 GB | 70 GB |
| Logs | 100 MB | 200 MB | 300 MB |
| **Total** | **~11 GB** | **~2.3 GB** | **~75 GB** |

### 5.3 Encryption

| Stage | Encryption |
|-------|------------|
| At Rest | AES-256 |
| In Transit | TLS 1.2+ |
| Offsite | Server-side encryption |

---

## 6. Recovery Procedures

### 6.1 Database Recovery

#### Full Recovery

```bash
#!/bin/bash
# Restore database from full backup

# Stop application
pm2 stop media-portal-api

# Identify latest backup
BACKUP_FILE=$(ls -t /backups/database/db_full_*.sql.gz | head -1)

# Decompress
gunzip -c $BACKUP_FILE > /tmp/restore.sql

# Restore
mysql -u root -p media_portal < /tmp/restore.sql

# Verify
mysql -u root -p -e "SELECT COUNT(*) FROM media_portal.users;"

# Restart application
pm2 start media-portal-api

# Cleanup
rm /tmp/restore.sql
```

#### Point-in-Time Recovery

```bash
# Restore full backup
mysql -u root -p media_portal < /tmp/db_full_backup.sql

# Apply transaction logs up to specific time
mysqlbinlog --stop-datetime="2026-02-02 15:00:00" \
    /var/log/mysql/binlog.* | mysql -u root -p media_portal
```

### 6.2 Media Files Recovery

```bash
#!/bin/bash
# Restore media files

# Option 1: From latest rsync mirror
rsync -avz /backups/media/latest/ /var/www/media-portal/backend/uploads/

# Option 2: From dated archive
tar -xzf /backups/media/media_20260202.tar.gz -C /tmp/
rsync -avz /tmp/latest/ /var/www/media-portal/backend/uploads/

# Fix permissions
chown -R www-data:www-data /var/www/media-portal/backend/uploads/
chmod -R 755 /var/www/media-portal/backend/uploads/
```

### 6.3 Configuration Recovery

```bash
#!/bin/bash
# Restore configuration files

# Restore .env
cp /backups/config/.env /var/www/media-portal/backend/

# Restore Nginx
cp /backups/config/nginx/media-portal /etc/nginx/sites-available/
nginx -t && systemctl restart nginx

# Restore PM2 ecosystem
cp /backups/config/ecosystem.config.js /var/www/media-portal/
pm2 restart ecosystem.config.js
```

---

## 7. Disaster Recovery

### 7.1 Disaster Scenarios

| Scenario | RTO | Procedure |
|----------|-----|-----------|
| Database corruption | 2 hours | Restore from backup |
| Server failure | 4 hours | Deploy to new server |
| Data center outage | 4 hours | Failover to DR site |
| Ransomware attack | 4-8 hours | Clean restore from backup |
| Accidental deletion | 1 hour | Restore specific data |

### 7.2 Complete System Recovery

| Step | Action | Duration |
|------|--------|----------|
| 1 | Provision new server | 30 min |
| 2 | Install dependencies | 15 min |
| 3 | Deploy application code | 15 min |
| 4 | Restore database | 30 min |
| 5 | Restore media files | 60 min |
| 6 | Configure and test | 30 min |
| 7 | DNS failover | 15 min |
| **Total** | | **~3 hours** |

### 7.3 Recovery Verification

| Check | Command/Action |
|-------|----------------|
| Application running | `pm2 status` |
| Database connected | API health check |
| Users can login | Test login |
| Media accessible | View uploaded files |
| API functional | Run test suite |

---

## 8. Backup Verification

### 8.1 Verification Schedule

| Test | Frequency | Method |
|------|-----------|--------|
| Backup file integrity | Daily | Checksum verification |
| Restore test (non-prod) | Weekly | Automated restore |
| Full DR drill | Quarterly | Complete recovery |

### 8.2 Verification Script

```bash
#!/bin/bash
# /scripts/verify-backup.sh

# Verify database backup
LATEST_DB=$(ls -t /backups/database/db_full_*.sql.gz | head -1)
gzip -t $LATEST_DB
if [ $? -eq 0 ]; then
    echo "Database backup integrity: OK"
else
    echo "ERROR: Database backup corrupted!"
    # Send alert
fi

# Verify media backup
LATEST_MEDIA="/backups/media/latest"
EXPECTED_FILES=$(find /var/www/media-portal/backend/uploads -type f | wc -l)
BACKED_UP_FILES=$(find $LATEST_MEDIA -type f | wc -l)

if [ $EXPECTED_FILES -eq $BACKED_UP_FILES ]; then
    echo "Media backup count: OK ($BACKED_UP_FILES files)"
else
    echo "WARNING: File count mismatch!"
fi
```

---

## 9. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| **System Administrator** | Execute daily backup verification |
| **DBA** | Database backup management |
| **DevOps Lead** | DR planning and testing |
| **IT Manager** | Approve DR procedures |
| **On-call Engineer** | Emergency recovery execution |

---

## 10. Contact & Escalation

| Situation | Contact | Phone |
|-----------|---------|-------|
| Backup failure | On-call Engineer | +XX XXX XXX XXXX |
| Data loss < 24h | System Admin | +XX XXX XXX XXXX |
| Major disaster | IT Manager | +XX XXX XXX XXXX |
| Vendor support | [Hosting Provider] | [Support Line] |

---

## 11. Document Maintenance

| Review | Frequency |
|--------|-----------|
| Procedure review | Quarterly |
| DR drill | Quarterly |
| Contact info update | Monthly |
| Full document review | Annually |

---

**© 2026 Media Management Portal. All Rights Reserved.**
