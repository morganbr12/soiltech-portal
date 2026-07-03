import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_PRODUCE } from '../../../../../shared/data/mock-data';
import { ProduceGrade } from '../../../../../core/enums/status.enum';

type Produce = typeof MOCK_PRODUCE[number];

@Component({
  selector: 'app-produce-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Produce Management"
        subtitle="Track collection records, quality grades, and warehouse assignment"
        icon="eco"
        [badge]="MOCK_PRODUCE.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Produce' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> Record Produce
        </button>
      </app-page-header>

      <app-data-table
        [data]="produce()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        searchPlaceholder="Search produce records..."
      />
    </div>
  `
})
export class ProduceListComponent implements OnInit {
  readonly MOCK_PRODUCE = MOCK_PRODUCE;
  readonly produce = signal(MOCK_PRODUCE as Produce[]);
  readonly loading = signal(false);

  readonly columns: Column<Produce>[] = [
    { key: 'id', label: 'Record ID', width: '140px', sortable: true },
    { key: 'farmerName', label: 'Farmer', type: 'avatar', sortable: true },
    { key: 'agentName', label: 'Agent', sortable: true },
    { key: 'cropType', label: 'Crop', sortable: true },
    {
      key: 'grade', label: 'Grade', type: 'status',
      statusMap: {
        [ProduceGrade.A]: { label: 'Grade A', class: 'badge--success' },
        [ProduceGrade.B]: { label: 'Grade B', class: 'badge--info' },
        [ProduceGrade.C]: { label: 'Grade C', class: 'badge--warning' },
        [ProduceGrade.REJECTED]: { label: 'Rejected', class: 'badge--error' },
      }
    },
    { key: 'weightKg', label: 'Weight (kg)', align: 'right', sortable: true },
    { key: 'pricePerKg', label: 'Price/kg', align: 'right', format: (v) => `₵${v}` },
    { key: 'totalValue', label: 'Total Value', type: 'currency', align: 'right', sortable: true },
    { key: 'warehouseId', label: 'Warehouse' },
    { key: 'collectionDate', label: 'Collected', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Produce>[] = [
    { label: 'View', icon: 'visibility', handler: (r) => console.log('view', r.id) },
    { label: 'Approve', icon: 'check_circle', color: '#16a34a', condition: (r) => r.status === 'pending', handler: (r) => console.log('approve', r.id) },
    { label: 'Reject', icon: 'cancel', color: '#dc2626', condition: (r) => r.status === 'pending', handler: (r) => console.log('reject', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
