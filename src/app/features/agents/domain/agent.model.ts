import { EntityStatus } from '../../../core/enums/status.enum';

export interface Agent extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  agentCode: string;
  phone: string;
  email: string;
  lbcId: string;
  lbcName: string;
  region: string;
  district: string;
  farmersCount: number;
  farmsCount: number;
  produceCollected: number;
  status: EntityStatus;
  lat: number | null;
  lng: number | null;
  lastSeen: string | null;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentListMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface AgentListSummary {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

export interface AgentListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: Agent[];
  meta: AgentListMeta;
  summary: AgentListSummary;
}

export interface AgentQueryParams {
  status?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAgentRequest {
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  lbcId: string;
  region: string;
  district: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  statusCode: number;
}
