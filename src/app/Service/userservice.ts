import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { CreateUserRequest, RoleListQuery, RolePageResponse, UpdateUserRequest, UserListQuery, UserPageResponse, UserResponse, UserRolesResponse } from '../Models/user';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({providedIn:'root'})
export class Userservice {
    
    private readonly http=inject(HttpClient)
  private readonly url = `${environment.apiUrl}/users`;
  
 
 
  getUsers(query: UserListQuery, ): Observable<UserPageResponse> {
    let params = new HttpParams()
      .set('pg.PageNumber',query.pageNumber,  )
      .set(  'pg.PageSize',query.pageSize,);

    const optional: Record<string,string | number | boolean | undefined > = {
      UserName: query.userName,
      FullName: query.fullName,
      IsActive: query.isActive,
      PropertyId: query.propertyId,
      RoleId: query.roleId,
      CreatedFrom: query.createdFrom,
      CreatedTo: query.createdTo,
    };

    Object.entries(optional).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ''
        ) {
          params = params.set(
            key,
            String(value),
          );
        }
      },
    );

    return this.http.get<UserPageResponse>(
      this.url,
      { params },
     );
  }
  getRoles(
    query: RoleListQuery,
  ): Observable<RolePageResponse> {
    let params = new HttpParams()
      .set(
        'pg.PageNumber',
        query.pageNumber,
      )
      .set(
        'pg.PageSize',
        query.pageSize,
      );

    const optional: Record<
      string,
      string | number | boolean | undefined
    > = {
      Search: query.search,
      IsActive: query.isActive,
      PermissionName: query.permissionName,
    };

    Object.entries(optional).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ''
        ) {
          params = params.set(
            key,
            String(value),
          );
        }
      },
    );

    return this.http.get<RolePageResponse>(
      `${this.url}/roles`,
      { params },
     );
  }

  getUserById(
    userId: string,
  ): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.url}/${encodeURIComponent(userId )}`,
    );
  }

  getUserRoles(
    userId: string,
  ): Observable<UserRolesResponse> {
    return this.http.get<UserRolesResponse>(
      `${this.url}/${encodeURIComponent(userId )}/roles`,
    );
  }
  
  createUser(
    request: CreateUserRequest,
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      this.url,
      request,
     );
  }

  updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.url}/${encodeURIComponent(userId )}`,
      request,
    );
  }

  activateUser(
    userId: string,
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.url}/${encodeURIComponent(userId )}/activate`,
      {},
    );
  }

  deactivateUser(
    userId: string,
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.url}/${encodeURIComponent(userId )}/deactivate`,
      {},
    );
  }

  replaceRoles(
    userId: string,
    roleIds: string[],
    propertyId: number | null,
    reason?: string,
  ): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${this.url}/${encodeURIComponent(userId )}/roles`,
      {
        roleIds,
        propertyId,
        reason: reason || null,
      },
    );
  }
}
