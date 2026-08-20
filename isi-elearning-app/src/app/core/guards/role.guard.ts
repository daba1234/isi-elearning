import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/models';

export const roleGuard = (role: UserRole): CanActivateFn => () => {
  const user = inject(AuthService).currentUser();
  return user?.role === role ? true : inject(Router).createUrlTree(['/dashboard']);
};
