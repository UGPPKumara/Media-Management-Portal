# Media Management Portal
## Project Document

---

| **Document Info** | |
|-------------------|-----------------|
| **Project Name** | Media Management Portal |
| **Version** | 1.0.0 |
| **Date Created** | 2026-02-02 |
| **Status** | Active Development |
| **Document Type** | Software Project Specification |

---

## 1. Executive Summary

The **Media Management Portal** is a comprehensive web-based content management system designed to streamline the process of creating, reviewing, approving, and publishing media content within organizations. The system provides a structured workflow with role-based access control, enabling efficient collaboration between content creators, managers, and administrators.

### 1.1 Project Goals

- ✅ Centralize media content management in a single platform
- ✅ Implement a structured approval workflow for quality control
- ✅ Enable role-based access for different user types
- ✅ Support multiple media formats (images and videos)
- ✅ Provide analytics and reporting capabilities
- ✅ Integrate with social media platforms for publishing

---

## 2. Project Scope

### 2.1 In Scope

| Feature Category | Description |
|------------------|-------------|
| **User Management** | Registration, authentication, profile management, role assignment |
| **Content Workflow** | Create, edit, submit, approve, reject, publish posts |
| **Media Storage** | Upload, store, and serve images and videos |
| **Dashboard** | Statistics, activity logs, storage monitoring |
| **Notifications** | Email-based password recovery and alerts |
| **Settings** | Company branding and system configuration |

### 2.2 Out of Scope (Future Phases)

- Mobile application development
- Real-time chat/collaboration features
- Advanced video editing capabilities
- Multi-language support
- Third-party CMS integrations

---

## 3. Stakeholders

| Role | Responsibilities |
|------|------------------|
| **Project Owner** | Overall project vision and business requirements |
| **Development Team** | System design, development, and maintenance |
| **Content Creators** | Create and submit media content |
| **Content Managers** | Review, approve, or reject content submissions |
| **System Administrators** | Manage users, roles, and system settings |
| **End Users** | Consume published content |

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN                                    │
│  • Full system access                                           │
│  • Manage all users and roles                                   │
│  • Configure system settings                                    │
│  • View all analytics and reports                               │
├─────────────────────────────────────────────────────────────────┤
│                        MANAGER                                   │
│  • Review all submitted content                                 │
│  • Approve or reject posts                                      │
│  • View system statistics                                       │
│  • Publish content to social media                              │
├─────────────────────────────────────────────────────────────────┤
│                        CREATOR                                   │
│  • Create new posts with media                                  │
│  • Edit own draft/rejected posts                                │
│  • Submit posts for review                                      │
│  • View personal statistics                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Permission Matrix

| Action | Creator | Manager | Admin |
|--------|:-------:|:-------:|:-----:|
| Create posts | ✅ | ✅ | ✅ |
| Edit own posts | ✅ | ❌ | ❌ |
| Delete own posts | ✅ | ❌ | ❌ |
| View own posts | ✅ | ✅ | ✅ |
| View all posts | ❌ | ✅ | ✅ |
| Approve/Reject posts | ❌ | ✅ | ✅ |
| Delete any post | ❌ | ✅ | ✅ |
| View users list | ❌ | ✅ | ✅ |
| Create users | ❌ | ❌ | ✅ |
| Edit user roles | ❌ | ❌ | ✅ |
| Activate/Deactivate users | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |
| View system statistics | ❌ | ✅ | ✅ |
| Modify system settings | ❌ | ❌ | ✅ |
| Publish to social media | ❌ | ✅ | ✅ |

---

## 5. Functional Requirements

### 5.1 Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | User registration with email and password | High |
| AUTH-02 | Secure login with JWT token | High |
| AUTH-03 | Password reset via email | High |
| AUTH-04 | Session management | High |
| AUTH-05 | Logout functionality | High |

### 5.2 User Management Module

| ID | Requirement | Priority |
|----|-------------|----------|
| USER-01 | View list of all users (Admin/Manager) | High |
| USER-02 | Create new user accounts (Admin) | High |
| USER-03 | Update user profile information | Medium |
| USER-04 | Change user roles (Admin) | High |
| USER-05 | Activate/Deactivate user accounts (Admin) | High |
| USER-06 | Delete user accounts (Admin) | Medium |
| USER-07 | Upload profile picture | Low |

### 5.3 Content Management Module

| ID | Requirement | Priority |
|----|-------------|----------|
| POST-01 | Create new post with title and description | High |
| POST-02 | Upload image or video media | High |
| POST-03 | Save post as draft | High |
| POST-04 | Submit post for review | High |
| POST-05 | Edit draft or rejected posts | High |
| POST-06 | Manager approval workflow | High |
| POST-07 | Rejection with reason feedback | High |
| POST-08 | Delete posts | Medium |
| POST-09 | View individual post details | Medium |
| POST-10 | Publish to social media platforms | Medium |

