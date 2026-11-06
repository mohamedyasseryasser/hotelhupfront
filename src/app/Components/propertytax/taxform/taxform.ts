import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Taxservice } from '../../../Service/taxservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { CreateTaxRequest, TaxRecord, TaxType, UpdateTaxRequest } from '../../../Models/tax';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule,FormsModule,DatePipe, DecimalPipe, RouterLink],
  selector: 'app-taxform',
  styleUrl: './taxform.css',
  templateUrl: './taxform.html',
})
export class Taxform implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Taxservice);
readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly taxId = signal<number | null>(null);
  readonly editingTax = signal<TaxRecord | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly taxType = TaxType;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    code: ['', [Validators.required, Validators.maxLength(50)]],
    rate: [0, [Validators.required, Validators.min(0)]],
    type: [TaxType.Percentage, Validators.required],
    isInclusive: [false],
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
    const taxId = Number(this.route.snapshot.paramMap.get('taxId'));
    if (Number.isInteger(taxId) && taxId > 0) {
      this.taxId.set(taxId);
      this.form.controls.reason.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(500)]);
      this.form.controls.reason.updateValueAndValidity();
      this.loadTax(taxId);
    }
  }

  private loadTax(taxId: number): void {
    this.loading.set(true);
    this.api.getTax(this.propertyId(), taxId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر تحميل الضريبة للتعديل.'));
          return;
        }
        const tax = response.data;
        this.editingTax.set(tax);
        this.form.patchValue({
          name: tax.name,
          code: tax.code,
          rate: tax.rate,
          type: tax.type,
          isInclusive: tax.isInclusive,
          validFrom: this.toLocalDateTime(tax.validFrom),
          validTo: tax.validTo ? this.toLocalDateTime(tax.validTo) : '',
          reason: '',
        });
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل الضريبة للتعديل.')),
    });
  }

  saveTax(): void {
    this.error.set('');
    if (this.form.invalid || this.saving() || (this.taxId() !== null && !this.editingTax())) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const validFrom = this.toIsoDateTime(value.validFrom);
    const validTo = value.validTo ? this.toIsoDateTime(value.validTo) : null;
    if (!validFrom || (value.validTo && !validTo)) {
      this.error.set('تاريخ بداية أو نهاية الضريبة غير صالح.');
      return;
    }
    if (validTo && new Date(validTo) < new Date(validFrom)) {
      this.error.set('تاريخ نهاية الضريبة يجب أن يكون بعد تاريخ البداية.');
      return;
    }

    const request: CreateTaxRequest = {
      name: value.name.trim(),
      code: value.code.trim(),
      rate: Number(value.rate),
      type: value.type,
      isInclusive: value.isInclusive,
      validFrom,
      validTo,
    };
    const current = this.editingTax();
    const request$ = current
      ? this.api.updateTax(this.propertyId(), current.id, current.rowVersion, {
          ...request,
          clearValidTo: validTo === null,
          reason: value.reason.trim(),
        } satisfies UpdateTaxRequest)
      : this.api.createTax(this.propertyId(), request);

    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(propertyErrorMessage(response, 'تعذر حفظ الضريبة.'));
          return;
        }
        void this.router.navigate(['/properties', this.propertyId(), 'taxes']);
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر حفظ الضريبة.')),
    });
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
