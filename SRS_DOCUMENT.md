# Software Requirements Specification (SRS)
## Media Management Portal

---

| **Document Control** | |
|----------------------|-----------------|
| **Document Title** | Software Requirements Specification |
| **Project Name** | Media Management Portal |
| **Version** | 1.0.0 |
| **Date** | 2026-02-02 |
| **Status** | Approved |
| **Standard** | IEEE 830-1998 |

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-02-02 | Development Team | Initial SRS Document |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Other Requirements](#6-other-requirements)
7. [Appendices](#7-appendices)

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of all functional and non-functional requirements for the **Media Management Portal** system. This document is intended for:

- **Developers**: To understand system requirements for implementation
- **Testers**: To develop test cases and validation criteria
- **Project Managers**: To track project scope and deliverables
- **Stakeholders**: To review and approve system specifications

## 1.2 Scope

The **Media Management Portal** is a web-based content management system that enables organizations to:

- Manage media content (images and videos) through a centralized platform
- Implement a structured approval workflow for content quality control
- Support multiple user roles with granular permissions
- Provide analytics and reporting capabilities
- Integrate with social media platforms for content publishing

### 1.2.1 System Name

**Media Management Portal (MMP)**

### 1.2.2 Benefits

| Benefit | Description |
|---------|-------------|
| Centralization | Single platform for all media management |
| Quality Control | Multi-level approval workflow |
| Efficiency | Streamlined content creation to publishing |
| Accountability | Role-based access and audit trails |
| Scalability | Designed for growing content needs |

### 1.2.3 Objectives

1. Reduce content approval time by 50%
2. Centralize all media assets in one location
3. Implement role-based access control
4. Enable direct social media publishing
5. Provide real-time analytics and reporting

## 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **MMP** | Media Management Portal |
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token |
| **CRUD** | Create, Read, Update, Delete |
| **REST** | Representational State Transfer |
| **UI** | User Interface |
| **UX** | User Experience |
| **RBAC** | Role-Based Access Control |
| **SMTP** | Simple Mail Transfer Protocol |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security |

## 1.4 References

| Document | Description |
|----------|-------------|
| IEEE 830-1998 | IEEE Recommended Practice for SRS |
| Project Document | Media Management Portal Project Specification |
| Technical Documentation | System Architecture and API Reference |
| User Manual | End-User Guide |

## 1.5 Overview

This SRS document is organized as follows:

- **Section 2**: Overall system description, user characteristics, constraints
- **Section 3**: Detailed functional requirements for each system feature
- **Section 4**: External interface requirements (UI, API, hardware, software)
- **Section 5**: Non-functional requirements (performance, security, etc.)
- **Section 6**: Other requirements and appendices

---

# 2. Overall Description

## 2.1 Product Perspective

The Media Management Portal is a new, self-contained web application designed to replace manual content management processes. The system operates as a standalone platform but integrates with:

- **Email Services**: For notifications and password recovery
- **Social Media Platforms**: For content publishing (Facebook, etc.)
- **File Storage**: For media asset management

### 2.1.1 System Context Diagram

```
                              ┌─────────────────────┐
                              │    EMAIL SERVER     │
                              │   (SMTP Service)    │
                              └──────────┬──────────┘
                                         │
┌─────────────────┐           ┌──────────▼──────────┐           ┌─────────────────┐
│   WEB BROWSER   │◄─────────►│  MEDIA MANAGEMENT   │◄─────────►│  SOCIAL MEDIA   │
│   (Frontend)    │   HTTPS   │      PORTAL         │   API     │   PLATFORMS     │
└─────────────────┘           └──────────┬──────────┘           └─────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   MySQL DATABASE    │
                              │   & FILE STORAGE    │
                              └─────────────────────┘
```

### 2.1.2 System Interfaces

| Interface | Description |
|-----------|-------------|
| Web Browser | Primary user interface via HTTP/HTTPS |
| REST API | Backend services for frontend consumption |
| Database | MySQL for data persistence |
| File System | Local/cloud storage for media files |
| Email | SMTP for notifications |
| Social Media | API integration for publishing |

## 2.2 Product Functions

### 2.2.1 Major Function Summary

| Function | Description |
|----------|-------------|
| **User Authentication** | Secure registration, login, password recovery |
| **User Management** | Role assignment, activation, profile management |
| **Content Creation** | Upload and manage media posts |
| **Approval Workflow** | Review, approve, reject content |
| **Publishing** | Publish approved content to social media |
| **Analytics** | Dashboard statistics and reporting |
| **System Settings** | Configure portal branding and settings |

### 2.2.2 Use Case Overview

```
                    ┌──────────────────────────────────────────────┐
                    │           MEDIA MANAGEMENT PORTAL            │
                    │                                              │
    ┌───────┐       │  ┌─────────────┐    ┌─────────────┐         │
    │Creator│───────┼──│Create Post  │    │Edit Post    │         │
    └───────┘       │  └─────────────┘    └─────────────┘         │
                    │  ┌─────────────┐    ┌─────────────┐         │
    ┌───────┐       │  │Review Post  │    │Approve/     │         │
    │Manager│───────┼──│             │    │Reject Post  │         │
    └───────┘       │  └─────────────┘    └─────────────┘         │
                    │  ┌─────────────┐    ┌─────────────┐         │
    ┌───────┐       │  │Manage Users │    │Configure    │         │
    │ Admin │───────┼──│             │    │Settings     │         │
    └───────┘       │  └─────────────┘    └─────────────┘         │
                    │                                              │
                    └──────────────────────────────────────────────┘
```

## 2.3 User Classes and Characteristics

### 2.3.1 User Roles

| User Class | Description | Frequency | Technical Expertise |
|------------|-------------|-----------|---------------------|
| **CREATOR** | Content creators who upload media | Daily | Basic |
| **MANAGER** | Content reviewers who approve/reject | Daily | Intermediate |
| **ADMIN** | System administrators | Weekly | Advanced |

### 2.3.2 Role Hierarchy

```
                    ┌─────────────┐
                    │    ADMIN    │
                    │ (Full Access)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   MANAGER   │
                    │  (Review)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   CREATOR   │
                    │  (Create)   │
                    └─────────────┘
```

### 2.3.3 User Characteristics Table

| Characteristic | CREATOR | MANAGER | ADMIN |
|----------------|---------|---------|-------|
| Primary Task | Create content | Review content | Manage system |
| Expected Users | 50+ | 5-10 | 1-3 |
| Login Frequency | Daily | Daily | As needed |
| Session Duration | 30-60 min | 1-2 hours | Variable |

## 2.4 Operating Environment

### 2.4.1 Hardware Requirements

| Component | Minimum Specification |
|-----------|----------------------|
| Client Device | Any device with web browser |
| Server CPU | 2 cores |
| Server RAM | 2 GB |
| Storage | 50 GB (expandable) |

### 2.4.2 Software Requirements

| Component | Requirement |
|-----------|-------------|
| **Client Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Server OS** | Linux (Ubuntu 20.04+) or Windows Server 2019+ |
| **Runtime** | Node.js 18+ |
| **Database** | MySQL 8.0+ |
| **Web Server** | Nginx or Apache (optional, for reverse proxy) |

## 2.5 Design and Implementation Constraints

| Constraint | Description |
|------------|-------------|
| **Programming Languages** | JavaScript/TypeScript (frontend), Node.js (backend) |
| **Framework** | Next.js 14 (frontend), Express.js (backend) |
| **Database** | MySQL relational database |
| **Authentication** | JWT-based token authentication |
| **File Storage** | Server filesystem (upgradable to cloud) |
| **Browser Support** | Modern browsers only (IE not supported) |

## 2.6 User Documentation

| Document | Format | Purpose |
|----------|--------|---------|
| User Manual | PDF/HTML | End-user instructions |
| Admin Guide | PDF/HTML | Administration procedures |
| API Documentation | Markdown | Developer reference |
| Quick Start Guide | PDF | Getting started |

## 2.7 Assumptions and Dependencies

### 2.7.1 Assumptions

| ID | Assumption |
|----|------------|
| A1 | Users have stable internet connection |
| A2 | Users have modern web browsers |
| A3 | Email service is available for notifications |
| A4 | Server has sufficient storage for media files |
| A5 | Users have basic computer literacy |

### 2.7.2 Dependencies

| ID | Dependency | Impact |
|----|------------|--------|
| D1 | MySQL Database | Data storage unavailable without it |
| D2 | Node.js Runtime | Backend cannot run without it |
| D3 | SMTP Server | Email notifications unavailable without it |
| D4 | Social Media APIs | Publishing feature unavailable without it |

---

# 3. System Features

## 3.1 User Authentication

### 3.1.1 Description

The system shall provide secure user authentication including registration, login, and password recovery functionality.

**Priority**: HIGH

### 3.1.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-AUTH-001** | The system shall allow new users to register with username, email, and password | HIGH |
| **FR-AUTH-002** | The system shall validate email format during registration | HIGH |
| **FR-AUTH-003** | The system shall enforce minimum password length of 6 characters | HIGH |
| **FR-AUTH-004** | The system shall prevent duplicate email registrations | HIGH |
| **FR-AUTH-005** | The system shall hash passwords using bcrypt before storage | HIGH |
| **FR-AUTH-006** | The system shall authenticate users with email and password | HIGH |
| **FR-AUTH-007** | The system shall generate JWT token upon successful login | HIGH |
| **FR-AUTH-008** | The system shall set token expiration to 24 hours | MEDIUM |
| **FR-AUTH-009** | The system shall provide password reset via email | HIGH |
| **FR-AUTH-010** | The system shall validate reset tokens before allowing password change | HIGH |
| **FR-AUTH-011** | The system shall expire reset tokens after 1 hour | MEDIUM |
| **FR-AUTH-012** | The system shall allow users to logout and invalidate session | HIGH |

### 3.1.3 Use Case: User Login

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-AUTH-01 |
| **Name** | User Login |
| **Actors** | All Users |
| **Preconditions** | User has registered account |
| **Main Flow** | 1. User navigates to login page<br>2. User enters email and password<br>3. System validates credentials<br>4. System generates JWT token<br>5. User is redirected to dashboard |
| **Alternative Flow** | 3a. Invalid credentials → Display error message |
| **Postconditions** | User is authenticated and has valid session |

---

## 3.2 User Management

### 3.2.1 Description

The system shall provide user management capabilities for administrators to manage user accounts, roles, and permissions.

**Priority**: HIGH

### 3.2.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-USER-001** | The system shall allow Admins to view list of all users | HIGH |
| **FR-USER-002** | The system shall allow Managers to view list of all users | HIGH |
| **FR-USER-003** | The system shall allow Admins to create new user accounts | HIGH |
| **FR-USER-004** | The system shall allow Admins to assign roles to users | HIGH |
| **FR-USER-005** | The system shall allow Admins to change existing user roles | HIGH |
| **FR-USER-006** | The system shall allow Admins to activate/deactivate users | HIGH |
| **FR-USER-007** | The system shall prevent deactivated users from logging in | HIGH |
| **FR-USER-008** | The system shall allow Admins to delete user accounts | MEDIUM |
| **FR-USER-009** | The system shall cascade delete user's posts when user is deleted | MEDIUM |
| **FR-USER-010** | The system shall allow users to view their own profile | HIGH |
| **FR-USER-011** | The system shall allow users to update their profile information | MEDIUM |
| **FR-USER-012** | The system shall allow users to upload profile picture | LOW |
| **FR-USER-013** | The system shall limit profile picture size to 5MB | LOW |
| **FR-USER-014** | The system shall support JPEG, PNG, WebP for profile pictures | LOW |

### 3.2.3 User Roles Matrix

| Permission | CREATOR | MANAGER | ADMIN |
|------------|:-------:|:-------:|:-----:|
| View all users | ❌ | ✅ | ✅ |
| Create users | ❌ | ❌ | ✅ |
| Edit user roles | ❌ | ❌ | ✅ |
| Activate/Deactivate | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |

---

## 3.3 Content Management

### 3.3.1 Description

The system shall provide content management features for creating, editing, viewing, and deleting media posts.

**Priority**: HIGH

### 3.3.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-POST-001** | The system shall allow authenticated users to create new posts | HIGH |
| **FR-POST-002** | The system shall require title for all posts | HIGH |
| **FR-POST-003** | The system shall allow optional description for posts | MEDIUM |
| **FR-POST-004** | The system shall require media file (image/video) for all posts | HIGH |
| **FR-POST-005** | The system shall support image formats: JPEG, JPG, PNG, GIF | HIGH |
| **FR-POST-006** | The system shall support video formats: MP4, MOV, AVI | HIGH |
| **FR-POST-007** | The system shall limit media file size to 50MB | HIGH |
| **FR-POST-008** | The system shall generate unique filename for uploaded media | HIGH |
| **FR-POST-009** | The system shall allow saving posts as DRAFT | HIGH |
| **FR-POST-010** | The system shall allow submitting posts for review (PENDING) | HIGH |
| **FR-POST-011** | The system shall allow Creators to edit their DRAFT posts | HIGH |
| **FR-POST-012** | The system shall allow Creators to edit their REJECTED posts | HIGH |
| **FR-POST-013** | The system shall prevent editing of PENDING, APPROVED, PUBLISHED posts | HIGH |
| **FR-POST-014** | The system shall allow Creators to delete their own posts | MEDIUM |
| **FR-POST-015** | The system shall allow Managers/Admins to delete any post | MEDIUM |
| **FR-POST-016** | The system shall display posts filtered by user role | HIGH |
| **FR-POST-017** | Creators shall only see their own posts | HIGH |
| **FR-POST-018** | Managers/Admins shall see all posts | HIGH |
| **FR-POST-019** | The system shall allow filtering posts by status | MEDIUM |
| **FR-POST-020** | The system shall display post details including creator info | MEDIUM |

### 3.3.3 Content Status Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                     POST STATUS WORKFLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│    ┌─────────┐     Submit      ┌─────────┐                       │
│    │  DRAFT  │─────────────────▶│ PENDING │                       │
│    └────┬────┘                  └────┬────┘                       │
│         │                            │                            │
│         │ Edit                       │                            │
│         │                   ┌────────┴────────┐                   │
│         │                   │                 │                   │
│         │              Approve            Reject                  │
│         │                   │                 │                   │
│         │                   ▼                 ▼                   │
│         │            ┌──────────┐      ┌──────────┐              │
│         │            │ APPROVED │      │ REJECTED │              │
│         │            └────┬─────┘      └─────┬────┘              │
│         │                 │                  │                    │
│         │            Publish            Edit & Resubmit           │
│         │                 │                  │                    │
│         │                 ▼                  │                    │
│         │           ┌───────────┐            │                    │
│         └───────────│ PUBLISHED │◄───────────┘                    │
│                     └───────────┘                                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3.4 Use Case: Create Post

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-POST-01 |
| **Name** | Create New Post |
| **Actors** | Creator, Manager, Admin |
| **Preconditions** | User is authenticated |
| **Main Flow** | 1. User navigates to Create Post page<br>2. User enters title and description<br>3. User uploads media file<br>4. User clicks "Save as Draft" or "Submit for Review"<br>5. System validates input<br>6. System saves post with appropriate status<br>7. User is redirected to posts list |
| **Alternative Flow** | 5a. Validation fails → Display error message |
| **Postconditions** | Post is created with DRAFT or PENDING status |

---

## 3.4 Approval Workflow

### 3.4.1 Description

The system shall provide an approval workflow for Managers and Admins to review, approve, or reject submitted content.

**Priority**: HIGH

### 3.4.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-APPR-001** | The system shall display pending posts to Managers/Admins | HIGH |
| **FR-APPR-002** | The system shall allow Managers/Admins to view post details | HIGH |
| **FR-APPR-003** | The system shall allow Managers/Admins to preview media | HIGH |
| **FR-APPR-004** | The system shall allow Managers/Admins to approve posts | HIGH |
| **FR-APPR-005** | The system shall change status to APPROVED upon approval | HIGH |
| **FR-APPR-006** | The system shall allow Managers/Admins to reject posts | HIGH |
| **FR-APPR-007** | The system shall require rejection reason when rejecting | HIGH |
| **FR-APPR-008** | The system shall change status to REJECTED upon rejection | HIGH |
| **FR-APPR-009** | The system shall store rejection reason with the post | HIGH |
| **FR-APPR-010** | The system shall display rejection reason to post creator | HIGH |
| **FR-APPR-011** | Rejected posts shall be editable by creator | HIGH |
| **FR-APPR-012** | Resubmitted posts shall have PENDING status | HIGH |

### 3.4.3 Use Case: Approve/Reject Post

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-APPR-01 |
| **Name** | Review and Approve/Reject Post |
| **Actors** | Manager, Admin |
| **Preconditions** | Post has PENDING status |
| **Main Flow** | 1. User views list of pending posts<br>2. User selects a post to review<br>3. User previews media content<br>4a. User clicks "Approve" → Status changes to APPROVED<br>4b. User clicks "Reject" → Enters rejection reason → Status changes to REJECTED<br>5. Post status is updated |
| **Postconditions** | Post status is changed to APPROVED or REJECTED |

---

## 3.5 Social Media Publishing

### 3.5.1 Description

The system shall allow publishing approved content to social media platforms.

**Priority**: MEDIUM

### 3.5.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-PUB-001** | The system shall allow publishing APPROVED posts | MEDIUM |
| **FR-PUB-002** | The system shall support Facebook publishing | MEDIUM |
| **FR-PUB-003** | The system shall change status to PUBLISHED after publishing | MEDIUM |
| **FR-PUB-004** | Only Managers/Admins shall be able to publish posts | MEDIUM |
| **FR-PUB-005** | The system shall display publishing confirmation | LOW |
| **FR-PUB-006** | The system shall log publishing activity | LOW |

---

## 3.6 Dashboard and Analytics

### 3.6.1 Description

The system shall provide dashboard views with statistics and activity tracking for different user roles.

**Priority**: MEDIUM

### 3.6.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-DASH-001** | The system shall display role-appropriate dashboard | MEDIUM |
| **FR-DASH-002** | Creator dashboard shall show personal post statistics | MEDIUM |
| **FR-DASH-003** | Manager/Admin dashboard shall show system-wide statistics | MEDIUM |
| **FR-DASH-004** | Dashboard shall display total posts count | MEDIUM |
| **FR-DASH-005** | Dashboard shall display posts by status breakdown | MEDIUM |
| **FR-DASH-006** | Dashboard shall display pending posts count | MEDIUM |
| **FR-DASH-007** | Dashboard shall display recent activity | LOW |
| **FR-DASH-008** | Dashboard shall display storage usage statistics | LOW |
| **FR-DASH-009** | The system shall allow date range filtering for statistics | LOW |
| **FR-DASH-010** | Admin dashboard shall display user count | MEDIUM |

### 3.6.3 Dashboard Views by Role

| Element | CREATOR | MANAGER | ADMIN |
|---------|:-------:|:-------:|:-----:|
| Personal Stats | ✅ | ✅ | ✅ |
| System Stats | ❌ | ✅ | ✅ |
| Pending Count | Own only | All | All |
| Recent Activity | Own only | All | All |
| Storage Usage | ❌ | ✅ | ✅ |
| User Count | ❌ | ✅ | ✅ |

---

## 3.7 System Settings

### 3.7.1 Description

The system shall provide settings management for system administrators to configure portal branding.

**Priority**: LOW

### 3.7.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-SET-001** | The system shall allow Admins to view system settings | LOW |
| **FR-SET-002** | The system shall allow Admins to update company name | LOW |
| **FR-SET-003** | The system shall allow Admins to upload company logo | LOW |
| **FR-SET-004** | The system shall limit logo file size to 2MB | LOW |
| **FR-SET-005** | The system shall support JPEG, PNG, SVG, WebP for logos | LOW |
| **FR-SET-006** | Company branding shall be displayed in portal header | LOW |

---

## 3.8 Profile Management

### 3.8.1 Description

The system shall allow users to manage their personal profile information.

**Priority**: MEDIUM

### 3.8.2 Functional Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **FR-PROF-001** | The system shall allow users to view their profile | MEDIUM |
| **FR-PROF-002** | The system shall allow users to update username | MEDIUM |
| **FR-PROF-003** | The system shall allow users to update email | MEDIUM |
| **FR-PROF-004** | The system shall allow users to change password | HIGH |
| **FR-PROF-005** | The system shall verify current password before change | HIGH |
| **FR-PROF-006** | The system shall allow users to upload profile picture | LOW |
| **FR-PROF-007** | Profile pictures shall be limited to 5MB | LOW |

---

# 4. External Interface Requirements

## 4.1 User Interfaces

### 4.1.1 General UI Requirements

| Req ID | Requirement |
|--------|-------------|
| **UI-001** | The interface shall be responsive and work on desktop and tablet |
| **UI-002** | The interface shall follow modern web design principles |
| **UI-003** | The interface shall provide clear navigation |
| **UI-004** | The interface shall display appropriate error messages |
| **UI-005** | The interface shall provide loading indicators for async operations |
| **UI-006** | The interface shall use consistent color scheme and typography |

### 4.1.2 Page Layouts

| Page | Key Elements |
|------|--------------|
| **Login** | Email input, Password input, Login button, Forgot Password link |
| **Register** | Username, Email, Password inputs, Register button |
| **Dashboard** | Statistics cards, Recent activity, Quick actions |
| **Posts List** | Post cards/table, Filter options, Action buttons |
| **Create Post** | Title input, Description textarea, Media upload, Submit buttons |
| **User List** | User table, Search, Role/Status toggles, Action buttons |
| **Profile** | Profile form, Picture upload, Password change |

## 4.2 Hardware Interfaces

The system does not have direct hardware interface requirements. It operates through standard web protocols on any device with a web browser.

## 4.3 Software Interfaces

### 4.3.1 Database Interface

| Property | Specification |
|----------|---------------|
| Database Type | MySQL |
| Version | 8.0+ |
| Connection | mysql2 driver with connection pooling |
| Max Connections | 10 |

### 4.3.2 Email Interface

| Property | Specification |
|----------|---------------|
| Protocol | SMTP |
| Library | Nodemailer |
| Authentication | Username/Password or OAuth |
| TLS | Required |

### 4.3.3 File Storage Interface

| Property | Specification |
|----------|---------------|
| Type | Local filesystem |
| Library | Multer |
| Paths | /uploads, /uploads/profiles, /uploads/company |

## 4.4 Communications Interfaces

### 4.4.1 HTTP/HTTPS

| Property | Specification |
|----------|---------------|
| Protocol | HTTP/1.1, HTTP/2 |
| Security | HTTPS with TLS 1.2+ (production) |
| Port | 5000 (backend), 3000 (frontend) |

### 4.4.2 REST API

| Property | Specification |
|----------|---------------|
| Format | JSON |
| Authentication | Bearer Token (JWT) |
| Versioning | URL path (/api/...) |

---

# 5. Non-Functional Requirements

## 5.1 Performance Requirements

| Req ID | Requirement | Target |
|--------|-------------|--------|
| **NFR-PERF-001** | Page load time | < 3 seconds |
| **NFR-PERF-002** | API response time | < 500ms (95th percentile) |
| **NFR-PERF-003** | File upload time | < 10 seconds for 50MB |
| **NFR-PERF-004** | Concurrent users | 100+ |
| **NFR-PERF-005** | Database queries | < 100ms |

## 5.2 Safety Requirements

| Req ID | Requirement |
|--------|-------------|
| **NFR-SAFE-001** | System shall gracefully handle errors without data loss |
| **NFR-SAFE-002** | System shall provide user-friendly error messages |
| **NFR-SAFE-003** | System shall log all errors for debugging |

## 5.3 Security Requirements

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| **NFR-SEC-001** | Passwords shall be hashed using bcrypt | HIGH |
| **NFR-SEC-002** | Authentication shall use JWT tokens | HIGH |
| **NFR-SEC-003** | API endpoints shall verify authentication | HIGH |
| **NFR-SEC-004** | Role-based access control shall be enforced | HIGH |
| **NFR-SEC-005** | HTTPS shall be used in production | HIGH |
| **NFR-SEC-006** | Security headers shall be implemented (Helmet) | MEDIUM |
| **NFR-SEC-007** | CORS shall be properly configured | MEDIUM |
| **NFR-SEC-008** | SQL injection shall be prevented (parameterized queries) | HIGH |
| **NFR-SEC-009** | XSS attacks shall be prevented | HIGH |
| **NFR-SEC-010** | CSRF protection shall be implemented | MEDIUM |

## 5.4 Software Quality Attributes

### 5.4.1 Availability

| Req ID | Requirement | Target |
|--------|-------------|--------|
| **NFR-AVAIL-001** | System uptime | 99.5% |
| **NFR-AVAIL-002** | Planned maintenance window | < 4 hours/month |
| **NFR-AVAIL-003** | Recovery time | < 4 hours |

### 5.4.2 Maintainability

| Req ID | Requirement |
|--------|-------------|
| **NFR-MAINT-001** | Code shall follow consistent coding standards |
| **NFR-MAINT-002** | System shall be modular for easy updates |
| **NFR-MAINT-003** | Documentation shall be maintained |
| **NFR-MAINT-004** | Dependencies shall be regularly updated |

### 5.4.3 Scalability

| Req ID | Requirement |
|--------|-------------|
| **NFR-SCALE-001** | Database shall use connection pooling |
| **NFR-SCALE-002** | API shall be stateless for horizontal scaling |
| **NFR-SCALE-003** | File storage shall be upgradable to cloud storage |

### 5.4.4 Usability

| Req ID | Requirement |
|--------|-------------|
| **NFR-USE-001** | New users shall be able to use system with minimal training |
| **NFR-USE-002** | Error messages shall be clear and actionable |
| **NFR-USE-003** | UI shall be intuitive and consistent |
| **NFR-USE-004** | Critical actions shall have confirmation dialogs |

### 5.4.5 Portability

| Req ID | Requirement |
|--------|-------------|
| **NFR-PORT-001** | System shall work on major browsers |
| **NFR-PORT-002** | Backend shall run on Linux and Windows |
| **NFR-PORT-003** | Database shall be MySQL compatible |

## 5.5 Business Rules

| Rule ID | Description |
|---------|-------------|
| **BR-001** | New users are assigned CREATOR role by default |
| **BR-002** | Only Admins can change user roles |
| **BR-003** | Only Admins can deactivate/delete users |
| **BR-004** | Creators can only edit DRAFT and REJECTED posts |
| **BR-005** | Managers/Admins can delete any post |
| **BR-006** | Posts require media file to be created |
| **BR-007** | Rejection requires a reason message |
| **BR-008** | Deactivated users cannot login |

---

# 6. Other Requirements

## 6.1 Data Requirements

### 6.1.1 Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| User Accounts | Until deleted by Admin |
| Posts | Until deleted or automated cleanup |
| Media Files | Cleanup after post deletion (scheduled) |
| Logs | 90 days |

### 6.1.2 Data Backup

| Requirement | Specification |
|-------------|---------------|
| Frequency | Daily |
| Type | Full database backup |
| Storage | Off-site storage |
| Retention | 30 days |

## 6.2 Legal Requirements

| Requirement | Description |
|-------------|-------------|
| Privacy Policy | System shall have accessible privacy policy |
| Terms of Service | System shall have accessible terms of service |
| Data Protection | System shall comply with data protection regulations |
| Content Rights | Users shall retain rights to their content |

## 6.3 Internationalization

| Requirement | Current Status |
|-------------|----------------|
| Language | English only (v1.0) |
| Date Format | ISO 8601 |
| Time Zone | Server time (configurable) |

---

# 7. Appendices

## 7.1 Appendix A: Database Schema

```sql
-- Users Table
CREATE TABLE users (
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

-- Posts Table
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    media_type ENUM('IMAGE', 'VIDEO') NOT NULL,
    media_path VARCHAR(255) NOT NULL,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED') 
           NOT NULL DEFAULT 'DRAFT',
    rejection_reason TEXT,
    media_deleted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 7.2 Appendix B: API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/users | List users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| PUT | /api/users/:id/role | Change role |
| PUT | /api/users/:id/status | Toggle status |
| POST | /api/posts | Create post |
| GET | /api/posts | List posts |
| GET | /api/posts/:id | Get post |
| PUT | /api/posts/:id | Update post |
| DELETE | /api/posts/:id | Delete post |
| PUT | /api/posts/:id/status | Approve/Reject |
| POST | /api/posts/:id/publish | Publish post |
| GET | /api/posts/stats | System stats |
| GET | /api/profile | Get profile |
| PUT | /api/profile | Update profile |
| POST | /api/profile/password | Change password |
| POST | /api/profile/picture | Upload picture |
| GET | /api/settings | Get settings |
| PUT | /api/settings | Update settings |

## 7.3 Appendix C: Glossary

| Term | Definition |
|------|------------|
| Post | A content item consisting of title, description, and media |
| Media | Image or video file uploaded by user |
| Workflow | The process of content moving through different statuses |
| Creator | User role that creates content |
| Manager | User role that reviews and approves content |
| Admin | User role with full system access |
| JWT | JSON Web Token used for authentication |
| RBAC | Role-Based Access Control |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Quality Assurance | | | |
| Client Representative | | | |

---

**© 2026 Media Management Portal. All Rights Reserved.**

*This document is a complete Software Requirements Specification following IEEE 830-1998 standards.*
