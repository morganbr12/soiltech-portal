import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE } from '../../../core/constants/api.constants';
import { PortalUser, CreateUserPayload, UserListResponse, UserQueryParams } from '../domain/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/admin/users`;

  list(params: UserQueryParams = {}): Observable<UserListResponse> {
    let p = new HttpParams();
    if (params.role     !== undefined) p = p.set('role',      params.role);
    if (params.is_active !== undefined) p = p.set('is_active', String(params.is_active));
    if (params.search)                  p = p.set('search',    params.search);
    if (params.page)                    p = p.set('page',      String(params.page));
    if (params.per_page)                p = p.set('per_page',  String(params.per_page));
    return this.http.get<UserListResponse>(this.base, { params: p });
  }

  create(payload: CreateUserPayload): Observable<PortalUser> {
    return this.http
      .post<{ success: boolean; data: PortalUser }>(this.base, payload)
      .pipe(map(r => r.data));
  }
}
