import type { IAptitudeQuestion, IAptitudeTest, IAptitudeAttempt, IInProgressAttempt, AptitudeCategory, DifficultyLevel } from '../types/models';
import { mockAptitudeQuestions, mockAptitudeTests } from '../mocks/aptitude.mock';

/**
 * Aptitude Service
 * 
 * Provides functionality for managing aptitude tests, questions, and user attempts.
 * Uses localStorage for persisting attempt history and in-progress tests.
 * 
 * @module services/aptitude
 */

// Constants
const STORAGE_KEY_PREFIX = 'aptitude_attempts_';
const IN_PROGRESS_KEY_PREFIX = 'aptitude_inprogress_';
// const AUTO_SAVE_INTERVAL = 30000; // 30 seconds (reserved for future auto-save feature)
const DEFAULT_PASSING_PERCENTAGE = 60;


/**
 * Get all aptitude tests with optional filters
 * 
 * @param filters - Optional filters for category and search query
 * @param filters.category - Filter by aptitude category
 * @param filters.difficulty - Filter by difficulty level (currently unused)
 * @param filters.search - Search query to match against title and description
 * @returns Array of filtered aptitude tests
 */
export const getAptitudeTests = (filters?: {
  category?: AptitudeCategory;
  difficulty?: DifficultyLevel;
  search?: string;
}): IAptitudeTest[] => {
  try {
    let filtered = [...mockAptitudeTests];

    if (filters?.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase().trim();
      if (query) {
        filtered = filtered.filter(
          t =>
            t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        );
      }
    }

    return filtered;
  } catch (error) {
    // Return all tests if filtering fails
    return mockAptitudeTests;
  }
};

/**
 * Get a single aptitude test by ID
 * 
 * @param id - The unique identifier of the test
 * @returns The aptitude test if found, undefined otherwise
 */
export const getAptitudeTestById = (id: string): IAptitudeTest | undefined => {
  if (!id || typeof id !== 'string') {
    return undefined;
  }
  return mockAptitudeTests.find(t => t._id === id);
};

/**
 * Get all questions for a specific test
 * 
 * @param testId - The unique identifier of the test
 * @returns Array of questions belonging to the test
 */
export const getQuestionsForTest = (testId: string): IAptitudeQuestion[] => {
  try {
    if (!testId) {
      return [];
    }

    const test = getAptitudeTestById(testId);
    if (!test) {
      return [];
    }

    return test.questions
      .map((qId: string) => mockAptitudeQuestions.find(q => q._id === qId))
      .filter((q): q is IAptitudeQuestion => q !== undefined);
  } catch (error) {
    // Return empty array if error occurs
    return [];
  }
};

/**
 * Get a single question by ID
 * 
 * @param id - The unique identifier of the question
 * @returns The question if found, undefined otherwise
 */
export const getQuestionById = (id: string): IAptitudeQuestion | undefined => {
  if (!id || typeof id !== 'string') {
    return undefined;
  }
  return mockAptitudeQuestions.find(q => q._id === id);
};

/**
 * Submit a test attempt and calculate score
 * 
 * Validates answers, calculates score, determines pass/fail status,
 * and persists the attempt to localStorage.
 * 
 * @param testId - The unique identifier of the test
 * @param userId - The unique identifier of the user
 * @param answers - Array of user's answers with questionId and selectedOption
 * @returns The created attempt with score and pass/fail status
 * @throws Error if test not found, invalid parameters, or storage fails
 */
export const submitTestAttempt = (
  testId: string,
  userId: string,
  answers: { questionId: string; selectedOption: number }[]
): IAptitudeAttempt => {
  // Input validation
  if (!testId || typeof testId !== 'string') {
    throw new Error('Valid test ID is required');
  }
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid user ID is required');
  }
  if (!Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }

  const test = getAptitudeTestById(testId);
  if (!test) {
    throw new Error(`Test not found: ${testId}`);
  }

  const questions = getQuestionsForTest(testId);
  if (questions.length === 0) {
    throw new Error('No questions found for test');
  }

  // Calculate score
  let correctCount = 0;
  answers.forEach(answer => {
    const question = questions.find(q => q._id === answer.questionId);
    if (question && question.correctOptionIndex === answer.selectedOption) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= (test.passingPercentage || DEFAULT_PASSING_PERCENTAGE);

  const attempt: IAptitudeAttempt = {
    _id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    testId,
    userId,
    answers,
    score,
    totalQuestions: questions.length,
    passed,
    completedAt: new Date().toISOString(),
  };

  // Save to localStorage with error handling
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const existing = localStorage.getItem(key);
    const attempts = existing ? JSON.parse(existing) : [];
    attempts.push(attempt);
    localStorage.setItem(key, JSON.stringify(attempts));
  } catch (error) {
    // Silent fail - storage errors don't prevent attempt completion
    // In production, this would be logged to monitoring service
  }

  return attempt;
};

