# Phase 1 Testing Guide
## Enhanced Assessment Filtering & Calendar View

**Testing Date:** October 16, 2025  
**Backend:** http://localhost:5000  
**Frontend:** http://localhost:5174

---

## ✅ Pre-Test Checklist

- [x] Backend server running on port 5000
- [x] Frontend server running on port 5174
- [x] MongoDB connected successfully
- [ ] Test user accounts created (student, instructor, admin)
- [ ] Sample assessments created with different:
  - Subjects
  - Instructors
  - Question types (MCQ, Short Answer, Long Answer)
  - Date ranges (past, current, future)
  - Statuses

---

## 🧪 Test Cases

### **Test Group 1: Enhanced Assessment Filters**

#### **TC1.1: Search Filter**
**Steps:**
1. Navigate to `/student/assessments`
2. Type in search box: "Python"
3. Wait 500ms for debounce

**Expected:**
- ✅ Only assessments with "Python" in title/description appear
- ✅ Search happens after 500ms delay (debounce)
- ✅ Loading state shows during search

**Status:** [ ]

---

#### **TC1.2: Subject Filter**
**Steps:**
1. Click Subject dropdown
2. Select a subject (e.g., "Mathematics")
3. Verify results

**Expected:**
- ✅ Only assessments with selected subject appear
- ✅ Dropdown shows all available subjects
- ✅ "All Subjects" option resets filter

**Status:** [ ]

---

#### **TC1.3: Instructor Filter**
**Steps:**
1. Click Instructor dropdown
2. Select an instructor name
3. Verify results

**Expected:**
- ✅ Only assessments by selected instructor appear
- ✅ Dropdown populated from `/api/student/instructors` endpoint
- ✅ Shows instructor names correctly

**Status:** [ ]

---

#### **TC1.4: Assessment Type Filter**
**Steps:**
1. Click Assessment Type dropdown
2. Test each option:
   - All Types
   - MCQ Only
   - Written Only
   - Mixed (MCQ + Written)

**Expected:**
- ✅ "MCQ Only" shows assessments with only MCQ questions
- ✅ "Written Only" shows assessments with short/long answer questions
- ✅ "Mixed" shows assessments with both types
- ✅ Results update correctly for each selection

**Status:** [ ]

---

#### **TC1.5: Date Range Filter**
**Steps:**
1. Set "From Date" to past date
2. Set "To Date" to future date
3. Verify results

**Expected:**
- ✅ Only assessments within date range appear
- ✅ Date picker works correctly
- ✅ Empty date fields show all dates

**Status:** [ ]

---

#### **TC1.6: Sort Options**
**Steps:**
1. Test "Newest First" (default)
2. Test "Title A-Z"
3. Test "Shortest First"

**Expected:**
- ✅ Newest First: Sorted by createdAt desc
- ✅ Title A-Z: Sorted alphabetically by title
- ✅ Shortest First: Sorted by duration ascending

**Status:** [ ]

---

#### **TC1.7: Multiple Filters Combined**
**Steps:**
1. Apply search + subject + instructor
2. Verify results match ALL filters

**Expected:**
- ✅ Results satisfy all active filters (AND logic)
- ✅ "Filters applied" message appears
- ✅ Clear all filters button visible

**Status:** [ ]

---

#### **TC1.8: Clear All Filters**
**Steps:**
1. Apply multiple filters
2. Click "Clear All Filters" button
3. Verify reset

**Expected:**
- ✅ All filter fields reset to default
- ✅ All assessments displayed
- ✅ Page resets to page 1

**Status:** [ ]

---

#### **TC1.9: Pagination with Filters**
**Steps:**
1. Apply filter that returns >9 results
2. Navigate to page 2
3. Change filter
4. Verify page resets

**Expected:**
- ✅ Shows 9 assessments per page
- ✅ Pagination controls work correctly
- ✅ Changing filter resets to page 1

**Status:** [ ]

---

### **Test Group 2: Assessment Calendar**

#### **TC2.1: Calendar View Navigation**
**Steps:**
1. From `/student/assessments`, click "📅 Calendar View" button
2. Verify navigation to `/student/calendar`
3. Click "📋 List View" to go back

