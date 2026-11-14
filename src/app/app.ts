import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Authservice } from './Service/authservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly auth = inject(Authservice);
  private readonly router = inject(Router);

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
