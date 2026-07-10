import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { FarmStore } from '../../../store/farm.store';
import { Farm } from '../../../domain/farm.model';

type FarmRow = Farm & Record<string, unknown>;

@Component({
  selector: 'app-farms-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Farm Management"
        subtitle="GPS-mapped farm registry with crop and harvest information"
        icon="agriculture"
        [badge]="store.meta().total"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Farms' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">map</span> Map View
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add_location</span> Register Farm
        </button>
      </app-page-header>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of store.regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
          <select class="filter-select" [(ngModel)]="cropFilter" (change)="doFilter()">
            <option value="">All Crops</option>
            @for (c of store.cropTypes(); track c) {
              <option [value]="c">{{ titleCase(c) }}</option>
            }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="store.farms()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search by farm name or farmer..."
      />
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; align-items: center; justify-content: flex-end; margin-bottom: 16px; gap: 8px; flex-wrap: wrap; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `],
})
export class FarmsListComponent implements OnInit {
  protected readonly store = inject(FarmStore);

  regionFilter = '';
  cropFilter   = '';

  readonly columns: Column<FarmRow>[] = [
    { key: 'farmName',         label: 'Farm Name',      sortable: true },
    { key: 'farmerName',       label: 'Farmer',         type: 'avatar', sortable: true },
    { key: 'region',           label: 'Region',         sortable: true },
    { key: 'district',         label: 'District' },
    { key: 'cropType',         label: 'Crop',           sortable: true,
      format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1).toLowerCase() },
    { key: 'sizeHectares',     label: 'Size (ha)',      align: 'right', sortable: true,
      format: (v) => v != null ? Number(v).toLocaleString('en-GH', { maximumFractionDigits: 2 }) : '—' },
    { key: 'estimatedYieldKg', label: 'Est. Yield (kg)', align: 'right', sortable: true,
      format: (v) => v != null ? Number(v).toLocaleString('en-GH', { maximumFractionDigits: 0 }) : '—' },
    { key: 'lastHarvestDate',  label: 'Last Harvest',   type: 'date',   sortable: true },
    { key: 'registeredDate',   label: 'Registered',     type: 'date',   sortable: true },
  ];

  readonly actions: TableAction<FarmRow>[] = [
    { label: 'View Details', icon: 'visibility',   handler: (r) => console.log('view', r.farmId) },
    { label: 'View on Map',  icon: 'map',          color: '#0284c7', handler: (r) => console.log('map', r.farmId) },
    { label: 'Edit Farm',    icon: 'edit',         handler: (r) => console.log('edit', r.farmId) },
  ];

  titleCase(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  ngOnInit(): void {
    this.store.load({});
  }

  doFilter(): void {
    this.store.load({
      region:   this.regionFilter || undefined,
      crop_type: this.cropFilter  || undefined,
    });
  }
}
