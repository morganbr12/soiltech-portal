import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../../core/constants/api.constants';
import { Farm, FarmListResponse, FarmQueryParams } from '../domain/farm.model';

@Injectable({ providedIn: 'root' })
export class FarmService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/admin/farms`;

  list(params: FarmQueryParams = {}): Observable<FarmListResponse> {
    let p = new HttpParams();
    if (params.region)    p = p.set('region',    params.region);
    if (params.crop_type) p = p.set('crop_type', params.crop_type);
    if (params.search)    p = p.set('search',    params.search);
    if (params.page)      p = p.set('page',      String(params.page));
    if (params.per_page)  p = p.set('per_page',  String(params.per_page));
    return this.http.get<FarmListResponse>(this.base, { params: p });
  }
}
