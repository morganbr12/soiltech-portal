import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { PortalUser, CreateUserPayload } from '../domain/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.USERS;

  create(payload: CreateUserPayload): Observable<PortalUser> {
    return this.http
      .post<{ success: boolean; data: PortalUser }>(this.base, payload)
      .pipe(map(r => r.data));
  }
}
