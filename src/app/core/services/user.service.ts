import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = environment.apiBaseUrl;

  /** Reactive current user — components read this signal directly */
  currentUser = signal<User | null>(this.getInitialUser());

  /**
   * Constructs an initial user from the JWT token if present in localStorage,
   * avoiding "guest" / "Sign In" flickers before /profile resolves.
   */
  private getInitialUser(): User | null {
    if (typeof window === 'undefined' || !localStorage.getItem('authToken')) {
      return null;
    }
    const email = this.auth.getEmailFromToken();
    const name = this.auth.getNameFromToken();
    const role = this.auth.getNormalizedRole() as Role | null;
    if (!email && !role) return null;

    return {
      userId: email ?? 'user',
      name: name || 'User',
      email: email || '',
      accountVerified: true,
      role: role ?? 'USER',
    };
  }

  /**
   * Initializes or refreshes the current user from the token.
   */
  initFromToken(): User | null {
    const user = this.getInitialUser();
    if (user) {
      this.currentUser.set(user);
    }
    return user;
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/profile`).pipe(
      catchError(() => {
        // Fallback to /api/user/profile if /api/auth/profile doesn't exist
        const userProfileUrl = this.base.replace(/\/api\/auth\/?$/, '/api/user/profile');
        if (userProfileUrl !== `${this.base}/profile`) {
          return this.http.get<User>(userProfileUrl);
        }
        // If both fail, construct a fallback User from token claims
        const fallback = this.getInitialUser();
        if (fallback) {
          return of(fallback);
        }
        return of({
          userId: 'user',
          name: this.auth.getNameFromToken(),
          email: this.auth.getEmailFromToken() ?? '',
          accountVerified: true,
          role: (this.auth.getNormalizedRole() as Role) ?? 'USER',
        } as User);
      }),
      map((user) => {
        const roleFromToken = this.auth.getNormalizedRole() as Role | null;
        return {
          ...user,
          name: user.name || this.auth.getNameFromToken(),
          email: user.email || this.auth.getEmailFromToken() || '',
          role: roleFromToken ?? user.role,
        };
      }),
      tap((user) => this.currentUser.set(user)),
    );
  }

  clearUser(): void {
    this.currentUser.set(null);
  }
}
