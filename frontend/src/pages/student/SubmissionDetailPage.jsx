import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, User, FileText, TrendingUp, 
  Download, Loader2, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { submissionService } from '../../services/submissionService';
import QuestionReview from '../../components/submissions/QuestionReview';
import ScoreBreakdown from '../../components/submissions/ScoreBreakdown';

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('answers');

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionService.getSubmissionDetails(id);
      setSubmission(response.data.submission);
    } catch (error) {
      console.error('Failed to load submission:', error);
      toast.error('Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.success('PDF export coming soon!');
    // TODO: Implement PDF export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <p className="text-lg font-medium text-gray-900">Submission not found</p>
          <button
            onClick={() => navigate('/student/submissions')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  const assessment = submission.assessmentId;
  const hasPendingEvaluation = submission.answers?.some(
    a => a.evaluation?.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/submissions')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Submissions
        </button>

        {/* Header */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment?.title || 'Untitled Assessment'}
              </h1>
              {assessment?.description && (
                <p className="text-sm text-gray-600 mb-4">{assessment.description}</p>
              )}
              {assessment?.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {assessment.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Instructor</p>
                <p className="text-sm font-medium text-gray-900">
                  {assessment?.instructorId?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Submitted On</p>
                <p className="text-sm font-medium text-gray-900">
                  {submission.submittedAt
                    ? format(new Date(submission.submittedAt), 'MMM dd, yyyy')
                    : 'Not submitted'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Time Taken</p>
                <p className="text-sm font-medium text-gray-900">
                  {submission.timeTaken
                    ? `${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Questions</p>
                <p className="text-sm font-medium text-gray-900">
                  {submission.answers?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Evaluation Warning */}
          {hasPendingEvaluation && (
            <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Some answers are pending evaluation
                  </p>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your instructor is currently reviewing your written answers. 
                    Your final score may change once all answers are evaluated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-6">
              <button
                onClick={() => setActiveTab('answers')}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'answers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                Your Answers
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'performance'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Performance
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            {submission.answers?.map((answer, index) => {
              const question = {
                questionNumber: index + 1,
                text: answer.questionText,
                type: answer.questionType,
                marks: answer.marks,
                options: answer.options,
                correctAnswers: answer.correctAnswers
              };

              return (
                <QuestionReview
                  key={answer._id}
                  question={question}
                  answer={answer.answer}
                  evaluation={answer.evaluation}
                />
              );
            })}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ScoreBreakdown submission={submission} />
            </div>
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      submission.status === 'evaluated'
                        ? 'bg-green-100 text-green-700'
                        : submission.status === 'submitted'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {submission.status === 'evaluated'
                        ? 'Evaluated'
                        : submission.status === 'submitted'
                        ? 'Pending'
                        : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attempt</span>
                    <span className="text-sm font-medium text-gray-900">1st</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium text-gray-900">
                      {assessment?.duration || 0} mins
                    </span>
                  </div>
                  {submission.evaluatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Evaluated On</span>
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(submission.evaluatedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment Info */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Assessment Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Total Marks</span>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {assessment?.totalMarks || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Passing Marks</span>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {assessment?.passingMarks || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Questions</span>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {submission.answers?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetailPage;
