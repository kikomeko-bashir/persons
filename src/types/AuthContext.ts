import type { User, RegisterData, LoginData, AuthResponse } from './User';

/**
 * Authentication Context Interface
 * Defines the structure for the authentication context that will manage
 * global authentication state throughout the application
 */
export interface AuthContextType {
  /** Current authenticated user (null if not logged in) */
  user: User | null;
  
  /** Whether the user is currently logged in */
  isAuthenticated: boolean;
  
  /** Whether authentication is in progress (loading state) */
  isLoading: boolean;
  
  /** Authentication error message (if any) */
  error: string | null;
  
  /** Login function */
  login: (loginData: LoginData) => Promise<AuthResponse>;
  
  /** Register function */
  register: (registerData: RegisterData) => Promise<AuthResponse>;
  
  /** Logout function */
  logout: () => void;
  
  /** Clear error function */
  clearError: () => void;
  
  /** Check if user is authenticated on app load */
  checkAuthStatus: () => Promise<void>;
}

/**
 * Authentication Provider Props Interface
 * Defines the props for the AuthProvider component
 */
export interface AuthProviderProps {
  /** Child components that will have access to auth context */
  children: React.ReactNode;
}

/**
 * Authentication Hook Return Type
 * Defines the return type for the useAuth hook
 */
export interface UseAuthReturn extends AuthContextType {
  /** Whether the auth context is available */
  isAuthContextAvailable: boolean;
}

/**
 * Authentication State Interface
 * Defines the internal state structure for authentication
 */
export interface AuthState {
  /** Current user data */
  user: User | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Whether auth has been initialized */
  isInitialized: boolean;
}

/**
 * Authentication Action Types
 * Defines the types of actions that can be dispatched to the auth reducer
 */
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_AUTH'; payload: User | null };

/**
 * Authentication Service Interface
 * Defines the interface for authentication service functions
 * This would typically be implemented by an API service
 */
export interface AuthService {
  /** Login user with email and password */
  login: (loginData: LoginData) => Promise<AuthResponse>;
  
  /** Register new user */
  register: (registerData: RegisterData) => Promise<AuthResponse>;
  
  /** Logout user */
  logout: () => Promise<void>;
  
  /** Get current user from token */
  getCurrentUser: () => Promise<User | null>;
  
  /** Refresh authentication token */
  refreshToken: () => Promise<string | null>;
  
  /** Validate email format */
  validateEmail: (email: string) => boolean;
  
  /** Validate password strength */
  validatePassword: (password: string) => { isValid: boolean; message?: string };
  
  /** Validate username format */
  validateUsername: (username: string) => { isValid: boolean; message?: string };
}

/**
 * Authentication Configuration Interface
 * Defines configuration options for authentication
 */
export interface AuthConfig {
  /** Base URL for authentication API */
  apiBaseUrl: string;
  
  /** Token storage key for localStorage */
  tokenStorageKey: string;
  
  /** User storage key for localStorage */
  userStorageKey: string;
  
  /** Token expiration time in minutes */
  tokenExpirationMinutes: number;
  
  /** Whether to automatically refresh tokens */
  autoRefreshTokens: boolean;
  
  /** Password requirements */
  passwordRequirements: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  
  /** Username requirements */
  usernameRequirements: {
    minLength: number;
    maxLength: number;
    allowedChars: RegExp;
  };
}
