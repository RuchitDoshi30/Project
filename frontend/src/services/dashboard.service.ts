import type { IUserProgress } from '../types/models';
import { api } from './api.client';

// Fetch real user progress from API
export const fetchUserProgress = async (): Promise<IUserProgress> => {
  const response = await api.get<{ success: boolean; data: IUserProgress }>('/dashboard/stats');
  return response.data;
};

// Fetch recent activity (submissions + aptitude attempts)
export interface RecentActivity {
  id: string;
  type: 'coding' | 'aptitude';
  title: string;
  status: 'completed' | 'attempted' | 'passed' | 'failed';
  timestamp: string;
  score?: number;
}

export const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
  const response = await api.get<{ success: boolean; data: RecentActivity[] }>('/dashboard/activity');
  return response.data || [];
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

// Time investment tracking
export interface TimeInvestment {
  today: number;
  thisWeek: number;
  averagePerDay: number;
  lastWeek: number;
}

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

// Calculate progress percentage
export const calculateProgress = (progress: IUserProgress): number => {
  const totalSolved = progress.problemsSolved.easy + progress.problemsSolved.medium + progress.problemsSolved.hard;
  const targetProblems = 100;
  return Math.min(Math.round((totalSolved / targetProblems) * 100), 100);
};

// Calculate success rate
export const calculateSuccessRate = (progress: IUserProgress): number => {
  const totalSolved = progress.problemsSolved.easy + progress.problemsSolved.medium + progress.problemsSolved.hard;
  if (progress.totalSubmissions === 0) return 0;
  return Math.round((totalSolved / progress.totalSubmissions) * 100);
};
