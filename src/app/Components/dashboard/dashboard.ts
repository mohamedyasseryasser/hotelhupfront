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

    console.log('Current User:', user);
    console.log('Is Admin:', this.auth.hasRole('Admin'));
    console.log('Property ID:', user?.propertyId);

    let targetUrl: string;

    if (this.auth.hasRole('Admin')) {
      targetUrl = '/properties';
    } else if (user?.propertyId) {
      targetUrl = `/properties/${user.propertyId}`;
    } else {
      targetUrl = '/login';
    }

    console.log('Navigating to:', targetUrl);

    try {
      const result = await this.router.navigateByUrl(targetUrl);
 
console.log('Navigation Result:', result);
console.log('Current URL:', this.router.url);
      console.log('Navigation Result:', result);

      if (!result) {
        console.warn('Navigation was cancelled or rejected.');
      }
    } catch (error) {
      console.error('Navigation Error:', error);
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () =>
        void this.router.navigate(['/login']),

      error: () => {
        this.auth.clearSession();
        void this.router.navigate(['/login']);
      },
    });
  }
}