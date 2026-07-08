import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { CustomerStore } from '../../../store/customer.store';
import { Customer, CustomerStatus } from '../../../domain/customer.model';

type CustomerRow = Customer & Record<string, unknown>;

@Component({
  selector: 'app-customer-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Verification"
        subtitle="Review and approve or reject customer KYC submissions"
        icon="verified_user"
        [badge]="store.customerSummary().pending"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Verification' }]"
      >
        <button class="btn btn-secondary btn-sm" (click)="bulkApprove()">
          <span class="material-symbols-rounded">done_all</span> Bulk Approve
        </button>
      </app-page-header>

      <!-- Verification stats -->
      <div class="verif-stats">
        @for (s of verifStats(); track s.label) {
          <div class="verif-stat" [class.clickable]="true" (click)="setTab(s.value)">
            <div class="verif-stat__icon" [style.background]="s.bg">
              <span class="material-symbols-rounded" [style.color]="s.color">{{ s.icon }}</span>
            </div>
            <div class="verif-stat__count">{{ s.count }}</div>
            <div class="verif-stat__label">{{ s.label }}</div>
          </div>
        }
      </div>

      <!-- Tabs -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of tabs(); track tab.value) {
            <button class="filter-tab" [class.active]="activeTab() === tab.value" (click)="setTab(tab.value)">
              {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <!-- Pending verification detail panel -->
      @if (activeTab() === CustomerStatus.PENDING && pendingList().length > 0) {
        <div class="kyc-panel">
          <div class="kyc-list">
            @for (c of pendingList().slice(0, 5); track c.id) {
              <div class="kyc-card" [class.selected]="selected()?.id === c.id" (click)="select(c)">
                <div class="kyc-avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>
                <div class="kyc-info">
                  <div class="kyc-name">{{ c.firstName }} {{ c.lastName }}</div>
                  <div class="kyc-sub">{{ c.region }} · {{ c.joinedDate }}</div>
                </div>
                <span class="badge badge--warning">Pending</span>
              </div>
            }
          </div>

          @if (selected()) {
            <div class="kyc-detail animate-fade-in">
              <div class="kyc-detail__header">
                <div class="kyc-detail__avatar">{{ selected()!.firstName[0] }}{{ selected()!.lastName[0] }}</div>
                <div>
                  <h3>{{ selected()!.firstName }} {{ selected()!.lastName }}</h3>
                  <p>{{ selected()!.email }} · {{ selected()!.phone }}</p>
                </div>
              </div>
              <div class="kyc-detail__fields">
                @for (field of getKycFields(selected()!); track field.label) {
                  <div class="kyc-field">
                    <div class="kyc-field__label">{{ field.label }}</div>
                    <div class="kyc-field__value">{{ field.value }}</div>
                  </div>
                }
              </div>
              <div class="kyc-detail__docs">
                <div class="kyc-doc-placeholder">
                  <span class="material-symbols-rounded">badge</span>
                  <span>National ID</span>
                </div>
                <div class="kyc-doc-placeholder">
                  <span class="material-symbols-rounded">home</span>
                  <span>Proof of Address</span>
                </div>
                <div class="kyc-doc-placeholder">
                  <span class="material-symbols-rounded">business</span>
                  <span>Business Cert.</span>
                </div>
              </div>
              <div class="kyc-detail__actions">
                <textarea class="kyc-notes" rows="2" placeholder="Add verification note..."></textarea>
                <div style="display:flex;gap:8px;margin-top:10px">
                  <button class="btn btn-error btn-sm" (click)="rejectCustomer(selected()!)">
                    <span class="material-symbols-rounded">cancel</span> Reject
                  </button>
                  <button class="btn btn-primary btn-sm" style="flex:1" (click)="approveCustomer(selected()!)">
                    <span class="material-symbols-rounded">verified</span> Approve & Verify
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Table for all tabs -->
      <app-data-table
        [data]="filteredCustomers()"
        [columns]="columns"
        [actions]="tableActions"
        [loading]="store.isLoadingCustomers()"
        [searchable]="true"
        searchPlaceholder="Search customers..."
      />
    </div>
  `,
  styles: [`
    .verif-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .verif-stat {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--color-primary); }
    }
    .verif-stat__icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; span { font-size: 22px; font-variation-settings: 'FILL' 1; } }
    .verif-stat__count { font-size: 1.75rem; font-weight: 800; color: var(--color-text-primary); }
    .verif-stat__label { font-size: 0.75rem; color: var(--color-text-muted); }

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
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }

    .kyc-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .kyc-list { display: flex; flex-direction: column; gap: 8px; }
    .kyc-card {
      display: flex; align-items: center; gap: 10px; padding: 12px;
      background: var(--color-surface); border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);
      &:hover, &.selected { border-color: var(--color-primary); background: rgba(26,122,74,0.05); }
    }
    .kyc-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .kyc-info { flex: 1; min-width: 0; }
    .kyc-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
    .kyc-sub { font-size: 0.75rem; color: var(--color-text-muted); }

    .kyc-detail {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
    }
    .kyc-detail__header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .kyc-detail__avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; flex-shrink: 0; }
    .kyc-detail__header h3 { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
    .kyc-detail__header p { font-size: 0.8125rem; color: var(--color-text-muted); }

    .kyc-detail__fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .kyc-field { background: var(--color-surface-2); border-radius: 8px; padding: 10px; }
    .kyc-field__label { font-size: 0.6875rem; color: var(--color-text-muted); margin-bottom: 2px; }
    .kyc-field__value { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }

    .kyc-detail__docs { display: flex; gap: 10px; margin-bottom: 16px; }
    .kyc-doc-placeholder {
      flex: 1; border: 2px dashed var(--color-border); border-radius: 10px; padding: 16px;
      display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer;
      transition: all var(--transition-fast); font-size: 0.75rem; color: var(--color-text-muted);
      span.material-symbols-rounded { font-size: 28px; color: var(--color-text-muted); }
      &:hover { border-color: var(--color-primary); color: var(--color-primary); span { color: var(--color-primary); } }
    }

    .kyc-notes { width: 100%; border: 1px solid var(--color-border); border-radius: 8px; padding: 10px; font-size: 0.875rem; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); resize: none; box-sizing: border-box; }

    .btn-error { background: #dc2626; color: white; border: none; &:hover { background: #b91c1c; } }
  `]
})
export class CustomerVerificationComponent implements OnInit {
  protected readonly store = inject(CustomerStore);
  readonly CustomerStatus = CustomerStatus;

  readonly activeTab = signal<string>(CustomerStatus.PENDING);
  readonly selected = signal<CustomerRow | null>(null);
  regionFilter = '';

  readonly regions = computed(() =>
    [...new Set(this.store.customers().map(c => c.region))].sort()
  );

  readonly verifStats = computed(() => {
    const s = this.store.customerSummary();
    return [
      { label: 'Pending Review', value: CustomerStatus.PENDING, count: s.pending, icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      { label: 'Verified', value: CustomerStatus.VERIFIED, count: s.verified, icon: 'verified', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
      { label: 'Active', value: CustomerStatus.ACTIVE, count: s.active, icon: 'check_circle', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'Rejected', value: CustomerStatus.REJECTED, count: s.rejected, icon: 'cancel', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
    ];
  });

  readonly tabs = computed(() => {
    const s = this.store.customerSummary();
    return [
      { label: 'Pending', value: CustomerStatus.PENDING, count: s.pending },
      { label: 'Verified', value: CustomerStatus.VERIFIED, count: s.verified },
      { label: 'Active', value: CustomerStatus.ACTIVE, count: s.active },
      { label: 'Rejected', value: CustomerStatus.REJECTED, count: s.rejected },
    ];
  });

  readonly pendingList = computed(() =>
    this.store.customers().filter(c => c.status === CustomerStatus.PENDING) as CustomerRow[]
  );

  readonly filteredCustomers = computed(() => {
    let data = this.store.customers() as CustomerRow[];
    if (this.activeTab() !== 'all') data = data.filter(c => c.status === this.activeTab());
    if (this.regionFilter) data = data.filter(c => c.region === this.regionFilter);
    return data;
  });

  readonly columns: Column<CustomerRow>[] = [
    { key: 'id', label: 'ID', width: '110px' },
    { key: 'firstName', label: 'Customer', type: 'avatar', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'nationalId', label: 'National ID' },
    { key: 'joinedDate', label: 'Submitted', type: 'date', sortable: true },
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
  ];

  readonly tableActions: TableAction<CustomerRow>[] = [
    { label: 'Approve', icon: 'verified', condition: (r) => r.status === CustomerStatus.PENDING,
      handler: (r) => this.approveCustomer(r) },
    { label: 'Reject', icon: 'cancel', color: '#dc2626', condition: (r) => r.status === CustomerStatus.PENDING,
      handler: (r) => this.rejectCustomer(r) },
    { label: 'View', icon: 'visibility', handler: (r) => console.log('view', r.id) },
  ];

  ngOnInit(): void {
    this.store.loadCustomers({});
  }

  setTab(val: string): void { this.activeTab.set(val); }
  doFilter(): void {}
  select(c: CustomerRow): void { this.selected.set(c); }
  bulkApprove(): void { console.log('bulk approve'); }

  approveCustomer(c: CustomerRow): void {
    this.store.verifyCustomer(c.id, {
      onSuccess: () => { this.selected.set(this.pendingList()[0] ?? null); },
      onError: (e) => console.error(e),
    });
  }

  rejectCustomer(c: CustomerRow): void {
    this.store.rejectCustomer(c.id, '', {
      onSuccess: () => { this.selected.set(this.pendingList()[0] ?? null); },
      onError: (e) => console.error(e),
    });
  }

  getKycFields(c: CustomerRow): { label: string; value: string }[] {
    return [
      { label: 'Full Name', value: `${c.firstName} ${c.lastName}` },
      { label: 'National ID', value: String(c.nationalId ?? 'N/A') },
      { label: 'Phone', value: String(c.phone) },
      { label: 'Region', value: String(c.region) },
      { label: 'District', value: String(c.district) },
      { label: 'Business', value: String(c.businessName ?? 'Individual') },
    ];
  }
}
