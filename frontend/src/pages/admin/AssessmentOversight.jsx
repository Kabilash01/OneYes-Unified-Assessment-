import { useState, useEffect } from 'react';
import { Search, Filter, Flag, Archive, Eye, X, Download } from 'react-feather';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

/**
 * Flag Assessment Validation Schema
 */
const flagSchema = Yup.object().shape({
  reason: Yup.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .required('Reason is required'),
  notes: Yup.string().max(1000, 'Notes must not exceed 1000 characters'),
});

/**
 * AssessmentOversight Component
 * @description Admin page to manage all assessments across the platform
 */
const AssessmentOversight = () => {
  // State
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [flaggedFilter, setFlaggedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const itemsPerPage = 10;

  /**
   * Fetch assessments from API
   */
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        creatorRole: creatorFilter !== 'all' ? creatorFilter : undefined,
        flagged: flaggedFilter !== 'all' ? flaggedFilter === 'yes' : undefined,
      };

      const response = await adminAPI.getAllAssessments(params);
      setAssessments(response.data.assessments || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Fetch assessments when filters change
   */
  useEffect(() => {
    fetchAssessments();
  }, [currentPage, searchTerm, statusFilter, creatorFilter, flaggedFilter]);

  /**
   * Handle search input change
   */
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle flag assessment
   */
  const handleFlagAssessment = async (values, { setSubmitting }) => {
    try {
      await adminAPI.flagAssessment(selectedAssessment._id, {
        isFlagged: !selectedAssessment.isFlagged,
        flagReason: values.reason,
        adminNotes: values.notes,
      });

      toast.success(
        selectedAssessment.isFlagged
          ? 'Assessment unflagged successfully'
          : 'Assessment flagged successfully'
      );

      setShowFlagModal(false);
      setSelectedAssessment(null);
      fetchAssessments();
    } catch (error) {
      console.error('Error flagging assessment:', error);
      toast.error('Failed to update assessment flag');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle archive assessment
   */
  const handleArchiveAssessment = async () => {
    try {
      await adminAPI.flagAssessment(selectedAssessment._id, {
        status: 'archived',
      });

      toast.success('Assessment archived successfully');
      setShowArchiveModal(false);
      setSelectedAssessment(null);
      fetchAssessments();
    } catch (error) {
      console.error('Error archiving assessment:', error);
      toast.error('Failed to archive assessment');
    }
  };

  /**
   * Export assessments to CSV
   */
  const handleExportCSV = () => {
    try {
      // Prepare CSV data
      const headers = [
        'Title',
        'Creator',
        'Status',
        'Type',
        'Duration (min)',
        'Total Marks',
        'Submissions',
        'Flagged',
        'Created Date',
      ];

      const rows = assessments.map((assessment) => [
        assessment.title,
        assessment.createdBy?.name || 'Unknown',
        assessment.status,
        assessment.testType,
        assessment.duration,
        assessment.totalMarks,
        assessment.submissionCount || 0,
        assessment.isFlagged ? 'Yes' : 'No',
        new Date(assessment.createdAt).toLocaleDateString(),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assessments_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Assessments exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export assessments');
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'published':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300';
      case 'archived':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assessment Oversight
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all assessments across the platform
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={assessments.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by title, creator..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Creator Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Creator Role
            </label>
            <select
              value={creatorFilter}
              onChange={(e) => {
                setCreatorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Creators</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Flagged Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flagged
            </label>
            <select
              value={flaggedFilter}
              onChange={(e) => {
                setFlaggedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="yes">Flagged Only</option>
              <option value="no">Not Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No assessments found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {assessments.map((assessment) => (
                    <tr
                      key={assessment._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {assessment.isFlagged && (
                            <Flag size={16} className="text-danger-500 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {assessment.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {assessment.description?.substring(0, 50)}
                              {assessment.description?.length > 50 && '...'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {assessment.createdBy?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {assessment.createdBy?.role || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            assessment.status
                          )}`}
                        >
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">
                        {assessment.testType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {assessment.submissionCount || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => {
                              // TODO: Navigate to assessment details
                              toast.info('View assessment details - Coming soon');
                            }}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Flag/Unflag Button */}
                          <button
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowFlagModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              assessment.isFlagged
                                ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900'
                                : 'text-gray-600 dark:text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title={assessment.isFlagged ? 'Unflag' : 'Flag Assessment'}
                          >
                            <Flag size={16} />
                          </button>

                          {/* Archive Button */}
                          {assessment.status !== 'archived' && (
                            <button
                              onClick={() => {
                                setSelectedAssessment(assessment);
                                setShowArchiveModal(true);
                              }}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-warning-600 dark:hover:text-warning-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Archive Assessment"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Flag Modal */}
      {showFlagModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAssessment.isFlagged ? 'Unflag Assessment' : 'Flag Assessment'}
              </h3>
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setSelectedAssessment(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedAssessment.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                By {selectedAssessment.createdBy?.name || 'Unknown'}
              </div>
            </div>

            {selectedAssessment.isFlagged ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to unflag this assessment? This will remove the flag and
                  associated notes.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowFlagModal(false);
                      setSelectedAssessment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleFlagAssessment({ reason: '', notes: '' }, { setSubmitting: () => {} })}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Unflag
                  </button>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={{ reason: '', notes: '' }}
                validationSchema={flagSchema}
                onSubmit={handleFlagAssessment}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason for Flagging *
                      </label>
                      <Field
                        as="textarea"
                        name="reason"
                        rows={3}
                        placeholder="Enter the reason for flagging this assessment..."
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.reason && touched.reason
                            ? 'border-danger-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.reason && touched.reason && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                          {errors.reason}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Notes
                      </label>
                      <Field
                        as="textarea"
                        name="notes"
                        rows={2}
                        placeholder="Optional additional notes..."
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.notes && touched.notes
                            ? 'border-danger-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.notes && touched.notes && (
                        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                          {errors.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowFlagModal(false);
                          setSelectedAssessment(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-warning-600 rounded-lg hover:bg-warning-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Flagging...' : 'Flag Assessment'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Archive Assessment
              </h3>
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setSelectedAssessment(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedAssessment.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedAssessment.submissionCount || 0} submission(s)
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to archive this assessment? Archived assessments will no
              longer be visible to students but can be restored later.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setSelectedAssessment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveAssessment}
                className="px-4 py-2 text-sm font-medium text-white bg-warning-600 rounded-lg hover:bg-warning-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentOversight;
