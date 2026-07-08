import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Lbc, LbcListResponse, LbcQueryParams, CreateLbcRequest, BulkSuspendResult, ApiResponse } from '../domain/lbc.model';

@Injectable({ providedIn: 'root' })
export class LbcService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.LBC;

  list(params: LbcQueryParams = {}): Observable<LbcListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.http
      .get<LbcListResponse>(this.base, { params: httpParams })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(lbc => ({ ...lbc, status: lbc.status.toLowerCase() as Lbc['status'] })),
      })));
  }

  getById(id: string): Observable<Lbc> {
    return this.http
      .get<ApiResponse<Lbc>>(`${this.base}/${id}`)
      .pipe(map(res => res.data));
  }

  create(payload: CreateLbcRequest): Observable<Lbc> {
    return this.http
      .post<ApiResponse<Lbc>>(this.base, payload)
      .pipe(map(res => res.data));
  }

  update(id: string, payload: Partial<CreateLbcRequest>): Observable<Lbc> {
    return this.http
      .put<ApiResponse<Lbc>>(`${this.base}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  suspend(id: string): Observable<Lbc> {
    return this.http
      .patch<ApiResponse<Lbc>>(`${this.base}/${id}/suspend`, {})
      .pipe(map(res => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  export(params: Pick<LbcQueryParams, 'status' | 'region'> & { ids?: string[] } = {}): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.region) httpParams = httpParams.set('region', params.region);
    if (params.ids?.length) httpParams = httpParams.set('ids', params.ids.join(','));
    return this.http.get(`${this.base}/export`, { params: httpParams, responseType: 'blob' });
  }

  bulkSuspend(ids: string[]): Observable<BulkSuspendResult> {
    return this.http
      .patch<ApiResponse<BulkSuspendResult>>(`${this.base}/bulk-suspend`, { ids })
      .pipe(map(res => res.data));
  }
}
