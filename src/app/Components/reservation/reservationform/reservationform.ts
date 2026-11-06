import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Authservice } from '../../../Service/authservice';
import { Reservationservice } from '../../../Service/reservationservice';
import { Avaliavility } from '../avaliavility/avaliavility';
import {
  AvailabilitySelection,
  BookingSource,
  CancellationPolicyVersionOption,
  CreateReservationRequest,
  DepositPolicyVersionOption,
  Reservation,
  ReservationRoomDraft,
  UpdateReservationRequest,
} from '../../../Models/reservation';
import { Cancellationpolicy } from '../../../Service/cancellationpolicy';
import { Propertydepositpolicyservice } from '../../../Service/depositservice';
import { CancellationPolicyRecord, CancellationPolicyStatus } from '../../../Models/cancellationpolicy';
import { DepositPolicyRecord } from '../../../Models/depositpolicy';
import { forkJoin } from 'rxjs';
import { readonly } from '@angular/forms/signals';
import { DatePipe } from '@angular/common';
import { RoomTypeRecord } from '../../../Models/roomtype';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
interface ReservationFormState {
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  source: BookingSource;
  cancellationPolicyId: number;
  cancellationPolicyVersionId: number;
  depositPolicyId: number;
  depositPolicyVersionId: number;
  notes: string;
}


