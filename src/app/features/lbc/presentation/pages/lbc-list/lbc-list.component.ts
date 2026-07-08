import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { LbcStore } from '../../../store/lbc.store';
import { Lbc } from '../../../domain/lbc.model';
import { EntityStatus } from '../../../../../core/enums/status.enum';

@Component({
  selector: 'app-lbc-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="LBC Management"
        subtitle="Manage Licensed Buying Companies, regions, and performance"
        icon="business_center"
        [badge]="store.total()"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'LBC Management' }]"
      >
        <button class="btn btn-secondary btn-sm" (click)="onExport()">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> Register LBC
        </button>
      </app-page-header>

      <!-- Stats row -->
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

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs(); track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
              {{ tab.label }}
              <span class="tab-count">{{ tab.count }}</span>
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="applyFilters()">
            <option value="">All Regions</option>
            @for (r of store.regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        [data]="store.lbcs()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search LBCs by name, region, code..."
        (onSelectionChange)="onSelectionChange($event)"
      >
        <div bulk-actions>
          <button class="btn btn-ghost btn-sm" [disabled]="!store.selectedIds().length" (click)="onBulkSuspend()">
            Suspend Selected
          </button>
          <button class="btn btn-ghost btn-sm" [disabled]="!store.selectedIds().length" (click)="onExportSelected()">
            Export Selected
          </button>
        </div>
        <div toolbar-actions>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded">filter_list</span> Filters
          </button>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded">view_column</span> Columns
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

    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
      font-family: inherit;

      &.active {
        background: var(--color-primary);
        color: white;

        .tab-count { background: rgba(255,255,255,0.25); color: white; }
      }
    }

    .tab-count {
      background: var(--color-border-light);
      color: var(--color-text-muted);
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 99px;
    }

    .filter-right { display: flex; gap: 8px; align-items: center; }

    .filter-select {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 0.875rem;
      background: var(--color-surface);
      color: var(--color-text-primary);
      cursor: pointer;
    }
  `]
})
export class LbcListComponent implements OnInit {
  readonly store = inject(LbcStore);
  readonly activeStatus = signal('all');
  regionFilter = '';

  readonly stats = computed(() => [
    { label: 'Total LBCs', value: this.store.total(), icon: 'business_center', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
    { label: 'Active', value: this.store.totalActive(), icon: 'check_circle', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    { label: 'Pending', value: this.store.totalPending(), icon: 'pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    { label: 'Suspended', value: this.store.totalSuspended(), icon: 'block', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  ]);

  readonly statusTabs = computed(() => [
    { label: 'All', value: 'all', count: this.store.total() },
    { label: 'Active', value: EntityStatus.ACTIVE, count: this.store.totalActive() },
    { label: 'Pending', value: EntityStatus.PENDING, count: this.store.totalPending() },
    { label: 'Suspended', value: EntityStatus.SUSPENDED, count: this.store.totalSuspended() },
  ]);

  readonly columns: Column<Lbc>[] = [
    { key: 'id', label: 'LBC ID', width: '120px', sortable: true },
    { key: 'name', label: 'LBC Name', sortable: true, type: 'avatar' },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'manager', label: 'Manager' },
    { key: 'agents', label: 'Agents', type: 'number', align: 'center', sortable: true },
    { key: 'farmers', label: 'Farmers', type: 'number', align: 'center', sortable: true },
    { key: 'produceTonnes', label: 'Produce (t)', align: 'right', sortable: true },
    { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right', sortable: true },
    { key: 'compliance', label: 'Compliance', align: 'center', format: (v) => `${v}%` },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [EntityStatus.ACTIVE]: { label: 'Active', class: 'badge--success' },
        [EntityStatus.PENDING]: { label: 'Pending', class: 'badge--warning' },
        [EntityStatus.SUSPENDED]: { label: 'Suspended', class: 'badge--error' },
        [EntityStatus.INACTIVE]: { label: 'Inactive', class: 'badge--neutral' },
      }
    },
    { key: 'joinedDate', label: 'Joined', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Lbc>[] = [
    { label: 'View', icon: 'visibility', handler: (row) => console.log('view', row.id) },
    { label: 'Edit', icon: 'edit', handler: (row) => console.log('edit', row.id) },
    {
      label: 'Suspend',
      icon: 'block',
      color: '#dc2626',
      condition: (row) => row.status === EntityStatus.ACTIVE,
      handler: (row) => this.store.suspendOne(row.id),
    },
  ];

  ngOnInit(): void {
    this.store.load({});
  }

  setStatus(status: string): void {
    this.activeStatus.set(status);
    this.applyFilters();
  }

  applyFilters(): void {
    this.store.load({
      status: this.activeStatus() === 'all' ? undefined : this.activeStatus(),
      region: this.regionFilter || undefined,
    });
  }

  onSelectionChange(rows: Lbc[]): void {
    this.store.setSelectedIds(rows.map(r => r.id));
  }

  onBulkSuspend(): void {
    this.store.bulkSuspend(this.store.selectedIds());
  }

  onExport(): void {
    this.store.exportCsv({
      status: this.activeStatus() === 'all' ? undefined : this.activeStatus(),
      region: this.regionFilter || undefined,
    });
  }

  onExportSelected(): void {
    this.store.exportCsv({ ids: this.store.selectedIds() });
  }
}
