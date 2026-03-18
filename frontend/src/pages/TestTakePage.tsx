import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
 * Orchestrates the test-taking experience and delegates UI sections to
 * smaller composable components for easier maintenance.
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
      navigate('/aptitude');
      return;
    }

    const loadTest = async () => {
      try {
        setIsLoading(true);
        const foundTest = await getAptitudeTestById(testId);
        if (!foundTest) {
          navigate('/aptitude');
          return;
        }

        const testQuestions = await getQuestionsForTest(testId);
        if (testQuestions.length === 0) {
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
      } catch {
        navigate('/aptitude');
      }
    };
    loadTest();
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

  const handleSubmit = useCallback(async () => {
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
      const attempt = await submitTestAttempt(testId, MOCK_USER_ID, formattedAnswers);
      (attempt as any).bookmarkedQuestions = bookmarkedQuestions;
      
      // Clear in-progress attempt
      clearInProgressAttempt(testId, MOCK_USER_ID);
      
      toast.success('Test submitted successfully! Redirecting to results...');
      
      // Navigate to results
      navigate(`/aptitude/results/${attempt._id}`);
    } catch {
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
      <div className="min-h-screen bg-gray-50 dark:bg-lc-bg">
        <div className="bg-white dark:bg-lc-surface border-b border-gray-200 dark:border-lc-border px-4 py-3">
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
              <div className="bg-white dark:bg-lc-card rounded-lg border border-gray-200 dark:border-lc-border p-4">
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
          <p className="text-gray-600 dark:text-lc-text-muted">Failed to load test</p>
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

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      navigate('/aptitude');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-lc-bg">
      <TestHeader
        title={test.title}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        timeRemaining={timeRemaining}
        timeWarning={timeWarning}
        formatTime={formatTime}
        onExit={handleExit}
        onOpenSubmit={() => setShowSubmitConfirm(true)}
      />

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuestionPanel
            currentQuestion={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answers={answers}
            isQuestionAnswered={isQuestionAnswered}
            isQuestionBookmarked={isQuestionBookmarked}
            isQuestionConfident={isQuestionConfident}
            onSelectAnswer={handleAnswerSelect}
            onToggleBookmark={toggleBookmark}
            onToggleConfidence={toggleConfidence}
            onGoToQuestion={goToQuestion}
          />

          <OverviewSidebar
            questions={questions}
            currentIndex={currentQuestionIndex}
            answeredCount={answeredCount}
            unansweredCount={unansweredCount}
            bookmarkedCount={bookmarkedCount}
            confidentCount={confidentCount}
            lastSaved={lastSaved}
            isQuestionAnswered={isQuestionAnswered}
            isQuestionBookmarked={isQuestionBookmarked}
            onGoToQuestion={goToQuestion}
          />
        </div>
      </div>

      <SubmitConfirmationModal
        open={showSubmitConfirm}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        bookmarkedCount={bookmarkedCount}
        confidentCount={confidentCount}
        onClose={() => setShowSubmitConfirm(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TestTakePage;

// ────────────────────────────────────────────────────────────
// Presentation Components
// ────────────────────────────────────────────────────────────

interface TestHeaderProps {
  title: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  timeWarning: boolean;
  formatTime: (seconds: number) => string;
  onExit: () => void;
  onOpenSubmit: () => void;
}

const TestHeader = memo(function TestHeader({
  title,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  timeWarning,
  formatTime,
  onExit,
  onOpenSubmit,
}: TestHeaderProps) {
  return (
    <div className="bg-white dark:bg-lc-surface border-b border-gray-200 dark:border-lc-border px-4 py-3 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-lc-elevated rounded-lg transition-colors"
            aria-label="Exit test"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-lc-text-secondary" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-lc-text">{title}</h1>
            <p className="text-xs text-gray-500 dark:text-lc-text-muted">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              timeWarning ? 'bg-red-100 dark:bg-red-900/25' : 'bg-gray-100 dark:bg-lc-elevated'
            }`}
          >
            <Clock
              className={`w-4 h-4 ${timeWarning ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-lc-text-secondary'}`}
              aria-hidden="true"
            />
            <span
              className={`text-sm font-mono font-medium ${
                timeWarning ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-lc-text-secondary'
              }`}
              aria-live="polite"
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          <button
            onClick={onOpenSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Flag className="w-4 h-4" aria-hidden="true" />
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
});

interface QuestionPanelProps {
  currentQuestion: IAptitudeQuestion;
  currentIndex: number;
  totalQuestions: number;
  answers: Record<string, number>;
  isQuestionAnswered: (questionId: string) => boolean;
  isQuestionBookmarked: (questionId: string) => boolean;
  isQuestionConfident: (questionId: string) => boolean;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onToggleBookmark: (questionId: string) => void;
  onToggleConfidence: (questionId: string) => void;
  onGoToQuestion: (index: number) => void;
}

const QuestionPanel = memo(function QuestionPanel({
  currentQuestion,
  currentIndex,
  totalQuestions,
  answers,
  isQuestionAnswered,
  isQuestionBookmarked,
  isQuestionConfident,
  onSelectAnswer,
  onToggleBookmark,
  onToggleConfidence,
  onGoToQuestion,
}: QuestionPanelProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-lc-text-muted">
                Question {currentIndex + 1}
              </span>
              {isQuestionAnswered(currentQuestion._id) && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                  Answered
                </span>
              )}
              {isQuestionBookmarked(currentQuestion._id) && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium flex items-center gap-1">
                  <Bookmark className="w-3 h-3" aria-hidden="true" />
                  Flagged
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleBookmark(currentQuestion._id)}
                className={`p-2 rounded-lg transition-colors ${
                  isQuestionBookmarked(currentQuestion._id)
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-secondary hover:bg-gray-200 dark:hover:bg-lc-border-light'
                }`}
                aria-label={
                  isQuestionBookmarked(currentQuestion._id)
                    ? 'Unflag question'
                    : 'Flag question for review'
                }
              >
                {isQuestionBookmarked(currentQuestion._id) ? (
                  <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Bookmark className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-lc-text leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-3 mb-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestion._id] === index;
            return (
              <button
                key={index}
                onClick={() => onSelectAnswer(currentQuestion._id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-500/15'
                    : 'border-gray-200 dark:border-lc-border hover:border-gray-300 dark:hover:border-lc-border-light bg-white dark:bg-lc-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-lc-border-light'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-sm ${
                        isSelected ? 'text-gray-900 dark:text-lc-text font-medium' : 'text-gray-700 dark:text-lc-text-secondary'
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {isQuestionAnswered(currentQuestion._id) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-lc-border">
            <button
              onClick={() => onToggleConfidence(currentQuestion._id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg w-full transition-all ${
                isQuestionConfident(currentQuestion._id)
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-500/70'
                  : 'bg-gray-50 dark:bg-lc-elevated border-2 border-gray-300 dark:border-lc-border-light hover:border-gray-400 dark:hover:border-lc-border'
              }`}
            >
              {isQuestionConfident(currentQuestion._id) ? (
                <ShieldCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />
              ) : (
                <Shield className="w-5 h-5 text-gray-500 dark:text-lc-text-muted" aria-hidden="true" />
              )}
              <div className="flex-1 text-left">
                <div
                  className={`text-sm font-medium ${
                    isQuestionConfident(currentQuestion._id)
                      ? 'text-blue-900 dark:text-blue-300'
                      : 'text-gray-700 dark:text-lc-text-secondary'
                  }`}
                >
                  {isQuestionConfident(currentQuestion._id)
                    ? 'Confident Answer'
                    : 'Mark as Confident'}
                </div>
                <div className="text-xs text-gray-500 dark:text-lc-text-muted mt-0.5">
                  Track your confidence level for better analysis
                </div>
              </div>
            </button>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onGoToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-lc-card border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </button>

        <span className="text-sm text-gray-500 dark:text-lc-text-muted">
          {currentIndex + 1} / {totalQuestions}
        </span>

        <button
          onClick={() => onGoToQuestion(currentIndex + 1)}
          disabled={currentIndex === totalQuestions - 1}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-lc-card border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

interface OverviewSidebarProps {
  questions: IAptitudeQuestion[];
  currentIndex: number;
  answeredCount: number;
  unansweredCount: number;
  bookmarkedCount: number;
  confidentCount: number;
  lastSaved: Date | null;
  isQuestionAnswered: (questionId: string) => boolean;
  isQuestionBookmarked: (questionId: string) => boolean;
  onGoToQuestion: (index: number) => void;
}

const OverviewSidebar = memo(function OverviewSidebar({
  questions,
  currentIndex,
  answeredCount,
  unansweredCount,
  bookmarkedCount,
  confidentCount,
  lastSaved,
  isQuestionAnswered,
  isQuestionBookmarked,
  onGoToQuestion,
}: OverviewSidebarProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-3">Progress</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-lc-text-muted">Answered:</span>
            <span className="font-medium text-green-600">{answeredCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-lc-text-muted">Unanswered:</span>
            <span className="font-medium text-orange-600">{unansweredCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-lc-text-muted">Flagged:</span>
            <span className="font-medium text-yellow-600">{bookmarkedCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-lc-text-muted">Confident:</span>
            <span className="font-medium text-blue-600">{confidentCount}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-lc-border">
            <span className="text-gray-600 dark:text-lc-text-muted">Total:</span>
            <span className="font-medium text-gray-900 dark:text-lc-text">{questions.length}</span>
          </div>
        </div>

        {lastSaved && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-lc-border">
            <div className="text-xs text-gray-500 dark:text-lc-text-muted flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              Auto-saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-lc-text mb-3">Questions</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const isAnswered = isQuestionAnswered(q._id);
            const isBookmarked = isQuestionBookmarked(q._id);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={q._id}
                onClick={() => onGoToQuestion(index)}
                className={`relative aspect-square rounded-lg text-sm font-medium transition-all ${
                  isCurrent
                    ? 'bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 dark:bg-lc-elevated text-gray-600 dark:text-lc-text-secondary hover:bg-gray-200 dark:hover:bg-lc-border-light'
                }`}
                title={`Question ${index + 1}${
                  isAnswered ? ' - Answered' : ''
                }${isBookmarked ? ' - Flagged' : ''}`}
                aria-label={`Question ${index + 1}${
                  isAnswered ? ', answered' : ', not answered'
                }${isBookmarked ? ', flagged' : ''}`}
              >
                {index + 1}
                {isBookmarked && (
                  <Bookmark
                    className="w-3 h-3 absolute -top-1 -right-1 fill-yellow-500 text-yellow-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-lc-border space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary-600" />
            <span className="text-gray-600 dark:text-lc-text-muted">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100" />
            <span className="text-gray-600 dark:text-lc-text-muted">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-100 dark:bg-lc-elevated" />
            <span className="text-gray-600 dark:text-lc-text-muted">Unanswered</span>
          </div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-3 h-3 fill-yellow-500 text-yellow-500" aria-hidden="true" />
            <span className="text-gray-600 dark:text-lc-text-muted">Flagged</span>
          </div>
        </div>
      </Card>
    </div>
  );
});

interface SubmitConfirmationModalProps {
  open: boolean;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  bookmarkedCount: number;
  confidentCount: number;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const SubmitConfirmationModal = ({
  open,
  totalQuestions,
  answeredCount,
  unansweredCount,
  bookmarkedCount,
  confidentCount,
  onClose,
  onSubmit,
  isSubmitting,
}: SubmitConfirmationModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-test-title"
    >
      <Card className="max-w-md w-full p-6">
        <div className="mb-4">
          <h3 id="submit-test-title" className="text-lg font-semibold text-gray-900 dark:text-lc-text mb-2">
            Submit Test?
          </h3>

          {unansweredCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200 mb-3">
              <AlertCircle
                className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
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

          <div className="space-y-2 text-sm text-gray-600 dark:text-lc-text-muted">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-medium text-gray-900 dark:text-lc-text">{totalQuestions}</span>
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
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-lc-border-light text-gray-700 dark:text-lc-text-secondary rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-lc-elevated transition-colors"
          >
            Review Again
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </Card>
    </div>
  );
};
