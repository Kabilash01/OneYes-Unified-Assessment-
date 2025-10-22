# 🔐 Admin Credentials for OneYes Unified Assessment Platform

## Admin Login Credentials

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@oneyes.com
🔑 Password: Admin@123
👤 Role:     Administrator
🏢 Institute: ONEYES-ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Access URLs

### Frontend (Vite Development Server)
- **Login Page**: http://localhost:5173/login
- **Admin Dashboard**: http://localhost:5173/admin-dashboard

### Backend API (Express Server)
- **API Base URL**: http://localhost:5000/api
- **Admin Routes**: http://localhost:5000/api/admin

---

## How to Login

### Step 1: Start the Servers
Make sure both backend and frontend servers are running:

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Access Login Page
1. Open your browser
2. Go to: http://localhost:5173/login
3. Enter credentials:
   - **Email**: `admin@oneyes.com`
   - **Password**: `Admin@123`
4. Click "Sign In"

### Step 3: Access Admin Dashboard
After successful login, you'll be redirected based on your role:
- **Admins** → `/admin-dashboard` (automatically redirected)
- **Students** → `/student/dashboard`
- **Instructors** → `/instructor/dashboard`

Or directly navigate to: http://localhost:5173/admin-dashboard

---

## Admin Dashboard Features

### ✅ Currently Available (Phases 1-7 Complete)

#### **Dashboard Overview** (`/admin-dashboard`)
- 📊 Platform statistics (users, assessments, submissions)
- 📈 Charts and visualizations (Recharts):
  - Bar Chart: Assessments by month
  - Pie Charts: Users by role, Assessment status
  - Line Chart: Daily registrations
- 📋 Recent activity feed (last 10 activities)
- 🔔 Alerts counter

#### **User Management** (`/admin-dashboard/users`)
- 👥 **View All Users** with pagination (10 per page)
- 🔍 **Search** by name, email, or institute code
- 🎯 **Filters**: Role (student/instructor/admin), Status (active/inactive)
- ➕ **Add New User**: Create users with Formik validation
  - Name, Email, Password, Role, Institute Code
  - Password strength validation (min 6 characters)
- ✏️ **Edit User**: Update user details
  - Change name, role, institute code
  - Toggle active/inactive status
  - Email cannot be changed (unique identifier)
- 🗑️ **Suspend User**: Soft delete (sets isActive = false)
  - Confirmation modal
  - Prevents self-suspension
- 📊 **User Statistics**: Total users count
- 🔄 **Real-time Updates**: Auto-refresh after CRUD operations

#### **Navigation & Layout**
- 🎨 Responsive sidebar with 6 menu items
- 📱 Mobile hamburger menu
- 🌙 Dark mode toggle
- 👤 Admin profile header with avatar
- 🚪 Secure logout functionality

### 🔜 Coming Soon (Phases 8-12)

#### **Assessment Oversight** (`/admin-dashboard/assessments`)
- View all assessments across platform
- Flag/unflag assessments with reason
- Archive old assessments
- Submission statistics per assessment

#### **Activity Logs** (`/admin-dashboard/logs`)
- Date range picker
- Filter by action type, user, status
- CSV export functionality
- Paginated log entries
- Real-time activity monitoring

#### **Suspicious Alerts** (`/admin-dashboard/alerts`)
- Failed login attempts detection
- Rapid submission alerts
- Tab switch monitoring during tests
- Anomaly detection

#### **Platform Settings** (`/admin-dashboard/settings`)
- Branding customization (logo, colors, institute name)
- System configuration (file limits, session timeout)
- Email settings
- Data archiving and retention policies
- Security settings

---

## API Endpoints Used

### Dashboard Stats
```
GET /api/admin/dashboard/stats
```
Returns: users, assessments, submissions, recent activity, charts data

### User Management
```
GET    /api/admin/users              # List users (with filters, pagination)
POST   /api/admin/users              # Create new user
PUT    /api/admin/users/:id          # Update user
DELETE /api/admin/users/:id          # Suspend user (soft delete)
```

### Authentication
```
POST /api/auth/login                 # Login with email & password
POST /api/auth/register              # Register new account
```

---

## User Roles & Permissions

