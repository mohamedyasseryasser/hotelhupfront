import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { Authservice } from '../../Service/authservice';
import { Router } from '@angular/router';
@Component({
  imports: [RouterLink],
  selector: 'app-access-denied',
  styleUrl: './access-denied.css',
  templateUrl: './access-denied.html',
})
export class AccessDenied {
  readonly auth=inject(Authservice);
  readonly router=inject(Router);
  logout(): void {
    this.auth.logout().subscribe({
      next: () =>
        void this.router.navigate(['/login']),

      error: () => {
        this.auth.clearSession();
        void this.router.navigate(['/login']);
      },
    });
  }}
