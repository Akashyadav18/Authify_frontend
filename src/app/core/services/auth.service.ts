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
   * Decode the JWT payload and extract the role.
   * Handles multiple Spring Security claim formats:
   *   1. authorities: [{ authority: "ROLE_TEACHER" }]  ← Spring Security default
   *   2. authorities: ["ROLE_TEACHER"]                 ← simple array
   *   3. Role: "ROLE_TEACHER"                          ← custom string claim
   *   4. role: "ROLE_TEACHER"                          ← custom string claim (lowercase)
   *   5. roles: ["ROLE_TEACHER"]                       ← alternate array name
   */
  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const json = JSON.parse(decoded);

      // 1 & 2 — authorities array (Spring Security default)
      const auths: unknown[] = json['authorities'] ?? json['roles'] ?? [];
      if (Array.isArray(auths) && auths.length > 0) {
        const first = auths[0];
        if (typeof first === 'string') return first;                     // ["ROLE_TEACHER"]
        if (typeof first === 'object' && first !== null) {
          const obj = first as Record<string, string>;
          return obj['authority'] ?? obj['role'] ?? obj['name'] ?? null; // [{ authority: "ROLE_TEACHER" }]
        }
      }

      // 3 & 4 — flat string claims
      if (json['Role']) return json['Role'];
      if (json['role']) return json['role'];

      return null;
    } catch {
      return null;
    }
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
