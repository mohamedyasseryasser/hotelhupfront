import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Roomservice } from '../../../Service/roomservice';
import { Permissionservice } from '../../../Service/permissionservice';
import { CreateRoomRequest, RoomRecord } from '../../../Models/room';
import { finalize } from 'rxjs';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoomTypeRecord } from '../../../Models/roomtype';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-roomform',
  styleUrl: './roomform.css',
  templateUrl: './roomform.html',
})
export class Roomform  implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly isEdit =signal<boolean>(false);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Roomservice);
  private readonly typesApi = inject(Roomtypeservice);
  readonly propertyId = signal(0);
  readonly room = signal<RoomRecord | null>(null);
  readonly types = signal<RoomTypeRecord[]>([]);
  readonly loading = signal(false);
  readonly permissions=inject(Permissionservice);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    roomNumber: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
      ],
    ],
    roomTypeId: [0, [Validators.required, Validators.min(1)]],
    pricePerNight: [0, [Validators.required, Validators.min(0)]],
  });
  
  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));

    if (propertyId <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);

    this.typesApi.getRoomTypes(propertyId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.types.set(response.data);
        }
      },
      error: () => {},
    });

    const roomId = Number(this.route.snapshot.paramMap.get('roomId'));

    if (roomId > 0) {
      this.loading.set(true);
      this.isEdit.set(true);
      this.api
        .getRoom(roomId, propertyId)
        .pipe(finalize(() =>
         this.loading.set(false) 
         ))
        .subscribe({
          next: (response) => {
            if (!response.success || !response.data) {
              this.error.set(
                propertyErrorMessage(response, 'تعذر تحميل الغرفة.'),
              );
              return;
            }

            this.room.set(response.data);

            this.form.patchValue({
              roomNumber: response.data.roomNumber,
              roomTypeId: response.data.roomTypeId,
              pricePerNight: response.data.pricePerNight,
            });
          },
          error: (error) => {
            this.error.set(
              propertyErrorMessage(error, 'تعذر تحميل الغرفة.'),
            );
          },
        });
    }
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    
    const value = this.form.getRawValue();

    const request: CreateRoomRequest = {
      roomNumber: value.roomNumber.trim(),
      roomTypeId: Number(value.roomTypeId),
      pricePerNight: Number(value.pricePerNight),
    };

    const currentRoom = this.room();

    const call =this.isEdit()&& currentRoom
      ?
       this.api.updateRoom(this.propertyId(), currentRoom.id, {
          ...request,
          expectedRowVersion: currentRoom.rowVersion,
        })
      : this.api.createRoom(this.propertyId(), request);

    this.saving.set(true);

    call
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            void this.router.navigate([
              '/properties',
              this.propertyId(),
              'rooms',
              response.data.id,
            ]);
          } else {
            this.error.set(
              propertyErrorMessage(response, 'تعذر حفظ الغرفة.'),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر حفظ الغرفة.'),
          );
        },
      });
  }
}
