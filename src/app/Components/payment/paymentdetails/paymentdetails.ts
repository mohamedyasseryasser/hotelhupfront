import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { Payments } from '../../../Service/payments';
import { Payment } from '../../../Models/payments';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  selector: 'app-paymentdetails',
  templateUrl: './paymentdetails.html',
  styleUrl: './paymentdetails.css',
})
export class Paymentdetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Payments);

  readonly item = signal<Payment | null>(
    null,
  );

  readonly error = signal('');

  readonly id = Number(
    this.route.snapshot.paramMap
      .get('id'),
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api
      .get(this.id)
      .subscribe({
        next: (response) => {
          this.item.set(response.data);
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحميل الدفعة.',
          );
        },
      });
  }
}
