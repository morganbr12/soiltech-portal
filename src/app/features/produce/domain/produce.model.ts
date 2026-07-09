export enum ProduceStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED  = 'RESERVED',
  SOLD_OUT  = 'SOLD_OUT',
  UNLISTED  = 'UNLISTED',
}

export interface ProduceListing extends Record<string, unknown> {
  id: string;
  produceRecordId: string;
  cropType: string;
  cropVariety: string;
  grade: string;
  totalQuantityKg: number;
  availableQuantityKg: number;
  pricePerKg: number;
  status: ProduceStatus;
  region: string;
  district: string;
  agentName: string;
  farmerName: string;
  lbcName: string;
  photos: string[];
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProduceQueryParams {
  status?: string;
  cropType?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProduceListMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ProduceListResponse {
  status: string;
  data: ProduceListing[];
  meta: ProduceListMeta;
}
