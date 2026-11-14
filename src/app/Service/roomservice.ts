import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';

import {
  CreateRoomRequest,
  DeactivateRoomRequest,
  RoomListQuery,
  RoomListResponse,
  RoomResponse,
  UpdateRoomRequest,
} from '../Models/room';

@Injectable({
  providedIn: 'root',
})
export class Roomservice {
  private readonly http = inject(HttpClient);

  private readonly url = `${environment.apiUrl}/rooms`;

  getRooms(query: RoomListQuery): Observable<RoomListResponse> {
    let params = new HttpParams()
      .set('PropertyId', query.propertyId)
      .set('IncludeInactive', query.includeInactive)
      .set('PageSize', query.pageSize)
      .set('PageNumber', query.pageNumber);

    if (query.search?.trim()) {
      params = params.set('Search', query.search.trim());
    }

    return this.http.get<RoomListResponse>(this.url, {
      params,
    });
  }

  getRoom(id: number, propertyId: number): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(`${this.url}/${id}`, {
      params: new HttpParams().set('propertyId', propertyId),
    });
  }

  createRoom(
    propertyId: number,
    request: CreateRoomRequest,
  ): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.url, request, {
      params: new HttpParams().set('propertyId', propertyId),
    });
  }

  updateRoom(
    id: number,
    propertyId: number,
    request: UpdateRoomRequest,
  ): Observable<RoomResponse> {
    return this.http.patch<RoomResponse>(`${this.url}/${id}`, request, {
      params: new HttpParams().set('propertyId', propertyId),
    });
  }
 ActivateRoom(
    id: number,
    propertyId: number,
    request: DeactivateRoomRequest,
  ): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(
      `${this.url}/${id}/Activate`,
      request,
      {
        params: new HttpParams().set('propertyId', propertyId),
      },
    );
  }
  deactivateRoom(
    id: number,
    propertyId: number,
    request: DeactivateRoomRequest,
  ): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(
      `${this.url}/${id}/deactivate`,
      request,
      {
        params: new HttpParams().set('propertyId', propertyId),
      },
    );
  }
}