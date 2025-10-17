# Complete Student Module Implementation Guide

## 🎯 Overview
This document provides the complete implementation for the Student Module of the Unified Assessment Platform, covering test taking, submissions, profile, settings, notifications, calendar, and help features.

## ✅ Implementation Status

### Backend (Completed)
- ✅ Models: Notification.js (exists), Settings.js ✅, Activity.js ✅
- ✅ Controllers: testController.js ✅, submissionController.js ✅
- ⏳ Remaining: profileController.js, notificationController.js, settingsController.js, calendarController.js
- ⏳ Routes: Update student.routes.js
- ⏳ Middleware: uploadMiddleware.js

### Frontend (To Complete)
- ⏳ Services: 6 service files needed
- ⏳ Hooks: 3 custom hooks needed
- ⏳ Pages: 8 major pages needed
- ⏳ Components: 20+ components needed

---

## 📦 Backend Controllers (Remaining)

### 1. Profile Controller
**File**: `backend/src/controllers/profileController.js`

Key Functions:
- `getProfile()` - Get user profile
- `updateProfile()` - Update profile fields
- `uploadAvatar()` - Handle avatar upload
- `changePassword()` - Change user password
- `getActivityLog()` - Get user activity history
- `getStatistics()` - Get performance statistics

### 2. Notification Controller
**File**: `backend/src/controllers/notificationController.js`

Key Functions:
- `getNotifications()` - Get all notifications with pagination
- `getUnreadCount()` - Get count of unread notifications
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification()` - Delete a notification

### 3. Settings Controller
**File**: `backend/src/controllers/settingsController.js`

Key Functions:
- `getSettings()` - Get user settings (create defaults if not exist)
- `updateSettings()` - Update settings by category

### 4. Calendar Controller
**File**: `backend/src/controllers/calendarController.js`

Key Functions:
- `getCalendarEvents()` - Get assessments for calendar month view

---

## 🛠️ Upload Middleware

### File: `backend/src/middlewares/uploadMiddleware.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = './uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

module.exports = upload;
```

---

## 🔌 Frontend Services

### 1. Test Service
**File**: `frontend/src/services/testService.js`

```javascript
import api from './api';

export const testService = {
  startAssessment: async (id) => {
    const response = await api.post(`/student/assessments/${id}/start`);
    return response.data;
  },

  saveAnswer: async (submissionId, questionId, answer) => {
    const response = await api.put(`/student/submissions/${submissionId}/answer`, {
      questionId,
      answer
    });
    return response.data;
  },

  submitAssessment: async (submissionId) => {
    const response = await api.post(`/student/submissions/${submissionId}/submit`);
    return response.data;
  }
};
```

### 2. Submission Service
**File**: `frontend/src/services/submissionService.js`

```javascript
import api from './api';

export const submissionService = {
  getSubmissions: async (params = {}) => {
    const response = await api.get('/student/submissions', { params });
    return response.data;
  },

  getSubmissionDetails: async (id) => {
    const response = await api.get(`/student/submissions/${id}`);
    return response.data;
  }
};
```

### 3. Profile Service
**File**: `frontend/src/services/profileService.js`

```javascript
import api from './api';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/student/profile', data);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/student/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/student/profile/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  getActivityLog: async (params = {}) => {
    const response = await api.get('/student/profile/activity', { params });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/student/profile/statistics');
    return response.data;
  }
};
```

---

## 🎣 Custom Hooks

### 1. useTimer Hook
**File**: `frontend/src/hooks/useTimer.js`

Provides countdown timer functionality with warnings:
- Starts from duration in minutes
- Fires callback when time expires
- Shows warnings at 5min and 1min
- Returns formatted time, start/pause/resume/reset functions

### 2. useAutoSave Hook
**File**: `frontend/src/hooks/useAutoSave.js`

Provides auto-save functionality:
- Debounces save operations
- Tracks last saved timestamp
- Provides manual save function
- Returns isSaving status

### 3. useNotifications Hook
**File**: `frontend/src/hooks/useNotifications.js`

Manages notifications state:
- Fetches notifications
- Polls for unread count
- Mark as read functionality
- Delete functionality

---

## 📄 Key Pages Overview

### 1. Take Test Page (`TakeTestPage.jsx`)
Full-screen test interface with:
- Timer in header
- Question display area
- Question navigator sidebar
- Auto-save indicator
- Submit confirmation modal

### 2. Submissions Page (`SubmissionsPage.jsx`)
Grid view of all submissions with:
- Search and filter
- Status badges
- Score display
- Pagination

### 3. Submission Detail Page (`SubmissionDetailPage.jsx`)
Comprehensive submission review:
- Score breakdown
- Question-wise review
- Instructor feedback
- Statistics

### 4. Profile Page (`ProfilePage.jsx`)
User profile management:
- Personal information
- Avatar upload
- Activity log
- Performance statistics
- Change password

### 5. Settings Page (`SettingsPage.jsx`)
Tabbed settings interface:
- General settings
- Notification preferences
- Appearance options
- Privacy controls
- Accessibility features

### 6. Calendar Page (`CalendarPage.jsx`)
Monthly calendar view:
- Assessment deadlines
- Color-coded by status
- Click to view details

### 7. Help Page (`HelpPage.jsx`)
Help and support:
- FAQ accordion
- Search functionality
- Contact support form

### 8. Notifications Page (`NotificationsPage.jsx`)
Notifications center:
- List view with filters
- Mark as read
- Delete functionality
- Real-time updates

---

## 🧩 Critical Components

### Test Taking Components
1. `QuestionDisplay.jsx` - Wrapper for all question types
2. `MCQQuestion.jsx` - Multiple choice with checkboxes/radios
3. `ShortAnswerQuestion.jsx` - Textarea with character count
4. `LongAnswerQuestion.jsx` - Rich text editor (React Quill)
5. `QuestionNavigator.jsx` - Sidebar with question grid
6. `SubmitConfirmModal.jsx` - Submission confirmation dialog

### Submission Components
1. `SubmissionCard.jsx` - Submission grid card
2. `QuestionReview.jsx` - Individual question review
3. `ScoreBreakdown.jsx` - Score statistics breakdown

### Profile Components
1. `EditProfileModal.jsx` - Profile editing form
2. `ChangePasswordModal.jsx` - Password change form
3. `ActivityLog.jsx` - Activity timeline
4. `PerformanceStats.jsx` - Charts and statistics

### Common Components
1. `NotificationBell.jsx` - Dropdown notification bell
2. `SettingsTabs.jsx` - Settings category tabs
3. `CalendarGrid.jsx` - Monthly calendar grid
4. `FAQAccordion.jsx` - Collapsible FAQ items

---

## 🔗 Routing Updates

**File**: `frontend/src/App.jsx`

Add these routes inside student protected routes:

```javascript
// Test Taking
<Route path="/student/test/:id" element={<TakeTestPage />} />

