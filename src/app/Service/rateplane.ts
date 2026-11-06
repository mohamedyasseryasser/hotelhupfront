import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  CreateRatePlanRequest,
  RatePlanListResponse,
  RatePlanResponse,
  RatePlanVersionResponse,
  RatePlanVersionsResponse,
  UpdateRatePlanRequest,
} from '../Models/rateplane';

@Injectable({ providedIn: 'root' })
export class Rateplanservice {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/rate-plans`;

  getRatePlans(propertyId: number): Observable<RatePlanListResponse> {
    return this.http.get<RatePlanListResponse>(this.url, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }

  getRatePlan(id: number): Observable<RatePlanResponse> {
    return this.http.get<RatePlanResponse>(`${this.url}/${id}`);
  }

  createRatePlan(
    propertyId: number,
    roomTypeId: number,
    request: CreateRatePlanRequest,
  ): Observable<RatePlanResponse> {
    return this.http.post<RatePlanResponse>(this.url, request, {
      params: new HttpParams()
        .set('propertyid', propertyId)
        .set('roomtypeid', roomTypeId),
    });
  }

  updateRatePlan(
    id: number,
    rowVersion: string,
    request: UpdateRatePlanRequest,
  ): Observable<RatePlanResponse> {
    return this.http.patch<RatePlanResponse>(`${this.url}/${id}`, request, {
      headers: new HttpHeaders({ 'If-Match': rowVersion }),
    });
  }

  getVersions(id: number): Observable<RatePlanVersionsResponse> {
    return this.http.get<RatePlanVersionsResponse>(`${this.url}/${id}/versions`);
  }

  getVersion(id: number, versionNumber: number): Observable<RatePlanVersionResponse> {
    return this.http.get<RatePlanVersionResponse>(
      `${this.url}/${id}/versions/${versionNumber}`,
    );
  }
  
  changestateRatePlan(id: number, rowVersion: string, activate: boolean): Observable<RatePlanResponse> {
    return this.http.post<RatePlanResponse>(
      `${this.url}/${id}/${activate ? 'activate' : 'deactivate'}`,
      {},
      { headers: new HttpHeaders({ 'If-Match': rowVersion }) },
    );
  }
}
