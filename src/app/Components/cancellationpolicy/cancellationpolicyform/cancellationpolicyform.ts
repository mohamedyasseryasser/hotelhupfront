import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Cancellationpolicy } from '../../../Service/cancellationpolicy';
import { Permissionservice } from '../../../Service/permissionservice';
import { CancellationPolicyRecord, CancellationPolicyStatus, CancellationPolicyVersion, CreateCancellationPolicyRequest, UpdateCancellationPolicyRequest } from '../../../Models/cancellationpolicy';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-cancellationpolicyform',
  styleUrl: './cancellationpolicyform.css',
  templateUrl: './cancellationpolicyform.html',
})
export class Cancellationpolicyform implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Cancellationpolicy);
readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly policyId = signal<number | null>(null);
  readonly policy = signal<CancellationPolicyRecord | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(1000)]],
    validFrom: [this.toLocalDateTime(new Date().toISOString()), Validators.required],
    validTo: [''],
    freeCancellationHours: [24, [Validators.required, Validators.min(0)]],
    cancellationFeePercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    fixedCancellationFee: [0, [Validators.required, Validators.min(0)]],
    isNonRefundable: [false],
    cutoffHours: [0, [Validators.required, Validators.min(0)]],
    rules: ['{}', Validators.required],
    reason: ['', [Validators.minLength(2), Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }
    this.propertyId.set(propertyId);
    const policyId = Number(this.route.snapshot.paramMap.get('policyId'));
    if (Number.isInteger(policyId) && policyId > 0) {
      this.policyId.set(policyId);
      this.form.controls.reason.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(500)]);
      this.form.controls.reason.updateValueAndValidity();
      this.loadPolicy(policyId);
    }
  }

  private loadPolicy(policyId: number): void {
    this.loading.set(true);
    this.api.getPolicy(this.propertyId(), policyId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر تحميل سياسة الإلغاء.'));
          return;
        }
        const policy = response.data;
        const version = this.currentVersion(policy);
        if (!version) {
          this.error.set('لا يوجد إصدار حالي لسياسة الإلغاء.');
          return;
        }
        this.policy.set(policy);
        this.form.patchValue({
          name: policy.name,
          description: policy.description ?? '',
          validFrom: this.toLocalDateTime(this.defaultNextVersionDate(version)),
          validTo: '',
          freeCancellationHours: version.freeCancellationHours,
          cancellationFeePercentage: version.cancellationFeePercentage,
          fixedCancellationFee: version.fixedCancellationFee,
          isNonRefundable: version.isNonRefundable,
          cutoffHours: version.cutoffHours,
          rules: version.rules || '{}',
          reason: '',
        });
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل سياسة الإلغاء.')),
    });
  }

  savePolicy(): void {
    this.error.set('');
    if (this.form.invalid || this.saving() || (this.policyId() !== null && !this.policy())) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const validFrom = this.toIsoDateTime(value.validFrom);
    const validTo = value.validTo ? this.toIsoDateTime(value.validTo) : null;
    if (!validFrom || (value.validTo && !validTo)) {
      this.error.set('تاريخ بداية أو نهاية السياسة غير صالح.');
      return;
    }
    if (validTo && new Date(validTo) <= new Date(validFrom)) {
      this.error.set('تاريخ نهاية السريان يجب أن يكون بعد تاريخ البداية.');
      return;
    }
    try {
      JSON.parse(value.rules || '{}');
    } catch {
      this.error.set('حقل القواعد يجب أن يحتوي على JSON صحيح.');
      this.form.controls.rules.markAsTouched();
      return;
    }

    const request: CreateCancellationPolicyRequest = {
      name: value.name.trim(),
      description: value.description.trim() || null,
      validFrom,
      validTo,
      freeCancellationHours: Number(value.freeCancellationHours),
      cancellationFeePercentage: Number(value.cancellationFeePercentage),
      fixedCancellationFee: Number(value.fixedCancellationFee),
      isNonRefundable: value.isNonRefundable,
      cutoffHours: Number(value.cutoffHours),
      rules: value.rules.trim() || '{}',
    };
    const currentPolicy = this.policy();
    const request$ = currentPolicy
      ? this.api.updatePolicy(this.propertyId(), currentPolicy.id, currentPolicy.rowVersion, {
          ...request,
          reason: value.reason.trim(),
        } satisfies UpdateCancellationPolicyRequest)
      : this.api.createPolicy(this.propertyId(), request);

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر حفظ سياسة الإلغاء.'));
          return;
        }
        void this.router.navigate(['/properties', this.propertyId(), 'cancellation-policies', response.data.id]);
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر حفظ سياسة الإلغاء.')),
    });
  }

  private currentVersion(policy: CancellationPolicyRecord): CancellationPolicyVersion | null {
    return policy.versions?.find((version) => version.version === policy.currentVersion)
      ?? policy.versions?.[0]
      ?? null;
  }

  private defaultNextVersionDate(version: CancellationPolicyVersion): string {
    const previousValidFrom = new Date(version.validFrom);
    const minimum = new Date(previousValidFrom.getTime() + 60_000);
    const previousValidTo = version.validTo ? new Date(version.validTo) : null;
    if (previousValidTo && previousValidTo > minimum) minimum.setTime(previousValidTo.getTime());
    const now = new Date();
    const nextStart = new Date(Math.max(now.getTime(), minimum.getTime()));
    // datetime-local is minute-precision: round up to a whole minute to remain strictly after the prior version.
    nextStart.setSeconds(0, 0);
    nextStart.setMinutes(nextStart.getMinutes() + 1);
    return nextStart.toISOString();
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  private toIsoDateTime(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}

