import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { AdminNotification, NotificationListResponse, UnreadCountResponse } from '../domain/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.NOTIFICATIONS;

  list(params: { page?: number; limit?: number } = {}): Observable<NotificationListResponse> {
    let p = new HttpParams();
    if (params.page)  p = p.set('page',  String(params.page));
    if (params.limit) p = p.set('limit', String(params.limit));
    return this.http.get<NotificationListResponse>(this.base, { params: p });
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<UnreadCountResponse>(`${this.base}/unread-count`)
      .pipe(map(r => r.data.count));
  }

  markAsRead(id: string): Observable<AdminNotification> {
    return this.http
      .patch<{ success: boolean; data: AdminNotification }>(`${this.base}/${id}/read`, {})
      .pipe(map(r => r.data));
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.base}/read-all`, {});
  }
}
