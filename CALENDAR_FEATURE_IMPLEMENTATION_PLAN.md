# 📅 Feature 5: Calendar View - Complete Implementation Plan

## 🎯 Overview
**Priority:** HIGH ⭐⭐⭐  
**Estimated Time:** 8-10 hours  
**Complexity:** Medium  
**User Impact:** ALL roles benefit

---

## 📋 What We'll Build

### **For Students:**
- Visual calendar showing upcoming assessments
- Color-coded by subject/priority
- Countdown indicators for due dates
- Filter by month/week/day view
- Quick assessment details on hover
- "Add to Google Calendar" export

### **For Instructors:**
- Calendar showing submission deadlines
- Pending evaluations marked with badge
- Assessment schedule overview
- Bulk date management
- Drag-and-drop to reschedule

### **For Admins:**
- Platform-wide activity calendar
- User registration trends by date
- Assessment creation timeline
- System events and maintenance schedule
- Export calendar data

---

## 🗂️ Files to Create

### **Backend (3 files)**

#### 1. `backend/src/controllers/calendarController.js` (~250 lines)
```javascript
/**
 * CALENDAR CONTROLLER
 * 
 * Methods:
 * - getStudentCalendar(req, res, next)
 *   * Get all assessments assigned to student
 *   * Group by date
 *   * Include submission status
 *   * Calculate countdown
 * 
 * - getInstructorCalendar(req, res, next)
 *   * Get all assessments created by instructor
 *   * Show pending evaluations count per date
 *   * Include deadline information
 * 
 * - getAdminCalendar(req, res, next)
 *   * Platform-wide activity view
 *   * User registrations by date
 *   * Assessment creation by date
 *   * Activity logs summary by date
 * 
 * - getEventsByDateRange(req, res, next)
 *   * Flexible query for date range
 *   * Filter by event type
 *   * Support pagination
 * 
 * - updateAssessmentDate(req, res, next)
 *   * Allow instructors to reschedule
 *   * Send notifications to affected students
 *   * Log the change
 */
```

#### 2. `backend/src/routes/calendar.routes.js` (~50 lines)
```javascript
/**
 * CALENDAR ROUTES
 * 
 * GET /api/calendar/student/:studentId
 * GET /api/calendar/instructor/:instructorId
 * GET /api/calendar/admin
 * GET /api/calendar/events?start=2024-01-01&end=2024-12-31
 * PATCH /api/calendar/assessment/:id/date
 * GET /api/calendar/export/:userId (iCal format)
 */
```

#### 3. `backend/src/services/calendarService.js` (~200 lines)
```javascript
/**
 * CALENDAR SERVICE
 * 
 * Functions:
 * - aggregateEventsByDate(events, groupBy) // day, week, month
 * - calculateCountdown(targetDate)
 * - generateColorBySubject(subject)
 * - generateColorByPriority(priority)
 * - formatEventForCalendar(event)
 * - generateICalFile(events) // Export to .ics
 * - sendRescheduledNotifications(assessmentId, newDate)
 */
```

---

### **Frontend (5 files)**

#### 4. `frontend/src/components/common/CalendarView.jsx` (~600 lines)
```jsx
/**
 * UNIVERSAL CALENDAR COMPONENT
 * 
 * Features:
 * - Month/Week/Day view toggle
 * - Event cards with color coding
 * - Hover to show quick details
 * - Click to navigate to assessment
 * - Today button
 * - Previous/Next navigation
 * - Current date highlighting
 * - Event count badges per day
 * - Responsive design
 * 
 * Props:
 * - events: array of calendar events
 * - view: 'month' | 'week' | 'day'
 * - onEventClick: callback
 * - onDateChange: callback
 * - userRole: 'student' | 'instructor' | 'admin'
 * - editable: boolean (drag-and-drop)
 */
```

#### 5. `frontend/src/pages/student/AssessmentCalendar.jsx` (~400 lines)
```jsx
/**
 * STUDENT CALENDAR PAGE
 * 
 * Features:
 * - Fetch assigned assessments
 * - Show submission status badges
 * - Countdown timers
 * - Filter by subject
 * - Search by title
 * - Export to Google Calendar
 * - Color legend
 * - Quick actions (Start Assessment, View Details)
 * 
 * Event Types:
 * - Assessment Deadline (red if overdue, orange if upcoming)
 * - Scheduled Assessments (blue)
 * - Evaluated Assessments (green)
 */
```

