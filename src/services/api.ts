

import type { User, LoginData, RegisterData, AuthResponse } from '../types/User';

// API Configuration
const API_BASE_URL = 'http://localhost:3002';
const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  me: `${API_BASE_URL}/api/auth/me`,
  health: `${API_BASE_URL}/health`
};

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async register(registerData: RegisterData): Promise<{ data: AuthResponse | null; error: string | null }> {
    console.log('API: Registering user:', registerData);
    
    const result = await this.makeRequest<AuthResponse>(API_ENDPOINTS.register, {
      method: 'POST',
      body: JSON.stringify(registerData),
    });

    // If registration successful, store the token
    if (result.data?.success && result.data.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async login(loginData: LoginData): Promise<{ data: AuthResponse | null; error: string | null }> {
    console.log('API: Logging in user:', loginData);
    
    const result = await this.makeRequest<AuthResponse>(API_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    // If login successful, store the token
    if (result.data?.success && result.data.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async logout(): Promise<{ data: AuthResponse | null; error: string | null }> {
    console.log('API: Logging out user');
    
    const result = await this.makeRequest<AuthResponse>(API_ENDPOINTS.logout, {
      method: 'POST',
    });

    // Clear token on logout
    this.setToken(null);

    return result;
  }

  async getCurrentUser(): Promise<{ data: AuthResponse | null; error: string | null }> {
    console.log('API: Getting current user');
    
    return await this.makeRequest<AuthResponse>(API_ENDPOINTS.me, {
      method: 'GET',
    });
  }

  async checkHealth(): Promise<{ data: any | null; error: string | null }> {
    console.log('API: Checking health');
    
    return await this.makeRequest(API_ENDPOINTS.health, {
      method: 'GET',
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

export const api = {
  
  register: (registerData: RegisterData) => apiClient.register(registerData),

  login: (loginData: LoginData) => apiClient.login(loginData),

  logout: () => apiClient.logout(),

  getCurrentUser: () => apiClient.getCurrentUser(),

  checkHealth: () => apiClient.checkHealth(),

  setToken: (token: string | null) => apiClient.setToken(token),

  getToken: () => apiClient.getToken()
};
