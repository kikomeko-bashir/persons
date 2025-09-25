/**
 * API Client
 * HTTP client with interceptors, retry logic, and error handling
 */

import type { 
  ApiResponse, 
  ApiErrorResponse, 
  ApiRequestConfig, 
  RetryConfig, 
  NetworkStatus 
} from '../types/ApiResponse';

// Default configuration
const DEFAULT_CONFIG: ApiRequestConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// Network status tracking
let networkStatus: NetworkStatus = {
  isOnline: navigator.onLine,
  lastChecked: new Date(),
  retryCount: 0,
};

// Event listeners for network status
window.addEventListener('online', () => {
  networkStatus.isOnline = true;
  networkStatus.lastChecked = new Date();
  networkStatus.retryCount = 0;
});

window.addEventListener('offline', () => {
  networkStatus.isOnline = false;
  networkStatus.lastChecked = new Date();
});

/**
 * Calculate retry delay with exponential backoff
 */
const calculateRetryDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error: any): boolean => {
  // Network errors
  if (!navigator.onLine) return true;
  
  // Timeout errors
  if (error.name === 'TimeoutError') return true;
  
  // 5xx server errors
  if (error.status >= 500 && error.status < 600) return true;
  
  // 429 Too Many Requests
  if (error.status === 429) return true;
  
  // Network connection errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
  
  return false;
};

/**
 * Create a timeout promise
 */
const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);
  });
};

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Create request headers
 */
const createHeaders = (customHeaders: Record<string, string> = {}): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Parse response and handle errors
 */
const parseResponse = async (response: Response): Promise<ApiResponse> => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorData: any;
    
    try {
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: 'Unknown error occurred' };
    }

    const error: ApiErrorResponse = {
      success: false,
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      errors: errorData.errors || [errorData.message || 'Unknown error'],
      errorCode: errorData.code || `HTTP_${response.status}`,
      timestamp: new Date().toISOString(),
    };

    throw error;
  }

  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return {
    success: true,
    data: await response.text(),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Retry logic with exponential backoff
 */
const retryRequest = async (
  requestFn: () => Promise<Response>,
  config: ApiRequestConfig,
  attempt: number = 1
): Promise<ApiResponse> => {
  try {
    const response = await requestFn();
    return await parseResponse(response);
  } catch (error: any) {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    
    // Check if we should retry
    if (attempt < retryConfig.maxRetries && isRetryableError(error)) {
      const delay = calculateRetryDelay(attempt, retryConfig);
      
      console.warn(`Request failed (attempt ${attempt}/${retryConfig.maxRetries}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(requestFn, config, attempt + 1);
    }
    
    // If not retryable or max retries reached, throw the error
    throw error;
  }
};

/**
 * Main API client function
 */
export const apiClient = async <T = any>(
  url: string,
  options: RequestInit & ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retries = DEFAULT_CONFIG.retries,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  // Check network status
  if (!networkStatus.isOnline) {
    throw new Error('No internet connection');
  }

  const requestFn = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: createHeaders(customHeaders),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Apply retry logic if retries > 0
  if (retries > 0) {
    return retryRequest(requestFn, { timeout, retries, retryDelay });
  }

  // Single request without retry
  try {
    const response = await requestFn();
    return await parseResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = <T = any>(
  url: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  return apiClient<T>(url, {
    method: 'GET',
    ...config,
  });
};

/**
 * POST request
 */
export const apiPost = <T = any>(
  url: string,
  data: any,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  return apiClient<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...config,
  });
};

/**
 * PUT request
 */
export const apiPut = <T = any>(
  url: string,
  data: any,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  return apiClient<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...config,
  });
};

/**
 * DELETE request
 */
export const apiDelete = <T = any>(
  url: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  return apiClient<T>(url, {
    method: 'DELETE',
    ...config,
  });
};

/**
 * File upload request
 */
export const apiUpload = <T = any>(
  url: string,
  file: File,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<T>(url, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
    ...config,
  });
};

/**
 * Get network status
 */
export const getNetworkStatus = (): NetworkStatus => {
  return { ...networkStatus };
};

/**
 * Check if online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};
