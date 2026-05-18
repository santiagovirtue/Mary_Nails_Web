import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const clienteGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (
    typeof window !== 'undefined' &&
    localStorage.getItem('maryNailsClienteSesion') === 'true'
  ) {
    return true;
  }

  return router.createUrlTree(['/login']);
};