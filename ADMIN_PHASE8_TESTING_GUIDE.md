# Admin Module - Quick Start & Testing Guide 🚀

## Quick Start (5 Minutes)

### 1. **Start Backend Server**
```powershell
cd C:\OneYes-Unified-Assessment-\backend
npm start
```

**Expected Output**:
```
✅ MongoDB Connected
✅ Server running on port 5000
```

### 2. **Start Frontend Server**
```powershell
cd C:\OneYes-Unified-Assessment-\frontend
npm run dev
```

**Expected Output**:
```
VITE v5.x ready
Local: http://localhost:5173/
```

### 3. **Login as Admin**
1. Open browser: http://localhost:5173/login
2. Enter credentials:
   - **Email**: `admin@oneyes.com`
   - **Password**: `Admin@123`
3. Click **Sign In**
4. Should redirect to: http://localhost:5173/admin-dashboard

---

## 🧪 Phase 8 Testing - Assessment Oversight

### **Access the Page**
After logging in, click **"Assessments"** in the sidebar, or navigate to:
```
http://localhost:5173/admin-dashboard/assessments
```

---

### **Test 1: Search Functionality** (1 min)
1. In the search bar, type any text (e.g., "test", "math")
2. ✅ Verify: Table updates with matching assessments
3. Clear the search
4. ✅ Verify: All assessments reload

---

### **Test 2: Status Filter** (1 min)
1. Select **Status**: "Published"
2. ✅ Verify: Only published assessments show
3. Select **Status**: "Draft"
4. ✅ Verify: Only draft assessments show
5. Select **Status**: "All Statuses"
6. ✅ Verify: All assessments reload

---

### **Test 3: Creator Filter** (1 min)
1. Select **Creator Role**: "Instructor"
2. ✅ Verify: Only instructor-created assessments show
3. Select **Creator Role**: "Admin"
4. ✅ Verify: Only admin-created assessments show
5. Select **Creator Role**: "All Creators"
6. ✅ Verify: All assessments reload

---

### **Test 4: Flagged Filter** (1 min)
1. Select **Flagged**: "Flagged Only"
2. ✅ Verify: Only flagged assessments show (with red flag icon)
3. Select **Flagged**: "Not Flagged"
4. ✅ Verify: Only non-flagged assessments show
5. Select **Flagged**: "All"
6. ✅ Verify: All assessments reload

---

### **Test 5: Flag Assessment** (2 min)
1. Find any non-flagged assessment (no red flag icon)
2. Click the **Flag button** (flag icon in Actions column)
3. ✅ Verify: Modal opens with "Flag Assessment" title
4. Leave **Reason** field blank, click "Flag Assessment"
5. ✅ Verify: Error message appears: "Reason is required"
6. Enter 5 characters in **Reason** field
7. ✅ Verify: Error message: "Reason must be at least 10 characters"
8. Enter 20 characters in **Reason** field (e.g., "Inappropriate content detected")
9. Optionally add notes in **Additional Notes**
10. Click **"Flag Assessment"**
11. ✅ Verify: Toast notification: "Assessment flagged successfully"
12. ✅ Verify: Red flag icon appears next to assessment title
13. ✅ Verify: Table refreshes automatically

---

### **Test 6: Unflag Assessment** (1 min)
1. Find a flagged assessment (with red flag icon)
2. Click the **Flag button** (now red in Actions column)
3. ✅ Verify: Modal opens with "Unflag Assessment" title
4. ✅ Verify: Shows assessment title and creator
5. Click **"Unflag"**
6. ✅ Verify: Toast notification: "Assessment unflagged successfully"
7. ✅ Verify: Red flag icon disappears
8. ✅ Verify: Table refreshes automatically

---

### **Test 7: Archive Assessment** (1 min)
1. Find a non-archived assessment (Status: Draft or Published)
2. Click the **Archive button** (archive icon in Actions column)
3. ✅ Verify: Modal opens with "Archive Assessment" title
4. ✅ Verify: Shows assessment title and submission count
5. ✅ Verify: Warning message displayed
6. Click **"Archive"**
7. ✅ Verify: Toast notification: "Assessment archived successfully"
8. ✅ Verify: Status badge changes to "archived" (yellow)
9. ✅ Verify: Archive button disappears from that row
10. ✅ Verify: Table refreshes automatically

