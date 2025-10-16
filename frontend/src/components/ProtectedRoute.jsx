import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Loader';

/**
 * ProtectedRoute Component
 * @description Protects routes that require authentication
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Verifying authentication..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * RoleBasedRoute Component
 * @description Protects routes based on user role
 */
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('🛡️ RoleBasedRoute check:', { 
    isAuthenticated, 
    loading, 
    userRole: user?.role,
    allowedRoles 
  });

  if (loading) {
    console.log('⏳ Still loading...');
    return <PageLoader message="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    console.log('⛔ Role not allowed:', user?.role, 'Allowed:', allowedRoles);
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  console.log('✅ Access granted to protected route');
  return children;
};

/**
 * PublicRoute Component
 * @description Routes accessible only when not authenticated
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    // Redirect to role-specific dashboard
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
