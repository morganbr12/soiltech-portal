export enum VehicleStatusApi {
  AVAILABLE   = 'AVAILABLE',
  ON_ROUTE    = 'ON_ROUTE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE    = 'INACTIVE',
}

export interface Vehicle extends Record<string, unknown> {
  id: string;
  carPlateNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  fuelLevel: number;
  region: string;
  driverName: string | null;
  status: VehicleStatusApi;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleQueryParams {
  status?: string;
  region?: string;
  vehicleType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VehicleListMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CreateVehiclePayload {
  carPlateNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  fuelLevel?: number;
  region: string;
  driverName?: string;
  status?: VehicleStatusApi;
}
