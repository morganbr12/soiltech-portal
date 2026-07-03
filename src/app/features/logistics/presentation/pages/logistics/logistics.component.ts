import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_VEHICLES } from '../../../../../shared/data/mock-data';
import { VehicleStatus } from '../../../../../core/enums/status.enum';

type Vehicle = typeof MOCK_VEHICLES[number];

@Component({
  selector: 'app-logistics',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Logistics & Fleet"
        subtitle="Manage vehicles, drivers, routes and delivery operations"
        icon="local_shipping"
        [badge]="MOCK_VEHICLES.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Logistics' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">route</span> Route Optimizer
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> Add Vehicle
        </button>
      </app-page-header>

      <!-- Fleet Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px" class="stagger-children">
        @for (s of fleetStats; track s.label) {
          <div class="animate-slide-up" style="background:var(--color-surface);border:1px solid var(--color-border-light);border-radius:var(--radius-md);padding:14px;display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0" [style.background]="s.bg">
              <span class="material-symbols-rounded" [style.color]="s.color" style="font-size:20px;font-variation-settings:'FILL' 1">{{ s.icon }}</span>
            </div>
            <div>
              <div style="font-size:1.375rem;font-weight:700;color:var(--color-text-primary);line-height:1">{{ s.value }}</div>
              <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:2px">{{ s.label }}</div>
            </div>
          </div>
        }
      </div>

      <app-data-table
        [data]="vehicles()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        searchPlaceholder="Search vehicles by plate, type, region..."
      />
    </div>
  `
})
export class LogisticsComponent implements OnInit {
  readonly MOCK_VEHICLES = MOCK_VEHICLES;
  readonly vehicles = signal(MOCK_VEHICLES as Vehicle[]);
  readonly loading = signal(false);

  readonly fleetStats = [
    { label: 'Total Vehicles', value: MOCK_VEHICLES.length, icon: 'local_shipping', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
    { label: 'On Route', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.ON_ROUTE).length, icon: 'drive_eta', color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
    { label: 'Available', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.AVAILABLE).length, icon: 'check_circle', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    { label: 'Maintenance', value: MOCK_VEHICLES.filter(v => v.status === VehicleStatus.MAINTENANCE).length, icon: 'build', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  ];

  readonly columns: Column<Vehicle>[] = [
    { key: 'id', label: 'Vehicle ID', width: '120px' },
    { key: 'plateNumber', label: 'Plate No.', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year', align: 'center' },
    { key: 'capacityKg', label: 'Capacity (kg)', align: 'right', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'fuelLevel', label: 'Fuel', align: 'center', format: (v) => `${v}%` },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [VehicleStatus.AVAILABLE]: { label: 'Available', class: 'badge--success' },
        [VehicleStatus.ON_ROUTE]: { label: 'On Route', class: 'badge--info' },
        [VehicleStatus.MAINTENANCE]: { label: 'Maintenance', class: 'badge--warning' },
        [VehicleStatus.OFFLINE]: { label: 'Offline', class: 'badge--neutral' },
      }
    },
  ];

  readonly actions: TableAction<Vehicle>[] = [
    { label: 'Track Live', icon: 'location_on', color: '#0284c7', handler: (r) => console.log('track', r.id) },
    { label: 'View Details', icon: 'visibility', handler: (r) => console.log('view', r.id) },
    { label: 'Schedule Maintenance', icon: 'build', handler: (r) => console.log('maintenance', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
