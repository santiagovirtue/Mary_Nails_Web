import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const clienteGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window === 'undefined') {
    return router.createUrlTree(['/login']);
  }

  const clienteSesion = localStorage.getItem('maryNailsClienteSesion') === 'true';
  const adminSesion = localStorage.getItem('maryNailsAdminSesion') === 'true';

  if (clienteSesion) {
    return true;
  }

  if (adminSesion) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/login']);
};