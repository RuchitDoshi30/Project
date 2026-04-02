import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

/**
 * API Client Service
 *
 * Centralized HTTP client for all API requests.
 * Handles authentication, error handling, and request/response interceptors.
 *
 * In production, this will communicate with the backend API.
 */

// In dev: Vite proxy forwards /api/* to localhost:5000
// In prod: VITE_API_URL points to the Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — Render free tier cold starts can take 30-50s
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Deduplicate network error toasts — only show once per 10 seconds
let lastNetworkErrorToast = 0;
function showNetworkErrorOnce() {
  const now = Date.now();
  if (now - lastNetworkErrorToast > 10000) {
    lastNetworkErrorToast = now;
    toast.error('Server is waking up. Please wait a moment...', { duration: 5000 });
  }
}

/**
 * Response Interceptor
 * Handles retries (3 attempts with exponential backoff for cold starts),
 * authentication, and error toasts.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    const MAX_RETRIES = 3;

    // Retry logic: up to 3 retries with exponential backoff for network/5xx errors
    const isNetworkOrServerError =
      error.response?.status === undefined || error.response.status >= 500;
    const isRetryable =
      config &&
      (!config._retryCount || config._retryCount < MAX_RETRIES) &&
      isNetworkOrServerError &&
      error.response?.status !== 401;

    if (isRetryable) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = Math.min(2000 * Math.pow(2, config._retryCount - 1), 10000);
      // Only show toast on first retry
      if (config._retryCount === 1) showNetworkErrorOnce();
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle authorization errors
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    // Handle server errors (after all retries exhausted)
    if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle network errors (after all retries exhausted)
    if (!error.response) {
      toast.error('Unable to reach server. It may be starting up — please refresh in 30 seconds.');
      return Promise.reject(error);
    }

    // Handle validation errors
    if (error.response?.status === 400) {
      const message = (error.response.data as { message?: string })?.message || 'Invalid request.';
      toast.error(message);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

/**
 * Wake up the backend on app load.
 * Pings /health to trigger Render cold start early,
 * so real API calls don't have to wait.
 */
export async function wakeUpBackend() {
  try {
    const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, '');
    await axios.get(`${baseUrl}/health`, { timeout: 60000 });
  } catch {
    // Silently ignore — the retry interceptor will handle real API failures
  }
}

/**
 * API Helper Functions
 */
export const api = {
  // GET request
  get: async <T>(url: string, config?: object): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: unknown, config?: object): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: unknown, config?: object): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: unknown, config?: object): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: object): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for easy maintenance
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },

  // Problems
  PROBLEMS: {
    LIST: '/problems',
    DETAIL: (slug: string) => `/problems/${slug}`,
  },

  // Submissions
  SUBMISSIONS: {
    CREATE: '/submissions',
    MY: '/submissions/me',
    FOR_PROBLEM: (problemId: string) => `/submissions/me/problem/${problemId}`,
    ADMIN: '/submissions/admin',
    APPROVE: (id: string) => `/submissions/${id}/approve`,
    REJECT: (id: string) => `/submissions/${id}/reject`,
  },

  // Aptitude Tests
  APTITUDE: {
    TESTS: '/aptitude/tests',
    TEST_DETAIL: (id: string) => `/aptitude/tests/${id}`,
    QUESTIONS: '/aptitude/questions',
    ATTEMPTS: '/aptitude/attempts',
    MY_ATTEMPTS: '/aptitude/attempts/me',
    ATTEMPT_DETAIL: (id: string) => `/aptitude/attempts/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ADMIN_STATS: '/dashboard/admin-stats',
    ACTIVITY: '/dashboard/activity',
    LEADERBOARD: '/dashboard/leaderboard',
    REPORTS: '/dashboard/reports',
    STUDENTS: '/dashboard/students',
  },

  // Content
  ANNOUNCEMENTS: '/announcements',
  DRIVES: '/drives',
  BULK_EMAILS: '/bulk-emails',
} as const;
