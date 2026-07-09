import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { ViewProduceDrawerComponent } from '../../components/view-produce-drawer/view-produce-drawer.component';
import { ProduceStore } from '../../../store/produce.store';
import { ProduceListing, ProduceStatus } from '../../../domain/produce.model';
import { ToastService } from '../../../../../shared/services/toast.service';

type ProduceRow = ProduceListing & Record<string, unknown>;

@Component({
  selector: 'app-produce-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent, ViewProduceDrawerComponent],
  template: `
    @if (selectedListing()) {
      <app-view-produce-drawer
        [listing]="selectedListing()!"
        (closed)="selectedListing.set(null)"
        (updated)="selectedListing.set(null)"
      />
    }

    <div class="page-container">
      <app-page-header
        title="Produce Management"
        subtitle="Track collection records, quality grades and availability"
        icon="eco"
        [badge]="store.meta().total"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Produce' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
      </app-page-header>

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
          <select class="filter-select" [(ngModel)]="cropFilter" (change)="doFilter()">
            <option value="">All Crops</option>
            @for (c of store.cropTypes(); track c) { <option [value]="c">{{ c }}</option> }
          </select>
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of store.regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="store.listings()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoading()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search by crop, agent, or farmer..."
      />
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; }
    .filter-tab { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.875rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; } }
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class ProduceListComponent implements OnInit {
  protected readonly store = inject(ProduceStore);
  private readonly toast = inject(ToastService);

  readonly activeStatus    = signal('');
  readonly selectedListing = signal<ProduceListing | null>(null);
  readonly savingId        = signal<string | null>(null);
  cropFilter   = '';
  regionFilter = '';

  readonly statusTabs = [
    { label: 'All',              value: '' },
    { label: 'Pending Review',   value: ProduceStatus.PENDING_APPROVAL },
    { label: 'Available',        value: ProduceStatus.AVAILABLE },
    { label: 'Reserved',         value: ProduceStatus.RESERVED },
    { label: 'Sold Out',         value: ProduceStatus.SOLD_OUT },
    { label: 'Unlisted',         value: ProduceStatus.UNLISTED },
  ];

  readonly columns: Column<ProduceRow>[] = [
    { key: 'cropType',           label: 'Crop',          sortable: true, width: '120px',
      format: (v, row) => `${v}${row['cropVariety'] ? ' · ' + row['cropVariety'] : ''}` },
    { key: 'grade',              label: 'Grade',         width: '100px' },
    { key: 'farmerName',         label: 'Farmer',        sortable: true },
    { key: 'agentName',          label: 'Agent',         sortable: true },
    { key: 'lbcName',            label: 'LBC' },
    { key: 'totalQuantityKg',    label: 'Total (kg)',    align: 'right', sortable: true,
      format: (v) => Number(v).toLocaleString('en-GH', { maximumFractionDigits: 1 }) },
    { key: 'availableQuantityKg', label: 'Available (kg)', align: 'right', sortable: true,
      format: (v) => Number(v).toLocaleString('en-GH', { maximumFractionDigits: 1 }) },
    { key: 'pricePerKg',         label: 'Price/kg',      align: 'right',
      format: (v) => `GHS ${Number(v).toFixed(2)}` },
    { key: 'region',             label: 'Region',        sortable: true },
    { key: 'status',             label: 'Status',        type: 'status', align: 'center', width: '150px',
      statusMap: {
        [ProduceStatus.PENDING_APPROVAL]: { label: 'Pending Review', class: 'badge--warning' },
        [ProduceStatus.AVAILABLE]:        { label: 'Available',      class: 'badge--success' },
        [ProduceStatus.RESERVED]:         { label: 'Reserved',       class: 'badge--info' },
        [ProduceStatus.SOLD_OUT]:         { label: 'Sold Out',       class: 'badge--error' },
        [ProduceStatus.UNLISTED]:         { label: 'Unlisted',       class: 'badge--neutral' },
      }
    },
    { key: 'collectedAt', label: 'Collected', type: 'date', sortable: true, width: '130px' },
  ];

  readonly actions: TableAction<ProduceRow>[] = [
    { label: 'View', icon: 'visibility', handler: (r) => this.selectedListing.set(r) },
    {
      label: 'Approve', icon: 'check_circle', color: '#16a34a',
      condition: (r) => r.status === ProduceStatus.PENDING_APPROVAL && this.savingId() !== r.id,
      handler: (r) => {
        this.savingId.set(r.id);
        this.store.approve(
          r.id,
          () => {
            this.savingId.set(null);
            this.toast.success('Listing approved successfully');
          },
          () => {
            this.savingId.set(null);
            this.toast.error('Failed to approve listing. Please try again.');
          },
        );
      },
    },
    {
      label: 'Reject', icon: 'cancel', color: '#dc2626',
      condition: (r) => r.status === ProduceStatus.PENDING_APPROVAL && this.savingId() !== r.id,
      handler: (r) => {
        this.savingId.set(r.id);
        this.store.reject(
          r.id,
          () => {
            this.savingId.set(null);
            this.toast.success('Listing rejected');
          },
          () => {
            this.savingId.set(null);
            this.toast.error('Failed to reject listing. Please try again.');
          },
        );
      },
    },
  ];

  ngOnInit(): void {
    this.store.load({});
  }

  setStatus(status: string): void {
    this.activeStatus.set(status);
    this.doFilter();
  }

  doFilter(): void {
    this.store.load({
      status:   this.activeStatus() || undefined,
      cropType: this.cropFilter    || undefined,
      region:   this.regionFilter  || undefined,
    });
  }
}
