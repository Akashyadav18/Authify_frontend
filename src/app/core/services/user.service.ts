import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = environment.apiBaseUrl;

  /** Reactive current user — components read this signal directly */
  currentUser = signal<User | null>(null);

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/profile`).pipe(
      map((user) => {
        // Backend doesn't return role in profile response.
        // Extract it from the JWT payload instead.
        const roleFromToken = this.auth.getRoleFromToken() as Role | null;
        return { ...user, role: roleFromToken ?? user.role };
      }),
      tap((user) => this.currentUser.set(user)),
    );
  }

  clearUser(): void {
    this.currentUser.set(null);
  }
}