### 5.4 Dashboard & Analytics Module

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-01 | Display post statistics (by status) | High |
| DASH-02 | Show recent activity feed | Medium |
| DASH-03 | Storage usage monitoring | Medium |
| DASH-04 | User-specific statistics | Medium |
| DASH-05 | Date range filtering | Low |

### 5.5 Settings Module

| ID | Requirement | Priority |
|----|-------------|----------|
| SET-01 | View system settings | Medium |
| SET-02 | Update company name/branding | Low |
| SET-03 | Upload company logo | Low |

---

## 6. Content Workflow

### 6.1 Post Status Lifecycle

```
                    ┌──────────────┐
                    │    DRAFT     │
                    │  (Creator)   │
                    └──────┬───────┘
                           │ Submit
                           ▼
                    ┌──────────────┐
                    │   PENDING    │
                    │  (Waiting)   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │ Approve    │            │ Reject
              ▼            │            ▼
       ┌──────────────┐    │    ┌──────────────┐
       │   APPROVED   │    │    │   REJECTED   │
       │   (Ready)    │    │    │  (Feedback)  │
       └──────┬───────┘    │    └──────┬───────┘
              │            │           │
              │ Publish    │           │ Edit & Resubmit
              ▼            │           │
       ┌──────────────┐    │           │
       │  PUBLISHED   │◄───┘───────────┘
       │   (Live)     │
       └──────────────┘
```

### 6.2 Status Definitions

| Status | Description | Who Can Act |
|--------|-------------|-------------|
| **DRAFT** | Post is being created, not yet submitted | Creator |
| **PENDING** | Post submitted, awaiting review | Manager/Admin |
| **APPROVED** | Post approved, ready for publishing | Manager/Admin |
| **REJECTED** | Post rejected with feedback | Creator (edit) |
| **PUBLISHED** | Post is live on social media | - |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Specification |
|-------------|---------------|
| Page Load Time | < 3 seconds |
| API Response Time | < 500ms |
| Concurrent Users | 100+ |
| File Upload Size | Up to 50MB |

### 7.2 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT tokens with expiry |
| Password Storage | bcrypt hashing |
| API Security | Helmet.js headers |
| CORS | Configured for frontend origin |
| Role Validation | Middleware-based checks |

### 7.3 Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% |
| Backup Frequency | Daily |
| Recovery Time | < 4 hours |

### 7.4 Scalability

| Aspect | Approach |
|--------|----------|
| Database | MySQL connection pooling |
| File Storage | External storage capable |
| API | Stateless design |

---

## 8. Technology Stack

### 8.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Next.js 14 (React + TypeScript)             │   │
│   │                     Tailwind CSS                         │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                              │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   Express.js (Node.js)                   │   │
│   │        JWT Auth │ Multer │ Helmet │ Nodemailer           │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│                                                                  │
│   ┌──────────────────────┐    ┌─────────────────────────────┐   │
│   │      MySQL 8.0       │    │     File System Storage     │   │
│   │   (Users, Posts)     │    │    (Images, Videos)         │   │
│   └──────────────────────┘    └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Technology Details

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js | 14.2.35 |
| | React | 18 |
| | TypeScript | 5 |
| | Tailwind CSS | 3.3.0 |
| | Axios | 1.6.0 |
| **Backend** | Node.js | 18+ |
| | Express.js | 5.2.1 |
| | JWT | 9.0.3 |
| | bcryptjs | 3.0.3 |
| | Multer | 2.0.2 |
| **Database** | MySQL | 8.0+ |
| | mysql2 | 3.16.1 |

---

## 9. Database Design

### 9.1 Entity Relationship Diagram

```
┌──────────────────────────────────┐
│             USERS                │
├──────────────────────────────────┤
│ id (PK)          INT             │
│ username         VARCHAR(50)     │
│ email            VARCHAR(100)    │
│ password_hash    VARCHAR(255)    │
│ role             ENUM            │
│ reset_token      VARCHAR(255)    │
│ reset_token_expires DATETIME     │
│ is_active        BOOLEAN         │
│ created_at       TIMESTAMP       │
└────────────────┬─────────────────┘
                 │
                 │ 1:N
                 │
                 ▼
┌──────────────────────────────────┐
│             POSTS                │
├──────────────────────────────────┤
│ id (PK)          INT             │
│ user_id (FK)     INT             │
│ title            VARCHAR(255)    │
│ content          TEXT            │
│ media_type       ENUM            │
│ media_path       VARCHAR(255)    │
│ status           ENUM            │
│ rejection_reason TEXT            │
│ media_deleted    BOOLEAN         │
│ created_at       TIMESTAMP       │
└──────────────────────────────────┘
```

### 9.2 Data Dictionary

#### Users Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique user ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Display name |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt encrypted |
| role | ENUM | NOT NULL | CREATOR, MANAGER, ADMIN |
| reset_token | VARCHAR(255) | NULLABLE | Password reset token |
| reset_token_expires | DATETIME | NULLABLE | Token expiry |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | AUTO | Registration date |

