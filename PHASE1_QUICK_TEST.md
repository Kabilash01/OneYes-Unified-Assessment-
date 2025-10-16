# ✅ Phase 1 Testing - Quick Start Guide

## 🚀 Servers Running

- **Backend:** http://localhost:5000 ✅
- **Frontend:** http://localhost:5174 ✅  
- **MongoDB:** Connected ✅

---

## 👤 Test Login Credentials

### Student Account
```
Email: test.student@example.com
Password: Test123!
```

### Instructor Accounts
```
1. test.instructor1@example.com / Test123! (Dr. John Smith)
2. test.instructor2@example.com / Test123! (Prof. Sarah Johnson)
3. test.instructor3@example.com / Test123! (Dr. Michael Chen)
```

---

## 📊 Test Data Created

✅ **15 Sample Assessments** with variety:
- Different subjects: Mathematics, Science, Programming, English, History
- Different instructors: Dr. John Smith, Prof. Sarah Johnson, Dr. Michael Chen
- Different question types: MCQ only, Written only, Mixed
- Different statuses:
  - 🟢 Available now (3 assessments)
  - 🟡 Starting soon (1 assessment)  
  - 🟠 Deadline soon (1 assessment)
  - 🔴 Expired (1 assessment)
  - ⚪ Upcoming (9 assessments)
- Date range: -10 days to +20 days from today

---

## 🧪 Test Phase 1 Features

### **Step 1: Login**
1. Open http://localhost:5174
2. Click "Get Started" or navigate to `/login`
3. Login as: `test.student@example.com` / `Test123!`
4. Should redirect to `/student/dashboard`

---

### **Step 2: Test Enhanced Assessment Filters**
1. Navigate to "Assessments" from sidebar or go to `/student/assessments`
2. **Test Search Filter:**
   - Type "Python" in search box
   - Wait 500ms - should show only Python assessments
   - Clear search

3. **Test Subject Filter:**
   - Select "Mathematics" from Subject dropdown
   - Should show only Mathematics assessments
   - Try other subjects

4. **Test Instructor Filter:**
   - Select "Dr. John Smith" from Instructor dropdown
   - Should show only his assessments
   - Try other instructors

5. **Test Assessment Type Filter:**
   - Select "MCQ Only" - should show MCQ-only assessments
   - Select "Written Only" - should show short/long answer assessments
   - Select "Mixed" - should show combination assessments
   - Select "All Types" - should show everything

6. **Test Sort Options:**
   - "Newest First" - sorted by creation date descending
   - "Title A-Z" - sorted alphabetically
   - "Shortest First" - sorted by duration ascending

7. **Test Date Range Filter:**
   - Set "From Date" to past date
   - Set "To Date" to future date
   - Should filter assessments within range

8. **Test Multiple Filters:**
   - Apply search + subject + instructor together
   - Should show "Filters applied" indicator
   - Click "Clear All Filters" button

9. **Test Pagination:**
   - Should show 9 assessments per page
   - Navigate to page 2 if available
   - Test Previous/Next buttons

---

### **Step 3: Test Calendar View**
1. From `/student/assessments`, click **"📅 Calendar View"** button
2. Should navigate to `/student/calendar`

3. **Test Calendar Display:**
   - Should show current month
   - Dates with assessments should be color-coded:
     - 🟢 Green = Available now
     - 🟡 Yellow = Starting soon
     - 🟠 Orange = Deadline soon
     - 🔴 Red = Expired
     - 🔵 Blue = Completed
     - ⚪ Gray = Upcoming
   - Badge on dates showing assessment count

4. **Test Month Navigation:**
   - Click previous month arrow (◀)
   - Click next month arrow (▶)
   - Calendar should update with new data

5. **Test Date Selection:**
   - Click on a date with assessments
   - Right panel should show "Assessments on [Date]"
   - Mini assessment cards displayed
   - Click on a date without assessments - should show empty state

6. **Test Next Assessment Countdown:**
   - Top card shows next upcoming assessment
   - Shows title and start date/time
   - "View Details" button

7. **Test Status Legend:**
   - Bottom of calendar shows legend
   - All 6 status colors displayed with labels

8. **Test Navigation Back:**
   - Click **"📋 List View"** button
   - Should navigate back to `/student/assessments`

---

### **Step 4: Test API Endpoints (Optional - DevTools)**

Open Browser DevTools (F12) → Network Tab

