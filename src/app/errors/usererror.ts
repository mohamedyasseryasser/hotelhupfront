import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/auth';
export function userErrorMessage(error: unknown, fallback = 'تعذر تنفيذ العملية.'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiResponse<unknown>> | undefined;
    if (error.status === 403) return 'ليس لديك صلاحية لتنفيذ هذه العملية.';
    if (error.status === 404) return 'المستخدم غير موجود أو خارج نطاقك.';
    if (error.status === 409) return body?.message || 'يوجد تعارض: اسم المستخدم مستخدم بالفعل أو حدث تعارض في البيانات.';
    return body?.errors?.join('، ') || body?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
