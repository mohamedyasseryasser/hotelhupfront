import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Expenses } from '../../../Service/expensesservices';
import { ExpenseRecord, ExpenseStatus } from '../../../Models/expenses';
import { PaymentMethod } from '../../../Models/folio';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  selector: 'app-expenselist',
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './expenselist.html',
  styleUrl: './expenselist.css',
})
export class Expenselist implements OnInit {
  private readonly api = inject(Expenses);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
readonly permissions=inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly items = signal<ExpenseRecord[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly fromDate = signal('');
  readonly toDate = signal('');
  readonly category = signal('');
  readonly vendorName = signal('');
  readonly status = signal<number | null>(null);
  readonly paymentMethod = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly statuses = ExpenseStatus;
  readonly methods = PaymentMethod;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.propertyId.set(Number(params.get('propertyId') ?? 0));
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list({
      propertyId: this.propertyId() || undefined,
      fromDate: this.fromDate() || undefined,
      toDate: this.toDate() || undefined,
      category: this.category().trim() || undefined,
      vendorName: this.vendorName().trim() || undefined,
      status: this.status() ?? undefined,
      paymentMethod: this.paymentMethod() ?? undefined,
      pageNumber: this.page(),
      pageSize: this.pageSize(),
      sortBy: 'ExpenseDate',
      descending: true,
    }).subscribe({
      next: response => {
        const data = response.data;
        this.items.set(data?.items ?? []);
        this.totalPages.set(data?.totalPages ?? 0);
        this.totalCount.set(data?.totalCount ?? 0);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error?.error?.message ?? 'تعذر تحميل المصروفات.');
        this.loading.set(false);
      },
    });
  }

  reset(): void {
    this.fromDate.set('');
    this.toDate.set('');
    this.category.set('');
    this.vendorName.set('');
    this.status.set(null);
    this.paymentMethod.set(null);
    this.page.set(1);
    this.load();
  }

  create(): void {
    void this.router.navigate(['/expenses/create'], {
      queryParams: { propertyId: this.propertyId() },
    });
  }

  edit(item: ExpenseRecord): void {
    void this.router.navigate(['/expenses', item.id, 'edit'], {
      queryParams: { propertyId: this.propertyId() },
    });
  }

  view(item: ExpenseRecord): void {
    void this.router.navigate(['/expenses', item.id], {
      queryParams: { propertyId: this.propertyId() },
    });
  }

  voiditem(item: ExpenseRecord): void {
    const reason = prompt('اكتب سبب إلغاء المصروف:');
    if (reason === null || !reason.trim()) return;
    this.api.void(item.id, {
      reason: reason.trim(),
      expectedRowVersion: item.rowVersion,
    }).subscribe({
      next: () => this.load(),
      error: error => this.error.set(error?.error?.message ?? 'تعذر إلغاء المصروف.'),
    });
  }

  previous(): void {
    if (this.page() > 1) {
      this.page.update(value => value - 1);
      this.load();
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(value => value + 1);
      this.load();
    }
  }
}
