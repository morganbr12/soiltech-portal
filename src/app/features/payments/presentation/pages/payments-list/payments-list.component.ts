import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { MOCK_PAYMENTS } from '../../../../../shared/data/mock-data';
import { PaymentStatus } from '../../../../../core/enums/status.enum';

type Payment = typeof MOCK_PAYMENTS[number];

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Payments"
        subtitle="Approve, track and manage all farmer and LBC payments"
        icon="payments"
        [badge]="MOCK_PAYMENTS.length"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Payments' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm">
          <span class="material-symbols-rounded">add</span> New Payment
        </button>
      </app-page-header>

      <!-- Financial Summary -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:20px" class="stagger-children">
        @for (s of financials; track s.label) {
          <div class="animate-slide-up" style="background:var(--color-surface);border:1px solid var(--color-border-light);border-radius:var(--radius-md);padding:16px">
            <div style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">{{ s.label }}</div>
            <div style="font-size:1.5rem;font-weight:800;color:var(--color-text-primary);letter-spacing:-0.03em" [style.color]="s.color">{{ s.value }}</div>
            <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px">{{ s.sub }}</div>
          </div>
        }
      </div>

      <app-data-table
        [data]="payments()"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading()"
        [selectable]="true"
        searchPlaceholder="Search by ID, farmer, reference..."
      />
    </div>
  `
})
export class PaymentsListComponent implements OnInit {
  readonly MOCK_PAYMENTS = MOCK_PAYMENTS;
  readonly payments = signal(MOCK_PAYMENTS as Payment[]);
  readonly loading = signal(false);

  readonly financials = [
    { label: 'Total Paid Today', value: '₵842,340', sub: '204 transactions', color: '#1a7a4a' },
    { label: 'Pending Approval', value: '₵124,800', sub: '38 transactions', color: '#d97706' },
    { label: 'Processing', value: '₵56,200', sub: '14 transactions', color: '#0284c7' },
    { label: 'Failed Today', value: '₵18,400', sub: '5 transactions', color: '#dc2626' },
  ];

  readonly columns: Column<Payment>[] = [
    { key: 'id', label: 'Payment ID', width: '150px', sortable: true },
    { key: 'farmerName', label: 'Farmer', type: 'avatar', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency', align: 'right', sortable: true },
    { key: 'method', label: 'Method', sortable: true },
    { key: 'reference', label: 'Reference' },
    {
      key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [PaymentStatus.COMPLETED]: { label: 'Completed', class: 'badge--success' },
        [PaymentStatus.PENDING]: { label: 'Pending', class: 'badge--warning' },
        [PaymentStatus.PROCESSING]: { label: 'Processing', class: 'badge--info' },
        [PaymentStatus.FAILED]: { label: 'Failed', class: 'badge--error' },
        [PaymentStatus.REFUNDED]: { label: 'Refunded', class: 'badge--neutral' },
      }
    },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
    { key: 'processedAt', label: 'Processed', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<Payment>[] = [
    { label: 'View', icon: 'visibility', handler: (r) => console.log('view', r.id) },
    { label: 'Approve', icon: 'check_circle', color: '#16a34a', condition: (r) => r.status === PaymentStatus.PENDING, handler: (r) => console.log('approve', r.id) },
    { label: 'Reject', icon: 'cancel', color: '#dc2626', condition: (r) => r.status === PaymentStatus.PENDING, handler: (r) => console.log('reject', r.id) },
    { label: 'Refund', icon: 'undo', condition: (r) => r.status === PaymentStatus.COMPLETED, handler: (r) => console.log('refund', r.id) },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }
}
