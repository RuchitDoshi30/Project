// backend/src/types/auth.ts
export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
