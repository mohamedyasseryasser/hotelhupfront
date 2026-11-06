import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
} from '@angular/router';
import { Authservice } from '../Service/authservice';
import { Permissionservice } from '../Service/permissionservice';

export const permissionGuard: CanActivateFn = (
  route,
  state,
) => {
  const auth = inject(Authservice);
  const permissionService = inject(Permissionservice);
  const router = inject(Router);
  
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl: state.url,
      },
    });
  }

  const permissions =
    (route.data['permissions'] as string[] | undefined) ?? [];

  const requireAll =
    route.data['requireAll'] ?? true;

  if (permissions.length === 0) {
    return true;
  }

  const allowed = requireAll
    ? permissions.every((permission) =>
        permissionService.hasPermission(permission),
      )
    : permissions.some((permission) =>
        permissionService.hasPermission(permission),
      );

  return allowed
    ? true
    :      router.createUrlTree(['/access-denied']);

};

export const permissionChildGuard: CanActivateChildFn = (
  childRoute,
  state,
) => permissionGuard(childRoute, state);
