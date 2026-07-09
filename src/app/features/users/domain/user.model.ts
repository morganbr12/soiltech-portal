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

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  adminRole: UserRole;
  phone?: string;
  region?: string;
  lbcId?: string;
}
