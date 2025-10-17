import React from 'react';

const MCQQuestion = ({ question, answer, onAnswerChange }) => {
  const handleOptionChange = (option) => {
    if (question.correctAnswer && Array.isArray(question.correctAnswer)) {
      // Multiple correct answers (checkboxes)
      const currentAnswers = Array.isArray(answer) ? answer : [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(a => a !== option)
        : [...currentAnswers, option];
      onAnswerChange(newAnswers);
    } else {
      // Single correct answer (radio)
      onAnswerChange(option);
    }
  };

  const isMultiple = question.correctAnswer && Array.isArray(question.correctAnswer) && question.correctAnswer.length > 1;
  const selectedAnswers = Array.isArray(answer) ? answer : (answer ? [answer] : []);

  return (
    <div className="space-y-3">
      {question.options?.map((option, index) => {
        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
        const isSelected = isMultiple 
          ? selectedAnswers.includes(option)
          : answer === option;

        return (
          <label
            key={index}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <input
              type={isMultiple ? 'checkbox' : 'radio'}
              name={`question-${question._id}`}
              checked={isSelected}
              onChange={() => handleOptionChange(option)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                  {optionLetter}
                </span>
                <span className="text-base text-gray-900">{option}</span>
              </div>
            </div>
          </label>
        );
      })}
      
      {isMultiple && (
        <p className="text-sm text-gray-600 mt-4">
          <span className="font-medium">Note:</span> Select all that apply
        </p>
      )}
    </div>
  );
};

export default MCQQuestion;
