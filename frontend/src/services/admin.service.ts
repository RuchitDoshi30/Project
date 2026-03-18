import type { DifficultyLevel, AptitudeCategory } from '../types/models';
import { api } from './api.client';

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

export interface RecentSubmission {
  id: string;
  _id?: string;
  problemTitle: string;
  problemId?: { title: string; slug: string; difficulty: string };
  studentName: string;
  studentId: string;
  userId?: { name: string; email: string; universityId: string };
  status: 'Pending' | 'Pending Review' | 'Accepted' | 'Rejected' | 'Wrong Answer';
  timestamp: string;
  submittedAt?: string;
  language?: string;
}

export interface StudentActivity {
  id: string;
  studentName: string;
  studentId: string;
  type: 'coding' | 'aptitude' | 'achievement';
  action: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  uptime: number;
  lastBackup?: string;
}

export const getAdminStatistics = async (): Promise<AdminStatistics> => {
  const response = await api.get<{ success: boolean; data: AdminStatistics }>('/dashboard/admin-stats');
  return response.data;
};

export const getRecentSubmissions = async (limit: number = 10): Promise<RecentSubmission[]> => {
  const response = await api.get<{ success: boolean; data: any[] }>(`/submissions/admin?limit=${limit}`);
  return response.data.map((s: any) => ({
    id: s._id,
    problemTitle: s.problemId?.title || 'Unknown',
    studentName: s.userId?.name || 'Unknown',
    studentId: s.userId?.universityId || 'Unknown',
    status: s.status,
    timestamp: s.submittedAt,
    language: s.language,
  }));
};

export const getRecentStudentActivity = async (limit: number = 10): Promise<StudentActivity[]> => {
  // Derive from recent submissions
  const submissions = await getRecentSubmissions(limit);
  return submissions.map((s, i) => ({
    id: String(i + 1),
    studentName: s.studentName,
    studentId: s.studentId,
    type: 'coding' as const,
    action: `Submitted solution for ${s.problemTitle}`,
    timestamp: s.timestamp,
  }));
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const stats = await getAdminStatistics();
  if (stats.pendingSubmissions > 50) {
    return { status: 'critical', message: 'High number of pending submissions.', uptime: 99.8 };
  } else if (stats.pendingSubmissions > 20) {
    return { status: 'warning', message: 'Moderate pending submissions.', uptime: 99.9 };
  }
  return { status: 'healthy', message: 'All systems operational.', uptime: 99.95 };
};

export const getPendingSubmissions = async (): Promise<RecentSubmission[]> => {
  const response = await api.get<{ success: boolean; data: any[] }>('/submissions/admin?status=Pending Review');
  return response.data.map((s: any) => ({
    id: s._id,
    problemTitle: s.problemId?.title || 'Unknown',
    studentName: s.userId?.name || 'Unknown',
    studentId: s.userId?.universityId || 'Unknown',
    status: s.status,
    timestamp: s.submittedAt,
    language: s.language,
  }));
};

export const approveSubmission = async (submissionId: string): Promise<void> => {
  await api.patch(`/submissions/${submissionId}/approve`);
};

export const rejectSubmission = async (submissionId: string, _reason: string): Promise<void> => {
  await api.patch(`/submissions/${submissionId}/reject`);
};
