import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, Column, TableAction } from '../../../../../shared/components/data-table/data-table.component';
import { ViewOrderDrawerComponent } from '../../components/view-order-drawer/view-order-drawer.component';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerOrder, OrderStatus } from '../../../domain/customer.model';

type OrderRow = CustomerOrder & Record<string, unknown>;

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent, ViewOrderDrawerComponent],
  template: `
    @if (selectedOrder()) {
      <app-view-order-drawer
        [order]="selectedOrder()!"
        (closed)="selectedOrder.set(null)"
        (orderUpdated)="onOrderUpdated()"
      />
    }

    <div class="page-container">
      <app-page-header
        title="Customer Orders"
        subtitle="Manage and track all buyer orders across the supply chain"
        icon="shopping_bag"
        [badge]="store.ordersMeta().total"
        [breadcrumbs]="[{ label: 'Home', url: '/dashboard' }, { label: 'Customers', url: '/customers' }, { label: 'Orders' }]"
      >
        <button class="btn btn-secondary btn-sm">
          <span class="material-symbols-rounded">download</span> Export
        </button>
        <button class="btn btn-primary btn-sm" (click)="createOrder()">
          <span class="material-symbols-rounded">add_shopping_cart</span> New Order
        </button>
      </app-page-header>

      <!-- Stats -->
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

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-tabs">
          @for (tab of statusTabs(); track tab.value) {
            <button class="filter-tab" [class.active]="activeStatus() === tab.value" (click)="setStatus(tab.value)">
              {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
            </button>
          }
        </div>
        <div class="filter-right">
          <select class="filter-select" [(ngModel)]="payFilter" (change)="doFilter()">
            <option value="">All Payments</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>
          <select class="filter-select" [(ngModel)]="regionFilter" (change)="doFilter()">
            <option value="">All Regions</option>
            @for (r of regions(); track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </div>
      </div>

      <app-data-table
        [data]="filteredOrders()"
        [columns]="columns"
        [actions]="actions"
        [loading]="store.isLoadingOrders()"
        [selectable]="true"
        [searchable]="true"
        searchPlaceholder="Search by customer, produce, order ID..."
      >
        <div bulk-actions>
          <button class="btn btn-ghost btn-sm">Confirm Selected</button>
          <button class="btn btn-ghost btn-sm">Export Selected</button>
        </div>
      </app-data-table>
    </div>
  `,
  styles: [`
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .quick-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 12px; }
    .qs-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; span { font-size: 20px; font-variation-settings: 'FILL' 1; } }
    .qs-value { font-size: 1.375rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    .qs-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }
    .filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 4px; flex-wrap: wrap; }
    .filter-tab { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: none; border-radius: 7px; cursor: pointer; background: transparent; font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); font-family: inherit; &.active { background: var(--color-primary); color: white; .tab-count { background: rgba(255,255,255,0.25); color: white; } } }
    .tab-count { background: var(--color-border-light); color: var(--color-text-muted); font-size: 0.6875rem; font-weight: 700; padding: 1px 6px; border-radius: 99px; }
    .filter-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 12px; font-size: 0.875rem; background: var(--color-surface); color: var(--color-text-primary); cursor: pointer; }
  `]
})
export class CustomerOrdersComponent implements OnInit {
  protected readonly store = inject(CustomerStore);

  readonly activeStatus  = signal('all');
  readonly selectedOrder = signal<CustomerOrder | null>(null);
  payFilter    = '';
  regionFilter = '';

  readonly regions = computed(() =>
    [...new Set(this.store.orders().map(o => o.region))].sort()
  );

