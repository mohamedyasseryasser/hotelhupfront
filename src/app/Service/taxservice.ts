
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  ChangeTaxStatusRequest,
  CreateTaxRequest,
  TaxListResponse,
  TaxResponse,
  UpdateTaxRequest
} from '../Models/tax';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class Taxservice {

  private readonly http = inject(HttpClient);

  private readonly url = `${environment.apiUrl}/propertietax`;

  // Get all taxes
  getTaxes(
    propertyId: number,
    includeall: boolean = false
  ): Observable<TaxListResponse> {

    const params = new HttpParams()
      .set('includeall', includeall);

    return this.http.get<TaxListResponse>(
      this.propertyTaxesUrl(propertyId),
      { params }
    );
  }

  // Get tax by ID
  getTax(
    propertyId: number,
    taxId: number,
    includeall: boolean = false
  ): Observable<TaxResponse> {

    const params = new HttpParams()
      .set('includeall', includeall);

    return this.http.get<TaxResponse>(
      `${this.propertyTaxesUrl(propertyId)}/${taxId}`,
      { params }
    );
  }

  // Create tax
  createTax(
    propertyId: number,
    request: CreateTaxRequest
  ): Observable<TaxResponse> {

    return this.http.post<TaxResponse>(
      this.propertyTaxesUrl(propertyId),
      request
    );
  }

  // Update tax
  updateTax(
    propertyId: number,
    taxId: number,
    rowVersion: string,
    request: UpdateTaxRequest
  ): Observable<TaxResponse> {

    const params = new HttpParams()
      .set('ifmatch', rowVersion);

    return this.http.patch<TaxResponse>(
      `${this.propertyTaxesUrl(propertyId)}/${taxId}`,
      request,
      { params }
    );
  }

  // Activate tax
  activateTax(
    propertyId: number,
    taxId: number,
    rowVersion: string
  ): Observable<TaxResponse> {

    return this.http.post<TaxResponse>(
      `${this.propertyTaxesUrl(propertyId)}/${taxId}/activate`,
      {},
      { headers: this.rowVersionHeaders(rowVersion) }
    );
  }

  // Deactivate tax
  deactivateTax(
    propertyId: number,
    taxId: number,
    rowVersion: string,
    request: ChangeTaxStatusRequest
  ): Observable<TaxResponse> {

    return this.http.post<TaxResponse>(
      `${this.propertyTaxesUrl(propertyId)}/${taxId}/deactivate`,
      request,
      { headers: this.rowVersionHeaders(rowVersion) }
    );
  }

  private propertyTaxesUrl(propertyId: number): string {
    return `${this.url}/${propertyId}/taxes`;
  }

  private rowVersionHeaders(rowVersion: string): HttpHeaders {
    return new HttpHeaders({
      'If-Match': rowVersion
    });
  }
}
