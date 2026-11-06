import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  AvailabilityRequest, AvailabilityResponse, CancelReservationRequest, CheckInRequest, CheckOutRequest,
  ConfirmReservationRequest, CreateReservationRequest, EarlyCheckoutRequest, ExtendCheckoutRequest,
  NoShowRequest, ReservationActionResponseEnvelope, ReservationHistoryResponse, ReservationListResponse,
  ReservationResponse, ReservationSearchRequest, AssignRoomRequest, UpdateReservationRequest,
} from '../Models/reservation';

@Injectable({ providedIn: 'root' })
export class Reservationservice {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private params(values: object): HttpParams {
    let params = new HttpParams();
    Object.entries(values as Record<string, string | number | boolean | null | undefined>).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return params;
  }

  searchAvailability(request: AvailabilityRequest): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.baseUrl}/availability`, { params: this.params(request) });
  }

  list(request: ReservationSearchRequest): Observable<ReservationListResponse> {
    return this.http.get<ReservationListResponse>(`${this.baseUrl}/reservations`, { params: this.params(request) });
  }

  get(propertyId: number, id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.baseUrl}/reservations/${id}`, { params: this.params({ propertyId }) });
  }

  getStatusHistory(propertyId: number, id: number): Observable<ReservationHistoryResponse> {
    return this.http.get<ReservationHistoryResponse>(`${this.baseUrl}/reservations/${id}/status-history`, { params: this.params({ propertyId }) });
  }

  create(request: CreateReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.baseUrl}/reservations`, request);
  }

  update(propertyId: number, id: number, request: UpdateReservationRequest): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.baseUrl}/reservations/${id}`, request, { params: this.params({ propertyId }) });
  }

  confirm(propertyId: number, id: number, request: ConfirmReservationRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/confirm`, request, { params: this.params({ propertyId }) });
  }

  cancel(propertyId: number, id: number, request: CancelReservationRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/cancel`, request, { params: this.params({ propertyId }) });
  }

  noShow(propertyId: number, id: number, request: NoShowRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/no-show`, request, { params: this.params({ propertyId }) });
  }

  assignRoom(propertyId: number, id: number, request: AssignRoomRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/rooms`, request, { params: this.params({ propertyId }) });
  }

  releaseRoom(propertyId: number, id: number, reservationRoomId: number): Observable<ReservationActionResponseEnvelope> {
    return this.http.delete<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/rooms/${reservationRoomId}`, { params: this.params({ propertyId }) });
  }

  checkIn(propertyId: number, id: number, request: CheckInRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/check-in`, request, { params: this.params({ propertyId }) });
  }

  checkOut(propertyId: number, id: number, request: CheckOutRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/check-out`, request, { params: this.params({ propertyId }) });
  }

  extendCheckout(propertyId: number, id: number, request: ExtendCheckoutRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/extend-checkout`, request, { params: this.params({ propertyId }) });
  }

  earlyCheckout(propertyId: number, id: number, request: EarlyCheckoutRequest): Observable<ReservationActionResponseEnvelope> {
    return this.http.post<ReservationActionResponseEnvelope>(`${this.baseUrl}/reservations/${id}/early-checkout`, request, { params: this.params({ propertyId }) });
  }
}
