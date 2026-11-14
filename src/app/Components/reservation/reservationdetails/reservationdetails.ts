import { Component, inject, signal } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { Reservationservice } from '../../../Service/reservationservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { Foliolist } from '../../folio/foliolist/foliolist';

import {
  AvailabilityItem,
  AvailabilityRequest,
  Reservation,
  ReservationHistoryData,
  ReservationStatus,
  ReservationStatusHistory,
} from '../../../Models/reservation';

import { forkJoin } from 'rxjs';
import { RatePlan } from '../../../Models/rateplane';
import { Rateplanservice } from '../../../Service/rateplane';

@Component({
  selector: 'app-reservationdetails',
  standalone: true,
  imports: [
    FormsModule,
    Foliolist,
    RouterLink,
    CommonModule,
    DatePipe,
    DecimalPipe,
  ],
  styleUrl: './reservationdetails.css',
  templateUrl: './reservationdetails.html',
})
export class Reservationdetails {
  readonly folioId = signal<number | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Reservationservice);
  private readonly ratePlanApi = inject(Rateplanservice);

  readonly permissions = inject(Permissionservice);

  reservation = signal<Reservation | null>(null);

  history = signal<ReservationStatusHistory[]>([]);

  snapshots = signal<
    ReservationHistoryData['snapshots'] | null
  >(null);

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

  readonly avalibilityrequest =
    signal<AvailabilityRequest>({
      propertyId: 0,
      checkInDate: '',
      checkOutDate: '',
      adults: 0,
      children: 0,
      roomTypeId: null,
      excludedReservationId: null,
    });

  newCheckout = signal('');
  notes = signal('');

  overridePolicy = signal(false);
  identityVerified = signal(false);

  identityType = signal('');
  identityReference = signal('');

  selectedRoomId = signal<number | null>(null);
  selectedRatePlanId = signal(0);

  readonly statuses = ReservationStatus;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.id.set(Number(params.get('id')));

      this.propertyId.set(
        Number(
          this.route.snapshot.queryParamMap.get(
            'propertyId',
          ) || 0,
        ),
      );

      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api
      .get(this.propertyId(), this.id())
      .subscribe({
        next: (response) => {
          this.reservation.set(response.data);

          this.folioId.set(
            response.data?.folioid ?? 0,
          );

          this.newCheckout.set(
            this.reservation()
              ?.checkOutDate?.slice(0, 10) ?? '',
          );

          this.loading.set(false);

          this.api
            .getStatusHistory(
              this.propertyId(),
              this.id(),
            )
            .subscribe({
              next: (historyResponse) => {
                const data = historyResponse.data;

                this.history.set(
                  data?.statusHistory ?? [],
                );

                this.snapshots.set(
                  data?.snapshots ?? null,
                );
              },
              error: () => {
                this.history.set([]);
                this.snapshots.set(null);
              },
            });
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحميل الحجز.',
          );

          this.loading.set(false);
        },
      });
  }

  openAssignRoom(reservation: Reservation): void {
    this.action.set('assign');

    this.selectedRoomId.set(null);
    this.selectedRatePlanId.set(0);

    this.adults.set(
      Math.max(1, reservation.adults ?? 1),
    );

    this.children.set(
      Math.max(0, reservation.children ?? 0),
    );

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
      excludedReservationId: null,
    });

    this.loadingRoomOptions.set(true);
    this.error.set('');

    forkJoin({
      availability: this.api.searchAvailability(
        this.avalibilityrequest(),
      ),

      plans: this.ratePlanApi.getRatePlans(
        reservation.propertyId,
      ),
    }).subscribe({
      next: (result) => {
        this.availableRooms.set(
          result.availability.data ?? [],
        );

        this.ratePlans.set(
          result.plans.data ?? [],
        );

        this.loadingRoomOptions.set(false);
      },

      error: (error) => {
        this.availableRooms.set([]);
        this.ratePlans.set([]);

        this.loadingRoomOptions.set(false);

        this.error.set(
          error?.error?.message ??
            'تعذر تحميل الغرف المتاحة وخطط الأسعار.',
        );
      },
    });
  }

  selectedRoom(): AvailabilityItem | null {
    return (
      this.availableRooms().find(
        (room) =>
          room.roomId === this.selectedRoomId(),
      ) ?? null
    );
  }

  setAdults(value: string | number): void {
    this.adults.set(
      Math.max(1, Number(value) || 1),
    );
  }

  setChildren(value: string | number): void {
    this.children.set(
      Math.max(0, Number(value) || 0),
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
        5: 'لم يحضر',
      } as Record<number, string>
    )[status] ?? 'غير معروف';
  }

  canAction(): boolean {
    return (
      !!this.reservation() &&
      !this.saving()
    );
  }

  run(action: string): void {
    if (
      !this.reservation() ||
      !this.canAction()
    ) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const rowVersion =
      this.reservation()!.rowVersion;

    let call;

    switch (action) {
      case 'confirm':
        call = this.api.confirm(
          this.propertyId(),
          this.id(),
          {
            reason: this.reason(),
            expectedRowVersion: rowVersion,
          },
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
            expectedRowVersion: rowVersion,
          },
        );
        break;

      case 'noshow':
        call = this.api.noShow(
          this.propertyId(),
          this.id(),
          {
            reason: this.reason(),
            overridePolicy: this.overridePolicy(),
            expectedRowVersion: rowVersion,
          },
        );
        break;

      case 'assign':
        if (
          !this.selectedRoomId() ||
          !this.selectedRatePlanId()
        ) {
          this.error.set(
            'أدخل Room ID وRate Plan ID.',
          );

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
                ratePlanId:
                  this.selectedRatePlanId(),
                adults: this.adults(),
                children: this.children(),
              },
            ],
            reason: this.reason(),
          },
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
            identityVerified:
              this.identityVerified(),
            identityType: this.identityType(),
            identityReference:
              this.identityReference(),
            registrationNotes: this.notes(),
          },
        );
        break;

      case 'checkout':
        call = this.api.checkOut(
          this.propertyId(),
          this.id(),
          {
            notes: this.notes(),
            managerOverride:
              this.overridePolicy(),
          },
        );
        break;

      case 'extend':
        if (!this.newCheckout()) {
          this.error.set(
            'حدد تاريخ المغادرة الجديد.',
          );

          this.saving.set(false);
          return;
        }

        call = this.api.extendCheckout(
          this.propertyId(),
          this.id(),
          {
            newCheckOutDate:
              this.newCheckout(),
            reason: this.reason(),
          },
        );
        break;

      case 'early':
        call = this.api.earlyCheckout(
          this.propertyId(),
          this.id(),
          {
            checkOutDate:
              this.newCheckout() || null,
            managerOverride:
              this.overridePolicy(),
            notes: this.notes(),
          },
        );
        break;

      default:
        this.saving.set(false);
        return;
    }

    call.subscribe({
      next: (response) => {
        this.success.set(
          response.message ||
            'تم تنفيذ الإجراء بنجاح.',
        );

        this.action.set('');
        this.reason.set('');
        this.notes.set('');

        this.saving.set(false);

        this.load();
      },

      error: (error) => {
        this.error.set(
          error?.error?.message ??
            'تعذر تنفيذ الإجراء.',
        );

        this.saving.set(false);
      },
    });
  }

  ratePlansForSelectedRoom(): RatePlan[] {
    const room = this.availableRooms().find(
      (item) =>
        item.roomId === this.selectedRoomId(),
    );

    if (!room) {
      return [];
    }

    return this.ratePlans().filter(
      (plan) =>
        plan.roomTypeId === room.roomTypeId &&
        plan.isActive &&
        !!plan.currentVersion?.isActive,
    );
  }

  release(roomId: number): void {
    if (
      !confirm('هل تريد تحرير هذه الغرفة؟')
    ) {
      return;
    }

    this.saving.set(true);

    this.api
      .releaseRoom(
        this.propertyId(),
        this.id(),
        roomId,
      )
      .subscribe({
        next: (response) => {
          this.success.set(
            response.message ||
              'تم تحرير الغرفة.',
          );

          this.saving.set(false);
          this.load();
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحرير الغرفة.',
          );

          this.saving.set(false);
        },
      });
  }

  /**
   * إجمالي عدد الليالي بين تاريخ الوصول والمغادرة.
   */
  totalNights(): number {
    const reservation = this.reservation();

    if (
      !reservation?.checkInDate ||
      !reservation.checkOutDate
    ) {
      return 0;
    }

    const checkIn = new Date(
      reservation.checkInDate,
    );

    const checkOut = new Date(
      reservation.checkOutDate,
    );

    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    const nights = Math.round(
      (checkOut.getTime() -
        checkIn.getTime()) /
        millisecondsPerDay,
    );

    return Math.max(0, nights);
  }

  /**
   * إجمالي أسعار الغرف قبل الخصم
   * والضرائب والرسوم.
   */
  roomsSubtotalBeforeDiscount(): number {
    return (
      this.reservation()?.rooms.reduce(
        (total, room) =>
          total +
          (Number(room.baseAmount) || 0),
        0,
      ) ?? 0
    );
  }

  /**
   * إجمالي الخصومات المسجلة على الحجز.
   */
  totalDiscountAmount(): number {
    const reservation = this.reservation();

    if (!reservation) {
      return 0;
    }

    const reservationDiscount =
      Number(reservation.discountAmount) || 0;

    if (reservationDiscount > 0) {
      return reservationDiscount;
    }

    return reservation.rooms.reduce(
      (total, room) =>
        total +
        (Number(room.discountAmount) || 0),
      0,
    );
  }

  /**
   * صافي الغرف بعد الخصم وقبل الضرائب.
   */
  netRoomsBeforeTax(): number {
    return Math.max(
      0,
      this.roomsSubtotalBeforeDiscount() -
        this.totalDiscountAmount(),
    );
  }

  /**
   * مجموع الضرائب المضمنة داخل سعر الغرف.
   */
  inclusiveTaxAmount(): number {
    return (
      this.snapshots()?.taxes ?? []
    )
      .filter((tax) => tax.isInclusive)
      .reduce(
        (total, tax) =>
          total +
          (Number(tax.taxAmount) || 0),
        0,
      );
  }

  /**
   * مجموع الضرائب التي تضاف فوق السعر.
   */
  exclusiveTaxAmount(): number {
    const totalTax =
      Number(
        this.reservation()?.taxAmount,
      ) || 0;

    return Math.max(
      0,
      totalTax -
        this.inclusiveTaxAmount(),
    );
  }

  /**
   * إجمالي الغرف بعد الخصم وإضافة
   * الضرائب الشاملة داخل السعر.
   */
  roomsIncludingInclusiveTax(): number {
    return (
      this.netRoomsBeforeTax() +
      this.inclusiveTaxAmount()
    );
  }

  /**
   * إجمالي الرسوم على مستوى الحجز.
   */
  totalFees(): number {
    const reservation = this.reservation();

    if (!reservation) {
      return 0;
    }

    const reservationFees =
      Number(reservation.feeAmount) || 0;

    if (reservationFees > 0) {
      return reservationFees;
    }

    return reservation.rooms.reduce(
      (total, room) =>
        total +
        (Number(room.feeAmount) || 0),
      0,
    );
  }

  /**
   * الإجمالي النهائي كما أرسله Backend.
   */
  finalReservationTotal(): number {
    return (
      Number(
        this.reservation()?.totalAmount,
      ) || 0
    );
  }
}
