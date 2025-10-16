import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/useCommon';
import { formatDate, formatDateTime, getStatusColor } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Spinner, Skeleton } from '../../components/common/Loader';

/**
 * StudentSubmissions Component
 * @description View all submissions with filtering
 */
const StudentSubmissions = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, evaluated
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination();

  /**
   * Fetch submissions
   */
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(activeTab !== 'all' && { 
          status: activeTab === 'pending' ? 'submitted' : 'evaluated' 
        }),
      };

      const response = await studentAPI.getSubmissions(params);
      setSubmissions(response.data.submissions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, activeTab]);

  /**
   * Handle tab change
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  /**
   * View submission details
   */
  const viewSubmission = (submissionId) => {
    navigate(`/student/submissions/${submissionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Submissions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your assessment submissions and results
        </p>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton
            active={activeTab === 'all'}
            onClick={() => handleTabChange('all')}
          >
            All Submissions
          </TabButton>
          <TabButton
            active={activeTab === 'pending'}
            onClick={() => handleTabChange('pending')}
          >
            Pending Evaluation
          </TabButton>
          <TabButton
            active={activeTab === 'evaluated'}
            onClick={() => handleTabChange('evaluated')}
          >
            Evaluated
          </TabButton>
        </div>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Submissions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {activeTab === 'all'
              ? 'You haven\'t submitted any assessments yet'
              : activeTab === 'pending'
              ? 'No submissions pending evaluation'
              : 'No evaluated submissions'}
          </p>
          <Button onClick={() => navigate('/student/assessments')}>
            Browse Assessments
          </Button>
        </Card>
      ) : (
        /* Submissions List */
        <>
          <div className="space-y-4 mb-6">
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission._id}
                submission={submission}
                onClick={() => viewSubmission(submission._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * TabButton Component
 */
const TabButton = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 font-medium text-sm transition-colors
        ${active
          ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }
      `}
    >
      {children}
    </button>
  );
};

/**
 * SubmissionCard Component
 */
const SubmissionCard = ({ submission, onClick }) => {
  const assessment = submission.assessmentId;
  const scorePercentage = assessment?.totalMarks 
    ? ((submission.score / assessment.totalMarks) * 100).toFixed(1)
    : 0;

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="flex items-center justify-between">
        {/* Left: Assessment Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {assessment?.title || 'Assessment'}
            </h3>
            <Badge variant={getStatusColor(submission.status)}>
              {submission.status === 'in-progress' && 'In Progress'}
              {submission.status === 'submitted' && 'Pending Evaluation'}
              {submission.status === 'evaluated' && 'Evaluated'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            {/* Submitted Date */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {submission.submittedAt 
                  ? `Submitted: ${formatDate(submission.submittedAt)}`
                  : `Started: ${formatDate(submission.startedAt)}`
                }
              </span>
            </div>

            {/* Score */}
            {submission.status === 'evaluated' && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Score: <span className={`font-semibold ${getScoreColor(scorePercentage)}`}>
                    {submission.score}/{assessment?.totalMarks} ({scorePercentage}%)
                  </span>
                </span>
              </div>
            )}

            {/* Evaluation Date */}
            {submission.evaluatedAt && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Evaluated: {formatDate(submission.evaluatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: View Details Button */}
        <div className="ml-4">
          <Button variant="outline" size="sm">
            View Details →
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default StudentSubmissions;
