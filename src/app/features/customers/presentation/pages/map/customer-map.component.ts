import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { MOCK_CUSTOMERS } from '../../../data/customer.mock';
import { CustomerStatus, CustomerTier } from '../../../domain/customer.model';

type CustomerRow = typeof MOCK_CUSTOMERS[number];

@Component({
  selector: 'app-customer-map',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="page-container" style="padding-bottom:0">
      <app-page-header
        title="Customer Map"
        subtitle="Geographic distribution of buyers across Ghana"
        icon="map"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Map' }]"
      >
        <button class="btn btn-ghost btn-sm" (click)="resetFilters()">
          <span class="material-symbols-rounded">filter_alt_off</span> Reset
        </button>
      </app-page-header>
    </div>

    <!-- Full-bleed map layout -->
    <div class="map-layout">
      <!-- Left sidebar -->
      <div class="map-sidebar">
        <!-- Search -->
        <div class="map-search">
          <span class="material-symbols-rounded search-icon">search</span>
          <input type="text" class="search-input" placeholder="Search customers..." [(ngModel)]="searchQuery" (input)="filterCustomers()">
        </div>

        <!-- Filters -->
        <div class="map-filters">
          <div class="filter-section">
            <div class="filter-title">Status</div>
            @for (s of statusOptions; track s.value) {
              <label class="filter-checkbox">
                <input type="checkbox" [checked]="selectedStatuses.includes(s.value)" (change)="toggleStatus(s.value)">
                <span class="filter-dot" [style.background]="s.color"></span>
                <span>{{ s.label }}</span>
                <span class="filter-count">{{ s.count }}</span>
              </label>
            }
          </div>
          <div class="filter-section">
            <div class="filter-title">Tier</div>
            @for (t of tierOptions; track t.value) {
              <label class="filter-checkbox">
                <input type="checkbox" [checked]="selectedTiers.includes(t.value)" (change)="toggleTier(t.value)">
                <span class="filter-dot" [style.background]="t.color"></span>
                <span>{{ t.label }}</span>
                <span class="filter-count">{{ t.count }}</span>
              </label>
            }
          </div>
          <div class="filter-section">
            <div class="filter-title">Region</div>
            <select class="filter-select-sm" [(ngModel)]="regionFilter" (change)="filterCustomers()">
              <option value="">All Regions</option>
              @for (r of regions; track r) { <option [value]="r">{{ r }}</option> }
            </select>
          </div>
        </div>

        <!-- Customer List -->
        <div class="customer-list-header">
          <span>{{ filteredCustomers().length }} customers</span>
          <button class="btn btn-ghost btn-sm" style="font-size:0.75rem;padding:4px 8px">Export</button>
        </div>
        <div class="customer-scroll-list">
          @for (c of filteredCustomers().slice(0, 20); track c.id) {
            <div class="cust-list-item" [class.selected]="selected()?.id === c.id" (click)="selectCustomer(c)">
              <div class="cust-avatar">{{ c.firstName[0] }}{{ c.lastName[0] }}</div>
              <div class="cust-info">
                <div class="cust-name">{{ c.firstName }} {{ c.lastName }}</div>
                <div class="cust-sub">{{ c.region }} · {{ c.district }}</div>
              </div>
              <div class="cust-badges">
                <span class="tier-dot-sm" [style.background]="getTierColor(c.tier)"></span>
                <span class="badge badge--xs" [class]="getStatusBadge(c.status)">{{ c.status }}</span>
              </div>
            </div>
          }
          @if (filteredCustomers().length > 20) {
            <div style="text-align:center;padding:12px;font-size:0.75rem;color:var(--color-text-muted)">
              +{{ filteredCustomers().length - 20 }} more customers
            </div>
          }
        </div>
      </div>

      <!-- Map Area -->
      <div class="map-area">
        <!-- Map placeholder -->
        <div class="map-canvas">
          <!-- Ghana outline simulation -->
          <div class="ghana-map-bg">
            <!-- Region dots simulation -->
            @for (c of filteredCustomers(); track c.id) {
              <div
                class="customer-dot"
                [class.active-dot]="selected()?.id === c.id"
                [style.left.%]="getLngPct(c.lng)"
                [style.top.%]="getLatPct(c.lat)"
                [style.background]="getStatusColor(c.status)"
                [title]="c.firstName + ' ' + c.lastName"
                (click)="selectCustomer(c)"
              ></div>
            }
          </div>

          <!-- Map controls -->
          <div class="map-controls">
            <button class="map-btn" title="Zoom In"><span class="material-symbols-rounded">add</span></button>
            <button class="map-btn" title="Zoom Out"><span class="material-symbols-rounded">remove</span></button>
            <button class="map-btn" title="My Location"><span class="material-symbols-rounded">my_location</span></button>
            <button class="map-btn" title="Layers"><span class="material-symbols-rounded">layers</span></button>
          </div>

          <!-- Legend -->
          <div class="map-legend">
            <div class="legend-title">Legend</div>
            @for (s of statusOptions; track s.value) {
              <div class="legend-item">
                <div class="legend-dot" [style.background]="s.color"></div>
                <span>{{ s.label }}</span>
              </div>
            }
          </div>

          <!-- Map info banner -->
          <div class="map-info-banner">
            <span class="material-symbols-rounded">map</span>
            <div>
              <strong>Google Maps Integration</strong>
              <span> — Add your API key to enable live satellite maps, clustering, and route planning.</span>
            </div>
          </div>
        </div>

        <!-- Selected customer panel -->
        @if (selected()) {
          <div class="customer-detail-popup animate-slide-up">
            <button class="popup-close" (click)="selected.set(null)">
              <span class="material-symbols-rounded">close</span>
            </button>
            <div class="popup-header">
              <div class="popup-avatar">{{ selected()!.firstName[0] }}{{ selected()!.lastName[0] }}</div>
              <div>
                <h3>{{ selected()!.firstName }} {{ selected()!.lastName }}</h3>
                <p>{{ selected()!.email }}</p>
              </div>
            </div>
            <div class="popup-grid">
              @for (f of getDetailFields(selected()!); track f.label) {
                <div class="popup-field">
                  <div class="popup-field-label">{{ f.label }}</div>
                  <div class="popup-field-value">{{ f.value }}</div>
                </div>
              }
            </div>
            <div class="popup-actions">
              <button class="btn btn-secondary btn-sm">View Profile</button>
              <button class="btn btn-primary btn-sm">View Orders</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .map-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      height: calc(100vh - 180px);
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin: 0 24px 24px;
    }

    .map-sidebar { display: flex; flex-direction: column; border-right: 1px solid var(--color-border-light); overflow: hidden; }

    .map-search { display: flex; align-items: center; gap: 8px; padding: 12px; border-bottom: 1px solid var(--color-border-light); position: relative; }
    .search-icon { position: absolute; left: 20px; font-size: 16px; color: var(--color-text-muted); }
    .search-input { width: 100%; border: 1px solid var(--color-border-light); border-radius: 8px; padding: 8px 10px 8px 32px; font-size: 0.875rem; background: var(--color-surface-2); color: var(--color-text-primary); &:focus { outline: none; border-color: var(--color-primary); } }

    .map-filters { padding: 12px; border-bottom: 1px solid var(--color-border-light); }
    .filter-section { margin-bottom: 12px; &:last-child { margin-bottom: 0; } }
    .filter-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: 6px; }
    .filter-checkbox { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--color-text-secondary); cursor: pointer; margin-bottom: 4px; input { cursor: pointer; } }
    .filter-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .filter-count { margin-left: auto; font-size: 0.6875rem; color: var(--color-text-muted); font-weight: 600; }
    .filter-select-sm { width: 100%; border: 1px solid var(--color-border); border-radius: 6px; padding: 5px 8px; font-size: 0.8125rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }

    .customer-list-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--color-border-light); font-size: 0.75rem; color: var(--color-text-muted); }
    .customer-scroll-list { flex: 1; overflow-y: auto; }

    .cust-list-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--color-border-light); transition: background var(--transition-fast); &:hover { background: var(--color-surface-2); } &.selected { background: rgba(26,122,74,0.07); border-left: 3px solid var(--color-primary); } }
    .cust-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.6875rem; font-weight: 700; flex-shrink: 0; }
    .cust-info { flex: 1; min-width: 0; }
    .cust-name { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cust-sub { font-size: 0.6875rem; color: var(--color-text-muted); }
    .cust-badges { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .tier-dot-sm { width: 8px; height: 8px; border-radius: 50%; }

    .map-area { position: relative; overflow: hidden; }
    .map-canvas { width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #d4edda 0%, #b8dfc5 40%, #a8d5b5 100%); }

    .ghana-map-bg {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 30% 40%, rgba(26,122,74,0.08) 0%, transparent 60%),
        radial-gradient(circle at 70% 60%, rgba(26,122,74,0.05) 0%, transparent 50%);
    }

    .customer-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid white;
      cursor: pointer;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all var(--transition-fast);
      &:hover, &.active-dot { width: 16px; height: 16px; z-index: 2; box-shadow: 0 0 0 4px rgba(255,255,255,0.6); }
    }

    .map-controls { position: absolute; right: 16px; top: 16px; display: flex; flex-direction: column; gap: 6px; z-index: 5; }
    .map-btn { width: 36px; height: 36px; background: white; border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); &:hover { background: var(--color-primary); span { color: white; } } span { font-size: 18px; color: #475569; } }

    .map-legend { position: absolute; left: 16px; bottom: 60px; background: white; border-radius: 10px; padding: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.12); z-index: 5; }
    .legend-title { font-size: 0.6875rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #475569; margin-bottom: 4px; &:last-child { margin-bottom: 0; } }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }

    .map-info-banner { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 10px; font-size: 0.8125rem; color: #475569; box-shadow: 0 4px 16px rgba(0,0,0,0.12); white-space: nowrap; span.material-symbols-rounded { font-size: 22px; color: var(--color-primary); } }

    .customer-detail-popup { position: absolute; bottom: 16px; right: 16px; width: 280px; background: white; border-radius: var(--radius-lg); padding: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); z-index: 10; }
    .popup-close { position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; color: var(--color-text-muted); }
    .popup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .popup-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; flex-shrink: 0; }
    .popup-header h3 { font-size: 0.9375rem; font-weight: 700; color: #0f172a; }
    .popup-header p { font-size: 0.75rem; color: #64748b; }
    .popup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
    .popup-field { background: #f8fafc; border-radius: 6px; padding: 8px; }
    .popup-field-label { font-size: 0.6875rem; color: #94a3b8; margin-bottom: 1px; }
    .popup-field-value { font-size: 0.8125rem; font-weight: 600; color: #0f172a; }
    .popup-actions { display: flex; gap: 8px; }
  `]
})
export class CustomerMapComponent implements OnInit {
  readonly allCustomers = MOCK_CUSTOMERS;
  readonly selected = signal<CustomerRow | null>(null);
  searchQuery = '';
  selectedStatuses: string[] = Object.values(CustomerStatus);
  selectedTiers: string[] = Object.values(CustomerTier);
  regionFilter = '';

  private _filtered = signal(MOCK_CUSTOMERS);
  readonly filteredCustomers = this._filtered.asReadonly();

  readonly regions = [...new Set(MOCK_CUSTOMERS.map(c => c.region))].sort();

  readonly statusOptions = [
    { label: 'Active', value: CustomerStatus.ACTIVE, color: '#16a34a', count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.ACTIVE).length },
    { label: 'Verified', value: CustomerStatus.VERIFIED, color: '#0284c7', count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.VERIFIED).length },
    { label: 'Pending', value: CustomerStatus.PENDING, color: '#d97706', count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.PENDING).length },
    { label: 'Suspended', value: CustomerStatus.SUSPENDED, color: '#dc2626', count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.SUSPENDED).length },
    { label: 'Rejected', value: CustomerStatus.REJECTED, color: '#94a3b8', count: MOCK_CUSTOMERS.filter(c => c.status === CustomerStatus.REJECTED).length },
  ];

  readonly tierOptions = [
    { label: 'Platinum', value: CustomerTier.PLATINUM, color: '#7c3aed', count: MOCK_CUSTOMERS.filter(c => c.tier === CustomerTier.PLATINUM).length },
    { label: 'Gold', value: CustomerTier.GOLD, color: '#f59e0b', count: MOCK_CUSTOMERS.filter(c => c.tier === CustomerTier.GOLD).length },
    { label: 'Silver', value: CustomerTier.SILVER, color: '#94a3b8', count: MOCK_CUSTOMERS.filter(c => c.tier === CustomerTier.SILVER).length },
    { label: 'Bronze', value: CustomerTier.BRONZE, color: '#b45309', count: MOCK_CUSTOMERS.filter(c => c.tier === CustomerTier.BRONZE).length },
  ];

  ngOnInit(): void { this.filterCustomers(); }

  filterCustomers(): void {
    let data = this.allCustomers;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(c => `${c.firstName} ${c.lastName} ${c.email} ${c.region}`.toLowerCase().includes(q));
    }
    if (this.selectedStatuses.length < Object.values(CustomerStatus).length) {
      data = data.filter(c => this.selectedStatuses.includes(c.status));
    }
    if (this.selectedTiers.length < Object.values(CustomerTier).length) {
      data = data.filter(c => this.selectedTiers.includes(c.tier));
    }
    if (this.regionFilter) data = data.filter(c => c.region === this.regionFilter);
    this._filtered.set(data);
  }

  toggleStatus(val: string): void {
    this.selectedStatuses = this.selectedStatuses.includes(val)
      ? this.selectedStatuses.filter(s => s !== val)
      : [...this.selectedStatuses, val];
    this.filterCustomers();
  }

  toggleTier(val: string): void {
    this.selectedTiers = this.selectedTiers.includes(val)
      ? this.selectedTiers.filter(t => t !== val)
      : [...this.selectedTiers, val];
    this.filterCustomers();
  }

  selectCustomer(c: CustomerRow): void {
    this.selected.set(this.selected()?.id === c.id ? null : c);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatuses = Object.values(CustomerStatus);
    this.selectedTiers = Object.values(CustomerTier);
    this.regionFilter = '';
    this.filterCustomers();
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      [CustomerStatus.ACTIVE]: '#16a34a', [CustomerStatus.VERIFIED]: '#0284c7',
      [CustomerStatus.PENDING]: '#d97706', [CustomerStatus.SUSPENDED]: '#dc2626', [CustomerStatus.REJECTED]: '#94a3b8',
    };
    return map[status] ?? '#94a3b8';
  }

  getTierColor(tier: string): string {
    const map: Record<string, string> = {
      [CustomerTier.PLATINUM]: '#7c3aed', [CustomerTier.GOLD]: '#f59e0b',
      [CustomerTier.SILVER]: '#94a3b8', [CustomerTier.BRONZE]: '#b45309',
    };
    return map[tier] ?? '#94a3b8';
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      [CustomerStatus.ACTIVE]: 'badge--success', [CustomerStatus.VERIFIED]: 'badge--info',
      [CustomerStatus.PENDING]: 'badge--warning', [CustomerStatus.SUSPENDED]: 'badge--error',
      [CustomerStatus.REJECTED]: 'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }

  // Ghana bounding box: lat 4.5-11.2, lng -3.5-1.3
  getLngPct(lng: number): number { return Math.min(Math.max((lng - (-3.5)) / (1.3 - (-3.5)) * 100, 2), 98); }
  getLatPct(lat: number): number { return Math.min(Math.max((1 - (lat - 4.5) / (11.2 - 4.5)) * 100, 2), 98); }

  getDetailFields(c: CustomerRow): { label: string; value: string }[] {
    return [
      { label: 'Region', value: c.region },
      { label: 'District', value: c.district },
      { label: 'Total Orders', value: String(c.totalOrders) },
      { label: 'Total Spent', value: `GHS ${c.totalSpent.toLocaleString('en-GH', { maximumFractionDigits: 0 })}` },
      { label: 'Tier', value: c.tier },
      { label: 'Status', value: c.status },
    ];
  }
}
