import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useClassAnalytics } from '../../hooks/useAnalytics';
import ChartContainer from './ChartContainer';

const QuestionStatistics = ({ assessmentId }) => {
  const { data, loading, error, refetch } = useClassAnalytics(assessmentId);
  const [sortBy, setSortBy] = useState('questionNumber');
  const [sortOrder, setSortOrder] = useState('asc');

  if (!data) return null;

  const questionStats = data?.questionStatistics || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedQuestions = () => {
    return [...questionStats].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const sortedQuestions = getSortedQuestions();

  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? <span className="text-indigo-600">↑</span> : <span className="text-indigo-600">↓</span>;
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDifficultyBadge = (rate) => {
    if (rate >= 70) {
      return <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">Easy</span>;
    }
    if (rate >= 40) {
      return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">Medium</span>;
    }
    return <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">Hard</span>;
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Calculate summary statistics
  const avgSuccessRate = questionStats.length > 0 
    ? questionStats.reduce((sum, q) => sum + (q.successRate || 0), 0) / questionStats.length 
    : 0;
  
  const hardQuestions = questionStats.filter(q => (q.successRate || 0) < 40).length;
  const easyQuestions = questionStats.filter(q => (q.successRate || 0) >= 70).length;

  return (
    <ChartContainer
      title="Question-Level Statistics"
      subtitle={`Detailed analysis of each question's performance (${questionStats.length} questions)`}
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Avg Success Rate</span>
          </div>
          <div className={`text-2xl font-bold ${getPerformanceColor(avgSuccessRate)}`}>
            {avgSuccessRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Easy Questions</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {easyQuestions}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Hard Questions</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {hardQuestions}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span>Total Questions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {questionStats.length}
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th 
                className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('questionNumber')}
              >
                <div className="flex items-center gap-2">
                  Question #
                  <SortIndicator field="questionNumber" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                Question Text
              </th>
              <th 
                className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('successRate')}
              >
                <div className="flex items-center gap-2">
                  Success Rate
                  <SortIndicator field="successRate" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                Correct / Incorrect
              </th>
              <th 
                className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('avgTimeSpent')}
              >
                <div className="flex items-center gap-2">
                  Avg Time
                  <SortIndicator field="avgTimeSpent" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                Difficulty
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedQuestions.map((question, index) => {
              const successRate = question.successRate || 0;
              const correctCount = question.correctCount || 0;
              const incorrectCount = question.incorrectCount || 0;
              const totalAttempts = correctCount + incorrectCount;

              return (
                <tr 
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {question.questionNumber || index + 1}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white max-w-xs truncate">
                    {question.questionText || `Question ${index + 1}`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            successRate >= 70 ? 'bg-green-500' :
                            successRate >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className={`font-semibold ${getPerformanceColor(successRate)}`}>
                        {successRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>{correctCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>{incorrectCount}</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400">
                        ({totalAttempts} total)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(question.avgTimeSpent)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getDifficultyBadge(successRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedQuestions.length === 0 && (
        <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <p>No question statistics available</p>
        </div>
      )}

      {/* Analysis Tips */}
      {hardQuestions > 0 && (
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="font-semibold mb-1">Questions Needing Review</p>
              <p>
                {hardQuestions} question{hardQuestions > 1 ? 's have' : ' has'} a success rate below 40%. 
                Consider reviewing {hardQuestions > 1 ? 'these questions' : 'this question'} to ensure 
                {hardQuestions > 1 ? ' they are' : ' it is'} clear and appropriately difficult, 
                or provide additional learning resources on {hardQuestions > 1 ? 'these topics' : 'this topic'}.
              </p>
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  );
};

export default QuestionStatistics;
