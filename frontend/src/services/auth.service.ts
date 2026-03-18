import type { IUser } from '../types/models';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';
import { api, API_ENDPOINTS } from './api.client';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<{ success: boolean; token: string; user: IUser }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

    return {
      token: response.token,
      user: response.user,
    };
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
