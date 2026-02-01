// backend/src/config/mockUsers.ts
import { AuthUser } from '../types/auth';

export interface MockUser extends AuthUser {
  password: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'admin-001',
    email: 'admin@marwadiuniversity.edu.in',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'student-001',
    email: 'student@marwadiuniversity.edu.in',
    password: 'student123',
    role: 'student',
  },
];
