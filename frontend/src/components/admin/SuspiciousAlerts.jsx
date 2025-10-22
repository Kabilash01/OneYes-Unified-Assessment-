import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import { AlertTriangle, User, Eye, X } from 'react-feather';

const SuspiciousAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState({
    failedLogins: [],
    rapidSubmissions: [],
    tabSwitches: [],
  });
  const [totalAlerts, setTotalAlerts] = useState(0);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSuspiciousAlerts();
      
      if (response.success) {
        setAlerts(response.data.alerts);
        setTotalAlerts(response.data.summary.totalAlerts);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const AlertCard = ({ type, icon, title, description, severity, timestamp, onView, onDismiss }) => {
    const severityColors = {
      critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
      warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    };

    return (
      <div className={`border-l-4 rounded-lg p-4 ${severityColors[severity] || severityColors.warning}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${
              severity === 'critical' 
                ? 'bg-red-100 dark:bg-red-800' 
                : severity === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-800'
                : 'bg-blue-100 dark:bg-blue-800'
            }`}>
              {icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {timestamp}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onView && (
              <button
                onClick={onView}
                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (totalAlerts === 0) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Suspicious Activity Detected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All user activities are within normal parameters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Suspicious Activity Alerts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} require your attention
        </p>
      </div>

      <div className="space-y-6">
        {/* Failed Login Attempts */}
        {alerts.failedLogins.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Multiple Failed Login Attempts
            </h2>
            <div className="space-y-4">
              {alerts.failedLogins.map((alert, index) => (
                <AlertCard
                  key={`failed-${index}`}
                  type="failed-login"
                  icon={<User className="w-5 h-5 text-red-600 dark:text-red-400" />}
                  title={`${alert.count} Failed Login Attempts`}
                  description={`Multiple failed login attempts from IP: ${alert._id}`}
                  severity="critical"
                  timestamp={formatDate(alert.lastAttempt)}
                  onView={() => {
                    // Navigate to user details or show modal
                    console.log('View user:', alert.userId);
                  }}
                  onDismiss={() => {
                    // Dismiss alert
                    console.log('Dismiss alert');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rapid Submissions */}
        {alerts.rapidSubmissions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rapid Assessment Submissions
            </h2>
            <div className="space-y-4">
              {alerts.rapidSubmissions.map((alert, index) => (
                <AlertCard
                  key={`rapid-${index}`}
                  type="rapid-submission"
                  icon={<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                  title={`${alert.count} Submissions in Short Time`}
                  description={`${alert._id?.name || 'Unknown User'} (${alert._id?.email || 'N/A'}) submitted ${alert.count} assessments rapidly`}
                  severity="warning"
                  timestamp={formatDate(alert.lastSubmission)}
                  onView={() => {
                    console.log('View user submissions:', alert._id);
                  }}
                  onDismiss={() => {
                    console.log('Dismiss alert');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab Switches */}
        {alerts.tabSwitches.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Excessive Tab Switches During Assessment
            </h2>
            <div className="space-y-4">
              {alerts.tabSwitches.map((alert, index) => (
                <AlertCard
                  key={`tab-${index}`}
                  type="tab-switch"
                  icon={<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                  title={`${alert.count} Tab Switches Detected`}
                  description={`${alert.userId?.name || 'Unknown User'} switched tabs ${alert.count} times during an assessment`}
                  severity="warning"
                  timestamp={formatDate(alert.lastSwitch)}
                  onView={() => {
                    console.log('View assessment:', alert.assessmentId);
                  }}
                  onDismiss={() => {
                    console.log('Dismiss alert');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspiciousAlerts;
