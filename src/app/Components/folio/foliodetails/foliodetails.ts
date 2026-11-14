import { CommonModule } from '@angular/common';

import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  combineLatest,
  Observable,
} from 'rxjs';

import { Folio } from '../../../Service/folio';

import {
  folio,
  FolioItem,
  FolioStatus,
  FolioItemStatus,
} from '../../../Models/folio';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  selector: 'app-foliodetails',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './foliodetails.html',
  styleUrl: './foliodetails.css',
})
export class Foliodetails implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly api =
    inject(Folio);
readonly permissions=inject(Permissionservice);
  readonly propertyId =
    signal<number | null>(null);

  readonly reservationId =
    signal<number>(0);

  readonly id =
    signal<number>(0);

  readonly folio =
    signal<folio | null>(null);

  readonly summary =
    signal<any>(null);

  readonly error =
    signal<string>('');

  readonly loading =
    signal<boolean>(false);

  readonly saving =
    signal<boolean>(false);

  readonly status =
    FolioStatus;

  readonly itemStatus =
    FolioItemStatus;

  readonly isOpen =
    computed(() =>
      this.folio()?.status ===
      FolioStatus.Open,
    );

  readonly isClosed =
    computed(() =>
      this.folio()?.status ===
      FolioStatus.Closed,
    );

  readonly canEdit =
    computed(() =>
      this.isOpen() &&
      !this.loading() &&
      !this.saving(),
    );

  ngOnInit(): void {
    /*
     * ننتظر تحميل folioId و propertyId
     * قبل استدعاء load().
     */
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).subscribe({
      next: ([params, query]) => {
        const folioId =
          Number(params.get('folioId'));

        const propertyId =
          Number(query.get('propertyId'));

        if (
          !Number.isInteger(folioId) ||
          folioId <= 0
        ) {
          this.error.set(
            'Folio ID غير صالح.',
          );
          return;
        }

        if (
          !Number.isInteger(propertyId) ||
          propertyId <= 0
        ) {
          this.error.set(
            'Property ID غير صالح.',
          );
          return;
        }

        this.id.set(folioId);
        this.propertyId.set(propertyId);

        this.load();
      },
    });
  }

  load(): void {
    const folioId =
      this.id();

    if (
      !Number.isInteger(folioId) ||
      folioId <= 0
    ) {
      this.error.set(
        'Folio ID غير صالح.',
      );
      return;
    }
    console.log(this.propertyId()+"nnn");
    this.loading.set(true);
    this.error.set('');

    this.api.get(folioId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.folio.set(response.data);
        this.loading.set(false);

        if (!response.data) {
          this.error.set(
            'لم يتم العثور على Folio.',
          );
          return;
        }
           console.log(response.data.status);
        const reservationId =
          Number(response.data.reservationId);

        if (
          !Number.isInteger(reservationId) ||
          reservationId <= 0
        ) {
          this.error.set(
            'Reservation ID غير صالح.',
          );
          return;
        }

        this.reservationId.set(
          reservationId,
        );
      },

      error: (error) => {
        this.loading.set(false);

        this.error.set(
          this.getErrorMessage(
            error,
            'تعذر تحميل Folio.',
          ),
        );
      },
    });

    this.api.summary(folioId).subscribe({
     
      next: (response) => {
        this.summary.set(response.data);
      console.log(folioId);
        console.log( this.summary());
      },

      error: (error) => {
        this.error.set(
          this.getErrorMessage(
            error,
            'تعذر تحميل ملخص Folio.',
          ),
        );
      },
    });
  }

  add(): void {
    if (!this.canEdit()) {
      this.error.set(
        'لا يمكن إضافة بند إلا إلى Folio مفتوح.',
      );
      return;
    }

    this.router.navigate(
      [
        '/folios',
        this.id(),
        'items',
        'create',
      ],
      {
        queryParams: {
          propertyId:
            this.propertyId(),
        },
      },
    );
  }

  close(): void {
    if (!this.isOpen()) {
      this.error.set(
        'الـ Folio مغلق بالفعل.',
      );
      return;
    }

    if (this.saving()) {
      return;
    }

    const reason =
      prompt(
        'سبب الإغلاق؟',
      )?.trim() ?? '';

    if (reason.length < 3) {
      this.error.set(
        'سبب الإغلاق يجب أن يكون 3 أحرف على الأقل.',
      );
      return;
    }

    if (reason.length > 500) {
      this.error.set(
        'سبب الإغلاق لا يمكن أن يتجاوز 500 حرف.',
      );
      return;
    }

    const currentFolio =
      this.folio();

    if (!currentFolio) {
      this.error.set(
        'بيانات Folio غير محملة.',
      );
      return;
    }

    if (!currentFolio.rowVersion) {
      this.error.set(
        'RowVersion غير موجودة. أعد تحميل الصفحة.',
      );
      return;
    }

    this.executeAction(
      this.api.close(
        this.id(),
        {
          reason,
          expectedRowVersion:
            currentFolio.rowVersion,
        },
      ),
    );
  }

  reopen(): void {
    if (!this.isClosed()) {
      this.error.set(
        'الـ Folio مفتوح بالفعل.',
      );
      return;
    }

    if (this.saving()) {
      return;
    }

    const reason =
      prompt(
        'سبب إعادة الفتح؟',
      )?.trim() ?? '';

    if (reason.length < 3) {
      this.error.set(
        'سبب إعادة الفتح يجب أن يكون 3 أحرف على الأقل.',
      );
      return;
    }

    if (reason.length > 500) {
      this.error.set(
        'سبب إعادة الفتح لا يمكن أن يتجاوز 500 حرف.',
      );
      return;
    }

    const currentFolio =
      this.folio();

    if (!currentFolio) {
      this.error.set(
        'بيانات Folio غير محملة.',
      );
      return;
    }

    if (!currentFolio.rowVersion) {
      this.error.set(
        'RowVersion غير موجودة. أعد تحميل الصفحة.',
      );
      return;
    }

    this.executeAction(
      this.api.reopen(
        this.id(),
        {
          reason,
          expectedRowVersion:
            currentFolio.rowVersion,
        },
      ),
    );
  }

  voidItem(item: FolioItem): void {
    if (!this.isOpen()) {
      this.error.set(
        'لا يمكن إلغاء بند داخل Folio مغلق.',
      );
      console.log(this.error());
      return;
    }

    if (this.saving()) {
      return;
    }

    const reason =
      prompt(
        'سبب إلغاء البند؟',
      )?.trim() ?? '';

    if (reason.length < 3) {
      this.error.set(
        'سبب إلغاء البند يجب أن يكون 3 أحرف على الأقل.',
      );
      return;
    }

    if (reason.length > 500) {
      this.error.set(
        'سبب إلغاء البند لا يمكن أن يتجاوز 500 حرف.',
      );
      return;
    }

    const currentFolio =
      this.folio();

    if (!currentFolio) {
      this.error.set(
        'بيانات Folio غير محملة.',
      );
      return;
    }

    if (!currentFolio.rowVersion) {
      this.error.set(
        'RowVersion غير موجودة. أعد تحميل الصفحة.',
      );
      return;
    }

    this.executeAction(
      this.api.voidItem(
        this.id(),
        item.id,
        {
          reason,
          expectedRowVersion:
            currentFolio.rowVersion,
        },
      ),
    );
  }

  private executeAction(
    request: Observable<unknown>,
  ): void {
    this.saving.set(true);
    this.error.set('');

    request.subscribe({
      next: () => {
        this.saving.set(false);

        /*
         * إعادة تحميل البيانات للحصول على:
         * - الحالة الجديدة
         * - الرصيد الجديد
         * - البنود الجديدة
         * - RowVersion الجديدة
         */
        this.load();
      },

      error: (error) => {
        this.saving.set(false);

        console.error(
          'Folio action failed:',
          {
            status: error?.status,
            statusText: error?.statusText,
            url: error?.url,
            message: error?.message,
            body: error?.error,
          },
        );

        this.error.set(
          this.getErrorMessage(
            error,
            'تعذر تنفيذ العملية على Folio.',
          ),
        );
      },
    });
  }

  private getErrorMessage(
    error: any,
    fallback: string,
  ): string {
    const body =
      error?.error;

    const messages: string[] = [];

    if (
      typeof body?.message === 'string' &&
      body.message.trim()
    ) {
      messages.push(
        body.message.trim(),
      );
    }

    if (Array.isArray(body?.errors)) {
      messages.push(
        ...body.errors
          .filter(
            (item: unknown): item is string =>
              typeof item === 'string',
          )
          .map((item: string) =>
            item.trim(),
          )
          .filter(Boolean),
      );
    } else if (
      body?.errors &&
      typeof body.errors === 'object'
    ) {
      for (
        const value of Object.values(
          body.errors,
        )
      ) {
        if (Array.isArray(value)) {
          messages.push(
            ...value
              .filter(
                (item: unknown): item is string =>
                  typeof item === 'string',
              )
              .map((item: string) =>
                item.trim(),
              )
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
