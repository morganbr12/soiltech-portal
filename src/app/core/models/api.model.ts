export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  icon?: string;
  disabled?: boolean;
  description?: string;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

export interface TableColumn {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  pinned?: 'left' | 'right';
  cellRenderer?: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'currency' | 'actions';
}
