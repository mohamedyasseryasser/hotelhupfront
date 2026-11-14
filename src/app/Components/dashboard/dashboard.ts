
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../Service/authservice';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly auth = inject(Authservice);

  private readonly router = inject(Router);

  constructor() {
    void this.redirectUser();
  }

  private async redirectUser(): Promise<void> {
    const user = this.auth.user();

    const isAdmin = this.auth.hasRole('Admin');
    const propertyId = user?.propertyId;

    console.log('Current User:', user);
    console.log('Is Admin:', isAdmin);
    console.log('Property ID:', propertyId);

    try {
      let result: boolean;

      if (isAdmin) {
        result = await this.router.navigate(['/properties']);
      } else if (propertyId) {
        result = await this.router.navigate(['/reports'], {
          queryParams: {
            propertyId: propertyId
          }
        });
      } else {
        result = await this.router.navigate(['/login']);
      }

      console.log('Navigation Result:', result);
      console.log('Current URL:', this.router.url);

      if (!result) {
        console.warn('Navigation was cancelled or rejected.');
      }

    } catch (error) {
      console.error('Navigation Error:', error);
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/login']),

      error: () => {
        this.auth.clearSession();
        void this.router.navigate(['/login']);
      },
    });
  }
}
