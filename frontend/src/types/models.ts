// User Types
export type UserRole = 'admin' | 'student';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  universityId: string;
  role: UserRole;
  branch?: string;
  semester?: number;
  enrollmentYear?: number;
  createdAt: string;
  updatedAt: string;
}

// Coding Problem Types
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SubmissionStatus = 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Pending Review';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IProblem {
  _id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  tags: string[];
  constraints?: string;
  testCases: ITestCase[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmission {
  _id: string;
  problemId: string;
  userId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  executionTime?: number;
  memory?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  submittedAt: string;
}

export interface ITestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: number;
}

export interface ICodeSnippet {
  label: string;
  code: string;
  description?: string;
}

export interface IProblemProgress {
  problemId: string;
  status: 'unsolved' | 'attempted' | 'solved';
  timeSpent: number; // in seconds
  lastAttemptedAt?: string;
}

// Aptitude Types
export type AptitudeCategory = 'Quantitative' | 'Logical' | 'Verbal' | 'Technical';

export interface IAptitudeQuestion {
  _id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  category: AptitudeCategory;
  difficulty: DifficultyLevel;
  explanation?: string;
  createdBy: string;
  createdAt: string;
}

export interface IAptitudeTest {
  _id: string;
  title: string;
  description: string;
  category: AptitudeCategory;
  questions: string[];
  duration: number;
  passingPercentage: number;
  createdBy: string;
  createdAt: string;
}

export interface IAptitudeAttempt {
  _id: string;
  testId: string;
  userId: string;
  answers: { questionId: string; selectedOption: number; isConfident?: boolean }[];
  bookmarkedQuestions?: string[];
  score: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: string;
  timeSpentPerQuestion?: Record<string, number>; // questionId -> seconds
}

export interface IInProgressAttempt {
  testId: string;
  userId: string;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  confidenceLevels: Record<string, boolean>;
  bookmarkedQuestions: string[];
  timeRemaining: number;
  startedAt: string;
  lastSavedAt: string;
}

export interface IUserProgress {
  userId: string;
  problemsSolved: {
    easy: number;
    medium: number;
    hard: number;
  };
  aptitudeTestsTaken: number;
  lastActiveDate: string;
  totalSubmissions: number;
}
