import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_WAREHOUSES } from '../../../../../shared/data/mock-data';
import { NgApexchartsModule } from 'ng-apexcharts';

type Warehouse = typeof MOCK_WAREHOUSES[number];

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent, NgApexchartsModule],
  template: `
    <div class="page-container">
      <app-page-header
        title="Warehouse Management"
        subtitle="Monitor capacity, inventory and incoming/outgoing produce"
        icon="warehouse"
        [badge]="MOCK_WAREHOUSES.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Warehouses' }]"
      >
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> Add Warehouse
        </button>
      </app-page-header>

      <!-- Capacity overview -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-bottom:24px" class="stagger-children">
        @for (wh of topWarehouses; track wh.id) {
          <div class="animate-slide-up" style="background:var(--color-surface);border:1px solid var(--color-border-light);border-radius:var(--radius-lg);padding:16px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
              <div>
                <div style="font-weight:700;color:var(--color-text-primary);font-size:0.9375rem">{{ wh.name }}</div>
                <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px">{{ wh.region }}</div>
              </div>
              <span class="badge" [class]="getCapacityBadge(wh.capacityPercent)">{{ wh.capacityPercent }}%</span>
            </div>
            <div style="background:var(--color-border-light);border-radius:99px;height:6px;overflow:hidden;margin-bottom:8px">
              <div [style.width]="wh.capacityPercent + '%'" [style.background]="getCapacityColor(wh.capacityPercent)" style="height:100%;border-radius:99px;transition:width 1s ease"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-text-muted)">
              <span>{{ wh.usedTonnes }}t used</span>
              <span>{{ wh.capacityTonnes }}t total</span>
            </div>
          </div>
        }
      </div>

      <app-data-table
        [data]="warehouses()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        searchPlaceholder="Search warehouses..."
      />
    </div>
  `
})
export class WarehousesListComponent implements OnInit {
  readonly MOCK_WAREHOUSES = MOCK_WAREHOUSES;
  readonly warehouses = signal(MOCK_WAREHOUSES as Warehouse[]);
  readonly loading = signal(false);
  readonly topWarehouses = MOCK_WAREHOUSES.slice(0, 4);

  getCapacityBadge(pct: number): string {
    if (pct >= 90) return 'badge--error';
    if (pct >= 75) return 'badge--warning';
    return 'badge--success';
  }

  getCapacityColor(pct: number): string {
    if (pct >= 90) return '#dc2626';
    if (pct >= 75) return '#d97706';
    return '#16a34a';
  }

  readonly columns: Column<Warehouse>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Warehouse Name', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'capacityTonnes', label: 'Capacity (t)', align: 'right', sortable: true },
    { key: 'usedTonnes', label: 'Used (t)', align: 'right', sortable: true },
    { key: 'capacityPercent', label: '% Full', align: 'center', format: (v) => `${v}%` },
    { key: 'manager', label: 'Manager', sortable: true },
    { key: 'phone', label: 'Phone' },
  ];

  readonly actions: TableAction<Warehouse>[] = [
    { label: 'View Dashboard', icon: 'dashboard', handler: (r) => console.log('view', r.id) },
    { label: 'Inventory', icon: 'inventory', color: '#0284c7', handler: (r) => console.log('inv', r.id) },
    { label: 'View on Map', icon: 'map', handler: (r) => console.log('map', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
