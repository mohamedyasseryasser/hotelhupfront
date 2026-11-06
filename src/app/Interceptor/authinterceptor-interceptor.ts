import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';
import { Authservice } from '../Service/authservice';
import { environment } from '../../environments/environment.development';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {
  const auth = inject(Authservice);
  const router = inject(Router);

  const accessToken = auth.getAccessToken();
  const isAuthRequest = request.url.startsWith(
    `${environment.apiUrl}/auth/`,
  );

  const requestWithToken =
    accessToken && !isAuthRequest
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : request;

  return next(requestWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
    
      if (
        error.status !== 401 ||
        isAuthRequest
      ) {
        
        return throwError(() => error);
      }

      const refreshToken = auth.getRefreshToken();

      if (!refreshToken) {
        auth.clearSession();
        void router.navigate(['/login']);
        return throwError(() => error);
      }

      return auth.refresh(refreshToken).pipe(
        switchMap((response) => {
          const newAccessToken =
            response.data?.accessToken;

          if (
            !response.success ||
            !newAccessToken
          ) {
            auth.clearSession();
            void router.navigate(['/login']);
            return throwError(() => error);
          }

          const retryRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          return next(retryRequest);
        }),
        catchError((refreshError: unknown) => {
          auth.clearSession();
          void router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
