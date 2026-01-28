import { API_CONFIG } from '../config/api.config';
import type { ApiError, RefreshResponse } from '../types/api.types';

// Token storage in memory (not localStorage)
let accessToken: string | null = null;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

// Function to subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers with new token
const onTokenRefreshed = (token: string | null) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * HTTP client for making API requests with automatic token management.
 * Handles authentication, token refresh, and error handling.
 */
export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  /**
   * Gets the current access token from memory.
   * @returns The current access token or null if not set
   */
  getToken(): string | null {
    return accessToken;
  }

  /**
   * Sets the access token in memory.
   * @param token - The access token to store, or null to clear
   */
  setToken(token: string | null): void {
    accessToken = token;
  }

  /**
   * Clears the access token from memory.
   */
  clearToken(): void {
    accessToken = null;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  /**
   * Attempts to refresh the access token using the refresh token cookie.
   * @returns The new access token or null if refresh failed
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        this.clearToken();
        return null;
      }

      const data: RefreshResponse = await response.json();
      this.setToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearToken();
      return null;
    }
  }

  // Handle 401 response by refreshing token and retrying request
  private async handleUnauthorized<T>(
    retryFn: () => Promise<T>
  ): Promise<T> {
    if (isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            retryFn().then(resolve).catch(reject);
          } else {
            // Redirect to login when session is completely expired
            this.redirectToLogin();
            reject(new Error('Session expired. Please login again.'));
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();
      onTokenRefreshed(newToken);

      if (!newToken) {
        // Redirect to login when refresh token is also expired
        this.redirectToLogin();
        throw new Error('Session expired. Please login again.');
      }

      return retryFn();
    } finally {
      isRefreshing = false;
    }
  }

  // Redirect to login page when session expires
  private redirectToLogin(): void {
    // Clear any remaining state
    this.clearToken();

    // Only redirect if not already on auth pages
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register') {
      window.location.href = '/';
    }
  }

  private async handleResponse<T>(response: Response, retryFn?: () => Promise<T>): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    // If 401 and we have a retry function, try to refresh token
    if (response.status === 401 && retryFn) {
      return this.handleUnauthorized(retryFn);
    }

    if (!response.ok) {
      if (isJson) {
        const errorData = (await response.json()) as Partial<ApiError>;
        const errorMessage = errorData.error || errorData.message || 'Request failed';
        throw new Error(errorMessage);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (isJson) {
      return await response.json();
    }

    // Handle 204 No Content (common for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    // For other non-JSON responses, throw an error as this is unexpected
    throw new Error(`Unexpected non-JSON response with status: ${response.status}`);
  }

  /**
   * Makes a GET request to the specified endpoint.
   * @param endpoint - The API endpoint to call
   * @param includeAuth - Whether to include the Authorization header (default: true)
   * @returns Promise resolving to the response data
   * @throws Error if the request fails
   */
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
        credentials: 'include', // Include cookies for refresh token
      });

      return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
    };

    try {
      return await makeRequest();
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  /**
   * Makes a POST request to the specified endpoint.
   * @param endpoint - The API endpoint to call
   * @param data - The request body data
   * @param includeAuth - Whether to include the Authorization header (default: true)
   * @returns Promise resolving to the response data
   * @throws Error if the request fails
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        credentials: 'include', // Include cookies for refresh token
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
    };

    try {
      return await makeRequest();
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }


  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true
  ): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        credentials: 'include', // Include cookies for refresh token
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
    };

    try {
      return await makeRequest();
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  }


  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
        credentials: 'include', // Include cookies for refresh token
      });

      return this.handleResponse<T>(response, includeAuth ? makeRequest : undefined);
    };

    try {
      return await makeRequest();
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