@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [FormsModule,DatePipe, RouterLink,Avaliavility],
  templateUrl: './reservationform.html',
  styleUrl: './reservationform.css',
})
export class Reservationform implements OnInit {
  private readonly api = inject(Reservationservice);
  private readonly auth = inject(Authservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly cancellationApi = inject(Cancellationpolicy);

  private readonly depositApi = inject(
    Propertydepositpolicyservice,
  );
readonly cancellationPolicyVersions =
  signal<CancellationPolicyVersionOption[]>([]);

readonly depositPolicyVersions =
  signal<DepositPolicyVersionOption[]>([]);

  readonly sources = BookingSource;
  readonly cancellationStatus = CancellationPolicyStatus;

  readonly editId = signal<number | null>(null);
  readonly propertyId = signal(0);
  readonly existing = signal<Reservation | null>(null);
private readonly roomTypeApi =
  inject(Roomtypeservice);

readonly roomTypes =
  signal<RoomTypeRecord[]>([]);

  readonly cancellationPolicies = signal<
    CancellationPolicyRecord[]
  >([]);

  readonly depositPolicies = signal<
    DepositPolicyRecord[]
  >([]);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly policiesLoading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

 readonly form = signal<ReservationFormState>({
  guestId: 0,
  checkInDate: this.dateOffset(1),
  checkOutDate: this.dateOffset(3),
  source: BookingSource.Direct,
  cancellationPolicyId: 0,
  cancellationPolicyVersionId: 0,
  depositPolicyId: 0,
  depositPolicyVersionId: 0,
  notes: '',
});


  readonly rooms = signal<ReservationRoomDraft[]>([]);

  readonly selectedRoomIds = computed(() =>
    this.rooms()
      .map((room) => room.roomId)
      .filter(
        (id): id is number => !!id,
      ),
  );

  readonly canSubmit = computed(() => {
    const value = this.form();

    const policiesValid = this.editId() || (
      value.cancellationPolicyId > 0 &&
      value.cancellationPolicyVersionId > 0 &&
      value.depositPolicyId > 0 &&
      value.depositPolicyVersionId > 0
    );

    return (
      value.guestId > 0 &&
      !!value.checkInDate &&
      !!value.checkOutDate &&
      policiesValid &&
      this.rooms().length > 0 &&
      !this.policiesLoading()
    );
  });
url = signal(this.router.url);

isNewReservation = computed(() =>
  this.url().includes('/reservations/new')
);

isEditReservation = computed(() =>
  /\/reservations\/\d+\/edit/.test(this.url())
);
 
  ngOnInit(): void {

  // Get PropertyId from QueryParams
  this.route.queryParamMap.subscribe(param => {

    const requestPropertyId = Number(param.get('propertyId'));

    if (!Number.isInteger(requestPropertyId) || requestPropertyId <= 0) {

      const authenticatedPropertyId = Number(
        this.auth.user()?.propertyId ?? 0
      );

      if (authenticatedPropertyId <= 0) {
        this.error.set('يجب تحديد العقار');
        return;
      }

      this.propertyId.set(authenticatedPropertyId);

    } else {
      this.propertyId.set(requestPropertyId);
    }

    // Load policies after PropertyId is available
    this.loadPolicies(this.propertyId());
    
    // Check URL
    const url = this.router.url;

    if (url.includes('/reservations/new')) {

      // Create Reservation
      console.log('Create Reservation');

    }
    else if (/\/reservations\/\d+\/edit/.test(url)) {

      // Update Reservation
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (id > 0) {
        this.editId.set(id);
        this.loadReservation(this.propertyId(), id);
      }
    }

  });
}
  
  patchForm<K extends keyof ReservationFormState>(
    key: K,
    value: ReservationFormState[K],
  ): void {
    this.form.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  patchRoom(
    index: number,
    patch: Partial<ReservationRoomDraft>,
  ): void {
    this.rooms.update((rooms) =>
      rooms.map((room, roomIndex) =>
        roomIndex === index
          ? { ...room, ...patch }
          : room,
      ),
    );
  }

  removeRoom(index: number): void {
    this.rooms.update((rooms) =>
      rooms.filter(
        (_, roomIndex) => roomIndex !== index,
      ),
    );
  }

  selectCancellationPolicy(policyId: number): void {
    const policy = this.cancellationPolicies().find(
      (candidate) => candidate.id === policyId,
    );
    
    this.form.update((current) => ({
      ...current,
      cancellationPolicyId: policyId,
      cancellationPolicyVersionId:
        this.currentCancellationVersionId(policy)?.id??0,
    }));
  }

  selectDepositPolicy(policyId: number): void {
    const policy = this.depositPolicies().find(
      (candidate) => candidate.id === policyId,
    );

    this.form.update((current) => ({
      ...current,
      depositPolicyId: policyId,
      depositPolicyVersionId:
        this.currentDepositVersionId(policy)?.id??0,
    }));
  }

onRoomSelected(
  selection: AvailabilitySelection,
): void {
  const item = selection.item;

  const draft: ReservationRoomDraft = {
    reservationRoomId: null,

    roomId: item.roomId,
    roomNumber: item.roomNumber,

    roomTypeId: item.roomTypeId,
    roomTypeName: item.roomTypeName,

    maxAdults: item.maxAdults,
    maxChildren: item.maxChildren,

    ratePlanId: selection.ratePlanId,

    adults: selection.adults,
    children: selection.children,

    discountAmount: 0,
    feeAmount: 0,

    nightlyRate: item.nightlyRate,
    nights: item.nights,
  };

  this.rooms.update((rooms) => {
    const existingIndex =
      rooms.findIndex(
        room =>
          room.roomId === item.roomId
      );

    if (existingIndex >= 0) {
      return rooms.map((room, index) =>
        index === existingIndex
          ? {
              ...room,
              ...draft,
            }
          : room
      );
    }

    return [
      ...rooms,
      draft,
    ];
  });

  this.error.set('');
  this.success.set(
    `تمت إضافة الغرفة ${item.roomNumber} إلى الحجز.`
  );
}

clampAdults(
  value: string | number,
  max: number
): number {
  return Math.min(
    Math.max(Number(value) || 1, 1),
    max
  );
}

clampChildren(
  value: string | number,
  max: number
): number {
  return Math.min(
    Math.max(Number(value) || 0, 0),
    max
  );
}


  submit(): void {
    this.error.set('');
    this.success.set('');

    if (!this.canSubmit()) {
      this.error.set(
        'أكمل بيانات الضيف والتواريخ واختر الغرف وCancellation Policy وDeposit Policy.',
      );
      return;
    }

    const value = this.form();
    const rooms = this.rooms();

    this.saving.set(true);

    if (this.editId() && this.existing()) {
      const request: UpdateReservationRequest = {
        checkInDate: value.checkInDate,
        checkOutDate: value.checkOutDate,
        guestId: value.guestId,

        rooms: rooms.map((room) => ({
          reservationRoomId:
            room.reservationRoomId ?? null,
          roomId: room.roomId,
          roomTypeId: room.roomTypeId,
          ratePlanId: room.ratePlanId,
          adults: room.adults,
          children: room.children,
          discountAmount: room.discountAmount,
          feeAmount: room.feeAmount,
        })),

        expectedRowVersion:
          this.existing()!.rowVersion,
      };
 console.log(request);

      this.api
        .update(
          this.propertyId(),
          this.editId()!,
          request,
        )
        .subscribe(this.done());

      return;
    }

    const request: CreateReservationRequest = {
      propertyId: this.propertyId(),
      guestId: value.guestId,
      checkInDate: value.checkInDate,
      checkOutDate: value.checkOutDate,
      source: value.source,
      
      createReservationRoomRequests:
        rooms.map((room) => ({
          roomId: room.roomId,
          roomTypeId: room.roomTypeId,
          ratePlanId: room.ratePlanId,
          adults: room.adults,
          children: room.children,
          discountAmount: room.discountAmount,
          feeAmount: room.feeAmount,
        })),

      cancellationPolicyId:
        value.cancellationPolicyId,

      cancellationPolicyVersionId:
        value.cancellationPolicyVersionId,

      depositPolicyId:
        value.depositPolicyId,

      depositPolicyVersionId:
        value.depositPolicyVersionId,

      notes: value.notes,
    };

    this.api
      .create(request)
      .subscribe(this.done());
  }

 private loadPolicies(propertyId: number): void {
  if (!propertyId) {
    this.error.set(
      'لا يوجد Property ID صالح لتحميل السياسات.',
    );
    return;
  }

  this.policiesLoading.set(true);

  forkJoin({
    cancellation:
      this.cancellationApi.getPolicies(propertyId),

    deposit:
      this.depositApi.getDepositPolicies(propertyId),
  }).subscribe({
    next: (response) => {
      const cancellationPolicies =
        response.cancellation.data ?? [];

      const depositPolicies =
        response.deposit.data ?? [];

      this.cancellationPolicies.set(
        cancellationPolicies,
      );

      this.depositPolicies.set(
        depositPolicies,
      );

     

      this.policiesLoading.set(false);
    },

    error: (error: any) => {
      console.error(
        'Error loading policies:',
        error,
      );

      this.policiesLoading.set(false);

      this.error.set(
        error?.error?.message ??
          'تعذر تحميل سياسات الإلغاء والعربون.',
      );
    },
  });
}

  private loadReservation(
  propertyId: number,
  id: number,
): void {
  this.loading.set(true);

  this.api.get(propertyId, id).subscribe({
    next: (response) => {
      this.loading.set(false);

      const reservation = response.data;

      if (!reservation) {
        this.error.set(
          response.message ||
            'الحجز غير موجود.',
        );
        return;
      }

      this.existing.set(reservation);

      this.form.update((form) => ({
        ...form,
        guestId: reservation.guestId,
        checkInDate:
          reservation.checkInDate.slice(0, 10),
        checkOutDate:
          reservation.checkOutDate.slice(0, 10),
        adults: reservation.adults,
        children: reservation.children,
        source: reservation.source,
      }));

      this.rooms.set(
        reservation.rooms
          .filter((room) => room.isCurrent)
          .map((room) => {
            const roomType = this.roomTypes().find(
              (type) => type.id === room.roomTypeId,
            );

            return {
              reservationRoomId: room.id,
              roomId: room.roomId,
              roomNumber: room.roomNumber,
              roomTypeId: room.roomTypeId,

              maxAdults:
                roomType?.maxAdults ?? 20,

              maxChildren:
                roomType?.maxChildren ?? 20,

              ratePlanId: room.ratePlanId,
              adults: room.adults,
              children: room.children,
              discountAmount: room.discountAmount,
              feeAmount: room.feeAmount,
              nightlyRate: room.nightlyRate,
              nights: room.nights,
            };
          }),
      );
    },

    error: (error: any) => {
      this.loading.set(false);

      this.error.set(
        error?.error?.message ??
          'تعذر تحميل الحجز.',
      );
    },
  });
  
  this.roomTypeApi
  .getRoomTypes(propertyId)
  .subscribe({
    next: (response) => {
      const roomTypes =
        response.data ?? [];

      this.roomTypes.set(roomTypes);

      this.rooms.update((rooms) =>
        rooms.map((room) => {
          const roomType =
            roomTypes.find(
              type =>
                type.id === room.roomTypeId
            );

          return {
            ...room,

            maxAdults:
              roomType?.maxAdults ??
              room.maxAdults ??
              20,

            maxChildren:
              roomType?.maxChildren ??
              room.maxChildren ??
              20,
          };
        })
      );
    },
  });

}
  private done() {
    return {
      next: (response: any) => {
        this.saving.set(false);

        if (response.success && response.data) {
          this.router.navigate(
            ['/reservations', response.data.id],
            {
              queryParams: {
                propertyId: this.propertyId(),
              },
            },
          );
        } else {
          this.error.set(
            response.message ||
              'تعذر حفظ الحجز.',
          );
        }
      },

      error: (error: any) => {
        this.saving.set(false);
        this.error.set(
          error?.error?.message ??
            'تعذر الاتصال بالخادم.',
        );
      },
    };
  }

  private dateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private currentCancellationVersionId(
    policy: CancellationPolicyRecord | undefined,
  ) {
    return (
      policy?.versions.find(
        (version) =>
          version.version === policy.currentVersion,
      )
    );
  }

  private currentDepositVersionId(
    policy: DepositPolicyRecord | undefined,
  ) {
    return (
      policy?.versions.find(
        (version) =>
          version.version === policy.currentVersion,
      )
    );
  }
}