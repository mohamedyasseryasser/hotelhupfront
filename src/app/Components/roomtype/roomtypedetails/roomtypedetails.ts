import { Component, inject, OnInit, signal } from '@angular/core';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { RoomTypeRecord } from '../../../Models/roomtype';
import { finalize } from 'rxjs';

@Component({
  imports: [CommonModule, DecimalPipe, RouterLink],
  selector: 'app-roomtypedetails',
  styleUrl: './roomtypedetails.css',
  templateUrl: './roomtypedetails.html',
})
export class Roomtypedetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Roomtypeservice);
  readonly permissions = inject(Permissionservice);
  readonly propertyId = signal(0);
  readonly typeId = signal(0);
  readonly type = signal<RoomTypeRecord | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly action = signal(false);

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));
    const typeId = Number(this.route.snapshot.paramMap.get('typeId'));
   
    if (propertyId <= 0 || typeId <= 0) {
      this.error.set('معرف العقار أو نوع الغرفة غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);
    this.typeId.set(typeId);

    this.load();
  }

  load(): void {
    this.loading.set(true);
  console.log(this.typeId() )
    this.api
      .getRoomType(this.typeId(),true)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
             this.type.set(response.data);
          } else {
             this.error.set(
              propertyErrorMessage(
                response,
                'تعذر تحميل نوع الغرفة.',
              ),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر تحميل نوع الغرفة.'),
          );
        },
      });
  }

  edit(): void {
    void this.router.navigate([
      '/properties',
      this.propertyId(),
      'room-types',
      this.typeId(),
      'edit',
    ]);
  }

  deactivate(): void {
    const roomType = this.type();

    if (
      !roomType ||
      !confirm(`تأكيد تعطيل نوع الغرفة «${roomType.name}»؟`)
    ) {
      return;
    }

    this.action.set(true);

    this.api
      .deactivateRoomType(roomType.id, roomType.rowVersion)
      .pipe(finalize(() => this.action.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success.set(response.message || 'تم تعطيل النوع.');
          } else {
            this.error.set(
              propertyErrorMessage(response, 'تعذر التعطيل.'),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر التعطيل.'),
          );
        },
      });
  }
}