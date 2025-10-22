import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, User, CheckCircle } from 'lucide-react';
import ChartContainer from './ChartContainer';

const AssessmentDistribution = ({ data, loading, error, onRetry }) => {
  if (!data) return null;

  const distribution = data?.assessmentDistribution || {};
  const bySubject = distribution.bySubject || [];
  const byInstructor = distribution.byInstructor || [];
  const byStatus = distribution.byStatus || {};

  // Prepare subject distribution data
  const subjectData = bySubject.map(s => ({
    name: s.subject || s._id || 'Unknown',
    count: s.count || 0,
    avgScore: s.avgScore || 0
  }));

  // Prepare instructor distribution data
  const instructorData = byInstructor.slice(0, 10).map(i => ({
    name: i.instructorName || 'Unknown',
    count: i.count || 0
  }));

  // Prepare status distribution data
  const statusData = [
    { name: 'Active', value: byStatus.active || 0, color: '#10B981' },
    { name: 'Completed', value: byStatus.completed || 0, color: '#6366F1' },
    { name: 'Draft', value: byStatus.draft || 0, color: '#F59E0B' }
  ];

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.name || label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.value}
              </span>
            </div>
          ))}
          {data.avgScore !== undefined && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.avgScore.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const totalAssessments = statusData.reduce((sum, s) => sum + s.value, 0);

  return (
    <ChartContainer
      title="Assessment Distribution"
      subtitle="How assessments are distributed across subjects and instructors"
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          {statusData.map((status, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${status.color}10`,
                borderColor: `${status.color}40`
              }}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {status.name}
              </div>
              <div className="text-2xl font-bold" style={{ color: status.color }}>
                {status.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {totalAssessments > 0 ? ((status.value / totalAssessments) * 100).toFixed(1) : 0}%
              </div>
            </div>
          ))}
        </div>

        {/* Subject Distribution */}
        {subjectData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Distribution by Subject
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Assessments"
                  radius={[8, 8, 0, 0]}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Instructor Distribution */}
        {instructorData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Top 10 Instructors by Assessments
            </h4>
            <div className="space-y-2">
              {instructorData.map((instructor, index) => {
                const maxCount = Math.max(...instructorData.map(i => i.count));
                const percentage = (instructor.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 text-sm text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {instructor.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {instructor.count} assessments
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subject Performance Summary */}
        {subjectData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Subject Performance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subjectData.slice(0, 6).map((subject, index) => {
                const scoreColor = 
                  subject.avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                  subject.avgScore >= 60 ? 'text-blue-600 dark:text-blue-400' :
                  subject.avgScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400';
                
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {subject.name}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${scoreColor}`}>
                      {subject.avgScore.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

export default AssessmentDistribution;
