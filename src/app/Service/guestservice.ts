import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  AnonymizeGuestRequest,
  DeactivateGuestRequest,
  GuestFormRequest,
  GuestHistoryResponse,
  GuestListQuery,
  GuestListResponse,
  GuestResponse,
  UpdateGuestRequest,
} from '../Models/guest';

@Injectable({ providedIn: 'root' })
export class Guestservice {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/guests`;

  getGuests(propertyId: number, query: GuestListQuery): Observable<GuestListResponse> {
    let params = new HttpParams()
      .set('propertyid', propertyId)
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize)
      .set('SortBy', query.sortBy)
      .set('SortDirection', query.sortDirection);

    if (query.search) params = params.set('Search', query.search);
    if (query.isActive !== undefined) params = params.set('IsActive', query.isActive);

    return this.http.get<GuestListResponse>(this.url, { params });
  }

  getGuest(propertyId: number, id: number): Observable<GuestResponse> {
    return this.http.get<GuestResponse>(`${this.url}/${id}`, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }

  createGuest(propertyId: number, request: GuestFormRequest): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(this.url, request, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }

  updateGuest(
    propertyId: number,
    id: number,
    request: UpdateGuestRequest,
  ): Observable<GuestResponse> {
    return this.http.patch<GuestResponse>(`${this.url}/${id}`, request, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }

  deactivateGuest(
    propertyId: number,
    id: number,
    request: DeactivateGuestRequest,
  ): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(`${this.url}/${id}/deactivate`, request, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }

  anonymizeGuest(
    propertyId: number,
    id: number,
    request: AnonymizeGuestRequest,
  ): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(`${this.url}/${id}/anonymize`, request, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }

  getReservationHistory(propertyId: number, id: number): Observable<GuestHistoryResponse> {
    return this.http.get<GuestHistoryResponse>(`${this.url}/${id}/reservations`, {
      params: new HttpParams().set('propertyid', propertyId),
    });
  }
}
