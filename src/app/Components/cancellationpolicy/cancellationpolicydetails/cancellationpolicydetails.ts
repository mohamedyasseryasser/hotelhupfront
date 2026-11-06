import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Cancellationpolicy } from '../../../Service/cancellationpolicy';
import { Permissionservice } from '../../../Service/permissionservice';
import { CancellationPolicyRecord, CancellationPolicyStatus, CancellationPolicyVersion } from '../../../Models/cancellationpolicy';
import { propertyErrorMessage } from '../../../errors/propertyerror';
 
@Component({
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  selector: 'app-cancellationpolicydetails',
  styleUrl: './cancellationpolicydetails.css',
  templateUrl: './cancellationpolicydetails.html',
})
export class Cancellationpolicydetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Cancellationpolicy);
  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly policyId = signal(0);
  readonly policy = signal<CancellationPolicyRecord | null>(null);
  readonly loading = signal(false);
  readonly actionRunning = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly activeStatus = CancellationPolicyStatus.Active;

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const policyId = Number(this.route.snapshot.paramMap.get('policyId'));
    if (!Number.isInteger(propertyId) || propertyId <= 0 || !Number.isInteger(policyId) || policyId <= 0) {
      this.error.set('معرف العقار أو سياسة الإلغاء غير صحيح.');
      return;
    }
    this.propertyId.set(propertyId);
    this.policyId.set(policyId);
    this.loadPolicy();
  }

  loadPolicy(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getPolicy(this.propertyId(), this.policyId()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (response.success && response.data) this.policy.set(response.data);
        else this.error.set(propertyErrorMessage(response, 'تعذر تحميل سياسة الإلغاء.'));
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل سياسة الإلغاء.')),
    });
  }

  currentVersion(policy: CancellationPolicyRecord): CancellationPolicyVersion | null {
    return policy.versions?.find((version) => version.version === policy.currentVersion)
      ?? policy.versions?.[0]
      ?? null;
  }

  isActive(status: CancellationPolicyStatus | number | string): boolean {
    return status === 'Active' || Number(status) === CancellationPolicyStatus.Active;
  }

  editPolicy(): void {
    void this.router.navigate(['/properties', this.propertyId(), 'cancellation-policies', this.policyId(), 'edit']);
  }

  activatePolicy(): void {
    const policy = this.policy();
    if (policy && confirm(`هل تريد تفعيل سياسة الإلغاء «${policy.name}»؟`)) this.changeStatus(policy, true);
  }

  deactivatePolicy(): void {
    const policy = this.policy();
    if (!policy) return;
    const reason = prompt('اكتب سبب تعطيل سياسة الإلغاء:');
    if (reason === null) return;
    if (reason.trim().length < 2) {
      this.error.set('سبب التعطيل مطلوب ويجب ألا يقل عن حرفين.');
      return;
    }
    if (confirm(`تأكيد تعطيل سياسة الإلغاء «${policy.name}»؟`)) this.changeStatus(policy, false, reason.trim());
  }

  private changeStatus(policy: CancellationPolicyRecord, activate: boolean, reason = ''): void {
    this.error.set('');
    this.success.set('');
    this.actionRunning.set(true);
    const request = activate
      ? { expectedRowVersion: policy.rowVersion }
      : { expectedRowVersion: policy.rowVersion, confirm: true, reason };
    const call$ = activate
      ? this.api.activatePolicy(this.propertyId(), policy.id, request)
      : this.api.deactivatePolicy(this.propertyId(), policy.id, request);
    call$.pipe(finalize(() => this.actionRunning.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر تغيير حالة سياسة الإلغاء.'));
          return;
        }
        this.policy.set(response.data);
        this.success.set(response.message || (activate ? 'تم تفعيل السياسة.' : 'تم تعطيل السياسة.'));
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تغيير حالة سياسة الإلغاء.')),
    });
  }
}

