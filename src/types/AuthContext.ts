import type { User, RegisterData, LoginData, AuthResponse } from './User';

export interface AuthContextType {
  
  user: User | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  error: string | null;

  login: (loginData: LoginData) => Promise<AuthResponse>;

  register: (registerData: RegisterData) => Promise<AuthResponse>;

  logout: () => void;

  clearError: () => void;

  checkAuthStatus: () => Promise<void>;
}

export interface AuthProviderProps {
  
  children: React.ReactNode;
}

export interface UseAuthReturn extends AuthContextType {
  
  isAuthContextAvailable: boolean;
}

export interface AuthState {
  
  user: User | null;

  isLoading: boolean;

  error: string | null;

  isInitialized: boolean;
}

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

export interface AuthService {
  
  login: (loginData: LoginData) => Promise<AuthResponse>;

  register: (registerData: RegisterData) => Promise<AuthResponse>;

  logout: () => Promise<void>;

  getCurrentUser: () => Promise<User | null>;

  refreshToken: () => Promise<string | null>;

  validateEmail: (email: string) => boolean;

  validatePassword: (password: string) => { isValid: boolean; message?: string };

  validateUsername: (username: string) => { isValid: boolean; message?: string };
}

export interface AuthConfig {
  
  apiBaseUrl: string;

  tokenStorageKey: string;

  userStorageKey: string;

  tokenExpirationMinutes: number;

  autoRefreshTokens: boolean;

  passwordRequirements: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };

  usernameRequirements: {
    minLength: number;
    maxLength: number;
    allowedChars: RegExp;
  };
}
