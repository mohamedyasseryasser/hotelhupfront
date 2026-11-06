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
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  selector: 'app-cancellationpolicylist',
  styleUrl: './cancellationpolicylist.css',
  templateUrl: './cancellationpolicylist.html',
})
export class Cancellationpolicylistimplements implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Cancellationpolicy);
  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly policies = signal<CancellationPolicyRecord[]>([]);
  readonly loading = signal(false);
  readonly actionId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly activeStatus = CancellationPolicyStatus.Active;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }
    this.propertyId.set(id);
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getPolicies(this.propertyId()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (response.success && response.data) this.policies.set(response.data);
        else this.error.set(propertyErrorMessage(response, 'تعذر تحميل سياسات الإلغاء.'));
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل سياسات الإلغاء.')),
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

  viewPolicy(policy: CancellationPolicyRecord): void {
    void this.router.navigate(['/properties', this.propertyId(), 'cancellation-policies', policy.id]);
  }

  editPolicy(policy: CancellationPolicyRecord): void {
    void this.router.navigate(['/properties', this.propertyId(), 'cancellation-policies', policy.id, 'edit']);
  }

  createPolicy(): void {
    void this.router.navigate(['/properties', this.propertyId(), 'cancellation-policies', 'create']);
  }

  activatePolicy(policy: CancellationPolicyRecord): void {
    if (!confirm(`هل تريد تفعيل سياسة الإلغاء «${policy.name}»؟`)) return;
    this.changeStatus(policy, true);
  }

  deactivatePolicy(policy: CancellationPolicyRecord): void {
    const reason = prompt('اكتب سبب تعطيل سياسة الإلغاء:');
    if (reason === null) return;
    if (reason.trim().length < 2) {
      this.error.set('سبب التعطيل مطلوب ويجب ألا يقل عن حرفين.');
      return;
    }
    if (!confirm(`تأكيد تعطيل سياسة الإلغاء «${policy.name}»؟`)) return;
    this.changeStatus(policy, false, reason.trim());
  }

  private changeStatus(policy: CancellationPolicyRecord, activate: boolean, reason = ''): void {
    this.error.set('');
    this.success.set('');
    this.actionId.set(policy.id);
    const request = activate
      ? { expectedRowVersion: policy.rowVersion }
      : { expectedRowVersion: policy.rowVersion, confirm: true, reason };
    const call$ = activate
      ? this.api.activatePolicy(this.propertyId(), policy.id, request)
      : this.api.deactivatePolicy(this.propertyId(), policy.id, request);
    call$.pipe(finalize(() => this.actionId.set(null))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.error.set(propertyErrorMessage(response, 'تعذر تغيير حالة سياسة الإلغاء.'));
          return;
        }
        this.success.set(response.message || (activate ? 'تم تفعيل السياسة.' : 'تم تعطيل السياسة.'));
        this.loadPolicies();
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تغيير حالة سياسة الإلغاء.')),
    });
  }
}

