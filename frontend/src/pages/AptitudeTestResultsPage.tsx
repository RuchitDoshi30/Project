import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, XCircle, CheckCircle, RotateCcw, Home, ChevronDown, ChevronUp, 
  Eye, EyeOff, TrendingUp, Lightbulb, Award, Shield, Bookmark
} from 'lucide-react';
import { 
  getAttemptById, 
  getAptitudeTestById, 
  getQuestionsForTest,
  getCategoryPerformance,
  getSmartRecommendations
} from '../services/aptitude.service';
import { Card, SkeletonResults } from '../components';
import type { IAptitudeAttempt, IAptitudeTest, IAptitudeQuestion, AptitudeCategory } from '../types/models';

// Constants
const CURRENT_USER_ID = '2'; // TODO: Replace with actual authenticated user ID from auth context

// Category color mapping for consistent UI
const CATEGORY_THEME_COLORS: Record<AptitudeCategory, { bg: string; text: string; border: string }> = {
  Quantitative: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Logical: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Verbal: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Technical: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

/**
 * AptitudeTestResultsPage Component
 * 
 * Comprehensive results page featuring:
 * - Score display with pass/fail status
 * - Category-wise performance breakdown with visual indicators
 * - Smart recommendations based on performance analysis
 * - Detailed answer review with explanations
 * - Explanations view mode (expand/collapse all)
 * - Confidence level and bookmark indicators
 */
const AptitudeTestResultsPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [testAttempt, setTestAttempt] = useState<IAptitudeAttempt | null>(null);
  const [aptitudeTest, setAptitudeTest] = useState<IAptitudeTest | null>(null);
  const [testQuestions, setTestQuestions] = useState<IAptitudeQuestion[]>([]);
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  // Load attempt and test data
  useEffect(() => {
    if (!attemptId) {
      console.error('No attempt ID provided');
      navigate('/aptitude');
      return;
    }

    const loadResults = async () => {
      try {
        const foundAttempt = getAttemptById(attemptId, CURRENT_USER_ID);
        if (!foundAttempt) {
          console.error(`Attempt not found: ${attemptId}`);
          navigate('/aptitude');
          return;
        }

        setTestAttempt(foundAttempt);
        
        const foundTest = getAptitudeTestById(foundAttempt.testId);
        if (!foundTest) {
          console.error(`Test not found: ${foundAttempt.testId}`);
          navigate('/aptitude');
          return;
        }

        const questionsInTest = getQuestionsForTest(foundTest._id);
        setAptitudeTest(foundTest);
        setTestQuestions(questionsInTest);
        setIsLoadingResults(false);
      } catch (error) {
        console.error('Error loading results:', error);
        navigate('/aptitude');
      }
    };

    loadResults();
  }, [attemptId, navigate]);

  // Toggle explanations view mode
  useEffect(() => {
    // Use setTimeout to avoid cascading renders
    const timeout = setTimeout(() => {
      if (showAllExplanations && testQuestions.length > 0) {
        setExpandedQuestionIds(new Set(testQuestions.map(q => q._id)));
      } else if (!showAllExplanations) {
        setExpandedQuestionIds(new Set());
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [showAllExplanations, testQuestions]);

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestionIds(prevSet => {
      const updatedSet = new Set(prevSet);
      if (updatedSet.has(questionId)) {
        updatedSet.delete(questionId);
      } else {
        updatedSet.add(questionId);
      }
      return updatedSet;
    });
  };

  const getUserAnswerForQuestion = (questionId: string): number | undefined => {
    const userAnswer = testAttempt?.answers.find(ans => ans.questionId === questionId);
    return userAnswer?.selectedOption;
  };

  const wasAnsweredConfidently = (questionId: string): boolean => {
    const userAnswer = testAttempt?.answers.find(ans => ans.questionId === questionId);
    return userAnswer?.isConfident || false;
  };

  const isAnswerCorrect = (questionId: string): boolean => {
    const question = testQuestions.find(q => q._id === questionId);
    const userAnswer = getUserAnswerForQuestion(questionId);
    return question ? question.correctOptionIndex === userAnswer : false;
  };

  const wasQuestionBookmarked = (questionId: string): boolean => {
    return testAttempt?.bookmarkedQuestions?.includes(questionId) || false;
  };

  // Loading state with skeleton
  if (isLoadingResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-32 h-10 bg-gray-200 rounded-lg" />
                <div className="w-28 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <SkeletonResults />
        </div>
      </div>
    );
  }

  if (!testAttempt || !aptitudeTest || testQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load results</p>
        </div>
      </div>
    );
  }

  const correctAnswersCount = testQuestions.filter(q => isAnswerCorrect(q._id)).length;
  const incorrectAnswersCount = testQuestions.length - correctAnswersCount;
  const scorePercentage = Math.round((correctAnswersCount / testQuestions.length) * 100);
  const categoryPerformanceData = getCategoryPerformance(testAttempt);
  const intelligentRecommendations = getSmartRecommendations(testAttempt);
  
  // Confidence analysis
  const confidentAnswers = testAttempt.answers.filter(a => a.isConfident);
  const confidentCorrectCount = confidentAnswers.filter(a => {
    const question = testQuestions.find(q => q._id === a.questionId);
    return question && question.correctOptionIndex === a.selectedOption;
  }).length;
  const confidenceAccuracy = confidentAnswers.length > 0 
    ? Math.round((confidentCorrectCount / confidentAnswers.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/aptitude')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to tests"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Test Results</h1>
              <p className="text-xs text-gray-500">{aptitudeTest.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllExplanations(!showAllExplanations)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              title={showAllExplanations ? 'Collapse all explanations' : 'Show all explanations'}
            >
              {showAllExplanations ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Hide All</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Show All</span>
                </>
              )}
            </button>
            <button
              onClick={() => navigate(`/aptitude/test/${aptitudeTest._id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Retake</span>
            </button>
            <button
              onClick={() => navigate('/aptitude')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">All Tests</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Score Card */}
        <Card className={`p-8 text-center ${
          testAttempt.passed 
            ? 'bg-gradient-to-br from-green-50 to-white border-green-200' 
            : 'bg-gradient-to-br from-red-50 to-white border-red-200'
        }`}>
          <div className="mb-4">
            {testAttempt.passed ? (
              <Trophy className="w-16 h-16 text-green-600 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            )}
          </div>
          
          <h2 className={`text-3xl font-bold mb-2 ${
            testAttempt.passed ? 'text-green-900' : 'text-red-900'
          }`}>
            {testAttempt.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {testAttempt.passed 
              ? 'You have successfully passed the test!' 
              : `You need ${aptitudeTest.passingPercentage}% to pass. Keep practicing!`
            }
          </p>

          {/* Score Display */}
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-gray-200 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                testAttempt.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {scorePercentage}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Score</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{testQuestions.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{correctAnswersCount}</div>
              <div className="text-xs text-gray-500 mt-1">Correct</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{incorrectAnswersCount}</div>
              <div className="text-xs text-gray-500 mt-1">Incorrect</div>
            </div>
          </div>

          {/* Confidence Analysis */}
          {confidentAnswers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Confidence Analysis</h3>
              </div>
              <div className="text-sm text-gray-600">
                You marked <span className="font-semibold text-blue-600">{confidentAnswers.length}</span> answers as confident
                with <span className={`font-semibold ${confidenceAccuracy >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {confidenceAccuracy}%
                </span> accuracy
              </div>
            </div>
          )}
        </Card>

        {/* Category Performance Breakdown */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance by Category</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryPerformanceData).map(([category, performance]) => {
              if (performance.total === 0) return null;
              const colors = CATEGORY_THEME_COLORS[category as AptitudeCategory];
              const performanceLevel = performance.percentage >= 80 ? 'Excellent' 
                : performance.percentage >= 60 ? 'Good' 
                : 'Needs Practice';
              
              return (
                <div key={category} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        performance.percentage >= 80 ? 'bg-green-100 text-green-700'
                        : performance.percentage >= 60 ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                        {performanceLevel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${colors.text}`}>
                        {performance.percentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {performance.correct}/{performance.total} correct
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        performance.percentage >= 80 ? 'bg-green-500'
                        : performance.percentage >= 60 ? 'bg-blue-500'
                        : 'bg-orange-500'
                      }`}
                      style={{ width: `${performance.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Smart Recommendations */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommendations for You</h3>
          </div>
          <div className="space-y-2">
            {intelligentRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <Award className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Review Answers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Review</h3>
            <span className="text-sm text-gray-500">
              Click on any question to view explanation
            </span>
          </div>
          <div className="space-y-3">
            {testQuestions.map((question, questionIndex) => {
              const userSelectedAnswer = getUserAnswerForQuestion(question._id);
              const isUserAnswerCorrect = isAnswerCorrect(question._id);
              const isQuestionExpanded = expandedQuestionIds.has(question._id);
              const wasMarkedConfident = wasAnsweredConfidently(question._id);
              const wasFlagged = wasQuestionBookmarked(question._id);

              return (
                <Card key={question._id} className={`overflow-hidden ${
                  isUserAnswerCorrect 
                    ? 'border-l-4 border-green-500' 
                    : 'border-l-4 border-red-500'
                }`}>
                  <button
                    onClick={() => toggleQuestionExpansion(question._id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          isUserAnswerCorrect ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {isUserAnswerCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium text-gray-500">
                              Question {questionIndex + 1}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              isUserAnswerCorrect 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {isUserAnswerCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                              {question.category}
                            </span>
                            {wasMarkedConfident && (
                              <span className="text-xs px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Confident
                              </span>
                            )}
                            {wasFlagged && (
                              <span className="text-xs px-2 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                <Bookmark className="w-3 h-3" />
                                Flagged
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {question.question}
                          </p>
                        </div>
                      </div>
                      {isQuestionExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isQuestionExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => {
                          const isUserSelection = userSelectedAnswer === optionIndex;
                          const isCorrectOption = question.correctOptionIndex === optionIndex;

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                isCorrectOption
                                  ? 'bg-green-50 border-green-300'
                                  : isUserSelection
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectOption && (
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                                {isUserSelection && !isCorrectOption && (
                                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${
                                  isCorrectOption || isUserSelection ? 'font-medium' : ''
                                }`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(`/aptitude/test/${aptitudeTest._id}`)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Retake This Test
          </button>
          <button
            onClick={() => navigate('/aptitude')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            Browse More Tests
          </button>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTestResultsPage;
