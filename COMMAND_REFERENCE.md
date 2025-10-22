# 🎯 Quick Command Reference Card

## 🚀 Start/Stop Servers

### Start Both Servers
```powershell
# Terminal 1 - Backend
cd backend
node src/server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Stop Servers
```powershell
# Stop all Node processes
Stop-Process -Name node -Force
```

### Restart Backend
```powershell
Stop-Process -Name node -Force
cd backend
node src/server.js
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| Login Page | http://localhost:5173/login |
| Admin Dashboard | http://localhost:5173/admin-dashboard |
| Notifications | http://localhost:5173/admin-dashboard/notifications |
| Announcements | http://localhost:5173/admin-dashboard/announcements |
| Forgot Password | http://localhost:5173/forgot-password |

---

## 📝 Test Admin Credentials

```
Email: admin@example.com
Password: [Check ADMIN_CREDENTIALS.md]
```

---

## 🔍 Quick Checks

### Check if servers running:
```powershell
Get-Process -Name node | Format-Table Id, ProcessName, StartTime
```

### Check MongoDB connection:
```powershell
# In backend terminal, look for:
# "✅ MongoDB connected successfully"
```

### Check frontend compilation:
```powershell
# In frontend terminal, look for:
# "VITE ready in XXX ms"
# "Local: http://localhost:5173/"
```

---

## 🧪 Quick API Tests (using curl)

### Test Health:
```powershell
curl http://localhost:5000/health
```

### Test Forgot Password:
```powershell
curl -X POST http://localhost:5000/api/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\"}'
```

### Test Login (get token):
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"YOUR_PASSWORD\"}'
```

---

## 🔐 Email Configuration

### Edit .env file:
```powershell
cd backend
notepad .env
```

### Required variables:
```env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=Unified Assessment Platform
FRONTEND_URL=http://localhost:5173
INSTITUTE_NAME=Unified Assessment Platform
```

### Get Gmail App Password:
1. Go to: https://myaccount.google.com/security
2. Enable 2FA
3. Create App Password
4. Copy to EMAIL_PASSWORD

---

## 🗄️ MongoDB Quick Commands

### Connect to MongoDB:
```powershell
# Using MongoDB Shell
mongosh

# Or MongoDB Compass (GUI)
mongodb://localhost:27017
```

### Check Collections:
```javascript
use unified_assessment_db
show collections

// View data
db.announcements.find().pretty()
db.notifications.find().pretty()
db.passwordresets.find().pretty()
db.emaillogs.find().pretty()
```

### Clear test data:
```javascript
// Delete all announcements
db.announcements.deleteMany({})

// Delete all notifications
db.notifications.deleteMany({})

// Delete password reset tokens
db.passwordresets.deleteMany({})
```

---

## 📊 Monitoring Backend Logs

### Watch for these messages:

#### Success Messages:
```
✅ MongoDB connected successfully
✅ Email sent successfully to user@example.com
✅ Notification created for user creation
✅ Email connection verified
🚀 Server running on http://localhost:5000
```

#### Warning Messages (non-critical):
```
⚠️  Warning: Duplicate schema index
⚠️  Failed to send email (if EMAIL_USER not configured)
```

#### Error Messages (need attention):
```
❌ MongoDB connection failed
❌ Error: Cannot find module
❌ ValidationError: User validation failed
```

---

## 🐛 Quick Troubleshooting

### Backend won't start:
```powershell
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Kill process using port 5000
# (Replace PID with actual process ID from above)
taskkill /PID <PID> /F

# Restart backend
cd backend
node src/server.js
```

### Frontend won't start:
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process
taskkill /PID <PID> /F

# Restart frontend
cd frontend
npm run dev
```

### MongoDB not connecting:
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB*

# Start MongoDB (if installed as service)
Start-Service MongoDB

# Or check MongoDB docs for your installation
```

### Email not sending:
```powershell
# Check .env configuration
cd backend
cat .env | Select-String EMAIL

# Verify EMAIL_USER and EMAIL_PASSWORD are set
# For Gmail, use App-Specific Password

# Restart backend after .env changes
```

---

## 📦 NPM Commands

### Install dependencies (if needed):
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Check for vulnerabilities:
```powershell
npm audit

# Fix automatically (use with caution)
npm audit fix
```

---

## 🎯 Quick Navigation

### Admin Dashboard Pages:
| Page | Route |
|------|-------|
| Overview | `/admin-dashboard` |
| Users | `/admin-dashboard/users` |
| Assessments | `/admin-dashboard/assessments` |
| Activity Logs | `/admin-dashboard/logs` |
| Suspicious Alerts | `/admin-dashboard/alerts` |
| Notifications | `/admin-dashboard/notifications` |
| Announcements | `/admin-dashboard/announcements` |
| Settings | `/admin-dashboard/settings` |

---

## 🔔 New API Endpoints

### Password Reset:
```
POST   /api/auth/forgot-password
POST   /api/auth/verify-reset-token  
POST   /api/auth/reset-password
```

### Notifications:
```
GET    /api/admin/notifications
GET    /api/admin/notifications/unread-count
PATCH  /api/admin/notifications/:id/read
PATCH  /api/admin/notifications/mark-all-read
DELETE /api/admin/notifications/:id
DELETE /api/admin/notifications/clear-all
```

### Announcements (Admin):
```
POST   /api/admin/announcements
GET    /api/admin/announcements
GET    /api/admin/announcements/stats
GET    /api/admin/announcements/:id
PUT    /api/admin/announcements/:id
DELETE /api/admin/announcements/:id
```

### Announcements (User):
```
GET    /api/announcements
GET    /api/announcements/pinned
POST   /api/announcements/:id/view
```

---

## 💾 Backup Commands

### Backup MongoDB:
```powershell
# Create backup directory
mkdir backups

# Export database
mongodump --db unified_assessment_db --out ./backups/$(Get-Date -Format "yyyy-MM-dd")
```

### Restore MongoDB:
```powershell
# Restore from backup
mongorestore --db unified_assessment_db ./backups/2025-10-21/unified_assessment_db
```

---

## 📝 Git Commands (if using)

### Commit new changes:
```powershell
git status
git add .
git commit -m "feat: Add password reset, notifications, and announcement systems"
git push origin main
```

### Create feature branch:
```powershell
git checkout -b feature/communication-system
git add .
git commit -m "Complete communication features"
git push origin feature/communication-system
```

---

## 🎨 VS Code Shortcuts

### Open pages quickly:
- `Ctrl + P` → Type filename
- `Ctrl + Shift + F` → Search all files
- `Ctrl + ~` → Toggle terminal
- `Ctrl + B` → Toggle sidebar

### Quick file access:
```
AnnouncementsPage.jsx
SendAnnouncementModal.jsx
NotificationBell.jsx
NotificationsPage.jsx
ForgotPassword.jsx
ResetPassword.jsx
```

---

## 📞 Support Commands

### Check versions:
```powershell
node --version
npm --version
mongosh --version
```

### Check system info:
```powershell
Get-ComputerInfo | Select-Object CsName, WindowsVersion, OsArchitecture
```

---

## ⚡ Quick Actions

### One-liner to start everything:
```powershell
# Start backend and frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node src/server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

### One-liner to stop everything:
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

---

**📌 Pin this file for quick reference! 📌**

*All commands tested on Windows PowerShell*
