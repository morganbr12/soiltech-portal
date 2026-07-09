import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { DashboardData } from '../domain/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<DashboardData> {
    return this.http
      .get<{ status: string; data: DashboardData }>(API_ENDPOINTS.DASHBOARD)
      .pipe(map(r => r.data));
  }
}
