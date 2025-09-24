
export interface User {
  
  id: number;

  username: string;

  email: string;

  password: string;

  photo?: string;

  createdAt: Date;

  lastLoginAt?: Date;
}

export interface RegisterData {
  
  username: string;

  email: string;

  password: string;

  confirmPassword: string;

  photo?: string;
}

export interface LoginData {
  
  email: string;

  password: string;
}

export interface AuthResponse {
  
  success: boolean;

  user?: User;

  message?: string;

  token?: string;
}
