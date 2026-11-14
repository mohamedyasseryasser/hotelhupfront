
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  CreateRatePlanRequest,
  RatePlan,
  RatePlanType
} from '../../../Models/rateplane';

import { RoomTypeRecord } from '../../../Models/roomtype';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Permissionservice } from '../../../Service/permissionservice';
import { Rateplanservice } from '../../../Service/rateplane';
import { Roomtypeservice } from '../../../Service/roomtypeservice';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  selector: 'app-rateplaneform',
  styleUrl: './rateplaneform.css',
  templateUrl: './rateplaneform.html',
})
export class Rateplaneform implements OnInit {

  readonly permissions = inject(Permissionservice);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Rateplanservice);
  private readonly roomTypesApi = inject(Roomtypeservice);
  readonly isEdit = signal<boolean>(false);
  readonly propertyId = signal(0);
  readonly planId = signal<number | null>(null);
  readonly plan = signal<RatePlan | null>(null);
  readonly roomTypes = signal<RoomTypeRecord[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly ratePlanType = RatePlanType;

  readonly form = this.fb.nonNullable.group({
    roomTypeId: [
      0,
      [Validators.required, Validators.min(1)]
    ],
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],
    type: [
      RatePlanType.Standard,
      Validators.required
    ],
    price: [
      0,
      [Validators.required, Validators.min(0)]
    ],
    rules: [''],
    isRefundable: [true],
    validFrom: [
      this.toLocalDateTime(new Date().toISOString()),
      Validators.required
    ],
    validTo: [''],
  });

  ngOnInit(): void {

    const propertyId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (propertyId <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);

    this.roomTypesApi.getRoomTypes(propertyId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roomTypes.set(response.data);
        }
      },
      error: (error: unknown) => {
        this.error.set(
          propertyErrorMessage(
            error,
            'تعذر تحميل أنواع الغرف.'
          )
        );
      },
    });

    const planId = Number(
      this.route.snapshot.paramMap.get('planId')
    );

    if (planId > 0) {
      this.isEdit.set(true);
      this.planId.set(planId);
      this.loadPlan(planId);
    }
  }

  private loadPlan(id: number): void {

    this.loading.set(true);

    this.api.getRatePlan(id)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {

          if (!response.success || !response.data) {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تحميل خطة الأسعار.'
              )
            );
            return;
          }

          const plan = response.data;

          this.plan.set(plan);

          this.form.patchValue({
            roomTypeId: plan.roomTypeId,
            name: plan.name,
            type: plan.type,
            price: plan.currentVersion?.price ?? 0,
            rules: plan.currentVersion?.rules ?? '',
            isRefundable:
              plan.currentVersion?.isRefundable ?? true,

            validFrom: plan.currentVersion
              ? this.toLocalDateTime(
                  plan.currentVersion.validFrom
                )
              : this.form.controls.validFrom.value,

            validTo: plan.currentVersion?.validTo
              ? this.toLocalDateTime(
                  plan.currentVersion.validTo
                )
              : ''
          });

          this.form.controls.roomTypeId.disable();
        },

        error: (error: unknown) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل خطة الأسعار.'
            )
          );
        },
      });
  }

  typeLabel(type: RatePlanType): string {

    return [
      'قياسية',
      'شركات',
      'موسمية',
      'نهاية الأسبوع',
      'غير قابلة للاسترداد'
    ][type] ?? 'غير محدد';
  }

  save(): void {

    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const validFrom = this.toIsoDateTime(
      value.validFrom
    );

    const validTo = value.validTo
      ? this.toIsoDateTime(value.validTo)
      : null;

    if (!validFrom || (value.validTo && !validTo)) {
      this.error.set('التواريخ غير صحيحة.');
      return;
    }

    if (
      validTo &&
      new Date(validTo) < new Date(validFrom)
    ) {
      this.error.set(
        'تاريخ النهاية يجب أن يكون بعد البداية.'
      );
      return;
    }

    const request: CreateRatePlanRequest = {
      name: value.name.trim(),
      type: value.type,
      price: Number(value.price),
      rules: value.rules.trim(),
      isRefundable: value.isRefundable,
      validFrom,
      validTo
    };

    const current = this.plan();
    if(current && !this.isEdit()){
this.error.set(
    'تعذر تحديد  خطه التسعير المطلوب تعديلها.',
  );
  return;
    }
    const request$ =this.isEdit()&& current
      ? this.api.updateRatePlan(
          current.id,
          current.rowVersion,
          request
        )
      : this.api.createRatePlan(
          this.propertyId(),
          Number(value.roomTypeId),
          request
        );

    this.saving.set(true);

    request$
      .pipe(
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (response) => {

          if (response.success && response.data) {
            void this.router.navigate([
              '/properties',
              this.propertyId(),
              'rate-plans',
              response.data.id
            ]);
          } else {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر حفظ خطة الأسعار.'
              )
            );
          }
        },

        error: (error: unknown) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر حفظ خطة الأسعار.'
            )
          );
        },
      });
  }

  private toLocalDateTime(value: string): string {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const local = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
  }

  private toIsoDateTime(value: string): string | null {

    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString();
  }
}
