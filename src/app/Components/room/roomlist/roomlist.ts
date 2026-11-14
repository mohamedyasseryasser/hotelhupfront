import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Roomservice } from '../../../Service/roomservice';
import { Permissionservice } from '../../../Service/permissionservice';
import {  RoomPageData, RoomRecord } from '../../../Models/room';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';
 
@Component({
  imports: [CommonModule, DecimalPipe, RouterLink],
  selector: 'app-roomlist',
  styleUrl: './roomlist.css',
  templateUrl: './roomlist.html',
})
export class Roomlist  implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Roomservice);
  readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly rooms = signal<RoomRecord[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly search = signal('');
  readonly includeInactive = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly actionId = signal<number | null>(null);

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

    this.api
      .getRooms({
        propertyId: this.propertyId(),
        includeInactive: this.includeInactive(),
        pageSize: 20,
        pageNumber: this.page(),
        search: this.search(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
          console.log(response);
            this.error.set(
            
              propertyErrorMessage(response, 'تعذر تحميل الغرف.'),
            );
            return;
          }

          const data = response.data as RoomPageData | RoomRecord[];

          if (Array.isArray(data)) {
            this.rooms.set(data);
            this.totalPages.set(1);
          } else {
            this.rooms.set(data.items || []);
            this.totalPages.set(data.totalPages || 1);
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر تحميل الغرف.'),
          );
        },
      });
  }

  submitSearch(): void {
    this.page.set(1);
    this.load();
  }

  statusLabel(status: unknown): string {
    const value = Number(status);

    if (typeof status === 'string' && isNaN(value)) {
      return status;
    }

    return value === 0
      ? 'متاحة'
      : value === 1
        ? 'مشغولة'
        : value === 2
          ? 'محجوزة'
          : value === 3
            ? 'تنظيف'
            : value === 4
              ? 'صيانة'
              : value === 5
                ? 'خارج الخدمة'
                : value === 6
                  ? 'محجوبة'
                  : 'غير معروف';
  }

  isActive(room: RoomRecord): boolean {
    return (
      room.isActive !== false &&
      !['5', '6', 'OutOfOrder', 'Blocked'].includes(
        String(room.status),
      )
    );
  }

  view(room: RoomRecord): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'rooms',
      room.id,
    ]);
  }

  edit(room: RoomRecord): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'rooms',
      room.id,
      'edit',
    ]);
  }

  create(): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'rooms',
      'create',
    ]);
  }

  next(delta: number): void {
    const nextPage = this.page() + delta;

    if (nextPage >= 1 && nextPage <= this.totalPages()) {
      this.page.set(nextPage);
      this.load();
    }
  }

  deactivate(room: RoomRecord): void {
    if (!confirm(`تأكيد تعطيل الغرفة ${room.roomNumber}؟`)) {
      return;
    }

    this.actionId.set(room.id);
    console.log(this.propertyId(),room.id,room.rowVersion);
    this.api
      .deactivateRoom( room.id,this.propertyId(), {
        expectedRowVersion: room.rowVersion,
      })
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error.set(
              propertyErrorMessage(response, 'تعذر تعطيل الغرفة.'),
            );
            return;
          }

          this.success.set(response.message || 'تم تعطيل الغرفة.');
          this.load();
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر تعطيل الغرفة.'),
          );
        },
      });
  } 
  Activate(room: RoomRecord): void {
    if (!confirm(`تأكيد تعطيل الغرفة ${room.roomNumber}؟`)) {
      return;
    }

    this.actionId.set(room.id);
    console.log(this.propertyId(),room.id,room.rowVersion);
    this.api
      .ActivateRoom( room.id,this.propertyId(), {
        expectedRowVersion: room.rowVersion,
      })
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error.set(
              propertyErrorMessage(response, 'تعذر تفعيل الغرفة.'),
            );
            return;
          }

          this.success.set(response.message || 'تم تفعيل الغرفة.');
          this.load();
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر تفعيل الغرفة.'),
          );
        },
      });
  }
}
