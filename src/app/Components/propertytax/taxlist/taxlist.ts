import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Taxservice } from '../../../Service/taxservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { TaxRecord, TaxType } from '../../../Models/tax';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { FormsModule } from '@angular/forms';
@Component({
  imports: [CommonModule, FormsModule,DatePipe, DecimalPipe, RouterLink],
  selector: 'app-taxlist',
  styleUrl: './taxlist.css',
  templateUrl: './taxlist.html',
})
export class Taxlistimplements  implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Taxservice);
  readonly permissions = inject(Permissionservice);
 readonly  currenttaxes=  signal<boolean>(true);
  readonly propertyId = signal(0);
  readonly taxes = signal<TaxRecord[]>([]);
  readonly loading = signal(false);
  readonly actionId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly taxType = TaxType;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }
    this.propertyId.set(id);
    this.loadTaxes();
  }

  loadTaxes(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getTaxes(this.propertyId(), this.currenttaxes()).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (response) => {
         if (response.success && response.data) this.taxes.set(response.data);
        else this.error.set(propertyErrorMessage(response, 'تعذر تحميل ضرائب العقار.'));
      },
      error: (error: unknown)  => {
        this.error.set(propertyErrorMessage(error, 'تعذر تحميل ضرائب العقار.'))
       
    }
});
  }

  viewTax(tax: TaxRecord): void {
    void this.router.navigate(['/properties', this.propertyId(), 'taxes', tax.id]);
  }

  editTax(tax: TaxRecord): void {
    void this.router.navigate(['/properties', this.propertyId(), 'taxes', tax.id, 'edit']);
  }

  createTax(): void {
    void this.router.navigate(['/properties', this.propertyId(), 'taxes', 'create']);
  }

  taxTypeLabel(type: TaxType | number): string {
    return Number(type) === TaxType.FixedAmount ? 'مبلغ ثابت' : 'نسبة مئوية';
  }

  activateTax(tax: TaxRecord): void {
    if (confirm(`هل تريد تفعيل الضريبة «${tax.name}»؟`)) this.changeStatus(tax, true);
  }

  deactivateTax(tax: TaxRecord): void {
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
    this.actionId.set(tax.id);
    const request$ = activate
      ? this.api.activateTax(this.propertyId(), tax.id, tax.rowVersion)
      : this.api.deactivateTax(this.propertyId(), tax.id, tax.rowVersion, { confirm: true, reason });
    request$.pipe(finalize(() => this.actionId.set(null))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.error.set(propertyErrorMessage(response, 'تعذر تغيير حالة الضريبة.'));
          return;
        }
        this.success.set(response.message || (activate ? 'تم تفعيل الضريبة.' : 'تم تعطيل الضريبة.'));
        this.loadTaxes();
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تغيير حالة الضريبة.')),
    });
  }
}
