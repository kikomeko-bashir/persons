/**
 * API Service Layer
 * 
 * This module provides functions to communicate with the backend API.
 * It handles all HTTP requests to the authentication endpoints.
 */

import type { User, LoginData, RegisterData, AuthResponse } from '../types/User';

// API Configuration
const API_BASE_URL = 'http://localhost:3002';
const API_ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/auth/me`,
  health: `${API_BASE_URL}/health`
};

/**
 * API Client Class
 * Handles all API communication with the backend
 */
export class ApiClient {
  private token: string | null = null;

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with error handling
   */
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

  /**
   * Register a new user
   */
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

  /**
   * Login user
   */
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

  /**
   * Logout user
   */
  async logout(): Promise<{ data: AuthResponse | null; error: string | null }> {
    console.log('API: Logging out user');
    
    const result = await this.makeRequest<AuthResponse>(API_ENDPOINTS.logout, {
      method: 'POST',
    });

    // Clear token on logout
    this.setToken(null);

    return result;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<{ data: AuthResponse | null; error: string | null }> {
    console.log('API: Getting current user');
    
    return await this.makeRequest<AuthResponse>(API_ENDPOINTS.me, {
      method: 'GET',
    });
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ data: any | null; error: string | null }> {
    console.log('API: Checking health');
    
    return await this.makeRequest(API_ENDPOINTS.health, {
      method: 'GET',
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

/**
 * Convenience functions for easier usage
 */
export const api = {
  /**
   * Register a new user
   */
  register: (registerData: RegisterData) => apiClient.register(registerData),

  /**
   * Login user
   */
  login: (loginData: LoginData) => apiClient.login(loginData),

  /**
   * Logout user
   */
  logout: () => apiClient.logout(),

  /**
   * Get current user info
   */
  getCurrentUser: () => apiClient.getCurrentUser(),

  /**
   * Check API health
   */
  checkHealth: () => apiClient.checkHealth(),

  /**
   * Set authentication token
   */
  setToken: (token: string | null) => apiClient.setToken(token),

  /**
   * Get authentication token
   */
  getToken: () => apiClient.getToken()
};
