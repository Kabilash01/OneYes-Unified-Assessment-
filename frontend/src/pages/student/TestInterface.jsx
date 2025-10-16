import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useTimer, useAutoSave } from '../../hooks/useTimerAndAutoSave';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';

/**
 * TestInterface Component
 * @description Main test-taking interface with timer and auto-save
 */
const TestInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Timer hook
   */
  const { formattedTime, start: startTimer } = useTimer(
    assessment?.duration || 60,
    handleTimeExpire
  );

  /**
   * Auto-save hook
   */
  const { isSaving, lastSaved } = useAutoSave(
    saveCurrentAnswer,
    { questionIndex: currentQuestionIndex, answer: answers[currentQuestionIndex] },
    30000 // 30 seconds
  );

  /**
   * Load assessment and create/resume submission
   */
  useEffect(() => {
    const initializeTest = async () => {
      try {
        // Get assessment details
        const assessmentResponse = await studentAPI.getAssessmentById(id);
        setAssessment(assessmentResponse.data.assessment);

        // Start or resume submission
        const submissionResponse = await studentAPI.startAssessment(id);
        const sub = submissionResponse.data.submission;
        setSubmission(sub);

        // Load existing answers if resuming
        if (sub.answers && sub.answers.length > 0) {
          const existingAnswers = {};
          sub.answers.forEach((ans, index) => {
            existingAnswers[index] = ans.answer;
          });
          setAnswers(existingAnswers);
        }

        startTimer();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load assessment');
        navigate('/student/assessments');
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [id]);

  /**
   * Save current answer to backend
   */
  async function saveCurrentAnswer(data) {
    if (!submission || data.answer === undefined) return;

    try {
      const questionId = assessment.questions[data.questionIndex]._id;
      await studentAPI.saveAnswer(submission._id, {
        questionId,
        answer: data.answer,
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Handle answer change
   */
  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value,
    });
  };

  /**
   * Navigate to question
   */
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  /**
   * Navigate to next question
   */
  const goToNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  /**
   * Navigate to previous question
   */
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  /**
   * Handle time expire
   */
  function handleTimeExpire() {
    toast.warning('Time expired! Auto-submitting assessment...');
    handleSubmit();
  }

  /**
   * Submit assessment
   */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await studentAPI.submitAssessment(submission._id);
      toast.success('Assessment submitted successfully!');
      navigate(`/student/submissions/${submission._id}`, {
        state: { submission: response.data.submission },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading assessment..." />;
  }

  if (!assessment || !submission) {
    return null;
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
  const totalQuestions = assessment.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Assessment Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {assessment.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>

            {/* Timer and Actions */}
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              {isSaving ? (
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : lastSaved ? (
                <div className="text-sm text-green-600 dark:text-green-400">
                  <svg className="inline h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved
                </div>
              ) : null}

              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono text-lg font-bold text-red-600 dark:text-red-400">
                  {formattedTime}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                variant="success"
                onClick={() => setShowSubmitModal(true)}
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                {currentQuestion.type === 'mcq' ? (
                  <MCQAnswer
                    options={currentQuestion.options}
                    value={answers[currentQuestionIndex]}
                    onChange={handleAnswerChange}
                  />
                ) : currentQuestion.type === 'short' ? (
                  <ShortAnswer
                    value={answers[currentQuestionIndex] || ''}
                    onChange={handleAnswerChange}
                  />
                ) : (
                  <LongAnswer
                    value={answers[currentQuestionIndex] || ''}
                    onChange={handleAnswerChange}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Next →
                </Button>
              </div>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              questions={assessment.questions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              onNavigate={goToQuestion}
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assessment"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to submit this assessment?
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Answered:</strong> {answeredCount} of {totalQuestions} questions
            </p>
            {answeredCount < totalQuestions && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                ⚠️ You have {totalQuestions - answeredCount} unanswered question(s)
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSubmit}
              loading={submitting}
            >
              {submitting ? 'Submitting...' : 'Confirm Submit'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * MCQ Answer Component
 */
const MCQAnswer = ({ options, value, onChange }) => {
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <label
          key={index}
          className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          style={{
            borderColor: value === option ? '#3B82F6' : undefined,
            backgroundColor: value === option ? '#EFF6FF' : undefined,
          }}
        >
          <input
            type="radio"
            name="mcq-answer"
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 mr-3"
          />
          <span className="text-gray-800 dark:text-gray-200">{option}</span>
        </label>
      ))}
    </div>
  );
};

/**
 * Short Answer Component
 */
const ShortAnswer = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={4}
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
    />
  );
};

/**
 * Long Answer Component
 */
const LongAnswer = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your detailed answer here..."
      rows={10}
      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
    />
  );
};

/**
 * Question Navigator Component
 */
const QuestionNavigator = ({ questions, currentIndex, answers, onNavigate, answeredCount, totalQuestions }) => {
  return (
    <Card className="sticky top-24">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Question Navigator
      </h3>
      
      {/* Progress */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          Progress: {answeredCount}/{totalQuestions}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((_, index) => {
          const isAnswered = answers[index] !== undefined && answers[index] !== '';
          const isCurrent = index === currentIndex;

          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`
                aspect-square rounded-lg font-medium text-sm transition-all
                ${isCurrent 
                  ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' 
                  : ''}
                ${isAnswered
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Current</span>
        </div>
      </div>
    </Card>
  );
};

export default TestInterface;
