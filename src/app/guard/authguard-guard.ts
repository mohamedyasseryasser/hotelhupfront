import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../Service/authservice';

export const authguardGuard: CanActivateFn = (route, state) => {
 const auth = inject(Authservice);
  const router = inject(Router);
  return auth.isAuthenticated() ? true :
   router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } 
  })
  ;
};
 