1. **GET /api/student/assessments**
   - Apply filters and watch network requests
   - Should see query params: `?search=...&subject=...&instructor=...&type=...&sort=...&page=...&limit=9`
   - Response should contain filtered assessments

2. **GET /api/student/assessments/calendar**
   - Navigate to calendar view
   - Should see request: `?month=10&year=2025`
   - Response should include assessments with `status` and `color` fields

3. **GET /api/student/instructors**
   - Open instructor dropdown
   - Should see request to `/api/student/instructors`
   - Response contains list of instructors

---

### **Step 5: Test UI/UX**

1. **Responsive Design:**
   - Resize browser window
   - Test mobile view (F12 → Device Toolbar)
   - Filters should stack on mobile
   - Calendar should be responsive

2. **Dark Mode:**
   - Toggle dark mode from navbar (if available)
   - All components should have proper dark theme

3. **Loading States:**
   - Network throttle in DevTools (Slow 3G)
   - Apply filters - should see skeleton loaders
   - Navigate to calendar - should see spinner

4. **Empty States:**
   - Apply filter combination with no results
   - Should see "No Assessments Found" message
   - Select empty date in calendar - should see placeholder

---

## 🎯 Expected Results

### ✅ Assessment Catalog Should Have:
- Search with debounce (500ms delay)
- 7 working filters (Search, Subject, Instructor, Type, Date Range, Sort)
- Pagination (9 per page)
- Clear filters button
- Calendar view navigation button
- Assessment cards with status badges
- Empty states

### ✅ Calendar Should Have:
- Interactive calendar (react-calendar)
- Color-coded dates based on status
- Assessment count badges on dates
- Month navigation
- Selected date panel with mini cards
- Next assessment countdown card
- Status legend
- List view navigation button

### ✅ All API Endpoints Should:
- Return 200 status codes
- Filter data correctly
- Include pagination metadata
- Handle edge cases (no results, invalid params)

---

## 🐛 Common Issues to Watch For

1. **Filters not applying:** Check network tab for API calls
2. **Calendar not loading:** Check `/api/student/assessments/calendar` response
3. **Instructor dropdown empty:** Check `/api/student/instructors` endpoint
4. **Colors not showing:** Check CSS classes in `index.css`
5. **Pagination not working:** Check total pages calculation

---

## 📝 Test Results

Use this checklist while testing:

- [ ] Login successful
- [ ] Search filter works (500ms debounce)
- [ ] Subject filter works
- [ ] Instructor filter works
- [ ] Assessment type filter works
- [ ] Sort options work
- [ ] Date range filter works
- [ ] Multiple filters work together
- [ ] Clear filters button works
- [ ] Pagination works
- [ ] Calendar view navigation works
- [ ] Calendar displays correctly
- [ ] Calendar color coding accurate
- [ ] Month navigation works
- [ ] Date selection works
- [ ] Mini assessment cards work
- [ ] Next assessment countdown works
- [ ] Status legend displays
- [ ] List view navigation works
- [ ] Responsive design works
- [ ] Dark mode works (if available)
- [ ] Loading states show
- [ ] Empty states show

---

## 📊 Phase 1 Completion Status

**Phase 1: Enhanced Assessment Filtering & Calendar** ✅ COMPLETE

**Backend:**
- ✅ Enhanced `getAvailableAssessments` with 7 filters
- ✅ New `getAssessmentCalendar` endpoint
- ✅ New `getInstructors` endpoint

**Frontend:**
- ✅ Enhanced AssessmentCatalog with advanced filters
- ✅ New AssessmentCalendar component
- ✅ Calendar CSS styling
- ✅ Routes updated
- ✅ API service updated

**Test Data:**
- ✅ 15 sample assessments created
- ✅ 1 student account
- ✅ 3 instructor accounts
- ✅ Various dates, subjects, types

---

## 🚀 Next Phase

**Phase 2: Enhanced Test Interface - All Question Types**
- Support MCQ (single/multiple correct answers)
- Short Answer with character counter
- Long Answer with rich text editor (React Quill)
- Question type badges
- Marks display per question

---

## 💡 Tips

- Use **Chrome DevTools** to monitor network requests
- Check **Console** for any JavaScript errors
- Test with **different screen sizes**
- Try **edge cases** (empty filters, no results, etc.)
- Document any **bugs or issues** found

---

**Happy Testing! 🎉**
