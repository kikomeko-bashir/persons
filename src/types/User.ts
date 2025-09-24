/**
 * User Interface - Defines the structure for user authentication data
 * This interface is used for both registration and login functionality
 */
export interface User {
  /** Unique identifier for each user (auto-generated) */
  id: number;
  
  /** Username chosen by the user during registration */
  username: string;
  
  /** Email address used for login and communication */
  email: string;
  
  /** Password (should be hashed in production) */
  password: string;
  
  /** Optional profile photo */
  photo?: string;
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Last login timestamp */
  lastLoginAt?: Date;
}

/**
 * User Registration Data Interface
 * Defines the data structure required for user registration
 */
export interface RegisterData {
  /** Username chosen by the user */
  username: string;
  
  /** Email address for the account */
  email: string;
  
  /** Password for the account */
  password: string;
  
  /** Password confirmation (must match password) */
  confirmPassword: string;
  
  /** Optional profile photo */
  photo?: string;
}

/**
 * User Login Data Interface
 * Defines the data structure required for user login
 */
export interface LoginData {
  /** Email address for login */
  email: string;
  
  /** Password for login */
  password: string;
}

/**
 * Authentication Response Interface
 * Defines the response structure after successful authentication
 */
export interface AuthResponse {
  /** Success status of the authentication */
  success: boolean;
  
  /** User data if authentication successful */
  user?: User;
  
  /** Error message if authentication failed */
  message?: string;
  
  /** Authentication token (for future JWT implementation) */
  token?: string;
}
