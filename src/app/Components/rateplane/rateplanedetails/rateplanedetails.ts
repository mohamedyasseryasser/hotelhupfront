
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';

import {
  RatePlan,
  RatePlanType,
  RatePlanVersion
} from '../../../Models/rateplane';

import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Permissionservice } from '../../../Service/permissionservice';
import { Rateplanservice } from '../../../Service/rateplane';

@Component({
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  selector: 'app-rateplanedetails',
  styleUrl: './rateplanedetails.css',
  templateUrl: './rateplanedetails.html',
})
export class Rateplanedetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Rateplanservice);

  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly planId = signal(0);

  readonly plan = signal<RatePlan | null>(null);
  readonly versions = signal<RatePlanVersion[]>([]);

  readonly loading = signal(false);
  readonly action = signal(false);

  readonly error = signal('');
  readonly success = signal('');

  ngOnInit(): void {

    const propertyId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const planId = Number(
      this.route.snapshot.paramMap.get('planId')
    );

    if (propertyId <= 0 || planId <= 0) {
      this.error.set('معرف العقار أو خطة الأسعار غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);
    this.planId.set(planId);

    this.load();

  }

  load(): void {

    this.loading.set(true);
    this.error.set('');

    forkJoin({
      plan: this.api.getRatePlan(this.planId()),
      versions: this.api.getVersions(this.planId())
    })
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {

          if (!response.plan.success || !response.plan.data) {
            this.error.set(
              propertyErrorMessage(
                response.plan,
                'تعذر تحميل خطة الأسعار.'
              )
            );
            return;
          }

          this.plan.set(response.plan.data);
             console.log(this.plan());
          if (response.versions.success && response.versions.data) {
            this.versions.set(response.versions.data);
          }
        },

        error: (error: unknown) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل تفاصيل خطة الأسعار.'
            )
          );
        },
      });
  }

  typeLabel(type: RatePlanType | number): string {

    return [
      'قياسية',
      'شركات',
      'موسمية',
      'نهاية الأسبوع',
      'غير قابلة للاسترداد'
    ][Number(type)] ?? 'غير محدد';
  }

  edit(): void {

    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'rate-plans',
      this.planId(),
      'edit'
    ]);
  }

  deactivate(): void {

    const plan = this.plan();

    if (
      !plan ||
      !confirm(`تأكيد تعطيل خطة الأسعار «${plan.name}»؟`)
    ) {
      return;
    }

    this.action.set(true);

    this.api
      .changestateRatePlan(
        plan.id,
        plan.rowVersion,
        false
      )
      .pipe(
        finalize(() => this.action.set(false))
      )
      .subscribe({
        next: (response) => {

          if (!response.success || !response.data) {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تعطيل خطة الأسعار.'
              )
            );
            return;
          }

          this.plan.set(response.data);

          this.success.set(
            response.message || 'تم تعطيل خطة الأسعار.'
          );
        },

        error: (error: unknown) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تعطيل خطة الأسعار.'
            )
          );
        },
      });
  }
}
