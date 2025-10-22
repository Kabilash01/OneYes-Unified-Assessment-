import React, { useState } from 'react';
import { X, Clock, Calendar, FileText, Mail } from 'lucide-react';
import { useScheduledReports } from '../../hooks/useAnalytics';
import { toast } from 'react-toastify';

const ReportScheduler = ({ reportType, filters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { reports, loading, createReport, deleteReport, refetch } = useScheduledReports();
  
  const [formData, setFormData] = useState({
    frequency: 'weekly',
    format: 'pdf',
  });

  const activeReports = reports?.filter(r => r.reportType === reportType && r.isActive) || [];

  const handleSchedule = async () => {
    try {
      await createReport({
        reportType,
        frequency: formData.frequency,
        format: formData.format,
        filters,
      });
      
      setIsOpen(false);
      setFormData({ frequency: 'weekly', format: 'pdf' });
      toast.success('Report scheduled successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to schedule report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await deleteReport(reportId);
      toast.success('Report schedule cancelled');
      refetch();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error('Failed to cancel schedule');
    }
  };

  const formatFrequency = (frequency) => {
    const map = {
      daily: 'Every Day',
      weekly: 'Every Week',
      monthly: 'Every Month',
    };
    return map[frequency] || frequency;
  };

  const formatNextRun = (date) => {
    if (!date) return 'Not scheduled';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
      >
        <Clock className="w-4 h-4" />
        <span>Schedule Report</span>
        {activeReports.length > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-medium rounded-full">
            {activeReports.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Scheduled Reports
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Active Schedules */}
                {activeReports.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Active Schedules
                    </h4>
                    <div className="space-y-2">
                      {activeReports.map((report) => (
                        <div
                          key={report._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded">
                              {report.format === 'pdf' ? (
                                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatFrequency(report.frequency)}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                  {report.format.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>Next: {formatNextRun(report.nextRun)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Schedule Form */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Create New Schedule
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Frequency Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequency
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['daily', 'weekly', 'monthly'].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setFormData({ ...formData, frequency: freq })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.frequency === freq
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {freq}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {freq === 'daily' && 'Every day'}
                                {freq === 'weekly' && 'Every week'}
                                {freq === 'monthly' && 'Every month'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Report Format
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, format: 'pdf' })}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            formData.format === 'pdf'
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <FileText className="w-5 h-5 text-red-500" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              PDF Document
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Professional format
                            </div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setFormData({ ...formData, format: 'excel' })}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            formData.format === 'excel'
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <FileText className="w-5 h-5 text-green-500" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Excel Spreadsheet
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Multi-sheet workbook
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        Reports will be automatically generated and sent to your registered email address.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedule}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{loading ? 'Scheduling...' : 'Schedule Report'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportScheduler;
