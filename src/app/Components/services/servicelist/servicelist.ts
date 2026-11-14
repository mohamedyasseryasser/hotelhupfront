import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    RouterLink, DatePipe
  ],  selector: 'app-servicelist',
  styleUrl: './servicelist.css',
  templateUrl: './servicelist.html',
})
export class Servicelist implements OnInit {
  private readonly api = inject(Services);
  private readonly router = inject(Router);
readonly route = inject(ActivatedRoute);
  readonly propertyId = signal(0);
  readonly items = signal<ServiceRecord[]>([]);
  readonly search = signal('');
  readonly includeInactive = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
 readonly permissions=inject(Permissionservice);
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(param=>{
      const propertyId = Number(
      this.route.snapshot.queryParamMap
        .get('propertyId') || 0,
    );
    this.propertyId.set(propertyId);

    });
      this.load();

  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api
      .list({
        propertyId:
          this.propertyId() || undefined,

        includeInactive:
          this.includeInactive(),

        search:
          this.search().trim() || undefined,

        pageNumber: 1,
        pageSize: 100,
      })
      .subscribe({
        next: (response) => {
          this.items.set(
            response.data?.items ?? [],
          );

          this.loading.set(false);
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحميل الخدمات.',
          );

          this.loading.set(false);
        },
      });
  }

  create(): void {
    void this.router.navigate(
      ['/services/create'],
      {
        queryParams: {
          propertyId: this.propertyId(),
        },
      },
    );
  }

  view(service: ServiceRecord): void {
    void this.router.navigate(
      ['/services', service.id],
      {
        queryParams: {
          propertyId: this.propertyId(),
        },
      },
    );
  }

  edit(service: ServiceRecord): void {
    void this.router.navigate(
      ['/services', service.id, 'edit'],
      {
        queryParams: {
          propertyId: this.propertyId(),
        },
      },
    );
  }

  deactivate(service: ServiceRecord): void {
    const reason = prompt(
      'سبب التعطيل؟',
    );

    if (reason === null) {
      return;
    }

    this.api
      .deactivate(
        this.propertyId(),
        service.id,
        {
          reason,
        },
      )
      .subscribe({
        next: () => {
          this.load();
        },

        error: (error) => {
          this.error.set(
            error?.error?.message ??
              'تعذر تعطيل الخدمة.',
          );
        },
      });
  }
}