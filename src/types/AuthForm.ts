import { FormField } from '../components/Form';

/**
 * Authentication Form Field Interface
 * Extends the base FormField to include authentication-specific properties
 */
export interface AuthFormField extends FormField {
  /** Whether this field should be confirmed (e.g., password confirmation) */
  needsConfirmation?: boolean;
  
  /** Field to confirm against (e.g., 'password' for confirmPassword) */
  confirmAgainst?: string;
  
  /** Custom validation message for this field */
  customValidationMessage?: string;
}

/**
 * Authentication Form Configuration Interface
 * Defines the structure for configuring authentication forms
 */
export interface AuthFormConfig {
  /** Form title */
  title: string;
  
  /** Form fields configuration */
  fields: AuthFormField[];
  
  /** Submit button text */
  submitButtonText: string;
  
  /** Link text for switching between login/register */
  switchFormText: string;
  
  /** Link action for switching forms */
  switchFormAction: () => void;
}

/**
 * Form Validation Rules Interface
 * Defines validation rules for authentication forms
 */
export interface AuthValidationRules {
  /** Minimum username length */
  minUsernameLength: number;
  
  /** Maximum username length */
  maxUsernameLength: number;
  
  /** Minimum password length */
  minPasswordLength: number;
  
  /** Maximum password length */
  maxPasswordLength: number;
  
  /** Email validation regex pattern */
  emailPattern: RegExp;
  
  /** Username validation regex pattern (alphanumeric and underscores) */
  usernamePattern: RegExp;
}

/**
 * Authentication Form State Interface
 * Defines the state structure for authentication forms
 */
export interface AuthFormState {
  /** Form data object */
  formData: Record<string, string>;
  
  /** Validation errors object */
  errors: Record<string, string>;
  
  /** Loading state during submission */
  isLoading: boolean;
  
  /** Success state after submission */
  isSuccess: boolean;
}
