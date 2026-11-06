
import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Authservice } from '../../../Service/authservice';
import { Reservationservice } from '../../../Service/reservationservice';
import { Permissionservice } from '../../../Service/permissionservice';

import {
  BookingSource,
  ReservationSearchRequest,
  ReservationStatus,
  ReservationSummary
} from '../../../Models/reservation';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './reservationlist.html',
  styleUrl: './reservationlist.css'
})
export class Reservationlist {

  private readonly route = inject(ActivatedRoute);

  readonly auth = inject(Authservice);
  readonly api = inject(Reservationservice);
  readonly permissions = inject(Permissionservice);

  readonly statuses = ReservationStatus;
  readonly sources = BookingSource;

  // State
  readonly items = signal<ReservationSummary[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly page = signal(1);
  readonly pageSize = signal(10);

  // Filters
  readonly filters = signal<ReservationSearchRequest>({
    propertyId: null,
    status: null,
    from: null,
    to: null,
    guestId: null,
    roomId: null,
    source: null,
    page: 1,
    pageSize: 10
  });

  // Computed
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize()))
  );

 constructor() {
  this.route.queryParamMap.subscribe(params => {
  
    const propertyIdParam = params.get('propertyId');
    const propertyId = Number(propertyIdParam);

    // Validate PropertyId
    if (
      propertyIdParam === null ||
      propertyIdParam.trim() === '' ||
      !Number.isInteger(propertyId) ||
      propertyId <= 0
    ) {
       this.error.set('يجب تحديد العقار لجلب الحجوزات.');
      this.items.set([]);
      this.total.set(0);
      return;
    }

    // Update PropertyId
    this.filters.update(filters => ({
      ...filters,
      propertyId
    }));

    // Reset Pagination
    this.page.set(1);

    // Load Reservations
    this.load();
  });
}

  load(): void {
    this.loading.set(true);
    this.error.set('');

    const currentPage = this.page();
    const currentPageSize = this.pageSize();

    const request: ReservationSearchRequest = {
      ...this.filters(),
      page: currentPage,
      pageSize: currentPageSize
    };

    this.api.list(request).subscribe({
      next: response => {
        console.log(response.data)
        this.items.set(response.data?.items ?? []);
        this.total.set(response.data?.totalCount ?? 0);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(
          error?.error?.message ?? 'تعذر تحميل الحجوزات.'
        );

        this.loading.set(false);
      }
    });
  }

  reset(): void {
    this.filters.update(filters => ({
      ...filters,
      status: null,
      from: null,
      to: null,
      guestId: null,
      roomId: null,
      source: null
    }));

    this.page.set(1);

    this.load();
  }

  previous(): void {
    if (this.page() > 1) {
      this.page.update(page => page - 1);
      this.load();
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(page => page + 1);
      this.load();
    }
  }

  statusLabel(status: ReservationStatus): string {
    return ({
      [ReservationStatus.Pending]: 'معلّق',
      [ReservationStatus.Confirmed]: 'مؤكد',
      [ReservationStatus.CheckedIn]: 'تم تسجيل الدخول',
      [ReservationStatus.CheckedOut]: 'تم تسجيل الخروج',
      [ReservationStatus.Cancelled]: 'ملغى',
      [ReservationStatus.NoShow]: 'لم يحضر'
    } as Record<number, string>)[status] ?? 'غير معروف';
  }

  statusClass(status: ReservationStatus): string {
    return `status-${status}`;
  }

  sourceLabel(source: BookingSource): string {
    return ({
      [BookingSource.Direct]: 'مباشر',
      [BookingSource.Online]: 'أونلاين',
      [BookingSource.Phone]: 'هاتف',
      [BookingSource.Agent]: 'وكيل',
      [BookingSource.WalkIn]: 'Walk-in'
    } as Record<number, string>)[source] ?? '—';
  }
}
