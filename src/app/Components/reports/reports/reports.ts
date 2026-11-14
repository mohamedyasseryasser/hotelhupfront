
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


 import { Reportsservice } from '../../../Service/reportsservice';
import { Authservice } from '../../../Service/authservice';
import { Roomservice } from '../../../Service/roomservice';
import { BookingSource, FolioItemType, HousekeepingTaskStatus } from '../../../Models/reports';
import { PaymentMethod, PaymentStatus, RefundStatus } from '../../../Models/folio';
import { ReservationStatus } from '../../../Models/reservation';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
import { RoomTypeRecord } from '../../../Models/roomtype';

import { Observable } from 'rxjs';
import {
  ApiResponse
} from '../../../Models/auth';
import { Permissionservice } from '../../../Service/permissionservice';
type ReportKey =
  | 'occupancy'
  | 'revenue'
  | 'arrivals'
  | 'departures'
  | 'currentGuests'
  | 'roomStatus'
  | 'payments'
  | 'refunds'
  | 'cancellations'
  | 'housekeeping'
  | 'expenses';


@Component({
  selector: 'app-reports',
  imports: [
    CommonModule,RouterLink,
    FormsModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {

  // Dependencies
  private readonly api = inject(Reportsservice);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Authservice);
private router=inject(Router);
private readonly usercurrnet=inject(Authservice);
  // General Filters
  readonly propertyId = signal(0);
  readonly from = signal('');
  readonly to = signal('');
  readonly roomTypeId = signal<number | null>(null);
readonly permissions=inject(Permissionservice);
  readonly category = signal('');
  readonly currency = signal('');
  readonly reason = signal('');


  // Report Data
  readonly report = signal<ReportKey>('occupancy');

  readonly data = signal<any>(null);
  readonly rows = signal<any[]>([]);

  readonly loading = signal(false);
  readonly error = signal('');

readonly roomTypes =
  signal<RoomTypeRecord[]>([]);

readonly roomTypesLoading =
  signal(false);


  // Payment Filters
  readonly paymentMethod = signal<number | null>(null);
  readonly paymentStatus = signal<number | null>(null);
  readonly refundStatus = signal<number | null>(null);


  // Reservation Filters
  readonly reservationStatus = signal<number | null>(null);
  readonly source = signal<number | null>(null);


  // Room Filters
  readonly roomStatus = signal<number | null>(null);


  // Housekeeping Filters
  readonly housekeepingStatus = signal<number | null>(null);


  // Enum References
  readonly methods = PaymentMethod;
  readonly paymentStatuses = PaymentStatus;
  readonly refundStatuses = RefundStatus;

  readonly reservationStatuses = ReservationStatus;
  readonly bookingSources = BookingSource;
private readonly roomTypeApi =
  inject(Roomtypeservice);

  readonly roomStatuses = Roomservice;
  readonly housekeepingStatuses = HousekeepingTaskStatus;

  readonly revenueTypes = FolioItemType;


  // Lifecycle
 ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {
    const queryId = Number(
      params.get('propertyId') ?? 0,
    );

    this.propertyId.set(
      queryId ||
      this.auth.user()?.propertyId ||
      0,
    );

    this.loadRoomTypes(this.propertyId());
    this.load();
  });
}
loadRoomTypes(propertyId: number): void {
  this.roomTypeId.set(null);

  if (!propertyId) {
    this.roomTypes.set([]);
    this.roomTypesLoading.set(false);
    return;
  }

  this.roomTypesLoading.set(true);

  this.roomTypeApi
    .getRoomTypes(propertyId, false)
    .subscribe({
      next: response => {
        this.roomTypes.set(
          (response.data ?? []).filter(
            roomType =>
              roomType.propertyId === propertyId &&
              roomType.isActive !== false,
          ),
        );

        this.roomTypesLoading.set(false);
      },

      error: () => {
        this.roomTypes.set([]);
        this.roomTypesLoading.set(false);
      },
    });
}


logout(): void {
    this.usercurrnet.logout().subscribe({
      next: () =>
        void this.router.navigate(['/login']),

      error: () => {
        this.usercurrnet.clearSession();
        void this.router.navigate(['/login']);
      },
    });
  }
  // Report Selection
  setReport(value: string): void {

    this.report.set(value as ReportKey);

    this.data.set(null);
    this.rows.set([]);

    this.load();

  }


  // Load Report
  load(): void {

    if (!this.propertyId()) {
      this.error.set('لا يمكن تحديد العقار الحالي.');
      return;
    }

    this.loading.set(true);
    this.error.set('');


    // Common Request Parameters
    const common = {
      propertyId: this.propertyId(),
      from: this.iso(this.from()),
      to: this.iso(this.to()),
    };


    // Select Report API
let request$: Observable<ApiResponse<any>>;    switch (this.report()) {

      case 'occupancy':

        request$ = this.api.occupancy({
          ...common,
          roomTypeId: this.roomTypeId() ?? undefined,
        });

        break;


      case 'revenue':

        request$ = this.api.revenue({
          ...common,
          roomTypeId: this.roomTypeId() ?? undefined,
          currency: this.currency().trim() || undefined,
        });

        break;


      case 'arrivals':

        request$ = this.api.arrivals({
          ...common,
          roomTypeId: this.roomTypeId() ?? undefined,
          status: this.reservationStatus() ?? undefined,
          source: this.source() ?? undefined,
        });

        break;


      case 'departures':

        request$ = this.api.departures({
          ...common,
          roomTypeId: this.roomTypeId() ?? undefined,
          status: this.reservationStatus() ?? undefined,
          source: this.source() ?? undefined,
        });

        break;


      case 'currentGuests':

        request$ = this.api.currentGuests(common);

        break;


      case 'roomStatus':

        request$ = this.api.roomStatus({
          ...common,
          roomTypeId: this.roomTypeId() ?? undefined,
          status: this.roomStatus() ?? undefined,
        });

        break;


      case 'payments':

        request$ = this.api.payments({
          ...common,
          status: this.paymentStatus() ?? undefined,
          method: this.paymentMethod() ?? undefined,
        });

        break;


      case 'refunds':

        request$ = this.api.refunds({
          ...common,
          status: this.refundStatus() ?? undefined,
          method: this.paymentMethod() ?? undefined,
        });

        break;


      case 'cancellations':

        request$ = this.api.cancellations({
          ...common,
          status: this.reservationStatus() ?? undefined,
          reason: this.reason().trim() || undefined,
        });

        break;


      case 'housekeeping':

        request$ = this.api.housekeeping({
          ...common,
          roomTypeId: this.roomTypeId() ?? undefined,
          status: this.housekeepingStatus() ?? undefined,
        });

        break;


      default:

        request$ = this.api.expenses({
          ...common,
          category: this.category().trim() || undefined,
          currency: this.currency().trim() || undefined,
          includeVoided: false,
        });

        break;

    }


    // Handle API Response
    request$.subscribe({

      next: response => {

        this.data.set(response.data);

        this.rows.set(
          Array.isArray(response.data)
            ? response.data
            : response.data?.items ?? []
        );

        this.loading.set(false);

      },

      error: error => {

        this.error.set(
          error?.error?.message ?? 'تعذر تحميل التقرير.'
        );

        this.loading.set(false);

      },

    });

  }


  // Date Conversion
  private iso(value: string): string | undefined {

    return value
      ? `${value}T00:00:00Z`
      : undefined;

  }


  // Status Translation
  labelStatus(value: number): string {

    const labels: Record<number, string> = {

      0: 'قيد الانتظار',
      1: 'مؤكد/تنظيف',
      2: 'داخل الفندق/مكتمل',
      3: 'خرج/تم الفحص',
      4: 'ملغى',
      5: 'No-show',
      6: 'فشل',
      7: 'ملغى',

    };

    return labels[value] ?? String(value);

  }

}
