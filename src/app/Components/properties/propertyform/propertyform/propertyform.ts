 import { Component, inject, OnInit, signal } from '@angular/core';
import { Userservice } from '../../../../Service/userservice';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
 import { finalize, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Propertyservice } from '../../../../Service/propertyservice';
import { CreatePropertyRequest, PropertyListData, PropertyRecord, PropertySortBy, PropertyStatus, UpdatePropertyRequest } from '../../../../Models/property';
import { readonly } from '@angular/forms/signals';
import { Permissionservice } from '../../../../Service/permissionservice';
import { inputToTimeSpan, propertyErrorMessage } from '../../../../errors/propertyerror';
@Component({
imports: [
    ReactiveFormsModule,
    RouterLink,
  ],  selector: 'app-propertyform',
  styleUrl: './propertyform.css',
  templateUrl: './propertyform.html',
})
export class Propertyform  implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(Propertyservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly permissions = inject(Permissionservice);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly error = signal('');
  readonly success = signal('');
  readonly propertyId = signal(0);

  private rowVersion = '';

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
      ],
    ],

    code: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
    ],

    description: [
      '',
      [Validators.maxLength(1000)],
    ],

    reason: [
      '',
      [
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
    ],

    currency: [
      'USD',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ],
    ],

    timeZone: [
      'UTC',
      [
        Validators.required,
        Validators.maxLength(100),
      ],
    ],

    checkInTime: ['14:00'],
    checkOutTime: ['12:00'],
    hotelDayClosingTime: [''],

    allowEarlyCheckIn: [false],
    requireDepositForReservation: [false],
    requireFullPaymentBeforeCheckOut: [false],
    allowOverpayment: [false],
    requireInspectionBeforeAvailable: [false],
  });

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id'),
    );

    if (!id) {
      return;
    }

    this.isEdit.set(true);
    this.propertyId.set(id);

    this.form.controls.reason.setValidators([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]);

    [
      'currency',
      'timeZone',
      'checkInTime',
      'checkOutTime',
      'hotelDayClosingTime',
      'allowEarlyCheckIn',
      'requireDepositForReservation',
      'requireFullPaymentBeforeCheckOut',
      'allowOverpayment',
      'requireInspectionBeforeAvailable',
    ].forEach((key) => {
      this.form.get(key)?.disable();
    });

    this.load(id);
  }

  private load(id: number): void {
    this.loading.set(true);

    this.api
      .getPropertyById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(
              response.message || 'تعذر تحميل العقار.',
            );

            return;
          }

          this.rowVersion = response.data.rowVersion;

          this.form.patchValue({
            name: response.data.name,
            code: response.data.code,
            description: response.data.description ?? '',
          });
        },

        error: (error) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل العقار.',
            ),
          );
        },
      });
  }

  submit(): void {
    this.error.set('');
    this.success.set('');

    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const value = this.form.getRawValue();

    const request$: any = this.isEdit()
      ? this.api.updateProperty(
          this.propertyId(),
          this.rowVersion,
          {
            name: value.name,
            code: value.code,
            description: value.description || null,
            reason: value.reason,
          } as UpdatePropertyRequest,
        )
      : this.api.createProperty({
          name: value.name,
          code: value.code,
          description: value.description || null,

          settings: {
            currency: value.currency,
            timeZone: value.timeZone,

            checkInTime: inputToTimeSpan(
              value.checkInTime,
            )!,

            checkOutTime: inputToTimeSpan(
              value.checkOutTime,
            )!,

            hotelDayClosingTime: inputToTimeSpan(
              value.hotelDayClosingTime,
            ),

            allowEarlyCheckIn:
              value.allowEarlyCheckIn,

            requireDepositForReservation:
              value.requireDepositForReservation,

            requireFullPaymentBeforeCheckOut:
              value.requireFullPaymentBeforeCheckOut,

            allowOverpayment:
              value.allowOverpayment,

            requireInspectionBeforeAvailable:
              value.requireInspectionBeforeAvailable,
          },
        } as CreatePropertyRequest);

    request$
      .pipe(
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (response: any) => {
          if (!response.success) {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر حفظ العقار.',
              ),
            );

            return;
          }

          this.success.set(
            response.message || 'تم الحفظ بنجاح.',
          );

          setTimeout(
            () => void this.router.navigate(['/properties']),
            700,
          );
        },

        error: (error: unknown) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر حفظ العقار.',
            ),
          );
        },
      });
  }
}
