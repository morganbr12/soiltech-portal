export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: AdminNotification[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}
