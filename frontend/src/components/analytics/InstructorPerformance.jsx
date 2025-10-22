import React, { useState } from 'react';
import { Award, TrendingUp, Users, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import ChartContainer from './ChartContainer';

const InstructorPerformance = ({ data, loading, error, onRetry }) => {
  const [sortBy, setSortBy] = useState('avgScore');
  const [sortOrder, setSortOrder] = useState('desc');

  if (!data) return null;

  const instructorPerformance = data?.instructorPerformance || [];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedInstructors = () => {
    return [...instructorPerformance].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'instructorName') {
        aVal = (a.instructorName || '').toLowerCase();
        bVal = (b.instructorName || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const sortedInstructors = getSortedInstructors();

  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-indigo-600" /> : 
      <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  const getPerformanceBadge = (score) => {
    if (score >= 85) {
      return <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">Excellent</span>;
    }
    if (score >= 75) {
      return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">Good</span>;
    }
    if (score >= 60) {
      return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full font-medium">Average</span>;
    }
    return <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full font-medium">Needs Improvement</span>;
  };

  // Calculate platform averages
  const platformAvgScore = instructorPerformance.length > 0
    ? instructorPerformance.reduce((sum, i) => sum + (i.avgScore || 0), 0) / instructorPerformance.length
    : 0;

  const totalAssessments = instructorPerformance.reduce((sum, i) => sum + (i.totalAssessments || 0), 0);
  const totalSubmissions = instructorPerformance.reduce((sum, i) => sum + (i.totalSubmissions || 0), 0);

  // Top performers
  const topPerformers = [...instructorPerformance]
    .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
    .slice(0, 3);

  return (
    <ChartContainer
      title="Instructor Performance"
      subtitle="Compare instructor effectiveness and student outcomes"
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      <div className="space-y-6">
        {/* Platform Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Platform Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {platformAvgScore.toFixed(1)}%
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
              <FileText className="w-4 h-4" />
              <span>Total Assessments</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalAssessments}
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
              <Users className="w-4 h-4" />
              <span>Total Submissions</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalSubmissions}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Top Performing Instructors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((instructor, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const colors = [
                  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                  'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
                  'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                ];
                
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${colors[index]}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{medals[index]}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {instructor.instructorName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Rank #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {instructor.avgScore?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Assessments:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {instructor.totalAssessments}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Students:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {instructor.uniqueStudents}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructor Comparison Table */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            All Instructors
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Rank
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('instructorName')}
                  >
                    <div className="flex items-center gap-2">
                      Instructor
                      <SortIndicator field="instructorName" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('totalAssessments')}
                  >
                    <div className="flex items-center gap-2">
                      Assessments
                      <SortIndicator field="totalAssessments" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('totalSubmissions')}
                  >
                    <div className="flex items-center gap-2">
                      Submissions
                      <SortIndicator field="totalSubmissions" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('uniqueStudents')}
                  >
                    <div className="flex items-center gap-2">
                      Students
                      <SortIndicator field="uniqueStudents" />
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('avgScore')}
                  >
                    <div className="flex items-center gap-2">
                      Avg Score
                      <SortIndicator field="avgScore" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedInstructors.map((instructor, index) => (
                  <tr 
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {instructor.instructorName || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {instructor.totalAssessments || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {instructor.totalSubmissions || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {instructor.uniqueStudents || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full ${
                              instructor.avgScore >= 85 ? 'bg-green-500' :
                              instructor.avgScore >= 75 ? 'bg-blue-500' :
                              instructor.avgScore >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${instructor.avgScore || 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white w-12">
                          {instructor.avgScore?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getPerformanceBadge(instructor.avgScore || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedInstructors.length === 0 && (
          <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <p>No instructor performance data available</p>
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

export default InstructorPerformance;
