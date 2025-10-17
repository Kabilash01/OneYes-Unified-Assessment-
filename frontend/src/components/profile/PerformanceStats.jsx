import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileService } from '../../services/profileService';
import { Bar, Line } from 'recharts';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceStats = ({ studentId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await profileService.getPerformanceStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
      toast.error('Failed to load performance statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">No performance data yet</p>
        <p className="text-sm text-gray-500">Complete assessments to see your performance statistics</p>
      </div>
    );
  }

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 70) return 'text-blue-600';
    if (grade >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Total Assessments</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalAssessments || 0}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Average Score</p>
          <p className={`mt-2 text-3xl font-bold ${getGradeColor(stats.averageScore || 0)}`}>
            {(stats.averageScore || 0).toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Highest Score</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {(stats.highestScore || 0).toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {(stats.completionRate || 0).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Performance Over Time */}
      {stats.performanceOverTime && stats.performanceOverTime.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Score"
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject-wise Performance */}
      {stats.subjectPerformance && stats.subjectPerformance.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="subject" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar 
                dataKey="averageScore" 
                fill="#3B82F6" 
                name="Average Score"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Assessments */}
      {stats.recentAssessments && stats.recentAssessments.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Assessments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentAssessments.map((assessment, index) => {
                  const percentage = (assessment.score / assessment.totalMarks) * 100;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                        {assessment.subject && (
                          <div className="text-sm text-gray-500">{assessment.subject}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(assessment.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assessment.score}/{assessment.totalMarks}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getGradeColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {stats.strengths && stats.strengths.length > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-green-900 mb-4">
              <Award className="h-5 w-5" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {stats.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {stats.improvements && stats.improvements.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-yellow-900 mb-4">
              <Target className="h-5 w-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {stats.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceStats;
