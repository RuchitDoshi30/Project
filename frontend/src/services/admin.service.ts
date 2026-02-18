import type { DifficultyLevel, AptitudeCategory } from '../types/models';

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

// Mock Data
const mockStatistics: AdminStatistics = {
  totalStudents: 156,
  newStudentsThisMonth: 12,
  activeStudents: 134,
  totalProblems: 8,
  totalAptitudeQuestions: 175,
  pendingSubmissions: 23,
  submissionsToday: 45,
  submissionsThisWeek: 312,
  approvalRate: 67,
  averageProblemsPerStudent: 4.2,
  problemsByDifficulty: {
    Beginner: 3,
    Intermediate: 4,
    Advanced: 1,
  },
  aptitudeByCategory: {
    Quantitative: 60,
    Logical: 55,
    Verbal: 35,
    Technical: 25,
  },
};

const mockRecentSubmissions: RecentSubmission[] = [
  {
    id: '1',
    problemTitle: 'Two Sum',
    studentName: 'Rahul Sharma',
    studentId: 'ST2024001',
    status: 'Pending',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    language: 'Python',
  },
  {
    id: '2',
    problemTitle: 'Valid Parentheses',
    studentName: 'Priya Patel',
    studentId: 'ST2024002',
    status: 'Accepted',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    language: 'JavaScript',
  },
  {
    id: '3',
    problemTitle: 'Binary Search',
    studentName: 'Amit Kumar',
    studentId: 'ST2024003',
    status: 'Pending',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    language: 'Java',
  },
  {
    id: '4',
    problemTitle: 'Reverse Linked List',
    studentName: 'Sneha Reddy',
    studentId: 'ST2024004',
    status: 'Wrong Answer',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    language: 'C++',
  },
  {
    id: '5',
    problemTitle: 'Maximum Subarray',
    studentName: 'Vikram Singh',
    studentId: 'ST2024005',
    status: 'Accepted',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    language: 'Python',
  },
  {
    id: '6',
    problemTitle: 'Climbing Stairs',
    studentName: 'Ananya Iyer',
    studentId: 'ST2024006',
    status: 'Pending',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    language: 'JavaScript',
  },
  {
    id: '7',
    problemTitle: 'Merge Two Sorted Lists',
    studentName: 'Rohan Gupta',
    studentId: 'ST2024007',
    status: 'Accepted',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    language: 'Python',
  },
];

const mockStudentActivity: StudentActivity[] = [
  {
    id: '1',
    studentName: 'Rahul Sharma',
    studentId: 'ST2024001',
    type: 'coding',
    action: 'Submitted solution for Two Sum',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    studentName: 'Priya Patel',
    studentId: 'ST2024002',
    type: 'aptitude',
    action: 'Completed Quantitative Aptitude Test',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    studentName: 'Amit Kumar',
    studentId: 'ST2024003',
    type: 'coding',
    action: 'Started solving Binary Search',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    studentName: 'Sneha Reddy',
    studentId: 'ST2024004',
    type: 'achievement',
    action: 'Solved 10 problems milestone',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    studentName: 'Vikram Singh',
    studentId: 'ST2024005',
    type: 'coding',
    action: 'Submitted solution for Maximum Subarray',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    studentName: 'Ananya Iyer',
    studentId: 'ST2024006',
    type: 'aptitude',
    action: 'Completed Logical Reasoning Test',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    studentName: 'Rohan Gupta',
    studentId: 'ST2024007',
    type: 'coding',
    action: 'Submitted solution for Merge Two Sorted Lists',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    studentName: 'Kavya Nair',
    studentId: 'ST2024008',
    type: 'coding',
    action: 'Started solving Climbing Stairs',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    studentName: 'Arjun Mehta',
    studentId: 'ST2024009',
    type: 'achievement',
    action: 'Completed first aptitude test',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    studentName: 'Divya Krishnan',
    studentId: 'ST2024010',
    type: 'coding',
    action: 'Submitted solution for Valid Parentheses',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

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
