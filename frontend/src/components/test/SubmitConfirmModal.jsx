import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const SubmitConfirmModal = ({ answeredCount, totalQuestions, onConfirm, onCancel }) => {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Submission
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {unansweredCount > 0 && (
            <div className="flex items-start gap-3 p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900">
                  You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}
                </p>
                <p className="text-yellow-700 mt-1">
                  Are you sure you want to submit?
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Questions</span>
              <span className="font-semibold text-gray-900">{totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Answered</span>
              <span className="font-semibold text-green-700">{answeredCount}</span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">Unanswered</span>
                <span className="font-semibold text-red-700">{unansweredCount}</span>
              </div>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Once submitted, you cannot modify your answers. Please review your responses before confirming.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Review Answers
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmModal;