/**
 * Get a specific attempt by ID for a user
 * 
 * @param attemptId - The unique identifier of the attempt
 * @param userId - The unique identifier of the user
 * @returns The attempt if found, undefined otherwise
 */
export const getAttemptById = (attemptId: string, userId: string): IAptitudeAttempt | undefined => {
  try {
    if (!attemptId || !userId) {
      return undefined;
    }

    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const existing = localStorage.getItem(key);
    if (!existing) return undefined;

    const attempts: IAptitudeAttempt[] = JSON.parse(existing);
    return attempts.find(a => a._id === attemptId);
  } catch (error) {
    // Silent fail - return undefined for invalid data
    return undefined;
  }
};

/**
 * Get all attempts for a user across all tests
 * 
 * @param userId - The unique identifier of the user
 * @returns Array of all attempts by the user, sorted by completion date (newest first)
 */
export const getUserAttempts = (userId: string): IAptitudeAttempt[] => {
  try {
    if (!userId) {
      return [];
    }

    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const existing = localStorage.getItem(key);
    if (!existing) return [];

    const attempts: IAptitudeAttempt[] = JSON.parse(existing);
    // Sort by completion date, newest first
    return attempts.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  } catch (error) {
    // Silent fail - return empty array for invalid data
    return [];
  }
};

/**
 * Get all attempts for a specific test by a user
 * 
 * @param testId - The unique identifier of the test
 * @param userId - The unique identifier of the user
 * @returns Array of attempts for the specific test, sorted by completion date (newest first)
 */
export const getTestAttempts = (testId: string, userId: string): IAptitudeAttempt[] => {
  try {
    if (!testId || !userId) {
      return [];
    }

    const allAttempts = getUserAttempts(userId);
    return allAttempts.filter(a => a.testId === testId);
  } catch (error) {
    // Return empty array for invalid data
    return [];
  }
};

/**
 * Get all available aptitude categories
 * 
 * @returns Array of all aptitude categories
 */
export const getAllCategories = (): AptitudeCategory[] => {
  return ['Quantitative', 'Logical', 'Verbal', 'Technical'];
};

// ============================================
// In-Progress Attempt Management
// ============================================

/**
 * Save in-progress test attempt
 * 
 * @param testId - Test ID
 * @param userId - User ID
 * @param progress - Progress data to save
 */
export const saveInProgressAttempt = (
  testId: string,
  userId: string,
  progress: Omit<IInProgressAttempt, 'testId' | 'userId'>
): void => {
  try {
    const key = `${IN_PROGRESS_KEY_PREFIX}${userId}_${testId}`;
    const inProgress: IInProgressAttempt = {
      testId,
      userId,
      ...progress,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(inProgress));
  } catch (error) {
    // Silent fail - in-progress data won't be saved
  }
};

/**
 * Get in-progress test attempt
 * 
 * @param testId - Test ID
 * @param userId - User ID
 * @returns In-progress attempt if exists
 */
