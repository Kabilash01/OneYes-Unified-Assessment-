import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * @description Provides authentication state and methods to the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is not expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired
            console.log('🔴 Token expired, logging out');
            logout();
          } else {
            // Token valid, fetch fresh user data
            const response = await authAPI.getMe();
            // API interceptor already unwraps response.data
            // Response structure: { success, data: { user } }
            console.log('🔄 Auth initialized:', response);
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login function
   * @param {Object} credentials - Email and password
   */
  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('📦 Full response:', response);
      
      // API interceptor already unwraps response.data, so response IS the data
      // Response structure after interceptor: { success, data: { user, token } }
      const { user: userData, token } = response.data;
      console.log('👤 User data:', userData);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      if (!userData || !token) {
        console.error('❌ Missing user or token in response:', response);
        throw new Error('Invalid response format: missing user or token');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Login successful, returning result');
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Register function
   * @param {Object} userData - User registration data
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // API interceptor already unwraps response.data
      // Response structure: { success, data: { user, token } }
      const { user: newUser, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);

      toast.success('Registration successful!');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  /**
   * Update user profile
   * @param {Object} data - Profile update data
   */
  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      // API interceptor already unwraps response.data
      // Response structure: { success, data: { user } }
      const updatedUser = response.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Change password
   * @param {Object} passwords - Current and new password
   */
  const changePassword = async (passwords) => {
    try {
      await authAPI.changePassword(passwords);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Password change failed');
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if user has specific role
   * @param {string|array} roles - Role(s) to check
   */
  const hasRole = (roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
