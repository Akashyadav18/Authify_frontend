import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap((res) => {
        if (res?.token) this.setToken(res.token);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload);
  }


  sendOtpVerifyEmail(): Observable<string> {
    return this.http.post(`${this.base}/send-otp-verify-email`, {}, { responseType: 'text' });
  }

  verifyEmail(otp: string): Observable<string> {
    return this.http.post(`${this.base}/verify-email`, { otp }, { responseType: 'text' });
  }

  sendResetOtp(email: string): Observable<string> {
    return this.http.post(`${this.base}/send-reset-otp`, null, {
      params: { email },
      responseType: 'text',
    });
  }

  resetPassword(payload: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.base}/reset-password`, payload, { responseType: 'text' });
  }

  // ── Token helpers ──────────────────────────────────────────────────
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Decode the JWT payload.
   */
  getDecodedToken(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Extract user email from JWT token subject or email claim.
   */
  getEmailFromToken(): string | null {
    const json = this.getDecodedToken();
    if (!json) return null;
    return (json['email'] ?? json['sub'] ?? null) as string | null;
  }

  /**
   * Extract user display name from JWT token if available, or derive from email.
   */
  getNameFromToken(): string {
    const json = this.getDecodedToken();
    if (!json) return 'User';
    if (typeof json['name'] === 'string' && json['name'].trim()) {
      return json['name'].trim();
    }
    const email = this.getEmailFromToken();
    if (email && email.includes('@')) {
      const prefix = email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'User';
  }

  /**
   * Decode the JWT payload and extract all authorities/permissions.
   */
  getAuthorities(): string[] {
    const json = this.getDecodedToken();
    if (!json) return [];
    try {
      const rawList: unknown =
        json['authorities'] ??
        json['roles'] ??
        json['permissions'] ??
        (typeof json['scope'] === 'string' ? json['scope'].split(' ') : []);

      const result: string[] = [];
      if (Array.isArray(rawList)) {
        for (const item of rawList) {
          if (typeof item === 'string') {
            result.push(item);
          } else if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, string>;
            const val = obj['authority'] ?? obj['role'] ?? obj['name'];
            if (typeof val === 'string') result.push(val);
          }
        }
      }

      if (typeof json['role'] === 'string') result.push(json['role']);
      if (typeof json['Role'] === 'string') result.push(json['Role']);

      return result;
    } catch {
      return [];
    }
  }

  /**
   * Specifically find the authority starting with 'ROLE_' (case-insensitive).
   * E.g. "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT", "ROLE_USER".
   */
  getRoleFromToken(): string | null {
    const authorities = this.getAuthorities();
    const roleAuth = authorities.find((a) => a.toUpperCase().startsWith('ROLE_'));
    if (roleAuth) {
      return roleAuth;
    }

    // Fallback: check if any authority exactly matches common role names
    const fallback = authorities.find((a) =>
      ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF', 'USER'].includes(a.toUpperCase()),
    );
    return fallback ? `ROLE_${fallback.toUpperCase()}` : null;
  }

  /**
   * Returns normalized role without 'ROLE_' prefix, e.g. "ADMIN", "TEACHER", "STUDENT".
   */
  getNormalizedRole(): string | null {
    const raw = this.getRoleFromToken();
    if (!raw) return null;
    return raw.replace(/^ROLE_/i, '').toUpperCase();
  }

  /**
   * Check if user has a specific role (handles with or without ROLE_ prefix).
   */
  hasRole(roleName: string): boolean {
    const current = this.getNormalizedRole();
    if (!current) return false;
    const target = roleName.replace(/^ROLE_/i, '').toUpperCase();
    return current === target;
  }

  /**
   * Check if user has a specific authority or permission (case-insensitive).
   */
  hasPermission(permission: string): boolean {
    const authorities = this.getAuthorities();
    const target = permission.toUpperCase();
    return authorities.some((a) => a.toUpperCase() === target);
  }


  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
  }
}
