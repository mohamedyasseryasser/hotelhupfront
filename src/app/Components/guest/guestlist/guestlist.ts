
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { GuestListItem } from '../../../Models/guest';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Guestservice } from '../../../Service/guestservice';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  selector: 'app-guestlist',
  styleUrl: './guestlist.css',
  templateUrl: './guestlist.html',
})
export class Guestlist implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Guestservice);

  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly guests = signal<GuestListItem[]>([]);

  readonly page = signal(1);
  readonly pageSize = 20;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  readonly search = signal('');
  readonly isActive = signal<boolean | undefined>(true);

  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (id <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }

    this.propertyId.set(id);

    this.load();
  }

  load(page = this.page()): void {

    this.page.set(page);
    this.loading.set(true);
    this.error.set('');

    this.api.getGuests(
      this.propertyId(),
      {
        pageNumber: page,
        pageSize: this.pageSize,
        search: this.search().trim() || undefined,
        isActive: this.isActive(),
        sortBy: 'name',
        sortDirection: 'asc'
      }
    )
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {

          if (!response.success || !response.data) {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تحميل الضيوف.'
              )
            );
            return;
          }

          this.guests.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
          this.totalPages.set(response.data.totalPages);
        },

        error: (error: unknown) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل الضيوف.'
            )
          );
        },
      });
  }

  submitSearch(): void {
    this.load(1);
  }

  view(guest: GuestListItem): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'guests',
      guest.id,
    ]);
  }

  edit(guest: GuestListItem): void {

    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'guests',
      guest.id,
      'edit'
    ]);
  }

  create(): void {

    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'guests',
      'create'
    ]);
  }

}
