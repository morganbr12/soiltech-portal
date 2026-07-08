import { EntityStatus } from '../../../core/enums/status.enum';

export interface Lbc extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  region: string;
  district: string;
  manager: string;
  phone: string;
  email: string;
  agents: number;
  farmers: number;
  produceTonnes: number;
  revenue: number;
  compliance: number;
  status: EntityStatus;
  joinedDate: string;
}

export interface LbcListMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface LbcListSummary {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  inactive: number;
}

export interface LbcListResponse {
  success: boolean;
  data: Lbc[];
  meta: LbcListMeta;
  summary: LbcListSummary;
  status_code: number;
}

export interface LbcQueryParams {
  status?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateLbcRequest {
  name: string;
  code: string;
  region: string;
  district: string;
  manager: string;
  phone: string;
  email: string;
  password: string;
}

export interface BulkSuspendResult {
  succeeded: string[];
  skipped: string[];
  failed: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  status_code: number;
}
