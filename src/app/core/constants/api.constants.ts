import { environment } from '../../../environments/environment';

export const API_BASE = environment.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/admin/me`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },
  USERS: `${API_BASE}/users`,
  LBC: `${API_BASE}/lbc`,
  AGENTS: `${API_BASE}/agents`,
  FARMERS: `${API_BASE}/farmers`,
  FARMS: `${API_BASE}/farms`,
  PRODUCE: `${API_BASE}/produce`,
  WAREHOUSES: `${API_BASE}/warehouses`,
  LOGISTICS: `${API_BASE}/logistics`,
  DRIVERS: `${API_BASE}/drivers`,
  VEHICLES: `${API_BASE}/vehicles`,
  TRACKING: `${API_BASE}/tracking`,
  PAYMENTS: `${API_BASE}/payments`,
  WALLETS: `${API_BASE}/wallets`,
  REPORTS: `${API_BASE}/reports`,
  ANALYTICS: `${API_BASE}/analytics`,
  NOTIFICATIONS: `${API_BASE}/notifications`,
  AUDIT: `${API_BASE}/audit`,
  SETTINGS: `${API_BASE}/settings`,
  DASHBOARD: `${API_BASE}/dashboard`,
  CUSTOMERS: `${API_BASE}/customers`,
} as const;
