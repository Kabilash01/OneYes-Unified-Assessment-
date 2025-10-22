# Testing Guide - Email Integration & Notification System

## Prerequisites

1. **Backend Server Running** on `http://localhost:5000`
2. **Frontend Server Running** on `http://localhost:5175`
3. **MongoDB Connected**
4. **Email Configuration** (Optional for email testing):
   - Update `backend/.env` with your email credentials:
     ```
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-specific-password
     ```

## 🔔 Feature 1: Notification Badge System

### Test 1: View Notification Bell
1. Login as admin
2. Navigate to Admin Dashboard
3. Look at the top-right navbar
4. **Expected:** You should see a bell icon

### Test 2: Check Unread Count
1. In navbar, bell icon should show a red badge with unread count
2. **Expected:** Badge displays number (e.g., "5") or "99+" for 100+

### Test 3: Open Notification Panel
1. Click the bell icon
2. **Expected:** Dropdown panel appears below bell
3. Panel shows up to 10 recent notifications
4. Each notification shows:
   - Type-specific icon (user, file, alert, etc.)
   - Title and message
   - Time ago (e.g., "5 minutes ago")
   - Unread notifications have blue background

### Test 4: Mark Notification as Read
1. Open notification panel
2. Click on an unread notification (blue background)
3. **Expected:** 
   - Notification background changes to white
   - Unread count decreases by 1
   - Badge updates

### Test 5: Mark All as Read
1. Open notification panel
2. Click "Mark all as read" link
3. **Expected:**
   - All notifications turn white (read)
   - Badge disappears
   - Toast: "All notifications marked as read"

### Test 6: Delete Notification
1. Open notification panel
2. Hover over a notification
3. Click the trash icon
4. **Expected:**
   - Notification disappears
   - Toast: "Notification deleted"

### Test 7: Clear All Read Notifications
1. Open notification panel
2. Click "Clear all" link
3. **Expected:**
   - All read notifications removed
   - Toast shows count: "X notifications cleared"

### Test 8: View Full Notifications Page
1. Open notification panel
2. Click "View all notifications" at bottom
3. **Expected:** Redirects to `/admin-dashboard/notifications`

### Test 9: Full Notifications Page Features
1. Navigate to Notifications page
2. **Test Filters:**
   - Filter by Type (User Registered, Assessment Created, etc.)
   - Filter by Status (All, Unread, Read)
   - Filter by Priority (Critical, High, Medium, Low)
3. **Test Actions:**
   - Click "Mark All as Read" button
   - Click "Clear Read Notifications" button
   - Click individual notification to mark as read
   - Click trash icon to delete
4. **Test Pagination:**
   - If more than 20 notifications, pagination appears
   - Click "Next" and "Previous" buttons

## ✉️ Feature 2: Email Integration System

### Test 10: User Creation Email
1. Go to Admin Dashboard > Users
2. Click "Add User" button
3. Fill in form:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "Test123!"
   - Role: "student"
4. Click "Create User"
5. **Expected (Backend Console):**
   - "✅ Email sent successfully to testuser@example.com"
   - "✅ Notification created for user..."
6. **Expected (Email - if configured):**
   - Welcome email received at testuser@example.com
   - Email contains: name, email, role, temporary password, login button

### Test 11: User Suspension Email
1. Go to Admin Dashboard > Users
2. Find a user and click "Edit"
3. Toggle "Active" switch to OFF
4. Save changes
5. **Expected (Backend Console):**
   - "✅ Email sent successfully to [user-email]"
6. **Expected (Email - if configured):**
   - Suspension email received
   - Email shows: reason, suspension date, contact support button

### Test 12: User Reactivation Email
1. Go to Admin Dashboard > Users
2. Find a suspended user
3. Toggle "Active" switch to ON
4. Save changes
5. **Expected (Backend Console):**
   - "✅ Email sent successfully to [user-email]"
6. **Expected (Email - if configured):**
   - Reactivation email received
   - Email shows: account reactivated message, login button

### Test 13: Notification Creation on User Registration
1. Create a new user (Test 10)
2. Check notification bell in navbar
3. **Expected:**
   - Unread count increases by 1
   - New notification appears: "New User Registered"
   - Message: "{Name} ({role}) has registered with email {email}"
   - Type: user_registered
   - Priority: low

## 🐛 Troubleshooting

### Notification Bell Not Showing
- Check browser console for errors
- Verify NotificationProvider is wrapped in App.jsx
- Verify admin routes include notifications route
- Refresh page

### Unread Count Not Updating
- Check Network tab for `/admin/notifications/unread-count` API call
- Verify backend server is running
- Check backend logs for errors
- Try manual refresh (F5)

### Emails Not Sending
**Issue:** Console shows "❌ Failed to send email"
- **Solution:** Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- For Gmail: Use App-Specific Password (not regular password)
- Enable "Less secure app access" or use OAuth2

**Issue:** "EAUTH" error
- **Solution:** Email credentials are incorrect
- Verify EMAIL_USER matches EMAIL_FROM address

**Issue:** "ETIMEDOUT" error
- **Solution:** Check firewall/antivirus blocking port 587
- Try using port 465 with `EMAIL_SECURE=true`

### Notifications Not Appearing
- Check MongoDB connection
- Verify Notification model has correct indexes
- Check backend logs for notification creation errors
- Use MongoDB Compass to view Notifications collection

## 📊 API Testing (Postman/Thunder Client)

### Get Unread Count
```
GET http://localhost:5000/api/admin/notifications/unread-count
Headers:
  Authorization: Bearer <admin-token>
```

### Get All Notifications
```
GET http://localhost:5000/api/admin/notifications?page=1&limit=20
Headers:
  Authorization: Bearer <admin-token>
```

### Mark Notification as Read
```
PATCH http://localhost:5000/api/admin/notifications/<notification-id>/read
Headers:
  Authorization: Bearer <admin-token>
```

### Delete Notification
```
DELETE http://localhost:5000/api/admin/notifications/<notification-id>
Headers:
  Authorization: Bearer <admin-token>
```

## ✅ Success Criteria

**Notification System:**
- ✅ Bell icon visible in navbar
- ✅ Unread count badge displays correctly
- ✅ Dropdown panel opens/closes on click
- ✅ Notifications display with correct icons
- ✅ Mark as read functionality works
- ✅ Delete notifications works
- ✅ Full page with filters works
- ✅ Pagination works
- ✅ Auto-refresh every 30 seconds

**Email System:**
- ✅ User creation triggers welcome email
- ✅ User suspension triggers suspension email
- ✅ User reactivation triggers reactivation email
- ✅ Emails contain correct template with branding
- ✅ Notification created alongside email

## 🎯 Next Steps

After testing these features, the remaining features to implement are:

1. **Password Reset System** (Email Integration continuation)
2. **Announcement System** (Full Stack)
3. **Global Search System** (Full Stack)
4. **Email Logs & Management** (Frontend)

---

*Happy Testing! 🚀*
