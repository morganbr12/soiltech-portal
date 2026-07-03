export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATIONS_MANAGER = 'operations_manager',
  REGIONAL_MANAGER = 'regional_manager',
  LBC_MANAGER = 'lbc_manager',
  FINANCE_MANAGER = 'finance_manager',
  WAREHOUSE_MANAGER = 'warehouse_manager',
  LOGISTICS_MANAGER = 'logistics_manager',
  QA_OFFICER = 'qa_officer',
  CUSTOMER_SUPPORT = 'customer_support',
  AUDITOR = 'auditor',
  ANALYST = 'analyst',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.OPERATIONS_MANAGER]: 'Operations Manager',
  [UserRole.REGIONAL_MANAGER]: 'Regional Manager',
  [UserRole.LBC_MANAGER]: 'LBC Manager',
  [UserRole.FINANCE_MANAGER]: 'Finance Manager',
  [UserRole.WAREHOUSE_MANAGER]: 'Warehouse Manager',
  [UserRole.LOGISTICS_MANAGER]: 'Logistics Manager',
  [UserRole.QA_OFFICER]: 'Quality Assurance Officer',
  [UserRole.CUSTOMER_SUPPORT]: 'Customer Support',
  [UserRole.AUDITOR]: 'Auditor',
  [UserRole.ANALYST]: 'Read-only Analyst',
};
