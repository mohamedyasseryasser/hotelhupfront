import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { RoleOption } from '../../../Models/user';
import { Permissionservice } from '../../../Service/permissionservice';
import { Userservice } from '../../../Service/userservice';
import { userErrorMessage } from '../../../errors/usererror';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-userform',
  styleUrl: './userform.css',
  templateUrl: './userform.html',
})
export class Userform implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(Userservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly permissions = inject(Permissionservice);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly rolesLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly rolesError = signal('');
  readonly success = signal('');
  readonly userId = signal('');
  readonly roles = signal<RoleOption[]>([]);
  readonly propertyIdquery = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(256)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    address: ['', [Validators.maxLength(1000)]],
    propertyId: ['', [Validators.pattern(/^[1-9]\d*$/)]],
    password: ['', [Validators.minLength(6), Validators.maxLength(128)]],
    roleId: ['', Validators.required],
  });

  private initialRoleId = '';
  private initialPropertyId: number | null = null;

  ngOnInit(): void {
    if (this.router.url.includes('users/create')) {
      const propertyId = this.route.snapshot.queryParamMap.get('propertyId');
      if (
        propertyId === null ||
        !Number.isInteger(Number(propertyId)) ||
        Number(propertyId) <= 0
      ) {
        this.error.set('يجب تحديد عقار صحيح لإنشاء المستخدم.');
        return;
      }

      this.propertyIdquery.set(propertyId);
      this.form.patchValue({ propertyId });
    }

    if (this.router.url.includes('/edit')) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEdit.set(true);
        this.userId.set(id);
        this.form.controls.userName.disable();
        this.form.controls.password.clearValidators();
        this.loadUser(id);
      }
    }

    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesLoading.set(true);
    this.rolesError.set('');

    this.api.getRoles({ pageNumber: 1, pageSize: 100, isActive: true })
      .pipe(finalize(() => this.rolesLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Keep inactive roles out of the selector even if the API ignores the filter.
            this.roles.set(response.data.items.filter((role) => role.isActive));
          } else {
            this.rolesError.set(response.message || 'تعذر تحميل الأدوار.');
          }
        },
        error: (error) => this.rolesError.set(userErrorMessage(error, 'تعذر تحميل الأدوار.')),
      });
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.api.getUserById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(response.message || 'تعذر تحميل المستخدم.');
          return;
        }

        const roleId = response.data.roles[0]?.roleId ?? '';
        this.initialRoleId = roleId;
        this.initialPropertyId = response.data.propertyId;
        this.form.patchValue({
          userName: response.data.userName,
          email: response.data.email ?? '',
          fullName: response.data.fullName,
          address: response.data.address ?? '',
          propertyId: response.data.propertyId ? String(response.data.propertyId) : '',
          roleId,
        });
      },
      error: (error) => this.error.set(userErrorMessage(error, 'تعذر تحميل المستخدم.')),
    });
  }

  submit(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const roleIds = value.roleId ? [value.roleId] : [];

    this.saving.set(true);
    const propertyId = value.propertyId.trim()
      ? Number(value.propertyId.trim())
      : null;
    const roleChanged = value.roleId !== this.initialRoleId;
    const propertyChanged = propertyId !== this.initialPropertyId;

    const request$ = this.isEdit()
      ? this.api.updateUser(this.userId(), {
          email: value.email,
          fullName: value.fullName,
          address: value.address,
        }).pipe(
          switchMap((response) => {
            if (
              !response.success ||
              !this.permissions.canAssignRole() ||
              (!roleChanged && !propertyChanged)
            ) {
              return [response];
            }
            return this.api.replaceRoles(this.userId(), roleIds, propertyId);
          }),
        )
      : this.api.createUser({
          userName: value.userName,
          email: value.email,
          fullName: value.fullName,
          address: value.address || null,
          propertyId: value.propertyId ? Number(value.propertyId) : null,
          password: value.password,
          roleIds,
        });

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        if (response.success) {
          this.success.set(response.message || 'تم الحفظ بنجاح.');
setTimeout(() => {
  void this.router.navigate(['/users'], {
    queryParams: {
      propertyId: this.propertyIdquery()
    }
  });
}, 700);        } else {
          this.error.set(response.errors.join('، ') || response.message);
        }
      },
      error: (error) => this.error.set(userErrorMessage(error, 'تعذر حفظ المستخدم أو أدواره.')),
    });
  }

  createqueryparam(): void {
    const propertyId = this.form.controls.propertyId.value;
    void this.router.navigate(['/users'], {
      queryParams: propertyId ? { propertyId } : {},
    });
  }
}
