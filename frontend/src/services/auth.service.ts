import type { IUser } from '../types/models';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

// Mock users for development (matching backend mockUsers)
const MOCK_USERS: Array<IUser & { password: string }> = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@college.edu',
    universityId: 'ADMIN001',
    role: 'admin',
    password: 'admin123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'john.doe@college.edu',
    universityId: 'STU001',
    role: 'student',
    branch: 'Computer Science',
    semester: 6,
    enrollmentYear: 2021,
    password: 'student123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@college.edu',
    universityId: 'STU002',
    role: 'student',
    branch: 'Information Technology',
    semester: 4,
    enrollmentYear: 2022,
    password: 'student123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    await delay(800); // Simulate network delay

    const user = MOCK_USERS.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Create mock JWT token
    const token = `mock_jwt_${user._id}_${Date.now()}`;

    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      universityId: user.universityId,
      role: user.role,
      branch: user.branch,
      semester: user.semester,
      enrollmentYear: user.enrollmentYear,
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): IUser | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as IUser;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};
