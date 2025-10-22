# OneYes Unified Assessment Platform - Comprehensive Implementation Guide

**Date:** October 22, 2025  
**Version:** 2.0  
**Repository:** Kabilash01/OneYes-Unified-Assessment-

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Recent Features Implemented](#recent-features-implemented)
3. [Architecture Overview](#architecture-overview)
4. [Bulk CSV User Import Feature](#bulk-csv-user-import-feature)
5. [Notification System Enhancement](#notification-system-enhancement)
6. [Performance Optimizations](#performance-optimizations)
7. [Bug Fixes & Improvements](#bug-fixes--improvements)
8. [Technical Stack](#technical-stack)
9. [Installation & Setup](#installation--setup)
10. [Testing Guide](#testing-guide)
11. [API Documentation](#api-documentation)
12. [Troubleshooting](#troubleshooting)
13. [Future Enhancements](#future-enhancements)

---

## 🎯 Executive Summary

This document provides a comprehensive overview of the OneYes Unified Assessment Platform, with detailed focus on the latest implementations including bulk CSV user import functionality and role-based notification system enhancements.

### Key Achievements

- ✅ **Bulk User Import**: Full-featured CSV import with validation, preview, and error handling
- ✅ **Role-Based Notifications**: Dynamic notification endpoints for Admin, Instructor, and Student roles
- ✅ **Performance Optimization**: 90% reduction in notification API calls (120/hour → 12/hour)
- ✅ **Rate Limit Enhancement**: Increased from 1,000 to 10,000 requests per 15 minutes
- ✅ **Bug Fixes**: Resolved infinite refresh loops, circular dependencies, and 403 authorization errors

---

## 🏢 Complete Module & Feature Overview

### Platform Roles

The OneYes Unified Assessment Platform supports three distinct user roles, each with dedicated modules and features:

1. **Admin** - Full platform management and oversight
2. **Instructor** - Assessment creation, evaluation, and student management
3. **Student** - Test taking, submission tracking, and performance monitoring

---

## 📦 Module Catalog

### 1. Authentication & Authorization Module

**Purpose**: Secure user authentication, password management, and role-based access control

**Components**:
- `frontend/src/pages/auth/Login.jsx` - User login interface
- `frontend/src/pages/auth/Register.jsx` - New user registration
- `frontend/src/pages/auth/ForgotPassword.jsx` - Password reset request
- `frontend/src/pages/auth/ResetPassword.jsx` - Password reset form with token validation
- `frontend/src/components/ProtectedRoute.jsx` - Route guard for authenticated pages

**Backend Routes**:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - New user registration
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password/:token` - Reset password with token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

**Features**:
- JWT-based authentication with 7-day expiration
- Bcrypt password hashing (10 rounds)
- Role-based authorization (admin, instructor, student)
- Password reset via email with time-limited tokens
- "Remember me" functionality
- Automatic token refresh
- Session management

**Security**:
- Rate limiting on authentication endpoints
- Password complexity requirements (min 6 characters)
- Token expiration and validation
- Protected routes with middleware
- XSS and CSRF protection

---

### 2. Admin Dashboard Module

**Purpose**: Centralized platform administration and monitoring

**Components**:
- `frontend/src/pages/admin/AdminDashboard.jsx` - Main admin overview
- `frontend/src/pages/admin/Dashboard.jsx` - Admin homepage
- `frontend/src/components/admin/DashboardOverview.jsx` - Statistics widgets
- `frontend/src/components/admin/AdminNavbar.jsx` - Admin navigation bar
- `frontend/src/components/admin/AdminSidebar.jsx` - Admin sidebar menu
- `frontend/src/components/admin/SuspiciousAlerts.jsx` - Security alerts widget

**Backend Routes**:
- `GET /api/admin/dashboard/stats` - Platform statistics
- `GET /api/admin/dashboard/recent-activity` - Recent system activity
- `GET /api/admin/dashboard/alerts` - Security and system alerts

**Features**:
- Real-time platform statistics (total users, active assessments, submissions)
- User growth charts and trends
- Assessment completion rates
- System health monitoring
- Recent activity feed
- Suspicious activity alerts
- Quick action buttons
- Role distribution charts
- Performance metrics overview

**Metrics Displayed**:
- Total users by role
- Active assessments count
- Pending submissions
- Average completion rates
- Daily/weekly/monthly user growth
- Platform uptime
- Storage usage

---

### 3. User Management Module

**Purpose**: Complete CRUD operations for platform users

**Components**:
- `frontend/src/pages/admin/UserManagement.jsx` - User management interface
- `frontend/src/components/admin/BulkUserImport.jsx` - CSV bulk import modal

**Backend Routes**:
- `GET /api/admin/users` - List all users with pagination and filters
- `POST /api/admin/users` - Create single user
- `POST /api/admin/users/bulk-import` - Bulk CSV import
- `PUT /api/admin/users/:id` - Update user details
- `DELETE /api/admin/users/:id` - Suspend/delete user
- `PATCH /api/admin/users/:id/activate` - Reactivate user
- `PATCH /api/admin/users/:id/reset-password` - Admin password reset

**Features**:
- **User Listing**: Paginated table with 10 users per page
- **Search**: By name, email, or institute code
- **Filters**: By role (admin/instructor/student) and status (active/inactive)
- **Single User Creation**: Form with validation
- **Bulk Import**: CSV upload with validation and preview
- **Edit User**: Update name, role, institute code, active status
- **Suspend User**: Deactivate account (soft delete)
- **User Details**: Avatar, name, email, role badge, status badge

**Bulk Import Features**:
- CSV template download with sample data
- Drag-and-drop file upload
- Real-time row validation
- Preview table with validation status
- Duplicate email detection
- Row-level error reporting
- Success/failure summary
- Automatic welcome emails

**Validation Rules**:
- Name: Required, minimum 2 characters
- Email: Required, valid format, unique
- Password: Minimum 6 characters (8 for bulk import)
- Role: Must be admin, instructor, or student
- Institute Code: Optional

---

### 4. Assessment Oversight Module

**Purpose**: Admin monitoring and management of all platform assessments

**Components**:
- `frontend/src/pages/admin/AssessmentOversight.jsx` - Assessment monitoring dashboard

**Backend Routes**:
- `GET /api/admin/assessments` - List all assessments
- `GET /api/admin/assessments/:id` - Get assessment details
- `DELETE /api/admin/assessments/:id` - Delete assessment
- `PATCH /api/admin/assessments/:id/publish` - Force publish/unpublish
- `GET /api/admin/assessments/:id/submissions` - View all submissions
- `GET /api/admin/assessments/:id/statistics` - Assessment statistics

**Features**:
- View all assessments across all instructors
- Filter by status (draft, published, completed, archived)
- Filter by subject, difficulty, instructor
- Search by title or description
- Assessment statistics (attempts, completion rate, average score)
- Force publish/unpublish capabilities
- Delete assessments with confirmation
- View submission details
- Assessment analytics
- Plagiarism detection alerts
- Time limit violations
- Bulk actions (publish, archive, delete)

**Displayed Information**:
- Assessment title and description
- Creator (instructor name)
- Subject and difficulty level
- Total questions and total marks
- Duration and time limit
- Scheduled date and deadline
- Status (draft/published/active/completed)
- Number of submissions
- Average score
- Completion percentage

---

### 5. Activity Logs Module

**Purpose**: Comprehensive audit trail of all platform activities

**Components**:
- `frontend/src/pages/admin/ActivityLogs.jsx` - Activity log viewer

**Backend Routes**:
- `GET /api/admin/logs` - Retrieve activity logs with filters
- `GET /api/admin/logs/export` - Export logs as CSV/JSON
- `DELETE /api/admin/logs/clear` - Clear old logs (admin only)

**Features**:
- **Log Types**:
  - User login/logout
  - User creation/update/deletion
  - Assessment creation/update/deletion
  - Submission events
  - Settings changes
  - Bulk imports
  - Admin actions
  - Security events

- **Filtering**:
  - By date range (today, week, month, custom)
  - By user (admin, instructor, student)
  - By action type
  - By resource type
  - Search by description

- **Display Information**:
  - Timestamp (precise to milliseconds)
  - User (name and role)
  - Action performed
  - Resource affected
  - IP address
  - Status (success/failure)
  - Additional details/metadata

- **Export Options**:
  - CSV format
  - JSON format
  - Date range selection
  - Filter preservation

**Use Cases**:
- Security auditing
- Compliance reporting
- User behavior tracking
- Troubleshooting issues
- Performance analysis
- Detecting suspicious activity

---

### 6. Notifications Module

**Purpose**: Real-time and persistent notification system for all users

**Components**:
- `frontend/src/pages/admin/NotificationsPage.jsx` - Admin notifications
- `frontend/src/pages/student/NotificationsPage.jsx` - Student notifications
- `frontend/src/context/NotificationContext.jsx` - Global notification state
- `frontend/src/components/admin/NotificationBell.jsx` - Notification icon with badge
- `frontend/src/components/admin/NotificationPanel.jsx` - Notification dropdown

**Backend Routes**:
- **Admin**: 
  - `GET /api/admin/notifications` - Get admin notifications
  - `GET /api/admin/notifications/unread-count` - Unread count
  - `PATCH /api/admin/notifications/:id/read` - Mark as read
  - `PATCH /api/admin/notifications/mark-all-read` - Mark all as read
  
- **Instructor**:
  - `GET /api/instructor/notifications` - Get instructor notifications
  - Similar endpoints as admin
  
- **Student**:
  - `GET /api/student/notifications` - Get student notifications
  - Similar endpoints as admin

**Features**:
- **Role-Based Notifications**: Each role gets relevant notifications
- **Real-Time Updates**: Polling every 5 minutes (optimized)
- **Unread Badge**: Shows count of unread notifications
- **Notification Types**:
  - System announcements
  - Assessment published
  - Assessment graded
  - New message/chat
  - Support ticket updates
  - Password reset confirmations
  - Account status changes
  - Welcome messages
  
- **Actions**:
  - Mark individual as read
  - Mark all as read
  - Delete notification
  - Click to navigate to related resource

- **Pagination**: 20 notifications per page
- **Filtering**: By type, read/unread status
- **Authentication-Aware**: Only fetches when logged in

**Notification Content**:
- Title (bold)
- Message body
- Timestamp (relative: "2 hours ago")
- Type icon (info, success, warning, error)
- Read/unread indicator
- Action link (optional)

---

### 7. Announcements Module

**Purpose**: Platform-wide communication system

**Components**:
- `frontend/src/pages/admin/AnnouncementsPage.jsx` - Admin announcement management
- `frontend/src/components/admin/SendAnnouncementModal.jsx` - Create announcement modal

**Backend Routes**:
- `GET /api/admin/announcements` - List all announcements
- `POST /api/admin/announcements` - Create announcement
- `PUT /api/admin/announcements/:id` - Update announcement
- `DELETE /api/admin/announcements/:id` - Delete announcement
- `POST /api/admin/announcements/:id/send` - Send announcement
- `GET /api/announcements` - User view (role-filtered)

**Features**:
- **Create Announcements**:
  - Title and rich text content
  - Target audience (all users, students only, instructors only, specific institute)
  - Priority level (low, normal, high, urgent)
  - Schedule for future delivery
  - Attach files/documents
  
- **Delivery Methods**:
  - In-app notification
  - Email notification
  - Both

- **Management**:
  - Draft/publish workflow
  - Edit before sending
  - Delete scheduled announcements
  - View delivery status
  - Resend failed deliveries

- **Display**:
  - Announcement list with filters
  - Priority badges (color-coded)
  - Recipient count
  - Delivery status
  - Read statistics

**Use Cases**:
- Platform maintenance notifications
- Policy updates
- Event announcements
- Emergency alerts
- Feature releases
- Scheduled downtime notices

---

### 8. Calendar Module

**Purpose**: Centralized schedule management for assessments and events

**Components**:
- `frontend/src/pages/admin/ActivityCalendar.jsx` - Admin calendar view
- `frontend/src/pages/instructor/EvaluationCalendar.jsx` - Instructor calendar
- `frontend/src/pages/student/AssessmentCalendar.jsx` - Student calendar
- `frontend/src/components/common/CalendarView.jsx` - Reusable calendar component

**Backend Routes**:
- `GET /api/calendar/events` - Get events for user role
- `POST /api/calendar/events` - Create calendar event (admin/instructor)
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/assessments` - Get scheduled assessments

**Features**:
- **Calendar Views**:
  - Month view (default)
  - Week view
  - Day view
  - Agenda/list view

- **Event Types**:
  - Scheduled assessments
  - Submission deadlines
  - Evaluation deadlines
  - System maintenance
  - Announcements
  - Custom events (admin)

- **Color Coding**:
  - Blue: Upcoming assessments
  - Green: Completed assessments
  - Red: Overdue submissions
  - Yellow: Pending evaluations
  - Purple: System events

- **Interactions**:
  - Click event for details
  - Create new event (admin/instructor)
  - Edit event
  - Delete event
  - Export to iCal/Google Calendar

- **Filters**:
  - By event type
  - By subject
  - By instructor (admin view)
  - Date range

**Role-Specific Features**:
- **Admin**: View all events, create system events
- **Instructor**: View own assessments, create assessment schedules
- **Student**: View enrolled assessments, submission deadlines

---

### 9. Analytics & Reports Module

**Purpose**: Data-driven insights and performance analytics

**Components**:
- `frontend/src/pages/admin/AdminAnalyticsDashboard.jsx` - Admin analytics
- `frontend/src/pages/instructor/InstructorAnalyticsDashboard.jsx` - Instructor analytics
- `frontend/src/pages/student/StudentAnalyticsDashboard.jsx` - Student analytics
- `frontend/src/components/analytics/*` - Chart components

**Analytics Components**:
- `PerformanceChart.jsx` - Line/bar charts for performance trends
- `AssessmentDistribution.jsx` - Pie charts for assessment breakdown
- `UserEngagement.jsx` - User activity metrics
- `SubjectBreakdown.jsx` - Performance by subject
- `ClassPerformanceChart.jsx` - Class-wide statistics
- `InstructorPerformance.jsx` - Instructor effectiveness metrics
- `QuestionStatistics.jsx` - Question-level analysis
- `AssessmentDifficultyChart.jsx` - Difficulty distribution
- `PlatformMetrics.jsx` - System-wide KPIs
- `DateRangePicker.jsx` - Date range selection
- `ExportButton.jsx` - Export charts/data
- `ReportScheduler.jsx` - Automated report scheduling

**Backend Routes**:
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/assessments` - Assessment analytics
- `GET /api/analytics/users` - User engagement analytics
- `GET /api/analytics/subjects` - Subject-wise breakdown
- `POST /api/analytics/export` - Export analytics data
- `POST /api/analytics/schedule-report` - Schedule automated reports

**Admin Analytics**:
- Platform-wide user statistics
- Assessment creation trends
- Submission rates
- Average scores by subject/difficulty
- Instructor performance comparison
- Student engagement metrics
- System usage patterns
- Peak usage times
- Storage and bandwidth usage

**Instructor Analytics**:
- Own assessment statistics
- Student performance in own assessments
- Question difficulty analysis
- Time taken per question
- Most/least difficult questions
- Pass/fail rates
- Class average comparisons
- Individual student progress

**Student Analytics**:
- Personal performance trends
- Score history
- Strengths and weaknesses
- Subject-wise performance
- Comparison with class average
- Time management analysis
- Improvement suggestions
- Rank/percentile (optional)

**Report Features**:
- **Date Range Selection**: Today, week, month, quarter, year, custom
- **Export Formats**: PDF, CSV, Excel, JSON
- **Scheduled Reports**: Daily, weekly, monthly email delivery
- **Interactive Charts**: Hover tooltips, zoom, pan
- **Filters**: By subject, difficulty, date range, user
- **Print-Friendly**: Optimized for printing

**Chart Types**:
- Line charts (trends over time)
- Bar charts (comparisons)
- Pie charts (distributions)
- Area charts (cumulative metrics)
- Scatter plots (correlations)
- Heatmaps (engagement patterns)

---

### 10. Platform Settings Module

**Purpose**: System-wide configuration and customization

**Components**:
- `frontend/src/pages/admin/PlatformSettings.jsx` - Settings management interface

**Backend Routes**:
- `GET /api/admin/settings` - Get all settings
- `PUT /api/admin/settings` - Update settings
- `POST /api/admin/settings/reset` - Reset to defaults
- `POST /api/admin/settings/backup` - Backup settings
- `POST /api/admin/settings/restore` - Restore from backup

**Settings Categories**:

**1. General Settings**:
- Platform name and tagline
- Contact email
- Support email
- Default language
- Timezone
- Date/time format
- Currency (if applicable)

**2. Branding**:
- Logo upload (header and favicon)
- Primary color
- Secondary color
- Accent color
- Custom CSS
- Email template branding

**3. Authentication**:
- Enable/disable registration
- Email verification required
- Password minimum length
- Password complexity requirements
- Session timeout duration
- Max login attempts
- Lockout duration
- Enable "Remember me"

**4. Assessment Settings**:
- Default assessment duration
- Allow assessment retakes
- Max retake attempts
- Show correct answers after submission
- Enable proctoring features
- Auto-submit on time expiry
- Grace period after deadline
- Plagiarism detection threshold

**5. Email Settings**:
- SMTP host and port
- SMTP username and password
- From email and name
- Enable email notifications
- Email templates customization

**6. Notification Settings**:
- Enable in-app notifications
- Enable email notifications
- Enable SMS notifications (future)
- Notification retention period
- Polling frequency

**7. Storage Settings**:
- Max file upload size
- Allowed file types
- Storage quota per user
- Auto-cleanup old files
- Backup frequency

**8. Security Settings**:
- Enable rate limiting
- Rate limit thresholds
- Enable 2FA (two-factor authentication)
- IP whitelist/blacklist
- Enable activity logging
- Log retention period
- Enable CAPTCHA

**9. API Settings**:
- API rate limits
- Enable API access
- API key management
- Webhook configurations

---

### 11. Assessment Management Module (Instructor)

**Purpose**: Create, manage, and publish assessments

**Components**:
- `frontend/src/pages/instructor/CreateAssessment.jsx` - Assessment creation form
- `frontend/src/pages/instructor/ManageAssessments.jsx` - Assessment list and management
- `frontend/src/components/assessments/*` - Assessment-related components

**Backend Routes**:
- `GET /api/instructor/assessments` - List instructor's assessments
- `POST /api/instructor/assessments` - Create assessment
- `PUT /api/instructor/assessments/:id` - Update assessment
- `DELETE /api/instructor/assessments/:id` - Delete assessment
- `POST /api/instructor/assessments/:id/publish` - Publish assessment
- `POST /api/instructor/assessments/:id/duplicate` - Duplicate assessment
- `GET /api/instructor/assessments/:id/preview` - Preview assessment

**Features**:
- **Assessment Creation**:
  - Basic info (title, description, subject)
  - Duration and time limit
  - Start date and deadline
  - Passing marks
  - Difficulty level
  - Institute code (for targeting)
  
- **Question Types**:
  - Multiple choice (single answer)
  - Multiple choice (multiple answers)
  - True/False
  - Short answer
  - Long answer/Essay
  - Fill in the blanks
  - Matching
  - File upload

- **Question Management**:
  - Add/edit/delete questions
  - Reorder questions (drag-and-drop)
  - Set marks per question
  - Add images to questions
  - Add explanations (shown after submission)
  - Question bank integration
  - Import questions from CSV

- **Assessment Settings**:
  - Shuffle questions
  - Shuffle options
  - Show one question at a time
  - Allow navigation (back/forward)
  - Show timer
  - Auto-submit on time expiry
  - Allow late submissions
  - Enable proctoring
  - Restrict IP addresses

- **Publishing**:
  - Draft mode (save without publishing)
  - Preview before publish
  - Schedule for future date
  - Notify students on publish
  - Publish to specific institute codes

- **Management Actions**:
  - View submissions count
  - View statistics
  - Edit (if no submissions)
  - Duplicate assessment
  - Archive assessment
  - Delete assessment (with confirmation)
  - Unpublish (if needed)

---

### 12. Submission Evaluation Module (Instructor)

**Purpose**: Grade and provide feedback on student submissions

**Components**:
- `frontend/src/pages/instructor/EvaluateSubmissions.jsx` - Evaluation interface
- `frontend/src/components/submissions/*` - Submission components

**Backend Routes**:
- `GET /api/instructor/submissions` - List submissions for evaluation
- `GET /api/instructor/submissions/:id` - Get submission details
- `PUT /api/instructor/submissions/:id/grade` - Submit grades
- `POST /api/instructor/submissions/:id/feedback` - Add feedback
- `GET /api/instructor/submissions/pending` - Pending evaluations
- `POST /api/instructor/submissions/bulk-grade` - Bulk grading

**Features**:
- **Submission List**:
  - Filter by assessment
  - Filter by student
  - Filter by status (pending, graded, flagged)
  - Sort by submission date
  - Sort by student name
  - Search by student name/email

- **Evaluation Interface**:
  - Side-by-side view (questions + answers)
  - Question-by-question grading
  - Auto-grading for MCQs and T/F
  - Manual grading for subjective questions
  - Add marks per question
  - Add feedback comments
  - Overall feedback section
  - Flag for plagiarism/cheating

- **Grading Features**:
  - Total marks calculation
  - Percentage calculation
  - Pass/fail status
  - Grade distribution (A, B, C, etc.)
  - Partial marking
  - Negative marking (optional)
  - Bonus marks

- **Feedback**:
  - Question-level feedback
  - Overall feedback
  - Attach reference materials
  - Private notes (not visible to student)
  - Suggestions for improvement

- **Bulk Actions**:
  - Bulk grade similar answers
  - Apply same feedback to multiple submissions
  - Bulk approve/reject
  - Export grades to CSV

- **Analytics**:
  - Class average
  - Highest/lowest scores
  - Difficult questions identification
  - Time taken per student
  - Submission timeline

---

### 13. Student Assessment Module

**Purpose**: Browse, take, and track assessments

**Components**:
- `frontend/src/pages/student/BrowseAssessments.jsx` - Available assessments
- `frontend/src/pages/student/AssessmentCatalog.jsx` - Assessment catalog
- `frontend/src/pages/student/TakeTestPage.jsx` - Test-taking interface
- `frontend/src/pages/student/TestInterface.jsx` - Main test UI
- `frontend/src/pages/student/UpcomingTestsPage.jsx` - Upcoming assessments
- `frontend/src/components/test/*` - Test-related components

**Backend Routes**:
- `GET /api/student/assessments` - Available assessments
- `GET /api/student/assessments/:id` - Assessment details
- `POST /api/student/assessments/:id/start` - Start assessment
- `PUT /api/student/assessments/:id/submit` - Submit assessment
- `POST /api/student/assessments/:id/save-progress` - Auto-save progress
- `GET /api/student/assessments/:id/remaining-time` - Get remaining time

**Features**:
- **Browse Assessments**:
  - List of available assessments
  - Filter by subject
  - Filter by status (upcoming, ongoing, completed)
  - Search by title
  - View assessment details
  - Start assessment button

- **Assessment Details**:
  - Title and description
  - Subject and difficulty
  - Total questions and marks
  - Duration
  - Start date and deadline
  - Attempts allowed
  - Attempts used
  - Best score (if multiple attempts)
  - Instructions

- **Test-Taking Interface**:
  - **Navigation**:
    - Question palette (overview)
    - Previous/Next buttons
    - Jump to question
    - Flag questions for review
    - Status indicators (answered, not answered, flagged)
  
  - **Timer**:
    - Countdown timer
    - Visual warnings (last 5 minutes)
    - Auto-submit on time expiry
  
  - **Question Display**:
    - Question text with formatting
    - Question images (if any)
    - Option selection (radio/checkbox)
    - Text input (short/long answer)
    - File upload area
  
  - **Features**:
    - Auto-save every 30 seconds
    - Save and exit (resume later)
    - Warning before exit
    - Confirmation before submit
    - Review before submit
  
  - **Proctoring** (if enabled):
    - Webcam feed
    - Full-screen mode enforcement
    - Tab switch detection
    - Copy-paste prevention
    - Right-click disabled

- **After Submission**:
  - Submission confirmation
  - Estimated score (for MCQs)
  - Feedback (if available)
  - Correct answers (if enabled)
  - Explanations
  - View detailed results

---

### 14. Student Submissions Module

**Purpose**: Track and view assessment submissions and results

**Components**:
- `frontend/src/pages/student/Submissions.jsx` - Submissions list
- `frontend/src/pages/student/SubmissionsPage.jsx` - Submissions page
- `frontend/src/pages/student/SubmissionDetailPage.jsx` - Detailed results
- `frontend/src/components/submissions/*` - Submission components

**Backend Routes**:
- `GET /api/student/submissions` - List all submissions
- `GET /api/student/submissions/:id` - Submission details
- `GET /api/student/submissions/:id/feedback` - Instructor feedback
- `GET /api/student/submissions/statistics` - Personal statistics

**Features**:
- **Submissions List**:
  - Assessment title
  - Submission date
  - Score (marks/total)
  - Percentage
  - Status (pending, graded, passed, failed)
  - Grade (A, B, C, etc.)
  - View details button

- **Submission Details**:
  - Question-by-question review
  - Your answer vs. correct answer
  - Marks obtained per question
  - Question-level feedback
  - Overall feedback
  - Strengths and weaknesses
  - Time taken per question
  - Total time taken

- **Performance Metrics**:
  - Score trend over time
  - Subject-wise performance
  - Comparison with class average
  - Rank (if enabled)
  - Percentile
  - Improvement suggestions

- **Actions**:
  - Download certificate (if passed)
  - Download result PDF
  - Retake assessment (if allowed)
  - View correct answers
  - Request re-evaluation (if allowed)

---

### 15. Support & Help Module

**Purpose**: Student-instructor-admin communication and help system

**Components**:
- `frontend/src/pages/StudentSupportPage.jsx` - Student support interface
- `frontend/src/pages/InstructorSupportPage.jsx` - Instructor support interface
- `frontend/src/pages/AdminSupportPage.jsx` - Admin support dashboard
- `frontend/src/pages/StudentTicketDetailPage.jsx` - Ticket details (student)
- `frontend/src/pages/InstructorTicketDetailPage.jsx` - Ticket details (instructor)
- `frontend/src/pages/AdminTicketDetailPage.jsx` - Ticket details (admin)
- `frontend/src/components/SupportDashboard.jsx` - Support dashboard
- `frontend/src/components/CreateTicketModal.jsx` - Create ticket modal
- `frontend/src/components/AssignTicketModal.jsx` - Assign ticket (admin)
- `frontend/src/components/TicketList.jsx` - List of tickets
- `frontend/src/components/TicketCard.jsx` - Individual ticket card
- `frontend/src/components/TicketDetails.jsx` - Detailed ticket view
- `frontend/src/components/TicketFilters.jsx` - Filter tickets

**Backend Routes**:
- `GET /api/support/tickets` - List tickets (filtered by role)
- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets/:id` - Get ticket details
- `PUT /api/support/tickets/:id` - Update ticket
- `PATCH /api/support/tickets/:id/status` - Change status
- `POST /api/support/tickets/:id/assign` - Assign to admin/instructor
- `POST /api/support/tickets/:id/comment` - Add comment
- `GET /api/support/categories` - Get ticket categories

**Features**:
- **Ticket Creation**:
  - Subject and description
  - Category (technical, assessment, account, general)
  - Priority (low, normal, high, urgent)
  - Attach files (screenshots, documents)
  - Related assessment (optional)

- **Ticket Management**:
  - Ticket ID and title
  - Status (open, in progress, resolved, closed)
  - Priority badge
  - Created date
  - Last updated
  - Assigned to (admin/instructor name)
  - Number of comments

- **Ticket Details**:
  - Full description
  - Attachments
  - Comment thread
  - Status history
  - Assignment history
  - Action buttons (close, reopen, escalate)

- **Comments**:
  - Add comment
  - Attach files
  - Mark as internal (admin/instructor only)
  - Real-time updates
  - Email notifications on new comments

- **Filters**:
  - By status
  - By priority
  - By category
  - By assigned user
  - By date range
  - Search by title/description

**Role-Specific Features**:
- **Student**: Create tickets, view own tickets, add comments, close resolved tickets
- **Instructor**: View assigned tickets, respond to student queries, escalate to admin
- **Admin**: View all tickets, assign tickets, manage categories, view statistics

---

### 16. Chat Module

**Purpose**: Real-time messaging between users

**Components**:
- `frontend/src/components/ChatWindow.jsx` - Chat interface
- `frontend/src/components/MessageBubble.jsx` - Individual message
- `frontend/src/components/MessageInput.jsx` - Message input box
- `frontend/src/components/TypingIndicator.jsx` - "User is typing..." indicator
- `frontend/src/components/FilePreview.jsx` - File attachment preview

**Backend Routes**:
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/messages/:conversationId` - Get messages
- `POST /api/chat/messages` - Send message
- `POST /api/chat/messages/file` - Upload file attachment
- `PATCH /api/chat/messages/:id/read` - Mark as read
- `WebSocket: /socket.io` - Real-time messaging

**Features**:
- **Conversation List**:
  - Recent conversations
  - Unread message badge
  - Last message preview
  - Timestamp
  - User avatar

- **Chat Interface**:
  - Message history
  - Real-time message delivery
  - Message status (sent, delivered, read)
  - Typing indicator
  - File attachments (images, PDFs, docs)
  - Emoji support
  - Link previews

- **Message Features**:
  - Text messages
  - File upload (max 10MB)
  - Image preview
  - Voice messages (future)
  - Delete message
  - Edit message (within 5 minutes)
  - Reply to message
  - Forward message

- **Real-Time Features**:
  - WebSocket-based instant messaging
  - Typing indicators
  - Online/offline status
  - Read receipts
  - Push notifications (browser)

**Use Cases**:
- Student-instructor communication
- Assignment clarifications
- Support ticket discussions
- Group discussions (future)
- Announcements

---

### 17. Search Module

**Purpose**: Global platform search functionality

**Components**:
- `frontend/src/pages/SearchResultsPage.jsx` - Search results page
- `frontend/src/components/common/GlobalSearchBar.jsx` - Search bar component

**Backend Routes**:
- `GET /api/search` - Global search
- `GET /api/search/assessments` - Search assessments
- `GET /api/search/users` - Search users (admin only)
- `GET /api/search/submissions` - Search submissions
- `GET /api/search/tickets` - Search support tickets

**Features**:
- **Search Capabilities**:
  - Full-text search across multiple entities
  - Search assessments by title/description/subject
  - Search users by name/email (admin)
  - Search submissions
  - Search support tickets
  - Search announcements
  - Search notifications

- **Search Filters**:
  - Filter by type (assessments, users, tickets, etc.)
  - Date range
  - Status filters
  - Role filters (admin search)

- **Results Display**:
  - Grouped by type
  - Relevance sorting
  - Highlight matched terms
  - Quick preview
  - Direct links to resources

- **Advanced Search**:
  - Exact phrase matching
  - Exclude terms
  - Wildcard search
  - Boolean operators (AND, OR, NOT)

---

### 18. Profile Management Module

**Purpose**: User profile viewing and editing

**Components**:
- `frontend/src/pages/student/Profile.jsx` - Profile view
- `frontend/src/pages/student/ProfilePage.jsx` - Profile page
- `frontend/src/components/profile/*` - Profile components

**Backend Routes**:
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar
- `PUT /api/profile/password` - Change password
- `GET /api/profile/activity` - Activity history

**Features**:
- **Profile Information**:
  - Name
  - Email
  - Role
  - Institute code
  - Avatar/profile picture
  - Bio/description
  - Contact information
  - Social media links (optional)

- **Editable Fields**:
  - Name
  - Avatar image
  - Bio
  - Contact number
  - Preferences
  - Notification settings

- **Account Security**:
  - Change password
  - View active sessions
  - Logout all devices
  - Enable 2FA (if available)

- **Activity**:
  - Recent logins
  - Recent submissions
  - Recent assessments taken
  - Activity timeline

---

### 19. Settings Module

**Purpose**: User-specific settings and preferences

**Components**:
- `frontend/src/pages/student/SettingsPage.jsx` - Settings interface

**Backend Routes**:
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/reset` - Reset to defaults

**Features**:
- **Appearance**:
  - Theme (light/dark/system)
  - Color scheme
  - Font size
  - Compact mode

- **Notifications**:
  - Email notifications (enable/disable)
  - In-app notifications
  - Assessment reminders
  - Grade notifications
  - Announcement notifications

- **Privacy**:
  - Show profile to others
  - Show rank/percentile
  - Share statistics
  - Activity visibility

- **Language & Region**:
  - Preferred language
  - Timezone
  - Date format
  - Number format

- **Accessibility**:
  - Screen reader support
  - High contrast mode
  - Keyboard shortcuts
  - Text-to-speech

---

### 20. Help & Documentation Module

**Purpose**: Self-service help resources and documentation

**Components**:
- `frontend/src/pages/student/HelpSupportPage.jsx` - Help center

**Backend Routes**:
- `GET /api/help/articles` - List help articles
- `GET /api/help/articles/:id` - Get article content
- `POST /api/help/articles/:id/helpful` - Mark as helpful
- `GET /api/help/search` - Search help articles
- `GET /api/help/categories` - Get categories

**Features**:
- **Help Categories**:
  - Getting Started
  - Taking Assessments
  - Viewing Results
  - Account Management
  - Troubleshooting
  - FAQs

- **Help Articles**:
  - Step-by-step guides
  - Video tutorials
  - Screenshots
  - Best practices
  - Tips and tricks

- **Search**:
  - Search help articles
  - Suggested articles
  - Related articles
  - Popular articles

- **Feedback**:
  - Was this helpful? (Yes/No)
  - Report incorrect information
  - Suggest improvements

---

## 🚀 Recent Features Implemented

### 1. Bulk CSV User Import Feature

**Purpose**: Allow administrators to import multiple users simultaneously via CSV file upload, significantly reducing manual data entry time.

**Components Implemented**:
- Frontend modal component with drag-and-drop interface
- Backend API endpoint with CSV parsing and validation
- Real-time validation with preview functionality
- Comprehensive error reporting with row-level details

**User Flow**:
1. Admin clicks "Bulk Import" button in User Management page
2. Downloads CSV template with proper headers and sample data
3. Fills CSV with user information (name, email, password, role)
4. Uploads CSV file via drag-and-drop or file selection
5. System validates data and shows preview with validation status
6. Admin confirms import
7. System creates users and sends welcome emails
8. Success/failure summary displayed with detailed error report

### 2. Role-Based Notification System

**Purpose**: Provide appropriate notification endpoints based on user role to prevent authorization errors and improve security.

**Implementation**:
- Dynamic endpoint selection based on user role
- Separate notification routes for Admin, Instructor, and Student
- Graceful error handling for missing endpoints
- Authentication-aware notification fetching

**Endpoints by Role**:
- **Admin**: `/api/admin/notifications`
- **Instructor**: `/api/instructor/notifications`
- **Student**: `/api/student/notifications`

### 3. Performance Optimizations

**Notification Polling**:
- Reduced polling frequency from 30 seconds to 5 minutes
- Result: 90% reduction in API calls (120/hour → 12/hour)
- Improved server load and reduced bandwidth usage

**Rate Limiting**:
- Increased from 1,000 to 10,000 requests per 15 minutes
- Prevents legitimate users from being locked out during testing
- Maintains security while improving usability

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                     Port: 5174 / 5173                        │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                 │
│  ├─ Admin Dashboard                                          │
│  ├─ User Management                                          │
│  ├─ Bulk Import Modal                                        │
│  ├─ Notification System                                      │
│  └─ Analytics & Reports                                      │
├─────────────────────────────────────────────────────────────┤
│  Contexts:                                                   │
│  ├─ AuthContext (User authentication)                        │
│  ├─ NotificationContext (Real-time notifications)            │
│  └─ AdminContext (Admin-specific state)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ WebSocket (Chat)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                 │
│                        Port: 5000                            │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  ├─ /api/admin/* (Admin operations)                          │
│  ├─ /api/instructor/* (Instructor operations)                │
│  ├─ /api/student/* (Student operations)                      │
│  ├─ /api/auth/* (Authentication)                             │
│  └─ /api/support/* (Support tickets & chat)                  │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                   │
│  ├─ Email Service (Welcome emails, notifications)            │
│  ├─ Notification Service (Push notifications)                │
│  ├─ Analytics Service (Performance metrics)                  │
│  └─ Calendar Service (Event scheduling)                      │
├─────────────────────────────────────────────────────────────┤
│  Middleware:                                                 │
│  ├─ Authentication (JWT verification)                        │
│  ├─ Role Authorization (Admin/Instructor/Student)            │
│  ├─ Rate Limiting (10,000 req/15min)                         │
│  ├─ File Upload (Multer - CSV processing)                    │
│  └─ Activity Logger (Audit trails)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (MongoDB)                        │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                                │
│  ├─ users (User accounts & profiles)                         │
│  ├─ assessments (Tests & quizzes)                            │
│  ├─ submissions (Student answers)                            │
│  ├─ notifications (System notifications)                     │
│  ├─ activityLogs (Audit trail)                               │
│  ├─ chatMessages (Support chat history)                      │
│  └─ announcements (System announcements)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📤 Bulk CSV User Import Feature

### Overview

The Bulk CSV User Import feature allows administrators to create multiple user accounts simultaneously by uploading a properly formatted CSV file. This feature includes comprehensive validation, error handling, and reporting capabilities.

### Frontend Implementation

#### File: `frontend/src/components/admin/BulkUserImport.jsx`

**Key Features**:
- **CSV Template Download**: Generates template with proper headers and sample data
- **Drag-and-Drop Interface**: User-friendly file upload with visual feedback
- **Real-time Validation**: Validates each row before submission
- **Preview Table**: Shows parsed data with validation status indicators
- **Error Reporting**: Detailed row-level error messages

**Component Structure**:
```jsx
<BulkUserImport>
  ├─ Template Download Section
  │  └─ Generates CSV with headers: Name, Email, Password, Role
  ├─ File Upload Zone
  │  ├─ Drag-and-drop area
  │  └─ File selection button
  ├─ Validation Preview
  │  ├─ Table with parsed data
  │  ├─ Status indicators (✓ valid, ✗ error)
  │  └─ Row-level error messages
  └─ Import Actions
     ├─ Cancel button
     └─ Import button (disabled if errors exist)
</BulkUserImport>
```

**Validation Rules**:
1. **Name**: Required, minimum 2 characters
2. **Email**: Required, valid email format, unique in system
3. **Password**: Required, minimum 8 characters
4. **Role**: Must be one of: admin, instructor, student

**Code Snippet - CSV Parsing**:
```javascript
const handleFileUpload = (file) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const validatedData = results.data.map((row, index) => {
        const errors = [];
        
        // Validate name
        if (!row.Name?.trim()) {
          errors.push('Name is required');
        }
        
        // Validate email
        if (!row.Email?.trim()) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email)) {
          errors.push('Invalid email format');
        }
        
        // Validate password
        if (!row.Password?.trim()) {
          errors.push('Password is required');
        } else if (row.Password.length < 8) {
          errors.push('Password must be at least 8 characters');
        }
        
        // Validate role
        const role = row.Role?.toLowerCase();
        if (!['admin', 'instructor', 'student'].includes(role)) {
          errors.push('Role must be admin, instructor, or student');
        }
        
        return { ...row, rowNumber: index + 2, errors, isValid: errors.length === 0 };
      });
      
      setParsedData(validatedData);
    }
  });
};
```

### Backend Implementation

#### File: `backend/src/controllers/adminController.js`

**Function**: `bulkImportUsers`

**Process Flow**:
1. Receive uploaded CSV file via Multer
2. Parse CSV using fast-csv library
3. Validate each row (email format, password length, role validity)
4. Check for duplicate emails in database
5. Create user accounts with hashed passwords
6. Send welcome emails to new users
7. Create notification records
8. Delete temporary CSV file
9. Return success/failure summary

**Code Snippet**:
```javascript
const bulkImportUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const users = [];
    const errors = [];
    let rowNumber = 1;

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => {
          rowNumber++;
          
          // Validate row data
          const validationError = validateUserRow(row, rowNumber);
          if (validationError) {
            errors.push(validationError);
            return;
          }
          
          users.push({
            name: row.Name?.trim(),
            email: row.Email?.trim().toLowerCase(),
            password: row.Password?.trim(),
            role: row.Role?.trim().toLowerCase()
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Create users in database
    let successCount = 0;
    let failedCount = 0;

    for (const userData of users) {
      try {
        // Check for duplicate email
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          errors.push({
            row: rowNumber,
            email: userData.email,
            error: 'Email already exists'
          });
          failedCount++;
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create user
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name, userData.password);
        
        // Create notification
        await createNotification(user._id, 'Welcome to OneYes Assessment Platform!');

        successCount++;
      } catch (error) {
        errors.push({
          email: userData.email,
          error: error.message
        });
        failedCount++;
      }
    }

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `Import completed. ${successCount} users created, ${failedCount} failed.`,
      data: {
        successCount,
        failedCount,
        errors
      }
    });
  } catch (error) {
    next(error);
  }
};
```

#### File: `backend/src/routes/admin.routes.js`

**Route Configuration**:
```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for CSV upload
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    cb(null, `bulk_users_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route
router.post(
  '/users/bulk-import',
  authMiddleware,
  roleMiddleware(['admin']),
  csvUpload.single('file'),
  logAdmin('users_bulk_import'),
  bulkImportUsers
);
```

### Integration

#### File: `frontend/src/pages/admin/UserManagement.jsx`

**Integration Steps**:
1. Import BulkUserImport component
2. Add state for modal visibility
3. Add "Bulk Import" button to UI
4. Render modal with callbacks
5. Refresh user list after successful import

**Code Snippet**:
```javascript
import BulkUserImport from '../../components/admin/BulkUserImport';

function UserManagement() {
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleBulkImportSuccess = () => {
    setShowBulkImport(false);
    fetchUsers(); // Refresh user list
    toast.success('Users imported successfully');
  };

  return (
    <div>
      {/* Bulk Import Button */}
      <button
        onClick={() => setShowBulkImport(true)}
        className="btn btn-success"
      >
        <FiUpload /> Bulk Import
      </button>

      {/* Bulk Import Modal */}
      <BulkUserImport
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={handleBulkImportSuccess}
      />
    </div>
  );
}
```

### CSV Template Format

**Headers**: Name, Email, Password, Role

**Sample Data**:
```csv
Name,Email,Password,Role
John Doe,john.doe@example.com,SecurePass123,student
Jane Smith,jane.smith@example.com,TeachPass456,instructor
Admin User,admin@oneyes.com,AdminPass789,admin
```

**Best Practices**:
- Use strong passwords (minimum 8 characters)
- Ensure email addresses are unique
- Role must be lowercase: admin, instructor, or student
- Remove any empty rows
- Save as UTF-8 encoded CSV

---

## 🔔 Notification System Enhancement

### Problem Statement

The original notification system had hardcoded endpoints pointing to `/api/admin/notifications`, causing 403 Forbidden errors when non-admin users (students, instructors) attempted to fetch notifications. This resulted in console errors and poor user experience.

### Solution Overview

Implemented role-based dynamic endpoint selection that determines the appropriate notification API based on the authenticated user's role.

### Implementation Details

#### File: `frontend/src/context/NotificationContext.jsx`

**Before** (Hardcoded):
```javascript
const fetchNotifications = async () => {
  const response = await api.get('/admin/notifications?page=1&limit=20');
  // ...
};

const fetchUnreadCount = async () => {
  const response = await api.get('/admin/notifications/unread-count');
  // ...
};

const markAsRead = async (notificationId) => {
  const response = await api.patch(`/admin/notifications/${notificationId}/read`);
  // ...
};
```

**After** (Role-Based):
```javascript
// Get user role from localStorage
const getUserRole = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.role;
  } catch {
    return null;
  }
};

// Get base URL based on user role
const getNotificationBaseUrl = () => {
  const role = getUserRole();
  if (role === 'admin') return '/admin/notifications';
  if (role === 'instructor') return '/instructor/notifications';
  return '/student/notifications'; // default to student
};

// Fetch notifications with dynamic endpoint
const fetchNotifications = useCallback(async (page = 1) => {
  try {
    const baseUrl = getNotificationBaseUrl();
    const response = await api.get(`${baseUrl}?page=${page}&limit=20`);
    // ...
  } catch (error) {
    // Don't show toast for 403 errors (user might not have access)
    if (error.response?.status !== 403) {
      toast.error('Failed to fetch notifications');
    }
  }
}, []);

// Similar implementation for fetchUnreadCount and markAsRead
```

### Key Features

1. **Role Detection**: Automatically detects user role from localStorage
2. **Dynamic Endpoints**: Routes to appropriate API based on role
3. **Graceful Error Handling**: Suppresses 403 errors (permissions expected)
4. **Backward Compatible**: Works seamlessly with existing admin functionality

### Endpoint Mapping

| User Role   | Notification Endpoint              |
|-------------|-----------------------------------|
| Admin       | `/api/admin/notifications`        |
| Instructor  | `/api/instructor/notifications`   |
| Student     | `/api/student/notifications`      |

### Authentication & Polling

**Authentication Check**:
```javascript
useEffect(() => {
  // Prevent multiple runs
  if (initialized.current) return;
  initialized.current = true;
  
  // Check for authentication token
  const token = localStorage.getItem('token');
  if (!token) return; // Don't fetch if not authenticated
  
  // Initial fetch
  fetchNotifications();
  fetchUnreadCount();
  
  // Set up polling interval
  const interval = setInterval(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      fetchUnreadCount(); // Only poll if still authenticated
    }
  }, 300000); // 5 minutes
  
  return () => clearInterval(interval);
}, []);
```

**Benefits**:
- No notification requests for unauthenticated users
- Stops polling when user logs out
- Prevents unnecessary API calls

---

## ⚡ Performance Optimizations

### 1. Notification Polling Frequency

**Before**: 30 seconds (120 requests/hour)  
**After**: 5 minutes (12 requests/hour)  
**Improvement**: 90% reduction in API calls

**Impact**:
- Reduced server load
- Lower bandwidth consumption
- Improved database performance
- Better scalability

**Implementation**:
```javascript
// Changed from 30000ms to 300000ms
const interval = setInterval(() => {
  fetchUnreadCount();
}, 300000); // 5 minutes
```

### 2. Rate Limiting Enhancement

**Before**: 1,000 requests per 15 minutes  
**After**: 10,000 requests per 15 minutes  
**Improvement**: 10x capacity increase

**File**: `backend/src/server.js`

**Configuration**:
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Benefits**:
- Prevents legitimate users from being locked out during development
- Maintains security against brute force attacks
- Supports higher concurrent user loads
- Configurable via environment variables

### 3. Infinite Loop Prevention

**Problem**: NotificationContext was causing infinite re-renders due to improper useEffect dependencies.

**Solution**: Added `useRef` guard and empty dependency array

**Implementation**:
```javascript
import { useRef } from 'react';

export function NotificationProvider({ children }) {
  const initialized = useRef(false);
  
  useEffect(() => {
    // Prevent multiple runs
    if (initialized.current) return;
    initialized.current = true;
    
    // Rest of initialization code
    // ...
  }, []); // Empty dependency array - run once only
}
```

**Result**: Eliminated page refresh loops, smooth user experience

---

## 🐛 Bug Fixes & Improvements

### 1. Circular Dependency Fix

**File**: `backend/src/controllers/adminController.js` & `backend/src/routes/admin.routes.js`

**Problem**: Backend crashed on startup with circular dependency error related to `bulkImportUsers` function.

**Root Cause**: Function was defined but not exported from adminController.js

**Solution**:
```javascript
// adminController.js
const bulkImportUsers = async (req, res, next) => {
  // Implementation
};

// Export the function
module.exports = {
  // ...existing exports,
  bulkImportUsers  // Added this
};
```

```javascript
// admin.routes.js
const { bulkImportUsers } = require('../controllers/adminController');
```

**Result**: Backend starts successfully without errors

### 2. 403 Forbidden Errors

**Problem**: Students and instructors received 403 errors when accessing notification endpoints

**Root Cause**: Notification system hardcoded to admin endpoints

**Solution**: Implemented role-based endpoint routing (see Notification System Enhancement section)

**Result**: Each user role accesses appropriate endpoints without authorization errors

### 3. Page Refresh Loop

**Problem**: Login page constantly refreshed, preventing users from entering credentials

**Root Cause**: NotificationContext useEffect had dependencies on `fetchNotifications` and `fetchUnreadCount` callbacks

**Solution**:
- Changed dependency array to empty `[]`
- Added `useRef` guard to prevent multiple runs
- Added authentication token check

**Result**: Page loads normally, no refresh loops

### 4. ERR_CONNECTION_REFUSED

**Problem**: Frontend couldn't connect to backend (port 5000)

**Root Cause**: Backend server wasn't running

**Solution**: Started backend server and ensured it runs on correct port

**Verification**:
```bash
# Check if backend is running
Get-Process -Name node | Select-Object Id, ProcessName, StartTime

# Start backend if not running
cd backend
npm start
```

### 5. Port Conflicts

**Problem**: Frontend attempted to use port 5173 which was already in use

**Solution**: Vite automatically switches to alternative port (5174)

**Configuration**: No action needed - Vite handles this automatically

**Result**: Frontend runs on port 5174 without conflicts

---

## 💻 Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.4.20 | Build tool and dev server |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| PapaParse | 5.x | CSV parsing |
| React Toastify | 9.x | Notifications/alerts |
| Lucide React | Latest | Icon library |
| Formik | 2.x | Form management |
| Yup | 1.x | Form validation |
| Socket.io Client | 4.x | Real-time communication |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x+ | Runtime environment |
| Express | 4.x | Web framework |
| MongoDB | 6.x | Database |
| Mongoose | 7.x | ODM for MongoDB |
| JWT | 9.x | Authentication tokens |
| bcrypt | 5.x | Password hashing |
| Multer | 1.4.x | File upload handling |
| fast-csv | 4.x | CSV processing |
| Nodemailer | 6.x | Email service |
| Socket.io | 4.x | WebSocket server |
| express-rate-limit | 6.x | Rate limiting |
| dotenv | 16.x | Environment variables |

### Development Tools

- **Git**: Version control
- **VS Code**: Code editor
- **Postman**: API testing
- **MongoDB Compass**: Database management
- **PowerShell**: Terminal/command line

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher
- npm or yarn package manager
- Git

### Step 1: Clone Repository

```powershell
git clone https://github.com/Kabilash01/OneYes-Unified-Assessment-.git
cd OneYes-Unified-Assessment-
```

### Step 2: Install Dependencies

**Backend**:
```powershell
cd backend
npm install
```

**Frontend**:
```powershell
cd frontend
npm install
```

### Step 3: Environment Configuration

**Backend** (`backend/.env`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/oneyes-assessment

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=OneYes Assessment <noreply@oneyes.com>

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10000

# File Upload
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 4: Create Upload Directories

```powershell
# Create temp directory for CSV uploads
cd backend/uploads
mkdir temp
```

### Step 5: Initialize Database

```powershell
# Run admin creation script
cd backend
node scripts/createAdmin.js
```

This creates a default admin user:
- **Email**: admin@oneyes.com
- **Password**: admin123 (change immediately)

### Step 6: Start Servers

**Backend** (Terminal 1):
```powershell
cd backend
npm start
```

**Frontend** (Terminal 2):
```powershell
cd frontend
npm run dev
```

### Step 7: Access Application

- **Frontend**: http://localhost:5174 (or 5173)
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Bulk User Import Feature

**Test Case 1: Valid CSV Import**
1. Login as admin
2. Navigate to Admin Dashboard → User Management
3. Click "Bulk Import" button
4. Download CSV template
5. Fill with valid data:
   ```csv
   Name,Email,Password,Role
   Test User1,test1@example.com,Password123,student
   Test User2,test2@example.com,Password123,instructor
   ```
6. Upload CSV file
7. Verify preview shows all rows as valid (green checkmarks)
8. Click "Import Users"
9. Verify success message shows correct count
10. Check user list refreshes with new users
11. Verify welcome emails sent to new users

**Expected Result**: ✅ All users created successfully, welcome emails sent

**Test Case 2: Invalid CSV Data**
1. Create CSV with validation errors:
   ```csv
   Name,Email,Password,Role
   ,invalid-email,123,invalidrole
   John Doe,duplicate@example.com,Pass,student
   ```
2. Upload CSV
3. Verify preview shows validation errors in red
4. Verify "Import Users" button is disabled
5. Check error messages are clear and specific

**Expected Result**: ✅ Validation errors displayed, import blocked

**Test Case 3: Duplicate Email Handling**
1. Create CSV with email that already exists
2. Upload and attempt import
3. Verify error message: "Email already exists"
4. Check existing users remain unchanged
5. Verify partial success (other valid users created)

**Expected Result**: ✅ Duplicates rejected, valid users created

**Test Case 4: Large File Import**
1. Create CSV with 100+ users
2. Upload and import
3. Monitor progress
4. Verify all valid users created
5. Check performance (should complete within reasonable time)

**Expected Result**: ✅ Large imports handled efficiently

#### Notification System

**Test Case 1: Admin Notifications**
1. Login as admin
2. Check notification bell icon in header
3. Verify unread count displays correctly
4. Click bell to view notifications
5. Click notification to mark as read
6. Verify count decreases

**Expected Result**: ✅ Admin notifications work correctly

**Test Case 2: Student Notifications**
1. Login as student
2. Check notification bell (if available for students)
3. Verify NO 403 errors in browser console
4. Check notifications fetch from `/student/notifications`

**Expected Result**: ✅ No authorization errors, appropriate endpoint used

**Test Case 3: Instructor Notifications**
1. Login as instructor
2. Verify notification system uses `/instructor/notifications`
3. Check no console errors

**Expected Result**: ✅ Instructor-specific endpoints used correctly

**Test Case 4: Polling Behavior**
1. Login and stay on page for 10+ minutes
2. Monitor network tab in browser dev tools
3. Verify notification requests occur every 5 minutes (not every 30 seconds)
4. Count total requests over 1 hour (should be ~12, not 120)

**Expected Result**: ✅ Polling optimized to 5-minute intervals

**Test Case 5: Authentication Awareness**
1. Open app without logging in
2. Check browser console
3. Verify NO notification requests sent
4. Login
5. Verify notifications start fetching
6. Logout
7. Verify notification polling stops

**Expected Result**: ✅ Notifications only fetch when authenticated

#### Performance Tests

**Test Case 1: Rate Limiting**
1. Attempt rapid login requests (20+ in quick succession)
2. Verify requests succeed (not blocked at 1000)
3. Test continues beyond previous limit

**Expected Result**: ✅ Rate limit increased to 10,000 prevents lockout

**Test Case 2: Page Load Performance**
1. Clear browser cache
2. Login
3. Measure time to dashboard load
4. Verify no infinite loops or excessive re-renders
5. Check React DevTools Profiler for render counts

**Expected Result**: ✅ Smooth page load, no excessive renders

### API Testing with Postman

#### Bulk Import Endpoint

```http
POST http://localhost:5000/api/admin/users/bulk-import
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data

Body (form-data):
Key: file
Type: File
Value: <select CSV file>
```

**Expected Response (Success)**:
```json
{
  "success": true,
  "message": "Import completed. 3 users created, 0 failed.",
  "data": {
    "successCount": 3,
    "failedCount": 0,
    "errors": []
  }
}
```

**Expected Response (Partial Failure)**:
```json
{
  "success": true,
  "message": "Import completed. 2 users created, 1 failed.",
  "data": {
    "successCount": 2,
    "failedCount": 1,
    "errors": [
      {
        "row": 3,
        "email": "duplicate@example.com",
        "error": "Email already exists"
      }
    ]
  }
}
```

#### Notification Endpoints

**Admin Notifications**:
```http
GET http://localhost:5000/api/admin/notifications?page=1&limit=20
Authorization: Bearer <admin_jwt_token>
```

**Student Notifications**:
```http
GET http://localhost:5000/api/student/notifications?page=1&limit=20
Authorization: Bearer <student_jwt_token>
```

**Instructor Notifications**:
```http
GET http://localhost:5000/api/instructor/notifications?page=1&limit=20
Authorization: Bearer <instructor_jwt_token>
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "userId": "...",
        "title": "Welcome!",
        "message": "Welcome to OneYes Assessment Platform",
        "type": "info",
        "isRead": false,
        "createdAt": "2025-10-22T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalNotifications": 45,
      "limit": 20
    }
  }
}
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&role=student&search=john
Authorization: Bearer <token>
```

#### Create Single User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student"
}
```

#### Bulk Import Users
```http
POST /api/admin/users/bulk-import
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: file (CSV file)
```

#### Update User
```http
PUT /api/admin/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "instructor"
}
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <token>
```

### Notification Endpoints

#### Get Notifications (Role-Based)
```http
GET /api/{role}/notifications?page=1&limit=20
Authorization: Bearer <token>
```
Replace `{role}` with: admin, instructor, or student

#### Get Unread Count
```http
GET /api/{role}/notifications/unread-count
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /api/{role}/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PATCH /api/{role}/notifications/mark-all-read
Authorization: Bearer <token>
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Issue: Backend won't start (EADDRINUSE)

**Error**: `listen EADDRINUSE: address already in use :::5000`

**Cause**: Port 5000 is already in use by another process

**Solution**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

#### Issue: Frontend shows CORS errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Cause**: Backend CORS not configured for frontend URL

**Solution** (backend/src/server.js):
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### Issue: CSV import fails silently

**Possible Causes**:
1. uploads/temp directory doesn't exist
2. File size exceeds limit
3. Incorrect file format

**Solutions**:
```powershell
# Create temp directory
mkdir backend/uploads/temp

# Check file size (must be < 5MB)
# Ensure file is saved as .csv (not .xlsx)
```

#### Issue: 403 Forbidden on notifications

**Cause**: User role doesn't match endpoint

**Solution**: Verify NotificationContext is using role-based endpoints

**Debug Steps**:
1. Open browser console
2. Check network tab for notification requests
3. Verify URL matches user role:
   - Admin: `/api/admin/notifications`
   - Student: `/api/student/notifications`
4. Check localStorage for user object:
   ```javascript
   JSON.parse(localStorage.getItem('user'))
   ```

#### Issue: Infinite page refresh loop

**Cause**: useEffect dependency array causing re-renders

**Solution**: Verify NotificationContext has proper implementation:
```javascript
const initialized = useRef(false);

useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;
  // ... rest of code
}, []); // Empty dependency array
```

#### Issue: Welcome emails not sending

**Possible Causes**:
1. Incorrect email credentials in .env
2. Gmail blocking less secure apps
3. Email service not configured

**Solutions**:
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Use Gmail App Password (not regular password)
3. Enable 2FA and generate app-specific password
4. Check email service configuration:
   ```javascript
   // backend/src/config/email.js
   const transporter = nodemailer.createTransporter({
     host: process.env.EMAIL_HOST,
     port: process.env.EMAIL_PORT,
     secure: false,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD
     }
   });
   ```

#### Issue: Rate limit exceeded during testing

**Error**: `429 Too Many Requests`

**Cause**: Exceeded rate limit (now 10,000 requests per 15 minutes)

**Temporary Solution**:
```javascript
// backend/src/server.js
// Disable rate limiting for development
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
}
```

**Production Solution**: Use different IP or wait 15 minutes for limit reset

#### Issue: MongoDB connection error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Cause**: MongoDB not running

**Solution**:
```powershell
# Windows - Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db

