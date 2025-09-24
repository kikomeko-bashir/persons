

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginData, RegisterData, AuthResponse } from '../types/User';
import { api } from '../services/api';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (loginData: LoginData) => Promise<boolean>;
  register: (registerData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed state
  const isAuthenticated = user !== null;

  const clearError = () => {
    setError(null);
  };

  const setErrorMessage = (message: string) => {
    setError(message);
    setIsLoading(false);
  };

  const handleAuthSuccess = (authResponse: AuthResponse) => {
    if (authResponse.user) {
      setUser(authResponse.user);
      setError(null);
    }
    setIsLoading(false);
  };

  const handleAuthFailure = (errorMessage: string) => {
    setUser(null);
    setErrorMessage(errorMessage);
  };

  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await api.login(loginData);

      if (error || !data) {
        handleAuthFailure(error || 'Login failed');
        return false;
      }

      if (data.success) {
        handleAuthSuccess(data);
        return true;
      } else {
        // Show specific validation errors if available
        if (data.errors && data.errors.length > 0) {
          handleAuthFailure(data.errors.join(', '));
        } else {
          handleAuthFailure(data.message || 'Login failed');
        }
        return false;
      }
    } catch (err) {
      handleAuthFailure('Network error occurred');
      return false;
    }
  };

  const register = async (registerData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await api.register(registerData);

      if (error || !data) {
        handleAuthFailure(error || 'Registration failed');
        return false;
      }

      if (data.success) {
        handleAuthSuccess(data);
        return true;
      } else {
        // Show specific validation errors if available
        if (data.errors && data.errors.length > 0) {
          handleAuthFailure(data.errors.join(', '));
        } else {
          handleAuthFailure(data.message || 'Registration failed');
        }
        return false;
      }
    } catch (err) {
      handleAuthFailure('Network error occurred');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call logout API
      await api.logout();

      // Clear local state
      setUser(null);
      setIsLoading(false);
    } catch (err) {
      // Even if API call fails, clear local state
      setUser(null);
      setIsLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await api.getCurrentUser();

      if (error || !data) {
        // No valid session
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (data.success && data.user) {
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    } catch (err) {
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
