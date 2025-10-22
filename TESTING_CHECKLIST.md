# 🧪 Quick Testing Checklist - 3 New Features

## ✅ Servers Running
- [ ] Backend: http://localhost:5000 ✅
- [ ] Frontend: http://localhost:5175 ✅

---

## 🔐 Feature 1: Password Reset System

### Test Forgot Password Page
- [ ] Navigate to: http://localhost:5175/login
- [ ] Click "Forgot password?" link
- [ ] Should redirect to `/forgot-password`
- [ ] Enter email address
- [ ] Click "Send Reset Link"
- [ ] Should show success screen

### Test Reset Password Page
- [ ] Backend logs should show: "✅ Email sent successfully"
- [ ] Check email for reset link (if configured)
- [ ] OR manually navigate to: http://localhost:5175/reset-password?token=test123
- [ ] Should verify token (will fail with test token)
- [ ] With valid token:
  - [ ] Enter new password
  - [ ] Password requirements should show (green checkmarks)
  - [ ] Confirm password (should match)
  - [ ] Click "Reset Password"
  - [ ] Should redirect to login with success message

### Backend API Tests (Optional - Use Postman/Thunder Client)
```
POST http://localhost:5000/api/auth/forgot-password
Body: { "email": "user@example.com" }
Expected: 200 OK, success message

POST http://localhost:5000/api/auth/verify-reset-token
Body: { "token": "xxx" }
Expected: 200 OK if valid, 400 if invalid

POST http://localhost:5000/api/auth/reset-password
Body: { "token": "xxx", "newPassword": "NewPass123!" }
Expected: 200 OK, password updated
```

---

## 🔔 Feature 2: Notification System

### Test Notification Bell
- [ ] Login as admin
- [ ] Navigate to: http://localhost:5175/admin-dashboard
- [ ] Check top-right navbar for bell icon
- [ ] Should see red badge if unread notifications exist

### Test Notification Creation
- [ ] Go to "Users" page
- [ ] Click "Add User"
- [ ] Create new user (fill all fields)
- [ ] Submit form
- [ ] Check backend logs: "✅ Notification created for user creation"
- [ ] Bell badge should increment by 1
- [ ] Click bell icon
- [ ] Dropdown should show new notification: "New User Registered"

### Test Notification Actions
- [ ] Click on notification → should mark as read (blue → white background)
- [ ] Badge count should decrease
- [ ] Click "Mark all as read" → all turn white, badge disappears
- [ ] Click trash icon → notification deleted
- [ ] Click "Clear all" → all read notifications removed
- [ ] Click "View all notifications" → redirects to full page

### Test Notifications Page
- [ ] Navigate to: http://localhost:5175/admin-dashboard/notifications
- [ ] Should see full list of notifications
- [ ] Test filters:
  - [ ] Type dropdown (User Registered, etc.)
  - [ ] Status dropdown (All, Unread, Read)
  - [ ] Priority dropdown (All, Critical, High, Medium, Low)
- [ ] Test pagination (if 20+ notifications)
- [ ] Test "Mark All as Read" button
- [ ] Test "Clear Read Notifications" button
- [ ] Test individual delete buttons

---

## 📢 Feature 3: Announcement System

### Test Announcements Page Access
- [ ] Navigate to: http://localhost:5175/admin-dashboard/announcements
- [ ] Should see 4 stat cards: Total, Active, Pinned, Expired
- [ ] Should see "New Announcement" button
- [ ] Should see search and filter dropdowns

### Test Create Announcement
- [ ] Click "New Announcement" button
- [ ] Modal should open
- [ ] Fill in form:
  ```
  Title: System Maintenance Scheduled
  Message: The platform will be under maintenance on Saturday from 2-4 AM. All assessments will be temporarily unavailable.
  Priority: High
  Target Audience: All Users
  Publish Date: [Current date/time]
  Expiry Date: [7 days from now]
  ☑ Pin this announcement
  ☑ Send notification to users
  ☐ Send email to users (optional - check if email configured)
  ```
