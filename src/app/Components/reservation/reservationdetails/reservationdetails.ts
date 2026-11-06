
import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Reservationservice } from '../../../Service/reservationservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { Foliolist } from '../../folio/foliolist/foliolist';
import {
  AvailabilityItem,
  AvailabilityRequest,
  Reservation,
  ReservationStatus,
  ReservationStatusHistory
} from '../../../Models/reservation';
import { Avaliavility } from '../avaliavility/avaliavility';
import { forkJoin } from 'rxjs';
import { RatePlan } from '../../../Models/rateplane';
import { Rateplanservice } from '../../../Service/rateplane';

@Component({
  selector: 'app-reservationdetails',
  standalone: true,
  imports: [
    FormsModule,   Foliolist,                               
    RouterLink,
    CommonModule
    ,
    DatePipe,
    DecimalPipe
  ],
  styleUrl: './reservationdetails.css',
  templateUrl: './reservationdetails.html'
})
export class Reservationdetails {
readonly folioId = signal<number | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Reservationservice);

  readonly permissions = inject(Permissionservice);

  // Signals
  reservation = signal<Reservation | null>(null);
  
  history = signal<ReservationStatusHistory[]>([]);
ratePlans = signal<RatePlan[]>([]);
loadingRoomOptions = signal(false);
  propertyId = signal(0);
  id = signal(0);

  loading = signal(true);
  saving = signal(false);
  adults = signal(1);
children = signal(0);

availableRooms = signal<AvailabilityItem[]>([]);
  error = signal('');
  success = signal('');

  action = signal('');
  reason = signal('');
  readonly avalibilityrequest =signal<AvailabilityRequest>({
    propertyId: 0, 
    checkInDate: '', 
    checkOutDate: '',
     adults: 0, 
     children: 0,
      roomTypeId: null, 
    excludedReservationId: null
  });
  newCheckout = signal('');
  notes = signal('');
private readonly ratePlanApi = inject(Rateplanservice);

  overridePolicy = signal(false);
  identityVerified = signal(false);

  identityType = signal('');
  identityReference = signal('');

  selectedRoomId = signal<number | null>(null);
  selectedRatePlanId = signal(0);

  readonly statuses = ReservationStatus;

  constructor() {

    this.route.paramMap.subscribe(p => {

      this.id.set(Number(p.get('id')));

      this.propertyId.set(
        Number(
          this.route.snapshot.queryParamMap.get('propertyId') || 0
        )
      );

      this.load();
    });
  }

  load(): void {

    this.loading.set(true);

    this.error.set('');

    this.api.get(this.propertyId(), this.id()).subscribe({

      next: r => {

        this.reservation.set(r.data);
        this.folioId.set(r.data?.folioid ?? 0);
     console.log(r.data?.folioid );
        this.newCheckout.set(
          this.reservation()?.checkOutDate?.slice(0, 10) ?? ''
        );

        this.loading.set(false);

        this.api.getStatusHistory(
          this.propertyId(),
          this.id()
        ).subscribe({

          next: h => {
            this.history.set(h.data ?? []);
          },

          error: () => {
            this.history.set([]);
          }

        });
      },

      error: e => {

        this.error.set(
          e?.error?.message ?? 'تعذر تحميل الحجز.'
        );

        this.loading.set(false);
      }

    });
  }
openAssignRoom(reservation: Reservation): void {
  this.action.set('assign');

  this.selectedRoomId.set(null);
  this.selectedRatePlanId.set(0);

  this.adults.set(Math.max(1, reservation.adults ?? 1));
  this.children.set(Math.max(0, reservation.children ?? 0));

  this.getAvailableRooms(reservation);
}


 getAvailableRooms(reservation: Reservation): void {
  this.avalibilityrequest.set({
    propertyId: reservation.propertyId,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    
    adults: 1,
    children: 1,

    roomTypeId: null,

    // مهم حتى لا تظهر غرف الحجز الحالي ضمن النتائج
    excludedReservationId: null
  });

  this.loadingRoomOptions.set(true);
  this.error.set('');
console.log(this.avalibilityrequest());
  forkJoin({
    availability: this.api.searchAvailability(
      this.avalibilityrequest()
    ),

    plans: this.ratePlanApi.getRatePlans(
      reservation.propertyId
    )
  }).subscribe({
    next: result => {
      console.log('Available Rooms:', result.availability.data);
      this.availableRooms.set(
        result.availability.data ?? []
       );

      this.ratePlans.set(
        result.plans.data ?? []
      );

      this.loadingRoomOptions.set(false);
    },

    error: e => {
      this.availableRooms.set([]);
      this.ratePlans.set([]);

      this.loadingRoomOptions.set(false);

      this.error.set(
        e?.error?.message ??
        'تعذر تحميل الغرف المتاحة وخطط الأسعار.'
      );
    }
  });
}

 selectedRoom(): AvailabilityItem | null {
  return this.availableRooms().find(
    r => r.roomId === this.selectedRoomId()
  ) ?? null;
}
setAdults(value: string | number): void {
  this.adults.set(
    Math.max(1, Number(value) || 1)
  );
}

