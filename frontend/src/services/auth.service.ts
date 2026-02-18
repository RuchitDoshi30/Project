import type { IUser } from '../types/models';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';
// import { api, API_ENDPOINTS } from './api.client';

/**
 * Authentication Service
 * 
 * NOTE: Currently using mock data for development.
 * When backend is ready, uncomment API client imports and update functions to use real API calls.
 * Example migration:
 * - const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
 * - localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
 */

// Storage keys constants
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

// Mock users for development (matching backend mockUsers)
// NOTE: In production, authentication is handled by backend API with secure password hashing
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
    try {
      await delay(800); // Simulate network delay

      const user = MOCK_USERS.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      // Create mock JWT token
      const token = `mock_jwt_${user._id}_${Date.now()}`;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));

      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to log in. Please try again later.');
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser: (): IUser | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as IUser;
    } catch {
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
