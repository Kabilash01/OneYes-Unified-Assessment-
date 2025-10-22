import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [usersFilters, setUsersFilters] = useState({
    role: '',
    search: '',
    isActive: '',
  });

  // Assessments
  const [assessments, setAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [assessmentsPagination, setAssessmentsPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [assessmentsFilters, setAssessmentsFilters] = useState({
    status: '',
    search: '',
  });

  // Activity Logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [logsFilters, setLogsFilters] = useState({
    action: '',
    userId: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [actionTypes, setActionTypes] = useState([]);

  // Alerts
  const [alerts, setAlerts] = useState({
    failedLogins: [],
    rapidSubmissions: [],
    tabSwitches: [],
  });
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [totalAlerts, setTotalAlerts] = useState(0);

  // Platform Settings
  const [branding, setBranding] = useState(null);
  const [brandingLoading, setBrandingLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async (filters = usersFilters, page = 1) => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getUsers({
        ...filters,
        page,
        limit: 20,
      });
      if (response.success) {
        setUsers(response.data.users);
        setUsersPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Create User
  const createUser = async (userData) => {
    try {
      const response = await adminAPI.createUser(userData);
      if (response.success) {
        toast.success('User created successfully');
        fetchUsers();
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
      return false;
    }
  };

  // Update User
  const updateUser = async (id, userData) => {
    try {
      const response = await adminAPI.updateUser(id, userData);
      if (response.success) {
        toast.success('User updated successfully');
        fetchUsers();
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
      return false;
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    try {
      const response = await adminAPI.deleteUser(id);
      if (response.success) {
        toast.success('User suspended successfully');
        fetchUsers();
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
      return false;
    }
  };

  // Fetch Assessments
  const fetchAssessments = async (filters = assessmentsFilters, page = 1) => {
    try {
      setAssessmentsLoading(true);
      const response = await adminAPI.getAllAssessments({
        ...filters,
        page,
        limit: 20,
      });
      if (response.success) {
        setAssessments(response.data.assessments);
        setAssessmentsPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch assessments');
    } finally {
      setAssessmentsLoading(false);
    }
  };

  // Flag Assessment
  const flagAssessment = async (id, data) => {
    try {
      const response = await adminAPI.flagAssessment(id, data);
      if (response.success) {
        toast.success('Assessment updated successfully');
        fetchAssessments();
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update assessment');
      return false;
    }
  };

  // Fetch Logs
  const fetchLogs = async (filters = logsFilters, page = 1) => {
    try {
      setLogsLoading(true);
      const response = await adminAPI.getLogs({
        ...filters,
        page,
        limit: 50,
      });
      if (response.success) {
        setLogs(response.data.logs);
        setLogsPagination(response.data.pagination);
        if (response.data.actionTypes) {
          setActionTypes(response.data.actionTypes);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Export Logs
  const exportLogs = async (filters = logsFilters) => {
    try {
      const response = await adminAPI.exportLogs(filters);
      
      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity_logs_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs exported successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to export logs');
      return false;
    }
  };

  // Fetch Alerts
  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      const response = await adminAPI.getSuspiciousAlerts();
      if (response.success) {
        setAlerts(response.data.alerts);
        setTotalAlerts(response.data.summary.totalAlerts);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch alerts');
    } finally {
      setAlertsLoading(false);
    }
  };

  // Fetch Branding
  const fetchBranding = async () => {
    try {
      setBrandingLoading(true);
      const response = await adminAPI.getBranding();
      if (response.success) {
        setBranding(response.data.branding);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch branding');
    } finally {
      setBrandingLoading(false);
    }
  };

  // Update Branding
  const updateBranding = async (formData) => {
    try {
      const response = await adminAPI.updateBranding(formData);
      if (response.success) {
        toast.success('Branding updated successfully');
        fetchBranding();
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update branding');
      return false;
    }
  };

  // Archive Old Data
  const archiveOldData = async (data) => {
    try {
      const response = await adminAPI.archiveOldData(data);
      if (response.success) {
        toast.success(
          `Archived ${response.data.archivedAssessments} assessments and deleted ${response.data.deletedLogs} logs`
        );
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to archive data');
      return false;
    }
  };

  const value = {
    // Dashboard
    dashboardStats,
    statsLoading,
    fetchDashboardStats,

    // Users
    users,
    usersLoading,
    usersPagination,
    usersFilters,
    setUsersFilters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,

    // Assessments
    assessments,
    assessmentsLoading,
    assessmentsPagination,
    assessmentsFilters,
    setAssessmentsFilters,
    fetchAssessments,
    flagAssessment,

    // Logs
    logs,
    logsLoading,
    logsPagination,
    logsFilters,
    setLogsFilters,
    actionTypes,
    fetchLogs,
    exportLogs,

    // Alerts
    alerts,
    alertsLoading,
    totalAlerts,
    fetchAlerts,

    // Branding
    branding,
    brandingLoading,
    fetchBranding,
    updateBranding,
    archiveOldData,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
