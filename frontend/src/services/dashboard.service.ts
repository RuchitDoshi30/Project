import type { IUserProgress } from '../types/models';

// Mock user progress data
export const mockUserProgress: IUserProgress = {
  userId: '2',
  problemsSolved: {
    easy: 12,
    medium: 8,
    hard: 3,
  },
  aptitudeTestsTaken: 5,
  lastActiveDate: new Date().toISOString(),
  totalSubmissions: 45,
};

// Previous week stats for comparison
export const previousWeekStats = {
  problemsSolved: 18,
  successRate: 54,
  testsCompleted: 4,
};

// Topic-wise breakdown
export interface TopicProgress {
  id: string;
  name: string;
  solved: number;
  total: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
}

export const mockTopicProgress: TopicProgress[] = [
  { id: '1', name: 'Arrays', solved: 12, total: 20, percentage: 60, trend: 'up', needsAttention: false },
  { id: '2', name: 'Strings', solved: 8, total: 15, percentage: 53, trend: 'stable', needsAttention: false },
  { id: '3', name: 'Dynamic Programming', solved: 2, total: 15, percentage: 13, trend: 'down', needsAttention: true },
  { id: '4', name: 'Trees & Graphs', solved: 5, total: 12, percentage: 42, trend: 'up', needsAttention: false },
  { id: '5', name: 'Linked Lists', solved: 4, total: 8, percentage: 50, trend: 'stable', needsAttention: false },
];

// Time investment tracking
export interface TimeInvestment {
  today: number; // minutes
  thisWeek: number;
  averagePerDay: number;
  lastWeek: number;
}

export const mockTimeInvestment: TimeInvestment = {
  today: 45,
  thisWeek: 225, // 3h 45m
  averagePerDay: 32,
  lastWeek: 180, // 3h
};

// Next action recommendation
export interface NextAction {
  type: 'resume' | 'suggested' | 'test' | 'weak-area';
  title: string;
  description: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

export const mockNextActions: NextAction[] = [
  {
    type: 'resume',
    title: 'Two Sum Problem',
    description: 'Continue from where you left off',
    difficulty: 'Beginner',
    estimatedTime: 15,
    actionUrl: '/coding/two-sum',
    priority: 'high',
  },
  {
    type: 'weak-area',
    title: 'Climbing Stairs',
    description: 'Start with Dynamic Programming basics',
    difficulty: 'Beginner',
    estimatedTime: 20,
    actionUrl: '/coding/climbing-stairs',
    priority: 'high',
    reason: 'You need practice in Dynamic Programming',
  },
  {
    type: 'test',
    title: 'Mock Aptitude Test',
    description: 'Scheduled for tomorrow',
    estimatedTime: 30,
    actionUrl: '/aptitude',
    priority: 'medium',
  },
];

// Mock recent activity
export interface RecentActivity {
  id: string;
  type: 'coding' | 'aptitude';
  title: string;
  status: 'completed' | 'attempted' | 'passed' | 'failed';
  timestamp: string;
  score?: number;
}

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'coding',
    title: 'Two Sum',
    status: 'completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'aptitude',
    title: 'Quantitative Aptitude Test',
    status: 'passed',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    score: 85,
  },
  {
    id: '3',
    type: 'coding',
    title: 'Valid Parentheses',
    status: 'completed',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'aptitude',
    title: 'Logical Reasoning Test',
    status: 'passed',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    score: 92,
  },
  {
    id: '5',
    type: 'coding',
    title: 'Reverse Linked List',
    status: 'attempted',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock upcoming problems/tests
export interface UpcomingItem {
  id: string;
  type: 'coding' | 'aptitude';
  title: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  estimatedTime: number; // in minutes
}

export const mockUpcomingItems: UpcomingItem[] = [
  {
    id: '1',
    type: 'coding',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Beginner',
    estimatedTime: 20,
  },
  {
    id: '2',
    type: 'aptitude',
    title: 'Verbal Ability Test',
    category: 'Verbal',
    estimatedTime: 30,
  },
  {
    id: '3',
    type: 'coding',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Intermediate',
    estimatedTime: 30,
  },
];

// Calculate progress percentage
export const calculateProgress = (progress: IUserProgress): number => {
  const totalSolved = progress.problemsSolved.easy + progress.problemsSolved.medium + progress.problemsSolved.hard;
  const targetProblems = 100; // Target for completion
  return Math.min(Math.round((totalSolved / targetProblems) * 100), 100);
};

// Calculate success rate
export const calculateSuccessRate = (progress: IUserProgress): number => {
  const totalSolved = progress.problemsSolved.easy + progress.problemsSolved.medium + progress.problemsSolved.hard;
  if (progress.totalSubmissions === 0) return 0;
  return Math.round((totalSolved / progress.totalSubmissions) * 100);
};
