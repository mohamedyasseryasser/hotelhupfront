import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { CreateRoomTypeRequest, RoomTypeListResponse, RoomTypeResponse, UpdateRoomTypeRequest } from '../Models/roomtype';
@Injectable({providedIn:'root'})
export class Roomtypeservice {
  private readonly http=inject(HttpClient);
   private readonly url=`${environment.apiUrl}/room-types`;
  getRoomTypes(propertyId:number,includeInactive=false):Observable<RoomTypeListResponse>
  {
     return this.http.get<RoomTypeListResponse>(this.url,
        {params:new HttpParams().
            set('PropertyId',propertyId).
      
            set('IncludeInactive',includeInactive)}); 
        }
  getRoomType(id:number,includeroom:boolean):Observable<RoomTypeResponse>
  {
     return this.http.get<RoomTypeResponse>(`${this.url}/${id}`
      ,{params:new HttpParams().set('IncludeRooms',includeroom.toString())}); 
    }
  createRoomType(propertyId:number,request:CreateRoomTypeRequest):Observable<RoomTypeResponse>
  {
     return this.http.post<RoomTypeResponse>(this.url,
        request,
        {params:new HttpParams().set('propertyid',propertyId)}); 
  }
  updateRoomType(id:number,rowVersion:string,request:UpdateRoomTypeRequest):Observable<RoomTypeResponse>
  {
     return this.http.patch<RoomTypeResponse>(`${this.url}/${id}`,
        request,
        {headers:new HttpHeaders({'If-Match':rowVersion})});
     }
  deactivateRoomType(id:number,rowVersion:string):Observable<RoomTypeResponse>{ 
    return this.http.post<RoomTypeResponse>(`${this.url}/${id}/deactivate`,
        {},
         {headers:new HttpHeaders({'If-Match':rowVersion})
        });
     } ActivateRoomType(id:number,rowVersion:string):Observable<RoomTypeResponse>{ 
    return this.http.post<RoomTypeResponse>(`${this.url}/${id}/Activate`,
        {},
         {headers:new HttpHeaders({'If-Match':rowVersion})
        });
     }
}