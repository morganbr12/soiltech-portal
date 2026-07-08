import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Farmer, FarmerListResponse, FarmerQueryParams, CreateFarmerRequest, ApiResponse } from '../domain/farmer.model';

@Injectable({ providedIn: 'root' })
export class FarmerService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.FARMERS;

  list(params: FarmerQueryParams = {}): Observable<FarmerListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.http
      .get<FarmerListResponse>(this.base, { params: httpParams })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(f => ({ ...f, status: f.status.toLowerCase() as Farmer['status'] })),
      })));
  }

  getById(id: string): Observable<Farmer> {
    return this.http
      .get<ApiResponse<Farmer>>(`${this.base}/${id}`)
      .pipe(map(res => res.data));
  }

  create(payload: CreateFarmerRequest): Observable<Farmer> {
    return this.http
      .post<ApiResponse<Farmer>>(this.base, payload)
      .pipe(map(res => res.data));
  }

  update(id: string, payload: Partial<CreateFarmerRequest>): Observable<Farmer> {
    return this.http
      .put<ApiResponse<Farmer>>(`${this.base}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  approve(id: string): Observable<Farmer> {
    return this.http
      .patch<ApiResponse<Farmer>>(`${this.base}/${id}/approve`, {})
      .pipe(map(res => res.data));
  }

  reject(id: string, reason?: string): Observable<Farmer> {
    return this.http
      .patch<ApiResponse<Farmer>>(`${this.base}/${id}/reject`, { reason: reason ?? '' })
      .pipe(map(res => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }
}
