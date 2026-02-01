import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag, AlertCircle, Bookmark, BookmarkCheck, Shield, ShieldCheck
} from 'lucide-react';
import { 
  getAptitudeTestById, 
  getQuestionsForTest, 
  submitTestAttempt,
  saveInProgressAttempt,
  getInProgressAttempt,
  clearInProgressAttempt
} from '../services/aptitude.service';
import { Card, SkeletonQuestion } from '../components';
import type { IAptitudeTest, IAptitudeQuestion } from '../types/models';

// Constants
const MOCK_USER_ID = '2'; // TODO: Replace with actual authenticated user ID
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * TestTakePage Component
 * 
 * Full-screen test-taking interface with:
 * - Countdown timer with auto-submit
 * - Auto-save progress every 30 seconds
 * - Question bookmarking/flagging
 * - Answer confidence levels
 * - Loading skeleton screens
 */
const TestTakePage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [test, setTest] = useState<IAptitudeTest | null>(null);
  const [questions, setQuestions] = useState<IAptitudeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidenceLevels, setConfidenceLevels] = useState<Record<string, boolean>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const autoSaveRef = useRef<number | null>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  // Load test data and check for in-progress attempt
  useEffect(() => {
    if (!testId) {
      console.error('No test ID provided');
      navigate('/aptitude');
      return;
    }

    try {
      setIsLoading(true);
      const foundTest = getAptitudeTestById(testId);
      if (!foundTest) {
        console.error(`Test not found: ${testId}`);
        navigate('/aptitude');
        return;
      }

      const testQuestions = getQuestionsForTest(testId);
      if (testQuestions.length === 0) {
        console.error('No questions found for test');
        navigate('/aptitude');
        return;
      }

      setTest(foundTest);
      setQuestions(testQuestions);

      // Check for in-progress attempt
      const inProgress = getInProgressAttempt(testId, MOCK_USER_ID);
      if (inProgress) {
        const shouldResume = confirm(
          `You have an in-progress attempt from ${new Date(inProgress.lastSavedAt).toLocaleString()}.\n\nWould you like to resume?`
        );
        
        if (shouldResume) {
          setCurrentQuestionIndex(inProgress.currentQuestionIndex);
          setAnswers(inProgress.answers);
          setConfidenceLevels(inProgress.confidenceLevels);
          setBookmarkedQuestions(inProgress.bookmarkedQuestions);
          setTimeRemaining(inProgress.timeRemaining);
          startTimeRef.current = inProgress.startedAt;
        } else {
          clearInProgressAttempt(testId, MOCK_USER_ID);
          setTimeRemaining(foundTest.duration * SECONDS_PER_MINUTE);
        }
      } else {
        setTimeRemaining(foundTest.duration * SECONDS_PER_MINUTE);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading test:', error);
      navigate('/aptitude');
    }
  }, [testId, navigate]);

  // Auto-save progress
  const autoSaveProgress = useCallback(() => {
    if (!testId) return;
    
    saveInProgressAttempt(testId, MOCK_USER_ID, {
      currentQuestionIndex,
      answers,
      confidenceLevels,
      bookmarkedQuestions,
      timeRemaining,
      startedAt: startTimeRef.current,
      lastSavedAt: new Date().toISOString(),
    });
    setLastSaved(new Date());
  }, [testId, currentQuestionIndex, answers, confidenceLevels, bookmarkedQuestions, timeRemaining]);

  // Auto-save interval
  useEffect(() => {
    autoSaveRef.current = window.setInterval(autoSaveProgress, AUTO_SAVE_INTERVAL);
    
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [autoSaveProgress]);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!testId) {
        throw new Error('Test ID is required');
      }

      // Convert answers to required format with confidence levels
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
        isConfident: confidenceLevels[questionId] || false,
      }));

      // Submit attempt with bookmarks
      const attempt = submitTestAttempt(testId, MOCK_USER_ID, formattedAnswers);
      attempt.bookmarkedQuestions = bookmarkedQuestions;
      
      // Clear in-progress attempt
      clearInProgressAttempt(testId, MOCK_USER_ID);
      
      // Navigate to results
      navigate(`/aptitude/results/${attempt._id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitting(false);
      // TODO: Show user-friendly error modal
    }
  }, [isSubmitting, answers, bookmarkedQuestions, confidenceLevels, testId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, TIMER_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, handleSubmit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleConfidence = (questionId: string) => {
    setConfidenceLevels(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };


  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionId: string) => {
    return Object.hasOwn(answers, questionId);
  };

  const isQuestionBookmarked = (questionId: string) => {
    return bookmarkedQuestions.includes(questionId);
  };

  const isQuestionConfident = (questionId: string) => {
    return confidenceLevels[questionId] || false;
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div>
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-24 h-10 bg-gray-200 rounded-lg" />
                <div className="w-32 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonQuestion />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load test</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const unansweredCount = questions.length - answeredCount;
  const bookmarkedCount = bookmarkedQuestions.length;
  const confidentCount = Object.values(confidenceLevels).filter(Boolean).length;
  const timeWarning = timeRemaining < 60; // Less than 1 minute

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  navigate('/aptitude');
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{test.title}</h1>
              <p className="text-xs text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              timeWarning ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Clock className={`w-4 h-4 ${timeWarning ? 'text-red-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-mono font-medium ${
                timeWarning ? 'text-red-700' : 'text-gray-700'
              }`}>
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Flag className="w-4 h-4" />
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Question */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question Card */}
            <Card className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Question {currentQuestionIndex + 1}
                    </span>
                    {isQuestionAnswered(currentQuestion._id) && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                        Answered
                      </span>
                    )}
                    {isQuestionBookmarked(currentQuestion._id) && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium flex items-center gap-1">
                        <Bookmark className="w-3 h-3" />
                        Flagged
                      </span>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmark(currentQuestion._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isQuestionBookmarked(currentQuestion._id)
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Flag for review"
                    >
                      {isQuestionBookmarked(currentQuestion._id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion._id] === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion._id, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          isSelected
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm ${
                            isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                          }`}>
                            {option}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Confidence Level */}
              {isQuestionAnswered(currentQuestion._id) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleConfidence(currentQuestion._id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg w-full transition-all ${
                      isQuestionConfident(currentQuestion._id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {isQuestionConfident(currentQuestion._id) ? (
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Shield className="w-5 h-5 text-gray-500" />
                    )}
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${
                        isQuestionConfident(currentQuestion._id) ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {isQuestionConfident(currentQuestion._id) ? 'Confident Answer' : 'Mark as Confident'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Track your confidence level for better analysis
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-gray-500">
                {currentQuestionIndex + 1} / {questions.length}
              </span>

              <button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right - Overview */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium text-green-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unanswered:</span>
                  <span className="font-medium text-orange-600">{unansweredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flagged:</span>
                  <span className="font-medium text-yellow-600">{bookmarkedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confident:</span>
                  <span className="font-medium text-blue-600">{confidentCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">{questions.length}</span>
                </div>
              </div>
              
              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Auto-saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago
                  </div>
                </div>
              )}
            </Card>

            {/* Question Grid */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = isQuestionAnswered(q._id);
                  const isBookmarked = isQuestionBookmarked(q._id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={q._id}
                      onClick={() => goToQuestion(index)}
                      className={`relative aspect-square rounded-lg text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2'
                          : isAnswered
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={`Question ${index + 1}${isAnswered ? ' - Answered' : ''}${isBookmarked ? ' - Flagged' : ''}`}
                    >
                      {index + 1}
                      {isBookmarked && (
                        <Bookmark className="w-3 h-3 absolute -top-1 -right-1 fill-yellow-500 text-yellow-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary-600" />
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-100" />
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100" />
                  <span className="text-gray-600">Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-gray-600">Flagged</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Test?</h3>
              
              {unansweredCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      {unansweredCount} question{unansweredCount > 1 ? 's' : ''} unanswered
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      You can still submit, but unanswered questions will be marked incorrect.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-medium text-gray-900">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span className="font-medium text-green-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged for Review:</span>
                  <span className="font-medium text-yellow-600">{bookmarkedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marked Confident:</span>
                  <span className="font-medium text-blue-600">{confidentCount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Review Again
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestTakePage;
