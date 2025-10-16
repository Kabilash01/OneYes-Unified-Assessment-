import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleBasedRoute, PublicRoute } from './components/ProtectedRoute';

// Common Components
import Navbar from './components/common/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Student Components (placeholders - will be created)
import StudentDashboard from './pages/student/Dashboard';
import AssessmentCatalog from './pages/student/AssessmentCatalog';
import AssessmentCalendar from './pages/student/AssessmentCalendar';
import TestInterface from './pages/student/TestInterface';
import StudentSubmissions from './pages/student/Submissions';
import StudentProfile from './pages/student/Profile';

// Instructor Components (placeholders)
import InstructorDashboard from './pages/instructor/Dashboard';
import CreateAssessment from './pages/instructor/CreateAssessment';
import ManageAssessments from './pages/instructor/ManageAssessments';
import EvaluateSubmissions from './pages/instructor/EvaluateSubmissions';

// Admin Components (placeholders)
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AssessmentOversight from './pages/admin/AssessmentOversight';

// Home Page
const HomePage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Unified Assessment Platform
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Create, manage, and take online assessments with ease
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href="/login"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/signup"
          className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
        >
          Sign Up
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/assessments"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <AssessmentCatalog />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/calendar"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <AssessmentCalendar />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/test/:id"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <TestInterface />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/assessment/:id"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <TestInterface />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/submissions"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentSubmissions />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </RoleBasedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/instructor/create"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <CreateAssessment />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/instructor/assessments"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <ManageAssessments />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/instructor/evaluate/:id"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <EvaluateSubmissions />
                </RoleBasedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin/assessments"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AssessmentOversight />
                </RoleBasedRoute>
              }
            />

            {/* 404 Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
