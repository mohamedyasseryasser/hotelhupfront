import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { Guest, GuestReservationSummary } from '../../../Models/guest';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Guestservice } from '../../../Service/guestservice';
import { Permissionservice } from '../../../Service/permissionservice';
@Component({
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  selector: 'app-guestdetails',
  styleUrl: './guestdetails.css',
  templateUrl: './guestdetails.html',
})
export class Guestdetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Guestservice);
  readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly guestId = signal(0);
  readonly guest = signal<Guest | null>(null);
  readonly reservations = signal<GuestReservationSummary[]>([]);
  readonly loading = signal(false);
  readonly action = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const guestId = Number(this.route.snapshot.paramMap.get('guestId'));
    if (propertyId <= 0 || guestId <= 0) { this.error.set('معرف العقار أو الضيف غير صحيح.'); return; }
    this.propertyId.set(propertyId); this.guestId.set(guestId); this.load();
  }

  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({ guest: this.api.getGuest(this.propertyId(), this.guestId()), 
      history: this.api.getReservationHistory(this.propertyId(), this.guestId()) })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.guest.success || !response.guest.data) { this.error.set(propertyErrorMessage(response.guest, 'تعذر تحميل بيانات الضيف.')); return; }
          this.guest.set(response.guest.data);
          if (response.history.success && response.history.data) this.reservations.set(response.history.data);
        },
        error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل تفاصيل الضيف.')),
      });
  }

  edit(): void { void this.router.navigate(['/properties', this.propertyId(), 'guests', this.guestId(), 'edit']); }

  deactivate(): void {
    const guest = this.guest(); if (!guest) return;
    const reason = prompt('اكتب سبب تعطيل الضيف:'); if (reason === null) return;
    this.action.set(true);
    this.api.deactivateGuest(this.propertyId(), guest.id, { reason: reason.trim() || null, expectedRowVersion: guest.rowVersion }).pipe(finalize(() => this.action.set(false))).subscribe({
      next: (response) => response.success && response.data ? (this.guest.set(response.data), this.success.set('تم تعطيل الضيف.')) : this.error.set(propertyErrorMessage(response, 'تعذر تعطيل الضيف.')),
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تعطيل الضيف.')),
    });
  }

  anonymize(): void {
    const guest = this.guest(); if (!guest) return;
    const reason = prompt('اكتب سبب إخفاء بيانات الضيف:'); if (reason === null || reason.trim().length < 2) return;
    if (!confirm('سيتم حذف البيانات الشخصية واستبدالها ببيانات مجهولة. هل تريد المتابعة؟')) return;
    this.action.set(true);
    this.api.anonymizeGuest(this.propertyId(), guest.id, { reason: reason.trim(), expectedRowVersion: guest.rowVersion }).pipe(finalize(() => this.action.set(false))).subscribe({
      next: (response) => response.success && response.data ? (this.guest.set(response.data), this.success.set('تم إخفاء بيانات الضيف.')) : this.error.set(propertyErrorMessage(response, 'تعذر إخفاء بيانات الضيف.')),
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر إخفاء بيانات الضيف.')),
    });
  }
}

