import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Save, Send, CheckCircle } from 'lucide-react';
import { testService } from '../../services/testService';
import { useTimer } from '../../hooks/useTimer';
import { useAutoSave } from '../../hooks/useAutoSave';
import { toast } from 'react-toastify';
import QuestionDisplay from '../../components/test/QuestionDisplay';
import QuestionNavigator from '../../components/test/QuestionNavigator';
import SubmitConfirmModal from '../../components/test/SubmitConfirmModal';

const TakeTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load assessment and submission
  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    try {
      const data = await testService.startAssessment(id);
      setAssessment(data.data.assessment);
      setSubmission(data.data.submission);

      // Load existing answers
      const existingAnswers = {};
      data.data.submission.answers.forEach(ans => {
        if (ans.answer !== null && ans.answer !== '') {
          existingAnswers[ans.questionId.toString()] = ans.answer;
        }
      });
      setAnswers(existingAnswers);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load assessment');
      navigate('/student/upcoming-tests');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save function
  const saveAnswer = async (data) => {
    if (!submission) return;

    const questionId = assessment.questions[currentQuestionIndex]._id;
    const answer = data[questionId];

    if (answer === undefined) return;

    try {
      await testService.saveAnswer(submission._id, questionId, answer);
    } catch (error) {
      console.error('Failed to save answer:', error);
      throw error;
    }
  };

  // Auto-save hook
  const { isSaving, lastSaved, saveNow } = useAutoSave(saveAnswer, answers, 30000);

  // Timer
  const handleTimeUp = async () => {
    await handleSubmit(true);
  };

  const { timeLeft, formattedTime, start, isWarning, isCritical } = useTimer(
    assessment?.duration || 0,
    handleTimeUp
  );

  // Start timer when assessment loads
  useEffect(() => {
    if (assessment && submission) {
      start();
    }
  }, [assessment, submission, start]);

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate questions
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Mark for review
  const toggleMarkForReview = () => {
    const questionId = assessment.questions[currentQuestionIndex]._id.toString();
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Submit assessment
  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowSubmitModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save current answer before submitting
      await saveNow();

      const result = await testService.submitAssessment(submission._id);
      
      toast.success('Assessment submitted successfully!');
      navigate(`/student/submissions/${submission._id}`, {
        state: { result: result.data }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Prevent page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment || !submission) return null;

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== '' && answers[key] !== null).length;
  const totalQuestions = assessment.questions.length;

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-full">
          {/* Assessment Title */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-3 px-6 py-3 rounded-lg ${
            isCritical 
              ? 'bg-red-100 text-red-700' 
              : isWarning 
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="h-5 w-5" />
            <div className="text-right">
              <div className="text-2xl font-bold font-mono">{formattedTime}</div>
              <div className="text-xs">Time Remaining</div>
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-sm mx-4">
            {isSaving ? (
              <>
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-gray-600">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Saved</span>
              </>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveNow}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Now
            </button>
            
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <QuestionDisplay
              question={currentQuestion}
              answer={answers[currentQuestion._id]}
              onAnswerChange={handleAnswerChange}
              questionNumber={currentQuestionIndex + 1}
              isMarkedForReview={markedForReview.has(currentQuestion._id.toString())}
              onToggleMarkForReview={toggleMarkForReview}
            />

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={goToNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <QuestionNavigator
            questions={assessment.questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            markedForReview={markedForReview}
            onQuestionClick={goToQuestion}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
          />
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          onConfirm={() => handleSubmit(true)}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};

export default TakeTestPage;
