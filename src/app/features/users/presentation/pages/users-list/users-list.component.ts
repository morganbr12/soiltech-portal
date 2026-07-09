import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { AddUserDrawerComponent } from '../../components/add-user-drawer/add-user-drawer.component';
import { UserStore } from '../../../store/user.store';
import { PortalUser } from '../../../domain/user.model';
import { UserRole, ROLE_LABELS } from '../../../../../core/enums/roles.enum';
import { ToastService } from '../../../../../shared/services/toast.service';

type UserRow = PortalUser & Record<string, unknown>;

const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
];

const ROLE_TABS = [
  { label: 'All Roles',         value: '' },
  { label: 'Super Admin',       value: UserRole.SUPER_ADMIN },
  { label: 'Operations',        value: UserRole.OPERATIONS_MANAGER },
  { label: 'LBC Manager',       value: UserRole.LBC_MANAGER },
  { label: 'Finance',           value: UserRole.FINANCE_MANAGER },
  { label: 'Logistics',         value: UserRole.LOGISTICS_MANAGER },
  { label: 'Warehouse',         value: UserRole.WAREHOUSE_MANAGER },
  { label: 'QA Officer',        value: UserRole.QA_OFFICER },
  { label: 'Customer Support',  value: UserRole.CUSTOMER_SUPPORT },
  { label: 'Auditor',           value: UserRole.AUDITOR },
  { label: 'Analyst',           value: UserRole.ANALYST },
];

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent, AddUserDrawerComponent],
  template: `
    @if (showAddDrawer()) {
      <app-add-user-drawer
        (closed)="showAddDrawer.set(false)"
        (created)="onUserCreated($event)"
      />
    }

    <div class="page-container">
      <app-page-header
        title="Users & Access"
        subtitle="Manage portal users, roles, and permissions"
        icon="group"
        [badge]="store.meta().total"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Users' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">security</span> Manage Roles
        </button>
        <button class="btn btn-primary btn-sm" (click)="showAddDrawer.set(true)">
          <span class="material-symbols-rounded">person_add</span> Add User
        </button>
      </app-page-header>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs; track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
              {{ tab.label }}
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="roleFilter" (change)="doFilter()">
            @for (r of roleTabs; track r.value) {
              <option [value]="r.value">{{ r.label }}</option>
            }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="store.users()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search by name or email..."
      />
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab { padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; } }
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `],
})
export class UsersListComponent implements OnInit {
  protected readonly store = inject(UserStore);
  private readonly toast   = inject(ToastService);

  readonly showAddDrawer = signal(false);
  readonly activeStatus  = signal('');
  roleFilter = '';

  readonly statusTabs = STATUS_TABS;
  readonly roleTabs   = ROLE_TABS;

  readonly columns: Column<UserRow>[] = [
    { key: 'fullName',    label: 'User',       type: 'avatar', sortable: true },
    { key: 'email',       label: 'Email',      sortable: true },
    { key: 'adminRole',   label: 'Role',       sortable: true,
      format: (v) => ROLE_LABELS[v as UserRole] ?? String(v) },
    { key: 'region',      label: 'Region',     sortable: true },
    { key: 'phone',       label: 'Phone' },
    { key: 'status',      label: 'Status',     type: 'status', align: 'center',
      statusMap: {
        active:   { label: 'Active',   class: 'badge--success' },
        inactive: { label: 'Inactive', class: 'badge--neutral' },
      }
    },
    { key: 'lastLoginAt', label: 'Last Login', type: 'date', sortable: true },
    { key: 'createdAt',   label: 'Created',    type: 'date', sortable: true },
  ];

  readonly actions: TableAction<UserRow>[] = [
    { label: 'Edit User',   icon: 'edit',            handler: (r) => console.log('edit', r['id']) },
    { label: 'Change Role', icon: 'manage_accounts', handler: (r) => console.log('role', r['id']) },
    { label: 'Deactivate',  icon: 'block', color: '#dc2626',
      condition: (r) => r['status'] === 'active',
      handler: (r) => console.log('deactivate', r['id']) },
  ];

  ngOnInit(): void {
    this.store.load({});
  }

  setStatus(value: string): void {
    this.activeStatus.set(value);
    this.doFilter();
  }

  doFilter(): void {
    this.store.load({
      role:      this.roleFilter    || undefined,
      is_active: this.activeStatus() !== '' ? this.activeStatus() === 'true' : undefined,
    });
  }

  onUserCreated(user: PortalUser): void {
    this.store.prependUser(user);
    this.showAddDrawer.set(false);
    this.toast.success(`${user.fullName} added successfully`);
  }
}
