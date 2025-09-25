/**
 * API Response Types
 * Defines TypeScript interfaces for API responses and error handling
 */

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

// Person-specific API response
export interface PersonApiResponse extends ApiResponse<Person> {
  data: Person;
}

// People list API response
export interface PeopleApiResponse extends ApiResponse<Person[]> {
  data: Person[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File upload response
export interface FileUploadResponse extends ApiResponse<string> {
  data: string; // URL or file path
  originalName: string;
  size: number;
  mimeType: string;
}

// Error response interface
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

// API error response
export interface ApiErrorResponse extends ApiResponse<never> {
  success: false;
  errors: string[];
  errorCode?: string;
  errorDetails?: ApiError[];
}

// Request configuration
export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

// File upload configuration
export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  compress?: boolean;
  quality?: number; // for image compression
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
}

// Network status
export interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
  retryCount: number;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retry: RetryConfig;
  fileUpload: FileUploadConfig;
  headers: Record<string, string>;
}

// Import Person type
import type { Person } from './Person';
