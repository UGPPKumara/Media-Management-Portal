# Media Management Portal
## User Manual

---

| **Document Info** | |
|-------------------|-----------------|
| **System** | Media Management Portal |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-02-02 |
| **Audience** | End Users (Creators, Managers, Admins) |

---

## 📖 Table of Contents

1. [Getting Started](#1-getting-started)
2. [Account Management](#2-account-management)
3. [Creator Guide](#3-creator-guide)
4. [Manager Guide](#4-manager-guide)
5. [Admin Guide](#5-admin-guide)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Getting Started

### 1.1 System Requirements

| Requirement | Minimum |
|-------------|---------|
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Internet | Stable connection |
| Screen | 1280x720 or higher |

### 1.2 Accessing the Portal

1. Open your web browser
2. Navigate to: `https://your-portal-url.com`
3. You will see the login page

### 1.3 User Roles Overview

| Role | Description |
|------|-------------|
| **Creator** | Upload and manage your own media content |
| **Manager** | Review, approve, or reject submitted content |
| **Admin** | Full system access, manage users and settings |

---

## 2. Account Management

### 2.1 Creating an Account

1. Click **"Register"** on the login page
2. Fill in the form:
   - **Username**: Your display name
   - **Email**: Your email address
   - **Password**: Minimum 6 characters
3. Click **"Register"** button
4. You'll be redirected to login

> ⚠️ **Note**: New accounts are created with "Creator" role by default.

### 2.2 Logging In

1. Enter your **Email**
2. Enter your **Password**
3. Click **"Login"** button
4. You'll be redirected to your dashboard

### 2.3 Forgot Password

1. Click **"Forgot Password?"** on login page
2. Enter your registered email
3. Click **"Send Reset Link"**
4. Check your email for the reset link
5. Click the link and enter your new password

### 2.4 Updating Your Profile

1. Click your **profile icon** in the navigation bar
2. Or go to **Dashboard → Profile**
3. You can update:
   - Username
   - Email
   - Profile Picture
4. Click **"Save Changes"**

### 2.5 Changing Password

1. Go to **Profile** page
2. Scroll to **"Change Password"** section
3. Enter:
   - Current Password
   - New Password
   - Confirm New Password
4. Click **"Update Password"**

### 2.6 Logging Out

1. Click your **profile icon** in the top right
2. Click **"Sign Out"**
3. Confirm the logout

---

## 3. Creator Guide

### 3.1 Dashboard Overview

When you log in as a Creator, you'll see:

```
┌─────────────────────────────────────────────────────┐
│  📊 YOUR STATISTICS                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Total   │ │ Pending │ │Approved │ │Rejected │   │
│  │ Posts   │ │ Posts   │ │ Posts   │ │ Posts   │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                     │
│  📝 YOUR RECENT POSTS                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ Post Title │ Status │ Date │ Actions         │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Creating a New Post

1. Click **"Create Post"** button (or use sidebar)
2. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| Title | ✅ | Post title (max 255 characters) |
| Description | ❌ | Optional post description |
| Media | ✅ | Upload image or video |

3. Choose an action:
   - **Save as Draft**: Save without submitting
   - **Submit for Review**: Send to Manager for approval

### 3.3 Supported Media Formats

| Type | Formats | Max Size |
|------|---------|----------|
| **Images** | JPEG, JPG, PNG, GIF | 50 MB |
| **Videos** | MP4, MOV, AVI | 50 MB |

### 3.4 Understanding Post Status

| Status | Meaning | What You Can Do |
|--------|---------|-----------------|
| 🔵 **DRAFT** | Saved but not submitted | Edit, Submit, Delete |
| 🟡 **PENDING** | Waiting for review | View only |
| 🟢 **APPROVED** | Ready for publishing | View only |
| 🔴 **REJECTED** | Needs changes | Edit & Resubmit |
| 🟣 **PUBLISHED** | Live on social media | View only |

### 3.5 Editing a Post

> ⚠️ You can only edit **DRAFT** or **REJECTED** posts.

1. Go to **Posts** page
2. Find your post
3. Click **"Edit"** button
4. Make your changes
5. Click **"Save as Draft"** or **"Submit for Review"**

### 3.6 Viewing Rejection Feedback

If your post was rejected:

1. Go to **Posts** page
2. Find the rejected post (🔴 status)
3. Click **"View"** to see rejection reason
4. Click **"Edit"** to make corrections
5. Resubmit for review

### 3.7 Deleting a Post

1. Go to **Posts** page
2. Find your post
3. Click **"Delete"** button
4. Confirm deletion

> ⚠️ **Warning**: Deleted posts cannot be recovered!

---

## 4. Manager Guide

### 4.1 Dashboard Overview

Managers see additional statistics and activity:

```
┌─────────────────────────────────────────────────────┐
│  📊 SYSTEM STATISTICS                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Total   │ │ Pending │ │Approved │ │ Users   │   │
│  │ Posts   │ │ Review  │ │ Posts   │ │ Count   │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                     │
│  📋 PENDING REVIEWS                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ Title │ Creator │ Date │ Approve │ Reject   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 4.2 Reviewing Posts

1. Go to **Posts** page
2. Filter by **"Pending"** status
3. Click on a post to review
4. View the media and details
5. Choose an action:
   - ✅ **Approve**: Content is good
   - ❌ **Reject**: Content needs changes

### 4.3 Approving a Post

1. Click **"Approve"** button on the post
2. Confirm the action
3. Post status changes to **APPROVED**
4. Creator will see the updated status

### 4.4 Rejecting a Post

1. Click **"Reject"** button on the post
2. **Enter rejection reason** (required)
   - Be specific about what needs to change
   - Provide constructive feedback
3. Click **"Submit Rejection"**
4. Post status changes to **REJECTED**
5. Creator will see your feedback

**Example Rejection Reasons:**
- "Image quality is too low, please upload higher resolution"
- "Content doesn't match company guidelines"
- "Please add a more descriptive caption"

### 4.5 Publishing to Social Media

For **APPROVED** posts:

1. Find the approved post
2. Click **"Publish"** button
3. Select platforms (e.g., Facebook)
4. Confirm publishing
5. Post status changes to **PUBLISHED**

### 4.6 Viewing All Users

1. Go to **Users** page (sidebar)
2. View list of all registered users
3. See their:
   - Username
   - Email
   - Role
   - Status
   - Registration date

### 4.7 Viewing User Posts

1. Go to **Users** page
2. Click on a user's name
3. View their post history and statistics

---

## 5. Admin Guide

### 5.1 Dashboard Overview

Admins have full access to all features:

```
┌─────────────────────────────────────────────────────┐
│  📊 COMPLETE SYSTEM OVERVIEW                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Total   │ │ Active  │ │ Storage │ │ Recent  │   │
│  │ Users   │ │ Users   │ │ Used    │ │Activity │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                     │
│  Sidebar: Dashboard │ Posts │ Users │ Settings     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Managing Users

#### View All Users

1. Go to **Users** page
2. See complete user list with:
   - ID, Username, Email
   - Role, Status
   - Join Date

#### Create New User

1. Click **"Add User"** button
2. Fill in:
   - Username
   - Email
   - Password
   - Role (Creator/Manager/Admin)
3. Click **"Create User"**

#### Change User Role

1. Find the user in the list
2. Click on **Role** dropdown
3. Select new role:
   - Creator
   - Manager
   - Admin
4. Confirm the change

#### Activate/Deactivate User

1. Find the user in the list
2. Toggle the **Status** switch
   - ✅ Active: User can login
   - ❌ Inactive: User cannot login
3. Confirm the action

#### Delete User

1. Find the user in the list
2. Click **"Delete"** button
3. Confirm deletion

> ⚠️ **Warning**: Deleting a user also deletes all their posts!

### 5.3 System Settings

1. Go to **Settings** page (sidebar)
2. Configure:

| Setting | Description |
|---------|-------------|
| Company Name | Displayed in portal header |
| Company Logo | Upload your logo image |

3. Click **"Save Settings"**

### 5.4 Storage Management

1. Go to **Dashboard**
2. View **Storage Statistics**:
   - Total storage used
   - Image storage
   - Video storage
3. Consider cleanup if storage is high

### 5.5 Activity Monitoring

1. Go to **Dashboard**
2. View **Recent Activity** section
3. See:
   - New posts created
   - Posts approved/rejected
   - New user registrations

---

## 6. Troubleshooting

### 6.1 Common Issues

#### Cannot Login

| Problem | Solution |
|---------|----------|
| Wrong password | Use "Forgot Password" to reset |
| Account deactivated | Contact your Admin |
| Browser issue | Clear cache and cookies |

#### Upload Failed

| Problem | Solution |
|---------|----------|
| File too large | Reduce file size (max 50MB) |
| Wrong format | Use supported formats only |
| Slow connection | Wait and retry |

#### Post Not Showing

| Problem | Solution |
|---------|----------|
| Still in Draft | Submit for review |
| Pending review | Wait for Manager approval |
| Deleted | Check with Admin |

#### Cannot Edit Post

| Problem | Solution |
|---------|----------|
| Post is Pending | Wait for review result |
| Post is Approved | No edits after approval |
| Post is Published | Cannot edit published posts |

### 6.2 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Unauthorized" | Session expired | Login again |
| "Access denied" | No permission | Use correct role account |
| "File too large" | Size exceeds limit | Compress the file |
| "Invalid format" | Wrong file type | Use supported formats |

### 6.3 Getting Help

If you encounter issues not covered here:

1. **Check this guide** again
2. **Contact your Manager** or **Admin**
3. **Email support**: support@yourcompany.com

---

## Quick Reference Card

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New Post (on Posts page) |
| `Esc` | Close modals |
| `Enter` | Confirm dialogs |

### Post Status Colors

| Color | Status |
|-------|--------|
| 🔵 Blue | Draft |
| 🟡 Yellow | Pending |
| 🟢 Green | Approved |
| 🔴 Red | Rejected |
| 🟣 Purple | Published |

### Role Capabilities Summary

| Action | Creator | Manager | Admin |
|--------|:-------:|:-------:|:-----:|
| Create posts | ✅ | ✅ | ✅ |
| Edit own posts | ✅ | ❌ | ❌ |
| Approve posts | ❌ | ✅ | ✅ |
| Manage users | ❌ | View | ✅ |
| System settings | ❌ | ❌ | ✅ |

---

**© 2026 Media Management Portal. All Rights Reserved.**

*Need help? Contact your system administrator.*
