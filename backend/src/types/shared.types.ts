/**
 * Shared API response types for consistent contracts.
 */

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  stack?: string;
}

/** Paginated API response (page-based) */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  total: number;
}

/** Cursor-paginated API response */
export interface CursorPaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  nextCursor: string | null;
  hasMore: boolean;
}
