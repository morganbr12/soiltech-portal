export enum Permission {
  // Dashboard
  DASHBOARD_VIEW = 'dashboard:view',

  // Users
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',

  // LBC
  LBC_VIEW = 'lbc:view',
  LBC_CREATE = 'lbc:create',
  LBC_EDIT = 'lbc:edit',
  LBC_DELETE = 'lbc:delete',
  LBC_SUSPEND = 'lbc:suspend',

  // Agents
  AGENTS_VIEW = 'agents:view',
  AGENTS_CREATE = 'agents:create',
  AGENTS_EDIT = 'agents:edit',
  AGENTS_TRANSFER = 'agents:transfer',
  AGENTS_TRACK = 'agents:track',

  // Farmers
  FARMERS_VIEW = 'farmers:view',
  FARMERS_CREATE = 'farmers:create',
  FARMERS_APPROVE = 'farmers:approve',
  FARMERS_EDIT = 'farmers:edit',

  // Farms
  FARMS_VIEW = 'farms:view',
  FARMS_CREATE = 'farms:create',
  FARMS_EDIT = 'farms:edit',

  // Produce
  PRODUCE_VIEW = 'produce:view',
  PRODUCE_MANAGE = 'produce:manage',
  PRODUCE_APPROVE = 'produce:approve',

  // Warehouses
  WAREHOUSES_VIEW = 'warehouses:view',
  WAREHOUSES_MANAGE = 'warehouses:manage',
  WAREHOUSES_INVENTORY = 'warehouses:inventory',

  // Logistics
  LOGISTICS_VIEW = 'logistics:view',
  LOGISTICS_MANAGE = 'logistics:manage',
  LOGISTICS_DISPATCH = 'logistics:dispatch',

  // Tracking
  TRACKING_VIEW = 'tracking:view',
  TRACKING_REALTIME = 'tracking:realtime',

  // Payments
  PAYMENTS_VIEW = 'payments:view',
  PAYMENTS_APPROVE = 'payments:approve',
  PAYMENTS_PROCESS = 'payments:process',
  PAYMENTS_REFUND = 'payments:refund',

  // Reports
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export',

  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_ADVANCED = 'analytics:advanced',

  // Notifications
  NOTIFICATIONS_VIEW = 'notifications:view',
  NOTIFICATIONS_SEND = 'notifications:send',

  // Audit
  AUDIT_VIEW = 'audit:view',

  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_MANAGE = 'settings:manage',
  ROLES_MANAGE = 'roles:manage',

  // Customers
  CUSTOMERS_VIEW = 'customers:view',
  CUSTOMERS_CREATE = 'customers:create',
  CUSTOMERS_EDIT = 'customers:edit',
  CUSTOMERS_DELETE = 'customers:delete',
  CUSTOMERS_VERIFY = 'customers:verify',
  CUSTOMERS_ORDERS = 'customers:orders',
  CUSTOMERS_WALLET = 'customers:wallet',
  CUSTOMERS_NOTIFICATIONS = 'customers:notifications',
  CUSTOMERS_ANALYTICS = 'customers:analytics',
  CUSTOMERS_REPORTS = 'customers:reports',
}
