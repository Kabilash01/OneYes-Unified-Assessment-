import React from 'react';

const ShortAnswerQuestion = ({ question, answer, onAnswerChange }) => {
  const maxLength = 500;
  const currentLength = answer?.length || 0;

  return (
    <div className="space-y-3">
      <textarea
        value={answer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        maxLength={maxLength}
        rows={6}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-600">
          Maximum {maxLength} characters
        </p>
        <p className={`font-medium ${
          currentLength > maxLength * 0.9 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {currentLength} / {maxLength}
        </p>
      </div>
    </div>
  );
};

export default ShortAnswerQuestion;
