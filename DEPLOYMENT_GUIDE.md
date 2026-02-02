# Media Management Portal
## Deployment Guide

---

| **Document Info** | |
|-------------------|-----------------|
| **Project** | Media Management Portal |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-02-02 |
| **Audience** | DevOps / System Administrators |

---

## 📖 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Configuration](#2-environment-configuration)
3. [Database Setup](#3-database-setup)
4. [Deployment Options](#4-deployment-options)
   - [Option A: cPanel Hosting](#option-a-cpanel-hosting)
   - [Option B: Render.com](#option-b-rendercom)
   - [Option C: VPS/Cloud Server](#option-c-vpscloud-server)
   - [Option D: Vercel + Railway](#option-d-vercel--railway)
5. [Post-Deployment Tasks](#5-post-deployment-tasks)
6. [Troubleshooting](#6-troubleshooting)

---

# 1. Prerequisites

## 1.1 Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| MySQL | 8.0+ | Database |
| Git | 2.30+ | Version control |

## 1.2 Required Accounts

| Service | Purpose | Required For |
|---------|---------|--------------|
| GitHub/GitLab | Code repository | All deployments |
| cPanel Host | Shared hosting | Option A |
| Render.com | Cloud platform | Option B |
| DigitalOcean/AWS/Linode | VPS hosting | Option C |
| Vercel | Frontend hosting | Option D |
| Railway/PlanetScale | Database hosting | Option D |

## 1.3 Domain & SSL

- ✅ Domain name (e.g., `yourcompany.com`)
- ✅ SSL certificate (usually free with hosting)
- ✅ DNS access for configuration

---

# 2. Environment Configuration

## 2.1 Backend Environment Variables

Create `.env` file in the `backend` folder:

```env
# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=production

# ========================================
# DATABASE CONFIGURATION
# ========================================
DB_HOST=your-database-host.com
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_secure_db_password
DB_NAME=media_portal

# ========================================
# JWT AUTHENTICATION
# ========================================
# Generate a secure key: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters

# ========================================
# EMAIL CONFIGURATION (SMTP)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com

# ========================================
# CRON JOB SECURITY
# ========================================
CRON_KEY=your_secure_random_cron_key

# ========================================
# FRONTEND URL (for password reset emails)
# ========================================
FRONTEND_URL=https://yourcompany.com
```

## 2.2 Frontend Environment Variables

Create `.env.local` file in the `frontend` folder:

```env
NEXT_PUBLIC_API_URL=https://api.yourcompany.com
```

## 2.3 Generating Secure Keys

```bash
# Generate JWT Secret (run in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate CRON Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

# 3. Database Setup

## 3.1 Create Database

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE media_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user
CREATE USER 'media_user'@'%' IDENTIFIED BY 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON media_portal.* TO 'media_user'@'%';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

## 3.2 Run Schema

```bash
# Navigate to backend folder
cd backend

# Import schema
mysql -u media_user -p media_portal < schema.sql
```

Or run manually:

```sql
USE media_portal;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CREATOR', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'CREATOR',
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    media_type ENUM('IMAGE', 'VIDEO') NOT NULL,
    media_path VARCHAR(255) NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    rejection_reason TEXT,
    media_deleted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 3.3 Create Admin User

```sql
-- Hash the password first using Node.js:
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('AdminPassword123', 10))"

INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@yourcompany.com', '$2a$10$YOUR_BCRYPT_HASH', 'ADMIN');
```

---

# 4. Deployment Options

---

## Option A: cPanel Hosting

### A.1 Requirements

- cPanel hosting with:
  - Node.js support (v18+)
  - MySQL database
  - SSH access (recommended)

### A.2 Backend Deployment

#### Step 1: Create Node.js Application

1. Login to cPanel
2. Go to **"Setup Node.js App"**
3. Click **"Create Application"**
4. Configure:

| Setting | Value |
|---------|-------|
| Node.js Version | 18.x or higher |
| Application Mode | Production |
| Application Root | `media-portal-backend` |
| Application URL | `api.yourdomain.com` |
| Application Startup File | `server.js` |

5. Click **"Create"**

#### Step 2: Upload Backend Files

```bash
# Via SSH or File Manager, upload to:
/home/username/media-portal-backend/

# Files to upload:
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── uploads/
├── server.js
├── package.json
└── .env
```

#### Step 3: Install Dependencies

```bash
# SSH into server
ssh username@yourdomain.com

# Navigate to app folder
cd media-portal-backend

# Install dependencies
npm install --production

# Create uploads folder
mkdir -p uploads/profiles uploads/company
chmod 755 uploads
```

#### Step 4: Start Application

1. Go back to **"Setup Node.js App"** in cPanel
2. Click **"Run NPM Install"**
3. Click **"Restart"**

### A.3 Frontend Deployment (Static Export)

#### Step 1: Build Static Files

```bash
# On your local machine
cd frontend

# Update .env.local with production API URL
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.local

# Build for static export
npm run build
```

#### Step 2: Upload to cPanel

1. Upload contents of `frontend/out` folder to `public_html`
2. Or create subdomain like `app.yourdomain.com`

#### Step 3: Configure .htaccess

Create `.htaccess` in the frontend root:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle client-side routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### A.4 Configure Cron Job

1. Go to **"Cron Jobs"** in cPanel
2. Add new cron job:

| Setting | Value |
|---------|-------|
| Common Settings | Once Per Day (0 0 * * *) |
| Command | `curl -s "https://api.yourdomain.com/api/cleanup/cleanup?key=YOUR_CRON_KEY" > /dev/null` |

---

## Option B: Render.com

### B.1 Backend Deployment

#### Step 1: Prepare Repository

Ensure your repository has:

```
backend/
├── package.json
├── server.js
└── ... other files
```

#### Step 2: Create Web Service

1. Login to [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `media-portal-api` |
| Region | Choose nearest |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

#### Step 3: Add Environment Variables

In Render dashboard, add all environment variables:

```
PORT=5000
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=media_portal
JWT_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourcompany.com
FRONTEND_URL=https://your-frontend.vercel.app
CRON_KEY=your-cron-key
```

#### Step 4: Add Disk Storage

1. Go to service settings
2. Add **Disk**:
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1 GB (or more)

#### Step 5: Deploy

Click **"Deploy"** and wait for build to complete.

### B.2 Database (External)

Use external MySQL service:

| Provider | Features |
|----------|----------|
| **PlanetScale** | Free tier, serverless MySQL |
| **Railway** | Easy MySQL hosting |
| **Aiven** | Managed MySQL |

### B.3 Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import your repository
3. Configure:

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://media-portal-api.onrender.com`

---

## Option C: VPS/Cloud Server

### C.1 Server Setup (Ubuntu 22.04)

#### Step 1: Update System

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

#### Step 2: Install Node.js

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

#### Step 3: Install MySQL

```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Login and create database
sudo mysql
```

```sql
CREATE DATABASE media_portal;
CREATE USER 'media_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON media_portal.* TO 'media_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 4: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2
```

#### Step 5: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Enable and start
sudo systemctl enable nginx
sudo systemctl start nginx
```

### C.2 Deploy Application

#### Step 1: Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/media-portal
sudo chown $USER:$USER /var/www/media-portal

# Clone repository
cd /var/www/media-portal
git clone https://github.com/your-repo/media-portal.git .
```

#### Step 2: Setup Backend

```bash
# Navigate to backend
cd /var/www/media-portal/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add all environment variables

# Create uploads directory
mkdir -p uploads/profiles uploads/company
chmod 755 uploads

# Import database schema
mysql -u media_user -p media_portal < schema.sql

# Start with PM2
pm2 start server.js --name "media-portal-api"
pm2 save
pm2 startup
```

#### Step 3: Setup Frontend

```bash
# Navigate to frontend
cd /var/www/media-portal/frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.local

# Install and build
npm install
npm run build

# Start with PM2
pm2 start npm --name "media-portal-frontend" -- start
pm2 save
```

### C.3 Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/media-portal
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # File upload size
        client_max_body_size 50M;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/media-portal /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### C.4 Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### C.5 Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### C.6 Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add cleanup job (runs daily at midnight)
0 0 * * * curl -s "http://localhost:5000/api/cleanup/cleanup?key=YOUR_CRON_KEY" > /dev/null
```

---

## Option D: Vercel + Railway

### D.1 Database on Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Add **MySQL** service
4. Copy connection details:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### D.2 Backend on Railway

1. In same Railway project, add **GitHub Repo**
2. Configure:
   - Root Directory: `backend`
   - Start Command: `npm start`
3. Add environment variables (use MySQL connection from above)
4. Deploy

### D.3 Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import repository
3. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Railway backend URL
5. Deploy

---

# 5. Post-Deployment Tasks

## 5.1 Verification Checklist

| Task | Command/Action | Expected Result |
|------|----------------|-----------------|
| ✅ Backend Health | `curl https://api.yourdomain.com` | "Media Management Portal API Running" |
| ✅ Database Connection | Check logs | "Database connected successfully" |
| ✅ Frontend Load | Visit `https://yourdomain.com` | Login page displays |
| ✅ User Registration | Register new user | Success message |
| ✅ User Login | Login with credentials | Redirect to dashboard |
| ✅ File Upload | Create post with media | Media uploads successfully |
| ✅ Password Reset | Request reset email | Email received |

## 5.2 Create Admin User

```bash
# SSH to server or use database client
mysql -u media_user -p media_portal
```

```sql
-- First, generate password hash locally:
-- node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword123', 10))"

INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@yourcompany.com', 'YOUR_BCRYPT_HASH', 'ADMIN');
```

## 5.3 Setup Monitoring

### PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# Monitor CPU/Memory
pm2 monit
```

### Log Rotation

```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 5.4 Backup Strategy

### Database Backup Script

```bash
#!/bin/bash
# /home/user/backup-db.sh

BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="media_portal"
DB_USER="media_user"
DB_PASS="your_password"

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Cron for Backup

```bash
# Add to crontab
0 2 * * * /home/user/backup-db.sh
```

---

# 6. Troubleshooting

## 6.1 Common Issues

### Backend Won't Start

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| Port in use | Another process on port 5000 | `lsof -i :5000` and kill process |
| Module not found | Missing dependency | Run `npm install` |
| Database error | Wrong credentials | Check `.env` file |
| Permission denied | File permissions | `chmod 755` on necessary files |

### Database Connection Failed

```bash
# Test connection locally
mysql -u media_user -p -h localhost media_portal

# Check if MySQL is running
sudo systemctl status mysql

# Check firewall (VPS)
sudo ufw status
```

### Upload Errors

```bash
# Check uploads folder exists
ls -la uploads/

# Fix permissions
chmod -R 755 uploads/
chown -R www-data:www-data uploads/  # or your user
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### PM2 Process Crashes

```bash
# Check logs
pm2 logs media-portal-api --lines 100

# Restart with fresh state
pm2 delete all
pm2 start server.js --name "media-portal-api"
```

## 6.2 Useful Commands

```bash
# Backend
pm2 restart media-portal-api
pm2 logs media-portal-api
pm2 monit

# Frontend
pm2 restart media-portal-frontend
pm2 logs media-portal-frontend

# Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log

# MySQL
sudo systemctl status mysql
mysql -u media_user -p media_portal

# System
free -h          # Memory usage
df -h            # Disk usage
htop             # Process monitor
```

## 6.3 Performance Optimization

### Nginx Caching

```nginx
# Add to server block
location /uploads/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Cluster Mode

```bash
# For multi-core servers
pm2 start server.js -i max --name "media-portal-api"
```

---

## 📋 Deployment Checklist

```
□ Prerequisites installed (Node.js, MySQL, Git)
□ Database created and schema imported
□ Admin user created
□ Environment variables configured
□ Backend deployed and running
□ Frontend deployed and accessible
□ SSL certificate installed
□ DNS configured
□ Cron job for cleanup configured
□ Backup strategy implemented
□ Monitoring setup complete
□ All features tested
```

---

**© 2026 Media Management Portal. All Rights Reserved.**

*For support, contact: devops@yourcompany.com*
