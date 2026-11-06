import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment.development';

import {
  DeactivateServiceRequest,
  ServiceListRequest,
  ServiceListResponse,
  ServiceRequest,
  ServiceResponse
} from '../Models/services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Services {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/services`;

  

 list(
  request: ServiceListRequest,
): Observable<ServiceListResponse> {
  return this.http.get<ServiceListResponse>(
    this.url,
    {
      params: this.params(request),
    },
  );
}


  get(propertyId: number, id: number) {
    return this.http.get<ServiceResponse>(
      `${this.url}/${id}`,
      {
        params: this.params({ propertyId })
      }
    );
  }

  create(propertyId: number, r: ServiceRequest) {
    return this.http.post<ServiceResponse>(
      this.url,
      r,
      {
        params: this.params({ propertyId })
      }
    );
  }

  update(
    propertyId: number,
    id: number,
    r: ServiceRequest
  ) {
    return this.http.patch<ServiceResponse>(
      `${this.url}/${id}`,
      r,
      {
        params: this.params({ propertyId })
      }
    );
  }

  deactivate(
    propertyId: number,
    id: number,
    r: DeactivateServiceRequest
  ) {
    return this.http.post<ServiceResponse>(
      `${this.url}/${id}/deactivate`,
      r,
      {
        params: this.params({ propertyId })
      }
    );
  }
  private params<T extends object>(
  values: T,
): HttpParams {
  let params = new HttpParams();

  Object.entries(values).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        params = params.set(
          key,
          String(value),
        );
      }
    },
  );

  return params;
}

}
