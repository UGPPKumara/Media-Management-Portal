# Test Cases Document
## Media Management Portal

---

| **Document Info** | |
|-------------------|-----------------|
| **Project** | Media Management Portal |
| **Version** | 1.0.0 |
| **Date** | 2026-02-02 |
| **Tester** | QA Team |

---

## 📖 Table of Contents

1. [Authentication Tests](#1-authentication-tests)
2. [User Management Tests](#2-user-management-tests)
3. [Post Management Tests](#3-post-management-tests)
4. [Approval Workflow Tests](#4-approval-workflow-tests)
5. [Profile Management Tests](#5-profile-management-tests)
6. [Dashboard Tests](#6-dashboard-tests)
7. [Security Tests](#7-security-tests)
8. [Performance Tests](#8-performance-tests)

---

# 1. Authentication Tests

## TC-AUTH-001: User Registration - Valid Data

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-001 |
| **Title** | User Registration with Valid Data |
| **Priority** | High |
| **Preconditions** | Application is running, database is empty |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /register | Registration form is displayed |
| 2 | Enter username: "testuser1" | Field accepts input |
| 3 | Enter email: "test@example.com" | Field accepts input |
| 4 | Enter password: "Password123" | Field accepts input (masked) |
| 5 | Click "Register" button | Success message displayed |
| 6 | Check database | New user record exists |

**Status:** [ ] Pass [ ] Fail

---

## TC-AUTH-002: User Registration - Duplicate Email

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-002 |
| **Title** | Registration with Existing Email |
| **Priority** | High |
| **Preconditions** | User with email "test@example.com" exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /register | Registration form displayed |
| 2 | Enter username: "newuser" | Field accepts input |
| 3 | Enter email: "test@example.com" | Field accepts input |
| 4 | Enter password: "Password123" | Field accepts input |
| 5 | Click "Register" button | Error: "Email already exists" |

**Status:** [ ] Pass [ ] Fail

---

## TC-AUTH-003: User Login - Valid Credentials

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-003 |
| **Title** | Login with Valid Credentials |
| **Priority** | High |
| **Preconditions** | User account exists and is active |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /login | Login form displayed |
| 2 | Enter email: "test@example.com" | Field accepts input |
| 3 | Enter password: "Password123" | Field accepts input |
| 4 | Click "Login" button | Redirected to dashboard |
| 5 | Check localStorage | JWT token stored |

**Status:** [ ] Pass [ ] Fail

---

## TC-AUTH-004: User Login - Invalid Password

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-004 |
| **Title** | Login with Wrong Password |
| **Priority** | High |
| **Preconditions** | User account exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /login | Login form displayed |
| 2 | Enter email: "test@example.com" | Field accepts input |
| 3 | Enter password: "WrongPassword" | Field accepts input |
| 4 | Click "Login" button | Error: "Invalid credentials" |

**Status:** [ ] Pass [ ] Fail

---

## TC-AUTH-005: User Login - Deactivated Account

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-005 |
| **Title** | Login with Deactivated Account |
| **Priority** | High |
| **Preconditions** | User account exists but is_active = false |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /login | Login form displayed |
| 2 | Enter valid credentials | Fields accept input |
| 3 | Click "Login" button | Error: "Account is deactivated" |

**Status:** [ ] Pass [ ] Fail

---

## TC-AUTH-006: Password Reset Flow

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-006 |
| **Title** | Complete Password Reset Flow |
| **Priority** | High |
| **Preconditions** | User account exists, email service configured |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /forgot-password | Form displayed |
| 2 | Enter email: "test@example.com" | Field accepts input |
| 3 | Click "Send Reset Link" | Success message displayed |
| 4 | Check email inbox | Reset email received |
| 5 | Click reset link in email | Reset password page opens |
| 6 | Enter new password | Field accepts input |
| 7 | Click "Reset Password" | Success message displayed |
| 8 | Login with new password | Login successful |

**Status:** [ ] Pass [ ] Fail

---

## TC-AUTH-007: Logout

| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-007 |
| **Title** | User Logout |
| **Priority** | Medium |
| **Preconditions** | User is logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click profile icon | Dropdown menu appears |
| 2 | Click "Sign Out" | Confirmation modal appears |
| 3 | Confirm logout | Redirected to login page |
| 4 | Check localStorage | Token removed |
| 5 | Navigate to /dashboard | Redirected to login |

**Status:** [ ] Pass [ ] Fail

---

# 2. User Management Tests

## TC-USER-001: View Users List (Admin)

| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-001 |
| **Title** | Admin Views User List |
| **Priority** | High |
| **Preconditions** | Logged in as Admin, multiple users exist |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard/users | Users page displayed |
| 2 | Verify user list | All users displayed in table |
| 3 | Check columns | ID, Username, Email, Role, Status, Date visible |

**Status:** [ ] Pass [ ] Fail

---

## TC-USER-002: Create New User (Admin)

| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-002 |
| **Title** | Admin Creates New User |
| **Priority** | High |
| **Preconditions** | Logged in as Admin |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add User" button | Modal/form appears |
| 2 | Enter username: "newcreator" | Field accepts input |
| 3 | Enter email: "creator@test.com" | Field accepts input |
| 4 | Enter password: "Password123" | Field accepts input |
| 5 | Select role: "CREATOR" | Role selected |
| 6 | Click "Create" | Success message, user added to list |

**Status:** [ ] Pass [ ] Fail

---

## TC-USER-003: Change User Role (Admin)

| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-003 |
| **Title** | Admin Changes User Role |
| **Priority** | High |
| **Preconditions** | Logged in as Admin, Creator user exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find Creator user in list | User visible |
| 2 | Click role dropdown | Options appear |
| 3 | Select "MANAGER" | Confirmation prompt |
| 4 | Confirm change | Role updated, list refreshes |
| 5 | Verify in database | Role changed to MANAGER |

**Status:** [ ] Pass [ ] Fail

---

## TC-USER-004: Deactivate User (Admin)

| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-004 |
| **Title** | Admin Deactivates User |
| **Priority** | High |
| **Preconditions** | Logged in as Admin, active user exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find active user in list | Status shows "Active" |
| 2 | Click status toggle | Confirmation prompt |
| 3 | Confirm deactivation | Status changes to "Inactive" |
| 4 | User tries to login | Login fails with deactivation message |

**Status:** [ ] Pass [ ] Fail

---

## TC-USER-005: Delete User (Admin)

| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-005 |
| **Title** | Admin Deletes User |
| **Priority** | Medium |
| **Preconditions** | Logged in as Admin, user with posts exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find user in list | User visible |
| 2 | Click "Delete" button | Confirmation modal appears |
| 3 | Confirm deletion | User removed from list |
| 4 | Check database | User and their posts deleted |

**Status:** [ ] Pass [ ] Fail

---

## TC-USER-006: Unauthorized Access - Creator Views Users

| Field | Value |
|-------|-------|
| **Test ID** | TC-USER-006 |
| **Title** | Creator Cannot Access User Management |
| **Priority** | High |
| **Preconditions** | Logged in as Creator |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard/users | Access denied or redirected |
| 2 | Call GET /api/users directly | 403 Forbidden response |

**Status:** [ ] Pass [ ] Fail

---

# 3. Post Management Tests

## TC-POST-001: Create Post with Image

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-001 |
| **Title** | Create Post with Image Upload |
| **Priority** | High |
| **Preconditions** | Logged in as Creator |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /create-post | Form displayed |
| 2 | Enter title: "Test Post" | Field accepts input |
| 3 | Enter description: "Test content" | Field accepts input |
| 4 | Upload image (JPG, 2MB) | File preview shown |
| 5 | Click "Submit for Review" | Success message |
| 6 | Check posts list | Post visible with PENDING status |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-002: Create Post with Video

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-002 |
| **Title** | Create Post with Video Upload |
| **Priority** | High |
| **Preconditions** | Logged in as Creator |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /create-post | Form displayed |
| 2 | Enter title: "Video Post" | Field accepts input |
| 3 | Upload video (MP4, 20MB) | Upload progress shown |
| 4 | Click "Submit for Review" | Success message |
| 5 | Check posts list | Post visible, media_type = VIDEO |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-003: Save Post as Draft

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-003 |
| **Title** | Save Post as Draft |
| **Priority** | High |
| **Preconditions** | Logged in as Creator |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /create-post | Form displayed |
| 2 | Fill in title and upload media | Data entered |
| 3 | Click "Save as Draft" | Success message |
| 4 | Check posts list | Post visible with DRAFT status |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-004: Edit Draft Post

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-004 |
| **Title** | Edit Existing Draft Post |
| **Priority** | High |
| **Preconditions** | Logged in as Creator, draft post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to posts list | Draft post visible |
| 2 | Click "Edit" on draft post | Edit form with existing data |
| 3 | Change title to "Updated Title" | Field updated |
| 4 | Click "Save" | Success message |
| 5 | Verify changes | Title updated in database |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-005: Submit Draft for Review

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-005 |
| **Title** | Submit Draft Post for Review |
| **Priority** | High |
| **Preconditions** | Draft post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open draft post for edit | Edit form displayed |
| 2 | Click "Submit for Review" | Status changes to PENDING |
| 3 | Verify post status | PENDING in database |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-006: Cannot Edit Pending Post

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-006 |
| **Title** | Creator Cannot Edit Pending Post |
| **Priority** | High |
| **Preconditions** | Post with PENDING status exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to posts list | Pending post visible |
| 2 | Check for "Edit" button | Edit button not visible or disabled |
| 3 | Navigate directly to /post-edit?id=X | Access denied or read-only |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-007: Delete Own Post

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-007 |
| **Title** | Creator Deletes Own Post |
| **Priority** | Medium |
| **Preconditions** | Logged in as Creator, own post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find own post in list | Post visible |
| 2 | Click "Delete" button | Confirmation modal |
| 3 | Confirm deletion | Post removed from list |
| 4 | Check uploads folder | Media file deleted |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-008: File Size Limit Exceeded

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-008 |
| **Title** | Upload File Exceeds 50MB Limit |
| **Priority** | Medium |
| **Preconditions** | Have a file larger than 50MB |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /create-post | Form displayed |
| 2 | Enter title | Field accepts input |
| 3 | Upload file (60MB) | Error: "File too large" |

**Status:** [ ] Pass [ ] Fail

---

## TC-POST-009: Invalid File Type

| Field | Value |
|-------|-------|
| **Test ID** | TC-POST-009 |
| **Title** | Upload Unsupported File Type |
| **Priority** | Medium |
| **Preconditions** | Have a .pdf or .doc file |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /create-post | Form displayed |
| 2 | Enter title | Field accepts input |
| 3 | Upload .pdf file | Error: "Invalid file type" |

**Status:** [ ] Pass [ ] Fail

---

# 4. Approval Workflow Tests

## TC-APPR-001: Manager Approves Post

| Field | Value |
|-------|-------|
| **Test ID** | TC-APPR-001 |
| **Title** | Manager Approves Pending Post |
| **Priority** | High |
| **Preconditions** | Logged in as Manager, pending post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to posts list | Pending posts visible |
| 2 | Filter by "Pending" status | Pending posts filtered |
| 3 | Click on pending post | Post details displayed |
| 4 | Click "Approve" button | Confirmation prompt |
| 5 | Confirm approval | Status changes to APPROVED |

**Status:** [ ] Pass [ ] Fail

---

## TC-APPR-002: Manager Rejects Post with Reason

| Field | Value |
|-------|-------|
| **Test ID** | TC-APPR-002 |
| **Title** | Manager Rejects Post with Feedback |
| **Priority** | High |
| **Preconditions** | Logged in as Manager, pending post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find pending post | Post visible |
| 2 | Click "Reject" button | Rejection modal appears |
| 3 | Enter reason: "Image quality too low" | Reason entered |
| 4 | Click "Submit Rejection" | Status changes to REJECTED |
| 5 | Creator views post | Rejection reason visible |

**Status:** [ ] Pass [ ] Fail

---

## TC-APPR-003: Reject Without Reason

| Field | Value |
|-------|-------|
| **Test ID** | TC-APPR-003 |
| **Title** | Cannot Reject Without Reason |
| **Priority** | High |
| **Preconditions** | Logged in as Manager, pending post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Reject" on post | Rejection modal appears |
| 2 | Leave reason empty | Submit button disabled or validation error |
| 3 | Try to submit | Error: "Rejection reason is required" |

**Status:** [ ] Pass [ ] Fail

---

## TC-APPR-004: Creator Edits Rejected Post

| Field | Value |
|-------|-------|
| **Test ID** | TC-APPR-004 |
| **Title** | Creator Edits and Resubmits Rejected Post |
| **Priority** | High |
| **Preconditions** | Logged in as Creator, rejected post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to posts list | Rejected post visible |
| 2 | View rejection reason | Reason displayed |
| 3 | Click "Edit" button | Edit form opens |
| 4 | Make changes | Changes applied |
| 5 | Click "Submit for Review" | Status changes to PENDING |

**Status:** [ ] Pass [ ] Fail

---

## TC-APPR-005: Publish Approved Post

| Field | Value |
|-------|-------|
| **Test ID** | TC-APPR-005 |
| **Title** | Manager Publishes Approved Post |
| **Priority** | Medium |
| **Preconditions** | Approved post exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find approved post | Post visible |
| 2 | Click "Publish" button | Publish modal appears |
| 3 | Select platform (Facebook) | Platform selected |
| 4 | Confirm publishing | Status changes to PUBLISHED |

**Status:** [ ] Pass [ ] Fail

---

# 5. Profile Management Tests

## TC-PROF-001: Update Profile Information

| Field | Value |
|-------|-------|
| **Test ID** | TC-PROF-001 |
| **Title** | User Updates Profile |
| **Priority** | Medium |
| **Preconditions** | User is logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to profile page | Profile form displayed |
| 2 | Change username to "newname" | Field updated |
| 3 | Click "Save Changes" | Success message |
| 4 | Verify in navbar | New username displayed |

**Status:** [ ] Pass [ ] Fail

---

## TC-PROF-002: Upload Profile Picture

| Field | Value |
|-------|-------|
| **Test ID** | TC-PROF-002 |
| **Title** | Upload Profile Picture |
| **Priority** | Low |
| **Preconditions** | User is logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to profile page | Profile form displayed |
| 2 | Click upload picture | File dialog opens |
| 3 | Select image (JPG, 2MB) | Preview displayed |
| 4 | Confirm upload | Picture changed |
| 5 | Check uploads/profiles folder | File exists |

**Status:** [ ] Pass [ ] Fail

---

## TC-PROF-003: Change Password

| Field | Value |
|-------|-------|
| **Test ID** | TC-PROF-003 |
| **Title** | Change Account Password |
| **Priority** | High |
| **Preconditions** | User is logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to profile page | Password section visible |
| 2 | Enter current password | Field accepts input |
| 3 | Enter new password | Field accepts input |
| 4 | Confirm new password | Field accepts input |
| 5 | Click "Update Password" | Success message |
| 6 | Logout and login with new password | Login successful |

**Status:** [ ] Pass [ ] Fail

---

## TC-PROF-004: Wrong Current Password

| Field | Value |
|-------|-------|
| **Test ID** | TC-PROF-004 |
| **Title** | Change Password with Wrong Current |
| **Priority** | High |
| **Preconditions** | User is logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to profile page | Password section visible |
| 2 | Enter wrong current password | Field accepts input |
| 3 | Enter new password | Field accepts input |
| 4 | Click "Update Password" | Error: "Current password is incorrect" |

**Status:** [ ] Pass [ ] Fail

---

# 6. Dashboard Tests

## TC-DASH-001: Creator Dashboard Stats

| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-001 |
| **Title** | Creator Views Personal Statistics |
| **Priority** | Medium |
| **Preconditions** | Logged in as Creator with posts |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard | Dashboard displayed |
| 2 | View statistics cards | Personal post counts shown |
| 3 | Verify counts match posts | Numbers accurate |

**Status:** [ ] Pass [ ] Fail

---

## TC-DASH-002: Manager Dashboard Stats

| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-002 |
| **Title** | Manager Views System Statistics |
| **Priority** | Medium |
| **Preconditions** | Logged in as Manager |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard | Dashboard displayed |
| 2 | View statistics cards | System-wide counts shown |
| 3 | View pending count | Correct pending posts count |
| 4 | View activity feed | Recent activity displayed |

**Status:** [ ] Pass [ ] Fail

---

# 7. Security Tests

## TC-SEC-001: Access Without Authentication

| Field | Value |
|-------|-------|
| **Test ID** | TC-SEC-001 |
| **Title** | Access Protected Routes Without Login |
| **Priority** | High |
| **Preconditions** | User is not logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard | Redirected to /login |
| 2 | Call GET /api/posts | 403 Forbidden |
| 3 | Call POST /api/posts | 403 Forbidden |

**Status:** [ ] Pass [ ] Fail

---

## TC-SEC-002: Access With Expired Token

| Field | Value |
|-------|-------|
| **Test ID** | TC-SEC-002 |
| **Title** | API Call with Expired Token |
| **Priority** | High |
| **Preconditions** | Have an expired JWT token |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call API with expired token | 401 Unauthorized |
| 2 | Check response message | "Token expired" or similar |

**Status:** [ ] Pass [ ] Fail

---

## TC-SEC-003: SQL Injection Attempt

| Field | Value |
|-------|-------|
| **Test ID** | TC-SEC-003 |
| **Title** | SQL Injection Prevention |
| **Priority** | High |
| **Preconditions** | Application is running |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter in login email: `' OR '1'='1` | Login fails, no SQL error |
| 2 | Enter in search: `'; DROP TABLE users;--` | No SQL execution |

**Status:** [ ] Pass [ ] Fail

---

## TC-SEC-004: Role Escalation Attempt

| Field | Value |
|-------|-------|
| **Test ID** | TC-SEC-004 |
| **Title** | Creator Attempts Role Escalation |
| **Priority** | High |
| **Preconditions** | Logged in as Creator |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call PUT /api/users/1/role | 403 Forbidden |
| 2 | Modify own JWT token role | Signature invalid, rejected |

**Status:** [ ] Pass [ ] Fail

---

# 8. Performance Tests

## TC-PERF-001: Page Load Time

| Field | Value |
|-------|-------|
| **Test ID** | TC-PERF-001 |
| **Title** | Dashboard Load Time |
| **Priority** | Medium |
| **Preconditions** | Application deployed |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear browser cache | Cache cleared |
| 2 | Navigate to dashboard | Page loads |
| 3 | Measure load time | < 3 seconds |

**Status:** [ ] Pass [ ] Fail

---

## TC-PERF-002: Large File Upload

| Field | Value |
|-------|-------|
| **Test ID** | TC-PERF-002 |
| **Title** | Upload 50MB Video |
| **Priority** | Medium |
| **Preconditions** | Have 50MB video file |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create post | Form displayed |
| 2 | Upload 50MB video | Upload progress shown |
| 3 | Measure upload time | < 60 seconds |
| 4 | Verify successful upload | Post created |

**Status:** [ ] Pass [ ] Fail

---

## TC-PERF-003: Concurrent Users

| Field | Value |
|-------|-------|
| **Test ID** | TC-PERF-003 |
| **Title** | 50 Concurrent User Sessions |
| **Priority** | Medium |
| **Preconditions** | Load testing tool available |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate 50 concurrent logins | All successful |
| 2 | Simulate 50 concurrent API calls | All respond < 500ms |
| 3 | Check server resources | CPU < 80%, RAM < 80% |

**Status:** [ ] Pass [ ] Fail

---

## Test Summary

| Category | Total Tests | Pass | Fail | Pending |
|----------|-------------|------|------|---------|
| Authentication | 7 | | | |
| User Management | 6 | | | |
| Post Management | 9 | | | |
| Approval Workflow | 5 | | | |
| Profile Management | 4 | | | |
| Dashboard | 2 | | | |
| Security | 4 | | | |
| Performance | 3 | | | |
| **TOTAL** | **40** | | | |

---

**Tested By:** _________________  
**Date:** _________________  
**Approved By:** _________________

---

**© 2026 Media Management Portal. All Rights Reserved.**
