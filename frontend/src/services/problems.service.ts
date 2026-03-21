import type { IProblem, ISubmission, ICodeSnippet, IProblemProgress, ITestCaseResult } from '../types/models';
import { api } from './api.client';

// Constants for localStorage keys
const STORAGE_KEYS = {
  CODE_PREFIX: 'code_',
  PROGRESS_PREFIX: 'progress_',
} as const;

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// Get all problems with optional filters
export const getProblems = async (filters?: {
  difficulty?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<IProblem>> => {
  const params = new URLSearchParams();
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await api.get<{ success: boolean } & PaginatedResponse<IProblem>>(`/problems?${params.toString()}`);
  return {
    data: response.data || [],
    page: response.page || 1,
    total: response.total || 0,
    totalPages: response.totalPages || 0,
    hasMore: response.hasMore || false,
  };
};

// Get single problem by slug
export const getProblemBySlug = async (slug: string): Promise<IProblem | undefined> => {
  try {
    const response = await api.get<{ success: boolean; data: IProblem }>(`/problems/${slug}`);
    return response.data;
  } catch {
    return undefined;
  }
};

// Get single problem by ID (fallback to slug-based)
export const getProblemById = async (id: string): Promise<IProblem | undefined> => {
  return getProblemBySlug(id);
};

// Get user's submission for a problem
export const getUserSubmission = async (problemId: string): Promise<ISubmission | undefined> => {
  try {
    const response = await api.get<{ success: boolean; data: ISubmission[] }>(`/submissions/me/problem/${problemId}`);
    return response.data[0];
  } catch {
    return undefined;
  }
};

// Save user's code (localStorage cache — backend doesn't have a draft endpoint)
export const saveCode = async (problemId: string, userId: string, code: string, language: string): Promise<void> => {
  localStorage.setItem(`${STORAGE_KEYS.CODE_PREFIX}${problemId}_${userId}`, JSON.stringify({ code, language }));
};

// Get saved code from local cache
export const getSavedCode = (problemId: string, userId: string): { code: string; language: string } | null => {
  const saved = localStorage.getItem(`${STORAGE_KEYS.CODE_PREFIX}${problemId}_${userId}`);
  return saved ? JSON.parse(saved) : null;
};

// Get all unique tags (derived from problems list)
export const getAllTags = async (): Promise<string[]> => {
  // Use a high limit to fetch most problems for tag extraction
  const response = await getProblems({ limit: 500 });
  const tagsSet = new Set<string>();
  response.data.forEach(p => p.tags.forEach(tag => tagsSet.add(tag)));
  return Array.from(tagsSet).sort();
};

// Code Snippets Library (static — no backend needed)
export const codeSnippets: Record<string, ICodeSnippet[]> = {
  javascript: [
    { label: 'For Loop', code: 'for (let i = 0; i < arr.length; i++) {\n  // code\n}', description: 'Standard for loop' },
    { label: 'Array Sort', code: 'arr.sort((a, b) => a - b); // ascending', description: 'Sort array numerically' },
    { label: 'Two Pointers', code: 'let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  // logic\n  left++;\n  right--;\n}', description: 'Two pointer technique' },
    { label: 'Hash Map', code: 'const map = new Map();\nmap.set(key, value);\nif (map.has(key)) {\n  // exists\n}', description: 'Using Map for lookups' },
  ],
  python: [
    { label: 'For Loop', code: 'for i in range(len(arr)):\n    # code', description: 'Standard for loop' },
    { label: 'List Sort', code: 'arr.sort()  # ascending\narr.sort(reverse=True)  # descending', description: 'Sort list' },
    { label: 'Two Pointers', code: 'left, right = 0, len(arr) - 1\nwhile left < right:\n    # logic\n    left += 1\n    right -= 1', description: 'Two pointer technique' },
    { label: 'Dictionary', code: 'hashmap = {}\nhashmap[key] = value\nif key in hashmap:\n    # exists', description: 'Using dict for lookups' },
  ],
  java: [
    { label: 'For Loop', code: 'for (int i = 0; i < arr.length; i++) {\n    // code\n}', description: 'Standard for loop' },
    { label: 'Array Sort', code: 'Arrays.sort(arr);  // ascending', description: 'Sort array' },
    { label: 'HashMap', code: 'Map<Integer, Integer> map = new HashMap<>();\nmap.put(key, value);\nif (map.containsKey(key)) {\n    // exists\n}', description: 'Using HashMap for lookups' },
  ],
  cpp: [
    { label: 'For Loop', code: 'for (int i = 0; i < arr.size(); i++) {\n    // code\n}', description: 'Standard for loop' },
    { label: 'Vector Sort', code: 'sort(arr.begin(), arr.end());  // ascending', description: 'Sort vector' },
    { label: 'Unordered Map', code: 'unordered_map<int, int> umap;\numap[key] = value;\nif (umap.find(key) != umap.end()) {\n    // exists\n}', description: 'Using unordered_map for lookups' },
  ],
};

// Problem progress tracking (localStorage-based, same as before)
const getProblemProgress = (problemId: string, userId: string): IProblemProgress => {
  const key = `${STORAGE_KEYS.PROGRESS_PREFIX}${problemId}_${userId}`;
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  return { problemId, status: 'unsolved', timeSpent: 0 };
};

const saveProblemProgress = (progress: IProblemProgress, userId: string): void => {
  const key = `${STORAGE_KEYS.PROGRESS_PREFIX}${progress.problemId}_${userId}`;
  localStorage.setItem(key, JSON.stringify(progress));
};

export const updateProblemStatus = (problemId: string, userId: string, status: 'attempted' | 'solved'): void => {
  const progress = getProblemProgress(problemId, userId);
  progress.status = status;
  progress.lastAttemptedAt = new Date().toISOString();
  saveProblemProgress(progress, userId);
};

export const updateTimeSpent = (problemId: string, userId: string, secondsToAdd: number): void => {
  const progress = getProblemProgress(problemId, userId);
  progress.timeSpent += secondsToAdd;
  saveProblemProgress(progress, userId);
};

export const getProblemStatusAndTime = (problemId: string, userId: string): IProblemProgress => {
  return getProblemProgress(problemId, userId);
};

// Get all problems with real submission-based status
export const getProblemsWithStatus = async (
  userId: string,
  filters?: {
    difficulty?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<IProblem & { progress: IProblemProgress }>> => {
  const parsedResponse = await getProblems(filters);

  // Fetch real submissions from backend to determine solved/attempted status
  let submissionMap: Record<string, 'solved' | 'attempted'> = {};
  try {
    const res = await api.get<{ success: boolean; data: ISubmission[] }>('/submissions/me?limit=500');
    const submissions = res.data || [];
    for (const sub of submissions) {
      const pid = typeof sub.problemId === 'string' ? sub.problemId : (sub.problemId as any)?._id?.toString?.() || (sub.problemId as any)?.toString?.() || '';
      if (!pid) continue;
      if (sub.status === 'Accepted') {
        submissionMap[pid] = 'solved';
      } else if (!submissionMap[pid]) {
        submissionMap[pid] = 'attempted';
      }
    }
  } catch {
    // If fetch fails, fall back to localStorage progress
  }

  const data = parsedResponse.data.map(problem => {
    // Prefer real submission status, fall back to localStorage
    const realStatus = submissionMap[problem._id];
    const localProgress = getProblemProgress(problem._id, userId);
    return {
      ...problem,
      progress: {
        ...localProgress,
        status: realStatus || localProgress.status,
      },
    };
  });
  
  return {
    ...parsedResponse,
    data,
  };
};

// Get submission history for a problem
export const getSubmissionHistory = async (problemId: string): Promise<ISubmission[]> => {
  try {
    const response = await api.get<{ success: boolean; data: ISubmission[] }>(`/submissions/me/problem/${problemId}`);
    return response.data;
  } catch {
    return [];
  }
};

// Submit code
export const submitCode = async (problemId: string, code: string, language: string): Promise<ISubmission> => {
  const response = await api.post<{ success: boolean; data: ISubmission }>('/submissions', {
    problemId,
    code,
    language,
  });
  return response.data;
};

// Mock test case validation (kept local since backend doesn't execute code)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validateTestCases = (_problemId: string, ..._args: string[]): ITestCaseResult[] => {
  return [
    { input: 'test', expectedOutput: 'test', actualOutput: 'test', passed: true, executionTime: 32 },
  ];
};

// Format code (kept local — no backend dependency)
export const formatCode = (code: string, language: string): string => {
  let formatted = code;
  if (language === 'javascript' || language === 'java' || language === 'cpp') {
    let indentLevel = 0;
    const lines = formatted.split(/[;\n]/);
    formatted = lines
      .map(line => {
        line = line.trim();
        if (line.includes('}')) indentLevel = Math.max(0, indentLevel - 1);
        const indented = '  '.repeat(indentLevel) + line;
        if (line.includes('{')) indentLevel++;
        return indented;
      })
      .join('\n');
  } else if (language === 'python') {
    const lines = code.split('\n');
    formatted = lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        const currentIndent = line.search(/\S/);
        const indentLvl = Math.floor(currentIndent / 2);
        return '    '.repeat(indentLvl) + trimmed;
      })
      .join('\n');
  }
  return formatted;
};
