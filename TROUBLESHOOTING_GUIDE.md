# Troubleshooting Guide
## Media Management Portal

---

| **Document Info** | |
|-------------------|-----------------|
| **Version** | 1.0 |
| **Date** | 2026-02-02 |
| **Audience** | Support Team / Users |

---

## 📖 Table of Contents

1. [Login Issues](#1-login-issues)
2. [Upload Problems](#2-upload-problems)
3. [Display Issues](#3-display-issues)
4. [Workflow Issues](#4-workflow-issues)
5. [Performance Issues](#5-performance-issues)
6. [Server Issues](#6-server-issues)
7. [Database Issues](#7-database-issues)
8. [Error Messages Reference](#8-error-messages-reference)

---

# 1. Login Issues

## Issue: Cannot Login - Invalid Credentials

### Symptoms
- Error message: "Invalid credentials"
- Login button doesn't work

### Possible Causes & Solutions

| Cause | Solution |
|-------|----------|
| Wrong password | Use "Forgot Password" to reset |
| Wrong email | Verify email address |
| Caps Lock on | Check keyboard |
| Copy/paste spaces | Type password manually |

### Steps to Resolve

1. Clear browser cookies
2. Try "Forgot Password" option
3. Contact admin for password reset

---

## Issue: Account Deactivated

### Symptoms
- Error: "Account is deactivated"
- Cannot login despite correct credentials

### Solution

1. Contact your administrator
2. Request account reactivation
3. Admin can enable account from User Management

---

## Issue: Session Expired

### Symptoms
- Logged out unexpectedly
- Error: "Unauthorized" or "Token expired"

### Possible Causes & Solutions

| Cause | Solution |
|-------|----------|
| Token expired (24h limit) | Login again |
| Multiple device login | Clear sessions, login fresh |
| Browser cleared cookies | Login again |

---

## Issue: Password Reset Email Not Received

### Symptoms
- Clicked "Forgot Password"
- No email received

### Solutions

1. Check spam/junk folder
2. Wait 5 minutes, try again
3. Verify correct email address
4. Contact admin if still not working

### Admin Check
```bash
# Check email logs
tail -100 /var/log/mail.log | grep media-portal
```

---

# 2. Upload Problems

## Issue: File Upload Fails

### Symptoms
- Upload hangs or fails
- Error message appears

### Diagnostic Checklist

| Check | How to Verify |
|-------|---------------|
| File size | Must be under 50MB |
| File type | Must be JPG, PNG, GIF, MP4, MOV, AVI |
| Internet | Test connection |
| Browser | Try different browser |

### Solutions by Error

| Error | Solution |
|-------|----------|
| "File too large" | Compress file to under 50MB |
| "Invalid file type" | Convert to supported format |
| "Upload failed" | Check internet, retry |
| Timeout | Try smaller file first |

---

## Issue: Upload Slow

### Symptoms
- Progress bar stuck
- Upload takes very long

### Solutions

1. Check internet speed (minimum 5 Mbps for videos)
2. Try smaller file
3. Compress video before upload
4. Avoid peak usage hours

### Video Compression Tips

```bash
# Using FFmpeg to reduce file size
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4
```

---

## Issue: Preview Not Showing

### Symptoms
- Uploaded file but no preview
- Black box or broken image

### Solutions

| File Type | Solution |
|-----------|----------|
| Image | Refresh page, check format |
| Video | Wait for processing, try different browser |

### Browser Compatibility

| Browser | Image | Video |
|---------|:-----:|:-----:|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ⚠️ (some formats) |
| Edge | ✅ | ✅ |

---

# 3. Display Issues

## Issue: Page Not Loading

### Symptoms
- Blank page
- Infinite loading

### Solutions

1. Hard refresh: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Try incognito mode
4. Disable browser extensions
5. Try different browser

---

## Issue: Layout Broken

### Symptoms
- Elements overlapping
- Content misaligned

### Solutions

1. Zoom to 100%: `Ctrl + 0`
2. Clear cache and refresh
3. Check minimum resolution (1280x720)
4. Update browser

---

## Issue: Images Not Loading

### Symptoms
- Broken image icons
- Placeholder images

### Admin Solutions

```bash
# Check uploads folder permissions
ls -la /var/www/media-portal/backend/uploads/

# Fix permissions if needed
chmod -R 755 /var/www/media-portal/backend/uploads/
chown -R www-data:www-data /var/www/media-portal/backend/uploads/
```

---

# 4. Workflow Issues

## Issue: Cannot Edit Post

### Symptoms
- Edit button missing
- Edit form read-only

### Cause & Solution

| Post Status | Can Edit? | Solution |
|-------------|-----------|----------|
| DRAFT | ✅ Yes | Should work |
| PENDING | ❌ No | Wait for review |
| APPROVED | ❌ No | Cannot edit after approval |
| REJECTED | ✅ Yes | Should work |
| PUBLISHED | ❌ No | Cannot edit published |

---

## Issue: Post Stuck in Pending

### Symptoms
- Submitted but no response
- Status stays "Pending"

### User Solutions

1. Check with your manager
2. Verify post was submitted (not draft)

### Admin Solutions

1. Check if managers are active
2. Review post in database:

```sql
SELECT id, title, status, created_at 
FROM posts 
WHERE status = 'PENDING' 
ORDER BY created_at;
```

---

## Issue: Rejection Reason Not Visible

### Symptoms
- Post rejected but no reason shown

### Solutions

1. Click on the post to view details
2. Check "rejection_reason" field

### Database Check

```sql
SELECT id, title, status, rejection_reason 
FROM posts 
WHERE status = 'REJECTED';
```

---

# 5. Performance Issues

## Issue: Slow Page Load

### Symptoms
- Pages take > 3 seconds to load
- General sluggishness

### Client-Side Solutions

1. Clear browser cache
2. Check internet speed
3. Close unnecessary tabs
4. Disable heavy extensions

### Server-Side Checks

```bash
# Check server load
htop

# Check PM2 processes
pm2 status
pm2 logs media-portal-api --lines 50

# Check database connections
mysqladmin -u root -p status
```

---

## Issue: API Timeouts

### Symptoms
- "Request timed out" errors
- Actions not completing

### Solutions

```bash
# Check API health
curl -I https://api.yourdomain.com

# Restart backend
pm2 restart media-portal-api

# Check database connections
pm2 logs media-portal-api --lines 100 | grep -i error
```

---

## Issue: High Memory Usage

### Symptoms
- Server becoming slow
- Out of memory errors

### Solutions

```bash
# Check memory
free -h

# Check PM2 memory
pm2 monit

# Restart to free memory
pm2 restart all

# Clear old logs
pm2 flush
```

---

# 6. Server Issues

## Issue: Backend Not Running

### Symptoms
- "Cannot connect to server"
- API errors

### Diagnosis

```bash
# Check if process is running
pm2 status

# Check if port is listening
netstat -tlnp | grep 5000
```

### Solutions

```bash
# Start backend
cd /var/www/media-portal/backend
pm2 start server.js --name media-portal-api

# If port in use
lsof -i :5000
kill -9 <PID>
pm2 start server.js --name media-portal-api
```

---

## Issue: 502 Bad Gateway

### Symptoms
- Nginx shows 502 error
- Site not loading

### Cause & Solutions

| Cause | Solution |
|-------|----------|
| Backend crashed | `pm2 restart media-portal-api` |
| Port mismatch | Check Nginx config |
| PM2 not running | `pm2 resurrect` |

### Check Nginx

```bash
# Check Nginx config
nginx -t

# Check Nginx logs
tail -50 /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

---

## Issue: 503 Service Unavailable

### Symptoms
- Site shows "Service Unavailable"

### Solutions

1. Check if backend is running
2. Check server resources
3. Restart services

```bash
# Full restart sequence
pm2 restart all
systemctl restart nginx
systemctl restart mysql
```

---

# 7. Database Issues

## Issue: Database Connection Failed

### Symptoms
- Error: "Database connection failed"
- API not working

### Diagnosis

```bash
# Test MySQL connection
mysql -u media_user -p media_portal -e "SELECT 1"

# Check MySQL status
systemctl status mysql
```

### Solutions

```bash
# Start MySQL if stopped
systemctl start mysql

# Check credentials in .env
cat /var/www/media-portal/backend/.env | grep DB_

# Restart backend after fixing
pm2 restart media-portal-api
```

---

## Issue: Database Full

### Symptoms
- Cannot create new records
- "Disk quota exceeded" errors

### Solutions

```bash
# Check disk space
df -h

# Check MySQL database size
mysql -u root -p -e "
SELECT table_schema AS 'Database',
ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;
"

# Clean up old records if needed
# (After backup!)
```

---

## Issue: Slow Queries

### Symptoms
- Database operations slow
- Timeouts on large lists

### Diagnosis

```bash
# Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

# Check slow queries
cat /var/log/mysql/slow.log
```

### Solutions

- Add missing indexes
- Optimize queries
- Increase connection pool

---

# 8. Error Messages Reference

## HTTP Error Codes

| Code | Meaning | Common Cause | Solution |
|------|---------|--------------|----------|
| 400 | Bad Request | Invalid input | Check form data |
| 401 | Unauthorized | Token invalid | Login again |
| 403 | Forbidden | No permission | Check role |
| 404 | Not Found | Wrong URL | Check address |
| 413 | Payload Too Large | File > 50MB | Reduce file size |
| 500 | Server Error | Backend bug | Check logs |
| 502 | Bad Gateway | Backend down | Restart backend |
| 503 | Service Unavailable | Server overloaded | Restart services |

---

## Application Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "No token provided" | Not logged in | Login |
| "Token expired" | Session ended | Login again |
| "Access denied" | Wrong role | Use correct account |
| "User not found" | Invalid user ID | Check ID |
| "Post not found" | Invalid post ID | Check ID |
| "Email already exists" | Duplicate email | Use different email |
| "Invalid credentials" | Wrong password | Reset password |
| "File too large" | > 50MB | Compress file |
| "Invalid file type" | Wrong format | Use supported format |
| "Rejection reason required" | Missing reason | Add rejection reason |

---

## Quick Diagnostic Commands

```bash
# System health check
echo "=== System Status ===" && \
echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')%" && \
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')" && \
echo "Disk: $(df -h / | tail -1 | awk '{print $3"/"$2}')" && \
echo "=== Services ===" && \
pm2 status && \
echo "=== MySQL ===" && \
systemctl status mysql | head -3 && \
echo "=== Nginx ===" && \
systemctl status nginx | head -3
```

---

## Support Escalation

| Level | Issue Type | Contact |
|-------|------------|---------|
| L1 | User questions, password resets | support@yourcompany.com |
| L2 | Technical issues, bugs | tech@yourcompany.com |
| L3 | Server issues, emergencies | emergency@yourcompany.com |

---

**© 2026 Media Management Portal. All Rights Reserved.**
