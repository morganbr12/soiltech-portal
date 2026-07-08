import { EntityStatus } from '../../../core/enums/status.enum';

export interface Farmer extends Record<string, unknown> {
  id: string;
  farmerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string | null;
  nationalId: string;
  agentId: string;
  agentName: string;
  lbcId: string;
  lbcName: string;
  region: string;
  district: string;
  farmsCount: number;
  totalFarmSize: number;
  cropTypes: string[];
  walletBalance: number;
  totalEarnings: number;
  kycVerified: boolean;
  status: EntityStatus;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerListMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface FarmerListSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface FarmerListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: Farmer[];
  meta: FarmerListMeta;
  summary: FarmerListSummary;
}

export interface FarmerQueryParams {
  status?: string;
  region?: string;
  lbcId?: string;
  agentId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFarmerRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  nationalId: string;
  agentId: string;
  lbcId: string;
  region: string;
  district: string;
  cropTypes: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  statusCode: number;
}
