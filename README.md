# Unified Assessment Platform

A comprehensive full-stack platform for creating, managing, and taking online assessments with role-based access for students, instructors, and administrators.

## 🚀 Features

### For Students
- Browse and filter available assessments
- Take timed assessments with auto-save functionality
- Track submission history and view results
- View performance analytics and progress charts
- Manage personal profile

### For Instructors
- Create and manage assessments with multiple question types (MCQ, short, long answer)
- Assign assessments to specific students or make them public
- Evaluate student submissions with custom feedback
- View student performance analytics
- Manage question banks

### For Administrators
- Manage users (students, instructors, admins)
- Oversee all assessments across the platform
- View platform-wide statistics and logs
- Configure platform settings and branding
- Archive and manage old data

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with dark mode support
- **Forms**: Formik + Yup validation
- **Charts**: Recharts for data visualization
- **Rich Text**: React Quill for text editing
- **Tables**: TanStack React Table
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, express-rate-limit

## 📁 Project Structure

```
unified-assessment-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles and Tailwind config
│   └── package.json
│
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # MongoDB models
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/assessment-platform?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload (Optional)
MAX_FILE_SIZE=5242880
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the required environment variables (see above)

4. Start the development server:
```bash
npm run dev
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student",
  "instituteCode": "INST001"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Student Endpoints

#### Get Available Assessments
```http
GET /api/student/assessments?subject=Math&status=published
Authorization: Bearer <token>
```

#### Start Assessment
```http
POST /api/student/assessments/:id/start
Authorization: Bearer <token>
```

#### Submit Assessment
```http
POST /api/student/submissions/:id/submit
Authorization: Bearer <token>
```

### Instructor Endpoints

#### Create Assessment
```http
POST /api/instructor/assessments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mathematics Quiz",
  "description": "Final exam covering algebra and geometry",
  "duration": 60,
  "totalMarks": 100,
  "questions": [...],
  "startDate": "2025-10-20T00:00:00Z",
  "endDate": "2025-10-27T23:59:59Z"
}
```

#### Evaluate Submission
```http
PUT /api/instructor/submissions/:id/evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85,
  "feedback": "Good work! Focus more on geometry concepts.",
  "answers": [...]
}
```

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users?role=student&page=1&limit=20
Authorization: Bearer <token>
```

#### Update User Role
```http
PUT /api/admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "instructor",
  "isActive": true
}
```

## 🔒 Security Features

- JWT-based authentication with secure token storage
- Password hashing using bcryptjs with salt rounds
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration for frontend origin
- Rate limiting on authentication endpoints
- Security headers via Helmet.js
- Protection against NoSQL injection

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes
- **Auto-save**: Automatic saving of assessment answers every 30 seconds
- **Real-time Validation**: Instant feedback on form inputs
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: Global error boundaries and toast notifications
- **Protected Routes**: Role-based route guards
- **Accessibility**: WCAG compliant components

## 📊 Database Schema

### User Model
- name, email, password (hashed)
- role: student | instructor | admin
- instituteCode, profilePic
- isActive, timestamps

### Assessment Model
- title, description
- createdBy (instructor reference)
- duration, totalMarks, subjects
- questions (embedded)
- assignedTo (student references)
- status: draft | published | archived
- startDate, endDate, timestamps

### Submission Model
- assessmentId, studentId
- answers (embedded)
- status: in-progress | submitted | evaluated
- score, feedback
- evaluatedBy (instructor reference)
- timestamps (started, submitted, evaluated)

## 🚀 Deployment

### Backend Deployment (Heroku/Render/Railway)

1. Set environment variables in the platform dashboard
2. Connect your GitHub repository
3. Deploy from the `backend` directory
4. Ensure MongoDB Atlas is accessible from deployed server

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL` with backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the robust database solution
- All contributors and users of this platform
