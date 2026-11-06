import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../Service/authservice';

export const guestGuard: CanActivateFn = (route, state) => {
const auth = inject(Authservice);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;};
