import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { Payments } from '../../../Service/payments';
import { Payment } from '../../../Models/payments';
import { Permissionservice } from '../../../Service/permissionservice';
import { Folio } from '../../../Service/folio';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  selector: 'app-paymentdetails',
  templateUrl: './paymentdetails.html',
  styleUrl: './paymentdetails.css',
})
export class Paymentdetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Payments);

  readonly item = signal<Payment | null>(null);
  readonly error = signal('');
  readonly success = signal('');
  readonly saving = signal(false);
readonly permissions=inject(Permissionservice);
  readonly refundAmount = signal<number | null>(null);
  readonly refundReason = signal('');
  readonly refundExternalId = signal('');
  readonly folioservice=inject(Folio);
  readonly id = Number(
    this.route.snapshot.paramMap.get('id'),
  );

  readonly refundableAmount = computed(() => {
    const payment = this.item();

    if (!payment) {
      return 0;
    }

    return Math.max(
      0,
      Number(
        (
          payment.amount -
          payment.refundedAmount
        ).toFixed(2),
      ),
    );
  });
private readonly propertyid=signal<number|null>(0);
  readonly canRefund = computed(() => {
    const amount = this.refundAmount();
    const reason = this.refundReason().trim();

    return (
      !this.saving() &&
      this.refundableAmount() > 0 &&
      amount !== null &&
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= this.refundableAmount() &&
      reason.length >= 3 &&
      reason.length <= 500
    );
  });

  ngOnInit(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('Payment ID غير صالح.');
      return;
    }
this.route.queryParamMap.subscribe(param=>{
  const pid = Number(param.get('propertyId'));
  if(pid<=0){
     this.error.set("يجب تحديد رقم العقار ");
     return;
  }
  this.propertyid.set(pid);
});
    this.load();
  }

  private load(): void {
    this.api.get(this.id).subscribe({
      next: (response) => {
    
        if (!response.data) {
          this.error.set('لم يتم العثور على الدفعة.');
          return;
        }

        this.item.set(response.data);
      },

      error: (error) => {
     console.log(error);
        this.error.set(
          this.getErrorMessage(
            error,
            'تعذر تحميل الدفعة.',
          ),
        );
      },
    });
  }

  submitRefund(): void {
    this.error.set('');
    this.success.set('');

    const payment = this.item();
    const amount = this.refundAmount();
    const reason = this.refundReason().trim();
    const externalId =
      this.refundExternalId().trim();

    if (!payment) {
      this.error.set('بيانات الدفعة غير محملة.');
      return;
    }

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      this.error.set('أدخل مبلغ استرداد أكبر من صفر.');
      return;
    }

    if (amount > this.refundableAmount()) {
      this.error.set(
        `أقصى مبلغ قابل للاسترداد هو ${this.refundableAmount().toFixed(2)}.`,
      );
      return;
    }

    if (reason.length < 3) {
      this.error.set(
        'سبب الاسترداد يجب أن يكون 3 أحرف على الأقل.',
      );
      return;
    }

    if (reason.length > 500) {
      this.error.set(
        'سبب الاسترداد لا يمكن أن يتجاوز 500 حرف.',
      );
      return;
    }

    this.saving.set(true);

    this.api.refund(payment.id, {
      amount: Number(amount.toFixed(2)),
      reason,
      externalId: externalId || null,
    }).subscribe({
      next: (response) => {
        this.saving.set(false);

        if (response.data) {
          this.item.set(response.data);
        } else {
          this.load();
        }

        this.refundAmount.set(null);
        this.refundReason.set('');
        this.refundExternalId.set('');
        this.success.set(
          'تم تنفيذ عملية الاسترداد بنجاح.',
        );
      },

      error: (error) => {
        this.saving.set(false);
        this.error.set(
          this.getErrorMessage(
            error,
            'تعذر تنفيذ عملية الاسترداد.',
          ),
        );
      },
    });
  }

  private getErrorMessage(
    error: any,
    fallback: string,
  ): string {
    const body = error?.error;
    const messages: string[] = [];

    if (
      typeof body?.message === 'string' &&
      body.message.trim()
    ) {
      messages.push(body.message.trim());
    }

    if (Array.isArray(body?.errors)) {
      messages.push(
        ...body.errors
          .filter(
            (value: unknown): value is string =>
              typeof value === 'string',
          )
          .map((value: string) => value.trim())
          .filter(Boolean),
      );
    } else if (
      body?.errors &&
      typeof body.errors === 'object'
    ) {
      for (const value of Object.values(body.errors)) {
        if (Array.isArray(value)) {
          messages.push(
            ...value
              .filter(
                (item: unknown): item is string =>
                  typeof item === 'string',
              )
              .map((item: string) => item.trim())
              .filter(Boolean),
          );
        }
      }
    }

    return (
      messages.join('، ') ||
      error?.message ||
      fallback
    );
  }
}