  readonly stats = computed(() => {
    const orders = this.store.orders();
    const count  = (s: string) => orders.filter(o => o.status === s).length;
    const unpaid = orders.filter(o => o.paymentStatus === 'UNPAID').length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return [
      { label: 'Total Orders', value: orders.length,                                  icon: 'shopping_bag',   color: '#1a7a4a', bg: 'rgba(26,122,74,0.1)' },
      { label: 'Delivered',    value: count(OrderStatus.DELIVERED),                   icon: 'local_shipping', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      { label: 'In Progress',  value: count(OrderStatus.CONFIRMED) + count(OrderStatus.DRIVER_DISPATCHED) + count(OrderStatus.SHIPPED), icon: 'autorenew', color: '#0284c7', bg: 'rgba(2,132,199,0.1)' },
      { label: 'Pending',      value: count(OrderStatus.PENDING),                     icon: 'pending',        color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
      { label: 'Unpaid',       value: unpaid,                                         icon: 'money_off',      color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
      { label: 'Total Value',  value: 'GHS ' + (totalValue / 1000).toFixed(0) + 'K', icon: 'payments',       color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    ];
  });

  readonly statusTabs = computed(() => {
    const orders = this.store.orders();
    const count  = (s: string) => orders.filter(o => o.status === s).length;
    return [
      { label: 'All',               value: 'all',                          count: orders.length },
      { label: 'Pending',           value: OrderStatus.PENDING,            count: count(OrderStatus.PENDING) },
      { label: 'Confirmed',         value: OrderStatus.CONFIRMED,          count: count(OrderStatus.CONFIRMED) },
      { label: 'Dispatched',        value: OrderStatus.DRIVER_DISPATCHED,  count: count(OrderStatus.DRIVER_DISPATCHED) },
      { label: 'Shipped',           value: OrderStatus.SHIPPED,            count: count(OrderStatus.SHIPPED) },
      { label: 'Delivered',         value: OrderStatus.DELIVERED,          count: count(OrderStatus.DELIVERED) },
      { label: 'Cancelled',         value: OrderStatus.CANCELLED,          count: count(OrderStatus.CANCELLED) },
    ];
  });

  readonly filteredOrders = computed(() => {
    let data = this.store.orders() as OrderRow[];
    if (this.activeStatus() !== 'all') data = data.filter(o => o.status === this.activeStatus());
    if (this.payFilter)    data = data.filter(o => o.paymentStatus === this.payFilter);
    if (this.regionFilter) data = data.filter(o => o.region === this.regionFilter);
    return data;
  });

  readonly columns: Column<OrderRow>[] = [
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'produce',      label: 'Produce',  sortable: true,
      format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1).toLowerCase() },
    { key: 'quantityKg',   label: 'Qty (kg)', type: 'number', align: 'right', sortable: true },
    { key: 'pricePerKg',   label: 'Price/kg', align: 'right',
      format: (v) => `GHS ${Number(v).toFixed(2)}` },
    { key: 'totalAmount',  label: 'Total',    type: 'currency', align: 'right', sortable: true },
    { key: 'assignedAgent', label: 'Agent' },
    { key: 'region',        label: 'Region', sortable: true },
    { key: 'paymentStatus', label: 'Payment', type: 'status',
      statusMap: {
        UNPAID:  { label: 'Unpaid',  class: 'badge--error' },
        PARTIAL: { label: 'Partial', class: 'badge--warning' },
        PAID:    { label: 'Paid',    class: 'badge--success' },
      }
    },
    { key: 'status', label: 'Status', type: 'status',
      statusMap: {
        [OrderStatus.PENDING]:           { label: 'Pending',           class: 'badge--warning' },
        [OrderStatus.CONFIRMED]:         { label: 'Confirmed',         class: 'badge--info' },
        [OrderStatus.AGENT_CONFIRMED]:   { label: 'Agent Confirmed',   class: 'badge--purple' },
        [OrderStatus.DRIVER_DISPATCHED]: { label: 'Dispatched',        class: 'badge--purple' },
        [OrderStatus.SHIPPED]:           { label: 'Shipped',           class: 'badge--info' },
        [OrderStatus.DELIVERED]:         { label: 'Delivered',         class: 'badge--success' },
        [OrderStatus.CANCELLED]:         { label: 'Cancelled',         class: 'badge--error' },
      }
    },
    { key: 'orderDate', label: 'Date', type: 'date', sortable: true },
  ];

  readonly actions: TableAction<OrderRow>[] = [
    { label: 'View', icon: 'visibility', handler: (r) => this.selectedOrder.set(r) },
    {
      label: 'Confirm Order', icon: 'check_circle', color: '#16a34a',
      condition: (r) => r.status === OrderStatus.PENDING,
      handler:   (r) => this.store.confirmOrder(r.id, {
        onSuccess: () => this.store.loadOrders({}),
        onError:   (e) => console.error(e),
      }),
    },
    {
      label: 'Dispatch Driver', icon: 'local_shipping', color: '#7c3aed',
      condition: (r) => r.status === OrderStatus.CONFIRMED || r.status === OrderStatus.AGENT_CONFIRMED,
      handler: (r) => this.selectedOrder.set(r),
    },
    {
      label: 'Cancel', icon: 'cancel', color: '#dc2626',
      condition: (r) => r.status === OrderStatus.PENDING || r.status === OrderStatus.CONFIRMED,
      handler: (r) => this.store.cancelOrder(r.id, '', {
        onSuccess: () => this.store.loadOrders({}),
        onError:   (e) => console.error(e),
      }),
    },
  ];

  ngOnInit(): void {
    this.store.loadOrders({});
  }

  setStatus(s: string): void { this.activeStatus.set(s); }
  doFilter(): void {}
  createOrder(): void { console.log('create order'); }

  onOrderUpdated(): void {
    this.store.loadOrders({});
    this.selectedOrder.set(null);
  }
}
