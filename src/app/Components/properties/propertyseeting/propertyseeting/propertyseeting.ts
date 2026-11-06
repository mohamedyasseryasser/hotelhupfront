 import { Component, inject, OnInit, signal } from '@angular/core';
import { Userservice } from '../../../../Service/userservice';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
 import { finalize, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Propertyservice } from '../../../../Service/propertyservice';
import { PropertyListData, PropertyRecord, PropertySortBy, PropertyStatus } from '../../../../Models/property';
import { readonly } from '@angular/forms/signals';
import { inputToTimeSpan, propertyErrorMessage, settingsRowVersion, timeSpanToInput } from '../../../../errors/propertyerror';
import { Permissionservice } from '../../../../Service/permissionservice';
@Component({
 imports: [
    ReactiveFormsModule,
    RouterLink
  ],  selector: 'app-propertyseeting',
  styleUrl: './propertyseeting.css',
  templateUrl: './propertyseeting.html',
})
export class Propertyseeting  implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(Propertyservice);
  private readonly route = inject(ActivatedRoute);
  readonly permissions = inject(Permissionservice);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly propertyId = signal(0);                           

  private rowVersion = '';

  readonly form = this.fb.nonNullable.group({
    checkInTime: [''],
    checkOutTime: [''],
    hotelDayClosingTime: [''],

    defaultCurrency: [
      '',
      [Validators.maxLength(10)]
    ],

    timeZone: [''],

    allowEarlyCheckIn: [false],
    requireDepositForReservation: [false],
    requireFullPaymentBeforeCheckOut: [false],
    allowOverpayment: [false],
    requireInspectionBeforeAvailable: [false],

    reason: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(500)
      ]
    ]
  });

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.propertyId.set(id);

    if (id) {
      this.load(id);
    } else {
      this.error.set('معرف العقار غير صحيح.');
      this.loading.set(false);
    }
  }

  load(id = this.propertyId()): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getSettings(id)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.error.set(
              response.message || 'تعذر تحميل الإعدادات.'
            );

            return;
          }

          const settings = response.data;

          this.rowVersion = settingsRowVersion(settings);

          this.form.patchValue({
            checkInTime: timeSpanToInput(
              settings.checkInTime
            ),

            checkOutTime: timeSpanToInput(
              settings.checkOutTime
            ),

            hotelDayClosingTime: timeSpanToInput(
              settings.hotelDayClosingTime
            ),

            defaultCurrency: settings.defaultCurrency,
            timeZone: settings.timeZone,

            allowEarlyCheckIn: settings.allowEarlyCheckIn,
            requireDepositForReservation:
              settings.requireDepositForReservation,

            requireFullPaymentBeforeCheckOut:
              settings.requireFullPaymentBeforeCheckOut,

            allowOverpayment: settings.allowOverpayment,

            requireInspectionBeforeAvailable:
              settings.requireInspectionBeforeAvailable,

            reason: ''
          });
        },

        error: error => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل الإعدادات.'
            )
          );
        }
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

  this.api
    .updateSettings(
      this.propertyId(),
      this.rowVersion,
      {
        checkInTime: inputToTimeSpan(
          value.checkInTime,
        ),
        checkOutTime: inputToTimeSpan(
          value.checkOutTime,
        ),
        hotelDayClosingTime: inputToTimeSpan(
          value.hotelDayClosingTime,
        ),
        defaultCurrency:
          value.defaultCurrency || null,
        timeZone: value.timeZone || null,
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
        reason: value.reason.trim(),
      },
    )
    .pipe(
      finalize(() => this.saving.set(false)),
    )
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.success.set(
            response.message || 'تم تحديث الإعدادات.',
          );

          if (response.data) {
            this.rowVersion =
              settingsRowVersion(response.data);
          }

          this.form.controls.reason.setValue('');
          return;
        }

        this.error.set(
          propertyErrorMessage(
            response,
            'تعذر تحديث الإعدادات.',
          ),
        );
      },

      error: (error) => {
        this.error.set(
          propertyErrorMessage(
            error,
            'تعذر تحديث الإعدادات.',
          ),
        );
      },
    });
}
}