**Expected:**
- ✅ Navigates to calendar page
- ✅ Calendar renders correctly
- ✅ Can switch between views seamlessly

**Status:** [ ]

---

#### **TC2.2: Calendar Color Coding**
**Steps:**
1. View calendar for current month
2. Identify dates with assessments
3. Verify color codes match status

**Expected:**
- ✅ 🟢 Green: Available now (startDate ≤ now ≤ endDate)
- ✅ 🟡 Yellow: Starting soon (within 24 hours)
- ✅ 🟠 Orange: Deadline soon (ends within 24 hours)
- ✅ 🔴 Red: Expired (endDate < now)
- ✅ 🔵 Blue: Completed (already submitted)
- ✅ ⚪ Gray: Upcoming (future)

**Status:** [ ]

---

#### **TC2.3: Assessment Count Badges**
**Steps:**
1. Hover over dates with multiple assessments
2. Verify badge shows correct count

**Expected:**
- ✅ Badge shows number of assessments on that date
- ✅ Badge visible and readable
- ✅ Positioned correctly on date tile

**Status:** [ ]

---

#### **TC2.4: Month Navigation**
**Steps:**
1. Click previous month arrow
2. Click next month arrow
3. Verify data loads for new month

**Expected:**
- ✅ Calendar shows selected month
- ✅ API call to `/api/student/assessments/calendar?month=X&year=Y`
- ✅ Assessments load for new month
- ✅ Loading state shown during fetch

**Status:** [ ]

---

#### **TC2.5: Date Selection**
**Steps:**
1. Click on a date with assessments
2. Verify right panel updates
3. Click on a date without assessments

**Expected:**
- ✅ Right panel shows "Assessments on [Date]"
- ✅ Mini cards displayed for assessments on that date
- ✅ Empty state shown for dates without assessments

**Status:** [ ]

---

#### **TC2.6: Assessment Mini Cards**
**Steps:**
1. Click date with assessments
2. Review mini card details
3. Click a mini card

**Expected:**
- ✅ Shows title, duration, marks
- ✅ Status badge displayed correctly
- ✅ Clicking navigates to test page

**Status:** [ ]

---

#### **TC2.7: Next Assessment Countdown**
**Steps:**
1. Verify countdown card at top
2. Check it shows next upcoming assessment
3. Click "View Details" button

**Expected:**
- ✅ Shows next upcoming assessment
- ✅ Displays title and start date/time
- ✅ Gradient background styling
- ✅ Button navigates to test page

**Status:** [ ]

---

#### **TC2.8: Status Legend**
**Steps:**
1. Scroll to legend section
2. Verify all status colors listed

**Expected:**
- ✅ All 6 status colors displayed
- ✅ Labels match color codes
- ✅ Legend matches actual calendar tiles

**Status:** [ ]

---

### **Test Group 3: API Endpoints**

#### **TC3.1: Enhanced GET /api/student/assessments**
**Test in Postman/Browser DevTools:**

```http
GET /api/student/assessments?search=Python&subject=Programming&instructor=507f1f77bcf86cd799439011&type=mcq-only&sort=alphabetical&dateFrom=2025-10-01&dateTo=2025-10-31&page=1&limit=9
Authorization: Bearer <student-token>
```

**Expected:**
- ✅ Status 200
- ✅ Returns filtered assessments
- ✅ Pagination data included
- ✅ All filters applied correctly

**Status:** [ ]

---

#### **TC3.2: GET /api/student/assessments/calendar**
**Test in Postman:**

```http
GET /api/student/assessments/calendar?month=10&year=2025
Authorization: Bearer <student-token>
```

**Expected:**
- ✅ Status 200
- ✅ Returns assessments for October 2025
- ✅ Each assessment has status and color fields
- ✅ Response format:
```json
{
  "success": true,
  "data": {
    "month": 10,
    "year": 2025,
    "assessments": [
      {
        "_id": "...",
        "title": "...",
        "startDate": "...",
        "endDate": "...",
        "status": "available",
        "color": "green",
        "submissionStatus": null
      }
    ]
  }
}
```

**Status:** [ ]

---

