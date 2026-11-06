import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';

import {
  AddFolioItemRequest,
  FolioItemPageResponse,
  FolioResponse,
  FolioSummaryResponse,
  ReasonRequest
} from '../Models/folio';

@Injectable({
  providedIn: 'root'
})
export class Folio {

  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/folios`;

  get(id: number) {
    return this.http.get<FolioResponse>(
      `${this.url}/${id}`
    );
  }

  items(
    id: number,
    pageNumber = 1,
    pageSize = 20
  ) {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<FolioItemPageResponse>(
      `${this.url}/${id}/items`,
      { params }
    );
  }

  summary(id: number) {
    return this.http.get<FolioSummaryResponse>(
      `${this.url}/${id}/summary`
    );
  }

  addItem(
    id: number,
    request: AddFolioItemRequest
  ) {
    return this.http.post<FolioResponse>(
      `${this.url}/${id}/items`,
      request
    );
  }

  voidItem(
    id: number,
    itemId: number,
    request: ReasonRequest
  ) {
    return this.http.post<FolioResponse>(
      `${this.url}/${id}/items/${itemId}/void`,
      request
    );
  }

  reopen(
    id: number,
    request: ReasonRequest
  ) {
    return this.http.post<FolioResponse>(
      `${this.url}/${id}/reopen`,
      request
    );
  }

  close(
    id: number,
    request: ReasonRequest
  ) {
    return this.http.post<FolioResponse>(
      `${this.url}/${id}/close`,
      request
    );
  }
}
