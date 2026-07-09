export interface Farm extends Record<string, unknown> {
  farmId: string;
  farmName: string;
  farmerName: string;
  region: string;
  district: string;
  cropType: string;
  sizeHectares: number;
  estimatedYieldKg: number | null;
  lastHarvestDate: string | null;
  registeredDate: string;
}

export interface FarmQueryParams {
  region?: string;
  crop_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface FarmListMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface FarmListResponse {
  success: boolean;
  data: Farm[];
  meta: FarmListMeta;
}
