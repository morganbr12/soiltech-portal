export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum DeliveryStatus {
  SCHEDULED = 'scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  ON_ROUTE = 'on_route',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
}

export enum ProduceGrade {
  A = 'grade_a',
  B = 'grade_b',
  C = 'grade_c',
  REJECTED = 'rejected',
}
