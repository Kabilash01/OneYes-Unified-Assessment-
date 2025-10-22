import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInstructorAnalytics, useClassAnalytics } from '../../hooks/useAnalytics';
import { BarChart2, Users, FileText, TrendingUp, Award, Clock } from 'lucide-react';
import Loader from '../../components/common/Loader';
import DateRangePicker from '../../components/analytics/DateRangePicker';
import ExportButton from '../../components/analytics/ExportButton';
import ReportScheduler from '../../components/analytics/ReportScheduler';
import ChartContainer from '../../components/analytics/ChartContainer';
import ClassPerformanceChart from '../../components/analytics/ClassPerformanceChart';
import AssessmentDifficultyChart from '../../components/analytics/AssessmentDifficultyChart';

const InstructorAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  const { data: overviewData, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useInstructorAnalytics(user?._id, dateRange);
  const { data: classData, loading: classLoading, error: classError, refetch: refetchClass } = useClassAnalytics(selectedAssessment);

  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{overviewError}</p>
          <button
            onClick={refetchOverview}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overview = overviewData?.overview || {};
  const assessments = overviewData?.assessments || [];
  const submissionPatterns = overviewData?.submissionPatterns || {};

  // Prepare assessment options for dropdown
  const assessmentOptions = assessments.map(a => ({
    value: a._id,
    label: a.title,
    totalSubmissions: a.totalSubmissions,
    avgScore: a.avgScore
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Instructor Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor class performance and assessment effectiveness
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={setDateRange}
            />
            <ExportButton
              reportType="instructor"
              filters={dateRange}
              instructorId={user?._id}
            />
            <ReportScheduler
              reportType="instructor"
              filters={{ instructorId: user?._id }}
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {overview.totalAssessments || 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {overview.totalSubmissions || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Class Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {overview.avgScore?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {overview.uniqueStudents || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Assessment to Analyze
              </label>
              <select
                value={selectedAssessment || ''}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Select an assessment --</option>
                {assessmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.totalSubmissions} submissions, Avg: {option.avgScore?.toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>
            {selectedAssessment && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BarChart2 className="w-4 h-4" />
                <span>Detailed analytics below</span>
              </div>
            )}
          </div>
        </div>

        {/* Submission Patterns */}
        {submissionPatterns.hourlyPattern && submissionPatterns.hourlyPattern.length > 0 && (
          <ChartContainer
            title="Submission Patterns"
            subtitle="When do students submit their assessments?"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Pattern */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Submissions by Hour
                </h4>
                <div className="space-y-2">
                  {submissionPatterns.hourlyPattern.map((hour) => {
                    const maxCount = Math.max(...submissionPatterns.hourlyPattern.map(h => h.count));
                    const percentage = (hour.count / maxCount) * 100;
                    return (
                      <div key={hour._id} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                          {hour._id}:00
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                            style={{ width: `${percentage}%` }}
                          >
                            {hour.count > 0 && hour.count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day of Week Pattern */}
              {submissionPatterns.dayPattern && submissionPatterns.dayPattern.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Submissions by Day
                  </h4>
                  <div className="space-y-2">
                    {submissionPatterns.dayPattern.map((day) => {
                      const maxCount = Math.max(...submissionPatterns.dayPattern.map(d => d.count));
                      const percentage = (day.count / maxCount) * 100;
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <div key={day._id} className="flex items-center gap-3">
                          <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                            {days[day._id]}
                          </div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                              style={{ width: `${percentage}%` }}
                            >
                              {day.count > 0 && day.count}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>
        )}

        {/* Class Performance (only shown when assessment is selected) */}
        {selectedAssessment && (
          <>
            <ClassPerformanceChart
              data={classData}
              loading={classLoading}
              error={classError}
              onRetry={refetchClass}
            />

            <AssessmentDifficultyChart
              assessmentId={selectedAssessment}
            />
          </>
        )}

        {/* Recent Assessments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Assessments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Assessment
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Submissions
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Avg Score
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {assessments.slice(0, 10).map((assessment) => {
                  const percentage = (assessment.avgScore / assessment.totalMarks) * 100;
                  const statusColor = 
                    percentage >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                  
                  return (
                    <tr
                      key={assessment._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedAssessment(assessment._id)}
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {assessment.title}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {assessment.subject}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {assessment.totalSubmissions}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {assessment.avgScore?.toFixed(1)} / {assessment.totalMarks}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {percentage >= 75 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalyticsDashboard;
