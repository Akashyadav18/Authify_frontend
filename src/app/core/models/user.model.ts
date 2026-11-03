import { AccountStatus } from './approval.model';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'STAFF' | 'USER';

export interface User {
  userId: string;
  name: string;
  email: string;
  accountVerified: boolean;
  role?: Role;
  status?: AccountStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Role field removed — backend assigns default role on registration */
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
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
