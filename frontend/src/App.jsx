import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, RoleBasedRoute, PublicRoute } from './components/ProtectedRoute';

// Common Components
import Navbar from './components/common/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

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
import StudentSupportPage from './pages/StudentSupportPage';
import StudentTicketDetailPage from './pages/StudentTicketDetailPage';

// Analytics Components (Feature 7)
import StudentAnalyticsDashboard from './pages/student/StudentAnalyticsDashboard';
import InstructorAnalyticsDashboard from './pages/instructor/InstructorAnalyticsDashboard';
import AdminAnalyticsDashboard from './pages/admin/AdminAnalyticsDashboard';

// Instructor Components (placeholders)
import InstructorDashboard from './pages/instructor/Dashboard';
import CreateAssessment from './pages/instructor/CreateAssessment';
import ManageAssessments from './pages/instructor/ManageAssessments';
import EvaluateSubmissions from './pages/instructor/EvaluateSubmissions';
import EvaluationCalendar from './pages/instructor/EvaluationCalendar';
import InstructorSupportPage from './pages/InstructorSupportPage';
import InstructorTicketDetailPage from './pages/InstructorTicketDetailPage';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardOverview from './components/admin/DashboardOverview';
import UserManagement from './pages/admin/UserManagement';
import AssessmentOversight from './pages/admin/AssessmentOversight';
import ActivityLogs from './pages/admin/ActivityLogs';
import PlatformSettings from './pages/admin/PlatformSettings';
import SuspiciousAlerts from './components/admin/SuspiciousAlerts';
import AdminNotificationsPage from './pages/admin/NotificationsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import ActivityCalendar from './pages/admin/ActivityCalendar';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminSupportPage from './pages/AdminSupportPage';
import AdminTicketDetailPage from './pages/AdminTicketDetailPage';

// Landing Page
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
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
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Search Results - Protected Route for all authenticated users */}
            <Route
              path="/search-results"
              element={
                <ProtectedRoute>
                  <SearchResultsPage />
                </ProtectedRoute>
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
            <Route
              path="/student/support"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentSupportPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/support/:id"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentTicketDetailPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/student/analytics"
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentAnalyticsDashboard />
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
            <Route
              path="/instructor/calendar"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <EvaluationCalendar />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/instructor/support"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <InstructorSupportPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/instructor/support/:id"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <InstructorTicketDetailPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/instructor/analytics"
              element={
                <RoleBasedRoute allowedRoles={['instructor']}>
                  <InstructorAnalyticsDashboard />
                </RoleBasedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              }
            >
              {/* Nested Admin Routes */}
              <Route index element={<DashboardOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="assessments" element={<AssessmentOversight />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="alerts" element={<SuspiciousAlerts />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="calendar" element={<ActivityCalendar />} />
              <Route path="settings" element={<PlatformSettings />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="support/:id" element={<AdminTicketDetailPage />} />
              <Route path="analytics" element={<AdminAnalyticsDashboard />} />
            </Route>

            {/* Legacy Admin Routes (redirect to new structure) */}
            <Route path="/admin/dashboard" element={<Navigate to="/admin-dashboard" replace />} />
            <Route
              path="/admin/users"
              element={<Navigate to="/admin-dashboard/users" replace />}
            />
            <Route
              path="/admin/assessments"
              element={<Navigate to="/admin-dashboard/assessments" replace />}
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
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
