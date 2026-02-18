import type { IProblem, ISubmission, ICodeSnippet, IProblemProgress, ITestCaseResult } from '../types/models';

// Constants for localStorage keys
const STORAGE_KEYS = {
  CODE_PREFIX: 'code_',
  PROGRESS_PREFIX: 'progress_',
} as const;

// Mock problems data
export const mockProblems: IProblem[] = [
  {
    _id: '1',
    slug: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
    difficulty: 'Beginner',
    tags: ['Array', 'Hash Table'],
    constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3], 6', expectedOutput: '[0,1]', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
    difficulty: 'Beginner',
    tags: ['String', 'Stack'],
    constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    slug: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

**Example 1:**
\`\`\`
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\`

**Example 2:**
\`\`\`
Input: list1 = [], list2 = []
Output: []
\`\`\`

**Example 3:**
\`\`\`
Input: list1 = [], list2 = [0]
Output: [0]
\`\`\``,
    difficulty: 'Beginner',
    tags: ['Linked List', 'Recursion'],
    constraints: `- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both list1 and list2 are sorted in non-decreasing order.`,
    testCases: [
      { input: '[1,2,4], [1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
      { input: '[], []', expectedOutput: '[]', isHidden: false },
      { input: '[], [0]', expectedOutput: '[0]', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    slug: 'binary-search',
    title: 'Binary Search',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

**Example 1:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
Explanation: 2 does not exist in nums so return -1
\`\`\``,
    difficulty: 'Intermediate',
    tags: ['Array', 'Binary Search'],
    constraints: `- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique.
- nums is sorted in ascending order.`,
    testCases: [
      { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1', isHidden: false },
      { input: '[5], 5', expectedOutput: '0', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    slug: 'maximum-subarray',
    title: 'Maximum Subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

**Example 1:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.
\`\`\``,
    difficulty: 'Intermediate',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    constraints: `- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '6',
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

**Example 1:**
\`\`\`
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
\`\`\`

**Example 2:**
\`\`\`
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
\`\`\``,
    difficulty: 'Beginner',
    tags: ['Dynamic Programming', 'Math', 'Memoization'],
    constraints: `- 1 <= n <= 45`,
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '5', expectedOutput: '8', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '7',
    slug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1,2]
Output: [2,1]
\`\`\`

**Example 3:**
\`\`\`
Input: head = []
Output: []
\`\`\``,
    difficulty: 'Intermediate',
    tags: ['Linked List', 'Recursion'],
    constraints: `- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000`,
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '8',
    slug: 'binary-tree-level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    description: `Given the \`root\` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

**Example 1:**
\`\`\`
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
\`\`\`

**Example 2:**
\`\`\`
Input: root = [1]
Output: [[1]]
\`\`\`

**Example 3:**
\`\`\`
Input: root = []
Output: []
\`\`\``,
    difficulty: 'Intermediate',
    tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
    constraints: `- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000`,
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
      { input: '[1]', expectedOutput: '[[1]]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
    ],
    createdBy: '1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock user submissions
export const mockSubmissions: ISubmission[] = [
  {
    _id: '1',
    problemId: '1',
    userId: '2',
    code: 'function twoSum(nums, target) {\n  // Your solution here\n}',
    language: 'javascript',
    status: 'Accepted',
    testCasesPassed: 3,
    totalTestCases: 3,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

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

// Mock submission history
const mockSubmissionHistory: Record<string, ISubmission[]> = {
  '1_2': [ // problemId_userId
    {
      _id: 's1',
      problemId: '1',
      userId: '2',
      code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}',
      language: 'javascript',
      status: 'Accepted',
      executionTime: 68,
      memory: 42.1,
      testCasesPassed: 3,
      totalTestCases: 3,
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 's2',
      problemId: '1',
      userId: '2',
      code: 'function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n}',
      language: 'javascript',
      status: 'Time Limit Exceeded',
      executionTime: 1500,
      testCasesPassed: 2,
      totalTestCases: 3,
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ],
  '2_2': [
    {
      _id: 's3',
      problemId: '2',
      userId: '2',
      code: 'function isValid(s) {\n  const stack = [];\n  const pairs = { "(": ")", "{": "}", "[": "]" };\n  for (let char of s) {\n    if (pairs[char]) {\n      stack.push(char);\n    } else {\n      const last = stack.pop();\n      if (pairs[last] !== char) return false;\n    }\n  }\n  return stack.length === 0;\n}',
      language: 'javascript',
      status: 'Accepted',
      executionTime: 52,
      memory: 38.5,
      testCasesPassed: 3,
      totalTestCases: 3,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
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
