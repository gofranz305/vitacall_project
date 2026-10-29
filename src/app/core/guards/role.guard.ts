import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const currentUser = authService.currentUser();
  if (!currentUser) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;

  if (!expectedRoles || expectedRoles.includes(currentUser.role)) {
    return true;
  }

  // Role unauthorized for this dashboard
  notificationService.warning(
    'Access Restricted',
    `Your account role (${authService.getRoleLabel(currentUser.role)}) cannot access this page. Redirecting to your dashboard...`
  );
  authService.redirectBasedOnRole(currentUser.role);
  return false;
};
