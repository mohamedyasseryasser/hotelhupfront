import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  ChangeDepositPolicyStatusRequest,
  CreateDepositPolicyRequest,
  DepositPolicyListResponse,
  DepositPolicyResponse,
  UpdateDepositPolicyRequest,
} from '../Models/depositpolicy';

@Injectable({ providedIn: 'root' })
export class Propertydepositpolicyservice {
  private readonly http = inject(HttpClient);
  // اسم المسار مطابق حرفيًا لـ [Route("api/v1/propertiesdeposit")] في backend.
  private readonly url = `${environment.apiUrl}/propertiesdeposit`;

  getDepositPolicies(propertyId: number): Observable<DepositPolicyListResponse> {
    return this.http.get<DepositPolicyListResponse>(this.policiesUrl(propertyId));
  }

  getDepositPolicy(propertyId: number, policyId: number): Observable<DepositPolicyResponse> {
    return this.http.get<DepositPolicyResponse>(`${this.policiesUrl(propertyId)}/${policyId}`);
  }

  createDepositPolicy(
    propertyId: number,
    request: CreateDepositPolicyRequest,
  ): Observable<DepositPolicyResponse> {
    return this.http.post<DepositPolicyResponse>(this.policiesUrl(propertyId), request);
  }

  updateDepositPolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    request: UpdateDepositPolicyRequest,
  ): Observable<DepositPolicyResponse> {
    // Controller يستقبل ifmatch كـ query parameter؛ نرسله أيضًا داخل DTO للمحافظة على التوافق.
    const params = new HttpParams().set('ifmatch', rowVersion);
    return this.http.patch<DepositPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}`,
      { ...request, ifMatch: rowVersion },
      { params },
    );
  }

  activateDepositPolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    reason: string,
  ): Observable<DepositPolicyResponse> {
    return this.changeStatus(propertyId, policyId, 'activate', rowVersion, reason, true);
  }

  deactivateDepositPolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    reason: string,
  ): Observable<DepositPolicyResponse> {
    return this.changeStatus(propertyId, policyId, 'deactivate', rowVersion, reason, true);
  }

  private changeStatus(
    propertyId: number,
    policyId: number,
    action: 'activate' | 'deactivate',
    rowVersion: string,
    reason: string,
    confirm: boolean,
  ): Observable<DepositPolicyResponse> {
    const headers = new HttpHeaders({ 'If-Match': rowVersion });
    const request: ChangeDepositPolicyStatusRequest = {
      confirm,
      reason,
      ifMatch: rowVersion,
    };
    return this.http.post<DepositPolicyResponse>(
      `${this.policiesUrl(propertyId)}/${policyId}/${action}`,
      request,
      { headers },
    );
  }

  private policiesUrl(propertyId: number): string {
    return `${this.url}/${propertyId}/deposit-policies`;
  }
}