### Admin
- ✅ Full access to admin dashboard
- ✅ User management (CRUD operations)
- ✅ Assessment oversight
- ✅ Activity logs and monitoring
- ✅ Platform settings
- ✅ Security alerts

### Instructor
- ✅ Create and manage assessments
- ✅ Evaluate submissions
- ✅ View assigned students
- ❌ Cannot access admin panel
- ❌ Cannot manage users

### Student
- ✅ Take assessments
- ✅ View submissions and grades
- ✅ Profile management
- ❌ Cannot access admin panel
- ❌ Cannot create assessments

---

## Testing the Admin Panel

### 1. Login Test
```
1. Go to http://localhost:5173/login
2. Enter: admin@oneyes.com / Admin@123
3. Verify redirect to /admin-dashboard
4. Check JWT token stored in localStorage
```

### 2. User Management Test
```
1. Navigate to Users tab
2. Test search: Enter "admin" in search box
3. Test filters: Select "admin" role
4. Click "Add User" button
5. Fill form and submit
6. Verify new user appears in table
7. Click Edit icon, modify user, save
8. Click Delete icon, confirm suspension
```

### 3. Dashboard Overview Test
```
1. Navigate to Dashboard tab
2. Verify 4 stats cards load correctly
3. Check bar chart renders (assessments by month)
4. Check pie charts (users by role, assessment status)
5. Check line chart (daily registrations)
6. Scroll to Recent Activity feed
7. Verify activity entries show user details
```

### 4. Dark Mode Test
```
1. Click dark mode toggle in sidebar
2. Verify all components switch to dark theme
3. Check charts still visible in dark mode
4. Toggle back to light mode
```

### 5. Mobile Responsiveness Test
```
1. Resize browser to mobile width (< 768px)
2. Verify hamburger menu appears
3. Click hamburger to open sidebar
4. Test navigation
5. Verify stats cards stack vertically
6. Check table horizontal scroll works
```

---

## Database Information

### Collections Used
- **users** - User accounts (admin, instructor, student)
- **assessments** - Assessment tests
- **submissions** - Student submissions
- **activitylogs** - Activity tracking and audit trail
- **platformsettings** - Global platform configuration

### Admin User Document
```javascript
{
  _id: ObjectId,
  name: "Admin User",
  email: "admin@oneyes.com",
  password: "<hashed>", // bcrypt hashed
  role: "admin",
  instituteCode: "ONEYES-ADMIN",
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Security Notes

### Authentication
- ✅ JWT tokens with 24h expiration
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Protected routes with middleware
- ✅ Role-based access control

### Admin Actions Logged
All admin operations are logged to ActivityLog:
- User creation/updates/deletions
- Dashboard access
- Settings changes
- Assessment flagging
- Log exports

### Password Requirements
- Minimum 6 characters
- Mix of letters recommended
- Stored as bcrypt hash (never plain text)

---

## Troubleshooting

### Cannot Login
1. Check backend server is running on port 5000
2. Verify MongoDB connection is active
3. Check browser console for errors
4. Verify admin user exists: `node scripts/createAdmin.js`

### 404 on Admin Routes
1. Verify frontend is running on port 5173
2. Check App.jsx has admin routes configured
3. Clear browser cache and localStorage

### Charts Not Displaying
1. Check API response from `/api/admin/dashboard/stats`
2. Verify recharts package is installed
3. Check browser console for errors

### Dark Mode Not Working
1. Check Tailwind config has `darkMode: 'class'`
2. Verify dark classes are applied
3. Test toggle in sidebar footer

---

## Quick Commands

### Create/Reset Admin User
```bash
cd backend
node scripts/createAdmin.js
```

### Start Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# Vite server runs on http://localhost:5173
```

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## Support

If you need to reset the admin password or create additional admin users, run:
```bash
cd backend
node scripts/createAdmin.js
```

The script will:
- ✅ Create admin if doesn't exist
- ✅ Reset password if admin exists
- ✅ Display credentials in terminal

---

**Last Updated**: October 21, 2025  
**Admin Panel Version**: Phase 7 Complete (User Management)  
**Next Phase**: Assessment Oversight (Phase 8)

---

## 🎉 Happy Testing!

You now have full access to the admin panel with user management capabilities!
