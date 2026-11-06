import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthSession, AuthUser, LoginRequest, LoginResponse, RefreshTokenRequest } from '../Models/auth';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
const SESSION_KEY = 'hotelhup.auth.session';

@Injectable({providedIn:'root'})
export class Authservice
{
    private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionSignal = signal<AuthSession | null>(this.readSession());
                                                     
  readonly session = this.sessionSignal.asReadonly();
  readonly user = computed<AuthUser | null>(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly permissions = computed(() => this.sessionSignal()?.permissions ?? []);
  readonly roles = computed(() => this.user()?.roles.filter((role) => role.isactive).map((role) => role.roleName) ?? []);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((response) => {
        if (response.success && response.data) {
           this.setSession(response.data);
        }
      }),
    );
  }

  refresh(refreshToken: string): Observable<ApiResponse<LoginResponse>> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/refresh`, request).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
    );
  }

  logout(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearSession()),
    );
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }

  redirectToLogin(returnUrl?: string): void {
    void this.router.navigate(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
  }

  hasRole(role: string): boolean {
    return this.roles().some((currentRole) => currentRole.toLowerCase() === role.toLowerCase());
  }
  hasAnyRole(roles: readonly string[]): boolean {
    return roles.length === 0 || roles.some((role) => this.hasRole(role));
  }

  getAccessToken(): string | null {
    return this.sessionSignal()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.sessionSignal()?.refreshToken ?? null;
  }

  private setSession(response: LoginResponse): void {
    const session: AuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAtUtc: response.accessTokenExpiresAtUtc,
      permissions: response.permissions ?? [],
      user: response.user,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  public readSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as AuthSession) : null;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
