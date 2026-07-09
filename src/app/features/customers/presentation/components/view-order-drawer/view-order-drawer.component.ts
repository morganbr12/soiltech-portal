import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomerStore } from '../../../store/customer.store';
import { VehicleService } from '../../../../logistics/services/vehicle.service';
import { CustomerOrder, OrderStatus, DispatchDriverPayload } from '../../../domain/customer.model';
import { Vehicle, VehicleStatusApi } from '../../../../logistics/domain/vehicle.model';

@Component({
  selector: 'app-view-order-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

          @if (!showDispatchForm()) {

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

            @if (order().status === OrderStatus.CONFIRMED) {
              <div class="info-banner">
                <span class="material-symbols-rounded">info</span>
                Awaiting field agent confirmation before dispatch can proceed.
              </div>
            }

            <!-- Order Information -->
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

            <!-- Financials -->
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

            <!-- Assignment & Dispatch -->
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
                @if (order().vehiclePlate) {
                  <div class="detail-item">
                    <span class="detail-label">Vehicle Plate</span>
                    <span class="detail-value">{{ order().vehiclePlate }}</span>
                  </div>
                }
              </div>
            </div>

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

          } @else {

            <!-- Dispatch Driver Form -->
            <div class="dispatch-header">
              <div class="dispatch-icon">
                <span class="material-symbols-rounded">local_shipping</span>
              </div>
              <div>
                <div class="dispatch-title">Dispatch Driver</div>
                <div class="dispatch-sub">Assign a vehicle to fulfil this order</div>
              </div>
            </div>

            <form [formGroup]="dispatchForm" (ngSubmit)="submitDispatch()" style="display:flex;flex-direction:column;gap:16px">

              <!-- Vehicle Select -->
              <div class="field-group">
                <label class="field-label required">Vehicle</label>
                @if (vehiclesLoading()) {
                  <div class="vehicles-placeholder">Loading available vehicles…</div>
                } @else if (availableVehicles().length === 0) {
                  <div class="vehicles-placeholder empty">No available vehicles right now.</div>
                } @else {
                  <select class="field-input" formControlName="vehicleId" [class.invalid]="dispatchInvalid('vehicleId')">
                    <option value="" disabled>Select a vehicle</option>
                    @for (v of availableVehicles(); track v.id) {
                      <option [value]="v.id">
                        {{ v.carPlateNumber }} — {{ v.vehicleType }}{{ v.driverName ? ' · ' + v.driverName : '' }}
                      </option>
                    }
                  </select>
                  @if (dispatchInvalid('vehicleId')) {
                    <span class="field-error">Vehicle is required</span>
                  }
                }
              </div>

              <!-- Scheduled Date -->
              <div class="field-group">
                <label class="field-label required">Scheduled Date</label>
                <input class="field-input" type="date" formControlName="scheduledDate" [class.invalid]="dispatchInvalid('scheduledDate')">
                @if (dispatchInvalid('scheduledDate')) {
                  <span class="field-error">Date is required</span>
                }
              </div>

              <!-- Pickup Location -->
              <div class="field-group">
                <label class="field-label required">Pickup Location</label>
                <input class="field-input" type="text" formControlName="pickupLocation"
                  placeholder="e.g. Kumasi Farm Road, Plot 4" [class.invalid]="dispatchInvalid('pickupLocation')">
                @if (dispatchInvalid('pickupLocation')) {
                  <span class="field-error">Pickup location is required</span>
                }
              </div>

              <!-- Notes -->
              <div class="field-group">
                <label class="field-label">Notes <span class="optional">(optional)</span></label>
                <textarea class="field-input field-textarea" formControlName="notes" rows="3"
                  placeholder="e.g. Call farmer 30 mins before arrival"></textarea>
              </div>

            </form>

          }

        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          @if (showDispatchForm()) {
            <button class="btn btn-ghost" (click)="showDispatchForm.set(false)">
              <span class="material-symbols-rounded">arrow_back</span> Back
            </button>
            <button class="btn btn-primary" (click)="submitDispatch()" [disabled]="saving() || availableVehicles().length === 0">
              @if (saving()) {
                <span class="material-symbols-rounded spinning">progress_activity</span> Dispatching…
              } @else {
                <span class="material-symbols-rounded">local_shipping</span> Confirm Dispatch
              }
            </button>

          } @else {
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
              @case (OrderStatus.AGENT_CONFIRMED) {
                <button class="btn btn-primary" (click)="openDispatchForm()">
                  <span class="material-symbols-rounded">local_shipping</span> Dispatch Driver
                </button>
                <button class="btn btn-danger" (click)="cancelOrder()" [disabled]="saving()">
                  <span class="material-symbols-rounded">cancel</span> Cancel Order
                </button>
              }
              @case (OrderStatus.DRIVER_DISPATCHED) {
                <button class="btn btn-info" (click)="markEnRoute()" [disabled]="saving()">
                  @if (saving()) { <span class="material-symbols-rounded spinning">progress_activity</span> } @else { <span class="material-symbols-rounded">directions_car</span> }
                  Mark En Route
                </button>
              }
              @case (OrderStatus.SHIPPED) {
                <button class="btn btn-success" (click)="markDelivered()" [disabled]="saving()">
                  @if (saving()) { <span class="material-symbols-rounded spinning">progress_activity</span> } @else { <span class="material-symbols-rounded">check_circle</span> }
                  Mark Delivered
                </button>
              }
            }
            <button class="btn btn-ghost" (click)="closed.emit()">Close</button>
          }
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

    .info-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 8px;
      background: rgba(2,132,199,0.08); color: #0284c7;
      font-size: 0.8125rem; font-weight: 500;
      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
    }

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
      border-radius: 10px; padding: 12px;
      display: flex; flex-direction: column; gap: 4px;
      &.highlight { background: rgba(26,122,74,0.06); border-color: rgba(26,122,74,0.2); }
    }
    .financial-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .financial-value { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
    .financial-card.highlight .financial-value { color: var(--color-primary); }

    /* Dispatch form */
    .dispatch-header {
      display: flex; align-items: center; gap: 14px;
      padding: 14px; border-radius: 10px;
      background: rgba(2,132,199,0.06); border: 1px solid rgba(2,132,199,0.15);
    }
    .dispatch-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: rgba(2,132,199,0.12);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      span { font-size: 22px; color: #0284c7; font-variation-settings: 'FILL' 1; }
    }
    .dispatch-title { font-size: 0.9375rem; font-weight: 700; color: var(--color-text-primary); }
    .dispatch-sub   { font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 2px; }

    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-label {
      font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary);
      &.required::after { content: ' *'; color: var(--color-error); }
    }
    .optional { font-weight: 400; color: var(--color-text-muted); }
    .field-input {
      border: 1px solid var(--color-border); border-radius: 8px; padding: 9px 12px;
      font-size: 0.875rem; font-family: inherit; color: var(--color-text-primary);
      background: var(--color-surface); outline: none; width: 100%;
      transition: border-color 0.15s, box-shadow 0.15s;
      &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(26,122,74,0.1); }
      &.invalid { border-color: var(--color-error); }
    }
    .field-textarea { resize: vertical; min-height: 72px; }
    select.field-input { cursor: pointer; }
    .field-error { font-size: 0.75rem; color: var(--color-error); }
    .vehicles-placeholder {
      padding: 10px 12px; border-radius: 8px; font-size: 0.875rem;
      background: var(--color-bg-subtle); color: var(--color-text-muted);
      &.empty { color: var(--color-error); }
    }

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

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinning { animation: spin 0.8s linear infinite; }
  `]
})
export class ViewOrderDrawerComponent {
  private readonly customerStore = inject(CustomerStore);
  private readonly vehicleSvc   = inject(VehicleService);
  private readonly fb           = inject(FormBuilder);

  readonly order = input.required<CustomerOrder>();

  readonly closed       = output<void>();
  readonly orderUpdated = output<void>();

  readonly saving            = signal(false);
  readonly showDispatchForm  = signal(false);
  readonly availableVehicles = signal<Vehicle[]>([]);
  readonly vehiclesLoading   = signal(false);

  protected readonly OrderStatus = OrderStatus;

  readonly dispatchForm = this.fb.group({
    vehicleId:      ['', Validators.required],
    scheduledDate:  ['', Validators.required],
    pickupLocation: ['', Validators.required],
    notes:          [''],
  });

  dispatchInvalid(field: string): boolean {
    const c = this.dispatchForm.get(field);
    return !!(c?.invalid && c.touched);
  }

  openDispatchForm(): void {
    this.showDispatchForm.set(true);
    this.vehiclesLoading.set(true);
    this.vehicleSvc.list({ status: VehicleStatusApi.AVAILABLE }).subscribe({
      next: res => { this.availableVehicles.set(res.data); this.vehiclesLoading.set(false); },
      error: ()  => this.vehiclesLoading.set(false),
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

  submitDispatch(): void {
    if (this.dispatchForm.invalid) { this.dispatchForm.markAllAsTouched(); return; }
    const v = this.dispatchForm.value;
    const payload: DispatchDriverPayload = {
      vehicleId:      v.vehicleId!,
      scheduledDate:  v.scheduledDate!,
      pickupLocation: v.pickupLocation!,
      notes:          v.notes || undefined,
    };
    this.saving.set(true);
    this.customerStore.dispatchDriver(this.order().id, payload, {
      onSuccess: () => { this.saving.set(false); this.orderUpdated.emit(); },
      onError:   () =>   this.saving.set(false),
    });
  }

  markEnRoute(): void {
    const dispatchId = this.order().dispatchId as string | undefined;
    if (!dispatchId) return;
    this.saving.set(true);
    this.customerStore.updateDispatchStatus(dispatchId, 'enRoute', {
      onSuccess: () => { this.saving.set(false); this.orderUpdated.emit(); },
      onError:   () =>   this.saving.set(false),
    });
  }

  markDelivered(): void {
    const dispatchId = this.order().dispatchId as string | undefined;
    if (!dispatchId) return;
    this.saving.set(true);
    this.customerStore.updateDispatchStatus(dispatchId, 'delivered', {
      onSuccess: () => { this.saving.set(false); this.orderUpdated.emit(); },
      onError:   () =>   this.saving.set(false),
    });
  }

  orderStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
      agentConfirmed: 'Agent Confirmed', driverDispatched: 'Driver Dispatched',
      shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
    };
    return map[status] ?? status;
  }

  orderStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: 'schedule', confirmed: 'verified', processing: 'autorenew',
      agentConfirmed: 'person_check', driverDispatched: 'local_shipping',
      shipped: 'directions_car', delivered: 'check_circle', cancelled: 'cancel',
    };
    return map[status] ?? 'help';
  }

  orderStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge--warning', confirmed: 'badge--info', processing: 'badge--info',
      agentConfirmed: 'badge--purple', driverDispatched: 'badge--info',
      shipped: 'badge--info', delivered: 'badge--success', cancelled: 'badge--error',
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
