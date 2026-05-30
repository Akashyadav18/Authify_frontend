export type Role = 'ADMIN' | 'TEACHER' | 'USER';

export interface User {
  userId: string;
  name: string;
  email: string;
  accountVerified: boolean;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  [key: string]: unknown;
}
