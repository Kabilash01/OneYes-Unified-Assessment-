import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ProtectedRoute, RoleBasedRoute, PublicRoute } from './components/ProtectedRoute';

// Common Components
import Navbar from './components/common/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Student Components
import StudentDashboard from './pages/student/Dashboard';
import AssessmentCatalog from './pages/student/AssessmentCatalog';
import AssessmentCalendar from './pages/student/AssessmentCalendar';
import TestInterface from './pages/student/TestInterface';
import StudentSubmissions from './pages/student/Submissions';
import StudentProfile from './pages/student/Profile';
import NotificationsPage from './pages/student/NotificationsPage';
import UpcomingTestsPage from './pages/student/UpcomingTestsPage';
import ProfilePage from './pages/student/ProfilePage';
import SettingsPage from './pages/student/SettingsPage';
import HelpSupportPage from './pages/student/HelpSupportPage';

// New Student Components (Phase 1-3)
import TakeTestPage from './pages/student/TakeTestPage';
import SubmissionsPage from './pages/student/SubmissionsPage';
import SubmissionDetailPage from './pages/student/SubmissionDetailPage';

// Instructor Components (placeholders)
import InstructorDashboard from './pages/instructor/Dashboard';
import CreateAssessment from './pages/instructor/CreateAssessment';
import ManageAssessments from './pages/instructor/ManageAssessments';
import EvaluateSubmissions from './pages/instructor/EvaluateSubmissions';

// Admin Components (placeholders)
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AssessmentOversight from './pages/admin/AssessmentOversight';

// Landing Page
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
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
            <Route
              path="/student/notifications"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <NotificationsPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/upcoming-tests"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <UpcomingTestsPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <ProfilePage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <SettingsPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/help"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <HelpSupportPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/take-test/:id"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <TakeTestPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/my-submissions"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <SubmissionsPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/submissions"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <SubmissionsPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/submissions/:id"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <SubmissionDetailPage />
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
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
