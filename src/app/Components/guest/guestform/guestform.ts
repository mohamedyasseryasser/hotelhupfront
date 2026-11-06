import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Guest, GuestFormRequest } from '../../../Models/guest';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Guestservice } from '../../../Service/guestservice';
import { Permissionservice } from '../../../Service/permissionservice';
@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-guestform',
  styleUrl: './guestform.css',
  templateUrl: './guestform.html',
})
export class Guestform implements OnInit {
  readonly permissions = inject(Permissionservice);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Guestservice);
  readonly propertyId = signal(0);
  readonly guestId = signal<number | null>(null);
  readonly guest = signal<Guest | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]], lastName: ['', [Validators.required, Validators.maxLength(100)]], identityType: [''], identityNumber: [''], nationalId: [''], phone: ['', Validators.maxLength(20)], email: ['', Validators.email], address: [''], nationality: [''], preferences: [''], internalNotes: [''], guestVisibleNotes: [''],
  });

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    if (propertyId <= 0) { this.error.set('معرف العقار غير صحيح.'); return; }
    this.propertyId.set(propertyId);
    const guestId = Number(this.route.snapshot.paramMap.get('guestId'));
    if (guestId > 0) { this.guestId.set(guestId); this.loadGuest(guestId); }
  }

  private loadGuest(id: number): void {
    this.loading.set(true);
    this.api.getGuest(this.propertyId(), id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) { this.error.set(propertyErrorMessage(response, 'تعذر تحميل الضيف.')); return; }
        const guest = response.data; this.guest.set(guest);
        this.form.patchValue({ firstName: guest.firstName, lastName: guest.lastName, identityType: guest.identityType ?? '', identityNumber: guest.identityNumber ?? '', nationalId: guest.nationalId ?? '', phone: guest.phone ?? '', email: guest.email ?? '', address: guest.address ?? '', nationality: guest.nationality ?? '', preferences: guest.preferences ?? '', internalNotes: guest.internalNotes ?? '', guestVisibleNotes: guest.guestVisibleNotes ?? '' });
      },
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر تحميل الضيف.')),
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const request: GuestFormRequest = { firstName: value.firstName.trim(), lastName: value.lastName.trim(), identityType: value.identityType.trim() || null, identityNumber: value.identityNumber.trim() || null, nationalId: value.nationalId.trim() || null, phone: value.phone.trim() || null, email: value.email.trim() || null, address: value.address.trim() || null, nationality: value.nationality.trim() || null, preferences: value.preferences.trim() || null, internalNotes: value.internalNotes.trim() || null, guestVisibleNotes: value.guestVisibleNotes.trim() || null };
    const current = this.guest();
    const request$ = current ? this.api.updateGuest(this.propertyId(), current.id, { ...request, expectedRowVersion: current.rowVersion }) : this.api.createGuest(this.propertyId(), request);
    this.saving.set(true);
    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => response.success && response.data ? void this.router.navigate(['/properties', this.propertyId(), 'guests', response.data.id]) : this.error.set(propertyErrorMessage(response, 'تعذر حفظ بيانات الضيف.')),
      error: (error: unknown) => this.error.set(propertyErrorMessage(error, 'تعذر حفظ بيانات الضيف.')),
    });
  }
}
