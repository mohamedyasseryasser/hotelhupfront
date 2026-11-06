import {  Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  CancellationPolicyListResponse,
  CancellationPolicyResponse,
  ChangeCancellationPolicyStatusRequest,
  CreateCancellationPolicyRequest,
  UpdateCancellationPolicyRequest,
} from '../Models/cancellationpolicy';
@Injectable({providedIn:'root'})
export class Cancellationpolicy {
  private readonly http = inject(HttpClient );
  // المسار مطابق لـ [Route] في CancellationPoicyController كما هو في backend.
  private readonly url = `${environment.apiUrl}/propertiecancellationpolicy`;

  getPolicies(propertyId: number): Observable<CancellationPolicyListResponse> {
    return this.http.get<CancellationPolicyListResponse>(this.policiesUrl(propertyId ));
  }

  getPolicy(propertyId: number, policyId: number): Observable<CancellationPolicyResponse> {
    return this.http.get<CancellationPolicyResponse>(`${this.policiesUrl(propertyId )}/${policyId}`);
  }

  createPolicy(
    propertyId: number,
    request: CreateCancellationPolicyRequest,
  ): Observable<CancellationPolicyResponse> {
    return this.http.post<CancellationPolicyResponse>(this.policiesUrl(propertyId ), request);
  }

  updatePolicy(
    propertyId: number,
    policyId: number,
    rowVersion: string,
    request: UpdateCancellationPolicyRequest,
  ): Observable<CancellationPolicyResponse> {
    const params = new HttpParams().set('ifmatch', rowVersion);
    return this.http.patch<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId )}/${policyId}`,
      request,
      { params },
    );
  }

  activatePolicy(
    propertyId: number,
    policyId: number,
    request: ChangeCancellationPolicyStatusRequest,
  ): Observable<CancellationPolicyResponse> {
    return this.http.post<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId )}/${policyId}/activate`,
      request,
    );
  }

  deactivatePolicy(
    propertyId: number,
    policyId: number,
    request: ChangeCancellationPolicyStatusRequest,
  ): Observable<CancellationPolicyResponse> {
    return this.http.post<CancellationPolicyResponse>(
      `${this.policiesUrl(propertyId )}/${policyId}/deactivate`,
      request,
    );
  }

  private policiesUrl(propertyId: number): string {
    return `${this.url}/${propertyId}/cancellation-policies`;
  }
}

