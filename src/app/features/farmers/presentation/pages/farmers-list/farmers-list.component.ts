import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_FARMERS } from '../../../../../shared/data/mock-data';
import { EntityStatus } from '../../../../../core/enums/status.enum';

type Farmer = typeof MOCK_FARMERS[number];

@Component({
  selector: 'app-farmers-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Farmer Management"
        subtitle="Register, verify, and manage farmers across all regions"
        icon="person_pin"
        [badge]="MOCK_FARMERS.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Farmers' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">person_add</span> Register Farmer
        </button>
      </app-page-header>

      <app-data-table
        [data]="farmers()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        searchPlaceholder="Search by name, ID, phone, region..."
      />
    </div>
  `
})
export class FarmersListComponent implements OnInit {
  readonly MOCK_FARMERS = MOCK_FARMERS;
  readonly farmers = signal(MOCK_FARMERS as Farmer[]);
  readonly loading = signal(false);

  readonly columns: Column<Farmer>[] = [
    { key: 'id', label: 'Farmer ID', width: '140px', sortable: true },
    { key: 'fullName', label: 'Name', type: 'avatar', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'agentName', label: 'Agent', sortable: true },
    { key: 'farmsCount', label: 'Farms', align: 'center', sortable: true },
    { key: 'totalFarmSize', label: 'Farm Size (ha)', align: 'right', sortable: true },
    { key: 'walletBalance', label: 'Wallet', type: 'currency', align: 'right', sortable: true },
    { key: 'totalEarnings', label: 'Earnings', type: 'currency', align: 'right', sortable: true },
    { key: 'kycVerified', label: 'KYC', align: 'center', format: (v) => v ? '✓ Verified' : '⏳ Pending' },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [EntityStatus.APPROVED]: { label: 'Approved', class: 'badge--success' },
        [EntityStatus.PENDING]: { label: 'Pending', class: 'badge--warning' },
        [EntityStatus.REJECTED]: { label: 'Rejected', class: 'badge--error' },
      }
    },
    { key: 'joinedDate', label: 'Joined', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Farmer>[] = [
    { label: 'View Profile', icon: 'visibility', handler: (r) => console.log('view', r.id) },
    { label: 'Approve', icon: 'check_circle', color: '#16a34a', condition: (r) => r.status === EntityStatus.PENDING, handler: (r) => console.log('approve', r.id) },
    { label: 'View Farms', icon: 'agriculture', handler: (r) => console.log('farms', r.id) },
    { label: 'Payments', icon: 'payments', color: '#1a7a4a', handler: (r) => console.log('payments', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 700);
  }
}
