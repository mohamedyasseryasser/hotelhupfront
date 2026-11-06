import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Permissionservice } from '../../../Service/permissionservice';
import { DepositPolicyRecord, DepositPolicyVersionRecord, DepositType } from '../../../Models/depositpolicy';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Propertydepositpolicyservice } from '../../../Service/depositservice';

@Component({
  imports: [CommonModule, DatePipe, RouterLink],
  selector: 'app-depositdetails',
  styleUrl: './depositdetails.css',
  templateUrl: './depositdetails.html',
})
export class Depositdetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Propertydepositpolicyservice);
  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly policyId = signal(0);
  readonly policy = signal<DepositPolicyRecord | null>(null);
  readonly loading = signal(false);
  readonly actionRunning = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly depositType = DepositType;

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const policyId = Number(this.route.snapshot.paramMap.get('policyId'));
    if (
      !Number.isInteger(propertyId) ||
      propertyId <= 0 ||
      !Number.isInteger(policyId) ||
      policyId <= 0
    ) {
      this.error.set('معرف العقار أو سياسة الإيداع غير صحيح.');
      return;
    }
    this.propertyId.set(propertyId);
    this.policyId.set(policyId);
    this.loadPolicy();
  }

  loadPolicy(): void {
    this.error.set('');
    this.loading.set(true);
    this.api
      .getDepositPolicy(this.propertyId(), this.policyId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) this.policy.set(response.data);
          else this.error.set(propertyErrorMessage(response, 'تعذر تحميل سياسة الإيداع.'));
        },
        error: (error: unknown) =>
          this.error.set(propertyErrorMessage(error, 'تعذر تحميل سياسة الإيداع.')),
      });
  }

  currentVersion(policy: DepositPolicyRecord): DepositPolicyVersionRecord | null {
    return (
      policy.versions?.find((version) => version.version === policy.currentVersion) ??
      policy.versions?.[0] ??
      null
    );
  }

  depositTypeLabel(type: DepositType | number | string): string {
    return Number(type) === DepositType.FixedAmount ? 'مبلغ ثابت' : 'نسبة مئوية';
  }

  amountLabel(version: DepositPolicyVersionRecord): string {
    return Number(version.type) === DepositType.FixedAmount
      ? `${version.amount.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}`
      : `${version.percentage.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}%`;
  }

  editPolicy(): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'deposit-policies',
      this.policyId(),
      'edit',
    ]);
  }

  activatePolicy(): void {
    const policy = this.policy();
    if (policy) this.changeStatus(policy, true);
  }

  deactivatePolicy(): void {
    const policy = this.policy();
    if (policy) this.changeStatus(policy, false);
  }

  private changeStatus(policy: DepositPolicyRecord, activate: boolean): void {
    const version = this.currentVersion(policy);
    if (!version) {
      this.error.set('لا يوجد إصدار حالي لسياسة الإيداع.');
      return;
    }
    const action = activate ? 'تفعيل' : 'تعطيل';
    const reason = prompt(`اكتب سبب ${action} سياسة الإيداع «${version.name}»: `);
    if (reason === null) return;
    if (reason.trim().length < 2 || reason.trim().length > 500) {
      this.error.set('السبب مطلوب ويجب أن يكون من حرفين إلى 500 حرف.');
      return;
    }
    if (!confirm(`تأكيد ${action} سياسة الإيداع «${version.name}»؟`)) return;

    this.error.set('');
    this.success.set('');
    this.actionRunning.set(true);
    const request$ = activate
      ? this.api.activateDepositPolicy(
          this.propertyId(),
          policy.id,
          policy.rowVersion,
          reason.trim(),
        )
      : this.api.deactivateDepositPolicy(
          this.propertyId(),
          policy.id,
          policy.rowVersion,
          reason.trim(),
        );
    request$.pipe(finalize(() => this.actionRunning.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر تغيير حالة سياسة الإيداع.'));
          return;
        }
        this.policy.set(response.data);
        this.success.set(response.message || `تم ${action} السياسة بنجاح.`);
      },
      error: (error: unknown) =>
        this.error.set(propertyErrorMessage(error, 'تعذر تغيير حالة سياسة الإيداع.')),
    });
  }
}

