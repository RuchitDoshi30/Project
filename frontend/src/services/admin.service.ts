import type { DifficultyLevel, AptitudeCategory } from '../types/models';
import { mockStatistics, mockRecentSubmissions, mockStudentActivity } from '../mocks/admin.mock';

/**
 * Admin Service
 * 
 * Provides data and operations for the admin dashboard and management interfaces.
 * In production, these would be API calls to the backend.
 */

// Admin Statistics Interface
export interface AdminStatistics {
  totalStudents: number;
  newStudentsThisMonth: number;
  activeStudents: number;
  totalProblems: number;
  totalAptitudeQuestions: number;
  pendingSubmissions: number;
  submissionsToday: number;
  submissionsThisWeek: number;
  approvalRate: number;
  averageProblemsPerStudent: number;
  problemsByDifficulty: Record<DifficultyLevel, number>;
  aptitudeByCategory: Record<AptitudeCategory, number>;
}

// Recent Submission Interface
export interface RecentSubmission {
  id: string;
  problemTitle: string;
  studentName: string;
  studentId: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Wrong Answer';
  timestamp: string;
  language?: string;
}

// Student Activity Interface
export interface StudentActivity {
  id: string;
  studentName: string;
  studentId: string;
  type: 'coding' | 'aptitude' | 'achievement';
  action: string;
  timestamp: string;
}

// System Health Interface
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  uptime: number;
  lastBackup?: string;
}

/**
 * Get comprehensive admin statistics
 * 
 * @returns {AdminStatistics} Platform statistics
 */
export const getAdminStatistics = (): AdminStatistics => {
  return mockStatistics;
};

/**
 * Get recent code submissions
 * 
 * @param {number} limit - Number of submissions to retrieve
 * @returns {RecentSubmission[]} Recent submissions
 */
export const getRecentSubmissions = (limit: number = 10): RecentSubmission[] => {
  return mockRecentSubmissions.slice(0, limit);
};

/**
 * Get recent student activity
 * 
 * @param {number} limit - Number of activities to retrieve
 * @returns {StudentActivity[]} Recent student activities
 */
export const getRecentStudentActivity = (limit: number = 10): StudentActivity[] => {
  return mockStudentActivity.slice(0, limit);
};

/**
 * Get system health status
 * 
 * @returns {SystemHealth} System health information
 */
export const getSystemHealth = (): SystemHealth => {
  const pendingCount = mockStatistics.pendingSubmissions;
  
  if (pendingCount > 50) {
    return {
      status: 'critical',
      message: 'High number of pending submissions. Immediate attention required.',
      uptime: 99.8,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
  } else if (pendingCount > 20) {
    return {
      status: 'warning',
      message: 'Moderate number of pending submissions. Review recommended.',
      uptime: 99.9,
      lastBackup: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    };
  }
  
  return {
    status: 'healthy',
    message: 'All systems operational.',
    uptime: 99.95,
    lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  };
};

/**
 * Get pending submissions for review
 * 
 * @returns {RecentSubmission[]} Pending submissions
 */
export const getPendingSubmissions = (): RecentSubmission[] => {
  return mockRecentSubmissions.filter(s => s.status === 'Pending');
};

/**
 * Approve a submission
 * 
 * @param {string} submissionId - Submission ID
 * @returns {Promise<void>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const approveSubmission = async (_submissionId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In production, this would update the backend via API call
};

/**
 * Reject a submission
 * 
 * @param {string} submissionId - Submission ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<void>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const rejectSubmission = async (_submissionId: string, _reason: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In production, this would update the backend via API call with rejection reason
};