---

### **Test 8: Export CSV** (1 min)
1. Make sure some assessments are loaded
2. Click **"Export CSV"** button (top-right, next to title)
3. ✅ Verify: CSV file downloads automatically
4. ✅ Verify: Filename format: `assessments_2024-10-21.csv` (today's date)
5. Open the CSV file in Excel or Notepad
6. ✅ Verify: Contains columns: Title, Creator, Status, Type, Duration, Total Marks, Submissions, Flagged, Created Date
7. ✅ Verify: Data matches table content
8. ✅ Verify: Toast notification: "Assessments exported successfully"

---

### **Test 9: Pagination** (2 min)
**Note**: This test requires 10+ assessments. If you don't have enough, use filters to test.

1. Make sure **more than 10 assessments** are loaded
2. ✅ Verify: Only 10 assessments displayed
3. ✅ Verify: Bottom shows "Page 1 of X"
4. ✅ Verify: **"Previous"** button is disabled (grayed out)
5. Click **"Next"**
6. ✅ Verify: Next 10 assessments load
7. ✅ Verify: Page counter updates to "Page 2 of X"
8. Click **"Previous"**
9. ✅ Verify: First 10 assessments reload
10. ✅ Verify: Page counter returns to "Page 1 of X"
11. Navigate to last page
12. ✅ Verify: **"Next"** button is disabled

---

### **Test 10: View Button** (30 sec)
1. Click the **View button** (eye icon) on any assessment
2. ✅ Verify: Toast notification: "View assessment details - Coming soon"
3. **Note**: Full implementation coming in future phase

---

### **Test 11: Dark Mode** (1 min)
1. Toggle **Dark Mode** switch in header
2. ✅ Verify: Background changes to dark gray
3. ✅ Verify: Text changes to white
4. ✅ Verify: Cards have dark background
5. ✅ Verify: Inputs have dark background
6. ✅ Verify: Borders are visible in dark mode
7. ✅ Verify: Status badges have dark mode colors
8. Click **Flag** button on any assessment
9. ✅ Verify: Modal has dark background
10. ✅ Verify: All text is readable in dark mode
11. Close modal and toggle back to light mode
12. ✅ Verify: Everything returns to light theme

---

### **Test 12: Mobile Responsiveness** (1 min)
1. Press **F12** to open DevTools
2. Click **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Select **iPhone 12 Pro** or similar
4. ✅ Verify: Filters stack vertically
5. ✅ Verify: Search bar takes full width
6. ✅ Verify: Header title and button stack on small screens
7. Scroll table horizontally
8. ✅ Verify: Table scrolls, all columns accessible
9. Click **Flag** button
10. ✅ Verify: Modal is centered and fits on screen
11. ✅ Verify: Modal content is readable and scrollable
12. Close DevTools

---

### **Test 13: Empty State** (30 sec)
1. Set filters to show no results (e.g., Status: Draft + Flagged: Yes, if no such assessments exist)
2. ✅ Verify: Empty state displays with filter icon
3. ✅ Verify: Message: "No assessments found"
4. ✅ Verify: Subtitle: "Try adjusting your filters or search terms"
5. Reset filters
6. ✅ Verify: Assessments reload

---

### **Test 14: Loading State** (30 sec)
1. Refresh the page
2. ✅ Verify: Spinner appears while loading
3. ✅ Verify: Spinner is centered in the card
4. ✅ Verify: Table appears after data loads
5. Change any filter
6. ✅ Verify: Brief loading spinner appears during fetch

---

### **Test 15: Error Handling** (1 min)
**Note**: This test requires stopping the backend.

1. Stop the backend server (Ctrl+C in backend terminal)
2. Refresh the Assessment Oversight page
3. ✅ Verify: Toast error notification appears
4. ✅ Verify: Error message: "Failed to fetch assessments"
5. Restart backend server
6. Refresh page
7. ✅ Verify: Assessments load successfully

---

## 📋 Other Admin Pages to Test

### **1. Dashboard Overview**
```
URL: http://localhost:5173/admin-dashboard
```
✅ 4 stats cards  
✅ Bar chart (Assessments by Month)  
✅ 2 Pie charts (Users by Role, Assessment Status)  
✅ Line chart (Daily Registrations)  
✅ Recent Activity feed  

### **2. User Management**
```
URL: http://localhost:5173/admin-dashboard/users
```
✅ User table with search  
✅ Role filter (Student/Instructor/Admin)  
✅ Status filter (Active/Inactive)  
✅ Add User modal  
✅ Edit User modal  
✅ Delete User confirmation  
✅ Pagination  

### **3. Activity Logs** (Coming in Phase 9)
```
URL: http://localhost:5173/admin-dashboard/logs
```
🔄 Placeholder page

### **4. Platform Settings** (Coming in Phase 10)
```
URL: http://localhost:5173/admin-dashboard/settings
```
🔄 Placeholder page

---

## 🚀 Full Testing Suite (All Phases)

If you want to test everything systematically:

### **Phase 5: Dashboard Layout** (2 min)
- [x] Sidebar navigation (6 menu items)
- [x] Dark mode toggle
- [x] Mobile hamburger menu
- [x] Logout button
- [x] Admin profile header

### **Phase 6: Dashboard Overview** (3 min)
- [x] Total Users stat card
- [x] Assessments stat card
- [x] Submissions stat card
- [x] Active Users stat card
- [x] Assessments by Month chart
- [x] Users by Role pie chart
- [x] Assessment Status pie chart
- [x] Daily Registrations line chart
- [x] Recent Activity feed (last 10)

### **Phase 7: User Management** (5 min)
- [x] Search users (name, email, institute code)
- [x] Filter by role
- [x] Filter by status
- [x] Pagination
- [x] Add User modal (Formik validation)
- [x] Edit User modal (email locked)
- [x] Delete User confirmation
- [x] Toast notifications

### **Phase 8: Assessment Oversight** (15 min)
- [x] All 15 tests above

**Total Testing Time**: ~25 minutes for complete admin module

---

## 🆘 Troubleshooting

### **Backend Won't Start**
```powershell
# Check MongoDB is running
# Restart backend
cd C:\OneYes-Unified-Assessment-\backend
npm start
```

### **Frontend Won't Start**
```powershell
# Clear cache
cd C:\OneYes-Unified-Assessment-\frontend
rm -r node_modules/.vite
npm run dev
```

### **Login Doesn't Work**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage (F12 → Application → Local Storage → Clear All)
3. Try incognito mode
4. Re-create admin user:
   ```powershell
   cd C:\OneYes-Unified-Assessment-\backend
   node scripts/createAdmin.js
   ```

### **Assessments Don't Load**
1. Check backend console for errors
2. Check browser console (F12 → Console)
3. Verify API endpoint: http://localhost:5000/api/admin/assessments
4. Check if admin user has correct role in database

### **Dark Mode Broken**
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Check Tailwind CSS is compiling

---

## ✅ Completion Checklist

After running all tests, you should have verified:

**Login & Navigation**:
- [x] Admin login works
- [x] Redirect to /admin-dashboard successful
- [x] Sidebar navigation functional
- [x] Dark mode toggle works
- [x] Logout clears session

**Assessment Oversight**:
- [x] Search filters assessments
- [x] Status filter works
- [x] Creator filter works
- [x] Flagged filter works
- [x] Flag modal validates input
- [x] Unflag removes flag
- [x] Archive changes status
- [x] CSV exports correctly
- [x] Pagination navigates
- [x] Dark mode renders properly
- [x] Mobile responsive
- [x] Empty state displays
- [x] Loading spinner shows
- [x] Error handling works
- [x] Toast notifications appear

**Other Pages**:
- [x] Dashboard Overview displays stats and charts
- [x] User Management CRUD operations work

---

## 🎯 Next Steps

After verifying Phase 8 works correctly:

1. **Review Phase 9 Plan**: Activity Logs implementation
2. **Check Backend Routes**: Verify `/api/admin/logs` endpoints
3. **Prepare Test Data**: Generate some activity logs
4. **Start Phase 9**: Implement ActivityLogs.jsx

---

**Happy Testing! 🚀**

If all tests pass, you're ready to move to **Phase 9: Activity Logs**! 🎉
