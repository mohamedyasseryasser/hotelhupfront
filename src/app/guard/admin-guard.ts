import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../Service/authservice';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Authservice);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
   
  if (auth.hasRole('Admin')) {
    return true;
  }

   return router.createUrlTree(['/access-denied']);
  };
