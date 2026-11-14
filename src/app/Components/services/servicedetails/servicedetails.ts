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

import { Services } from '../../../Service/services';
import { ServiceRecord } from '../../../Models/services';
import { Permissionservice } from '../../../Service/permissionservice';
@Component({
 imports: [
    CommonModule,
    RouterLink,
  ],  selector: 'app-servicedetails',
  styleUrl: './servicedetails.css',
  templateUrl: './servicedetails.html',
})
export class Servicedetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Services);
 readonly permissions=inject(Permissionservice);
  readonly item = signal<ServiceRecord | null>(
    null,
  );

  readonly error = signal('');

  readonly propertyId = Number(
    this.route.snapshot.queryParamMap
      .get('propertyId') || 0,
  );

  readonly id = Number(
    this.route.snapshot.paramMap.get('id'),
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api
      .get(this.propertyId, this.id)
      .subscribe({
        next: (response) => {
          this.item.set(response.data);
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحميل تفاصيل الخدمة.',
          );
        },
      });
  }

  edit(): void {
    void this.router.navigate(
      ['/services', this.id, 'edit'],
      {
        queryParams: {
          propertyId: this.propertyId,
        },
      },
    );
  }
}