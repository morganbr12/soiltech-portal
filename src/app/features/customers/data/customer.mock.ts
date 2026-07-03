import {
  Customer, CustomerStatus, CustomerTier,
  CustomerOrder, OrderStatus,
  CustomerWallet, WalletStatus,
  CustomerReview, ReviewStatus,
  CustomerChat, ChatStatus,
} from '../domain/customer.model';

const REGIONS = ['Ashanti', 'Brong-Ahafo', 'Eastern', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Western', 'Central', 'Greater Accra'];
const DISTRICTS = ['Kumasi', 'Sunyani', 'Koforidua', 'Tamale', 'Bolgatanga', 'Wa', 'Ho', 'Takoradi', 'Cape Coast', 'Accra'];
const FIRST_NAMES = ['Kwame', 'Ama', 'Kofi', 'Abena', 'Yaw', 'Akua', 'Kweku', 'Adwoa', 'Kojo', 'Efua', 'Nana', 'Esi', 'Fiifi', 'Maame', 'Adjoa'];
const LAST_NAMES = ['Asante', 'Mensah', 'Owusu', 'Boateng', 'Amponsah', 'Acheampong', 'Frimpong', 'Adomako', 'Gyasi', 'Twumasi', 'Opoku', 'Antwi', 'Nyarko', 'Bonsu', 'Appiah'];
const BUSINESS_TYPES = ['Retailer', 'Wholesaler', 'Distributor', 'Processor', 'Exporter', 'Co-operative', 'Restaurant', 'Hotel', 'NGO', 'Government'];
const PRODUCE_LIST = ['Maize', 'Cassava', 'Cocoa', 'Rice', 'Yam', 'Plantain', 'Soybean', 'Groundnut', 'Sorghum', 'Millet'];
const CHAT_TOPICS = ['Order Inquiry', 'Payment Issue', 'Delivery Complaint', 'Quality Concern', 'Wallet Top-up', 'Account Verification', 'Product Availability', 'Price Inquiry'];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndNum(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndFloat(min: number, max: number, dp = 2): number { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function dateBack(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
function ghanaLat(): number { return rndFloat(5.5, 10.5, 4); }
function ghanaLng(): number { return rndFloat(-3.0, 1.2, 4); }

let seq = 1;
function nextId(prefix: string): string { return `${prefix}-${String(seq++).padStart(4, '0')}`; }

export const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 80 }, (_, i) => {
  const fn = FIRST_NAMES[i % FIRST_NAMES.length];
  const ln = LAST_NAMES[i % LAST_NAMES.length];
  const region = REGIONS[i % REGIONS.length];
  const orders = rndNum(0, 120);
  const spent = rndFloat(500, 85000);
  const statusPool: CustomerStatus[] = [
    CustomerStatus.ACTIVE, CustomerStatus.ACTIVE, CustomerStatus.ACTIVE,
    CustomerStatus.VERIFIED, CustomerStatus.VERIFIED,
    CustomerStatus.PENDING,
    CustomerStatus.SUSPENDED,
    CustomerStatus.REJECTED,
  ];
  const status = statusPool[i % statusPool.length];
  const tierPool: CustomerTier[] = [CustomerTier.BRONZE, CustomerTier.SILVER, CustomerTier.GOLD, CustomerTier.PLATINUM];
  return {
    id: `CUST-${String(i + 1).padStart(4, '0')}`,
    firstName: fn,
    lastName: ln,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@mail.gh`,
    phone: `+233 ${rndNum(20, 59)}${rndNum(1000000, 9999999)}`,
    region,
    district: DISTRICTS[i % DISTRICTS.length],
    address: `No. ${rndNum(1, 99)}, ${rnd(['Market St', 'Ring Road', 'Independence Ave', 'Nkrumah Rd', 'Airport Bypass'])}, ${region}`,
    status,
    tier: spent > 50000 ? CustomerTier.PLATINUM : spent > 20000 ? CustomerTier.GOLD : spent > 5000 ? CustomerTier.SILVER : CustomerTier.BRONZE,
    totalOrders: orders,
    totalSpent: spent,
    walletBalance: rndFloat(0, 5000),
    rating: rndFloat(2.5, 5.0, 1),
    joinedDate: dateBack(rndNum(30, 900)),
    lastOrderDate: orders > 0 ? dateBack(rndNum(1, 60)) : '',
    verifiedDate: status === CustomerStatus.VERIFIED || status === CustomerStatus.ACTIVE ? dateBack(rndNum(10, 500)) : undefined,
    lat: ghanaLat(),
    lng: ghanaLng(),
    businessName: i % 3 !== 0 ? `${ln} ${rnd(['Agro', 'Farm Supplies', 'Trading', 'Enterprises', 'Co.'])}` : undefined,
    businessType: i % 3 !== 0 ? rnd(BUSINESS_TYPES) : undefined,
    nationalId: `GHA-${rndNum(100000000, 999999999)}`,
    isVerified: status === CustomerStatus.VERIFIED || status === CustomerStatus.ACTIVE,
  };
});

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = Array.from({ length: 120 }, (_, i) => {
  const cust = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
  const qty = rndNum(100, 5000);
  const price = rndFloat(1.5, 8.0);
  const statusPool: OrderStatus[] = [
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
    OrderStatus.PROCESSING, OrderStatus.CONFIRMED,
    OrderStatus.PENDING, OrderStatus.CANCELLED,
  ];
  return {
    id: `ORD-${String(i + 1).padStart(4, '0')}`,
    customerId: cust.id,
    customerName: `${cust.firstName} ${cust.lastName}`,
    produce: rnd(PRODUCE_LIST),
    quantityKg: qty,
    pricePerKg: price,
    totalAmount: parseFloat((qty * price).toFixed(2)),
    status: statusPool[i % statusPool.length],
    paymentStatus: i % 4 === 0 ? 'unpaid' : i % 4 === 1 ? 'partial' : 'paid',
    assignedAgent: `AGT-${String(rndNum(1, 60)).padStart(3, '0')}`,
    assignedDriver: `DRV-${String(rndNum(1, 30)).padStart(3, '0')}`,
    orderDate: dateBack(rndNum(1, 180)),
    deliveryDate: i % 7 !== 0 ? dateBack(rndNum(0, 30)) : undefined,
    region: cust.region,
  };
});

export const MOCK_CUSTOMER_WALLETS: CustomerWallet[] = MOCK_CUSTOMERS.slice(0, 60).map((c, i) => {
  const bal = rndFloat(0, 5000);
  const deposited = rndFloat(1000, 30000);
  const withdrawn = rndFloat(0, deposited * 0.9);
  const walletStatusPool: WalletStatus[] = [WalletStatus.ACTIVE, WalletStatus.ACTIVE, WalletStatus.ACTIVE, WalletStatus.FROZEN, WalletStatus.SUSPENDED];
  return {
    id: `WAL-${String(i + 1).padStart(4, '0')}`,
    customerId: c.id,
    customerName: `${c.firstName} ${c.lastName}`,
    balance: bal,
    pendingAmount: rndFloat(0, 500),
    totalDeposited: deposited,
    totalWithdrawn: withdrawn,
    lastTransaction: i % 2 === 0 ? 'Deposit via MoMo' : 'Withdrawal to Bank',
    lastTransactionDate: dateBack(rndNum(1, 30)),
    status: walletStatusPool[i % walletStatusPool.length],
    region: c.region,
  };
});

export const MOCK_CUSTOMER_REVIEWS: CustomerReview[] = Array.from({ length: 80 }, (_, i) => {
  const cust = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
  const targetTypes: CustomerReview['targetType'][] = ['agent', 'driver', 'warehouse', 'produce', 'lbc'];
  const targetType = targetTypes[i % targetTypes.length];
  const reviewStatusPool: ReviewStatus[] = [ReviewStatus.APPROVED, ReviewStatus.APPROVED, ReviewStatus.PENDING, ReviewStatus.FLAGGED, ReviewStatus.REJECTED];
  const comments = [
    'Excellent service! Very prompt and professional delivery.',
    'Quality was below expectations. Needs improvement.',
    'Agent was very helpful and responsive.',
    'Delivery was delayed by two days without notification.',
    'Great produce quality, will order again.',
    'Warehouse staff was courteous and efficient.',
    'Price was a bit high compared to market rates.',
    'Smooth transaction, no issues at all.',
  ];
  return {
    id: `REV-${String(i + 1).padStart(4, '0')}`,
    customerId: cust.id,
    customerName: `${cust.firstName} ${cust.lastName}`,
    targetType,
    targetId: `${targetType.toUpperCase()}-${String(rndNum(1, 60)).padStart(3, '0')}`,
    targetName: `${rnd(FIRST_NAMES)} ${rnd(LAST_NAMES)} ${targetType === 'produce' ? '(Maize)' : ''}`.trim(),
    rating: rndNum(1, 5),
    comment: rnd(comments),
    status: reviewStatusPool[i % reviewStatusPool.length],
    createdAt: dateBack(rndNum(1, 120)),
    region: cust.region,
  };
});

export const MOCK_CUSTOMER_CHATS: CustomerChat[] = Array.from({ length: 60 }, (_, i) => {
  const cust = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
  const chatStatusPool: ChatStatus[] = [ChatStatus.OPEN, ChatStatus.OPEN, ChatStatus.PENDING, ChatStatus.RESOLVED, ChatStatus.ESCALATED];
  const messages = [
    'I have not received my order yet.',
    'Can I change my delivery address?',
    'My wallet balance is incorrect.',
    'How long will verification take?',
    'I need to cancel my last order.',
    'The produce quality was not as expected.',
    'Can I get a refund?',
    'When will the agent visit?',
  ];
  const agentFirstName = rnd(FIRST_NAMES);
  const agentLastName = rnd(LAST_NAMES);
  return {
    id: `CHT-${String(i + 1).padStart(4, '0')}`,
    customerId: cust.id,
    customerName: `${cust.firstName} ${cust.lastName}`,
    agentId: `AGT-${String(rndNum(1, 60)).padStart(3, '0')}`,
    agentName: `${agentFirstName} ${agentLastName}`,
    lastMessage: rnd(messages),
    lastMessageAt: new Date(Date.now() - rndNum(5, 10000) * 60000).toISOString(),
    unreadCount: rndNum(0, 12),
    status: chatStatusPool[i % chatStatusPool.length],
    topic: rnd(CHAT_TOPICS),
    region: cust.region,
  };
});
