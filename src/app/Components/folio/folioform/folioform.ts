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

import { Folio } from '../../../Service/folio';
import { Services } from '../../../Service/services';
import { Authservice } from '../../../Service/authservice';

import {
  FolioItemSource,
  FolioItemType,
} from '../../../Models/folio';

import {
  ServiceRecord,
} from '../../../Models/services';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],

  selector: 'app-folioform',

  templateUrl: './folioform.html',

  styleUrl: './folioform.css',
})
export class Folioform implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly folioApi =
    inject(Folio);

  private readonly serviceApi =
    inject(Services);

  private readonly auth =
    inject(Authservice);

  readonly folioId = Number(
    this.route.snapshot.paramMap.get(
      'folioId',
    ),
  );

  readonly propertyId = signal(0);

  readonly types = FolioItemType;

  readonly services =
    signal<ServiceRecord[]>([]);

  readonly selectedService =
    signal<ServiceRecord | null>(null);

  readonly loadingServices =
    signal(false);

  readonly saving =
    signal(false);

  readonly error =
    signal('');
readonly permissions=inject(Permissionservice);

  readonly form =
    this.fb.nonNullable.group({
      type: [
        FolioItemType.Service,
        Validators.required,
      ],

      serviceId: [
        null as number | null,
      ],

      amount: [
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

      description: [''],

      referenceId: [''],
    });

  ngOnInit(): void {
    if (
      !Number.isInteger(this.folioId) ||
      this.folioId <= 0
    ) {
      this.error.set(
        'رقم Folio غير صحيح.',
      );

      return;
    }

    const queryPropertyId = Number(
      this.route.snapshot.queryParamMap.get(
        'propertyId',
      ),
    );

    const authenticatedPropertyId =
      this.auth.user()?.propertyId ?? 0;

    /*
     * إذا كان propertyId موجودًا في الـ query
     * نستخدمه، وإلا نستخدم Property المستخدم
     * من الـ Auth Session.
     */
    const currentPropertyId =
      Number.isInteger(queryPropertyId) &&
      queryPropertyId > 0
        ? queryPropertyId
        : authenticatedPropertyId;

    if (
      !Number.isInteger(currentPropertyId) ||
      currentPropertyId <= 0
    ) {
      this.error.set(
        'لا يمكن تحديد العقار الحالي لتحميل الخدمات.',
      );

      return;
    }

    this.propertyId.set(currentPropertyId);

    this.form.controls.type.valueChanges
      .subscribe(type => {
        this.onTypeChange(type);
      });

    this.loadServices();
  }

  private loadServices(): void {
    const currentPropertyId =
      this.propertyId();

    if (
      !Number.isInteger(currentPropertyId) ||
      currentPropertyId <= 0
    ) {
      this.error.set(
        'PropertyId غير صحيح.',
      );

      return;
    }

    this.loadingServices.set(true);
    this.error.set('');

    this.serviceApi
      .list({
        propertyId: currentPropertyId,
        includeInactive: false,
        pageNumber: 1,
        pageSize: 100,
      })
      .subscribe({
        next: response => {
          this.services.set(
            response.data?.items ?? [],
          );

          this.loadingServices.set(false);
        },

        error: error => {
          this.error.set(
            error?.error?.message ??
              'تعذر تحميل خدمات العقار.',
          );

          this.loadingServices.set(false);
        },
      });
  }

  onTypeChange(
    type: FolioItemType,
  ): void {
    /*
     * عند اختيار Service:
     * يسمح للمستخدم باختيار Service.
     */
    if (
      type === FolioItemType.Service
    ) {
      return;
    }

    /*
     * عند اختيار أي نوع آخر:
     * يجب إزالة أي Service مرتبطة.
     */
    this.form.controls.serviceId.setValue(
      null,
    );

    this.selectedService.set(null);

    this.form.patchValue({
      amount: 0,
      tax: 0,
    });
  }

  onServiceChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    const serviceId =
      Number(select.value);

    if (
      !Number.isInteger(serviceId) ||
      serviceId <= 0
    ) {
      this.form.controls.serviceId.setValue(
        null,
      );

      this.selectedService.set(null);

      this.form.patchValue({
        amount: 0,
        tax: 0,
      });

      return;
    }

    const service =
      this.services().find(
        item => item.id === serviceId,
      ) ?? null;

    this.selectedService.set(service);

    if (!service) {
      this.form.patchValue({
        serviceId: null,
        amount: 0,
        tax: 0,
      });

      return;
    }

    /*
     * السعر والضريبة يتم أخذهم من الخدمة
     * ولا يتم السماح بتعديلهم إذا كانت الخدمة
     * محددة.
     */
    this.form.patchValue({
      serviceId: service.id,
      amount: service.price,
      tax: service.tax,
    });
  }

  isServiceType(): boolean {
    return (
      this.form.controls.type.value ===
      FolioItemType.Service
    );
  }

  isServiceSelected(): boolean {
    return (
      this.isServiceType() &&
      this.selectedService() !== null
    );
  }

  hasRequiredValues(): boolean {
    const value =
      this.form.getRawValue();

    const hasValidType =
      value.type !== null &&
      value.type !== undefined;

    const hasValidAmount =
      Number(value.amount) >= 0.01;

    const hasValidTax =
      Number(value.tax) >= 0;

    if (
      !hasValidType ||
      !hasValidAmount ||
      !hasValidTax
    ) {
      return false;
    }

    /*
     * إذا كان نوع البند Service:
     * يجب اختيار Service فعلية.
     */
    if (
      value.type === FolioItemType.Service
    ) {
      return (
        Number(value.serviceId) > 0 &&
        this.selectedService() !== null
      );
    }

    /*
     * الأنواع الأخرى لا تقبل serviceId.
     */
    return !value.serviceId;
  }

  save(): void {
    if (
      this.form.invalid ||
      !this.hasRequiredValues() ||
      this.saving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const value =
      this.form.getRawValue();

    const service =
      this.selectedService();

    const hasService =
      value.type === FolioItemType.Service &&
      Number(value.serviceId) > 0 &&
      service !== null;

    /*
     * تحديد المصدر تلقائيًا:
     *
     * serviceId موجود:
     *     Source = Service
     *
     * serviceId غير موجود:
     *     Source = Manual
     */
    const source = hasService
      ? FolioItemSource.Service
      : FolioItemSource.Manual;

    const amount = hasService
      ? service.price
      : Number(value.amount);

    const tax = hasService
      ? service.tax
      : Number(value.tax);

    this.folioApi
      .addItem(
        this.folioId,
        {
          type: value.type,

          source,

          serviceId: hasService
            ? service.id
            : null,

          amount,

          tax,

          description:
            value.description.trim() ||
            null,

          referenceId:
            value.referenceId.trim() ||
            null,

          idempotencyKey:
            this.createIdempotencyKey(),
        },
      )
      .subscribe({
        next: () => {
          void this.router.navigate([
            '/folios',
            this.folioId,
          ],  {
        queryParams: {
          propertyId: this.propertyId()
        }
      }   );
        },

        error: error => {
          this.error.set(
            error?.error?.message ??
              'تعذر إضافة البند إلى Folio.',
          );

          this.saving.set(false);
        },
      });
  }

  private createIdempotencyKey(): string {
    return [
      'folio-item',
      this.folioId,
      Date.now(),
      Math.random()
        .toString(36)
        .slice(2),
    ].join('-');
  }
}
