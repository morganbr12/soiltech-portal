import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerStore } from '../../../store/customer.store';
import { CustomerOrder, OrderStatus } from '../../../domain/customer.model';
import { VehicleService } from '../../../../logistics/services/vehicle.service';
import { Vehicle, VehicleStatusApi } from '../../../../logistics/domain/vehicle.model';

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
              <p class="drawer-id">{{ order().orderCode || order().id }}</p>
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

          <!-- Customer -->
          <div class="section">
            <div class="section-title">Customer</div>
            <div class="party-card">
              <div class="party-avatar">
                {{ (order().customer?.fullName || order().customerName).charAt(0).toUpperCase() }}
              </div>
              <div class="party-info">
                <span class="party-name">{{ order().customer?.fullName || order().customerName }}</span>
                <span class="party-code mono">{{ order().customerCode || '—' }}</span>
              </div>
              <span class="party-chip" [ngClass]="custStatusClass(order().customer?.status)">
                {{ order().customer?.status || '—' }}
              </span>
            </div>
            <div class="detail-grid" style="margin-top:10px">
              <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value">{{ order().customer?.email || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone</span>
                <span class="detail-value">{{ order().customer?.phone || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Account Type</span>
                <span class="detail-value">{{ order().customer?.accountType || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Region</span>
                <span class="detail-value">{{ order().customer?.region || order().region }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Address</span>
                <span class="detail-value">{{ order().customer?.address || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Order Information -->
          <div class="section">
            <div class="section-title">Order Information</div>
            <div class="detail-grid">
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
              <div class="detail-item">
                <span class="detail-label">Delivery Date</span>
                <span class="detail-value">{{ order().deliveryDate ? (order().deliveryDate | date:'mediumDate') : '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Financials -->
          <div class="section">
            <div class="section-title">Financials</div>
            <div class="financials-grid">
              <div class="financial-card">
                <span class="financial-label">Quantity</span>
                <span class="financial-value">{{ order().quantityKg | number:'1.0-2' }} kg</span>
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

          <!-- Driver -->
          <div class="section">
            <div class="section-title-row">
              <span class="section-title">Driver</span>
              @if (!showAssignRider()) {
                <button class="assign-btn" (click)="openAssignRider()">
                  <span class="material-symbols-rounded">add</span>
                  {{ order().assignedDriver ? 'Reassign' : 'Assign Rider' }}
                </button>
              }
            </div>

            @if (!showAssignRider()) {
              @if (order().assignedDriver) {
                <div class="party-card">
                  <div class="party-avatar" style="background:rgba(124,58,237,0.12);color:#7c3aed">
                    {{ order().assignedDriver!.charAt(0).toUpperCase() }}
                  </div>
                  <div class="party-info">
                    <span class="party-name">{{ order().assignedDriver }}</span>
                    <span class="party-code">Assigned Rider</span>
                  </div>
                </div>
              } @else {
                <p class="no-party">No rider assigned yet.</p>
              }
            } @else {
              <!-- Inline rider picker -->
              @if (vehiclesLoading()) {
                <div class="rider-loading">
                  <span class="material-symbols-rounded spinning">progress_activity</span> Loading available riders…
                </div>
              } @else if (availableVehicles().length === 0) {
                <div class="rider-empty">No available vehicles at the moment.</div>
              } @else {
                <div class="rider-list">
                  @for (v of availableVehicles(); track v.id) {
                    <div class="rider-item" [class.selected]="selectedVehicleId() === v.id" (click)="selectedVehicleId.set(v.id)">
                      <div class="rider-radio">
                        <span class="material-symbols-rounded">
                          {{ selectedVehicleId() === v.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                        </span>
                      </div>
                      <div class="rider-detail">
                        <span class="rider-name">{{ v.driverName || 'No driver' }} · {{ v.carPlateNumber }}</span>
                        <span class="rider-meta">{{ v.vehicleType }} · {{ v.region }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
              <div class="assign-actions">
                <button class="btn btn-ghost btn-sm" (click)="closeAssignRider()">Cancel</button>
                <button class="btn btn-primary btn-sm"
                  [disabled]="!selectedVehicleId() || saving()"
                  (click)="submitAssignRider()">
                  @if (saving()) {
                    <span class="material-symbols-rounded spinning">progress_activity</span> Assigning…
                  } @else {
                    <span class="material-symbols-rounded">check</span> Confirm
                  }
                </button>
              </div>
            }
          </div>

          <!-- Agent -->
          <div class="section">
            <div class="section-title">Agent</div>
            @if (order().agent) {
              <div class="party-card">
                <div class="party-avatar agent">
                  {{ order().agent!.fullName.charAt(0).toUpperCase() }}
                </div>
                <div class="party-info">
                  <span class="party-name">{{ order().agent!.fullName }}</span>
                  <span class="party-code mono">{{ order().agent!.agentCode }}</span>
                </div>
              </div>
              <div class="detail-grid" style="margin-top:10px">
                <div class="detail-item">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{ order().agent!.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ order().agent!.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Region</span>
                  <span class="detail-value">{{ order().agent!.region }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">District</span>
                  <span class="detail-value">{{ order().agent!.district }}</span>
                </div>
              </div>
            } @else {
              <p class="no-party">No agent assigned to this order.</p>
            }
          </div>

          <!-- Farmer -->
          <div class="section">
            <div class="section-title">Farmer</div>
            @if (order().farmer) {
              <div class="party-card">
                <div class="party-avatar farmer">
                  {{ order().farmer!.fullName.charAt(0).toUpperCase() }}
                </div>
                <div class="party-info">
                  <span class="party-name">{{ order().farmer!.fullName }}</span>
                  <span class="party-code mono">{{ order().farmer!.farmerCode }}</span>
                </div>
              </div>
              <div class="detail-grid" style="margin-top:10px">
                <div class="detail-item">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{ order().farmer!.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ order().farmer!.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Region</span>
                  <span class="detail-value">{{ order().farmer!.region }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">District</span>
                  <span class="detail-value">{{ order().farmer!.district }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Community</span>
                  <span class="detail-value">{{ order().farmer!.community }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Crop Types</span>
                  <span class="detail-value">{{ order().farmer!.cropTypes.join(', ') }}</span>
                </div>
              </div>
            } @else {
              <p class="no-party">No farmer linked — order predates farmer tracking.</p>
            }
          </div>

          @if (order().cancellationReason) {
            <div class="section">
              <div class="section-title">Cancellation</div>
              <div class="detail-item full-width">
                <span class="detail-label">Reason</span>
                <span class="detail-value">{{ order().cancellationReason }}</span>
              </div>
            </div>
          }

          <!-- Timeline -->
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

        <!-- Footer -->
        <div class="drawer-footer">
          @switch (order().status) {
            @case (OrderStatus.PENDING) {
              <button class="btn btn-success" (click)="confirmOrder()" [disabled]="saving()">
                @if (saving()) { <span class="material-symbols-rounded spinning">progress_activity</span> } @else { <span class="material-symbols-rounded">check_circle</span> }
                Confirm Order
              </button>
              <button class="btn btn-danger" (click)="cancelOrder()" [disabled]="saving()">
                <span class="material-symbols-rounded">cancel</span> Cancel Order
              </button>
            }
            @case (OrderStatus.CONFIRMED) {
              <button class="btn btn-danger" (click)="cancelOrder()" [disabled]="saving()">
                <span class="material-symbols-rounded">cancel</span> Cancel Order
              </button>
            }
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
      width: 500px; max-width: 95vw;
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
    .badge--purple  { background: rgba(124,58,237,0.12); color: #7c3aed; }
    .badge--error   { background: rgba(220,38,38,0.12); color: #dc2626; }
    .badge--neutral { background: var(--color-bg-subtle); color: var(--color-text-muted); }

    .party-card {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 10px;
      background: var(--color-bg-subtle); border: 1px solid var(--color-border-light);
    }
    .party-avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: rgba(26,122,74,0.12); color: var(--color-primary);
      font-size: 1rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      &.agent  { background: rgba(2,132,199,0.12); color: #0284c7; }
      &.farmer { background: rgba(217,119,6,0.12);  color: #d97706; }
    }
    .party-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .party-name { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .party-code { font-size: 0.75rem; color: var(--color-text-muted); }
    .party-chip {
      padding: 3px 10px; border-radius: 99px;
      font-size: 0.75rem; font-weight: 600; text-transform: capitalize; flex-shrink: 0;
    }
    .no-party {
      font-size: 0.8125rem; color: var(--color-text-muted);
      font-style: italic; margin: 4px 0 0;
    }

    .info-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 8px;
      background: rgba(2,132,199,0.08); color: #0284c7;
      font-size: 0.8125rem; font-weight: 500;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
    }

    .section { display: flex; flex-direction: column; gap: 10px; }
    .section-title-row {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 6px; border-bottom: 1px solid var(--color-border-light);
    }
    .section-title {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--color-text-muted);
      padding-bottom: 6px; border-bottom: 1px solid var(--color-border-light);
    }
    .section-title-row .section-title { border-bottom: none; padding-bottom: 0; }
    .assign-btn {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 3px 10px; border-radius: 6px; border: 1px solid var(--color-primary);
      background: transparent; color: var(--color-primary);
      font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit;
      span { font-size: 14px; }
      &:hover { background: rgba(26,122,74,0.06); }
    }
    .rider-loading {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8125rem; color: var(--color-text-muted); padding: 8px 0;
      span { font-size: 18px; color: var(--color-primary); }
    }
    .rider-empty { font-size: 0.8125rem; color: var(--color-text-muted); font-style: italic; padding: 4px 0; }
    .rider-list { display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; }
    .rider-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px; cursor: pointer;
      border: 1px solid var(--color-border-light); background: var(--color-bg-subtle);
      transition: border-color 0.15s, background 0.15s;
      &:hover { border-color: var(--color-primary); background: rgba(26,122,74,0.04); }
      &.selected { border-color: var(--color-primary); background: rgba(26,122,74,0.06); }
    }
    .rider-radio span { font-size: 20px; color: var(--color-text-muted); font-variation-settings: 'FILL' 1; }
    .rider-item.selected .rider-radio span { color: var(--color-primary); }
    .rider-detail { display: flex; flex-direction: column; gap: 2px; }
    .rider-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
    .rider-meta { font-size: 0.75rem; color: var(--color-text-muted); }
    .assign-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-item.full-width { grid-column: 1 / -1; }
    .detail-label { font-size: 0.75rem; color: var(--color-text-muted); }
    .detail-value { font-size: 0.875rem; font-weight: 500; color: var(--color-text-primary); }
    .detail-value.mono { font-family: monospace; font-size: 0.8125rem; }

    .financials-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .financial-card {
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border-light);
      border-radius: 10px; padding: 12px;
      display: flex; flex-direction: column; gap: 4px;
      &.highlight { background: rgba(26,122,74,0.06); border-color: rgba(26,122,74,0.2); }
    }
    .financial-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .financial-value { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
    .financial-card.highlight .financial-value { color: var(--color-primary); }

    /* Footer */
    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
      flex-shrink: 0;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s; font-family: inherit;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
      &:hover:not(:disabled) { opacity: 0.85; }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }
    .btn-success { background: #16a34a; color: white; }
    .btn-primary { background: var(--color-primary); color: white; }
    .btn-info    { background: #0284c7; color: white; }
    .btn-danger  { background: #dc2626; color: white; }
    .btn-ghost {
      background: var(--color-bg-subtle); color: var(--color-text-secondary);
      border: 1px solid var(--color-border-light);
      &:last-child { margin-left: auto; }
    }
    .btn-sm { padding: 6px 12px; font-size: 0.8125rem; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinning { animation: spin 0.8s linear infinite; }
  `]
})
export class ViewOrderDrawerComponent {
  private readonly customerStore = inject(CustomerStore);
  private readonly vehicleSvc    = inject(VehicleService);

  readonly order = input.required<CustomerOrder>();

  readonly closed       = output<void>();
  readonly orderUpdated = output<void>();

  readonly saving            = signal(false);
  readonly showAssignRider   = signal(false);
  readonly availableVehicles = signal<Vehicle[]>([]);
  readonly vehiclesLoading   = signal(false);
  readonly selectedVehicleId = signal<string>('');

  protected readonly OrderStatus = OrderStatus;

  openAssignRider(): void {
    this.showAssignRider.set(true);
    this.selectedVehicleId.set('');
    this.vehiclesLoading.set(true);
    this.vehicleSvc.list({ status: VehicleStatusApi.AVAILABLE, limit: 50 }).subscribe({
      next: res => { this.availableVehicles.set(res.data); this.vehiclesLoading.set(false); },
      error: ()  =>   this.vehiclesLoading.set(false),
    });
  }

  closeAssignRider(): void {
    this.showAssignRider.set(false);
    this.selectedVehicleId.set('');
  }

  submitAssignRider(): void {
    const vehicleId = this.selectedVehicleId();
    if (!vehicleId) return;
    this.saving.set(true);
    this.customerStore.assignDriver(this.order().id, vehicleId, {
      onSuccess: () => { this.saving.set(false); this.closeAssignRider(); this.orderUpdated.emit(); },
      onError:   () =>   this.saving.set(false),
    });
  }

  confirmOrder(): void {
    this.saving.set(true);
    this.customerStore.confirmOrder(this.order().id, {
      onSuccess: () => { this.saving.set(false); this.orderUpdated.emit(); },
      onError:   () =>   this.saving.set(false),
    });
  }

  cancelOrder(): void {
    this.saving.set(true);
    this.customerStore.cancelOrder(this.order().id, '', {
      onSuccess: () => { this.saving.set(false); this.orderUpdated.emit(); },
      onError:   () =>   this.saving.set(false),
    });
  }

  custStatusClass(status?: string): string {
    const map: Record<string, string> = {
      active: 'badge--success', verified: 'badge--success',
      pending: 'badge--warning', suspended: 'badge--error', rejected: 'badge--error',
    };
    return map[status?.toLowerCase() ?? ''] ?? 'badge--neutral';
  }

  orderStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
      DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
    };
    return map[status] ?? status;
  }

  orderStatusIcon(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'schedule', CONFIRMED: 'verified', PROCESSING: 'autorenew',
      DELIVERED: 'check_circle', CANCELLED: 'cancel',
    };
    return map[status] ?? 'help';
  }

  orderStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge--warning', CONFIRMED: 'badge--info', PROCESSING: 'badge--info',
      DELIVERED: 'badge--success', CANCELLED: 'badge--error',
    };
    return map[status] ?? 'badge--neutral';
  }

  payStatusLabel(status: string): string {
    const map: Record<string, string> = { UNPAID: 'Unpaid', PARTIAL: 'Partial', PAID: 'Paid' };
    return map[status] ?? status;
  }

  payStatusClass(status: string): string {
    const map: Record<string, string> = {
      UNPAID: 'badge--error', PARTIAL: 'badge--warning', PAID: 'badge--success',
    };
    return map[status] ?? 'badge--neutral';
  }
}
