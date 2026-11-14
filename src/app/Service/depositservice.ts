import {
  HttpClient,
  HttpHeaders,
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
  ChangeDepositPolicyStatusRequest,
  CreateDepositPolicyRequest,
  DepositPolicyListResponse,
  DepositPolicyResponse,
  UpdateDepositPolicyRequest,
} from '../Models/depositpolicy';

@Injectable({
  providedIn: 'root',
})
export class Propertydepositpolicyservice {
  private readonly http =
    inject(HttpClient);

  private readonly url =
    `${environment.apiUrl}/propertiesdeposit`;

  /**
   * جلب كل Deposit Policies.
   *
   * إذا كانت validFrom موجودة:
   * يتم إرسالها في Query String.
   *
   * إذا لم تكن موجودة:
   * لا يتم إرسال validFrom نهائيًا.
   */
  getDepositPolicies(
    propertyId: number,
    validFrom?: string | null,
  ): Observable<DepositPolicyListResponse> {
    const params =
      this.buildValidFromParams(validFrom);

    return this.http.get<DepositPolicyListResponse>(
      this.policiesUrl(propertyId),
      {
        params,
      },
    );
  }

  getDepositPolicy(
    propertyId: number,
    policyId: number,
  ): Observable<DepositPolicyResponse> {
    return this.http.get<DepositPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}`,
    );
  }

  createDepositPolicy(
    propertyId: number,
    request: CreateDepositPolicyRequest,
  ): Observable<DepositPolicyResponse> {
    return this.http.post<DepositPolicyResponse>(
      this.policiesUrl(propertyId),
      request,
    );
  }

  updateDepositPolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    request: UpdateDepositPolicyRequest,
  ): Observable<DepositPolicyResponse> {
    const params =
      new HttpParams()
        .set('ifmatch', rowVersion);

    return this.http.patch<DepositPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}`,
      {
        ...request,
        ifMatch: rowVersion,
      },
      {
        params,
      },
    );
  }

  activateDepositPolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    reason: string,
  ): Observable<DepositPolicyResponse> {
    return this.changeStatus(
      propertyId,
      policyId,
      'activate',
      rowVersion,
      reason,
      true,
    );
  }

  deactivateDepositPolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    reason: string,
  ): Observable<DepositPolicyResponse> {
    return this.changeStatus(
      propertyId,
      policyId,
      'deactivate',
      rowVersion,
      reason,
      true,
    );
  }

  private changeStatus(
    propertyId: number,
    policyId: number,
    action: 'activate' | 'deactivate',
    rowVersion: string,
    reason: string,
    confirm: boolean,
  ): Observable<DepositPolicyResponse> {
    const headers =
      new HttpHeaders({
        'If-Match': rowVersion,
      });

    const request:
      ChangeDepositPolicyStatusRequest = {
        confirm,
        reason,
        ifMatch: rowVersion,
      };

    return this.http.post<DepositPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}/${action}`,
      request,
      {
        headers,
      },
    );
  }

  /**
   * يبني Query Params بطريقة آمنة.
   *
   * عند وجود validFrom:
   * ?validFrom=2026-11-30T00:00:00Z
   *
   * عند عدم وجود validFrom:
   * لا يتم إنشاء Parameter باسم validFrom.
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
    return `${this.url}/${propertyId}/deposit-policies`;
  }
}
