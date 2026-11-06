import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Roomservice } from '../../../Service/roomservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { RoomRecord } from '../../../Models/room';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';

@Component({
  imports: [CommonModule, DecimalPipe, RouterLink],
  selector: 'app-roomdetails',
  styleUrl: './roomdetails.css',
  templateUrl: './roomdetails.html',
})
export class Roomdetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Roomservice);

  readonly permissions = inject(Permissionservice);

  readonly propertyId = signal(0);
  readonly roomId = signal(0);
  readonly room = signal<RoomRecord | null>(null);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly action = signal(false);

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const roomId = Number(this.route.snapshot.paramMap.get('roomId'));

    if (propertyId <= 0 || roomId <= 0) {
      this.error.set('معرف العقار أو الغرفة غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);
    this.roomId.set(roomId);

    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.api
      .getRoom(this.roomId(), this.propertyId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.room.set(response.data);
          } else {
            this.error.set(
              propertyErrorMessage(response, 'تعذر تحميل الغرفة.'),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر تحميل الغرفة.'),
          );
        },
      });
  }

  edit(): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'rooms',
      this.roomId(),
      'edit',
    ]);
  }

  deactivate(): void {
    const room = this.room();

    if (!room || !confirm(`تأكيد تعطيل الغرفة ${room.roomNumber}؟`)) {
      return;
    }

    this.action.set(true);

    this.api
      .deactivateRoom(this.propertyId(), room.id, {
        expectedRowVersion: room.rowVersion,
      })
      .pipe(finalize(() => this.action.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success.set(response.message || 'تم تعطيل الغرفة.');
          } else {
            this.error.set(
              propertyErrorMessage(response, 'تعذر تعطيل الغرفة.'),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر تعطيل الغرفة.'),
          );
        },
      });
  }
}
