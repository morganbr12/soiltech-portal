export enum CustomerStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum CustomerTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum WalletStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  SUSPENDED = 'suspended',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum ChatStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  PENDING = 'pending',
  ESCALATED = 'escalated',
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
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
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  produce: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  assignedAgent?: string;
  assignedDriver?: string;
  orderDate: string;
  deliveryDate?: string;
  region: string;
}

export interface CustomerWallet {
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

export interface CustomerReview {
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

export interface CustomerChat {
  id: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: ChatStatus;
  topic: string;
  region: string;
}
