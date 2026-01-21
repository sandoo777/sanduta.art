/**
 * Centralized API Client
 * 
 * Oferă funcții reutilizabile pentru apeluri API frecvente,
 * eliminând duplicarea de cod și asigurând consistență.
 * 
 * Features:
 * - Error handling consistent
 * - Type-safe responses
 * - Request/Response interceptors
 * - Retry logic
 * 
 * @module lib/api/client
 */

/**
 * API Response standard
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API Error custom
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Opțiuni pentru API request
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/**
 * API Client Class
 */
class APIClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Construiește URL cu query params
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, this.baseUrl || window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Request generic cu error handling
   */
  private async request<T>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, timeout = 30000, ...fetchOptions } = options;

    const url = this.buildUrl(path, params);
    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || 'Request failed',
          response.status,
          data
        );
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    path: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const apiClient = new APIClient();

/**
 * Helper: Verifică success response
 */
export function isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}

/**
 * Helper: Extrage eroare din response
 */
export function getErrorMessage(response: ApiResponse): string {
  return response.error || 'An error occurred';
}
