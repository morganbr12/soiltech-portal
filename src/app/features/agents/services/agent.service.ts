import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Agent, AgentListResponse, AgentQueryParams, CreateAgentRequest, ApiResponse } from '../domain/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.AGENTS;

  list(params: AgentQueryParams = {}): Observable<AgentListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.http
      .get<AgentListResponse>(this.base, { params: httpParams })
      .pipe(map(res => ({
        ...res,
        data: res.data.map(agent => ({
          ...agent,
          status: agent.status.toLowerCase() as Agent['status'],
        })),
      })));
  }

  getById(id: string): Observable<Agent> {
    return this.http
      .get<ApiResponse<Agent>>(`${this.base}/${id}`)
      .pipe(map(res => res.data));
  }

  create(payload: CreateAgentRequest): Observable<Agent> {
    return this.http
      .post<ApiResponse<Agent>>(this.base, payload)
      .pipe(map(res => res.data));
  }

  update(id: string, payload: Partial<CreateAgentRequest>): Observable<Agent> {
    return this.http
      .put<ApiResponse<Agent>>(`${this.base}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }
}
