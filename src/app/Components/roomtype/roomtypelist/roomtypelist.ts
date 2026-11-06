import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
import { CreateRoomTypeRequest, RoomTypeRecord } from '../../../Models/roomtype';
import { finalize } from 'rxjs';
import { Permissionservice } from '../../../Service/permissionservice';
@Component({
  imports: [CommonModule, DecimalPipe, RouterLink],
  selector: 'app-roomtypelist',
  styleUrl: './roomtypelist.css',
  templateUrl: './roomtypelist.html',
})
export class Roomtypelistimplements implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Roomtypeservice);
  readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly types = signal<RoomTypeRecord[]>([]);
  readonly includeInactive = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly actionId = signal<number | null>(null);

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));

    if (propertyId <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.api
      .getRoomTypes(this.propertyId(), this.includeInactive())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.types.set(response.data);
          } else {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تحميل أنواع الغرف.',
              ),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل أنواع الغرف.',
            ),
          );
        },
      });
  }

  isActive(type: RoomTypeRecord): boolean {
    return (
      type.isActive !== false &&
      String(type.status || 'Active') !== 'Inactive'
    );
  }

  create(): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'room-types',
      'create',
    ]);
  }

  view(type: RoomTypeRecord): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'room-types',
      type.id,
    ]);
  }

  edit(type: RoomTypeRecord): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'room-types',
      type.id,
      'edit',
    ]);
  }

  deactivate(type: RoomTypeRecord): void {
    if (!confirm(`تأكيد تعطيل نوع الغرفة «${type.name}»؟`)) {
      return;
    }

    this.actionId.set(type.id);

    this.api
      .deactivateRoomType(type.id, type.rowVersion)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تعطيل نوع الغرفة.',
              ),
            );
            return;
          }

          this.success.set(
            response.message || 'تم تعطيل نوع الغرفة.',
          );

          this.load();
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تعطيل نوع الغرفة.',
            ),
          );
        },
      });
  }
  activateRoomType(type: RoomTypeRecord): void {
    if (!confirm(`تأكيد تعطيل نوع الغرفة «${type.name}»؟`)) {
      return;
    }

    this.actionId.set(type.id);

    this.api
      .ActivateRoomType(type.id, type.rowVersion)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تفعيل الغرفه',
              ),
            );
            return;
          }

          this.success.set(
            response.message || 'تم تفعيل نوع الغرفة.',
          );

          this.load();
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تفعيل نوع الغرفة.',
            ),
          );
        },
      });
  }
}
