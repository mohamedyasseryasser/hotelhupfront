import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment.development';

import {
  CreatePaymentRequest,
  PaymentListResponse,
  PaymentResponse,
  PaymentSummaryResponse,
  RefundPaymentRequest
} from '../Models/payments';

@Injectable({
  providedIn: 'root'
})
export class Payments{

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/payments`;

  create(folioId: number, r: CreatePaymentRequest) {
    return this.http.post<PaymentResponse>(
      `${this.url}/folios/${folioId}`,
      r
    );
  }

  get(id: number) {
    return this.http.get<PaymentResponse>(
      `${this.url}/${id}`
    );
  }

  list(folioId: number) {
    return this.http.get<PaymentListResponse>(
      `${this.url}/folios/${folioId}`
    );
  }

  summary(folioId: number) {
    return this.http.get<PaymentSummaryResponse>(
      `${this.url}/folios/${folioId}/summary`
    );
  }

  refund(id: number, r: RefundPaymentRequest) {
    return this.http.post<PaymentResponse>(
      `${this.url}/${id}/refunds`,
      r
    );
  }
}
