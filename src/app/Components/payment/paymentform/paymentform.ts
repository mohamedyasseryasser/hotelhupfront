import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { Payments } from '../../../Service/payments';
import { PaymentMethod } from '../../../Models/payments';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  selector: 'app-paymentform',
  templateUrl: './paymentform.html',
  styleUrl: './paymentform.css',
})
export class Paymentform  implements OnInit{
 
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Payments);

  readonly folioId = Number(
    this.route.snapshot.paramMap
      .get('folioId'),
  );
readonly propertyid=signal<number>(0);
  readonly method = PaymentMethod;
  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    amount: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
      ],
    ],

    method: [
      PaymentMethod.Cash,
      Validators.required,
    ],

    externalId: [''],

    idempotencyKey: [''],
  });
 ngOnInit(): void {
  this.route.queryParamMap.subscribe(param=>{
      const id=Number(param.get('propertyId'));
      if(id<=0 || !Number.isInteger(id)){
       return;
      }
       this.propertyid.set(id);
    });
}
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    this.api
      .create(
        this.folioId,
        this.form.getRawValue(),
      )
      .subscribe({
        next: () => {
          void this.router.navigate([
            '/folios',
            this.folioId,
            'payments'
          ],       {
      queryParams: {
        propertyId: this.propertyid(),
      },
    },       );
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تسجيل الدفعة.',
          );

          this.saving.set(false);
        },
      });
  }
}
