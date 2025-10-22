import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useClassAnalytics } from '../../hooks/useAnalytics';
import ChartContainer from './ChartContainer';

const AssessmentDifficultyChart = ({ assessmentId }) => {
  const { data, loading, error, refetch } = useClassAnalytics(assessmentId);

  if (!data) return null;

  const difficulty = data?.difficulty || {};
  const questionStats = data?.questionStatistics || [];

  // Prepare difficulty data
  const difficultyLevel = difficulty.difficulty || 'medium';
  const difficultyScore = difficulty.difficultyScore || 0;
  const passRate = difficulty.passRate || 0;
  const avgScore = difficulty.avgScore || 0;

  // Difficulty color coding
  const getDifficultyColor = (level) => {
    const colors = {
      easy: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800' },
      medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-800' },
      hard: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-800' }
    };
    return colors[level] || colors.medium;
  };

  const difficultyColors = getDifficultyColor(difficultyLevel);

  // Prepare question difficulty data
  const questionDifficultyData = questionStats.map((q, index) => ({
    question: `Q${index + 1}`,
    successRate: q.successRate || 0,
    avgTime: q.avgTimeSpent || 0,
    difficulty: q.successRate >= 70 ? 'Easy' : q.successRate >= 40 ? 'Medium' : 'Hard'
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.successRate?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.difficulty}
              </span>
            </div>
            {data.avgTime > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.floor(data.avgTime / 60)}m {data.avgTime % 60}s
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get bar color based on success rate
  const getBarColor = (successRate) => {
    if (successRate >= 70) return '#10B981'; // Green - Easy
    if (successRate >= 40) return '#F59E0B'; // Yellow - Medium
    return '#EF4444'; // Red - Hard
  };

  return (
    <div className="space-y-6">
      {/* Overall Difficulty */}
      <div className={`border rounded-lg p-6 ${difficultyColors.bg} ${difficultyColors.border}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assessment Difficulty Analysis
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors.bg} ${difficultyColors.text} border ${difficultyColors.border}`}>
            {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <TrendingDown className="w-4 h-4" />
              <span>Difficulty Score</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {difficultyScore.toFixed(1)}/100
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lower is easier
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Pass Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {passRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Students who passed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Average Score</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgScore.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Class average
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {difficultyLevel === 'easy' && (
                <p>This assessment appears to be relatively easy. Consider adding more challenging questions to better differentiate student abilities.</p>
              )}
              {difficultyLevel === 'medium' && (
                <p>This assessment has a good difficulty balance. Students are appropriately challenged while still able to demonstrate their knowledge.</p>
              )}
              {difficultyLevel === 'hard' && (
                <p>This assessment is quite challenging. Consider reviewing the questions or providing additional study materials to help students prepare better.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Difficulty */}
      {questionDifficultyData.length > 0 && (
        <ChartContainer
          title="Question Difficulty Breakdown"
          subtitle="Success rate per question (higher = easier)"
          loading={loading}
          error={error}
          onRetry={refetch}
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={questionDifficultyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="question" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
                label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="successRate" 
                name="Success Rate (%)"
                radius={[8, 8, 0, 0]}
              >
                {questionDifficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.successRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend for colors */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
              <span className="text-gray-600 dark:text-gray-400">Easy (≥70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
              <span className="text-gray-600 dark:text-gray-400">Medium (40-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
              <span className="text-gray-600 dark:text-gray-400">Hard (&lt;40%)</span>
            </div>
          </div>
        </ChartContainer>
      )}
    </div>
  );
};

export default AssessmentDifficultyChart;
