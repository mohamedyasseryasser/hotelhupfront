import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authservice } from '../../Service/authservice';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
 @Component({
  imports: [ReactiveFormsModule],
  selector: 'app-auth',
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth 
{
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(Authservice);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly isArabic = signal(true);
  readonly loginForm = this.formBuilder.nonNullable.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  toggleLanguage(): void {
    this.isArabic.update((value) => !value);
  }

  submit(): void {
    this.errorMessage.set('');
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    } 
    this.isLoading.set(true);
    this.auth.login(this.loginForm.getRawValue()).
        pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: (response) => {
        if (!response.success || !response.data) {
           this.errorMessage.set(this.messageFor(response.message));
          return;
        }    
           const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          void this.router.navigateByUrl(returnUrl);
        
      },
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.errorMessage.set(this.messageFor(error.error?.message || error.message || ''));
      },
    });
  }

  message(key: string): string {
    const dictionary: Record<string, [string, string]> = {
      title: ['مرحبًا بعودتك', 'Welcome back'],
      subtitle: ['سجّل الدخول إلى لوحة HotelHup', 'Sign in to your HotelHup workspace'],
      username: ['اسم المستخدم', 'Username'],
      password: ['كلمة المرور', 'Password'],
      submit: ['تسجيل الدخول', 'Sign in'],
      signingIn: ['جارٍ تسجيل الدخول...', 'Signing in...'],
      required: ['هذا الحقل مطلوب', 'This field is required'],
      invalid: ['اسم المستخدم أو كلمة المرور غير صحيحة.', 'Invalid username or password.'],
      session: ['انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.', 'Your session expired. Please sign in again.'],
      language: ['English', 'العربية'],
    };
    return dictionary[key]?.[this.isArabic() ? 0 : 1] ?? key;
  }

  private messageFor(message: string): string {
    if (message.toLowerCase().includes('session-expired') || message.toLowerCase().includes('refresh')) {
      return this.message('session');
    }
    return message || this.message('invalid');
  }
}
