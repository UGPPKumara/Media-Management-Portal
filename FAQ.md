# Frequently Asked Questions (FAQ)
## Media Management Portal

---

## 📖 Table of Contents

1. [General Questions](#general-questions)
2. [Account & Login](#account--login)
3. [Creating Content](#creating-content)
4. [Approval Process](#approval-process)
5. [User Roles](#user-roles)
6. [Technical Issues](#technical-issues)
7. [Security & Privacy](#security--privacy)

---

# General Questions

### Q1: What is the Media Management Portal?

The Media Management Portal is a web-based content management system that allows organizations to upload, review, approve, and publish media content (images and videos) through a structured workflow.

---

### Q2: What browsers are supported?

| Browser | Minimum Version |
|---------|-----------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Safari | 14+ |
| Microsoft Edge | 90+ |

---

### Q3: Can I use it on mobile devices?

Yes, the portal is responsive and works on tablets and smartphones. However, for the best experience, we recommend using a desktop or laptop.

---

### Q4: Is there a mobile app?

Currently, only the web version is available. A mobile app may be developed in future versions.

---

# Account & Login

### Q5: How do I create an account?

1. Go to the registration page
2. Enter your username, email, and password
3. Click "Register"
4. Wait for admin approval (if required)

---

### Q6: I forgot my password. What should I do?

1. Click "Forgot Password?" on the login page
2. Enter your registered email
3. Check your inbox for the reset link
4. Click the link and create a new password

---

### Q7: Why can't I log in?

Possible reasons:

| Issue | Solution |
|-------|----------|
| Wrong password | Use "Forgot Password" to reset |
| Account deactivated | Contact your administrator |
| Account not created | Register for a new account |
| Browser cache issue | Clear cookies and try again |

---

### Q8: How do I change my password?

1. Log in to your account
2. Go to Profile
3. Scroll to "Change Password" section
4. Enter current and new password
5. Click "Update Password"

---

### Q9: How do I update my profile picture?

1. Go to Profile page
2. Click on the profile picture area
3. Select an image file (JPG, PNG, or WebP)
4. The picture will upload automatically

---

# Creating Content

### Q10: What file types can I upload?

| Type | Supported Formats |
|------|-------------------|
| **Images** | JPEG, JPG, PNG, GIF |
| **Videos** | MP4, MOV, AVI |

---

### Q11: What is the maximum file size?

The maximum file size is **50 MB** for both images and videos.

---

### Q12: What's the difference between "Save as Draft" and "Submit for Review"?

| Action | Result |
|--------|--------|
| **Save as Draft** | Post is saved but not submitted. You can edit it later. |
| **Submit for Review** | Post is sent to managers for approval. You cannot edit until reviewed. |

---

### Q13: Can I edit a post after submitting it?

You can only edit posts with these statuses:

| Status | Can Edit? |
|--------|-----------|
| DRAFT | ✅ Yes |
| PENDING | ❌ No |
| APPROVED | ❌ No |
| REJECTED | ✅ Yes |
| PUBLISHED | ❌ No |

---

### Q14: How do I delete a post?

1. Go to your posts list
2. Find the post you want to delete
3. Click the "Delete" button
4. Confirm the deletion

⚠️ **Warning:** Deleted posts cannot be recovered!

---

### Q15: Why was my post rejected?

When a manager rejects your post, they provide a reason. To view it:

1. Go to your posts list
2. Find the rejected post
3. Click to view details
4. The rejection reason will be displayed

---

# Approval Process

### Q16: How long does approval take?

Approval time depends on your organization's workflow. Typically:

- Small organizations: 1-2 hours
- Large organizations: 24-48 hours

Contact your manager for specific timelines.

---

### Q17: Can I expedite the approval process?

The portal doesn't have a priority queue. Contact your manager directly for urgent content.

---

### Q18: What happens after my post is approved?

Once approved, your post:

1. Changes to "APPROVED" status
2. Can be published by managers
3. Cannot be edited anymore

---

### Q19: Can I resubmit a rejected post?

Yes! When your post is rejected:

1. View the rejection reason
2. Click "Edit" on the post
3. Make the required changes
4. Click "Submit for Review"
5. The post status changes to "PENDING"

---

### Q20: Who can publish content?

Only **Managers** and **Admins** can publish approved content to social media.

---

# User Roles

### Q21: What are the different user roles?

| Role | Description |
|------|-------------|
| **Creator** | Create and manage own content |
| **Manager** | Review all content, approve/reject, publish |
| **Admin** | Full access, manage users and settings |

---

### Q22: How do I get a higher role?

Contact your system administrator to request a role change. Role assignments are based on organizational hierarchy.

---

### Q23: Can a Creator approve their own posts?

No. Creators cannot approve posts. All posts must be reviewed by a Manager or Admin.

---

### Q24: Can I see other users' posts?

| Role | Can See Others' Posts? |
|------|------------------------|
| Creator | ❌ No (own posts only) |
| Manager | ✅ Yes (all posts) |
| Admin | ✅ Yes (all posts) |

---

# Technical Issues

### Q25: The page is loading slowly. What should I do?

Try these solutions:

1. Refresh the page
2. Clear browser cache
3. Check your internet connection
4. Try a different browser
5. Contact support if issue persists

---

### Q26: My upload failed. What went wrong?

Common causes:

| Issue | Solution |
|-------|----------|
| File too large | Reduce to under 50MB |
| Wrong format | Use supported formats only |
| Network error | Check connection, retry |
| Session expired | Log in again |

---

### Q27: I'm getting "Unauthorized" error.

Your session may have expired:

1. Log out
2. Close browser completely
3. Reopen and log in again

---

### Q28: The video won't play in preview.

Try:

1. Ensure video format is MP4, MOV, or AVI
2. Wait for video to fully load
3. Try a different browser
4. Check if video file is corrupted

---

### Q29: How do I report a bug?

Contact support with:

1. Description of the issue
2. Steps to reproduce
3. Browser and device info
4. Screenshots (if possible)

Email: support@yourcompany.com

---

# Security & Privacy

### Q30: Is my data secure?

Yes, we implement multiple security measures:

- ✅ Encrypted passwords (bcrypt)
- ✅ HTTPS encryption
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Regular security updates

---

### Q31: Who can see my uploaded content?

| Your Role | Who Can See Your Content |
|-----------|--------------------------|
| Creator | Only you + Managers + Admins |
| Manager | All users can see your content |
| Admin | All users can see your content |

---

### Q32: Is my password stored securely?

Yes. Passwords are:

- Never stored in plain text
- Encrypted using bcrypt hashing
- Never visible to administrators

---

### Q33: How do I delete my account?

Contact your administrator to request account deletion. Your posts will also be deleted.

---

### Q34: Can I export my data?

Contact your administrator to request a data export.

---

## Still Have Questions?

If you couldn't find the answer to your question:

| Method | Contact |
|--------|---------|
| **Email** | support@yourcompany.com |
| **Phone** | +XX XXX XXX XXXX |
| **Help Desk** | [Link to help desk] |

---

**© 2026 Media Management Portal. All Rights Reserved.**