- [ ] Click "Create Announcement"
- [ ] Modal should close
- [ ] Backend logs should show:
  - [ ] "✅ Notification created..." (X notifications)
  - [ ] "✅ Email sent..." (if email checked)
- [ ] Announcement should appear in list
- [ ] Should have HIGH priority badge (orange)
- [ ] Should have pin icon (purple)
- [ ] Should show "Active" status (green)

### Test Announcement Features
- [ ] **Search:** Type "maintenance" in search box → should filter
- [ ] **Filter Priority:** Select "High" → should show only high priority
- [ ] **Filter Audience:** Select "All Users" → should filter
- [ ] **Filter Status:** Select "Active" → should show only active
- [ ] **Pin Toggle:** Click pin icon → should toggle purple/gray
- [ ] **Edit:** Click edit icon → modal opens with pre-filled data
  - [ ] Change title to "Updated: System Maintenance"
  - [ ] Click "Update Announcement"
  - [ ] Should see updated title
- [ ] **Activate/Deactivate:** Click eye icon → status toggles
- [ ] **Delete:** Click trash icon → confirmation dialog → deletes

### Test Announcement Stats
- [ ] Stats cards should update after:
  - [ ] Creating announcement → Total increases
  - [ ] Pinning → Pinned count increases
  - [ ] Deactivating → Active count decreases
  - [ ] Setting expiry in past → Expired count increases

### Test Pagination (if needed)
- [ ] Create 10+ announcements
- [ ] Pagination should appear
- [ ] Click "Next" → page 2
- [ ] Click "Previous" → page 1
- [ ] Should show "Page X of Y"

---

## 🔍 Backend Verification

### Check MongoDB Collections
Use MongoDB Compass or mongo shell:

```javascript
// Check PasswordReset tokens
db.passwordresets.find()

// Check EmailLogs
db.emaillogs.find()

// Check Notifications
db.notifications.find({ recipientId: ObjectId("admin-id") })

// Check Announcements
db.announcements.find()
```

### Check Backend Logs
Look for these messages in terminal:

```
✅ Email sent successfully to user@example.com
✅ Notification created for user creation
✅ Email sent: User Account Created
✅ Notification created for announcement
🚀 Server running on http://localhost:5000
```

---

## 🐛 Common Issues & Fixes

### "Bell icon not showing"
- **Fix:** Hard refresh (Ctrl + Shift + R)
- **Fix:** Check browser console for errors
- **Fix:** Verify NotificationProvider in App.jsx

### "Email not sending"
- **Fix:** Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- **Fix:** For Gmail, use App-Specific Password
- **Fix:** Restart backend after .env changes

### "Announcement modal not opening"
- **Fix:** Check browser console
- **Fix:** Verify SendAnnouncementModal import

### "Notifications not appearing"
- **Fix:** Check MongoDB connection
- **Fix:** Verify user is created successfully
- **Fix:** Check backend logs for errors

### "Reset token invalid"
- **Fix:** Tokens expire in 1 hour
- **Fix:** Request new reset link
- **Fix:** Check PasswordReset collection in MongoDB

---

## ✅ Success Criteria

### All Tests Pass If:
- [x] Password reset flow works end-to-end
- [x] Notifications appear and update in real-time
- [x] Bell badge shows correct unread count
- [x] Announcements can be created, edited, deleted
- [x] Filters and search work correctly
- [x] Emails send (if configured)
- [x] Priority colors display correctly
- [x] Pin/unpin works
- [x] Stats update correctly
- [x] No console errors
- [x] No backend crashes

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅
**Option 1:** Implement Feature 4 (Global Search)
**Option 2:** Add enhancements (Socket.io, file uploads, rich text)
**Option 3:** Deploy to production

### If Issues Found ❌
1. Document the issue
2. Check browser console
3. Check backend logs
4. Review relevant code
5. Apply fixes
6. Re-test

---

**🎊 Happy Testing! Let me know what you'd like to do next! 🎊**
