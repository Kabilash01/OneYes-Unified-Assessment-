# 🧪 Feature 6: Testing Guide

## Pre-Testing Checklist

### ✅ Verify Installation
```powershell
# Check backend dependencies
cd backend
npm list socket.io multer nodemailer

# Check frontend dependencies
cd frontend
npm list socket.io-client recharts react-markdown emoji-picker-react
```

---

## 🚀 Starting the System

### Step 1: Start Backend
```powershell
cd C:\OneYes-Unified-Assessment-\backend
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
🔌 Socket.io initialized
```

### Step 2: Start Frontend
```powershell
cd C:\OneYes-Unified-Assessment-\frontend
npm run dev
```

**Expected Output:**
```
VITE ready in X ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Test Scenarios

### Test 1: Student Creates Ticket ✅

**Steps:**
1. Login as Student
2. Navigate to `/student/support`
3. Click "Create Ticket" button
4. Fill form:
   - Title: "Cannot access my assessment"
   - Subject: "Technical Support"
   - Priority: "High"
   - Message: "I'm getting an error when trying to access my test"
5. Click "Create"

**Expected:**
- ✅ Ticket created successfully
- ✅ Redirected to ticket detail page
- ✅ Toast notification appears
- ✅ Chat window loads
- ✅ Footer displays at bottom

### Test 2: Real-Time Chat ✅

**Steps:**
1. Keep ticket detail page open
2. Open same ticket in new incognito window (as instructor/admin)
3. Send message from student: "Hello, I need help"
4. See message appear instantly in instructor window
5. Send reply from instructor: "I'll help you"
6. See reply appear instantly in student window

**Expected:**
- ✅ Messages appear in real-time
- ✅ Typing indicator shows when typing
- ✅ Read receipts update (✓ → ✓✓)
- ✅ User online status shows
- ✅ No page refresh needed

### Test 3: File Upload ✅

**Steps:**
1. In chat, click file upload icon
2. Select an image file (< 10MB)
3. See file preview
4. Send message
5. See file in chat with thumbnail
6. Click to download

**Expected:**
- ✅ File uploads successfully
- ✅ Preview shows before sending
- ✅ Thumbnail displays in chat
- ✅ Download works
- ✅ File size validation works

### Test 4: Message Features ✅

**Steps:**
1. Send message with **markdown** and *italic*
2. Send message with emoji 😊
3. Edit message within 5 minutes
4. Try to edit after 5 minutes (should fail)
5. Delete a message
6. See "deleted" indicator

**Expected:**
- ✅ Markdown renders correctly
- ✅ Emoji picker works
- ✅ Edit works within 5 min
- ✅ Edit disabled after 5 min
- ✅ Delete shows confirmation
- ✅ Deleted message shows placeholder

### Test 5: Ticket Filtering ✅

**Steps:**
1. Go to `/student/support`
2. Click "Filters" if collapsed
3. Search for ticket by title
4. Filter by status (Open)
5. Filter by priority (High)
6. Clear all filters

**Expected:**
- ✅ Search filters tickets
- ✅ Status filter works
- ✅ Priority filter works
- ✅ Multiple filters combine
- ✅ Clear filters resets view

### Test 6: Instructor Dashboard ✅

**Steps:**
1. Login as Instructor
2. Navigate to `/instructor/support`
3. Toggle between Dashboard and Tickets view
4. View stats cards
5. See charts
6. Click on recent ticket

**Expected:**
- ✅ Dashboard loads with stats
- ✅ Charts render (bar, pie)
- ✅ Recent tickets display
- ✅ View toggle works
- ✅ Clicking ticket navigates

### Test 7: Ticket Assignment ✅

**Steps:**
1. Login as Admin/Instructor
2. Open any ticket
3. Click "Assign" button
4. Search for user
5. Select user
6. Click "Assign"

**Expected:**
- ✅ Modal opens
- ✅ Users list loads from `/api/users`
- ✅ Search filters users
- ✅ Assignment succeeds
- ✅ Email notification sent
- ✅ Ticket shows assignee

### Test 8: Ticket Status Updates ✅

**Steps:**
1. Open ticket as Instructor/Admin
2. Change status from "Open" to "In Progress"
3. Change to "Resolved"
4. Add resolution notes
5. Close ticket

**Expected:**
- ✅ Status dropdown shows all options
- ✅ Status updates successfully
- ✅ System message appears in chat
- ✅ Resolution dialog appears
- ✅ Ticket closes with resolution

### Test 9: Admin CSV Export ✅

**Steps:**
1. Login as Admin
2. Navigate to `/admin-dashboard/support`
3. Click "Export CSV" button
4. Wait for download
5. Open CSV file

**Expected:**
- ✅ Export button works
- ✅ CSV downloads
- ✅ All tickets included
- ✅ Data properly formatted
- ✅ Dates readable

### Test 10: Mobile Responsiveness ✅

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone/Android
4. Test all features:
   - Create ticket
   - Send message
   - View dashboard
   - Use filters

**Expected:**
- ✅ Layout adapts to mobile
- ✅ All features accessible
- ✅ Touch targets adequate
- ✅ Sidebar collapses properly
- ✅ Footer displays correctly

---

## 🔍 API Testing

### Test Users Endpoint
```powershell
# Get all instructors/admins
curl http://localhost:5000/api/users?role=instructor,admin `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get user by ID
curl http://localhost:5000/api/users/USER_ID `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Support Endpoints
```powershell
# Create ticket
curl -X POST http://localhost:5000/api/support/tickets `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Test\",\"subject\":\"Technical Support\",\"priority\":\"medium\",\"message\":\"Test message\"}'

