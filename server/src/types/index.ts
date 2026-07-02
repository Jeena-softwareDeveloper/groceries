/** User roles across the platform */
export type UserRole = 'SUPER_ADMIN' | 'VENDOR' | 'VENDOR_STAFF' | 'CUSTOMER';

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  cursor?: string;
}

/** Health check payload */
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down' | 'unknown';
    redis: 'up' | 'down' | 'unknown';
  };
}

/** Geographic hierarchy */
export interface District {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Area {
  id: string;
  districtId: string;
  name: string;
  isActive: boolean;
}

/** Pagination query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}
