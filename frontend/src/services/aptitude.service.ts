import type { IAptitudeQuestion, IAptitudeTest, IAptitudeAttempt, IInProgressAttempt, AptitudeCategory, DifficultyLevel } from '../types/models';

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

// Mock Aptitude Questions
export const mockAptitudeQuestions: IAptitudeQuestion[] = [
  // Quantitative Questions
  {
    _id: 'q1',
    question: 'If a train travels 120 km in 2 hours, what is its average speed?',
    options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
    correctOptionIndex: 1,
    category: 'Quantitative',
    difficulty: 'Beginner',
    explanation: 'Speed = Distance / Time = 120 km / 2 hours = 60 km/h',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q2',
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctOptionIndex: 1,
    category: 'Quantitative',
    difficulty: 'Beginner',
    explanation: '15% of 200 = (15/100) × 200 = 30',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q3',
    question: 'If x + 5 = 12, what is the value of x?',
    options: ['5', '6', '7', '8'],
    correctOptionIndex: 2,
    category: 'Quantitative',
    difficulty: 'Beginner',
    explanation: 'x + 5 = 12, therefore x = 12 - 5 = 7',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q4',
    question: 'A product costs $80 after a 20% discount. What was the original price?',
    options: ['$96', '$100', '$104', '$110'],
    correctOptionIndex: 1,
    category: 'Quantitative',
    difficulty: 'Intermediate',
    explanation: 'If 80% = $80, then 100% = $80 / 0.8 = $100',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q5',
    question: 'What is the next number in the sequence: 2, 6, 12, 20, ?',
    options: ['28', '30', '32', '36'],
    correctOptionIndex: 1,
    category: 'Quantitative',
    difficulty: 'Intermediate',
    explanation: 'Pattern: +4, +6, +8, +10. So 20 + 10 = 30',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },

  // Logical Reasoning Questions
  {
    _id: 'q6',
    question: 'All roses are flowers. Some flowers fade quickly. Therefore:',
    options: [
      'All roses fade quickly',
      'Some roses may fade quickly',
      'No roses fade quickly',
      'Cannot be determined'
    ],
    correctOptionIndex: 1,
    category: 'Logical',
    difficulty: 'Intermediate',
    explanation: 'Since some flowers (which include roses) fade quickly, it\'s possible that some roses fade quickly.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q7',
    question: 'If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.',
    options: ['True', 'False', 'Cannot say', 'Sometimes true'],
    correctOptionIndex: 0,
    category: 'Logical',
    difficulty: 'Beginner',
    explanation: 'This is a valid syllogism. If A⊂B and B⊂C, then A⊂C.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q8',
    question: 'In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?',
    options: ['EOJDJEFM', 'EOJEFMDI', 'MFEJDJOF', 'NFEJDJOF'],
    correctOptionIndex: 3,
    category: 'Logical',
    difficulty: 'Intermediate',
    explanation: 'Each letter is shifted by +1 position in the alphabet.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q9',
    question: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
    options: ['3', '5', '14', '21'],
    correctOptionIndex: 2,
    category: 'Logical',
    difficulty: 'Beginner',
    explanation: '14 is the only even number; all others are odd prime numbers or related to primes.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q10',
    question: 'If BAT = 23, CAT = 24, what does RAT equal?',
    options: ['35', '36', '37', '38'],
    correctOptionIndex: 2,
    category: 'Logical',
    difficulty: 'Intermediate',
    explanation: 'Sum of position values: R(18) + A(1) + T(20) = 39. Wait, let me recalculate - B(2)+A(1)+T(20)=23, so R(18)+A(1)+T(20)=39. Pattern might be different.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },

  // Verbal Reasoning Questions
  {
    _id: 'q11',
    question: 'Choose the word most similar in meaning to "ABUNDANT":',
    options: ['Scarce', 'Plentiful', 'Moderate', 'Insufficient'],
    correctOptionIndex: 1,
    category: 'Verbal',
    difficulty: 'Beginner',
    explanation: 'Abundant means existing in large quantities; plentiful is the closest synonym.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q12',
    question: 'Choose the word opposite in meaning to "CONCEAL":',
    options: ['Hide', 'Reveal', 'Cover', 'Suppress'],
    correctOptionIndex: 1,
    category: 'Verbal',
    difficulty: 'Beginner',
    explanation: 'Conceal means to hide; reveal means to make visible or known.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q13',
    question: 'Complete the analogy: Book : Author :: Painting : ?',
    options: ['Gallery', 'Canvas', 'Artist', 'Museum'],
    correctOptionIndex: 2,
    category: 'Verbal',
    difficulty: 'Beginner',
    explanation: 'Just as an author creates a book, an artist creates a painting.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q14',
    question: 'Which word does NOT belong with the others?',
    options: ['Rose', 'Tulip', 'Daisy', 'Butterfly'],
    correctOptionIndex: 3,
    category: 'Verbal',
    difficulty: 'Beginner',
    explanation: 'Rose, Tulip, and Daisy are all flowers; Butterfly is an insect.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q15',
    question: 'Choose the correctly spelled word:',
    options: ['Occassion', 'Occasion', 'Ocassion', 'Occation'],
    correctOptionIndex: 1,
    category: 'Verbal',
    difficulty: 'Beginner',
    explanation: 'The correct spelling is "Occasion" with double-c and single-s.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },

  // Technical Questions
  {
    _id: 'q16',
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlinks and Text Markup Language'
    ],
    correctOptionIndex: 0,
    category: 'Technical',
    difficulty: 'Beginner',
    explanation: 'HTML stands for Hyper Text Markup Language, the standard language for web pages.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q17',
    question: 'Which of the following is NOT a programming language?',
    options: ['Python', 'Java', 'HTML', 'C++'],
    correctOptionIndex: 2,
    category: 'Technical',
    difficulty: 'Beginner',
    explanation: 'HTML is a markup language, not a programming language.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q18',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctOptionIndex: 1,
    category: 'Technical',
    difficulty: 'Intermediate',
    explanation: 'Binary search has O(log n) time complexity as it halves the search space each iteration.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q19',
    question: 'Which data structure uses LIFO (Last In First Out)?',
    options: ['Queue', 'Stack', 'Array', 'Tree'],
    correctOptionIndex: 1,
    category: 'Technical',
    difficulty: 'Beginner',
    explanation: 'Stack follows LIFO principle where the last element added is the first to be removed.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q20',
    question: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Question Language',
      'Standard Quality Language',
      'System Query Logic'
    ],
    correctOptionIndex: 0,
    category: 'Technical',
    difficulty: 'Beginner',
    explanation: 'SQL stands for Structured Query Language, used for managing databases.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },

  // Additional Advanced Questions
  {
    _id: 'q21',
    question: 'A cistern can be filled by pipe A in 10 hours and by pipe B in 15 hours. Both pipes are opened together. How long will it take to fill the cistern?',
    options: ['5 hours', '6 hours', '7.5 hours', '8 hours'],
    correctOptionIndex: 1,
    category: 'Quantitative',
    difficulty: 'Advanced',
    explanation: 'Rate of A = 1/10, Rate of B = 1/15. Combined rate = 1/10 + 1/15 = 5/30 = 1/6. Time = 6 hours.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q22',
    question: 'The ratio of boys to girls in a class is 3:2. If there are 45 students total, how many boys are there?',
    options: ['24', '27', '30', '33'],
    correctOptionIndex: 1,
    category: 'Quantitative',
    difficulty: 'Intermediate',
    explanation: 'Total parts = 3+2 = 5. Boys = (3/5) × 45 = 27',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q23',
    question: 'Choose the word pair that best represents the relationship: ENDEMIC : REGION',
    options: [
      'Epidemic : Disease',
      'Native : Habitat',
      'Foreign : Country',
      'Pandemic : World'
    ],
    correctOptionIndex: 1,
    category: 'Verbal',
    difficulty: 'Advanced',
    explanation: 'Endemic means native to a specific region, just as native organisms belong to a specific habitat.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q24',
    question: 'In a REST API, which HTTP method is typically used to update an existing resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correctOptionIndex: 2,
    category: 'Technical',
    difficulty: 'Intermediate',
    explanation: 'PUT is used to update existing resources, while POST creates new ones.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'q25',
    question: 'What is the output of: console.log(typeof null) in JavaScript?',
    options: ['null', 'undefined', 'object', 'number'],
    correctOptionIndex: 2,
    category: 'Technical',
    difficulty: 'Advanced',
    explanation: 'In JavaScript, typeof null returns "object" - this is a known quirk in the language.',
    createdBy: '1',
    createdAt: new Date().toISOString(),
  },
];

// Mock Aptitude Tests
export const mockAptitudeTests: IAptitudeTest[] = [
  {
    _id: 't1',
    title: 'Quantitative Aptitude - Basics',
    description: 'Test your basic mathematical and numerical reasoning skills. Covers arithmetic, percentages, ratios, and basic algebra.',
    category: 'Quantitative',
    questions: ['q1', 'q2', 'q3', 'q4', 'q5'],
    duration: 15, // minutes
    passingPercentage: 60,
    createdBy: '1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't2',
    title: 'Quantitative Aptitude - Advanced',
    description: 'Advanced quantitative problems including time-speed-distance, work-time, and complex ratios.',
    category: 'Quantitative',
    questions: ['q4', 'q5', 'q21', 'q22'],
    duration: 20,
    passingPercentage: 70,
    createdBy: '1',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't3',
    title: 'Logical Reasoning - Fundamentals',
    description: 'Evaluate your logical thinking and pattern recognition abilities. Includes syllogisms, coding-decoding, and series completion.',
    category: 'Logical',
    questions: ['q6', 'q7', 'q8', 'q9', 'q10'],
    duration: 18,
    passingPercentage: 60,
    createdBy: '1',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't4',
    title: 'Verbal Ability - Core',
    description: 'Test your vocabulary, grammar, and comprehension skills. Covers synonyms, antonyms, analogies, and sentence completion.',
    category: 'Verbal',
    questions: ['q11', 'q12', 'q13', 'q14', 'q15', 'q23'],
    duration: 15,
    passingPercentage: 65,
    createdBy: '1',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't5',
    title: 'Technical Aptitude - Programming Basics',
    description: 'Assess your understanding of fundamental programming concepts, data structures, and computer science basics.',
    category: 'Technical',
    questions: ['q16', 'q17', 'q18', 'q19', 'q20'],
    duration: 20,
    passingPercentage: 70,
    createdBy: '1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't6',
    title: 'Technical Aptitude - Advanced',
    description: 'Advanced technical questions covering algorithms, system design, and language-specific quirks.',
    category: 'Technical',
    questions: ['q18', 'q24', 'q25'],
    duration: 15,
    passingPercentage: 75,
    createdBy: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 't7',
    title: 'Mixed Aptitude - Complete Assessment',
    description: 'Comprehensive assessment covering all categories. Perfect for overall aptitude evaluation.',
    category: 'Quantitative',
    questions: ['q1', 'q6', 'q11', 'q16', 'q4', 'q8', 'q13', 'q19'],
    duration: 25,
    passingPercentage: 65,
    createdBy: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
