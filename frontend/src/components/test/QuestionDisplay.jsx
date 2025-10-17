import React from 'react';
import { Flag } from 'lucide-react';
import MCQQuestion from './MCQQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import LongAnswerQuestion from './LongAnswerQuestion';

const QuestionDisplay = ({
  question,
  answer,
  onAnswerChange,
  questionNumber,
  isMarkedForReview,
  onToggleMarkForReview
}) => {
  const renderQuestion = () => {
    const props = {
      question,
      answer,
      onAnswerChange: (ans) => onAnswerChange(question._id, ans)
    };

    switch (question.type) {
      case 'mcq':
        return <MCQQuestion {...props} />;
      case 'short':
        return <ShortAnswerQuestion {...props} />;
      case 'long':
        return <LongAnswerQuestion {...props} />;
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
              {questionNumber}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {question.type === 'mcq' ? 'Multiple Choice' : question.type === 'short' ? 'Short Answer' : 'Long Answer'}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {question.questionText}
          </h3>
        </div>

        {/* Mark for Review */}
        <button
          onClick={onToggleMarkForReview}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isMarkedForReview
              ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Flag className={`h-4 w-4 ${isMarkedForReview ? 'fill-current' : ''}`} />
          {isMarkedForReview ? 'Marked' : 'Mark for Review'}
        </button>
      </div>

      {/* Question Content */}
      <div className="mt-6">
        {renderQuestion()}
      </div>
    </div>
  );
};

export default QuestionDisplay;
