import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerWallet, WalletStatus } from '../../../domain/customer.model';

type WalletRow = CustomerWallet & Record<string, unknown>;

@Component({
  selector: 'app-customer-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Customer Wallets"
        subtitle="Monitor wallet balances, transactions, and statuses"
        icon="account_balance_wallet"
        [badge]="store.wallets().length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Wallets' }]"
      >
        <button class="btn btn-secondary btn-sm" (click)="exportWallets()">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm" (click)="topUp()">
          <span class="material-symbols-rounded">add_card</span> Top-Up
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="quick-stats stagger-children">
        @for (stat of stats(); track stat.label) {
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

      <!-- Balance Distribution -->
      <div class="balance-dist">
        <h3 class="section-title">Balance Distribution</h3>
        <div class="dist-bands">
          @for (band of balanceBands(); track band.label) {
            <div class="dist-band">
              <div class="dist-bar-wrap">
                <div class="dist-bar-fill" [style.height.%]="band.pct" [style.background]="band.color"></div>
              </div>
              <div class="dist-count">{{ band.count }}</div>
              <div class="dist-label">{{ band.label }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs(); track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
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

      <app-data-table
        [data]="filteredWallets()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoadingWallets()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search wallets by customer, ID..."
      >
        <div bulk-actions>
          <button class="btn btn-ghost btn-sm">Freeze Selected</button>
          <button class="btn btn-ghost btn-sm">Export Selected</button>
        </div>
      </app-data-table>
    </div>
  `,
  styles: [`
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .quick-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
    .qs-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 20px; font-variation-settings: 'FILL' 1; } }
    .qs-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .qs-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .balance-dist { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px; }
    .section-title { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 16px; }
    .dist-bands { display: flex; gap: 12px; align-items: flex-end; height: 100px; }
    .dist-band { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
    .dist-bar-wrap { width: 100%; background: var(--color-border-light); border-radius: 4px 4px 0 0; height: 70px; display: flex; align-items: flex-end; }
    .dist-bar-fill { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.5s ease; }
    .dist-count { font-size: 0.8125rem; font-weight: 700; color: var(--color-text-primary); }
    .dist-label { font-size: 0.6875rem; color: var(--color-text-muted); text-align: center; white-space: nowrap; }

    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; .tab-count { background: rgba(255,255,255,0.25); color: white; } } }
    .tab-count { background: var(--color-border-light); color: var(--color-text-muted); font-size: 0.6875rem; font-weight: 700; padding: 1px 6px; border-radius: 99px; }
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class CustomerWalletsComponent implements OnInit {
  protected readonly store = inject(CustomerStore);

  readonly activeStatus = signal('all');
  regionFilter = '';

  readonly regions = computed(() =>
    [...new Set(this.store.wallets().map(w => w.region))].sort()
  );

  readonly stats = computed(() => {
    const s = this.store.walletSummary();
    return [
      { label: 'Total Wallets', value: s.totalWallets, icon: 'account_balance_wallet', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
      { label: 'Total Balance', value: 'GHS ' + (s.totalBalance / 1000).toFixed(1) + 'K', icon: 'savings', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
      { label: 'Total Deposited', value: 'GHS ' + (s.totalDeposited / 1000).toFixed(1) + 'K', icon: 'add_card', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'Total Withdrawn', value: 'GHS ' + (s.totalWithdrawn / 1000).toFixed(1) + 'K', icon: 'money_off', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      { label: 'Frozen', value: s.frozen, icon: 'lock', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
    ];
  });

  readonly statusTabs = computed(() => {
    const wallets = this.store.wallets();
    const total = wallets.length;
    const active = wallets.filter(w => w.status === WalletStatus.ACTIVE).length;
    const frozen = wallets.filter(w => w.status === WalletStatus.FROZEN).length;
    const suspended = wallets.filter(w => w.status === WalletStatus.SUSPENDED).length;
    return [
      { label: 'All', value: 'all', count: total },
      { label: 'Active', value: WalletStatus.ACTIVE, count: active },
      { label: 'Frozen', value: WalletStatus.FROZEN, count: frozen },
      { label: 'Suspended', value: WalletStatus.SUSPENDED, count: suspended },
    ];
  });

  readonly balanceBands = computed(() => {
    const wallets = this.store.wallets();
    const total = wallets.length || 1;
    return [
      { label: 'GHS 0', count: wallets.filter(w => w.balance === 0).length, color: '#94a3b8' },
      { label: '< 500', count: wallets.filter(w => w.balance > 0 && w.balance < 500).length, color: '#d97706' },
      { label: '500-1K', count: wallets.filter(w => w.balance >= 500 && w.balance < 1000).length, color: '#0284c7' },
      { label: '1K-2K', count: wallets.filter(w => w.balance >= 1000 && w.balance < 2000).length, color: '#16a34a' },
      { label: '2K-5K', count: wallets.filter(w => w.balance >= 2000 && w.balance < 5000).length, color: '#1a7a4a' },
      { label: '5K+', count: wallets.filter(w => w.balance >= 5000).length, color: '#7c3aed' },
    ].map(b => ({ ...b, pct: Math.round(b.count / total * 100) }));
  });

  readonly filteredWallets = computed(() => {
    let data = this.store.wallets() as WalletRow[];
    if (this.activeStatus() !== 'all') data = data.filter(w => w.status === this.activeStatus());
    if (this.regionFilter) data = data.filter(w => w.region === this.regionFilter);
    return data;
  });

  readonly columns: Column<WalletRow>[] = [
    { key: 'id', label: 'Wallet ID', width: '110px' },
    { key: 'customerName', label: 'Customer', type: 'avatar', sortable: true },
    { key: 'balance', label: 'Balance', type: 'currency', align: 'right', sortable: true },
    { key: 'pendingAmount', label: 'Pending', type: 'currency', align: 'right' },
    { key: 'totalDeposited', label: 'Total In', type: 'currency', align: 'right', sortable: true },
    { key: 'totalWithdrawn', label: 'Total Out', type: 'currency', align: 'right', sortable: true },
    { key: 'lastTransaction', label: 'Last Txn' },
    { key: 'lastTransactionDate', label: 'Txn Date', type: 'date', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [WalletStatus.ACTIVE]: { label: 'Active', class: 'badge--success' },
        [WalletStatus.FROZEN]: { label: 'Frozen', class: 'badge--error' },
        [WalletStatus.SUSPENDED]: { label: 'Suspended', class: 'badge--neutral' },
      }
    },
  ];

  readonly actions: TableAction<WalletRow>[] = [
    { label: 'View Transactions', icon: 'receipt_long', handler: (r) => console.log('txns', r.id) },
    { label: 'Top-Up', icon: 'add_card', condition: (r) => r.status === WalletStatus.ACTIVE, handler: (r) => console.log('topup', r.id) },
    { label: 'Freeze', icon: 'lock', color: '#dc2626', condition: (r) => r.status === WalletStatus.ACTIVE, handler: (r) => this.freeze(r) },
    { label: 'Unfreeze', icon: 'lock_open', color: '#16a34a', condition: (r) => r.status === WalletStatus.FROZEN, handler: (r) => this.unfreeze(r) },
  ];

  ngOnInit(): void {
    this.store.loadWallets({});
  }

  setStatus(s: string): void { this.activeStatus.set(s); }
  doFilter(): void {}
  exportWallets(): void { console.log('export'); }
  topUp(): void { console.log('top-up'); }

  freeze(r: WalletRow): void {
    this.store.freezeWallet(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) });
  }

  unfreeze(r: WalletRow): void {
    this.store.unfreezeWallet(r.id, { onSuccess: () => {}, onError: (e) => console.error(e) });
  }
}
