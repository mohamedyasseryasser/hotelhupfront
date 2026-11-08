import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import {
  CancellationReportRequest, CurrentGuestReportItem, ExpenseReportApiResponse,
  ExpenseReportRequest, HousekeepingReportItem, HousekeepingReportRequest,
  OccupancyReportRequest, OccupancyResponse, PaymentReportItem, PaymentReportRequest,
  RefundReportItem, RefundReportRequest, ReportListResponse, ReservationReportRequest,
  RevenueReportRequest, RevenueResponse, RoomStatusReportItem, RoomStatusReportRequest,
  ArrivalReportItem, DepartureReportItem, CancellationReportItem,
} from '../Models/reports';

@Injectable({ providedIn: 'root' })
export class Reportsservice {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reports`;

  occupancy(request: OccupancyReportRequest) { return this.get<OccupancyResponse>('occupancy', request); }
  revenue(request: RevenueReportRequest) { return this.get<RevenueResponse>('revenue', request); }
  arrivals(request: ReservationReportRequest) { return this.get<ReportListResponse<ArrivalReportItem>>('arrivals', request); }
  departures(request: ReservationReportRequest) { return this.get<ReportListResponse<DepartureReportItem>>('departures', request); }
  currentGuests(request: { propertyId?: number; from?: string; to?: string }) { return this.get<ReportListResponse<CurrentGuestReportItem>>('current-guests', request); }
  roomStatus(request: RoomStatusReportRequest) { return this.get<ReportListResponse<RoomStatusReportItem>>('room-status', request); }
  payments(request: PaymentReportRequest) { return this.get<ReportListResponse<PaymentReportItem>>('payments', request); }
  refunds(request: RefundReportRequest) { return this.get<ReportListResponse<RefundReportItem>>('refunds', request); }
  cancellations(request: CancellationReportRequest) { return this.get<ReportListResponse<CancellationReportItem>>('cancellations', request); }
  housekeeping(request: HousekeepingReportRequest) { return this.get<ReportListResponse<HousekeepingReportItem>>('housekeeping', request); }
  expenses(request: ExpenseReportRequest) { return this.get<ExpenseReportApiResponse>('expenses', request); }

  private get<T>(path: string, request: object) {
    return this.http.get<T>(`${this.url}/${path}`, {
      params: this.toParams(request),
    });
  }

  private toParams(request: object): HttpParams {
    let params = new HttpParams();
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
