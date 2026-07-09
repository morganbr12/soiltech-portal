import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerOrder, OrderStatus } from '../../../domain/customer.model';

@Component({
  selector: 'app-view-order-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="order-drawer-title">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">receipt_long</span>
            </div>
            <div>
              <h2 class="drawer-title" id="order-drawer-title">Order Details</h2>
              <p class="drawer-id">{{ order().id }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="drawer-body">

          <!-- Status badges -->
          <div class="status-row">
            <span class="badge" [ngClass]="orderStatusClass(order().status)">
              <span class="material-symbols-rounded badge-icon">{{ orderStatusIcon(order().status) }}</span>
              {{ orderStatusLabel(order().status) }}
            </span>
            <span class="badge" [ngClass]="payStatusClass(order().paymentStatus)">
              {{ payStatusLabel(order().paymentStatus) }}
            </span>
          </div>

          <!-- Section: Customer & Produce -->
          <div class="section">
            <div class="section-title">Order Information</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Customer</span>
                <span class="detail-value">{{ order().customerName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Produce</span>
                <span class="detail-value">{{ order().produce }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Region</span>
                <span class="detail-value">{{ order().region }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Order Date</span>
                <span class="detail-value">{{ order().orderDate | date:'mediumDate' }}</span>
              </div>
              @if (order().deliveryDate) {
                <div class="detail-item">
                  <span class="detail-label">Delivery Date</span>
                  <span class="detail-value">{{ order().deliveryDate | date:'mediumDate' }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Section: Financials -->
          <div class="section">
            <div class="section-title">Financials</div>
            <div class="financials-grid">
              <div class="financial-card">
                <span class="financial-label">Quantity</span>
                <span class="financial-value">{{ order().quantityKg | number }} kg</span>
              </div>
              <div class="financial-card">
                <span class="financial-label">Price / kg</span>
                <span class="financial-value">GHS {{ order().pricePerKg | number:'1.2-2' }}</span>
              </div>
              <div class="financial-card highlight">
                <span class="financial-label">Total Amount</span>
                <span class="financial-value">GHS {{ order().totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Section: Assignment -->
          <div class="section">
            <div class="section-title">Assignment</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Assigned Agent</span>
                <span class="detail-value">{{ order().assignedAgent || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Assigned Driver</span>
                <span class="detail-value">{{ order().assignedDriver || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Section: Timeline -->
          <div class="section">
            <div class="section-title">Timeline</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Created</span>
                <span class="detail-value">{{ order().createdAt | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Updated</span>
                <span class="detail-value">{{ order().updatedAt | date:'medium' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="drawer-footer">
          @if (order().status === OrderStatus.PENDING) {
            <button class="btn btn-success" (click)="approve.emit(order())">
              <span class="material-symbols-rounded">check_circle</span> Approve Order
            </button>
          }
          @if (order().status === OrderStatus.CONFIRMED || order().status === OrderStatus.PROCESSING) {
            <button class="btn btn-info" (click)="deliver.emit(order())">
              <span class="material-symbols-rounded">local_shipping</span> Mark Delivered
            </button>
          }
          @if (order().status === OrderStatus.PENDING || order().status === OrderStatus.CONFIRMED) {
            <button class="btn btn-danger" (click)="cancel.emit(order())">
              <span class="material-symbols-rounded">cancel</span> Cancel Order
            </button>
          }
          <button class="btn btn-ghost" (click)="closed.emit()">Close</button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1000;
      display: flex; justify-content: flex-end;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .drawer {
      width: 480px; max-width: 95vw;
      height: 100vh;
      background: var(--color-surface);
      display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      animation: slideIn 0.2s ease;
    }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }
    .drawer-title-group { display: flex; align-items: center; gap: 12px; }
    .drawer-icon {
      width: 42px; height: 42px; border-radius: 10px;
      background: rgba(26,122,74,0.1);
      display: flex; align-items: center; justify-content: center;
      span { font-size: 22px; color: var(--color-primary); font-variation-settings: 'FILL' 1; }
    }
    .drawer-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
    .drawer-id { font-size: 0.75rem; color: var(--color-text-muted); margin: 2px 0 0; font-family: monospace; }
    .close-btn {
      width: 34px; height: 34px; border-radius: 8px; border: none;
      background: var(--color-bg-subtle); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-secondary);
      &:hover { background: var(--color-border-light); }
      span { font-size: 18px; }
    }

    .drawer-body {
      flex: 1; overflow-y: auto;
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 20px;
    }

    .status-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 99px;
      font-size: 0.8125rem; font-weight: 600;
    }
    .badge-icon { font-size: 14px; font-variation-settings: 'FILL' 1; }
    .badge--success { background: rgba(22,163,74,0.12); color: #16a34a; }
    .badge--warning { background: rgba(217,119,6,0.12); color: #d97706; }
    .badge--info    { background: rgba(2,132,199,0.12); color: #0284c7; }
    .badge--error   { background: rgba(220,38,38,0.12); color: #dc2626; }
    .badge--neutral { background: var(--color-bg-subtle); color: var(--color-text-muted); }

    .section { display: flex; flex-direction: column; gap: 10px; }
    .section-title {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--color-text-muted);
      padding-bottom: 6px;
      border-bottom: 1px solid var(--color-border-light);
    }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-label { font-size: 0.75rem; color: var(--color-text-muted); }
    .detail-value { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }

    .financials-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .financial-card {
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border-light);
      border-radius: 10px;
      padding: 12px;
      display: flex; flex-direction: column; gap: 4px;
      &.highlight {
        background: rgba(26,122,74,0.06);
        border-color: rgba(26,122,74,0.2);
      }
    }
    .financial-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .financial-value { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
    .financial-card.highlight .financial-value { color: var(--color-primary); }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      display: flex; gap: 8px; flex-wrap: wrap;
      flex-shrink: 0;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s; font-family: inherit;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
      &:hover { opacity: 0.85; }
    }
    .btn-success { background: #16a34a; color: white; }
    .btn-info    { background: #0284c7; color: white; }
    .btn-danger  { background: #dc2626; color: white; }
    .btn-ghost   {
      background: var(--color-bg-subtle);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border-light);
      margin-left: auto;
    }
  `]
})
export class ViewOrderDrawerComponent {
  readonly order = input.required<CustomerOrder>();

  readonly closed  = output<void>();
  readonly approve = output<CustomerOrder>();
  readonly deliver = output<CustomerOrder>();
  readonly cancel  = output<CustomerOrder>();

  protected readonly OrderStatus = OrderStatus;

  orderStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', confirmed: 'Confirmed',
      processing: 'Processing', delivered: 'Delivered', cancelled: 'Cancelled',
    };
    return map[status] ?? status;
  }

  orderStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: 'schedule', confirmed: 'verified', processing: 'autorenew',
      delivered: 'local_shipping', cancelled: 'cancel',
    };
    return map[status] ?? 'help';
  }

  orderStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge--warning', confirmed: 'badge--info',
      processing: 'badge--info', delivered: 'badge--success', cancelled: 'badge--error',
    };
    return map[status] ?? 'badge--neutral';
  }

  payStatusLabel(status: string): string {
    const map: Record<string, string> = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid' };
    return map[status] ?? status;
  }

  payStatusClass(status: string): string {
    const map: Record<string, string> = {
      unpaid: 'badge--error', partial: 'badge--warning', paid: 'badge--success',
    };
    return map[status] ?? 'badge--neutral';
  }
}
