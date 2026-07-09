import { UserRole } from '../../../core/enums/roles.enum';

export interface PortalUser extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  adminRole: UserRole;
  phone?: string;
  region?: string;
  lbcId?: string;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserQueryParams {
  role?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UserListMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface UserListResponse {
  success: boolean;
  data: PortalUser[];
  meta: UserListMeta;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  adminRole: UserRole;
  phone?: string;
  region?: string;
  lbcId?: string;
}
