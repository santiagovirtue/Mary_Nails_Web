import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (
    typeof window !== 'undefined' &&
    localStorage.getItem('maryNailsAdminSesion') === 'true'
  ) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};