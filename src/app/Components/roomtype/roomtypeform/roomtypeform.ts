import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { propertyErrorMessage } from '../../../errors/propertyerror';
import { Roomtypeservice } from '../../../Service/roomtypeservice';
import { CreateRoomTypeRequest, RoomTypeRecord } from '../../../Models/roomtype';
import { finalize } from 'rxjs';
import { Permissionservice } from '../../../Service/permissionservice';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-roomtypeform',
  styleUrl: './roomtypeform.css',
  templateUrl: './roomtypeform.html',
})
export class Roomtypeform  implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Roomtypeservice);
  readonly propertyId = signal(0);
  readonly type = signal<RoomTypeRecord | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
readonly permissions = inject(Permissionservice);
readonly isEdit = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
      ],
    ],
    maxAdults: [1, [Validators.required, Validators.min(1)]],
    maxChildren: [0, [Validators.required, Validators.min(0)]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const propertyId = Number(this.route.snapshot.paramMap.get('id'));

    if (propertyId <= 0) {
      this.error.set('معرف العقار غير صحيح.');
      return;
    }

    this.propertyId.set(propertyId);
     const typeId = Number(this.route.snapshot.paramMap.get('typeId'));

    if (typeId > 0) {  this.isEdit.set(true);

      this.loading.set(true);

      this.api
        .getRoomType(typeId,false)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            if (!response.success || !response.data) {
              console.log(response)
              this.error.set(
                propertyErrorMessage(response, 'تعذر تحميل النوع.'),
              );
              return;
            }

            this.type.set(response.data);

            this.form.patchValue({
              name: response.data.name,
              maxAdults: response.data.maxAdults,
              maxChildren: response.data.maxChildren,
              basePrice: response.data.basePrice,
              description: response.data.description || '',
            });
          },
          error: (error) => {
            this.error.set(
              propertyErrorMessage(error, 'تعذر تحميل النوع.'),
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

    const request: CreateRoomTypeRequest = {
      name: value.name.trim(),
      maxAdults: Number(value.maxAdults),
      maxChildren: Number(value.maxChildren),
      basePrice: Number(value.basePrice),
      description: value.description.trim() || null,
    };

    const currentType = this.type();
if (this.isEdit() && !currentType) {
  this.error.set(
    'تعذر تحديد نوع الغرفة المطلوب تعديله.',
  );
  return;
}
    const call =this.isEdit()&& currentType
      ? this.api.updateRoomType(
          currentType.id,
          currentType.rowVersion,
          request,
        )
      : this.api.createRoomType(this.propertyId(), request);

    this.saving.set(true);

    call
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            console.log(response.data) 
            void this.router.navigate([
              '/properties',
              this.propertyId(),
              'room-types',
              response.data.id,
            ]);
          } else {
            this.error.set(
              propertyErrorMessage(
                response,
                'تعذر حفظ نوع الغرفة.',
              ),
            );
          }
        },
        error: (error) => {
          this.error.set(
            propertyErrorMessage(error, 'تعذر حفظ نوع الغرفة.'),
          );
        },
      });
  }
}
