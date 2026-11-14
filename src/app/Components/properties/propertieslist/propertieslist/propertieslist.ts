 import { Component, inject, OnInit, signal } from '@angular/core';
import { Userservice } from '../../../../Service/userservice';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
 import { finalize, switchMap, tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Propertyservice } from '../../../../Service/propertyservice';
import { PropertyListData, PropertyRecord, PropertySortBy, PropertyStatus } from '../../../../Models/property';
import { Permissionservice } from '../../../../Service/permissionservice';
import { propertyErrorMessage } from '../../../../errors/propertyerror';
import { Authservice } from '../../../../Service/authservice';
@Component({
 imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],  selector: 'app-propertieslist',
  styleUrl: './propertieslist.css',
  templateUrl: './propertieslist.html',
})
export class Propertieslist implements OnInit {readonly PropertyStatus = PropertyStatus;

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(Propertyservice);
  private readonly router = inject(Router);
 readonly  usercurrnet=inject(Authservice)
 readonly permissions = inject(Permissionservice);
   readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly actionId = signal<number | null>(null);

  readonly page = signal<PropertyListData>({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  readonly filters = this.fb.nonNullable.group({
    search: [''],
    status: ['all'],
    sortBy: ['Name'],
    descending: [true],
  });

  ngOnInit(): void {
  
    console.log(this.usercurrnet.readSession()?.user.roles.map((role)=>{return role.roleId}))
     this.loadProperties();
  }

 loadProperties(page = 1): void {
  this.loading.set(true);
  this.error.set('');

  const values = this.filters.getRawValue();
//console.log(this.usercurrnet.isAuthenticated)
  this.api
    .getProperties({
      page,
      pageSize: 10,
      search: values.search || undefined,
     status:
  values.status === 'all'
    ? undefined
    : (Number(values.status) as PropertyStatus),

      sortBy: values.sortBy as PropertySortBy,
      descending: values.descending,
    })
    .pipe(
       finalize(() => this.loading.set(false)),
    )
    .subscribe({

      next: (response) => {
        console.log(response.data);
        if (response.success && response.data) {
          this.page.set(response.data);
           return;
        }

        // حالة احتياطية فقط
        // لأن success=false المفروض يدخل error
        this.error.set(
          response.message ||
          'تعذر تحميل العقارات.',
        );
      },

      error: (error) => {     
          
          this.error.set(
          propertyErrorMessage(
            error,
            'تعذر تحميل العقارات.',
          ),
        );
      },
    });
}


  resetFilters(): void {
    this.filters.reset({
      search: '',
      status: 'all',
      sortBy: 'Name',
      descending: true,
    });

    this.loadProperties();
  }

  goToCreate(): void {
    void this.router.navigate(['/properties/create']);
  }

activate(item: PropertyRecord): void {
  if (!confirm(`هل تريد تفعيل العقار ${item.name}؟`)) {
    return;
  }

  this.actionId.set(item.id);
  
  this.api
    .activateProperty(
      item.id,
      item.rowVersion,
    )
    .pipe(
      finalize(() => this.actionId.set(null)),
    )
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.notice.set(
            response.message ||
            'تم تفعيل العقار.',
          );

          this.loadProperties(
            this.page().page,
          );

          return;
        }

        this.error.set(
          response.message ||
          'تعذر تفعيل العقار.',
        );
      },

      error: (error) => {
        this.error.set(
          propertyErrorMessage(error),
        );
      },
    });
}

deactivate(item: PropertyRecord): void {
  const reason = prompt(
    'اكتب سبب تعطيل العقار:',
  );

  if (reason === null) {
    return;
  }

  if (reason.trim().length < 2) {
    this.error.set(
      'سبب التعطيل مطلوب ويجب ألا يقل عن حرفين.',
    );
    return;
  }

  if (!confirm(`تأكيد تعطيل العقار ${item.name}؟`)) {
    return;
  }

  this.actionId.set(item.id);

  this.api
    .deactivateProperty(
      item.id,
      item.rowVersion,
      {
        reason: reason.trim(),
      },
    )
    .pipe(
      finalize(() => this.actionId.set(null)),
    )
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.notice.set(
            response.message ||
            'تم تعطيل العقار.',
          );

          this.loadProperties(
            this.page().page,
          );

          return;
        }
         
        this.error.set(
          response.message ||
          'تعذر تعطيل العقار.',
        );
      },

      error: (error) => {
        this.error.set(
          propertyErrorMessage(error),
        );
      },
    });
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
}

