import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RatePlan, RatePlanType } from '../../../Models/rateplane';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Permissionservice } from '../../../Service/permissionservice';
import { Rateplanservice } from '../../../Service/rateplane';

@Component({
  imports: [CommonModule, DecimalPipe, RouterLink],
  selector: 'app-rateplanelist',
  styleUrl: './rateplanelist.css',
  templateUrl: './rateplanelist.html',
})
export class Rateplanelist  implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Rateplanservice);
  readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly plans = signal<RatePlan[]>([]);
  readonly loading = signal(false);
  readonly actionId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }
    this.propertyId.set(id);
    this.load();
   }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getRatePlans(this.propertyId()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => response.success && response.data
        ? this.plans.set(response.data) 
        : this.error.set(propertyErrorMessage(response, 'تعذر تحميل خطط الأسعار.')),
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل خطط الأسعار.')),
    });     
   }

  typeLabel(type: RatePlanType | number): string {
    return ['قياسية', 'شركات', 'موسمية', 'نهاية الأسبوع', 'غير قابلة للاسترداد'][Number(type)] ?? 'غير محدد';
  }

  view(plan: RatePlan): void
   {
     void this.router.navigate(['/properties', this.propertyId(), 'rate-plans', plan.id]);
   }
  edit(plan: RatePlan): void 
  {
     void this.router.navigate(['/properties', this.propertyId(), 'rate-plans', plan.id, 'edit']);
  }
  create(): void 
  {
     void this.router.navigate(['/properties', this.propertyId(), 'rate-plans', 'create']); 
  }
   activate(plan: RatePlan): void {
    if (!confirm(`تأكيد تفعيل خطة الأسعار «${plan.name}»؟`)) return;
    this.actionId.set(plan.id);
    this.changerateplanestate(true, plan);
  }
  deactivate(plan: RatePlan): void {
    if (!confirm(`تأكيد تعطيل خطة الأسعار «${plan.name}»؟`)) return;
    this.actionId.set(plan.id);
    this.changerateplanestate(false, plan);
  }
  private changerateplanestate(activate: boolean, plan: RatePlan): void {
         this.api.changestateRatePlan(plan.id, plan.rowVersion, activate).
         pipe(finalize(() => this.actionId.set(null))).subscribe({
          next: (response) => { if (!response.success) {
          this.error.set(propertyErrorMessage(response, `تعذر  { activate ? ' تفعيل' : 'تعطيل '} خطة الأسعار.`));
          return;
        }
        this.success.set(response.message || `تم  { activate ? ' تفعيل' : 'تعطيل '} خطة الأسعار.`);
        this.load();},
          error: (error: unknown) => this.error.set(propertyErrorMessage(error, `تعذر  { activate ? ' تفعيل' : 'تعطيل '} خطة الأسعار.`)),
         });
  }
  }

