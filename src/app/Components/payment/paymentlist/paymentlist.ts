import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { Payments } from '../../../Service/payments';
import { Payment } from '../../../Models/payments';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  selector: 'app-paymentlist',
  templateUrl: './paymentlist.html',
  styleUrl: './paymentlist.css',
})
export class Paymentlist implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Payments);
  private readonly propertyid=signal<number>(0);
  readonly folioId = Number(
    this.route.snapshot.paramMap
      .get('folioId')  
  );
  readonly permissions=inject(Permissionservice);
  readonly items = signal<Payment[]>([]);
  readonly summary = signal<any>(null);
  readonly error = signal('');
  
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(param=>{
      const id=Number(param.get('propertyId'));
      if(id<=0 || !Number.isInteger(id)){
       return;
      }
       this.propertyid.set(id);
    });
     this.load();
  }

  load(): void {
    console.log(this.folioId+'d');
     this.api
      .list(this.folioId)
      .subscribe({
        next: (response) => {
        console.log(response.data);
          this.items.set(
            response.data ?? [],
          );
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحميل المدفوعات.',
          );
        },
      });

    this.api
      .summary(this.folioId)
      .subscribe({
        next: (response) => {
          console.log(response.data);
          this.summary.set(response.data);
        },
      });
  }

  create(): void {
    void this.router.navigate([
      '/folios',
      this.folioId,
      'payments',
      'create',
    ] ,  {
        queryParams: {
          propertyId:
            this.propertyid(),
        },
      }, );
  }

  view(payment: Payment): void {
  void this.router.navigate(
    [
      '/payments',
      payment.id,
    ],
    {
      queryParams: {
        propertyId: this.propertyid(),
      },
    },
  );
}
}
