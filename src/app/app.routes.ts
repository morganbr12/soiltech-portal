import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { Permission } from './core/enums/permissions.enum';

export const routes: Routes = [
  // ─── Root redirect ─────────────────────────────────────────────────────────
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // ─── Auth routes ───────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./core/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./features/dashboard/presentation/pages/login/login.component').then(m => m.LoginComponent),
      },
    ],
  },

  // ─── Admin routes ──────────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/presentation/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.DASHBOARD_VIEW] },
      },

      // LBC
      {
        path: 'lbc',
        loadComponent: () => import('./features/lbc/presentation/pages/lbc-list/lbc-list.component').then(m => m.LbcListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.LBC_VIEW] },
      },

      // Agents
      {
        path: 'agents',
        loadComponent: () => import('./features/agents/presentation/pages/agents-list/agents-list.component').then(m => m.AgentsListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.AGENTS_VIEW] },
      },

      // Farmers
      {
        path: 'farmers',
        loadComponent: () => import('./features/farmers/presentation/pages/farmers-list/farmers-list.component').then(m => m.FarmersListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.FARMERS_VIEW] },
      },

      // Farms
      {
        path: 'farms',
        loadComponent: () => import('./features/farms/presentation/pages/farms-list/farms-list.component').then(m => m.FarmsListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.FARMS_VIEW] },
      },

      // Produce
      {
        path: 'produce',
        loadComponent: () => import('./features/produce/presentation/pages/produce-list/produce-list.component').then(m => m.ProduceListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.PRODUCE_VIEW] },
      },

      // Warehouses
      {
        path: 'warehouses',
        loadComponent: () => import('./features/warehouses/presentation/pages/warehouses-list/warehouses-list.component').then(m => m.WarehousesListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.WAREHOUSES_VIEW] },
      },

      // Logistics
      {
        path: 'logistics',
        loadComponent: () => import('./features/logistics/presentation/pages/logistics/logistics.component').then(m => m.LogisticsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.LOGISTICS_VIEW] },
      },

      // Live Tracking
      {
        path: 'tracking',
        loadComponent: () => import('./features/tracking/presentation/pages/tracking-map/tracking-map.component').then(m => m.TrackingMapComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.TRACKING_VIEW] },
      },

      // Payments
      {
        path: 'payments',
        loadComponent: () => import('./features/payments/presentation/pages/payments-list/payments-list.component').then(m => m.PaymentsListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.PAYMENTS_VIEW] },
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/presentation/pages/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.REPORTS_VIEW] },
      },

      // Analytics
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/presentation/pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.ANALYTICS_VIEW] },
      },

      // Users
      {
        path: 'users',
        loadComponent: () => import('./features/users/presentation/pages/users-list/users-list.component').then(m => m.UsersListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.USERS_VIEW] },
      },

      // Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/presentation/pages/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.NOTIFICATIONS_VIEW] },
      },

      // Audit Logs
      {
        path: 'audit',
        loadComponent: () => import('./features/audit/presentation/pages/audit/audit.component').then(m => m.AuditComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.AUDIT_VIEW] },
      },

      // Settings
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/presentation/pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.SETTINGS_VIEW] },
      },

      // Customers
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/presentation/pages/dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_VIEW] },
      },
      {
        path: 'customers/list',
        loadComponent: () => import('./features/customers/presentation/pages/list/customer-list.component').then(m => m.CustomerListComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_VIEW] },
      },
      {
        path: 'customers/verification',
        loadComponent: () => import('./features/customers/presentation/pages/verification/customer-verification.component').then(m => m.CustomerVerificationComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_VERIFY] },
      },
      {
        path: 'customers/orders',
        loadComponent: () => import('./features/customers/presentation/pages/orders/customer-orders.component').then(m => m.CustomerOrdersComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_ORDERS] },
      },
      {
        path: 'customers/chats',
        loadComponent: () => import('./features/customers/presentation/pages/chats/customer-chats.component').then(m => m.CustomerChatsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_VIEW] },
      },
      {
        path: 'customers/reviews',
        loadComponent: () => import('./features/customers/presentation/pages/reviews/customer-reviews.component').then(m => m.CustomerReviewsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_VIEW] },
      },
      {
        path: 'customers/wallets',
        loadComponent: () => import('./features/customers/presentation/pages/wallets/customer-wallets.component').then(m => m.CustomerWalletsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_WALLET] },
      },
      {
        path: 'customers/analytics',
        loadComponent: () => import('./features/customers/presentation/pages/analytics/customer-analytics.component').then(m => m.CustomerAnalyticsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_ANALYTICS] },
      },
      {
        path: 'customers/notifications',
        loadComponent: () => import('./features/customers/presentation/pages/notifications/customer-notifications.component').then(m => m.CustomerNotificationsComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_NOTIFICATIONS] },
      },
      {
        path: 'customers/map',
        loadComponent: () => import('./features/customers/presentation/pages/map/customer-map.component').then(m => m.CustomerMapComponent),
        canActivate: [permissionGuard],
        data: { permissions: [Permission.CUSTOMERS_VIEW] },
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/presentation/pages/profile/profile.component').then(m => m.ProfileComponent),
      },

      // 403
      {
        path: '403',
        loadComponent: () => import('./shared/components/error-pages/forbidden.component').then(m => m.ForbiddenComponent),
      },
    ],
  },

  // ─── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./shared/components/error-pages/not-found.component').then(m => m.NotFoundComponent),
  },
];