#### 6. `frontend/src/pages/instructor/EvaluationCalendar.jsx` (~450 lines)
```jsx
/**
 * INSTRUCTOR CALENDAR PAGE
 * 
 * Features:
 * - Show all created assessments
 * - Pending evaluations count badge
 * - Drag-and-drop to reschedule
 * - Bulk date update
 * - Filter by class/course
 * - Search by title
 * - Export schedule
 * 
 * Event Types:
 * - Assessment Published (green)
 * - Submission Deadline (orange)
 * - Pending Evaluations (red with count badge)
 * - Completed Evaluations (blue)
 */
```

#### 7. `frontend/src/pages/admin/ActivityCalendar.jsx` (~500 lines)
```jsx
/**
 * ADMIN ACTIVITY CALENDAR
 * 
 * Features:
 * - Platform-wide events
 * - User registration heatmap
 * - Assessment creation timeline
 * - Activity logs summary
 * - System maintenance events
 * - Custom event creation
 * - Export reports by date range
 * 
 * Event Types:
 * - User Registrations (count per day)
 * - Assessments Created (count per day)
 * - High Activity Alerts (red)
 * - System Events (purple)
 * - Maintenance Schedule (yellow)
 */
```

#### 8. `frontend/src/hooks/useCalendar.js` (~150 lines)
```javascript
/**
 * CALENDAR CUSTOM HOOK
 * 
 * State Management:
 * - currentDate
 * - view (month/week/day)
 * - events
 * - filters
 * - loading
 * 
 * Functions:
 * - goToToday()
 * - goToPrevious()
 * - goToNext()
 * - changeView(viewType)
 * - filterEvents(criteria)
 * - fetchEvents(dateRange)
 * - updateEventDate(eventId, newDate)
 * 
 * Returns: { state, actions }
 */
```

---

## 🎨 UI/UX Design Specifications

### **Calendar Layout (Month View)**
```
┌──────────────────────────────────────────────────────┐
│  ← October 2024 →          [Month][Week][Day]  [⚙️]  │
├──────────────────────────────────────────────────────┤
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat            │
├──────────────────────────────────────────────────────┤
│   29    30     1     2     3     4     5             │
│              [🔵]                                      │
├──────────────────────────────────────────────────────┤
│    6     7     8     9    10    11    12             │
│        [🔴]         [🟢]                               │
│         3                                             │
├──────────────────────────────────────────────────────┤
│   13    14    15    16    17    18    19             │
│                     [🟡]                               │
└──────────────────────────────────────────────────────┘

Legend:
🔵 Blue - Scheduled Assessment
🔴 Red - Overdue/Pending Evaluation
🟢 Green - Completed
🟡 Yellow - Due Soon (within 24h)
```

### **Event Card Design**
```
┌────────────────────────────────────┐
│ 📄 Mathematics Final Exam          │
│ ⏰ 10:00 AM - 12:00 PM            │
│ 📚 Subject: Math | Priority: High │
│ ⏳ Due in 3 hours                 │
│ [View Details] [Start Now]        │
└────────────────────────────────────┘
```

---

## 🔧 API Endpoints Design

### **1. Get Student Calendar**
```http
GET /api/calendar/student/:studentId
Query Params:
  - start: 2024-01-01 (ISO date)
  - end: 2024-12-31 (ISO date)
  - view: month|week|day

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "assessment_123",
        "type": "assessment",
        "title": "Math Final Exam",
        "subject": "Mathematics",
        "startDate": "2024-10-15T10:00:00Z",
        "endDate": "2024-10-15T12:00:00Z",
        "deadline": "2024-10-15T12:00:00Z",
        "status": "pending", // pending, submitted, evaluated
        "priority": "high",
        "color": "#EF4444",
        "countdown": {
          "days": 0,
          "hours": 3,
          "minutes": 45
        },
        "submissionStatus": null,
        "score": null
      }
    ],
    "summary": {
      "total": 15,
      "pending": 5,
      "submitted": 7,
      "evaluated": 3
    }
  }
}
```

### **2. Get Instructor Calendar**
```http
GET /api/calendar/instructor/:instructorId
Query Params:
  - start: 2024-01-01
  - end: 2024-12-31

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "assessment_456",
        "type": "assessment",
        "title": "Physics Quiz 3",
        "subject": "Physics",
        "publishedDate": "2024-10-10T08:00:00Z",
        "deadline": "2024-10-20T23:59:59Z",
        "totalSubmissions": 45,
        "pendingEvaluations": 12,
        "evaluatedCount": 33,
        "color": "#F59E0B",
        "badge": {
          "count": 12,
          "label": "Pending"
        }
      }
    ],
    "summary": {
      "totalAssessments": 20,
      "pendingEvaluations": 45,
      "completedEvaluations": 230
    }
  }
}
```

