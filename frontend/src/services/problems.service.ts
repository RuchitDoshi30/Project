import type { IProblem, ISubmission, ICodeSnippet, IProblemProgress, ITestCaseResult } from '../types/models';
import { mockProblems, mockSubmissions, mockSubmissionHistory } from '../mocks/problems.mock';

// Constants for localStorage keys
const STORAGE_KEYS = {
  CODE_PREFIX: 'code_',
  PROGRESS_PREFIX: 'progress_',
} as const;
// Get all problems with optional filters
export const getProblems = (filters?: {
  difficulty?: string;
  tags?: string[];
  search?: string;
}): IProblem[] => {
  let filtered = [...mockProblems];

  if (filters?.difficulty) {
    filtered = filtered.filter(p => p.difficulty === filters.difficulty);
  }

  if (filters?.tags && filters.tags.length > 0) {
    filtered = filtered.filter(p => 
      filters.tags!.some(tag => p.tags.includes(tag))
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

// Get single problem by ID
export const getProblemById = (id: string): IProblem | undefined => {
  return mockProblems.find(p => p._id === id);
};

// Get single problem by slug
export const getProblemBySlug = (slug: string): IProblem | undefined => {
  return mockProblems.find(p => p.slug === slug);
};

// Get user's submission for a problem
export const getUserSubmission = (problemId: string, userId: string): ISubmission | undefined => {
  return mockSubmissions.find(s => s.problemId === problemId && s.userId === userId);
};

// Save user's code (mock)
export const saveCode = async (problemId: string, userId: string, code: string, language: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would save to backend via API
  localStorage.setItem(`${STORAGE_KEYS.CODE_PREFIX}${problemId}_${userId}`, JSON.stringify({ code, language }));
};

// Get saved code
export const getSavedCode = (problemId: string, userId: string): { code: string; language: string } | null => {
  const saved = localStorage.getItem(`${STORAGE_KEYS.CODE_PREFIX}${problemId}_${userId}`);
  return saved ? JSON.parse(saved) : null;
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const tagsSet = new Set<string>();
  mockProblems.forEach(p => p.tags.forEach(tag => tagsSet.add(tag)));
  return Array.from(tagsSet).sort();
};

// Code Snippets Library
export const codeSnippets: Record<string, ICodeSnippet[]> = {
  javascript: [
    { label: 'For Loop', code: 'for (let i = 0; i < arr.length; i++) {\n  // code\n}', description: 'Standard for loop' },
    { label: 'Array Sort', code: 'arr.sort((a, b) => a - b); // ascending', description: 'Sort array numerically' },
    { label: 'Two Pointers', code: 'let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  // logic\n  left++;\n  right--;\n}', description: 'Two pointer technique' },
    { label: 'Hash Map', code: 'const map = new Map();\nmap.set(key, value);\nif (map.has(key)) {\n  // exists\n}', description: 'Using Map for lookups' },
    { label: 'BFS Queue', code: 'const queue = [root];\nwhile (queue.length) {\n  const node = queue.shift();\n  // process node\n}', description: 'Breadth-first search' },
    { label: 'DFS Recursion', code: 'function dfs(node) {\n  if (!node) return;\n  // process\n  dfs(node.left);\n  dfs(node.right);\n}', description: 'Depth-first search' },
  ],
  python: [
    { label: 'For Loop', code: 'for i in range(len(arr)):\n    # code', description: 'Standard for loop' },
    { label: 'List Sort', code: 'arr.sort()  # ascending\narr.sort(reverse=True)  # descending', description: 'Sort list' },
    { label: 'Two Pointers', code: 'left, right = 0, len(arr) - 1\nwhile left < right:\n    # logic\n    left += 1\n    right -= 1', description: 'Two pointer technique' },
    { label: 'Dictionary', code: 'hashmap = {}\nhashmap[key] = value\nif key in hashmap:\n    # exists', description: 'Using dict for lookups' },
    { label: 'BFS Queue', code: 'from collections import deque\nqueue = deque([root])\nwhile queue:\n    node = queue.popleft()\n    # process', description: 'Breadth-first search' },
    { label: 'DFS Recursion', code: 'def dfs(node):\n    if not node:\n        return\n    # process\n    dfs(node.left)\n    dfs(node.right)', description: 'Depth-first search' },
  ],
  java: [
    { label: 'For Loop', code: 'for (int i = 0; i < arr.length; i++) {\n    // code\n}', description: 'Standard for loop' },
    { label: 'Array Sort', code: 'Arrays.sort(arr);  // ascending', description: 'Sort array' },
    { label: 'Two Pointers', code: 'int left = 0, right = arr.length - 1;\nwhile (left < right) {\n    // logic\n    left++;\n    right--;\n}', description: 'Two pointer technique' },
    { label: 'HashMap', code: 'Map<Integer, Integer> map = new HashMap<>();\nmap.put(key, value);\nif (map.containsKey(key)) {\n    // exists\n}', description: 'Using HashMap for lookups' },
    { label: 'BFS Queue', code: 'Queue<Node> queue = new LinkedList<>();\nqueue.offer(root);\nwhile (!queue.isEmpty()) {\n    Node node = queue.poll();\n    // process\n}', description: 'Breadth-first search' },
  ],
  cpp: [
    { label: 'For Loop', code: 'for (int i = 0; i < arr.size(); i++) {\n    // code\n}', description: 'Standard for loop' },
    { label: 'Vector Sort', code: 'sort(arr.begin(), arr.end());  // ascending', description: 'Sort vector' },
    { label: 'Two Pointers', code: 'int left = 0, right = arr.size() - 1;\nwhile (left < right) {\n    // logic\n    left++;\n    right--;\n}', description: 'Two pointer technique' },
    { label: 'Unordered Map', code: 'unordered_map<int, int> umap;\numap[key] = value;\nif (umap.find(key) != umap.end()) {\n    // exists\n}', description: 'Using unordered_map for lookups' },
    { label: 'BFS Queue', code: 'queue<Node*> q;\nq.push(root);\nwhile (!q.empty()) {\n    Node* node = q.front();\n    q.pop();\n    // process\n}', description: 'Breadth-first search' },
  ],
};

// Problem progress tracking (stores status and time spent)
const getProblemProgress = (problemId: string, userId: string): IProblemProgress => {
  const key = `${STORAGE_KEYS.PROGRESS_PREFIX}${problemId}_${userId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    problemId,
    status: 'unsolved',
    timeSpent: 0,
  };
};

const saveProblemProgress = (progress: IProblemProgress, userId: string): void => {
  const key = `${STORAGE_KEYS.PROGRESS_PREFIX}${progress.problemId}_${userId}`;
  localStorage.setItem(key, JSON.stringify(progress));
};

// Update problem status (called when user solves/attempts)
export const updateProblemStatus = (
  problemId: string,
  userId: string,
  status: 'attempted' | 'solved'
): void => {
  const progress = getProblemProgress(problemId, userId);
  progress.status = status;
  progress.lastAttemptedAt = new Date().toISOString();
  saveProblemProgress(progress, userId);
};

// Track time spent on problem
export const updateTimeSpent = (problemId: string, userId: string, secondsToAdd: number): void => {
  const progress = getProblemProgress(problemId, userId);
  progress.timeSpent += secondsToAdd;
  saveProblemProgress(progress, userId);
};

// Get problem progress
export const getProblemStatusAndTime = (
  problemId: string,
  userId: string
): IProblemProgress => {
  return getProblemProgress(problemId, userId);
};

// Get all problems with status
export const getProblemsWithStatus = (userId: string): (IProblem & { progress: IProblemProgress })[] => {
  return mockProblems.map(problem => ({
    ...problem,
    progress: getProblemProgress(problem._id, userId),
  }));
};

// Get submission history
export const getSubmissionHistory = (problemId: string, userId: string): ISubmission[] => {
  return mockSubmissionHistory[`${problemId}_${userId}`] || [];
};

// Mock test case validation (simulates running code)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validateTestCases = (problemId: string, ..._args: string[]): ITestCaseResult[] => {
  const problem = getProblemById(problemId);
  if (!problem) return [];

  // Mock validation - randomly pass/fail based on problem
  const allPassed = problemId === '1' || problemId === '2'; // Some problems "pass"
  
  return problem.testCases.map((tc, idx) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    actualOutput: allPassed ? tc.expectedOutput : (idx === 0 ? tc.expectedOutput : 'null'),
    passed: allPassed || idx === 0,
    executionTime: Math.floor(Math.random() * 50) + 20,
  }));
};

// Format code (mock Prettier-style formatting)
export const formatCode = (code: string, language: string): string => {
  // Simple mock formatting - add proper indentation
  let formatted = code;
  
  if (language === 'javascript' || language === 'java' || language === 'cpp') {
    // Add spaces around operators
    formatted = formatted
      .replace(/([=<>!+\-*/])(?!=)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Basic bracket indentation
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
    // Python formatting - ensure 4-space indentation
    const lines = code.split('\n');
    formatted = lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        const currentIndent = line.search(/\S/);
        const indentLevel = Math.floor(currentIndent / 2);
        return '    '.repeat(indentLevel) + trimmed;
      })
      .join('\n');
  }
  
  return formatted;
};
