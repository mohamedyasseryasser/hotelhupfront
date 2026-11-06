import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CreatePropertyRequest, DeactivatePropertyRequest, PropertyApiResponse, PropertyListApiResponse, PropertyListQuery, PropertySettingsApiResponse, UpdatePropertyRequest, UpdatePropertySettingsRequest } from '../Models/property';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class Propertyservice {
     private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/properties`;

  getProperties(query: PropertyListQuery): Observable<PropertyListApiResponse> {
    let params = new HttpParams()
      .set('Page', query.page).set('PageSize', query.pageSize)
      .set('SortBy', query.sortBy).set('Descending', query.descending);
    if (query.search) params = params.set('Search', query.search);
if (query.status !== undefined && query.status !== null) {
  params = params.set('Status', query.status);
}
    return this.http.get<PropertyListApiResponse>(this.url, { params });
  }

  getPropertyById(id: number): Observable<PropertyApiResponse> {
    return this.http.get<PropertyApiResponse>(`${this.url}/${id}`);
  }

  createProperty(request: CreatePropertyRequest): Observable<PropertyApiResponse> {
    return this.http.post<PropertyApiResponse>(this.url, request);
  }

  updateProperty(id: number, rowVersion: string, request: UpdatePropertyRequest): Observable<PropertyApiResponse> {
    const params = new HttpParams().set('ifmatch', rowVersion);
    return this.http.patch<PropertyApiResponse>(`${this.url}/${id}`, request, { params });
  }

  activateProperty(id: number, rowVersion: string): Observable<PropertyApiResponse> {
    return this.http.post<PropertyApiResponse>(`${this.url}/${id}/activate`, {},
       { headers: this.rowVersionHeaders(rowVersion) });
  }

  deactivateProperty(id: number, rowVersion: string, request: DeactivatePropertyRequest): Observable<PropertyApiResponse> {
    return this.http.post<PropertyApiResponse>(`${this.url}/${id}/deactivate`, request, 
      { headers: this.rowVersionHeaders(rowVersion) });
  }

  getSettings(id: number): Observable<PropertySettingsApiResponse> {
    return this.http.get<PropertySettingsApiResponse>(`${this.url}/${id}/settings`);
  }

  updateSettings(id: number, rowVersion: string, request: UpdatePropertySettingsRequest): Observable<PropertySettingsApiResponse> {
    const params = new HttpParams().set('ifmatch', rowVersion);
    return this.http.put<PropertySettingsApiResponse>(`${this.url}/${id}/settings`, request, { params });
  }

  private rowVersionHeaders(rowVersion: string): HttpHeaders {
    return new HttpHeaders({ 'If-Match': rowVersion });
  }
}

