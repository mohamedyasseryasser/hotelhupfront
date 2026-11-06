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

import { Services } from '../../../Service/services';
@Component({
 imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],  selector: 'app-serviceform',
  styleUrl: './serviceform.css',
  templateUrl: './serviceform.html',
})
export class Serviceform implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Services);

  readonly propertyId = signal(0);
  readonly id = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ],
    ],

    description: [''],

    revenueCategory: [''],

    price: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
      ],
    ],

    tax: [
      0,
      [
        Validators.required,
        Validators.min(0),
      ],
    ],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(param=>{
      const propertyId = Number(
      this.route.snapshot.queryParamMap
        .get('propertyId') || 0,
    );
    this.propertyId.set(propertyId);
    });
  

    const id = Number(
      this.route.snapshot.paramMap.get('id'),
    );

    if (id > 0) {
      this.id.set(id);
      this.loadService(id);
    }
  }

  private loadService(id: number): void {
  this.loading.set(true);
  this.error.set('');

  this.api
    .get(this.propertyId(), id)
    .subscribe({
      next: (response) => {
        const service = response.data;

        if (!service) {
          this.error.set(
            'لم يتم العثور على بيانات الخدمة.',
          );

          this.loading.set(false);
          return;
        }

        this.form.patchValue({
          name: service.name ?? '',

          description:
            service.description ?? '',

          revenueCategory:
            service.revenueCategory ?? '',

          price: service.price ?? 0,

          tax: service.tax ?? 0,
        });

        this.loading.set(false);
      },

      error: (error) => {
        this.error.set(
          error?.error?.message ??
            'تعذر تحميل الخدمة.',
        );

        this.loading.set(false);
      },
    });
}


  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const request =
      this.form.getRawValue();

    const operation$ = this.id()
      ? this.api.update(
          this.propertyId(),
          this.id()!,
          request,
        )
      : this.api.create(
          this.propertyId(),
          request,
        );

    operation$.subscribe({
      next: () => {
        void this.router.navigate(
          ['/services'],
          {
            queryParams: {
              propertyId: this.propertyId(),
            },
          },
        );
      },

      error: (error) => {
        this.error.set(
          error?.error?.message ??
            'تعذر حفظ الخدمة.',
        );

        this.saving.set(false);
      },
    });
  }
}