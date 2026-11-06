import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Taxservice } from '../../../Service/taxservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { TaxRecord, TaxType } from '../../../Models/tax';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';

@Component({
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  selector: 'app-taxdetails',
  styleUrl: './taxdetails.css',
  templateUrl: './taxdetails.html',
})
export class Taxdetails  implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Taxservice);
  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly taxId = signal(0);
  readonly tax = signal<TaxRecord | null>(null);
  readonly loading = signal(false);
  readonly actionRunning = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly taxType = TaxType;

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const taxId = Number(this.route.snapshot.paramMap.get('taxId'));
    if (!Number.isInteger(propertyId) || propertyId <= 0 || !Number.isInteger(taxId) || taxId <= 0) {
      this.error.set('معرف العقار أو الضريبة غير صحيح.');
      return;
    }
    this.propertyId.set(propertyId);
    this.taxId.set(taxId);
    this.loadTax();
  }

  loadTax(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getTax(this.propertyId(), this.taxId()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (response.success && response.data) this.tax.set(response.data);
        else this.error.set(propertyErrorMessage(response, 'تعذر تحميل تفاصيل الضريبة.'));
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل تفاصيل الضريبة.')),
    });
  }

  editTax(): void {
    void this.router.navigate(['/properties', this.propertyId(), 'taxes', this.taxId(), 'edit']);
  }

  taxTypeLabel(type: TaxType | number): string {
    return Number(type) === TaxType.FixedAmount ? 'مبلغ ثابت' : 'نسبة مئوية';
  }

  activateTax(): void {
    const tax = this.tax();
    if (tax && confirm(`هل تريد تفعيل الضريبة «${tax.name}»؟`)) this.changeStatus(tax, true);
  }

  deactivateTax(): void {
    const tax = this.tax();
    if (!tax) return;
    const reason = prompt('اكتب سبب تعطيل الضريبة:');
    if (reason === null) return;
    if (reason.trim().length < 2) {
      this.error.set('سبب التعطيل مطلوب ويجب ألا يقل عن حرفين.');
      return;
    }
    if (confirm(`تأكيد تعطيل الضريبة «${tax.name}»؟`)) this.changeStatus(tax, false, reason.trim());
  }

  private changeStatus(tax: TaxRecord, activate: boolean, reason = ''): void {
    this.error.set('');
    this.success.set('');
    this.actionRunning.set(true);
    const request$ = activate
      ? this.api.activateTax(this.propertyId(), tax.id, tax.rowVersion)
      : this.api.deactivateTax(this.propertyId(), tax.id, tax.rowVersion, { confirm: true, reason });
    request$.pipe(finalize(() => this.actionRunning.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر تغيير حالة الضريبة.'));
          return;
        }
        this.tax.set(response.data);
        this.success.set(response.message || (activate ? 'تم تفعيل الضريبة.' : 'تم تعطيل الضريبة.'));
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تغيير حالة الضريبة.')),
    });
  }
}
