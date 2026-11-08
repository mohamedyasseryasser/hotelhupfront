import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import {
  CreateExpenseRequest, ExpensePageResponse, ExpenseQuery, ExpenseResponse,
  UpdateExpenseRequest, VoidExpenseRequest,
} from '../Models/expenses';

@Injectable({ providedIn: 'root' })
export class Expenses {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/expenses`;

  create(request: CreateExpenseRequest) {
    return this.http.post<ExpenseResponse>(this.url, request);
  }

  list(query: ExpenseQuery) {
    return this.http.get<ExpensePageResponse>(this.url, {
      params: this.toParams(query),
    });
  }

  get(id: number) {
    return this.http.get<ExpenseResponse>(`${this.url}/${id}`);
  }

  update(id: number, request: UpdateExpenseRequest) {
    return this.http.put<ExpenseResponse>(`${this.url}/${id}`, request);
  }

  void(id: number, request: VoidExpenseRequest) {
    return this.http.post<ExpenseResponse>(`${this.url}/${id}/void`, request);
  }

  private toParams(query: ExpenseQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
