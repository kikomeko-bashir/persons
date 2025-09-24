import React, { useState } from 'react';
import type { User, LoginData, AuthResponse } from '../types/User';
import type { AuthFormField } from '../types/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { Form } from '../components/Form';

/**
 * Props interface for the Login component
 * Defines what data and functions the component needs
 */
interface LoginProps {
  /** Callback function called when login is successful */
  onLoginSuccess: (user: User) => void;
  
  /** Callback function called when user wants to switch to registration */
  onSwitchToRegister: () => void;
  
  /** Callback function called when login fails */
  onLoginError?: (error: string) => void;
  
  /** Optional loading state from parent component */
  isLoading?: boolean;
}

/**
 * Login Component - Screen for user authentication
 * 
 * This component provides a login form with the following fields:
 * - Email (required, valid email format)
 * - Password (required, 8-50 characters)
 * 
 * Features:
 * - Form validation with real-time feedback
 * - Email format validation
 * - Password validation
 * - Error handling and display
 * - Loading states during submission
 * - Remember me functionality (future enhancement)
 * - Forgot password link (future enhancement)
 * 
 * Validation Rules:
 * - Email: Valid email format
 * - Password: 8-50 characters
 * - Both fields are required
 */
export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onLoginError,
  isLoading = false
}) => {
  const { login, error: authError, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  /**
   * Form field configuration for login
   * Defines all the fields needed for user login
   */
  const loginFields: AuthFormField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
      customValidationMessage: 'Please enter a valid email address'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true,
      min: 8,
      max: 50,
      customValidationMessage: 'Password must be 8-50 characters long'
    }
  ];

  /**
   * Handles form submission for user login
   * 
   * This function is called when:
   * 1. User fills out the login form
   * 2. All validation passes
   * 3. User clicks "Login" button
   * 
   * @param formData - Form data object with all field values
   */
  const handleLoginSubmit = async (formData: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      clearError();

      // Create LoginData object from form data
      const loginData: LoginData = {
        email: formData.email || '',
        password: formData.password || ''
      };

      console.log('Login data:', loginData);
      
      // Call the API to login
      const success = await login(loginData);
      
      if (success) {
        // Login successful - the AuthContext will handle the state update
        // Call the parent callback if provided
        if (onLoginSuccess) {
          // Get the current user from context (this will be updated by the context)
          // For now, we'll call the callback without user data since context handles it
          onLoginSuccess({} as User); // This is a placeholder
        }
      } else {
        // Login failed - error is already set in context
        if (onLoginError && authError) {
          onLoginError(authError);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'An unexpected error occurred during login';
      if (onLoginError) {
        onLoginError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles switching to registration form
   * Called when user clicks "Don't have an account? Register"
   */
  const handleSwitchToRegister = () => {
    onSwitchToRegister();
  };

  /**
   * Handles forgot password action
   * TODO: Implement forgot password functionality
   */
  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // TODO: Implement forgot password flow
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account to continue</p>
        
        {/* Login form using the Form component */}
        <Form
          title=""
          fields={loginFields}
          onSubmit={handleLoginSubmit}
          submitButtonText={isSubmitting ? "Logging in..." : "Login"}
          showContainer={false}
        />
        
        {/* Show error message if any */}
        {authError && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{authError}</p>
          </div>
        )}
        
        {/* Forgot password link */}
        <div style={styles.forgotPasswordContainer}>
          <button 
            style={styles.forgotPasswordButton}
            onClick={handleForgotPassword}
          >
            Forgot your password?
          </button>
        </div>
        
        {/* Switch to register link */}
        <div style={styles.switchContainer}>
          <p style={styles.switchText}>
            Don't have an account?{' '}
            <button 
              style={styles.switchButton}
              onClick={handleSwitchToRegister}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Styles object for the Login component
 */
const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  formContainer: {
    maxWidth: '400px',
    width: '100%',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
    margin: '0 auto',
    boxSizing: 'border-box' as const
  },
  title: {
    textAlign: 'center' as const,
    color: '#2c3e50',
    marginBottom: '10px',
    fontSize: '32px',
    fontWeight: 'bold',
    marginTop: 0
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#7f8c8d',
    marginBottom: '30px',
    fontSize: '16px'
  },
  placeholder: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  forgotPasswordContainer: {
    textAlign: 'center' as const,
    marginBottom: '20px'
  },
  forgotPasswordButton: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px'
  },
  switchContainer: {
    textAlign: 'center' as const,
    marginTop: '20px'
  },
  switchText: {
    color: '#7f8c8d',
    fontSize: '14px',
    margin: 0
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px'
  },
  errorContainer: {
    textAlign: 'center' as const,
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '5px'
  },
  errorText: {
    color: '#721c24',
    fontSize: '14px',
    margin: 0
  }
};
