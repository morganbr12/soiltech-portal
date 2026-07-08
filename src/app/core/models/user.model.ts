import { UserRole } from '../enums/roles.enum';
import { Permission } from '../enums/permissions.enum';
import { EntityStatus } from '../enums/status.enum';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  status: EntityStatus;
  region?: string;
  district?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user?: Partial<AuthUser>;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}
