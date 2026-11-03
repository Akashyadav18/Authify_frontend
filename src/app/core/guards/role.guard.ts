import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const allowedRoles: string[] = route.data['roles'] ?? [];
  const allowedPermissions: string[] = route.data['permissions'] ?? [];

  if (allowedRoles.length === 0 && allowedPermissions.length === 0) return true;

  const hasRole = allowedRoles.some((r) => auth.hasRole(r));
  const hasPerm = allowedPermissions.some((p) => auth.hasPermission(p));

  if (hasRole || hasPerm) return true;

  toast.error('You do not have access to that page.');
  return router.createUrlTree(['/']);
};