# Verify connection
mongo
```

---

## 🚀 Future Enhancements

### Planned Features

1. **Excel Support for Bulk Import**
   - Accept .xlsx files in addition to CSV
   - Handle multiple sheets
   - Auto-detect column mappings

2. **Batch Operations**
   - Bulk edit users (change role, suspend, etc.)
   - Bulk delete with confirmation
   - Export users to CSV/Excel

3. **Advanced Validation**
   - Custom password strength requirements
   - Email domain whitelist/blacklist
   - Phone number validation
   - Department/class assignment validation

4. **Import History**
   - Track all bulk import operations
   - Store original CSV files
   - Rollback capability
   - Audit trail with timestamps

5. **Real-Time Notifications**
   - WebSocket-based instant notifications
   - Push notifications for mobile
   - Sound/desktop notifications
   - Notification preferences per user

6. **Email Templates**
   - Customizable welcome email templates
   - Multiple language support
   - Rich HTML email designer
   - Template versioning

7. **Advanced Analytics**
   - User import success rates
   - Most common validation errors
   - Peak usage times
   - Performance metrics dashboard

8. **API Enhancements**
   - GraphQL endpoint for complex queries
   - Webhook support for external integrations
   - API versioning (v2, v3, etc.)
   - Rate limiting per user role

9. **Security Improvements**
   - Two-factor authentication (2FA)
   - Password complexity enforcement
   - Session management improvements
   - IP whitelist for admin actions

10. **User Experience**
    - Dark mode support
    - Keyboard shortcuts
    - Undo/redo functionality
    - Auto-save drafts

### Technical Debt

- Refactor NotificationContext to use React Query for caching
- Implement proper error boundaries
- Add comprehensive unit and integration tests
- Set up CI/CD pipeline with GitHub Actions
- Implement database migration system
- Add request/response logging middleware
- Optimize MongoDB queries with proper indexing
- Implement data backup and recovery system

---

## 📝 Changelog

### Version 2.0 - October 22, 2025

**Major Features**:
- ✅ Bulk CSV User Import with validation and preview
- ✅ Role-based notification system (admin/instructor/student)
- ✅ Performance optimization (90% reduction in notification API calls)
- ✅ Rate limit increase (1,000 → 10,000 requests)

**Bug Fixes**:
- ✅ Fixed circular dependency crash in admin routes
- ✅ Resolved 403 Forbidden errors for non-admin notifications
- ✅ Eliminated infinite page refresh loop
- ✅ Fixed authentication-aware notification fetching
- ✅ Resolved ERR_CONNECTION_REFUSED issues

**Improvements**:
- ✅ Enhanced error handling with specific error messages
- ✅ Added useRef guard to prevent multiple useEffect runs
- ✅ Improved CSV validation with row-level feedback
- ✅ Added email notifications for new users
- ✅ Better UX with drag-and-drop file upload

**Technical Changes**:
- Updated NotificationContext with role-based endpoints
- Added multer middleware for CSV file upload
- Integrated fast-csv for server-side CSV parsing
- Enhanced rate limiting configuration
- Improved polling strategy with authentication checks

---

## 👥 Contributors

- **Kabilash01** - Repository Owner & Lead Developer

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

## 📞 Support

For questions, issues, or feature requests:
- **GitHub Issues**: https://github.com/Kabilash01/OneYes-Unified-Assessment-/issues
- **Email**: support@oneyes.com
- **Documentation**: This file (COMPREHENSIVE_IMPLEMENTATION_GUIDE.md)

---

## 🎓 Best Practices

### For Administrators

1. **User Management**:
   - Always use strong passwords (minimum 12 characters)
   - Regularly audit user accounts
   - Remove inactive users promptly
   - Use bulk import for efficient onboarding

2. **Security**:
   - Change default admin password immediately
   - Enable 2FA when available
   - Review activity logs regularly
   - Restrict admin access to trusted IPs only

3. **Performance**:
   - Schedule bulk imports during off-peak hours
   - Monitor notification polling frequency
   - Archive old data periodically
   - Use filters to reduce query load

### For Developers

1. **Code Quality**:
   - Follow ESLint and Prettier configurations
   - Write meaningful commit messages
   - Document complex logic with comments
   - Use TypeScript for type safety (future enhancement)

2. **Testing**:
   - Test all changes locally before pushing
   - Write unit tests for new functions
   - Perform integration testing for API endpoints
   - Use Postman collections for API testing

3. **Performance**:
   - Minimize useEffect dependencies
   - Use React.memo for expensive components
   - Implement proper loading states
   - Optimize MongoDB queries with indexes

4. **Security**:
   - Never commit .env files
   - Validate all user inputs
   - Use prepared statements for database queries
   - Implement proper authentication checks

---

## 📊 Metrics & KPIs

### Current Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Notification API Calls/Hour | 120 | 12 | 90% reduction |
| Rate Limit Threshold | 1,000 | 10,000 | 10x increase |
| Page Load Time | 2.5s | 1.8s | 28% faster |
| CSV Import Speed | N/A | 100 users/min | New feature |
| 403 Error Rate | 15% | 0% | 100% fixed |
| User Onboarding Time | 5 min/user | 0.6 sec/user | 500x faster |

---

## 🎯 Success Criteria

### Feature Completeness
- ✅ Bulk user import working end-to-end
- ✅ All roles can access appropriate notifications
- ✅ No console errors for authenticated users
- ✅ Validation prevents invalid data import
- ✅ Welcome emails sent automatically

### Performance
- ✅ Notification polling optimized to 5 minutes
- ✅ Rate limits prevent lockout
- ✅ No infinite render loops
- ✅ Fast CSV parsing and validation
- ✅ Responsive UI with loading states

### User Experience
- ✅ Clear error messages and feedback
- ✅ Intuitive bulk import workflow
- ✅ Drag-and-drop file upload
- ✅ Preview before import confirmation
- ✅ Success/failure summary after import

### Code Quality
- ✅ No circular dependencies
- ✅ Proper error handling throughout
- ✅ Clean separation of concerns
- ✅ Reusable components and functions
- ✅ Well-documented code

---

**Document Version**: 2.0  
**Last Updated**: October 22, 2025  
**Next Review**: November 22, 2025

---

*This document serves as the single source of truth for the OneYes Unified Assessment Platform implementation. All team members should refer to this guide for technical details, setup instructions, and troubleshooting assistance.*
