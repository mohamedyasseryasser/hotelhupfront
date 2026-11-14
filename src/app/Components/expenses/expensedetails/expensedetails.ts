import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Expenses } from '../../../Service/expensesservices';
import { ExpenseRecord, ExpenseStatus } from '../../../Models/expenses';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  selector: 'app-expensedetails',
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './expensedetails.html',
  styleUrl: './expensedetails.css',
})
export class Expensedetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Expenses);
  readonly item = signal<ExpenseRecord | null>(null);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly status = ExpenseStatus;
readonly permissions=inject(Permissionservice);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id <= 0) { this.error.set('معرف المصروف غير صحيح.'); return; }
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: response => { this.item.set(response.data); this.loading.set(false); },
      error: error => { this.error.set(error?.error?.message ?? 'تعذر تحميل المصروف.'); this.loading.set(false); },
    });
  }
}
