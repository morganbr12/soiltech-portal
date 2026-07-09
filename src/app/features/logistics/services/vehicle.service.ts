import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { Vehicle, VehicleQueryParams, VehicleListMeta, CreateVehiclePayload } from '../domain/vehicle.model';

export interface VehicleKpis {
  totalVehicles: number;
  available: number;
  onRoute: number;
  maintenance: number;
  inactive: number;
}

interface VehicleListResponse {
  status: string;
  data: Vehicle[];
  meta: VehicleListMeta;
}

interface VehicleSingleResponse {
  status: string;
  data: Vehicle;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);

  list(params: VehicleQueryParams = {}): Observable<{ data: Vehicle[]; meta: VehicleListMeta }> {
    let httpParams = new HttpParams();
    if (params.status)      httpParams = httpParams.set('status', params.status);
    if (params.region)      httpParams = httpParams.set('region', params.region);
    if (params.vehicleType) httpParams = httpParams.set('vehicleType', params.vehicleType);
    if (params.search)      httpParams = httpParams.set('search', params.search);
    if (params.page)        httpParams = httpParams.set('page', params.page);
    if (params.limit)       httpParams = httpParams.set('limit', params.limit ?? 20);

    return this.http
      .get<VehicleListResponse>(API_ENDPOINTS.VEHICLES, { params: httpParams })
      .pipe(map(r => ({ data: r.data, meta: r.meta })));
  }

  create(payload: CreateVehiclePayload): Observable<Vehicle> {
    return this.http
      .post<VehicleSingleResponse>(API_ENDPOINTS.VEHICLES, payload)
      .pipe(map(r => r.data));
  }

  update(id: string, payload: Partial<CreateVehiclePayload>): Observable<Vehicle> {
    return this.http
      .put<VehicleSingleResponse>(`${API_ENDPOINTS.VEHICLES}/${id}`, payload)
      .pipe(map(r => r.data));
  }

  getKpis(): Observable<VehicleKpis> {
    return this.http
      .get<{ success: boolean; data: VehicleKpis }>(`${API_ENDPOINTS.VEHICLES}/kpis`)
      .pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.VEHICLES}/${id}`);
  }
}
