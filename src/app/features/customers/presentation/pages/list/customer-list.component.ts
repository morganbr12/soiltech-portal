import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_CUSTOMERS } from '../../../data/customer.mock';
import { Customer, CustomerStatus, CustomerTier } from '../../../domain/customer.model';

type CustomerRow = Customer & Record<string, unknown>;

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Management"
        subtitle="Manage all registered buyers across regions"
        icon="people"
        [badge]="customers().length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'All Customers' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm" (click)="addCustomer()">
          <span class="material-symbols-rounded">person_add</span> Add Customer
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="quick-stats stagger-children">
        @for (stat of stats; track stat.label) {
          <div class="quick-stat animate-slide-up">
            <div class="qs-icon" [style.background]="stat.bg">
              <span class="material-symbols-rounded" [style.color]="stat.color">{{ stat.icon }}</span>
            </div>
            <div>
              <div class="qs-value">{{ stat.value }}</div>
              <div class="qs-label">{{ stat.label }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs; track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
              {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of regions; track r) { <option [value]="r">{{ r }}</option> }
          </select>
          <select class="filter-select" [(ngModel)]="tierFilter" (change)="doFilter()">
            <option value="">All Tiers</option>
            @for (t of tiers; track t) { <option [value]="t">{{ t }}</option> }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="filteredCustomers()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search customers by name, email, region..."
      >
        <div bulk-actions>
          <button class="btn btn-ghost btn-sm">Suspend Selected</button>
          <button class="btn btn-ghost btn-sm">Export Selected</button>
        </div>
        <div toolbar-actions>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded">map</span> Map View
          </button>
        </div>
      </app-data-table>
    </div>
  `,
  styles: [`
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .quick-stat {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .qs-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      span { font-size: 20px; font-variation-settings: 'FILL' 1; }
    }
    .qs-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .qs-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab {
      display: flex; align-items: center; gap: 6px; padding: 6px 14px;
      border: none; border-radius: 7px; cursor: pointer; background: transparent;
      font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary);
      transition: all var(--transition-fast); font-family: inherit;
      &.active { background: var(--color-primary); color: white; .tab-count { background: rgba(255,255,255,0.25); color: white; } }
    }
    .tab-count { background: var(--color-border-light); color: var(--color-text-muted); font-size: 0.6875rem; font-weight: 700; padding: 1px 6px; border-radius: 99px; }
    .filter-right { display: flex; gap: 8px; align-items: center; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class CustomerListComponent implements OnInit {
  readonly customers = signal(MOCK_CUSTOMERS as CustomerRow[]);
  readonly loading = signal(false);
  readonly activeStatus = signal('all');
  regionFilter = '';
  tierFilter = '';

  readonly regions = [...new Set(MOCK_CUSTOMERS.map(c => c.region))].sort();
  readonly tiers = Object.values(CustomerTier);

  readonly stats = [
    { label: 'Total Customers', value: MOCK_CUSTOMERS.length, icon: 'people', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
    { label: 'Active', value: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.ACTIVE).length, icon: 'person_check', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    { label: 'Verified', value: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.VERIFIED).length, icon: 'verified', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
    { label: 'Pending', value: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.PENDING).length, icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    { label: 'Suspended', value: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.SUSPENDED).length, icon: 'block', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  ];

  readonly statusTabs = [
    { label: 'All', value: 'all', count: MOCK_CUSTOMERS.length },
    { label: 'Active', value: CustomerStatus.ACTIVE, count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.ACTIVE).length },
    { label: 'Verified', value: CustomerStatus.VERIFIED, count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.VERIFIED).length },
    { label: 'Pending', value: CustomerStatus.PENDING, count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.PENDING).length },
    { label: 'Suspended', value: CustomerStatus.SUSPENDED, count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.SUSPENDED).length },
  ];

  readonly filteredCustomers = computed(() => {
    let data = this.customers();
    if (this.activeStatus() !== 'all') data = data.filter(c => c.status === this.activeStatus());
    if (this.regionFilter) data = data.filter(c => c.region === this.regionFilter);
    if (this.tierFilter) data = data.filter(c => c.tier === this.tierFilter);
    return data;
  });

  readonly columns: Column<CustomerRow>[] = [
    { key: 'id', label: 'ID', width: '110px', sortable: true },
    { key: 'firstName', label: 'Customer', sortable: true, type: 'avatar' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'tier', label: 'Tier', type: 'status', sortable: true,
      statusMap: {
        [CustomerTier.BRONZE]: { label: 'Bronze', class: 'badge--neutral' },
        [CustomerTier.SILVER]: { label: 'Silver', class: 'badge--info' },
        [CustomerTier.GOLD]: { label: 'Gold', class: 'badge--warning' },
        [CustomerTier.PLATINUM]: { label: 'Platinum', class: 'badge--success' },
      }
    },
    { key: 'totalOrders', label: 'Orders', type: 'number', align: 'center', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', type: 'currency', align: 'right', sortable: true },
    { key: 'rating', label: 'Rating', align: 'center', format: (v) => `${v} ★` },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [CustomerStatus.ACTIVE]: { label: 'Active', class: 'badge--success' },
        [CustomerStatus.VERIFIED]: { label: 'Verified', class: 'badge--info' },
        [CustomerStatus.PENDING]: { label: 'Pending', class: 'badge--warning' },
        [CustomerStatus.SUSPENDED]: { label: 'Suspended', class: 'badge--error' },
        [CustomerStatus.REJECTED]: { label: 'Rejected', class: 'badge--neutral' },
      }
    },
    { key: 'joinedDate', label: 'Joined', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<CustomerRow>[] = [
    { label: 'View Profile', icon: 'person', handler: (row) => console.log('view', row.id) },
    { label: 'Edit', icon: 'edit', handler: (row) => console.log('edit', row.id) },
    { label: 'Verify', icon: 'verified', condition: (row) => row.status === CustomerStatus.PENDING, handler: (row) => console.log('verify', row.id) },
    { label: 'Suspend', icon: 'block', color: '#dc2626', condition: (row) => row.status === CustomerStatus.ACTIVE || row.status === CustomerStatus.VERIFIED, handler: (row) => console.log('suspend', row.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }

  setStatus(status: string): void { this.activeStatus.set(status); }
  doFilter(): void {}
  addCustomer(): void { console.log('add customer'); }
}
