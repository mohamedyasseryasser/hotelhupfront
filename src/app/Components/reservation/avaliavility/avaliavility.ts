import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { Rateplanservice } from '../../../Service/rateplane';
import { Authservice } from '../../../Service/authservice';
import { Reservationservice } from '../../../Service/reservationservice';

import {
  AvailabilityItem,
  AvailabilityRequest,
  AvailabilitySelection,
} from '../../../Models/reservation';

import { RatePlan } from '../../../Models/rateplane';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
import { RoomTypeRecord } from '../../../Models/roomtype';
import { routes } from '../../../app.routes';
import { Permissionservice } from '../../../Service/permissionservice';

interface AvailabilityChoice {
  ratePlanId: number;
  adults: number;
  children: number;
}


@Component({
  selector: 'app-avaliavility',
  standalone: true,
  imports: [DatePipe,
    FormsModule,
    RouterLink,
    DecimalPipe,
  ],
  templateUrl: './avaliavility.html',
  styleUrl: './avaliavility.css',
})
export class Avaliavility implements OnInit {
  private readonly auth = inject(Authservice);
  private readonly reservationApi =
    inject(Reservationservice);
  private readonly ratePlanApi =
    inject(Rateplanservice);
private readonly roomTypeApi =
  inject(Roomtypeservice);

  private parentValuesInitialized = false;
  private lastRequestKey = '';
readonly route=inject(ActivatedRoute);
  readonly embedded = input(true);
  
  readonly propertyId =
    input<number | null>(null);

  readonly checkInDate =
    input<string | null>(null);

  readonly checkOutDate =
    input<string | null>(null);

  readonly adults =
    input<number | null>(null);

  readonly children =
    input<number | null>(null);

  readonly excludedReservationId =
    input<number | null>(null);
readonly permissions=inject(Permissionservice);
  readonly selectedRoomIds =
    input<readonly number[]>([]);

  readonly roomSelected =
    output<AvailabilitySelection>();

  readonly standaloneRequest =
    signal<AvailabilityRequest>({
      propertyId: Number(
        this.auth.user()?.propertyId ?? 0
      ),
      checkInDate: this.dateOffset(1),
      checkOutDate: this.dateOffset(3),
      adults: 1,
      children: 0,
      roomTypeId: null,
      excludedReservationId: null,
    });
readonly roomTypes =
  signal<RoomTypeRecord[]>([]);

   
  readonly request =
    computed<AvailabilityRequest>(() => ({
      ...this.standaloneRequest(),
    }));

  readonly items =
    signal<AvailabilityItem[]>([]);

  readonly ratePlans =
    signal<RatePlan[]>([]);

  readonly choices =
    signal<Record<number, AvailabilityChoice>>({});

  readonly loading =
    signal(false);

  readonly searched =
    signal(false);

  readonly error =
    signal('');

  readonly isadmin =
    signal<boolean>(
      this.auth.hasRole('Admin')
    );

 private lastParentRequestKey = '';

constructor() {
  effect(() => {
    const propertyId = this.propertyId();
    const checkInDate = this.checkInDate();
    const checkOutDate = this.checkOutDate();
    const excludedReservationId = this.excludedReservationId();

    if (!propertyId || !checkInDate || !checkOutDate) {
      return;
    }

    const key = JSON.stringify({
      propertyId,
      checkInDate,
      checkOutDate,
      adults: this.adults() ?? 1,
      children: this.children() ?? 0,
      excludedReservationId,
    });

    if (key === this.lastParentRequestKey) {
      return;
    }

    this.lastParentRequestKey = key;

    this.standaloneRequest.set({
      ...this.standaloneRequest(),
      propertyId,
      checkInDate,
      checkOutDate,
      adults: this.adults() ?? 1,
      children: this.children() ?? 0,
      excludedReservationId,
    });

    untracked(() => {
      this.search();
    });
  });

  
}


  ngOnInit(): void {
    
    if (!this.parentValuesInitialized) {
   //  console.log( 'Initializing standaloneRequest with parent values:');
   //  console.log(this.embedded());

      this.search();
    }
  }

