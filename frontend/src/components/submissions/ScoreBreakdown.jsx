import React from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, Award } from 'lucide-react';

const ScoreBreakdown = ({ submission }) => {
  const calculateStats = () => {
    const stats = {
      totalQuestions: submission.answers?.length || 0,
      answeredQuestions: 0,
      mcqCorrect: 0,
      mcqIncorrect: 0,
      mcqTotal: 0,
      writtenTotal: 0,
      writtenPending: 0,
      mcqScore: 0,
      writtenScore: 0,
      totalScore: submission.score || 0,
      maxScore: submission.assessmentId?.totalMarks || 0
    };

    submission.answers?.forEach(answer => {
      if (answer.answer !== null && answer.answer !== undefined && answer.answer !== '') {
        stats.answeredQuestions++;
      }

      if (answer.questionType === 'mcq-single' || answer.questionType === 'mcq-multiple') {
        stats.mcqTotal++;
        if (answer.evaluation?.isCorrect) {
          stats.mcqCorrect++;
          stats.mcqScore += answer.evaluation.marksAwarded || 0;
        } else if (answer.evaluation?.status !== 'pending') {
          stats.mcqIncorrect++;
        }
      } else {
        stats.writtenTotal++;
        if (answer.evaluation?.status === 'pending') {
          stats.writtenPending++;
        } else {
          stats.writtenScore += answer.evaluation?.marksAwarded || 0;
        }
      }
    });

    stats.percentage = stats.maxScore > 0 
      ? ((stats.totalScore / stats.maxScore) * 100).toFixed(1)
      : 0;

    stats.mcqPercentage = stats.mcqTotal > 0
      ? ((stats.mcqCorrect / stats.mcqTotal) * 100).toFixed(1)
      : 0;

    return stats;
  };

  const stats = calculateStats();

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(parseFloat(stats.percentage));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        Performance Breakdown
      </h2>

      {/* Overall Score */}
      <div className="mb-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Overall Score</p>
            <p className="mt-1 text-4xl font-bold text-blue-900">
              {stats.totalScore}/{stats.maxScore}
            </p>
            <p className="mt-1 text-2xl font-semibold text-blue-700">{stats.percentage}%</p>
          </div>
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${gradeInfo.bg}`}>
            <span className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
          </div>
        </div>
      </div>

      {/* Question Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
            <CheckCircle className="h-4 w-4" />
            Answered
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.answeredQuestions}/{stats.totalQuestions}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
            <Award className="h-4 w-4" />
            Completion
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalQuestions > 0 
              ? ((stats.answeredQuestions / stats.totalQuestions) * 100).toFixed(0)
              : 0}%
          </p>
        </div>
      </div>

      {/* MCQ Performance */}
      {stats.mcqTotal > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Multiple Choice Questions</h3>
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Accuracy</span>
              <span className="text-xl font-bold text-green-700">{stats.mcqPercentage}%</span>
            </div>
            <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${stats.mcqPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Correct</p>
                  <p className="text-lg font-bold text-green-700">{stats.mcqCorrect}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Incorrect</p>
                  <p className="text-lg font-bold text-red-700">{stats.mcqIncorrect}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">MCQ Score</span>
                <span className="text-sm font-bold text-green-700">{stats.mcqScore} marks</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Written Answers Performance */}
      {stats.writtenTotal > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Written Answers</h3>
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Questions</span>
              <span className="text-xl font-bold text-blue-700">{stats.writtenTotal}</span>
            </div>
            
            {stats.writtenPending > 0 && (
              <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-700">
                    {stats.writtenPending} {stats.writtenPending === 1 ? 'answer' : 'answers'} pending evaluation
                  </span>
                </div>
              </div>
            )}

            {stats.writtenPending < stats.writtenTotal && (
              <div className="pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Written Score</span>
                  <span className="text-sm font-bold text-blue-700">{stats.writtenScore} marks</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;