### **3. Get Admin Calendar**
```http
GET /api/calendar/admin
Query Params:
  - start: 2024-01-01
  - end: 2024-12-31
  - eventType: registrations|assessments|activities|all

Response:
{
  "success": true,
  "data": {
    "events": [
      {
        "date": "2024-10-15",
        "type": "registrations",
        "count": 25,
        "label": "25 New Users",
        "color": "#3B82F6"
      },
      {
        "date": "2024-10-15",
        "type": "assessments",
        "count": 8,
        "label": "8 Assessments Created",
        "color": "#10B981"
      }
    ],
    "trends": {
      "userGrowth": "+15%",
      "assessmentCreation": "+8%",
      "averageActivity": 320
    }
  }
}
```

### **4. Update Assessment Date**
```http
PATCH /api/calendar/assessment/:id/date
Body:
{
  "newDate": "2024-10-25T10:00:00Z",
  "notifyStudents": true,
  "reason": "Extended due to holidays"
}

Response:
{
  "success": true,
  "message": "Assessment deadline updated successfully",
  "data": {
    "assessmentId": "123",
    "oldDate": "2024-10-20T10:00:00Z",
    "newDate": "2024-10-25T10:00:00Z",
    "notificationsSent": 45
  }
}
```

### **5. Export Calendar**
```http
GET /api/calendar/export/:userId
Query Params:
  - format: ical|csv
  - start: 2024-01-01
  - end: 2024-12-31

Response:
Content-Type: text/calendar (for iCal)
Generates .ics file for import to Google Calendar, Outlook, etc.
```

---

## 📊 Database Queries

### **Student Calendar Query**
```javascript
// Aggregate assessments with submission status
Assessment.aggregate([
  {
    $match: {
      students: mongoose.Types.ObjectId(studentId),
      isPublished: true,
      deadline: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    }
  },
  {
    $lookup: {
      from: 'submissions',
      let: { assessmentId: '$_id', studentId: mongoose.Types.ObjectId(studentId) },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$assessmentId', '$$assessmentId'] },
                { $eq: ['$studentId', '$$studentId'] }
              ]
            }
          }
        }
      ],
      as: 'submission'
    }
  },
  {
    $addFields: {
      submission: { $arrayElemAt: ['$submission', 0] },
      countdown: {
        $dateDiff: {
          startDate: new Date(),
          endDate: '$deadline',
          unit: 'hour'
        }
      }
    }
  },
  { $sort: { deadline: 1 } }
]);
```

### **Instructor Calendar Query**
```javascript
// Get assessments with pending evaluation counts
Assessment.aggregate([
  {
    $match: {
      createdBy: mongoose.Types.ObjectId(instructorId),
      createdAt: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    }
  },
  {
    $lookup: {
      from: 'submissions',
      localField: '_id',
      foreignField: 'assessmentId',
      as: 'submissions'
    }
  },
  {
    $addFields: {
      totalSubmissions: { $size: '$submissions' },
      pendingEvaluations: {
        $size: {
          $filter: {
            input: '$submissions',
            cond: { $eq: ['$$this.status', 'submitted'] }
          }
        }
      },
      evaluatedCount: {
        $size: {
          $filter: {
            input: '$submissions',
            cond: { $eq: ['$$this.status', 'evaluated'] }
          }
        }
      }
    }
  }
]);
```

### **Admin Calendar Query**
```javascript
// Daily activity aggregation
[
  // User registrations
  User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]),
  
  // Assessment creations
  Assessment.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ])
]
```

---

## 🎯 Color Coding System

### **By Status (Students)**
```javascript
const getStatusColor = (status, deadline) => {
  const now = new Date();
  const hoursUntilDeadline = (new Date(deadline) - now) / (1000 * 60 * 60);
  
  if (status === 'evaluated') return '#10B981'; // Green
  if (status === 'submitted') return '#3B82F6'; // Blue
  if (hoursUntilDeadline < 0) return '#EF4444'; // Red (overdue)
  if (hoursUntilDeadline < 24) return '#F59E0B'; // Orange (due soon)
  return '#6B7280'; // Gray (upcoming)
};
```

### **By Priority**
```javascript
const getPriorityColor = (priority) => {
  switch(priority) {
    case 'critical': return '#DC2626'; // Dark Red
    case 'high': return '#EF4444';     // Red
    case 'medium': return '#F59E0B';   // Orange
    case 'low': return '#3B82F6';      // Blue
    default: return '#6B7280';         // Gray
  }
};
```

### **By Subject (Generate Unique Colors)**
```javascript
const getSubjectColor = (subject) => {
  const colors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
    '#EF4444', '#14B8A6', '#F97316', '#EC4899'
  ];
  const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
```

---

## 🔔 Notification Integration

