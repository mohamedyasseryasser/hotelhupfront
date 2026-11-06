 import { Component, inject, OnInit, signal } from '@angular/core';
import { Userservice } from '../../../Service/userservice';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PagedResponse, RoleOption, UserListQuery, UserRecord } from '../../../Models/user';
import { finalize, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Permissionservice } from '../../../Service/permissionservice';
import { userErrorMessage } from '../../../errors/usererror';
@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-userslist',
  styleUrl: './userslist.css',
  templateUrl: './userslist.html',
})
export class Userslist implements OnInit {
readonly queryPropertyId = signal<number | null>(null);
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersApi = inject(Userservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly permissions = inject(Permissionservice);
  readonly loading = signal(false); 
  readonly error = signal('');
   readonly notice = signal('');
  readonly page = signal<PagedResponse<UserRecord>>({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
  readonly actionId = signal<string | null>(null);
  readonly filters = this.formBuilder.nonNullable.
  group
  ({ 
    userName: [''], 
    fullName: [''],
     isActive: ['all'],
      propertyId: [null as number | null],
       roleId: [''],
        createdFrom: [''],
         createdTo: [''] });
ngOnInit(): void {
  this.route.queryParamMap.subscribe((params) => {
    const rawPropertyId = params.get('propertyId');
    const parsedId = rawPropertyId === null ? NaN : Number(rawPropertyId);
     if (rawPropertyId === null ) {
    this.error.set('يجب تحديد العقار لإنشاء المستخدم.');
    return;
  }
    const propertyId =
      Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
  if (propertyId === null  ||propertyId<=0 
  ) {
    this.error.set('يجب تحديد العقار لإنشاء المستخدم.');
    return;
  }
    this.queryPropertyId.set(propertyId);
    
    this.filters.patchValue({ propertyId : propertyId });
    this.loadUsers();
  });
}

loadUsers(pageNumber = 1): void {
  this.loading.set(true);
  this.error.set('');

  const value = this.filters.getRawValue();

  const query: UserListQuery = {
    pageNumber,
    pageSize: 10,
    userName: value.userName || undefined,
    fullName: value.fullName || undefined,
    isActive:
      value.isActive === 'all'
        ? undefined
        : value.isActive === 'active',
   // propertyId: value.propertyId
     // ? Number(value.propertyId)
     // : undefined,
    propertyId:this.queryPropertyId()!,
     roleId: value.roleId || undefined,
    createdFrom: value.createdFrom || undefined,
    createdTo: value.createdTo || undefined,
  };

  this.usersApi
    .getUsers(query)
    .pipe(
      finalize(() => this.loading.set(false)),
    )
    .subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.page.set(response.data);
        } else {
          this.error.set(
            response.message || 'تعذر تحميل المستخدمين.',
          );
        }
      },
      error: (err) => {
        this.error.set(
          userErrorMessage(err, 'تعذر تحميل المستخدمين.'),
        );
      },
    });
}

resetFilters(): void {
  this.filters.reset({
    userName: '',
    fullName: '',
    isActive: 'all',
    propertyId: this.queryPropertyId(),
    roleId: '',
    createdFrom: '',
    createdTo: '',
  });

  this.loadUsers();
}

confirmStatusChange(user: UserRecord): void {
  const action = user.isActive ? 'تعطيل' : 'تفعيل';

  if (
    !confirm(
      `هل تريد ${action} المستخدم ${user.fullName || user.userName}؟`,
    )
  ) {
    return;
  }

  this.actionId.set(user.userId);
  this.notice.set('');

  const request$ = user.isActive
    ? this.usersApi.deactivateUser(user.userId)
    : this.usersApi.activateUser(user.userId);

  request$
    .pipe(
      finalize(() => this.actionId.set(null)),
    )
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.notice.set(
            response.message || 'تم تحديث حالة المستخدم.',
          );

          this.loadUsers(this.page().pageNumber);
        } else {
          this.error.set(response.message);
        }
      },
      error: (err) => {
        this.error.set(userErrorMessage(err));
      },
    });
}

goToCreate(): void {
  const propertyId = this.queryPropertyId();
  console.log(propertyId)
  if (propertyId === null ) {
    this.error.set('يجب تحديد العقار لإنشاء المستخدم.');
    return;
  }

  if (this.filters.invalid) {
    this.filters.markAllAsTouched();
    return;
  }
  void this.router.navigate([
    '/users/create',

  ],{queryParams:{propertyId}});
}
}
