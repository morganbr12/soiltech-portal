import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { AddVehicleDrawerComponent } from '../../components/add-vehicle-drawer/add-vehicle-drawer.component';
import { VehicleStore } from '../../../store/vehicle.store';
import { Vehicle, VehicleStatusApi, VehicleQueryParams } from '../../../domain/vehicle.model';

type VehicleRow = Vehicle & Record<string, unknown>;

@Component({
  selector: 'app-logistics',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent, AddVehicleDrawerComponent],
  template: `
    @if (showAddDrawer()) {
      <app-add-vehicle-drawer
        (closed)="showAddDrawer.set(false)"
        (saved)="onVehicleSaved()"
      />
    }

    <div class="page-container">
      <app-page-header
        title="Logistics & Fleet"
        subtitle="Manage vehicles, drivers, routes and delivery operations"
        icon="local_shipping"
        [badge]="store.meta().total"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Logistics' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">route</span> Route Optimizer
        </button>
        <button class="btn btn-primary btn-sm" (click)="showAddDrawer.set(true)">
          <span class="material-symbols-rounded">add</span> Add Vehicle
        </button>
      </app-page-header>

      <!-- Fleet Stats -->
      <div class="fleet-stats stagger-children">
        @for (s of fleetStats(); track s.label) {
          <div class="stat-card animate-slide-up">
            <div class="stat-icon" [style.background]="s.bg">
              <span class="material-symbols-rounded" [style.color]="s.color">{{ s.icon }}</span>
            </div>
            <div>
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        }
      </div>

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
          <select class="filter-select" [(ngModel)]="typeFilter" (change)="doFilter()">
            <option value="">All Types</option>
            @for (t of store.types(); track t) { <option [value]="t">{{ t }}</option> }
          </select>
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of store.regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="store.vehicles()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoading()"
        searchPlaceholder="Search by plate, driver, make, model..."
      />
    </div>
  `,
  styles: [`
    .fleet-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .stat-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      span { font-size: 20px; font-variation-settings: 'FILL' 1; }
    }
    .stat-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .stat-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab { padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; } }
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class LogisticsComponent implements OnInit {
  protected readonly store = inject(VehicleStore);

  readonly showAddDrawer = signal(false);
  readonly activeStatus  = signal('');
  typeFilter   = '';
  regionFilter = '';

  readonly statusTabs = [
    { label: 'All',         value: '' },
    { label: 'Available',   value: VehicleStatusApi.AVAILABLE },
    { label: 'On Route',    value: VehicleStatusApi.ON_ROUTE },
    { label: 'Maintenance', value: VehicleStatusApi.MAINTENANCE },
    { label: 'Inactive',    value: VehicleStatusApi.INACTIVE },
  ];

  readonly fleetStats = () => {
    const k = this.store.kpis() ?? { totalVehicles: 0, available: 0, onRoute: 0, maintenance: 0, inactive: 0 };
    return [
      { label: 'Total Vehicles', value: k.totalVehicles, icon: 'local_shipping', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
      { label: 'On Route',       value: k.onRoute,       icon: 'drive_eta',      color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
      { label: 'Available',      value: k.available,     icon: 'check_circle',   color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'Maintenance',    value: k.maintenance,   icon: 'build',          color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
    ];
  };

  readonly columns: Column<VehicleRow>[] = [
    { key: 'carPlateNumber', label: 'Plate No.', sortable: true },
    { key: 'vehicleType',    label: 'Type',      sortable: true },
    { key: 'make',           label: 'Make' },
    { key: 'model',          label: 'Model' },
    { key: 'year',           label: 'Year',          align: 'center' },
    { key: 'capacity',       label: 'Capacity (t)',  align: 'right', sortable: true,
      format: (v) => Number(v).toFixed(2) },
    { key: 'region',         label: 'Region',        sortable: true },
    { key: 'driverName',     label: 'Driver',
      format: (v) => v ? String(v) : '—' },
    { key: 'fuelLevel',      label: 'Fuel',          align: 'center',
      format: (v) => `${v}%` },
    {
      key: 'status', label: 'Status', type: 'status', align: 'center', width: '130px',
      statusMap: {
        [VehicleStatusApi.AVAILABLE]:   { label: 'Available',   class: 'badge--success' },
        [VehicleStatusApi.ON_ROUTE]:    { label: 'On Route',    class: 'badge--info' },
        [VehicleStatusApi.MAINTENANCE]: { label: 'Maintenance', class: 'badge--warning' },
        [VehicleStatusApi.INACTIVE]:    { label: 'Inactive',    class: 'badge--neutral' },
      }
    },
  ];

  readonly actions: TableAction<VehicleRow>[] = [
    { label: 'Track Live',           icon: 'location_on', color: '#0284c7', handler: (r) => console.log('track', r.id) },
    { label: 'View Details',         icon: 'visibility',                    handler: (r) => console.log('view', r.id) },
    { label: 'Schedule Maintenance', icon: 'build',                         handler: (r) => console.log('maintenance', r.id) },
  ];

  ngOnInit(): void {
    this.store.loadAll({});
  }

  setStatus(status: string): void {
    this.activeStatus.set(status);
    this.doFilter();
  }

  doFilter(): void {
    this.store.load({
      status:      this.activeStatus() || undefined,
      vehicleType: this.typeFilter     || undefined,
      region:      this.regionFilter   || undefined,
    });
  }

  onVehicleSaved(): void {
    this.showAddDrawer.set(false);
    this.store.loadAll({ status: this.activeStatus() || undefined });
  }
}
