import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/auth'; 

import { PropertySettingsResponse } from '../Models/property';


export function propertyErrorMessage(
  error: unknown,
  fallback = 'تعذر تنفيذ العملية.',
): string
{


  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiResponse<unknown>> | undefined;
                                                            
    const backendMessage = body?.message?.trim();

   let backendErrors: string | undefined;

if (body?.errors) {
  const validErrors: string[] = [];

  for (const item of body.errors) {
    if (item && item.trim()) {
      validErrors.push(item);
    }
  }

  if (validErrors.length > 0) {
    backendErrors = validErrors.join('، ');
  }
}

    // Backend message لها الأولوية
    if (backendMessage && backendErrors) {
      return `${backendMessage} ${backendErrors}`;
    }

    if (backendMessage) {
      return backendMessage;
    }

    if (backendErrors) {
      return backendErrors;
    }

    // Fallback فقط إذا لم يرسل Backend رسالة
    if (error.status === 401) {
      return 'انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.';
    }

    if (error.status === 403) {
      return 'ليس لديك صلاحية لتنفيذ هذه العملية.';
    }

    if (error.status === 404) {
      return 'العقار أو الإعدادات غير موجودة.';
    }

    if (error.status === 409) {
      return 'حدث تعارض في البيانات. أعد تحميل الصفحة وحاول مرة أخرى.';
    }

    if (error.status === 428) {
      return 'بيانات التزامن مفقودة. أعد تحميل الصفحة وحاول مرة أخرى.';
    }

    return fallback;
  }

  return error instanceof Error
    ? error.message
    : fallback;
}

//done all
export function normalizeRowVersion(
  value: string | number[] | null | undefined,
): string {
  if (typeof value === 'string') {
    return value;
  }

  if (!value?.length) {
    return '';
  }

  return btoa(String.fromCharCode(...value));
}

export function settingsRowVersion(
  settings: PropertySettingsResponse,
): string {
  return normalizeRowVersion(settings.rowVersion);
}

export function timeSpanToInput(
  value: string | null | undefined,
): string {
  if (!value) {
    return '';
  }

  return value.substring(0, 5);
}


export function inputToTimeSpan(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return value.length === 5
    ? `${value}:00`
    : value;
}
