import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_PORTAL_USERS } from '../../../../../shared/data/mock-data';
import { EntityStatus } from '../../../../../core/enums/status.enum';
import { ROLE_LABELS } from '../../../../../core/enums/roles.enum';

type PortalUser = typeof MOCK_PORTAL_USERS[number];

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Users & Access"
        subtitle="Manage portal users, roles, and permissions"
        icon="group"
        [badge]="MOCK_PORTAL_USERS.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Users' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">security</span> Manage Roles
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">person_add</span> Invite User
        </button>
      </app-page-header>

      <app-data-table
        [data]="users()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        searchPlaceholder="Search users by name, email, role..."
      />
    </div>
  `
})
export class UsersListComponent implements OnInit {
  readonly MOCK_PORTAL_USERS = MOCK_PORTAL_USERS;
  readonly users = signal(MOCK_PORTAL_USERS as PortalUser[]);
  readonly loading = signal(false);

  readonly columns: Column<PortalUser>[] = [
    { key: 'fullName', label: 'User', type: 'avatar', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true, format: (v) => ROLE_LABELS[v as keyof typeof ROLE_LABELS] ?? String(v) },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [EntityStatus.ACTIVE]: { label: 'Active', class: 'badge--success' },
        [EntityStatus.INACTIVE]: { label: 'Inactive', class: 'badge--neutral' },
      }
    },
    { key: 'lastLogin', label: 'Last Login', type: 'date', sortable: true },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<PortalUser>[] = [
    { label: 'Edit User', icon: 'edit', handler: (r) => console.log('edit', r.id) },
    { label: 'Change Role', icon: 'manage_accounts', handler: (r) => console.log('role', r.id) },
    { label: 'Deactivate', icon: 'block', color: '#dc2626', condition: (r) => r.status === EntityStatus.ACTIVE, handler: (r) => console.log('deactivate', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
