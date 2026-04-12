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
      credentials,
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

  /** Update profile (name, bio, notifications, privacy) */
  updateProfile: async (data: {
    name?: string;
    bio?: string;
    notifications?: Partial<IUser['notifications']>;
    privacy?: Partial<IUser['privacy']>;
  }): Promise<IUser> => {
    const response = await api.put<{ success: boolean; user: IUser }>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data,
    );
    // Sync localStorage with the latest user data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    return response.user;
  },

  /** Change password */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, { currentPassword, newPassword });
  },

  /** Download all user data as a JSON file */
  downloadMyData: async (): Promise<void> => {
    const response = await api.get<{ success: boolean; data: unknown }>(
      API_ENDPOINTS.AUTH.DOWNLOAD_DATA,
    );
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /** Soft-delete account */
  deleteAccount: async (): Promise<void> => {
    await api.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};
