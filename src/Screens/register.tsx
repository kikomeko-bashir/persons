import React, { useState } from 'react';
import type { User, RegisterData, AuthResponse } from '../types/User';
import type { AuthFormField } from '../types/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { Form } from '../components/Form';

interface RegisterProps {
  
  onRegisterSuccess: (user: User) => void;

  onSwitchToLogin: () => void;

  onRegisterError?: (error: string) => void;

  isLoading?: boolean;
}

export const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
  onRegisterError,
  isLoading = false
}) => {
  const { register, error: authError, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleRegisterSubmit = async (formData: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      clearError();

      const registerData: RegisterData = {
        username: formData.username || '',
        email: formData.email || '',
        password: formData.password || '',
        confirmPassword: formData.confirmPassword || '',
        photo: formData.photo || undefined
      };

      console.log('Registration data:', registerData);
      
      const success = await register(registerData);
      
      if (success) {
        if (onRegisterSuccess) {
          onRegisterSuccess({} as User);
        }
      } else {
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

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us today! Fill in your details to get started.</p>
        
        <Form
          title=""
          fields={registerFields}
          onSubmit={handleRegisterSubmit}
          submitButtonText={isSubmitting ? "Registering..." : "Register"}
          showContainer={false}
        />
        
        {}
        {authError && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{authError}</p>
          </div>
        )}
        
        {}
        <div style={styles.switchContainer}>
          <p style={styles.switchText}>
            Already have an account?{' '}
            <button 
              style={styles.switchButton}
              onClick={onSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

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
    maxWidth: '650px',
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
