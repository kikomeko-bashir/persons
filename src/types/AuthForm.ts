import { FormField } from '../components/Form';

export interface AuthFormField extends FormField {
  
  needsConfirmation?: boolean;

  confirmAgainst?: string;

  customValidationMessage?: string;
}

export interface AuthFormConfig {
  
  title: string;

  fields: AuthFormField[];

  submitButtonText: string;

  switchFormText: string;

  switchFormAction: () => void;
}

export interface AuthValidationRules {
  
  minUsernameLength: number;

  maxUsernameLength: number;

  minPasswordLength: number;

  maxPasswordLength: number;

  emailPattern: RegExp;

  usernamePattern: RegExp;
}

export interface AuthFormState {
  
  formData: Record<string, string>;

  errors: Record<string, string>;

  isLoading: boolean;

  isSuccess: boolean;
}