#### **TC3.3: GET /api/student/instructors**
**Test in Postman:**

```http
GET /api/student/instructors
Authorization: Bearer <student-token>
```

**Expected:**
- ✅ Status 200
- ✅ Returns list of instructors
- ✅ Each instructor has _id, name, email
- ✅ Sorted alphabetically by name

**Status:** [ ]

---

### **Test Group 4: UI/UX Features**

#### **TC4.1: Responsive Design**
**Steps:**
1. Test on desktop (1920x1080)
2. Test on tablet (768px)
3. Test on mobile (375px)

**Expected:**
- ✅ Filters stack on mobile
- ✅ Assessment grid adjusts columns
- ✅ Calendar responsive
- ✅ No horizontal scroll

**Status:** [ ]

---

#### **TC4.2: Dark Mode**
**Steps:**
1. Toggle dark mode in navbar
2. Verify all Phase 1 components

**Expected:**
- ✅ Calendar tiles have dark theme
- ✅ Filters use dark colors
- ✅ Status badges readable
- ✅ No contrast issues

**Status:** [ ]

---

#### **TC4.3: Loading States**
**Steps:**
1. Apply filter with slow network (throttle in DevTools)
2. Observe skeleton loaders
3. Navigate to calendar

**Expected:**
- ✅ Skeleton loaders show during fetch
- ✅ Spinner in calendar view
- ✅ No flash of empty state
- ✅ Smooth transitions

**Status:** [ ]

---

#### **TC4.4: Empty States**
**Steps:**
1. Apply filter with no results
2. View calendar month with no assessments
3. Select date with no assessments

**Expected:**
- ✅ "No Assessments Found" message in list view
- ✅ Clear filters button shown
- ✅ "No assessments on this date" in calendar
- ✅ Helpful messaging

**Status:** [ ]

---

#### **TC4.5: Error Handling**
**Steps:**
1. Stop backend server
2. Try to load assessments
3. Restart backend

**Expected:**
- ✅ Error toast notification
- ✅ User-friendly error message
- ✅ Retry mechanism or reload option

**Status:** [ ]

---

### **Test Group 5: Performance**

#### **TC5.1: Debounce Performance**
**Steps:**
1. Type rapidly in search box
2. Monitor network tab in DevTools

**Expected:**
- ✅ API call only after 500ms of no typing
- ✅ No excessive API calls
- ✅ Previous requests cancelled

**Status:** [ ]

---

#### **TC5.2: Filter Combination Performance**
**Steps:**
1. Apply all 7 filters simultaneously
2. Monitor response time

**Expected:**
- ✅ Response time < 1 second
- ✅ No UI freeze
- ✅ Results accurate

**Status:** [ ]

---

#### **TC5.3: Calendar Month Load**
**Steps:**
1. Load month with many assessments (20+)
2. Monitor rendering time

**Expected:**
- ✅ Calendar renders in < 500ms
- ✅ No lag when clicking dates
- ✅ Smooth month navigation

**Status:** [ ]

---

## 🐛 Bug Tracker

| Bug ID | Description | Severity | Status | Fix |
|--------|-------------|----------|--------|-----|
| - | - | - | - | - |

---

## 📊 Test Summary

**Total Test Cases:** 31  
**Passed:** [ ]  
**Failed:** [ ]  
**Blocked:** [ ]  
**Pass Rate:** [ ]%

---

## 🔍 Edge Cases to Test

1. **No assessments in database** - Verify empty state
2. **Single assessment** - Verify no pagination
3. **Exactly 9 assessments** - Verify pagination boundary
4. **Very long assessment title** - Verify truncation/wrapping
5. **Assessment with no subjects** - Verify display
6. **Assessment with 10+ subjects** - Verify "+X more" badge
7. **Date in different timezone** - Verify correct display
8. **Concurrent filter changes** - Verify race conditions handled
9. **Special characters in search** - Verify no crashes
10. **Invalid date range** (to before from) - Verify handling

---

## ✨ Recommendations

After testing, note:
- Performance improvements needed
- UI/UX enhancements
- Bug fixes required
- Additional features to add

---

## 📝 Notes

Add any observations during testing...
