import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  inject,
  Injectable,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../environments/environment.development';

import {
  CancellationPolicyListResponse,
  CancellationPolicyResponse,
  ChangeCancellationPolicyStatusRequest,
  CreateCancellationPolicyRequest,
  UpdateCancellationPolicyRequest,
} from '../Models/cancellationpolicy';

@Injectable({
  providedIn: 'root',
})
export class Cancellationpolicy {
  private readonly http =
    inject(HttpClient);

  /*
   * المسار مطابق لـ:
   *
   * [Route("api/v1/propertiecancellationpolicy")]
   */
  private readonly url =
    `${environment.apiUrl}/propertiecancellationpolicy`;

  /**
   * جلب Cancellation Policies.
   *
   * عند وجود validFrom:
   * يتم إرسال:
   * ?validFrom=...
   *
   * عند عدم وجوده:
   * لا يتم إرسال Query Parameter نهائيًا.
   */
  getPolicies(
    propertyId: number,
    validFrom?: string | null,
  ): Observable<CancellationPolicyListResponse> {
    const params =
      this.buildValidFromParams(validFrom);

    return this.http.get<CancellationPolicyListResponse>(
      this.policiesUrl(propertyId),
      {
        params,
      },
    );
  }

  getPolicy(
    propertyId: number,
    policyId: number,
  ): Observable<CancellationPolicyResponse> {
    return this.http.get<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}`,
    );
  }

  createPolicy(
    propertyId: number,
    request: CreateCancellationPolicyRequest,
  ): Observable<CancellationPolicyResponse> {
    return this.http.post<CancellationPolicyResponse>(
      this.policiesUrl(propertyId),
      request,
    );
  }

  updatePolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    request: UpdateCancellationPolicyRequest,
  ): Observable<CancellationPolicyResponse> {
    const params =
      new HttpParams()
        .set('ifmatch', rowVersion);

    return this.http.patch<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}`,
      request,
      {
        params,
      },
    );
  }

  activatePolicy(
    propertyId: number,
    policyId: number,
    request: ChangeCancellationPolicyStatusRequest,
  ): Observable<CancellationPolicyResponse> {
    return this.http.post<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}/activate`,
      request,
    );
  }

  deactivatePolicy(
    propertyId: number,
    policyId: number,
    request: ChangeCancellationPolicyStatusRequest,
  ): Observable<CancellationPolicyResponse> {
    return this.http.post<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}/deactivate`,
      request,
    );
  }

  /**
   * إضافة validFrom فقط إذا كانت له قيمة صحيحة.
   *
   * لا نرسل:
   * - null
   * - undefined
   * - string فارغة
   */
  private buildValidFromParams(
    validFrom?: string | null,
  ): HttpParams {
    let params =
      new HttpParams();

    if (
      validFrom !== null &&
      validFrom !== undefined &&
      validFrom.trim().length > 0
    ) {
      params =
        params.set(
          'validFrom',
          validFrom,
        );
    }

    return params;
  }

  private policiesUrl(
    propertyId: number,
  ): string {
    return `${this.url}/${propertyId}/cancellation-policies`;
  }
}