setChildren(value: string | number): void {
  this.children.set(
    Math.max(0, Number(value) || 0)
  );
}

  label(status: ReservationStatus): string {

    return (
      {
        0: 'معلّق',
        1: 'مؤكد',
        2: 'تم تسجيل الدخول',
        3: 'تم تسجيل الخروج',
        4: 'ملغى',
        5: 'لم يحضر'
      } as Record<number, string>
    )[status] ?? 'غير معروف';
  }

  canAction(): boolean {

    return !!this.reservation() && !this.saving();
  }
                                                   
  run(action: string): void {

    if (!this.reservation() || !this.canAction()) {
      return;
    }

    this.saving.set(true);

    this.error.set('');
    this.success.set('');

    const row = this.reservation()!.rowVersion;

    let call;

    switch (action) {

      case 'confirm':

        call = this.api.confirm(
          this.propertyId(),
          this.id(),
          {
            reason: this.reason(),
            expectedRowVersion: row
          }
        );

        break;

      case 'cancel':

        if (!this.reason().trim()) {

          this.error.set('سبب الإلغاء مطلوب.');
          this.saving.set(false);

          return;
        }

        call = this.api.cancel(
          this.propertyId(),
          this.id(),
          {
            reason: this.reason(),
            overridePolicy: this.overridePolicy(),
            expectedRowVersion: row
          }
        );

        break;

      case 'noshow':

        call = this.api.noShow(
          this.propertyId(),
          this.id(),
          {
            reason: this.reason(),
            overridePolicy: this.overridePolicy(),
            expectedRowVersion: row
          }
        );

        break;

      case 'assign':

        if (!this.selectedRoomId() || !this.selectedRatePlanId()) {

          this.error.set('أدخل Room ID وRate Plan ID.');
          this.saving.set(false);

          return;
        }

        call = this.api.assignRoom(
          this.propertyId(),
          this.id(),
          {
            rooms: [
              {
              roomId: this.selectedRoomId()!,
          ratePlanId: this.selectedRatePlanId(),

          adults: this.adults(),
          children: this.children()
              }
            ],
            reason: this.reason()
          }
        );

        break;

      case 'checkin':

        call = this.api.checkIn(
          this.propertyId(),
          this.id(),
          {
            roomId: this.selectedRoomId(),
            roomIds: this.selectedRoomId()
              ? [this.selectedRoomId()!]
              : [],
            identityVerified: this.identityVerified(),
            identityType: this.identityType(),
            identityReference: this.identityReference(),
            registrationNotes: this.notes()
          }
        );

        break;

      case 'checkout':

        call = this.api.checkOut(
          this.propertyId(),
          this.id(),
          {
            notes: this.notes(),
            managerOverride: this.overridePolicy()
          }
        );

        break;

      case 'extend':

        if (!this.newCheckout()) {

          this.error.set('حدد تاريخ المغادرة الجديد.');
          this.saving.set(false);

          return;
        }

        call = this.api.extendCheckout(
          this.propertyId(),
          this.id(),
          {
            newCheckOutDate: this.newCheckout(),
            reason: this.reason()
          }
        );

        break;

      case 'early':

        call = this.api.earlyCheckout(
          this.propertyId(),
          this.id(),
          {
            checkOutDate: this.newCheckout() || null,
            managerOverride: this.overridePolicy(),
            notes: this.notes()
          }
        );

        break;

      default:

        this.saving.set(false);
        return;
    }

    call.subscribe({

      next: r => {

        this.success.set(
          r.message || 'تم تنفيذ الإجراء بنجاح.'
        );

        this.action.set('');
        this.reason.set('');
        this.notes.set('');

        this.saving.set(false);

        this.load();
      },

      error: e => {

        this.error.set(
          e?.error?.message ?? 'تعذر تنفيذ الإجراء.'
        );

        this.saving.set(false);
      }

    });
  }
 
  ratePlansForSelectedRoom(): RatePlan[] {
  const room = this.availableRooms().find(
    r => r.roomId === this.selectedRoomId()
  );

  if (!room) {
    return [];
  }

  return this.ratePlans().filter(plan =>
    plan.roomTypeId === room.roomTypeId &&
    plan.isActive &&
    !!plan.currentVersion?.isActive
  );
}

  release(roomId: number): void {

    if (!confirm('هل تريد تحرير هذه الغرفة؟')) {
      return;
    }

    this.saving.set(true);

    this.api.releaseRoom(
      this.propertyId(),
      this.id(),
      roomId
    ).subscribe({

      next: r => {

        this.success.set(
          r.message || 'تم تحرير الغرفة.'
        );

        this.saving.set(false);

        this.load();
      },

      error: e => {

        this.error.set(
          e?.error?.message ?? 'تعذر تحرير الغرفة.'
        );

        this.saving.set(false);
      }

    });
  }
}
