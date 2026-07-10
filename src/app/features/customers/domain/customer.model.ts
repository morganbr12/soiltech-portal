export enum CustomerStatus {
  ACTIVE    = 'active',
  PENDING   = 'pending',
  VERIFIED  = 'verified',
  SUSPENDED = 'suspended',
  REJECTED  = 'rejected',
}

export enum CustomerTier {
  BRONZE   = 'bronze',
  SILVER   = 'silver',
  GOLD     = 'gold',
  PLATINUM = 'platinum',
}

export enum OrderStatus {
  PENDING    = 'PENDING',
  CONFIRMED  = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  DELIVERED  = 'DELIVERED',
  CANCELLED  = 'CANCELLED',
}

export enum DispatchStatus {
  PENDING   = 'pending',
  EN_ROUTE  = 'enRoute',
  PICKED_UP = 'pickedUp',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface DispatchDriverPayload {
  vehicleId: string;
  scheduledDate: string;
  pickupLocation: string;
  notes?: string;
}

export enum WalletStatus {
  ACTIVE    = 'active',
  FROZEN    = 'frozen',
  SUSPENDED = 'suspended',
}

export enum ReviewStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED  = 'flagged',
}

export enum ChatStatus {
  OPEN      = 'open',
  RESOLVED  = 'resolved',
  PENDING   = 'pending',
  ESCALATED = 'escalated',
}

// ── Core Entity ────────────────────────────────────────────────────────────

export interface KycDocument {
  type: 'national_id' | 'proof_of_address' | 'business_cert';
  url: string;
  uploadedAt: string;
}

export interface Customer extends Record<string, unknown> {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  region: string;
  district: string;
  address: string;
  status: CustomerStatus;
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number;
  walletBalance: number;
  rating: number;
  joinedDate: string;
  lastOrderDate: string;
  verifiedDate?: string;
  lat: number;
  lng: number;
  businessName?: string;
  businessType?: string;
  nationalId?: string;
  isVerified: boolean;
  accountType?: 'individual' | 'business';
  kycDocuments?: KycDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  accountType: string;
  status: string;
}

export interface OrderFarmer {
  id: string;
  farmerCode: string;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  district: string;
  community: string;
  cropTypes: string[];
}

export interface OrderAgent {
  id: string;
  agentCode: string;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  district: string;
}

export interface CustomerOrder extends Record<string, unknown> {
  id: string;
  orderCode?: string;
  customerId: string;
  customerCode?: string;
  customerName: string;
  customer?: OrderCustomer | null;
  farmer?: OrderFarmer | null;
  agent?: OrderAgent | null;
  assignedDriver?: string | null;
  produce: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  orderDate: string;
  deliveryDate?: string | null;
  region: string;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWallet extends Record<string, unknown> {
  id: string;
  customerId: string;
  customerName: string;
  balance: number;
  pendingAmount: number;
  totalDeposited: number;
  totalWithdrawn: number;
  lastTransaction: string;
  lastTransactionDate: string;
  status: WalletStatus;
  region: string;
}

export interface WalletTransaction extends Record<string, unknown> {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  createdAt: string;
}

export interface CustomerReview extends Record<string, unknown> {
  id: string;
  customerId: string;
  customerName: string;
  targetType: 'agent' | 'driver' | 'warehouse' | 'produce' | 'lbc';
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  region: string;
}

export interface CustomerChat extends Record<string, unknown> {
  id: string;
  customerId: string;
  customerName: string;
  lbcId?: string;
  lbcName?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: ChatStatus;
  topic: string;
  region: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderType: 'customer' | 'lbc' | 'system';
  senderId: string;
  senderName: string;
  message: string;
  sentAt: string;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  target: string;
  sent: number;
  delivered: number;
  opened: number;
  sentAt: string;
}

// ── Dashboard Summary ──────────────────────────────────────────────────────

export interface CustomerDashboardSummary {
  kpis: {
    totalCustomers: number;
    activeCustomers: number;
    pendingVerification: number;
    totalRevenue: number;
    avgRating: number;
    totalOrders: number;
  };
  statusBreakdown: {
    active: number;
    verified: number;
    pending: number;
    suspended: number;
    rejected: number;
  };
  tierBreakdown: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  topCustomers: Array<{
    id: string;
    customerCode: string;
    fullName: string;
    region: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  monthlyGrowth: number[];
  monthlyRevenue: number[];
  recentOrders: Array<{
    id: string;
    orderCode: string;
    customerId: string;
    customerName: string;
    produce: string;
    totalAmount: number;
    status: string;
  }>;
}

// ── Query Params ───────────────────────────────────────────────────────────

export interface CustomerQueryParams {
  status?: string;
  tier?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerOrderQueryParams {
  status?: string;
  paymentStatus?: string;
  region?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerWalletQueryParams {
  status?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerReviewQueryParams {
  status?: string;
  targetType?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerChatQueryParams {
  status?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Request Payloads ───────────────────────────────────────────────────────

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  district: string;
  address: string;
  businessName?: string;
  businessType?: string;
  nationalId?: string;
  password: string;
}

export interface CreateOrderRequest {
  customerId: string;
  produce: string;
  quantityKg: number;
  pricePerKg: number;
  region: string;
  assignedAgent?: string;
}

export interface SendNotificationRequest {
  title: string;
  body: string;
  target: string;
  category: string;
  channels?: string[];
  scheduledAt?: string;
}

// ── API Response Envelopes ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: T;
}

export interface ListMeta {
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrderListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: Customer[];
  meta: ListMeta;
  summary: {
    total: number;
    active: number;
    verified: number;
    pending: number;
    suspended: number;
    rejected: number;
  };
}

export interface CustomerOrderListResponse {
  success: boolean;
  message: string | null;
  data: CustomerOrder[];
  meta: OrderListMeta;
}

export interface CustomerWalletListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: CustomerWallet[];
  meta: ListMeta;
  summary: {
    totalWallets: number;
    totalBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    frozen: number;
  };
}

export interface CustomerReviewListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: CustomerReview[];
  meta: ListMeta;
  summary: {
    total: number;
    approved: number;
    pending: number;
    flagged: number;
    rejected: number;
    avgRating: number;
  };
}

export interface CustomerChatListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: CustomerChat[];
  meta: ListMeta;
  summary: {
    open: number;
    pending: number;
    resolved: number;
    escalated: number;
  };
}

export interface ChatMessageListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: ChatMessage[];
  meta: ListMeta;
}

export interface NotifHistoryListResponse {
  success: boolean;
  statusCode: number;
  message: string | null;
  data: NotificationHistoryItem[];
  meta: ListMeta;
}
