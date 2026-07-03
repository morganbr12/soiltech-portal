import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_FARMS } from '../../../../../shared/data/mock-data';

type Farm = typeof MOCK_FARMS[number];

@Component({
  selector: 'app-farms-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Farm Management"
        subtitle="GPS-mapped farm registry with crop and harvest information"
        icon="agriculture"
        [badge]="MOCK_FARMS.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Farms' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">map</span> Map View
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add_location</span> Register Farm
        </button>
      </app-page-header>

      <app-data-table
        [data]="farms()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        searchPlaceholder="Search by farm name, ID, farmer, region..."
      />
    </div>
  `
})
export class FarmsListComponent implements OnInit {
  readonly MOCK_FARMS = MOCK_FARMS;
  readonly farms = signal(MOCK_FARMS as Farm[]);
  readonly loading = signal(false);

  readonly columns: Column<Farm>[] = [
    { key: 'id', label: 'Farm ID', width: '130px', sortable: true },
    { key: 'name', label: 'Farm Name', sortable: true },
    { key: 'farmerName', label: 'Farmer', type: 'avatar', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'district', label: 'District' },
    { key: 'cropType', label: 'Crop', sortable: true },
    { key: 'sizeHectares', label: 'Size (ha)', align: 'right', sortable: true },
    { key: 'estimatedYield', label: 'Est. Yield (t)', align: 'right', sortable: true },
    { key: 'lastHarvestDate', label: 'Last Harvest', type: 'date', sortable: true },
    { key: 'registeredDate', label: 'Registered', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Farm>[] = [
    { label: 'View Details', icon: 'visibility', handler: (r) => console.log('view', r.id) },
    { label: 'View on Map', icon: 'map', color: '#0284c7', handler: (r) => console.log('map', r.id) },
    { label: 'Edit Farm', icon: 'edit', handler: (r) => console.log('edit', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
