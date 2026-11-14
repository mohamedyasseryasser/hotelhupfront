import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Expenses } from '../../../Service/expensesservices';
import { Authservice } from '../../../Service/authservice';
import { PaymentMethod } from '../../../Models/folio';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  selector: 'app-expenseform',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './expenseform.html',
  styleUrl: './expenseform.css',
})
export class Expenseform implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Expenses);
  private readonly auth = inject(Authservice);
readonly permissions=inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly id = signal<number | null>(null);
  readonly rowVersion = signal('');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly methods = PaymentMethod;

  readonly form = this.fb.nonNullable.group({
    category: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    currency: ['EGP', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    expenseDate: [new Date().toISOString().slice(0, 10), Validators.required],
    paymentMethod: [PaymentMethod.Cash, Validators.required],
    vendorName: [''],
    referenceNumber: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const queryId = Number(params.get('propertyId') ?? 0);
      this.propertyId.set(queryId || this.auth.user()?.propertyId || 0);
    });
    const id = Number(this.route.snapshot.paramMap.get('id'));
if (id > 0) {
  this.id.set(id);
  this.setEditMode();
  this.load(id);
}
  }
private setEditMode(): void {
  this.form.controls.amount.disable({
    emitEvent: false,
  });

  this.form.controls.currency.disable({
    emitEvent: false,
  });

  this.form.controls.expenseDate.disable({
    emitEvent: false,
  });

  this.form.controls.paymentMethod.disable({
    emitEvent: false,
  });
}

  private load(id: number): void {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: response => {
        const item = response.data;
        if (!item) { this.error.set('المصروف غير موجود.'); this.loading.set(false); return; }
        this.rowVersion.set(item.rowVersion);
        this.form.patchValue({
          category: item.category, description: item.description, amount: item.amount,
          currency: item.currency, expenseDate: item.expenseDate.slice(0, 10),
          paymentMethod: item.paymentMethod, vendorName: item.vendorName ?? '',
          referenceNumber: item.referenceNumber ?? '', notes: item.notes ?? '',
        });
        this.propertyId.set(item.propertyId);
        this.loading.set(false);
      },
      error: error => { this.error.set(error?.error?.message ?? 'تعذر تحميل المصروف.'); this.loading.set(false); },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving() || !this.propertyId()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.error.set('');
    const value = this.form.getRawValue();
     console.log(value);
    const operation$ = this.id()
      ? this.api.update(this.id()!, { ...value, expectedRowVersion: this.rowVersion() })
      : this.api.create({ ...value, propertyId: this.propertyId(), expenseDate: `${value.expenseDate}T00:00:00Z`, currency: value.currency.toUpperCase() });
     
      operation$.subscribe({
      next: () => void this.router.navigate(['/expenses'], { queryParams: { propertyId: this.propertyId() } }),
      error: error => { this.error.set(error?.error?.message ?? 'تعذر حفظ المصروف.'); this.saving.set(false); },
    });
  }
}
