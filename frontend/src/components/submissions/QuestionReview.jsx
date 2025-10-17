import React from 'react';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

const QuestionReview = ({ question, answer, evaluation }) => {
  const getQuestionTypeLabel = (type) => {
    const labels = {
      'mcq-single': 'Multiple Choice (Single)',
      'mcq-multiple': 'Multiple Choice (Multiple)',
      'short-answer': 'Short Answer',
      'long-answer': 'Long Answer'
    };
    return labels[type] || type;
  };

  const getResultBadge = () => {
    if (!evaluation || evaluation.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
          <Clock className="h-4 w-4" />
          Pending Review
        </span>
      );
    }

    if (evaluation.isCorrect) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          <Check className="h-4 w-4" />
          Correct ({evaluation.marksAwarded}/{question.marks} marks)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
        <X className="h-4 w-4" />
        Incorrect ({evaluation.marksAwarded}/{question.marks} marks)
      </span>
    );
  };

  const renderAnswer = () => {
    if (!answer) {
      return (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No answer submitted</p>
        </div>
      );
    }

    if (question.type === 'mcq-single' || question.type === 'mcq-multiple') {
      const selectedOptions = Array.isArray(answer) ? answer : [answer];
      const correctOptions = question.correctAnswers || [];

      return (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = selectedOptions.includes(index);
            const isCorrect = correctOptions.includes(index);
            
            let bgColor = 'bg-gray-50';
            let borderColor = 'border-gray-200';
            let icon = null;

            if (evaluation && evaluation.status !== 'pending') {
              if (isCorrect) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-300';
                icon = <Check className="h-5 w-5 text-green-600" />;
              }
              if (isSelected && !isCorrect) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-300';
                icon = <X className="h-5 w-5 text-red-600" />;
              }
            } else if (isSelected) {
              bgColor = 'bg-blue-50';
              borderColor = 'border-blue-300';
            }

            return (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border-2 ${borderColor} ${bgColor} p-3 transition-colors`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-white text-sm font-semibold">
                  {optionLetter}
                </div>
                <span className="flex-1 pt-1">{option}</span>
                {icon && <div className="flex-shrink-0">{icon}</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (question.type === 'short-answer') {
      return (
        <div className={`rounded-lg border p-4 ${
          evaluation?.isCorrect 
            ? 'border-green-300 bg-green-50' 
            : evaluation?.status === 'pending' 
            ? 'border-gray-300 bg-gray-50'
            : 'border-red-300 bg-red-50'
        }`}>
          <p className="whitespace-pre-wrap text-gray-800">{answer}</p>
        </div>
      );
    }

    if (question.type === 'long-answer') {
      return (
        <div className={`rounded-lg border p-4 ${
          evaluation?.status === 'pending' 
            ? 'border-gray-300 bg-gray-50'
            : 'border-blue-300 bg-blue-50'
        }`}>
          <div 
            className="prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      );
    }

    return null;
  };

  const renderCorrectAnswer = () => {
    if (!evaluation || evaluation.status === 'pending' || evaluation.isCorrect) {
      return null;
    }

    if (question.type === 'mcq-single' || question.type === 'mcq-multiple') {
      return (
        <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-800">
            <Check className="h-4 w-4" />
            Correct Answer:
          </p>
          <div className="space-y-2">
            {question.correctAnswers.map((correctIndex) => (
              <div key={correctIndex} className="flex items-center gap-2 text-sm text-green-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold">
                  {String.fromCharCode(65 + correctIndex)}
                </span>
                <span>{question.options[correctIndex]}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFeedback = () => {
    if (!evaluation?.feedback) return null;

    return (
      <div className="mt-4 rounded-lg border border-blue-300 bg-blue-50 p-4">
        <p className="mb-2 text-sm font-semibold text-blue-800">Instructor Feedback:</p>
        <p className="text-sm text-blue-700 whitespace-pre-wrap">{evaluation.feedback}</p>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-gray-900">Question {question.questionNumber}</span>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              {getQuestionTypeLabel(question.type)}
            </span>
            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-3">{question.text}</h3>
        </div>
        {getResultBadge()}
      </div>

      {/* Your Answer */}
      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Your Answer:</h4>
        {renderAnswer()}
      </div>

      {/* Correct Answer (if wrong) */}
      {renderCorrectAnswer()}

      {/* Instructor Feedback */}
      {renderFeedback()}
    </div>
  );
};

export default QuestionReview;
