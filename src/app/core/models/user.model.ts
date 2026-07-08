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

// Shape of role objects returned by the backend
export interface BackendRole {
  id?: string;
  name: string;     // matches UserRole enum values e.g. "super_admin"
  value?: string;   // login response uses this field
  label?: string;
  permissions: string[];
  permissionCount?: number;
}

// Actual data inside the login response's `data` field
export interface LoginData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  role: BackendRole;
}

// Full login HTTP response wrapper
export interface LoginResponse {
  success: boolean;
  data: LoginData;
  message: string;
  status_code: number;
}

// Shape of the /admin/me `data` field
export interface AdminProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: BackendRole;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Full /admin/me HTTP response wrapper
export interface AdminMeResponse {
  success: boolean;
  data: AdminProfile;
  status_code: number;
}
