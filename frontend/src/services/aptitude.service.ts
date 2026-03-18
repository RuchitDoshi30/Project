import type { IAptitudeQuestion, IAptitudeTest, IAptitudeAttempt, IInProgressAttempt, AptitudeCategory } from '../types/models';
import { api } from './api.client';

const IN_PROGRESS_KEY_PREFIX = 'aptitude_inprogress_';
const DEFAULT_PASSING_PERCENTAGE = 60;

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// ---- Tests ----
export const getAptitudeTests = async (filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<IAptitudeTest>> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await api.get<{ success: boolean } & PaginatedResponse<IAptitudeTest>>(`/aptitude/tests?${params.toString()}`);
  return {
    data: response.data || [],
    page: response.page || 1,
    total: response.total || 0,
    totalPages: response.totalPages || 0,
    hasMore: response.hasMore || false,
  };
};

export const getAptitudeTestById = async (id: string): Promise<IAptitudeTest | undefined> => {
  try {
    const response = await api.get<{ success: boolean; data: IAptitudeTest }>(`/aptitude/tests/${id}`);
    return response.data;
  } catch {
    return undefined;
  }
};

export const getQuestionsForTest = async (testId: string): Promise<IAptitudeQuestion[]> => {
  const test = await getAptitudeTestById(testId);
  if (!test) return [];
  // Questions are populated by the backend
  return (test as any).questions || [];
};

export const getQuestionById = async (id: string): Promise<IAptitudeQuestion | undefined> => {
  // Questions are delivered via test population. For admin, fetch directly.
  try {
    const response = await api.get<{ success: boolean; data: IAptitudeQuestion[] }>(`/aptitude/questions?limit=100`);
    return response.data.find(q => q._id === id);
  } catch {
    return undefined;
  }
};

// ---- Attempts ----
export const submitTestAttempt = async (
  testId: string,
  _userId: string,
  answers: { questionId: string; selectedOption: number }[]
): Promise<IAptitudeAttempt> => {
  const response = await api.post<{ success: boolean; data: IAptitudeAttempt }>('/aptitude/attempts', {
    testId,
    answers,
  });
  return response.data;
};

export const getAttemptById = async (attemptId: string): Promise<IAptitudeAttempt | undefined> => {
  try {
    const response = await api.get<{ success: boolean; data: IAptitudeAttempt }>(`/aptitude/attempts/${attemptId}`);
    return response.data;
  } catch {
    return undefined;
  }
};

export const getUserAttempts = async (): Promise<IAptitudeAttempt[]> => {
  try {
    const response = await api.get<{ success: boolean; data: IAptitudeAttempt[] }>('/aptitude/attempts/me');
    return response.data;
  } catch {
    return [];
  }
};

export const getTestAttempts = async (testId: string): Promise<IAptitudeAttempt[]> => {
  const allAttempts = await getUserAttempts();
  return allAttempts.filter(a => a.testId === testId);
};

export const getAllCategories = (): AptitudeCategory[] => {
  return ['Quantitative', 'Logical', 'Verbal', 'Technical'];
};

// ---- In-Progress Attempt Management (localStorage) ----
export const saveInProgressAttempt = (
  testId: string,
  userId: string,
  progress: Omit<IInProgressAttempt, 'testId' | 'userId'>
): void => {
  try {
    const key = `${IN_PROGRESS_KEY_PREFIX}${userId}_${testId}`;
    const inProgress: IInProgressAttempt = { testId, userId, ...progress, lastSavedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(inProgress));
  } catch { /* silent */ }
};

export const getInProgressAttempt = (testId: string, userId: string): IInProgressAttempt | null => {
  try {
    const key = `${IN_PROGRESS_KEY_PREFIX}${userId}_${testId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

export const clearInProgressAttempt = (testId: string, userId: string): void => {
  try {
    localStorage.removeItem(`${IN_PROGRESS_KEY_PREFIX}${userId}_${testId}`);
  } catch { /* silent */ }
};

export const hasInProgressAttempt = (testId: string, userId: string): boolean => {
  return getInProgressAttempt(testId, userId) !== null;
};

// ---- Performance Analysis ----
export const getCategoryPerformance = (
  attempt: IAptitudeAttempt,
  questions: IAptitudeQuestion[]
): Record<AptitudeCategory, { correct: number; total: number; percentage: number }> => {
  const performance: Record<string, { correct: number; total: number; percentage: number }> = {};
  getAllCategories().forEach(category => {
    performance[category] = { correct: 0, total: 0, percentage: 0 };
  });

  questions.forEach(question => {
    const answer = attempt.answers.find(a => a.questionId === question._id);
    if (answer) {
      performance[question.category].total++;
      if (answer.selectedOption === question.correctOptionIndex) {
        performance[question.category].correct++;
      }
    }
  });

  Object.keys(performance).forEach(cat => {
    const { correct, total } = performance[cat];
    performance[cat].percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  return performance;
};

export const getSmartRecommendations = (
  attempt: IAptitudeAttempt,
  questions?: IAptitudeQuestion[]
): string[] => {
  const recs: string[] = [];

  if (attempt.score < DEFAULT_PASSING_PERCENTAGE) {
    recs.push(`🎯 You need ${DEFAULT_PASSING_PERCENTAGE - attempt.score}% more to pass. Keep practicing!`);
  }
  if (attempt.score >= 80) {
    recs.push('🌟 Excellent performance! Try more advanced tests.');
  }

  if (questions) {
    const performance = getCategoryPerformance(attempt, questions);
    const weakCategories = Object.entries(performance).filter(([, p]) => p.total > 0 && p.percentage < 60).map(([cat]) => cat);
    if (weakCategories.length > 0) {
      recs.push(`📚 Focus on improving ${weakCategories.join(', ')} skills`);
    }
  }

  return recs.length > 0 ? recs : [
    '✨ Keep practicing regularly to maintain your skills',
    '📊 Track your progress across multiple attempts'
  ];
};