# Get stats
curl http://localhost:5000/api/support/stats `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Chat Endpoints
```powershell
# Send message
curl -X POST http://localhost:5000/api/chat/messages `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"ticketId\":\"TICKET_ID\",\"message\":\"Hello\",\"messageType\":\"text\"}'

# Get messages
curl http://localhost:5000/api/chat/messages/TICKET_ID `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Socket.io Not Connecting
**Symptoms:** Messages don't send in real-time

**Solution:**
```javascript
// Check browser console
// Should see: "Socket.io connected"

// Verify VITE_SOCKET_URL
console.log(import.meta.env.VITE_SOCKET_URL)
// Should be: http://localhost:5000
```

### Issue 2: 404 on /api/users
**Symptoms:** AssignTicketModal shows "No users found"

**Solution:**
- Verify backend server is running
- Check users.routes.js is loaded in server.js
- Ensure user has instructor/admin role

### Issue 3: File Upload Fails
**Symptoms:** File doesn't upload, error in console

**Solution:**
- Check file size (< 10MB)
- Verify file type is allowed
- Check uploads directory exists: `backend/uploads/attachments/`

### Issue 4: Messages Don't Update
**Symptoms:** Need to refresh to see new messages

**Solution:**
- Check Socket.io connection status
- Verify JWT token in localStorage
- Check browser console for errors

### Issue 5: Footer Not Showing
**Symptoms:** Footer missing from pages

**Solution:**
- Verify Footer import in page file
- Check flex-col and flex-1 classes on container
- Inspect with DevTools

---

## ✅ Testing Checklist

Print this and check off as you test:

### Backend Tests
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] Socket.io initializes
- [ ] All routes respond
- [ ] JWT authentication works
- [ ] File upload works
- [ ] Email sends (check logs)

### Frontend Tests
- [ ] App builds without errors
- [ ] All routes load correctly
- [ ] Sidebar links work
- [ ] Footer appears on all pages
- [ ] Socket.io connects
- [ ] Real-time updates work

### Feature Tests
- [ ] Create ticket
- [ ] Send message
- [ ] Upload file
- [ ] Use emoji picker
- [ ] Edit message
- [ ] Delete message
- [ ] Filter tickets
- [ ] Assign ticket
- [ ] Update status
- [ ] Close ticket
- [ ] Export CSV
- [ ] View dashboard
- [ ] See charts

### Role Tests
- [ ] Student can create tickets
- [ ] Student can chat
- [ ] Student can close own tickets
- [ ] Student cannot assign
- [ ] Instructor sees assigned tickets
- [ ] Instructor can assign
- [ ] Instructor can update status
- [ ] Admin sees all tickets
- [ ] Admin can delete
- [ ] Admin can export

### UI/UX Tests
- [ ] Mobile responsive
- [ ] Loading states show
- [ ] Error states show
- [ ] Empty states show
- [ ] Toast notifications appear
- [ ] Modal dialogs work
- [ ] Keyboard navigation works
- [ ] ARIA labels present

---

## 📊 Performance Tests

### Load Testing
```javascript
// Test with multiple users
// 1. Open 5 browser tabs
// 2. Login as different users
// 3. All join same ticket
// 4. Send messages simultaneously
// 5. Monitor server CPU/memory
```

### Socket.io Stress Test
```javascript
// Send rapid messages
// Expected: All messages arrive in order
// Expected: No lag or disconnection
// Expected: Server handles load
```

---

## 🎯 Success Criteria

Feature 6 passes testing if:
- ✅ All 10 test scenarios pass
- ✅ No console errors
- ✅ Real-time updates work
- ✅ File uploads work
- ✅ All roles have correct permissions
- ✅ Mobile responsive
- ✅ Footer displays
- ✅ Navigation works
- ✅ Performance acceptable

---

## 📝 Bug Report Template

If you find issues, report using this format:

```markdown
### Bug: [Brief Description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots/Logs:**


**Environment:**
- Browser: 
- OS: 
- User Role: 
```

---

## 🚀 Next Steps After Testing

1. **Fix Bugs** - Address any issues found
2. **Performance Optimization** - If needed
3. **Security Audit** - Review permissions
4. **User Documentation** - Create end-user guide
5. **Staging Deployment** - Deploy to test environment
6. **UAT** - User acceptance testing
7. **Production Deployment** - Go live!

---

**Ready to start testing?**

Run these commands:
```powershell
# Terminal 1
cd C:\OneYes-Unified-Assessment-\backend
npm start

# Terminal 2
cd C:\OneYes-Unified-Assessment-\frontend
npm run dev
```

Then navigate to: `http://localhost:5173/student/support`

**Happy Testing! 🧪**