#### Posts Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique post ID |
| user_id | INT | FK → users.id | Creator reference |
| title | VARCHAR(255) | NOT NULL | Post title |
| content | TEXT | NULLABLE | Post description |
| media_type | ENUM | NOT NULL | IMAGE or VIDEO |
| media_path | VARCHAR(255) | NOT NULL | File location |
| status | ENUM | NOT NULL | Workflow status |
| rejection_reason | TEXT | NULLABLE | Manager feedback |
| media_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| created_at | TIMESTAMP | AUTO | Creation date |

---

## 10. UI/UX Design

### 10.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                          NAVBAR                                  │
│  Logo │ Dashboard │ Profile │ Logout                            │
├─────────────────────────────────────────────────────────────────┤
│         │                                                        │
│         │                                                        │
│ SIDEBAR │                 MAIN CONTENT                           │
│         │                                                        │
│ • Dashboard │                                                    │
│ • Posts     │                                                    │
│ • Users     │                                                    │
│ • Settings  │                                                    │
│         │                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |
| Dashboard | `/dashboard` | Role-based dashboard |
| Posts | `/dashboard/posts` | Content management |
| Users | `/dashboard/users` | User management (Admin) |
| Create Post | `/create-post` | New content creation |
| View Post | `/post-view?id=X` | Single post details |
| Edit Post | `/post-edit?id=X` | Edit existing post |
| Profile | `/dashboard/profile` | User profile settings |

---

## 11. API Endpoints Summary

### 11.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset password |

### 11.2 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| GET | `/api/users/:id` | Get user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PUT | `/api/users/:id/role` | Change role |
| PUT | `/api/users/:id/status` | Toggle status |

### 11.3 Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts` | List posts |
| GET | `/api/posts/:id` | Get post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| PUT | `/api/posts/:id/status` | Approve/Reject |
| POST | `/api/posts/:id/publish` | Publish to social |
| GET | `/api/posts/stats` | System stats |

### 11.4 Profile & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/password` | Change password |
| POST | `/api/profile/picture` | Upload picture |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |

---

## 12. Deployment

### 12.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HOSTING PROVIDER                             │
│                                                                  │
│   ┌───────────────────────┐   ┌───────────────────────────────┐ │
│   │    Frontend Host      │   │       Backend Host            │ │
│   │    (Vercel/cPanel)    │   │    (Render/cPanel)            │ │
│   │    Next.js App        │   │    Express.js API             │ │
│   └───────────────────────┘   └───────────────────────────────┘ │
│                                           │                      │
│                                           ▼                      │
│                              ┌───────────────────────────────┐  │
│                              │      MySQL Database           │  │
│                              │    (PlanetScale/cPanel)       │  │
│                              └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Environment Variables

**Backend:**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `CRON_KEY`
- `FRONTEND_URL`

**Frontend:**
- `NEXT_PUBLIC_API_URL`

---

## 13. Testing Strategy

### 13.1 Testing Types

| Type | Description | Tools |
|------|-------------|-------|
| **Unit Testing** | Test individual functions | Jest |
| **Integration Testing** | Test API endpoints | Postman |
| **Manual Testing** | UI/UX verification | Browser |
| **Security Testing** | Vulnerability assessment | OWASP |

### 13.2 Test Scenarios

| Module | Test Case |
|--------|-----------|
| Auth | Valid/invalid login |
| Auth | Password reset flow |
| Posts | Create with media upload |
| Posts | Approval workflow |
| Users | Role changes |
| Users | Account activation |

---

## 14. Project Timeline

### 14.1 Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Core Authentication | ✅ Complete |
| **Phase 2** | User Management | ✅ Complete |
| **Phase 3** | Content Management | ✅ Complete |
| **Phase 4** | Approval Workflow | ✅ Complete |
| **Phase 5** | Dashboard & Analytics | ✅ Complete |
| **Phase 6** | Social Media Publishing | ✅ Complete |
| **Phase 7** | Testing & Bug Fixes | ✅ Complete |
| **Phase 8** | Deployment | ✅ Complete |

---

## 15. Maintenance & Support

### 15.1 Scheduled Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Media Cleanup | Daily | Remove deleted media files |
| Database Backup | Daily | Automated backups |
| Security Updates | Monthly | Dependency updates |
| Log Review | Weekly | Error monitoring |

### 15.2 Support Contacts

| Role | Responsibility |
|------|----------------|
| System Admin | Server & database issues |
| Developer | Bug fixes & enhancements |
| Support Team | User inquiries |

---

## 16. Appendix

### 16.1 Glossary

| Term | Definition |
|------|------------|
| **JWT** | JSON Web Token for authentication |
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete operations |
| **REST** | Representational State Transfer |
| **SPA** | Single Page Application |

### 16.2 References

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT.io](https://jwt.io/)

---

## 17. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-02 | System | Initial document |

---

**© 2026 Media Management Portal. All Rights Reserved.**
