# Media Management Portal - Technical Documentation

> **Version:** 1.0.0  
> **Last Updated:** 2026-02-02  
> **Project Type:** Full-Stack Web Application

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Upload System](#file-upload-system)
8. [Environment Configuration](#environment-configuration)
9. [Deployment Guide](#deployment-guide)

---

## 🎯 System Overview

The **Media Management Portal** is a content management system designed for organizations to manage media content (images and videos) with a multi-role workflow system. It supports content creation, review, approval, and publishing to social media platforms.

### Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Access** | Creator, Manager, and Admin roles with specific permissions |
| **Content Workflow** | Draft → Pending → Approved/Rejected → Published |
| **Media Management** | Upload, store, and manage images and videos |
| **Dashboard Analytics** | Statistics and activity tracking |
| **Profile Management** | User profile with picture upload |
| **Password Recovery** | Email-based password reset |
| **Automated Cleanup** | Cron job for cleaning up old/deleted media |

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 5.2.1 | Web framework |
| **MySQL** | 8.0+ | Database |
| **mysql2** | 3.16.1 | MySQL driver |
| **JWT** | 9.0.3 | Authentication tokens |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Multer** | 2.0.2 | File upload handling |
| **Helmet** | 8.1.0 | Security headers |
| **Nodemailer** | 7.0.12 | Email service |
| **node-cron** | 4.2.1 | Scheduled tasks |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.35 | React framework |
| **React** | 18 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 3.3.0 | Styling |
| **Axios** | 1.6.0 | HTTP client |
| **Lucide React** | 0.292.0 | Icons |

---

## 🏗️ Architecture

```
Media-Management-Portal/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── postController.js    # Post/Content operations
│   │   ├── profileController.js # Profile management
│   │   ├── settingsController.js # System settings
│   │   └── cleanupController.js # Media cleanup
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── uploadMiddleware.js  # Multer config
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── userRoutes.js        # /api/users/*
│   │   ├── postRoutes.js        # /api/posts/*
│   │   ├── profileRoutes.js     # /api/profile/*
│   │   ├── settingsRoutes.js    # /api/settings/*
│   │   └── cleanupRoutes.js     # /api/cleanup/*
│   ├── services/
│   │   └── cronService.js       # Scheduled cleanup jobs
│   ├── uploads/                 # Media storage
│   │   ├── profiles/            # Profile pictures
│   │   └── company/             # Company logos
│   ├── server.js                # Express server entry
│   └── schema.sql               # Database schema
│
└── frontend/
    ├── app/
    │   ├── (authenticated)/     # Protected route group
    │   ├── dashboard/           # Dashboard pages
    │   ├── login/               # Login page
    │   ├── register/            # Registration page
    │   ├── forgot-password/     # Password recovery
    │   ├── reset-password/      # Password reset
    │   ├── create-post/         # New post creation
    │   ├── post-edit/           # Edit existing post
    │   ├── post-view/           # View single post
    │   └── users/               # User management
    ├── components/
    │   ├── Navbar.tsx           # Navigation bar
    │   ├── Sidebar.tsx          # Dashboard sidebar
    │   ├── PostCard.tsx         # Post display card
    │   ├── Toast.tsx            # Notification toast
    │   ├── ConfirmModal.tsx     # Confirmation dialogs
    │   ├── RejectionModal.tsx   # Rejection with reason
    │   └── PublishModal.tsx     # Social media publish
    ├── context/
    │   └── AuthContext.tsx      # Authentication state
    └── config/
        └── api.ts               # API configuration
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    
    USERS {
        int id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        enum role "CREATOR|MANAGER|ADMIN"
        varchar reset_token
        datetime reset_token_expires
        boolean is_active
        timestamp created_at
    }
    
    POSTS {
        int id PK
        int user_id FK
        varchar title
        text content
        enum media_type "IMAGE|VIDEO"
        varchar media_path
        enum status "DRAFT|PENDING|APPROVED|REJECTED|PUBLISHED"
        text rejection_reason
        boolean media_deleted
        timestamp created_at
    }
```

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Display name |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | ENUM | NOT NULL, DEFAULT 'CREATOR' | User role |
| `reset_token` | VARCHAR(255) | NULL | Password reset token |
| `reset_token_expires` | DATETIME | NULL | Token expiry time |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

### Table: `posts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `user_id` | INT | FK → users.id | Content creator |
| `title` | VARCHAR(255) | NOT NULL | Post title |
| `content` | TEXT | NULL | Post description |
| `media_type` | ENUM | NOT NULL | IMAGE or VIDEO |
| `media_path` | VARCHAR(255) | NOT NULL | File path |
| `status` | ENUM | NOT NULL, DEFAULT 'DRAFT' | Workflow status |
| `rejection_reason` | TEXT | NULL | Manager feedback |
| `media_deleted` | BOOLEAN | DEFAULT 0 | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

---

## 📡 API Documentation

### Base URL

```
Development: http://localhost:5000
Production:  https://your-api-domain.com
```

---

### 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/register` | Create new user account | ❌ |
| `POST` | `/login` | Authenticate user | ❌ |
| `POST` | `/forgot-password` | Request password reset | ❌ |
| `POST` | `/reset-password` | Reset password with token | ❌ |

#### POST `/api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "CREATOR"
  }
}
```

---

### 👥 User Routes (`/api/users`)

> All routes require JWT authentication

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/` | List all users | Manager, Admin |
| `POST` | `/` | Create new user | Admin |
| `GET` | `/:id` | Get user details | All (self or Admin) |
| `PUT` | `/:id` | Update user | Self |
| `PUT` | `/:id/role` | Change user role | Admin |
| `PUT` | `/:id/status` | Toggle active status | Admin |
| `DELETE` | `/:id` | Delete user | Admin |
| `GET` | `/:id/posts` | Get user's posts | All |

---

### 📝 Post Routes (`/api/posts`)

> All routes require JWT authentication

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/` | Create new post | All |
| `GET` | `/` | List posts | All (filtered by role) |
| `GET` | `/:id` | Get single post | All |
| `PUT` | `/:id` | Update post | Creator (owner) |
| `DELETE` | `/:id` | Delete post | Creator (owner), Manager, Admin |
| `PUT` | `/:id/status` | Approve/Reject post | Manager, Admin |
| `POST` | `/:id/publish` | Publish to socials | All |
| `GET` | `/stats` | System statistics | Manager, Admin |
| `GET` | `/activity` | Dashboard activity | Manager, Admin |
| `GET` | `/storage` | Storage statistics | Manager, Admin |
| `GET` | `/user-stats` | Current user stats | All |
| `GET` | `/user-stats/:id` | Specific user stats | All |

#### POST `/api/posts` (Create Post)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Post title |
| `content` | string | ❌ | Post description |
| `media` | file | ✅ | Image or video file |
| `status` | string | ❌ | DRAFT or PENDING |

**Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "title": "My First Post",
    "status": "PENDING"
  }
}
```

#### PUT `/api/posts/:id/status` (Approve/Reject)

**Request Body:**
```json
{
  "status": "REJECTED",
  "rejection_reason": "Image quality is too low"
}
```

---

### 👤 Profile Routes (`/api/profile`)

> All routes require JWT authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get current user profile |
| `PUT` | `/` | Update profile info |
| `POST` | `/password` | Change password |
| `POST` | `/picture` | Upload profile picture |

---

### ⚙️ Settings Routes (`/api/settings`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/` | Get system settings | All |
| `PUT` | `/` | Update settings | Admin |

---

### 🧹 Cleanup Routes (`/api/cleanup`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/cleanup` | Trigger media cleanup | Cron Key |

**Query Parameters:**
```
?key=YOUR_CRON_KEY
```

---

## 🔒 Authentication & Authorization

### JWT Token Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "CREATOR",
  "iat": 1706860800,
  "exp": 1706947200
}
```

### Role Permissions Matrix

| Feature | CREATOR | MANAGER | ADMIN |
|---------|:-------:|:-------:|:-----:|
| Create posts | ✅ | ✅ | ✅ |
| View own posts | ✅ | ✅ | ✅ |
| View all posts | ❌ | ✅ | ✅ |
| Edit own posts | ✅ | ❌ | ❌ |
| Delete own posts | ✅ | ❌ | ❌ |
| Approve/Reject posts | ❌ | ✅ | ✅ |
| Delete any post | ❌ | ✅ | ✅ |
| View all users | ❌ | ✅ | ✅ |
| Create users | ❌ | ❌ | ✅ |
| Manage user roles | ❌ | ❌ | ✅ |
| Toggle user status | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |
| View system stats | ❌ | ✅ | ✅ |
| Update settings | ❌ | ❌ | ✅ |

### Authorization Header Format

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📁 File Upload System

### Upload Configurations

| Type | Max Size | Allowed Formats | Storage Path |
|------|----------|-----------------|--------------|
| **Media Posts** | 50 MB | jpeg, jpg, png, gif, mp4, mov, avi | `/uploads/` |
| **Profile Picture** | 5 MB | jpeg, jpg, png, webp | `/uploads/profiles/` |
| **Company Logo** | 2 MB | jpeg, jpg, png, svg, webp | `/uploads/company/` |

### File Naming Convention

```
Media:    news_<timestamp>-<random>.<ext>
Profile:  <user_id>-<timestamp>-<random>.<ext>
Logo:     logo-<timestamp>-<random>.<ext>
```

---

## 🌍 Environment Configuration

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=media_portal

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourcompany.com

# Cleanup Cron
CRON_KEY=your_secure_cron_key

# Frontend URL (for password reset emails)
FRONTEND_URL=https://yourdomain.com
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Deployment Guide

### Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ database
- Domain with SSL (for production)

### Step 1: Database Setup

```sql
-- Run schema.sql to create database and tables
mysql -u root -p < schema.sql
```

### Step 2: Backend Deployment

```bash
cd backend

# Install dependencies
npm install

# Create .env file with production values
cp .env.example .env
nano .env

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "media-portal-api"

# Or start directly
npm start
```

### Step 3: Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://your-api-domain.com" > .env.local

# Build for production
npm run build

# Start production server
npm start

# Or export as static (if configured)
npm run build && npm run export
```

### Step 4: Nginx Configuration (Example)

```nginx
# Backend API
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Cron Job Setup (cPanel)

```bash
# Run cleanup daily at midnight
0 0 * * * curl -s "https://api.yourdomain.com/api/cleanup/cleanup?key=YOUR_CRON_KEY" > /dev/null
```

---

## 📞 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Error | Server error |

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-02 | Initial documentation |

---

**© 2026 Media Management Portal. All Rights Reserved.**
