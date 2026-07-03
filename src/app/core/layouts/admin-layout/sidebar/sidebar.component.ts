import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AppStore } from '../../../state/app.store';
import { Permission } from '../../../enums/permissions.enum';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  permission?: Permission;
  badge?: number;
  children?: NavItem[];
  divider?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', permission: Permission.DASHBOARD_VIEW },
  { label: 'divider', icon: '', divider: true },
  { label: 'Operations', icon: 'business_center', route: '/lbc', permission: Permission.LBC_VIEW },
  { label: 'Agents', icon: 'badge', route: '/agents', permission: Permission.AGENTS_VIEW },
  { label: 'Farmers', icon: 'person_pin', route: '/farmers', permission: Permission.FARMERS_VIEW },
  { label: 'Farms', icon: 'agriculture', route: '/farms', permission: Permission.FARMS_VIEW },
  { label: 'divider', icon: '', divider: true },
  { label: 'Produce', icon: 'eco', route: '/produce', permission: Permission.PRODUCE_VIEW },
  { label: 'Warehouses', icon: 'warehouse', route: '/warehouses', permission: Permission.WAREHOUSES_VIEW },
  { label: 'divider', icon: '', divider: true },
  { label: 'Logistics', icon: 'local_shipping', route: '/logistics', permission: Permission.LOGISTICS_VIEW },
  { label: 'Live Tracking', icon: 'location_on', route: '/tracking', permission: Permission.TRACKING_VIEW },
  { label: 'divider', icon: '', divider: true },
  { label: 'Payments', icon: 'payments', route: '/payments', permission: Permission.PAYMENTS_VIEW },
  { label: 'Reports', icon: 'assessment', route: '/reports', permission: Permission.REPORTS_VIEW },
  { label: 'Analytics', icon: 'insights', route: '/analytics', permission: Permission.ANALYTICS_VIEW },
  { label: 'divider', icon: '', divider: true },
  { label: 'divider', icon: '', divider: true },
  { label: 'Customers', icon: 'people', route: '/customers', permission: Permission.CUSTOMERS_VIEW },
  { label: 'Verification', icon: 'verified_user', route: '/customers/verification', permission: Permission.CUSTOMERS_VERIFY },
  { label: 'Cust. Orders', icon: 'shopping_bag', route: '/customers/orders', permission: Permission.CUSTOMERS_ORDERS },
  { label: 'Cust. Wallets', icon: 'account_balance_wallet', route: '/customers/wallets', permission: Permission.CUSTOMERS_WALLET },
  { label: 'Cust. Reviews', icon: 'star', route: '/customers/reviews', permission: Permission.CUSTOMERS_VIEW },
  { label: 'Cust. Chats', icon: 'chat', route: '/customers/chats', permission: Permission.CUSTOMERS_VIEW },
  { label: 'Cust. Analytics', icon: 'insights', route: '/customers/analytics', permission: Permission.CUSTOMERS_ANALYTICS },
  { label: 'Cust. Map', icon: 'map', route: '/customers/map', permission: Permission.CUSTOMERS_VIEW },
  { label: 'divider', icon: '', divider: true },
  { label: 'Users', icon: 'group', route: '/users', permission: Permission.USERS_VIEW },
  { label: 'Notifications', icon: 'notifications', route: '/notifications', permission: Permission.NOTIFICATIONS_VIEW },
  { label: 'Audit Logs', icon: 'history', route: '/audit', permission: Permission.AUDIT_VIEW },
  { label: 'Settings', icon: 'settings', route: '/settings', permission: Permission.SETTINGS_VIEW },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <!-- Logo -->
      <div class="sidebar__logo">
        <div class="logo-mark">
          <span class="logo-icon">🌱</span>
        </div>
        @if (!collapsed()) {
          <div class="logo-text animate-fade-in">
            <span class="logo-name">SoilTech</span>
            <span class="logo-tagline">Portal</span>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        @for (item of visibleItems(); track item.label) {
          @if (item.divider) {
            <div class="nav-divider"></div>
          } @else {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              [title]="collapsed() ? item.label : ''"
            >
              <span class="material-symbols-rounded nav-icon">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              }
            </a>
          }
        }
      </nav>

      <!-- User Section -->
      @if (!collapsed()) {
        <div class="sidebar__user animate-fade-in">
          <div class="user-info">
            <img
              [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user()?.firstName"
              [alt]="store.userFullName()"
              class="user-avatar"
            />
            <div class="user-details">
              <span class="user-name">{{ store.userFullName() }}</span>
              <span class="user-role">{{ formatRole(user()?.role) }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Collapse Toggle -->
      <button class="sidebar__toggle" (click)="store.toggleSidebar()" [title]="collapsed() ? 'Expand' : 'Collapse'">
        <span class="material-symbols-rounded">
          {{ collapsed() ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border-light);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: width var(--transition-base);
      overflow: hidden;

      &.collapsed {
        width: var(--sidebar-collapsed);
        .nav-item { justify-content: center; padding: 10px; }
        .nav-label { display: none; }
        .sidebar__logo { justify-content: center; padding: 16px 8px; }
        .logo-text { display: none; }
      }
    }

    .sidebar__logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 16px 12px;
      border-bottom: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }

    .logo-mark {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-icon { font-size: 20px; }
    .logo-name { font-weight: 800; font-size: 1.125rem; color: var(--color-primary); letter-spacing: -0.03em; display: block; }
    .logo-tagline { font-size: 0.6875rem; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; display: block; }

    .sidebar__nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;

      &::-webkit-scrollbar { width: 0; }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      position: relative;

      &:hover {
        background: rgba(26, 122, 74, 0.08);
        color: var(--color-primary);
      }

      &.active {
        background: rgba(26, 122, 74, 0.12);
        color: var(--color-primary);
        font-weight: 600;
      }
    }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;

      .active & {
        font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
      }
    }

    .nav-label { flex: 1; white-space: nowrap; }

    .nav-badge {
      background: var(--color-primary);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 999px;
      min-width: 18px;
      text-align: center;
    }

    .nav-divider {
      height: 1px;
      background: var(--color-border-light);
      margin: 6px 8px;
    }

    .sidebar__user {
      border-top: 1px solid var(--color-border-light);
      padding: 12px;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 8px;
      background: var(--color-surface-2);
    }

    .user-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; background: var(--color-border-light); }
    .user-name { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
    .user-role { font-size: 0.6875rem; color: var(--color-text-muted); display: block; }
    .user-details { overflow: hidden; }

    .sidebar__toggle {
      position: absolute;
      right: -12px;
      top: 72px;
      width: 24px;
      height: 24px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      z-index: 1;

      span { font-size: 16px; color: var(--color-text-secondary); }

      &:hover {
        background: var(--color-primary);
        border-color: var(--color-primary);
        span { color: white; }
      }
    }
  `]
})
export class SidebarComponent {
  readonly store = inject(AppStore);
  readonly collapsed = this.store.sidebarCollapsed;
  readonly user = this.store.user;

  readonly visibleItems = computed(() => {
    const perms = this.store.permissions();
    return NAV_ITEMS.filter(item =>
      item.divider || !item.permission || perms.includes(item.permission)
    );
  });

  formatRole(role?: string): string {
    return role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '';
  }
}
