import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  CreateDepositPolicyRequest,
  DepositPolicyRecord,
  DepositPolicyVersionRecord,
  DepositType,
  UpdateDepositPolicyRequest,
} from '../../../../app/Models/depositpolicy';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Propertydepositpolicyservice } from '../../../Service/depositservice';
import { Permissionservice } from '../../../Service/permissionservice';
@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-depositform',
  styleUrl: './depositform.css',
  templateUrl: './depositform.html',
})
export class Depositform  implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Propertydepositpolicyservice);
readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly policyId = signal<number | null>(null);
  readonly policy = signal<DepositPolicyRecord | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly depositType = DepositType;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    type: [DepositType.Percentage, Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    validFrom: [this.toLocalDateTime(new Date().toISOString()), Validators.required],
    validTo: [''],
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
      this.form.controls.reason.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(500),
      ]);
      this.form.controls.reason.updateValueAndValidity();
      this.loadPolicy(policyId);
    }
  }

  isPercentage(): boolean {
    return Number(this.form.controls.type.value) === DepositType.Percentage;
  }

  onTypeChange(): void {
    if (this.isPercentage()) {
      this.form.controls.amount.setValue(0);
    } else {
      this.form.controls.percentage.setValue(0);
    }
  }

  private loadPolicy(policyId: number): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getDepositPolicy(this.propertyId(), policyId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(propertyErrorMessage(response, 'تعذر تحميل سياسة الإيداع.'));
            return;
          }
          const policy = response.data;
          const version = this.currentVersion(policy);
          if (!version) {
            this.error.set('لا يوجد إصدار حالي لسياسة الإيداع.');
            return;
          }
          this.policy.set(policy);
          this.form.patchValue({
            name: version.name,
            type: Number(version.type) as DepositType,
            amount: version.amount,
            percentage: version.percentage,
            validFrom: this.defaultNextVersionDate(version),
            validTo: '',
            reason: '',
          });
        },
        error: (error: unknown) =>
          this.error.set(propertyErrorMessage(error, 'تعذر تحميل سياسة الإيداع.')),
      });
  }

  savePolicy(): void {
    this.error.set('');
    if (this.form.invalid || this.saving() || (this.policyId() !== null && !this.policy())) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const type = Number(value.type) as DepositType;
    const validFrom = this.toIsoDateTime(value.validFrom);
    const validTo = value.validTo ? this.toIsoDateTime(value.validTo) : null;
    if (!validFrom || (value.validTo && !validTo)) {
      this.error.set('تاريخ بداية أو نهاية السياسة غير صالح.');
      return;
    }
    if (validTo && new Date(validTo) <= new Date(validFrom)) {
      this.error.set('نهاية السريان يجب أن تكون بعد بداية السريان.');
      return;
    }

    const percentage = type === DepositType.Percentage ? Number(value.percentage) : 0;
    const amount = type === DepositType.FixedAmount ? Number(value.amount) : 0;
    if (type === DepositType.Percentage && (percentage < 0 || percentage > 100)) {
      this.error.set('النسبة يجب أن تكون من 0 إلى 100.');
      return;
    }
    if (type === DepositType.FixedAmount && amount < 0) {
      this.error.set('مبلغ الإيداع لا يمكن أن يكون أقل من صفر.');
      return;
    }

    const currentPolicy = this.policy();
    const currentVersion = currentPolicy ? this.currentVersion(currentPolicy) : null;
    if (currentVersion) {
      const newStart = new Date(validFrom).getTime();
      const previousStart = new Date(currentVersion.validFrom).getTime();
      const previousEnd = currentVersion.validTo
        ? new Date(currentVersion.validTo).getTime()
        : null;
      if (newStart <= previousStart || (previousEnd !== null && newStart < previousEnd)) {
        this.error.set(
          'بداية الإصدار الجديد يجب أن تكون بعد بداية الإصدار السابق وألا تتداخل معه.',
        );
        return;
      }
    }

    const request: CreateDepositPolicyRequest = {
      name: value.name.trim(),
      type,
      amount,
      percentage,
      validFrom,
      validTo,
    };
    const request$ = currentPolicy
      ? this.api.updateDepositPolicy(
          this.propertyId(),
          currentPolicy.id,
          currentPolicy.rowVersion,
          {
            ...request,
            reason: value.reason.trim(),
            ifMatch: currentPolicy.rowVersion,
          } satisfies UpdateDepositPolicyRequest,
        )
      : this.api.createDepositPolicy(this.propertyId(), request);

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر حفظ سياسة الإيداع.'));
          return;
        }
        void this.router.navigate([
          '/properties',
          this.propertyId(),
          'deposit-policies',
          response.data.id,
        ]);
      },
      error: (error: unknown) =>
        this.error.set(propertyErrorMessage(error, 'تعذر حفظ سياسة الإيداع.')),
    });
  }

  private currentVersion(policy: DepositPolicyRecord): DepositPolicyVersionRecord | null {
    return (
      policy.versions?.find((version) => version.version === policy.currentVersion) ??
      policy.versions?.[0] ??
      null
    );
  }

  private defaultNextVersionDate(version: DepositPolicyVersionRecord): string {
    const previousStart = new Date(version.validFrom);
    const earliestStart = new Date(previousStart.getTime() + 60_000);
    const previousEnd = version.validTo ? new Date(version.validTo) : null;
    if (previousEnd && previousEnd > earliestStart) earliestStart.setTime(previousEnd.getTime());

    const nextStart = new Date(Math.max(Date.now(), earliestStart.getTime()));
    const hadSeconds = nextStart.getSeconds() !== 0 || nextStart.getMilliseconds() !== 0;
    nextStart.setSeconds(0, 0);
    if (hadSeconds) nextStart.setMinutes(nextStart.getMinutes() + 1);
    return this.toLocalDateTime(nextStart.toISOString());
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

