import { CommonModule, DatePipe } from '@angular/common';
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
  imports: [CommonModule, DatePipe, RouterLink],
  selector: 'app-depositlist',
  styleUrl: './depositlist.css',
  templateUrl: './depositlist.html',
})
export class Depositlist implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Propertydepositpolicyservice);
  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly policies = signal<DepositPolicyRecord[]>([]);
  readonly loading = signal(false);
  readonly actionId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly depositType = DepositType;

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }
    this.propertyId.set(propertyId);
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.error.set('');
    this.loading.set(true);
    this.api
      .getDepositPolicies(this.propertyId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) this.policies.set(response.data);
          else this.error.set(propertyErrorMessage(response, 'تعذر تحميل سياسات الإيداع.'));
        },
        error: (error: unknown) =>
          this.error.set(propertyErrorMessage(error, 'تعذر تحميل سياسات الإيداع.')),
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

  viewPolicy(policy: DepositPolicyRecord): void {
    void this.router.navigate(['/properties', this.propertyId(), 'deposit-policies', policy.id]);
  }

  editPolicy(policy: DepositPolicyRecord): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'deposit-policies',
      policy.id,
      'edit',
    ]);
  }

  createPolicy(): void {
    void this.router.navigate(['/properties', this.propertyId(), 'deposit-policies', 'create']);
  }

  activatePolicy(policy: DepositPolicyRecord): void {
    this.changeStatus(policy, true);
  }

  deactivatePolicy(policy: DepositPolicyRecord): void {
    this.changeStatus(policy, false);
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
    this.actionId.set(policy.id);
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
    request$.pipe(finalize(() => this.actionId.set(null))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.error.set(propertyErrorMessage(response, 'تعذر تغيير حالة سياسة الإيداع.'));
          return;
        }
        this.success.set(response.message || `تم ${action} السياسة بنجاح.`);
        this.loadPolicies();
      },
      error: (error: unknown) =>
        this.error.set(propertyErrorMessage(error, 'تعذر تغيير حالة سياسة الإيداع.')),
    });
  }
}