export const getInProgressAttempt = (
  testId: string,
  userId: string
): IInProgressAttempt | null => {
  try {
    const key = `${IN_PROGRESS_KEY_PREFIX}${userId}_${testId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    // Return null if retrieval fails
    return null;
  }
};

/**
 * Clear in-progress test attempt
 * 
 * @param testId - Test ID
 * @param userId - User ID
 */
export const clearInProgressAttempt = (
  testId: string,
  userId: string
): void => {
  try {
    const key = `${IN_PROGRESS_KEY_PREFIX}${userId}_${testId}`;
    localStorage.removeItem(key);
  } catch (error) {
    // Silent fail - not critical if clear fails
  }
};

/**
 * Check if user has in-progress attempt for a test
 * 
 * @param testId - Test ID
 * @param userId - User ID
 * @returns True if in-progress attempt exists
 */
export const hasInProgressAttempt = (
  testId: string,
  userId: string
): boolean => {
  return getInProgressAttempt(testId, userId) !== null;
};

// ============================================
// Performance Analysis
// ============================================

/**
 * Get category-wise performance for an attempt
 * 
 * @param attempt - Completed attempt
 * @returns Performance breakdown by category
 */
export const getCategoryPerformance = (
  attempt: IAptitudeAttempt
): Record<AptitudeCategory, { correct: number; total: number; percentage: number }> => {
  const test = getAptitudeTestById(attempt.testId);
  if (!test) return {} as Record<string, never>;

  const questions = getQuestionsForTest(test._id);
  const performance: Record<string, { correct: number; total: number; percentage: number }> = {};

  // Initialize categories
  getAllCategories().forEach(category => {
    performance[category] = { correct: 0, total: 0, percentage: 0 };
  });

  // Calculate performance per category
  questions.forEach(question => {
    const answer = attempt.answers.find(a => a.questionId === question._id);
    if (answer) {
      performance[question.category].total++;
      if (answer.selectedOption === question.correctOptionIndex) {
        performance[question.category].correct++;
      }
    }
  });

  // Calculate percentages
  Object.keys(performance).forEach(category => {
    const { correct, total } = performance[category];
    performance[category].percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  return performance;
};

/**
 * Get smart recommendations based on performance
 * 
 * @param attempt - Completed attempt
 * @returns Array of recommendation messages
 */
export const getSmartRecommendations = (
  attempt: IAptitudeAttempt
): string[] => {
  const recommendations: string[] = [];
  const categoryPerf = getCategoryPerformance(attempt);
  const test = getAptitudeTestById(attempt.testId);

  if (!test) return recommendations;

  // Analyze category performance
  const weakCategories = Object.entries(categoryPerf)
    .filter(([, perf]) => perf.total > 0 && perf.percentage < 60)
    .map(([category]) => category);

  const strongCategories = Object.entries(categoryPerf)
    .filter(([, perf]) => perf.total > 0 && perf.percentage >= 80)
    .map(([category]) => category);

  // Generate recommendations
  if (weakCategories.length > 0) {
    recommendations.push(`📚 Focus on improving ${weakCategories.join(', ')} skills`);
  }

  if (strongCategories.length > 0) {
    recommendations.push(`🌟 Excellent performance in ${strongCategories.join(', ')}!`);
  }

  if (attempt.score < test.passingPercentage) {
    const gap = test.passingPercentage - attempt.score;
    recommendations.push(`🎯 You need ${gap}% more to pass. Keep practicing!`);
  }

  // Confidence analysis
  const confidentAnswers = attempt.answers.filter(a => a.isConfident);
  const confidentCorrect = confidentAnswers.filter(a => {
    const question = mockAptitudeQuestions.find(q => q._id === a.questionId);
    return question && question.correctOptionIndex === a.selectedOption;
  }).length;

  if (confidentAnswers.length > 0) {
    const confidentAccuracy = Math.round((confidentCorrect / confidentAnswers.length) * 100);
    if (confidentAccuracy < 70) {
      recommendations.push(`💡 Review your confident answers - ${confidentAccuracy}% accuracy suggests knowledge gaps`);
    }
  }

  // Suggest next tests
  const availableTests = mockAptitudeTests.filter(t => t._id !== test._id);
  if (weakCategories.length > 0) {
    const suggestedTest = availableTests.find(t => weakCategories.includes(t.category));
    if (suggestedTest) {
      recommendations.push(`📝 Try "${suggestedTest.title}" to improve weak areas`);
    }
  }

  if (attempt.score >= 80) {
    const advancedTest = availableTests.find(t =>
      t.title.toLowerCase().includes('advanced') && t.category === test.category
    );
    if (advancedTest) {
      recommendations.push(`🚀 Challenge yourself with "${advancedTest.title}"`);
    }
  }

  return recommendations.length > 0 ? recommendations : [
    '✨ Keep practicing regularly to maintain your skills',
    '📊 Track your progress across multiple attempts'
  ];
};