  search(): void {
    const current =
      this.standaloneRequest();

    const request: AvailabilityRequest = {
      ...current,

      propertyId: Number(
        current.propertyId
      ),

      adults: Number(
        current.adults
      ),

      children: Number(
        current.children
      ),
    };

    console.log(
      'Request before API:',
      request
    );

    if (
      !request.propertyId ||
      !request.checkInDate ||
      !request.checkOutDate
    ) {
      this.error.set(
        'أدخل العقار وتاريخ الوصول والمغادرة أولًا.'
      );
      return;
    }

    if (
      request.checkOutDate <=
      request.checkInDate
    ) {
      this.error.set(
        'يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول.'
      );
      return;
    }

    const requestKey =
      JSON.stringify(request);

    /**
     * منع إرسال نفس الطلب أكثر من مرة.
     */
    if (
      requestKey === this.lastRequestKey
    ) {
      return;
    }

    this.lastRequestKey = requestKey;

    this.loading.set(true);
    this.error.set('');

   forkJoin({
  availability:
    this.reservationApi.searchAvailability(request),

  plans:
    this.ratePlanApi.getRatePlans(
      request.propertyId
    ),

  roomTypes:
    this.roomTypeApi.getRoomTypes(
      request.propertyId
    ),
}).subscribe({
  next: (response) => {
    const roomTypes =
      response.roomTypes.data ?? [];

    const items =
      (response.availability.data ?? [])
        .map((item) => {
          const roomType =
            roomTypes.find(
              type =>
                type.id === item.roomTypeId
            );

          return {
            ...item,

            maxAdults:
              item.maxAdults ??
              roomType?.maxAdults ??
              20,

            maxChildren:
              item.maxChildren ??
              roomType?.maxChildren ??
              20,
          };
        });

    const plans =
      response.plans.data ?? [];

    this.items.set(items);
    this.ratePlans.set(plans);
    this.roomTypes.set(roomTypes);

    this.choices.set(
      this.defaultChoices(
        items,
        plans
      )
    );

    this.loading.set(false);
    this.searched.set(true);
  },

  error: (error: any) => {
    this.loading.set(false);
    this.searched.set(true);

    this.error.set(
      error?.error?.message ??
      'تعذر البحث عن الغرف أو تحميل خطط الأسعار.'
    );
  },
});
  }  
  onPropertyIdChange(
    value: string | number
  ): void {
    const propertyId =
      Number(value);

    this.standaloneRequest.update(
      (request) => ({
        ...request,

        propertyId:
          Number.isInteger(propertyId) &&
          propertyId > 0
            ? propertyId
            : 0,
      })
    );

    console.log(
      'PropertyId after update:',
      this.standaloneRequest()
        .propertyId
    );

    this.search();
  }
  updateStandalone<
    K extends keyof AvailabilityRequest
  >(
    key: K,
    value: AvailabilityRequest[K],
  ): void {
    let normalizedValue:
      AvailabilityRequest[K];

    if (typeof value === 'number') {
      normalizedValue =
        Number(value) as AvailabilityRequest[K];
    } else {
      normalizedValue = value;
    }

    this.standaloneRequest.update(
      (request) => ({
        ...request,

        [key]: normalizedValue,
      })
    );

    console.log(
      'Availability request after update:',
      this.standaloneRequest()
    );

    this.search();
  }

  ratePlansFor(roomTypeId: number): RatePlan[] {
  return this.ratePlans().filter(
    plan =>
      plan.roomTypeId === roomTypeId &&
      plan.isActive &&
      plan.currentVersion?.isActive
  );
}

  selected(roomId: number): boolean {
    return this.selectedRoomIds()
      .includes(roomId);
  }

  choiceFor(
  roomId: number
): AvailabilityChoice {
  return (
    this.choices()[roomId] ?? {
      ratePlanId: 0,
      adults: 1,
      children: 0,
    }
  );
}

  updateChoice(
    roomId: number,
    patch: Partial<AvailabilityChoice>,
  ): void {
    this.choices.update(
      (choices) => ({
        ...choices,

        [roomId]: {
          ...this.choiceFor(roomId),
          ...patch,
        },
      })
    );
  }

selectRoom(
  item: AvailabilityItem
): void {
  if (this.selected(item.roomId)) {
    return;
  }

  const choice =
    this.choiceFor(item.roomId);

  if (!choice.ratePlanId) {
    this.error.set(
      'اختر Rate Plan قبل إضافة الغرفة.'
    );
    return;
  }

  this.roomSelected.emit({
    item,
    ratePlanId: choice.ratePlanId,
    adults: choice.adults,
    children: choice.children,
  });
}

 private defaultChoices(
  items: AvailabilityItem[],
  _plans: RatePlan[],
): Record<number, AvailabilityChoice> {
  const result:
    Record<number, AvailabilityChoice> = {};

  for (const item of items) {
    result[item.roomId] = {
      ratePlanId: 0,

      adults: Math.min(
        this.request().adults,
        item.maxAdults
      ),

      children: Math.min(
        this.request().children,
        item.maxChildren
      ),
    };
  }

  return result;
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

ratePlanPrice(plan: RatePlan): number {
  return plan.currentVersion?.price ?? 0;
}
 
selectedRatePlan(
  item: AvailabilityItem
): RatePlan | null {
  const selectedRatePlanId =
    this.choiceFor(item.roomId).ratePlanId;

  if (!selectedRatePlanId) {
    return null;
  }

  return (
    this.ratePlans().find(
      (plan) =>
        plan.id === selectedRatePlanId &&
        plan.roomTypeId === item.roomTypeId &&
        plan.isActive &&
        plan.currentVersion
    ) ?? null
  );
}

displayNightlyRate(
  item: AvailabilityItem
): number {
  const selectedPlan =
    this.selectedRatePlan(item);

  const selectedPlanPrice =
    selectedPlan?.currentVersion?.price;

  if (
    selectedPlanPrice !== null &&
    selectedPlanPrice !== undefined
  ) {
    return selectedPlanPrice;
  }

  return item.nightlyRate;
}
displayValidFrom(plan: RatePlan): string | null {
  return plan.currentVersion?.validFrom ?? null;
}

displayValidTo(plan: RatePlan): string | null {
  return plan.currentVersion?.validTo ?? null;
}

displayTotalAmount(
  item: AvailabilityItem
): number {
  const selectedPlan =
    this.selectedRatePlan(item);

  const selectedPlanPrice =
    selectedPlan?.currentVersion?.price;

  if (
    selectedPlanPrice !== null &&
    selectedPlanPrice !== undefined
  ) {
    return selectedPlanPrice * item.nights;
  }

  return item.totalAmount;
}

  private dateOffset(
    days: number
  ): string {
    const date = new Date();

    date.setDate(
      date.getDate() + days
    );

    return date
      .toISOString()
      .slice(0, 10);
  }
}