When assessment date is updated:
```javascript
// In calendarController.updateAssessmentDate()
await createNotification({
  recipients: assessment.students,
  type: 'assessment_rescheduled',
  title: 'Assessment Rescheduled',
  message: `"${assessment.title}" has been rescheduled to ${newDate}`,
  priority: 'medium',
  link: `/student/assessments/${assessment._id}`,
  metadata: {
    assessmentId: assessment._id,
    oldDate: assessment.deadline,
    newDate: newDate,
    reason: req.body.reason
  }
});

// Send email
await sendEmail({
  to: studentsEmails,
  subject: 'Assessment Date Updated',
  template: 'assessmentRescheduled',
  data: { assessment, oldDate, newDate, reason }
});
```

---

## 🧪 Testing Checklist

### **Backend Testing**
- [ ] Student calendar returns only assigned assessments
- [ ] Instructor calendar shows pending evaluation counts
- [ ] Admin calendar aggregates platform activity
- [ ] Date range filtering works correctly
- [ ] Countdown calculations are accurate
- [ ] Update assessment date sends notifications
- [ ] iCal export generates valid .ics file
- [ ] Timezone handling is correct

### **Frontend Testing**
- [ ] Month/Week/Day views render correctly
- [ ] Event cards show accurate information
- [ ] Color coding matches status/priority
- [ ] Hover shows quick details
- [ ] Click navigates to assessment page
- [ ] Today button resets to current date
- [ ] Previous/Next navigation works
- [ ] Drag-and-drop reschedule (instructor)
- [ ] Export to Google Calendar works
- [ ] Responsive on mobile devices
- [ ] Loading states display properly
- [ ] Empty state when no events

---

## 📈 Performance Considerations

### **Optimization Strategies**
1. **Caching**: Cache calendar events in localStorage (5-minute TTL)
2. **Lazy Loading**: Load only current month initially
3. **Debouncing**: Debounce drag-and-drop updates (500ms)
4. **Pagination**: Limit events per day (show "X more" if > 3)
5. **Indexing**: Add MongoDB indexes on `deadline`, `createdAt`, `students`

### **Database Indexes**
```javascript
// Assessment model
assessmentSchema.index({ deadline: 1 });
assessmentSchema.index({ students: 1, deadline: 1 });
assessmentSchema.index({ createdBy: 1, createdAt: 1 });

// User model
userSchema.index({ createdAt: 1 });
```

---

## 🚀 Implementation Steps (In Order)

### **Phase 1: Backend Foundation** (3-4 hours)
1. Create `calendarService.js` with utility functions
2. Create `calendarController.js` with all methods
3. Create `calendar.routes.js` with all endpoints
4. Add routes to `server.js`
5. Test all APIs with Postman/curl

### **Phase 2: Core Calendar Component** (2-3 hours)
6. Create `useCalendar.js` hook
7. Create `CalendarView.jsx` base component
8. Implement month view layout
9. Add event rendering logic
10. Add navigation (prev/next/today)

### **Phase 3: Role-Specific Pages** (2-3 hours)
11. Create `AssessmentCalendar.jsx` (student)
12. Create `EvaluationCalendar.jsx` (instructor)
13. Create `ActivityCalendar.jsx` (admin)
14. Add routes to App.jsx
15. Add navigation links to respective dashboards

### **Phase 4: Advanced Features** (1-2 hours)
16. Implement week/day views
17. Add drag-and-drop (instructor only)
18. Add filter/search functionality
19. Implement iCal export
20. Add loading and empty states

---

## 📚 Dependencies to Install

```bash
# Backend
npm install ical-generator  # For iCal export

# Frontend
npm install react-big-calendar  # Optional: Calendar library
npm install date-fns  # Date utilities
npm install react-dnd react-dnd-html5-backend  # Drag-and-drop
```

**OR** build from scratch using vanilla React (recommended for full control).

---

## 🎓 Key Learning Points

1. **Date Handling**: Always use UTC and convert to user's timezone
2. **Event Aggregation**: Efficiently group events by date
3. **Responsive Design**: Calendar must work on all screen sizes
4. **Performance**: Lazy load and cache for smooth UX
5. **Accessibility**: Keyboard navigation and screen reader support

---

## ✅ Definition of Done

- [ ] All three calendar views (student/instructor/admin) working
- [ ] Month/Week/Day view toggle functional
- [ ] Color coding implemented and consistent
- [ ] Countdown timers accurate
- [ ] Drag-and-drop reschedule works (instructor)
- [ ] Export to iCal/Google Calendar works
- [ ] Notifications sent on reschedule
- [ ] Responsive on mobile
- [ ] All API endpoints tested
- [ ] Documentation updated

---

**Estimated Total Time:** 8-10 hours  
**Ready to Start?** Reply with "Start Calendar Feature" and I'll begin implementation! 🚀
