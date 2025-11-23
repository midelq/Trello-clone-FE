import { API_CONFIG } from '../config/api.config';
import type { ApiError } from '../types/api.types';


export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  
  private getToken(): string | null {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
  }

 
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

 
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const error: ApiError = await response.json();
        throw new Error(error.message || 'Помилка запиту');
      }
      throw new Error(`HTTP помилка! статус: ${response.status}`);
    }

    if (isJson) {
      return await response.json();
    }

    return {} as T;
  }


  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  
  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }

  
  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  }

 
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

