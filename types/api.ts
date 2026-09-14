// ─── API Response Wrappers ────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}

export interface PageResponse<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
