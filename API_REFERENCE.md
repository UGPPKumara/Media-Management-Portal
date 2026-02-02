# Media Management Portal
## API Reference

---

| **Document Info** | |
|-------------------|-----------------|
| **API Version** | 1.0.0 |
| **Base URL** | `https://api.yourdomain.com` |
| **Protocol** | HTTPS |
| **Format** | JSON |
| **Last Updated** | 2026-02-02 |

---

## 📖 Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Auth Endpoints](#3-auth-endpoints)
4. [User Endpoints](#4-user-endpoints)
5. [Post Endpoints](#5-post-endpoints)
6. [Profile Endpoints](#6-profile-endpoints)
7. [Settings Endpoints](#7-settings-endpoints)
8. [Cleanup Endpoints](#8-cleanup-endpoints)
9. [Error Handling](#9-error-handling)
10. [Rate Limiting](#10-rate-limiting)

---

# 1. Overview

## 1.1 Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000` |
| Production | `https://api.yourdomain.com` |

## 1.2 Request Format

All requests must include:

```http
Content-Type: application/json
```

For file uploads:

```http
Content-Type: multipart/form-data
```

## 1.3 Response Format

All responses are JSON:

```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

# 2. Authentication

## 2.1 JWT Token

The API uses JSON Web Tokens (JWT) for authentication.

### Obtaining Token

Call `POST /api/auth/login` to receive a token.

### Using Token

Include the token in all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "CREATOR",
  "iat": 1706860800,
  "exp": 1706947200
}
```

### Token Expiry

Tokens expire after **24 hours**.

## 2.2 Role-Based Access

| Role | Access Level |
|------|--------------|
| `CREATOR` | Own resources only |
| `MANAGER` | Read all, approve/reject |
| `ADMIN` | Full access |

---

# 3. Auth Endpoints

## 3.1 Register User

Create a new user account.

```http
POST /api/auth/register
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Display name (3-50 chars) |
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Password (min 6 chars) |

### Example Request

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (201)

```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "All fields are required" |
| 400 | "Email already exists" |
| 400 | "Username already exists" |
| 500 | "Server error" |

---

## 3.2 Login

Authenticate user and receive JWT token.

```http
POST /api/auth/login
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Registered email |
| `password` | string | ✅ | User password |

### Example Request

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IkNSRUFUT1IiLCJpYXQiOjE3MDY4NjA4MDAsImV4cCI6MTcwNjk0NzIwMH0.signature",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "CREATOR"
  }
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "Email and password are required" |
| 401 | "Invalid credentials" |
| 403 | "Account is deactivated" |

---

## 3.3 Forgot Password

Request password reset email.

```http
POST /api/auth/forgot-password
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Registered email |

### Example Request

```json
{
  "email": "john@example.com"
}
```

### Success Response (200)

```json
{
  "message": "Password reset email sent"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "Email is required" |
| 404 | "User not found" |

---

## 3.4 Reset Password

Reset password using token from email.

```http
POST /api/auth/reset-password
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | ✅ | Reset token from email |
| `password` | string | ✅ | New password |

### Example Request

```json
{
  "token": "abc123resettoken",
  "password": "newSecurePassword123"
}
```

### Success Response (200)

```json
{
  "message": "Password reset successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "Token and password are required" |
| 400 | "Invalid or expired token" |

---

# 4. User Endpoints

> 🔒 All user endpoints require authentication

## 4.1 Get All Users

Get list of all users (Manager/Admin only).

```http
GET /api/users
```

### Headers

```http
Authorization: Bearer <token>
```

### Required Role

`MANAGER` or `ADMIN`

### Success Response (200)

```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "CREATOR",
      "is_active": true,
      "created_at": "2026-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "username": "manager1",
      "email": "manager@example.com",
      "role": "MANAGER",
      "is_active": true,
      "created_at": "2026-01-10T08:00:00.000Z"
    }
  ]
}
```

### Error Responses

| Code | Message |
|------|---------|
| 403 | "Access denied" |

---

## 4.2 Create User

Create a new user (Admin only).

```http
POST /api/users
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Required Role

`ADMIN`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ | Display name |
| `email` | string | ✅ | Email address |
| `password` | string | ✅ | Password |
| `role` | string | ❌ | CREATOR, MANAGER, ADMIN (default: CREATOR) |

### Example Request

```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "password123",
  "role": "MANAGER"
}
```

### Success Response (201)

```json
{
  "message": "User created successfully",
  "userId": 5
}
```

---

## 4.3 Get User by ID

Get single user details.

```http
GET /api/users/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | User ID |

### Success Response (200)

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "CREATOR",
    "is_active": true,
    "profile_picture": "/uploads/profiles/1-123456789.jpg",
    "created_at": "2026-01-15T10:30:00.000Z"
  }
}
```

---

## 4.4 Update User

Update user information.

```http
PUT /api/users/:id
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ❌ | New username |
| `email` | string | ❌ | New email |

### Example Request

```json
{
  "username": "johndoe_updated"
}
```

### Success Response (200)

```json
{
  "message": "User updated successfully"
}
```

---

## 4.5 Change User Role

Change user's role (Admin only).

```http
PUT /api/users/:id/role
```

### Required Role

`ADMIN`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | ✅ | CREATOR, MANAGER, or ADMIN |

### Example Request

```json
{
  "role": "MANAGER"
}
```

### Success Response (200)

```json
{
  "message": "User role updated successfully"
}
```

---

## 4.6 Toggle User Status

Activate/deactivate user (Admin only).

```http
PUT /api/users/:id/status
```

### Required Role

`ADMIN`

### Success Response (200)

```json
{
  "message": "User status updated successfully",
  "is_active": false
}
```

---

## 4.7 Delete User

Delete user account (Admin only).

```http
DELETE /api/users/:id
```

### Required Role

`ADMIN`

### Success Response (200)

```json
{
  "message": "User deleted successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 403 | "Access denied" |
| 404 | "User not found" |

---

## 4.8 Get User Posts

Get all posts by a specific user.

```http
GET /api/users/:id/posts
```

### Success Response (200)

```json
{
  "posts": [
    {
      "id": 1,
      "title": "My First Post",
      "status": "APPROVED",
      "media_type": "IMAGE",
      "created_at": "2026-01-20T14:00:00.000Z"
    }
  ]
}
```

---

# 5. Post Endpoints

> 🔒 All post endpoints require authentication

## 5.1 Create Post

Create a new post with media.

```http
POST /api/posts
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Post title (max 255 chars) |
| `content` | string | ❌ | Post description |
| `media` | file | ✅ | Image or video file |
| `status` | string | ❌ | DRAFT or PENDING (default: PENDING) |

### Example Request (cURL)

```bash
curl -X POST https://api.yourdomain.com/api/posts \
  -H "Authorization: Bearer <token>" \
  -F "title=My Awesome Post" \
  -F "content=This is the description" \
  -F "media=@/path/to/image.jpg" \
  -F "status=PENDING"
```

### Success Response (201)

```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "title": "My Awesome Post",
    "content": "This is the description",
    "media_type": "IMAGE",
    "media_path": "/uploads/news_1706860800-123456789.jpg",
    "status": "PENDING",
    "created_at": "2026-02-02T10:00:00.000Z"
  }
}
```

### Supported Media Types

| Type | Extensions | Max Size |
|------|------------|----------|
| Image | .jpg, .jpeg, .png, .gif | 50 MB |
| Video | .mp4, .mov, .avi | 50 MB |

### Error Responses

| Code | Message |
|------|---------|
| 400 | "Title is required" |
| 400 | "Media file is required" |
| 400 | "File too large" |
| 400 | "Invalid file type" |

---

## 5.2 Get All Posts

Get list of posts (filtered by role).

```http
GET /api/posts
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (DRAFT, PENDING, etc.) |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20) |

### Example Request

```http
GET /api/posts?status=PENDING&page=1&limit=10
```

### Success Response (200)

```json
{
  "posts": [
    {
      "id": 1,
      "user_id": 1,
      "username": "johndoe",
      "title": "My Awesome Post",
      "content": "Description here",
      "media_type": "IMAGE",
      "media_path": "/uploads/news_1706860800-123456789.jpg",
      "status": "PENDING",
      "rejection_reason": null,
      "created_at": "2026-02-02T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Role-Based Filtering

| Role | Visible Posts |
|------|---------------|
| CREATOR | Own posts only |
| MANAGER | All posts |
| ADMIN | All posts |

---

## 5.3 Get Post by ID

Get single post details.

```http
GET /api/posts/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Post ID |

### Success Response (200)

```json
{
  "post": {
    "id": 1,
    "user_id": 1,
    "username": "johndoe",
    "title": "My Awesome Post",
    "content": "Description here",
    "media_type": "IMAGE",
    "media_path": "/uploads/news_1706860800-123456789.jpg",
    "status": "APPROVED",
    "rejection_reason": null,
    "created_at": "2026-02-02T10:00:00.000Z"
  }
}
```

---

## 5.4 Update Post

Update existing post (Owner only, DRAFT/REJECTED status).

```http
PUT /api/posts/:id
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ❌ | Updated title |
| `content` | string | ❌ | Updated description |
| `media` | file | ❌ | New media file |
| `status` | string | ❌ | DRAFT or PENDING |

### Success Response (200)

```json
{
  "message": "Post updated successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 403 | "You can only edit your own posts" |
| 403 | "Cannot edit post with status: APPROVED" |
| 404 | "Post not found" |

---

## 5.5 Delete Post

Delete a post.

```http
DELETE /api/posts/:id
```

### Access Control

- **CREATOR**: Own posts only
- **MANAGER/ADMIN**: Any post

### Success Response (200)

```json
{
  "message": "Post deleted successfully"
}
```

---

## 5.6 Update Post Status

Approve or reject a post (Manager/Admin only).

```http
PUT /api/posts/:id/status
```

### Required Role

`MANAGER` or `ADMIN`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | ✅ | APPROVED or REJECTED |
| `rejection_reason` | string | Conditional | Required if status is REJECTED |

### Example Request (Approve)

```json
{
  "status": "APPROVED"
}
```

### Example Request (Reject)

```json
{
  "status": "REJECTED",
  "rejection_reason": "Image quality is too low. Please upload a higher resolution image."
}
```

### Success Response (200)

```json
{
  "message": "Post status updated successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "Rejection reason is required" |
| 403 | "Access denied" |
| 404 | "Post not found" |

---

## 5.7 Publish Post

Publish approved post to social media.

```http
POST /api/posts/:id/publish
```

### Required Status

Post must have `APPROVED` status.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platforms` | array | ❌ | Target platforms (default: ["facebook"]) |

### Example Request

```json
{
  "platforms": ["facebook"]
}
```

### Success Response (200)

```json
{
  "message": "Post published successfully",
  "status": "PUBLISHED"
}
```

---

## 5.8 Get System Stats

Get system-wide statistics (Manager/Admin only).

```http
GET /api/posts/stats
```

### Required Role

`MANAGER` or `ADMIN`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Filter start date (YYYY-MM-DD) |
| `endDate` | string | Filter end date (YYYY-MM-DD) |

### Success Response (200)

```json
{
  "stats": {
    "total": 150,
    "draft": 20,
    "pending": 15,
    "approved": 50,
    "rejected": 10,
    "published": 55
  }
}
```

---

## 5.9 Get Dashboard Activity

Get recent activity feed (Manager/Admin only).

```http
GET /api/posts/activity
```

### Required Role

`MANAGER` or `ADMIN`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Number of items (default: 10) |

### Success Response (200)

```json
{
  "activity": [
    {
      "id": 1,
      "title": "New Blog Post",
      "username": "johndoe",
      "status": "PENDING",
      "created_at": "2026-02-02T10:00:00.000Z"
    }
  ]
}
```

---

## 5.10 Get Storage Stats

Get storage usage statistics (Manager/Admin only).

```http
GET /api/posts/storage
```

### Required Role

`MANAGER` or `ADMIN`

### Success Response (200)

```json
{
  "storage": {
    "total_files": 250,
    "total_size": "2.5 GB",
    "images": {
      "count": 200,
      "size": "1.5 GB"
    },
    "videos": {
      "count": 50,
      "size": "1.0 GB"
    }
  }
}
```

---

## 5.11 Get User Stats

Get current user's statistics.

```http
GET /api/posts/user-stats
```

### Success Response (200)

```json
{
  "stats": {
    "total": 25,
    "draft": 3,
    "pending": 2,
    "approved": 15,
    "rejected": 2,
    "published": 3
  }
}
```

---

## 5.12 Get User Stats by ID

Get specific user's statistics.

```http
GET /api/posts/user-stats/:id
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | User ID |

### Success Response (200)

```json
{
  "stats": {
    "total": 25,
    "draft": 3,
    "pending": 2,
    "approved": 15,
    "rejected": 2,
    "published": 3
  }
}
```

---

# 6. Profile Endpoints

> 🔒 All profile endpoints require authentication

## 6.1 Get Profile

Get current user's profile.

```http
GET /api/profile
```

### Success Response (200)

```json
{
  "profile": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "CREATOR",
    "profile_picture": "/uploads/profiles/1-123456789.jpg",
    "is_active": true,
    "created_at": "2026-01-15T10:30:00.000Z"
  }
}
```

---

## 6.2 Update Profile

Update current user's profile.

```http
PUT /api/profile
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ❌ | New username |
| `email` | string | ❌ | New email |

### Example Request

```json
{
  "username": "johndoe_new",
  "email": "newemail@example.com"
}
```

### Success Response (200)

```json
{
  "message": "Profile updated successfully"
}
```

---

## 6.3 Change Password

Change current user's password.

```http
POST /api/profile/password
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | ✅ | Current password |
| `newPassword` | string | ✅ | New password (min 6 chars) |

### Example Request

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

### Success Response (200)

```json
{
  "message": "Password changed successfully"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "Current password is incorrect" |
| 400 | "New password must be at least 6 characters" |

---

## 6.4 Upload Profile Picture

Upload or update profile picture.

```http
POST /api/profile/picture
```

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profile_picture` | file | ✅ | Image file (max 5MB) |

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Success Response (200)

```json
{
  "message": "Profile picture uploaded successfully",
  "profile_picture": "/uploads/profiles/1-1706860800-123456789.jpg"
}
```

### Error Responses

| Code | Message |
|------|---------|
| 400 | "No file uploaded" |
| 400 | "File too large (max 5MB)" |
| 400 | "Only images are allowed" |

---

# 7. Settings Endpoints

> 🔒 All settings endpoints require authentication

## 7.1 Get Settings

Get system settings.

```http
GET /api/settings
```

### Success Response (200)

```json
{
  "settings": {
    "company_name": "My Company",
    "logo": "/uploads/company/logo-123456789.png"
  }
}
```

---

## 7.2 Update Settings

Update system settings (Admin only).

```http
PUT /api/settings
```

### Required Role

`ADMIN`

### Headers

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | string | ❌ | Company name |
| `logo` | file | ❌ | Logo image (max 2MB) |

### Supported Logo Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- SVG (.svg)
- WebP (.webp)

### Success Response (200)

```json
{
  "message": "Settings updated successfully"
}
```

---

# 8. Cleanup Endpoints

## 8.1 Run Cleanup

Trigger media cleanup job.

```http
GET /api/cleanup/cleanup
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Conditional | CRON_KEY (if configured) |

### Example Request

```http
GET /api/cleanup/cleanup?key=your_cron_key
```

### Success Response (200)

```json
{
  "message": "Cleanup completed",
  "deleted_files": 5
}
```

### Error Responses

| Code | Message |
|------|---------|
| 403 | "Forbidden" |

---

# 9. Error Handling

## 9.1 HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 413 | Payload Too Large | File size exceeds limit |
| 500 | Internal Server Error | Server error |

## 9.2 Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "OPTIONAL_ERROR_CODE"
}
```

## 9.3 Common Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "No token provided" | Missing Authorization header | Add Bearer token |
| "Unauthorized" | Invalid or expired token | Login again |
| "Access denied" | Insufficient role permissions | Use appropriate account |
| "User not found" | Invalid user ID | Check ID |
| "Post not found" | Invalid post ID | Check ID |
| "All fields are required" | Missing required fields | Provide all fields |

---

# 10. Rate Limiting

## 10.1 Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/*` | 10 requests | 1 minute |
| `/api/posts` (POST) | 20 requests | 1 minute |
| `/api/*` (other) | 100 requests | 1 minute |

## 10.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706860860
```

## 10.3 Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

---

# Quick Reference

## Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | /api/auth/register | ❌ | Register |
| POST | /api/auth/login | ❌ | Login |
| POST | /api/auth/forgot-password | ❌ | Request reset |
| POST | /api/auth/reset-password | ❌ | Reset password |

## User Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|:----:|-------------|
| GET | /api/users | M/A | List users |
| POST | /api/users | A | Create user |
| GET | /api/users/:id | All | Get user |
| PUT | /api/users/:id | Self | Update user |
| PUT | /api/users/:id/role | A | Change role |
| PUT | /api/users/:id/status | A | Toggle status |
| DELETE | /api/users/:id | A | Delete user |
| GET | /api/users/:id/posts | All | Get user posts |

## Post Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|:----:|-------------|
| POST | /api/posts | All | Create post |
| GET | /api/posts | All | List posts |
| GET | /api/posts/:id | All | Get post |
| PUT | /api/posts/:id | Owner | Update post |
| DELETE | /api/posts/:id | Owner/M/A | Delete post |
| PUT | /api/posts/:id/status | M/A | Approve/Reject |
| POST | /api/posts/:id/publish | M/A | Publish |
| GET | /api/posts/stats | M/A | System stats |
| GET | /api/posts/activity | M/A | Activity feed |
| GET | /api/posts/storage | M/A | Storage stats |
| GET | /api/posts/user-stats | All | User stats |

## Profile Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|:----:|-------------|
| GET | /api/profile | All | Get profile |
| PUT | /api/profile | All | Update profile |
| POST | /api/profile/password | All | Change password |
| POST | /api/profile/picture | All | Upload picture |

## Settings Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|:----:|-------------|
| GET | /api/settings | All | Get settings |
| PUT | /api/settings | A | Update settings |

**Legend:** C = Creator, M = Manager, A = Admin, All = Any authenticated user

---

**© 2026 Media Management Portal. All Rights Reserved.**

*For API support, contact: api-support@yourcompany.com*
