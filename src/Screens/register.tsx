import React, { useState } from 'react';
import type { User, RegisterData, AuthResponse } from '../types/User';
import type { AuthFormField } from '../types/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { Form } from '../components/Form';

/**
 * Props interface for the Register component
 * Defines what data and functions the component needs
 */
interface RegisterProps {
  /** Callback function called when registration is successful */
  onRegisterSuccess: (user: User) => void;
  
  /** Callback function called when user wants to switch to login */
  onSwitchToLogin: () => void;
  
  /** Callback function called when registration fails */
  onRegisterError?: (error: string) => void;
  
  /** Optional loading state from parent component */
  isLoading?: boolean;
}

/**
 * Register Component - Screen for user registration
 * 
 * This component provides a registration form with the following fields:
 * - Username (required, 3-20 characters, alphanumeric + underscores)
 * - Email (required, valid email format)
 * - Password (required, 8-50 characters)
 * - Confirm Password (required, must match password)
 * - Photo (optional, image upload)
 * 
 * Features:
 * - Form validation with real-time feedback
 * - Password confirmation matching
 * - Email format validation
 * - Username format validation
 * - Photo upload with preview
 * - Error handling and display
 * - Loading states during submission
 * 
 * Validation Rules:
 * - Username: 3-20 characters, alphanumeric and underscores only
 * - Email: Valid email format
 * - Password: 8-50 characters
 * - Confirm Password: Must match password exactly
 * - Photo: Optional, must be valid image file
 */
export const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
  onRegisterError,
  isLoading = false
}) => {
  const { register, error: authError, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  /**
   * Form field configuration for registration
   * Defines all the fields needed for user registration
   */
  const registerFields: AuthFormField[] = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'e.g., john_doe123 (letters, numbers, underscores only)',
      required: true,
      min: 3,
      max: 20,
      customValidationMessage: 'Username must be 3-20 characters, letters, numbers, and underscores only'
    },
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
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
      required: true,
      needsConfirmation: true,
      confirmAgainst: 'password',
      customValidationMessage: 'Passwords must match'
    },
    {
      name: 'photo',
      label: 'Profile Photo',
      type: 'file',
      placeholder: 'Select a profile photo',
      required: false,
      accept: 'image/*'
    }
  ];

  /**
   * Handles form submission for user registration
   * 
   * This function is called when:
   * 1. User fills out the registration form
   * 2. All validation passes
   * 3. User clicks "Register" button
   * 
   * @param formData - Form data object with all field values
   */
  const handleRegisterSubmit = async (formData: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      clearError();

      // Create RegisterData object from form data
      const registerData: RegisterData = {
        username: formData.username || '',
        email: formData.email || '',
        password: formData.password || '',
        confirmPassword: formData.confirmPassword || '',
        photo: formData.photo || undefined
      };

      console.log('Registration data:', registerData);
      
      // Call the API to register
      const success = await register(registerData);
      
      if (success) {
        // Registration successful - the AuthContext will handle the state update
        // Call the parent callback if provided
        if (onRegisterSuccess) {
          // Get the current user from context (this will be updated by the context)
          // For now, we'll call the callback without user data since context handles it
          onRegisterSuccess({} as User); // This is a placeholder
        }
      } else {
        // Registration failed - error is already set in context
        if (onRegisterError && authError) {
          onRegisterError(authError);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'An unexpected error occurred during registration';
      if (onRegisterError) {
        onRegisterError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles switching to login form
   * Called when user clicks "Already have an account? Login"
   */
  const handleSwitchToLogin = () => {
    onSwitchToLogin();
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us today! Fill in your details to get started.</p>
        
        {/* Registration form using the Form component */}
        <Form
          title=""
          fields={registerFields}
          onSubmit={handleRegisterSubmit}
          submitButtonText={isSubmitting ? "Registering..." : "Register"}
          showContainer={false}
        />
        
        {/* Show error message if any */}
        {authError && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{authError}</p>
          </div>
        )}
        
        {/* Switch to login link */}
        <div style={styles.switchContainer}>
          <p style={styles.switchText}>
            Already have an account?{' '}
            <button 
              style={styles.switchButton}
              onClick={handleSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Styles object for the Register component
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
    maxWidth: '500px',
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
