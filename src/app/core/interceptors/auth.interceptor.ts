import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

// Paths that should trigger a full logout + redirect on 401
const PROTECTED_PATHS = ['/api/user/profile', '/api/auth/send-otp-verify-email'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = localStorage.getItem('authToken');

  const cloned = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(cloned).pipe(
    catchError((err) => {
      if (err.status === 401) {
        // Only force logout+redirect for truly protected paths (profile etc.)
        // For list/CRUD endpoints, let the component handle the 401 and show
        // an inline "please log in" message instead of a jarring redirect.
        const isProtectedPath = PROTECTED_PATHS.some((p) =>
          req.url.includes(p),
        );
        if (isProtectedPath) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userProfile');
          toast.error('Session expired. Please login again.');
          router.navigate(['/auth']);
        }
      }
      if (err.status === 403) {
        toast.error('You do not have permission to perform this action.');
      }
      return throwError(() => err);
    }),
  );
};
