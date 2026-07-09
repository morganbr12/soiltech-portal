import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ProduceListing, ProduceListResponse, ProduceQueryParams } from '../domain/produce.model';

function toHttpParams(obj: Record<string, unknown>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class ProduceService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.PRODUCE_LISTINGS;

  list(params: ProduceQueryParams = {}): Observable<ProduceListResponse> {
    return this.http
      .get<ProduceListResponse>(`${this.base}/admin`, {
        params: toHttpParams(params as Record<string, unknown>),
      })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(p => ({
          ...p,
          status: p.status.toUpperCase() as ProduceListing['status'],
        })),
      })));
  }

  approve(id: string): Observable<ProduceListing> {
    return this.http
      .patch<{ status: string; data: ProduceListing }>(`${this.base}/${id}/approve`, {})
      .pipe(map(r => r.data));
  }

  reject(id: string): Observable<ProduceListing> {
    return this.http
      .patch<{ status: string; data: ProduceListing }>(`${this.base}/${id}/reject`, {})
      .pipe(map(r => r.data));
  }
}
