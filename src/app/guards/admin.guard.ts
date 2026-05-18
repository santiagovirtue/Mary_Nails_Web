import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window === 'undefined') {
    return router.createUrlTree(['/admin/login']);
  }

  const adminSesion = localStorage.getItem('maryNailsAdminSesion') === 'true';
  const clienteSesion = localStorage.getItem('maryNailsClienteSesion') === 'true';

  if (adminSesion) {
    return true;
  }

  if (clienteSesion) {
    return router.createUrlTree(['/cliente/mis-citas']);
  }

  return router.createUrlTree(['/admin/login']);
};