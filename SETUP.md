# Unified Assessment Platform - Setup Guide

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OneYes-Unified-Assessment-
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGO_URI=mongodb://localhost:27017/unified-assessment
# - JWT_SECRET=your-secret-key-here
# - PORT=5000
# - NODE_ENV=development

# Start MongoDB service (if not running)
# Windows: Start MongoDB service from Services
# Mac/Linux: sudo systemctl start mongod

# Run the backend server
npm run dev
```

The backend server should now be running on `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application should now be running on `http://localhost:5173`

## 🔐 Default Users

After first run, you can create users via the signup page or use the API directly.

### Creating Admin User (via MongoDB)

```javascript
// Connect to MongoDB and run this command
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Use bcrypt to hash "Admin@123"
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the registration endpoint with role selection.

## 📁 Project Structure

```
OneYes-Unified-Assessment-/
├── backend/                 # Node.js + Express.js API
│   ├── src/
│   │   ├── config/         # Database & logger configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, role, error handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Express app entry point
│   ├── uploads/            # File upload directory
│   └── package.json
│
└── frontend/               # React.js SPA
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React Context (Auth)
    │   ├── hooks/          # Custom React hooks
    │   ├── pages/          # Route pages
    │   ├── services/       # API integration
    │   ├── styles/         # Global CSS
    │   ├── utils/          # Helper functions
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # React entry point
    └── package.json
```

## 🧪 Testing the Application

### 1. Register a New User

- Navigate to `http://localhost:5173/signup`
- Fill in the form with:
  - Name: Your Name
  - Email: your.email@example.com
  - Password: YourPassword123!
  - Role: student/instructor
  - Institute Code: (optional for students)
- Click "Sign Up"

### 2. Login

- Navigate to `http://localhost:5173/login`
- Enter your credentials
- You'll be redirected based on your role:
  - **Student** → `/student/dashboard`
  - **Instructor** → `/instructor/dashboard`
  - **Admin** → `/admin/dashboard`

### 3. API Testing (Optional)

Use tools like **Postman** or **Thunder Client** to test API endpoints:

#### Auth Endpoints
```
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
GET http://localhost:5000/api/auth/me (requires token)
```

#### Student Endpoints
```
GET http://localhost:5000/api/student/assessments
GET http://localhost:5000/api/student/dashboard/stats
POST http://localhost:5000/api/student/assessments/:id/start
```

## 🛠️ Development Commands

### Backend

```bash
npm run dev          # Start dev server with nodemon (auto-reload)
npm start            # Start production server
npm run lint         # Run ESLint (if configured)
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint (if configured)
```

## 🌍 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/unified-assessment

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Frontend (.env - Optional)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set environment variable `VITE_API_URL` to your backend URL

## 🔧 Troubleshooting

### MongoDB Connection Issues

- **Error:** `MongooseServerSelectionError`
- **Solution:** Ensure MongoDB service is running and MONGO_URI is correct

### Port Already in Use

- **Error:** `EADDRINUSE: address already in use :::5000`
- **Solution:** Kill the process using port 5000 or change PORT in .env

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Errors

- **Error:** `Access to XMLHttpRequest blocked by CORS policy`
- **Solution:** Ensure CORS_ORIGIN in backend .env matches frontend URL

### JWT Token Issues

- **Error:** `jwt malformed` or `jwt expired`
- **Solution:** Clear localStorage and login again

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

### Student Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/assessments` | Get available assessments |
| GET | `/api/student/assessments/:id` | Get assessment details |
| POST | `/api/student/assessments/:id/start` | Start assessment |
| POST | `/api/student/submissions/:id/answer` | Save answer (auto-save) |
| POST | `/api/student/submissions/:id/submit` | Submit assessment |
| GET | `/api/student/submissions` | Get all submissions |
| GET | `/api/student/submissions/:id` | Get submission details |
| GET | `/api/student/dashboard/stats` | Get dashboard statistics |

### Instructor Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/instructor/dashboard/stats` | Get dashboard stats |
| POST | `/api/instructor/assessments` | Create assessment |
| GET | `/api/instructor/assessments` | Get created assessments |
| PUT | `/api/instructor/assessments/:id` | Update assessment |
| DELETE | `/api/instructor/assessments/:id` | Delete assessment |
| GET | `/api/instructor/assessments/:id/submissions` | Get submissions |
| GET | `/api/instructor/submissions/:id` | Get submission details |
| POST | `/api/instructor/submissions/:id/evaluate` | Evaluate submission |
| GET | `/api/instructor/students` | Get students list |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Platform-wide statistics |
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/assessments` | Get all assessments |
| PUT | `/api/admin/assessments/:id/flag` | Flag assessment |
| GET | `/api/admin/logs` | Get activity logs |
| PUT | `/api/admin/settings/branding` | Update branding |
| POST | `/api/admin/archive` | Archive old data |

## 🎨 Features

### Implemented
✅ User authentication with JWT
✅ Role-based access control (Student, Instructor, Admin)
✅ Password hashing with bcrypt
✅ Dark mode support
✅ Responsive design
✅ Toast notifications
✅ Form validation (Formik + Yup)
✅ Protected routes
✅ Auto-login on page refresh
✅ API error handling
✅ Loading states and skeletons
✅ Student dashboard with statistics
✅ RESTful API with proper error handling

### In Progress
⏳ Assessment catalog with filters
⏳ Test-taking interface with timer
⏳ Submission history
⏳ Assessment creation form
⏳ Submission evaluation interface
⏳ Admin user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Happy Coding! 🚀**
