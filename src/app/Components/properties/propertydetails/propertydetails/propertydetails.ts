 import { Component, inject, OnInit, signal } from '@angular/core';
import { Userservice } from '../../../../Service/userservice';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
 import { finalize, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Propertyservice } from '../../../../Service/propertyservice';
import { PropertyListData, PropertyRecord, PropertySortBy, PropertyStatus } from '../../../../Models/property';
import { readonly } from '@angular/forms/signals';
import { Permissionservice } from '../../../../Service/permissionservice';
import { propertyErrorMessage } from '../../../../errors/propertyerror';
import { Authservice } from '../../../../Service/authservice';
@Component({
 imports: [
    CommonModule,
    RouterLink,
  ],  selector: 'app-propertydetails',
  styleUrl: './propertydetails.css',
  templateUrl: './propertydetails.html',
})
export class Propertydetailsimplements implements OnInit {
  private readonly api = inject(Propertyservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
 readonly PropertyStatus = PropertyStatus;

  readonly permissions = inject(Permissionservice); 
readonly  usercurrnet=inject(Authservice)

  readonly property = signal<PropertyRecord | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly actionId = signal(0);
 readonly isadmin=signal<boolean>(false);
  ngOnInit(): void {
   this.isadmin.set(this.usercurrnet.hasRole('Admin'));
    this.load();
  }

logout(): void {
    this.usercurrnet.logout().subscribe({
      next: () =>
        void this.router.navigate(['/login']),

      error: () => {
        this.usercurrnet.clearSession();
        void this.router.navigate(['/login']);
      },
    });
  }

  load(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id'),
    );

    if (!id) {
      this.error.set('معرف العقار غير صحيح.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.api
      .getPropertyById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            console.log(typeof(response.data.status))
            this.property.set(response.data);
            return;
          }
           this.error.set(
            propertyErrorMessage(
              response,
              'تعذر تحميل العقار.',
            ),
          );
        },

        error: (error) => {
           this.error.set(
            propertyErrorMessage(
              error,
              'تعذر تحميل العقار.',
            ),
          );
        },
      });
  }

  activate(): void {
    const property = this.property();

    if (
      !property ||
      !confirm(`هل تريد تفعيل العقار ${property.name}؟`)
    ) {
      return;
    }

    this.actionId.set(property.id);

    this.api
      .activateProperty(
        property.id,
        property.rowVersion,
      )
      .pipe(
        finalize(() => this.actionId.set(0)),
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.load();
            return;
          }

          this.error.set(
            propertyErrorMessage(
              response,
              'تعذر تفعيل العقار.',
            ),
          );
        },

        error: (error) => {
          this.error.set(
            propertyErrorMessage(error),
          );
        },
      });
  }

  deactivate(): void {
    const property = this.property();

    if (!property) {
      return;
    }

    const reason = prompt('اكتب سبب تعطيل العقار:');

    if (
      reason === null ||
      reason.trim().length < 2
    ) {
      if (reason !== null) {
        this.error.set(
          'سبب التعطيل مطلوب ويجب ألا يقل عن حرفين.',
        );
      }

      return;
    }

    if (!confirm(`تأكيد تعطيل العقار ${property.name}؟`)) {
      return;
    }

    this.actionId.set(property.id);

    this.api
      .deactivateProperty(
        property.id,
        property.rowVersion,
        {
          reason: reason.trim(),
        },
      )
      .pipe(
        finalize(() => this.actionId.set(0)),
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.load();
            return;
          }

          this.error.set(
            propertyErrorMessage(
              response,
              'تعذر تعطيل العقار.',
            ),
          );
        },

        error: (error) => {
          this.error.set(
            propertyErrorMessage(error),
          );
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/properties']);
  }
}
