import React from 'react';
import { CheckCircle, Circle, Flag } from 'lucide-react';

const QuestionNavigator = ({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onQuestionClick,
  answeredCount,
  totalQuestions
}) => {
  const getQuestionStatus = (question, index) => {
    const questionId = question._id.toString();
    const isAnswered = answers[question._id] !== undefined && answers[question._id] !== null && answers[question._id] !== '';
    const isMarked = markedForReview.has(questionId);
    const isCurrent = index === currentIndex;

    return {
      isAnswered,
      isMarked,
      isCurrent
    };
  };

  return (
    <div className="p-6">
      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Question Navigator
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">Answered</span>
            <span className="font-semibold text-green-700">{answeredCount}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Not Answered</span>
            <span className="font-semibold text-gray-700">
              {totalQuestions - answeredCount}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg">
            <span className="text-gray-700">Marked for Review</span>
            <span className="font-semibold text-yellow-700">
              {markedForReview.size}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 border-2 border-green-500 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
              <Circle className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-gray-600">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border-2 border-blue-500"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 border-2 border-yellow-500 flex items-center justify-center">
              <Flag className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-gray-600">Marked for Review</span>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          All Questions
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const { isAnswered, isMarked, isCurrent } = getQuestionStatus(question, index);

            return (
              <button
                key={question._id}
                onClick={() => onQuestionClick(index)}
                className={`
                  relative h-10 w-10 rounded-lg font-medium text-sm transition-all
                  flex items-center justify-center
                  ${isCurrent
                    ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-md scale-110'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 border-2 border-green-500 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                  }
                `}
              >
                {isAnswered ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
                
                {isMarked && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Jump */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Jump</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              const firstUnanswered = questions.findIndex((q, i) => !answers[q._id]);
              if (firstUnanswered !== -1) onQuestionClick(firstUnanswered);
            }}
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            First Unanswered
          </button>
          
          <button
            onClick={() => {
              const firstMarked = questions.findIndex((q) => 
                markedForReview.has(q._id.toString())
              );
              if (firstMarked !== -1) onQuestionClick(firstMarked);
            }}
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            First Marked
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;