// Submissions
<Route path="/student/submissions" element={<SubmissionsPage />} />
<Route path="/student/submissions/:id" element={<SubmissionDetailPage />} />

// Profile
<Route path="/student/profile" element={<ProfilePage />} />

// Settings
<Route path="/student/settings" element={<SettingsPage />} />

// Calendar
<Route path="/student/calendar" element={<CalendarPage />} />

// Notifications
<Route path="/student/notifications" element={<NotificationsPage />} />

// Help
<Route path="/student/help" element={<HelpPage />} />
```

---

## 📊 Database Schema Summary

### Notification Schema
- userId, type, title, message, link
- isRead (boolean), priority (low/medium/high)
- timestamps

### Settings Schema
- userId (unique)
- general: language, timezone, dateFormat, timeFormat, etc.
- notifications: email/browser/specific event preferences
- appearance: theme, color, fontSize, density
- privacy: visibility, activity status, analytics
- accessibility: high contrast, reduce motion, screen reader, etc.

### Activity Schema
- userId, type, title, description
- metadata (mixed), relatedId
- timestamps

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Start assessment - new submission created
- [ ] Start assessment - resume existing in-progress
- [ ] Start assessment - prevent restart after submission
- [ ] Save answer - MCQ auto-evaluation
- [ ] Save answer - written answers saved
- [ ] Submit assessment - score calculation
- [ ] Submit assessment - notification creation
- [ ] Get submissions - pagination works
- [ ] Get submission details - statistics calculated
- [ ] Profile operations - CRUD working
- [ ] Notifications - mark read, delete
- [ ] Settings - update by category

### Frontend Tests
- [ ] Timer counts down correctly
- [ ] Timer warnings at 5min and 1min
- [ ] Auto-save every 30 seconds
- [ ] Manual save on button click
- [ ] Question navigation works
- [ ] Mark for review functionality
- [ ] Submit modal shows correct stats
- [ ] Submission list loads with filters
- [ ] Submission detail shows all data
- [ ] Profile update works
- [ ] Avatar upload works
- [ ] Password change works
- [ ] Settings persist after save
- [ ] Calendar displays events
- [ ] Notifications update in real-time

---

## 🚀 Implementation Priority

### Phase 1: Test Taking (CRITICAL)
1. Create testService.js
2. Create useTimer.js, useAutoSave.js hooks
3. Create TakeTestPage.jsx
4. Create question components (MCQ, Short, Long)
5. Create QuestionNavigator and SubmitModal
6. Test end-to-end test taking flow

### Phase 2: Submissions Review
1. Create submissionService.js
2. Create SubmissionsPage.jsx
3. Create SubmissionCard.jsx
4. Create SubmissionDetailPage.jsx
5. Create QuestionReview and ScoreBreakdown
6. Test submission viewing

### Phase 3: Profile & Settings
1. Create profileService.js, settingsService.js
2. Create uploadMiddleware.js
3. Create ProfilePage.jsx, SettingsPage.jsx
4. Create related modals and components
5. Test profile updates and settings

### Phase 4: Supporting Features
1. Create notificationService.js, calendarService.js
2. Create useNotifications.js hook
3. Create NotificationsPage, CalendarPage, HelpPage
4. Create NotificationBell component
5. Test all supporting features

---

## 📝 Notes

- All backend controllers follow async/await pattern with try-catch
- All frontend services use axios interceptors for auth
- All forms use controlled components
- All lists implement pagination
- All modals use portal rendering
- All images use lazy loading
- All timestamps use date-fns for formatting
- All rich text uses React Quill
- All charts use Recharts
- All notifications use React Toastify

---

## 🔧 Environment Variables

Add to `.env`:
```
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpeg,jpg,png,gif
AUTO_SAVE_INTERVAL=30000
SESSION_TIMEOUT=3600000
```

---

## 📚 Dependencies to Install

### Backend
```bash
cd backend
npm install multer date-fns
```

### Frontend
```bash
cd frontend
npm install react-quill recharts date-fns
```

---

This guide provides the complete blueprint for implementing the Student Module. Follow the implementation priority to build features incrementally and test thoroughly at each phase.

**Total Estimated Time**: 40-50 hours for complete implementation
**Total Files**: 50+ files (30 new, 20 updates)
**Total Lines of Code**: ~8,000-10,000 lines
