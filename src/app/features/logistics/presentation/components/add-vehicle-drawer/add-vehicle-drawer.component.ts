import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VehicleStore } from '../../../store/vehicle.store';
import { Vehicle, VehicleStatusApi } from '../../../domain/vehicle.model';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Oti',
  'Ahafo', 'Bono East', 'North East', 'Savannah', 'Western North', 'Bono',
];

const VEHICLE_TYPES = ['Pickup Truck', 'Mini Truck', 'Large Truck', 'Van', 'Motorcycle'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i);

@Component({
  selector: 'app-add-vehicle-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="backdrop" (click)="onBackdropClick($event)">
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="drawer-title">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">local_shipping</span>
            </div>
            <h2 class="drawer-title" id="drawer-title">Add Vehicle</h2>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Form -->
        <form class="drawer-body" [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Plate Number -->
          <div class="field-group">
            <label class="field-label required" for="plateNumber">Plate Number</label>
            <input id="plateNumber" class="field-input" type="text" formControlName="plateNumber"
              placeholder="e.g. GR-1234-22" [class.invalid]="invalid('plateNumber')">
            @if (invalid('plateNumber')) {
              <span class="field-error">Plate number is required</span>
            }
          </div>

          <!-- Type + Make (2-col) -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="type">Vehicle Type</label>
              <select id="type" class="field-input" formControlName="type" [class.invalid]="invalid('type')">
                <option value="" disabled>Select type</option>
                @for (t of vehicleTypes; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
              @if (invalid('type')) {
                <span class="field-error">Vehicle type is required</span>
              }
            </div>
            <div class="field-group">
              <label class="field-label required" for="make">Make</label>
              <input id="make" class="field-input" type="text" formControlName="make"
                placeholder="e.g. Toyota" [class.invalid]="invalid('make')">
              @if (invalid('make')) {
                <span class="field-error">Make is required</span>
              }
            </div>
          </div>

          <!-- Model + Year (2-col) -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="model">Model</label>
              <input id="model" class="field-input" type="text" formControlName="model"
                placeholder="e.g. Hilux" [class.invalid]="invalid('model')">
              @if (invalid('model')) {
                <span class="field-error">Model is required</span>
              }
            </div>
            <div class="field-group">
              <label class="field-label required" for="year">Year</label>
              <select id="year" class="field-input" formControlName="year" [class.invalid]="invalid('year')">
                <option value="" disabled>Select year</option>
                @for (y of years; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
              @if (invalid('year')) {
                <span class="field-error">Year is required</span>
              }
            </div>
          </div>

          <!-- Capacity + Fuel Level (2-col) -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="capacityKg">Capacity (kg)</label>
              <input id="capacityKg" class="field-input" type="number" formControlName="capacityKg"
                placeholder="e.g. 2000" min="1" [class.invalid]="invalid('capacityKg')">
              @if (invalid('capacityKg')) {
                <span class="field-error">Capacity is required</span>
              }
            </div>
            <div class="field-group">
              <label class="field-label" for="fuelLevel">Fuel Level (%)</label>
              <input id="fuelLevel" class="field-input" type="number" formControlName="fuelLevel"
                placeholder="e.g. 80" min="0" max="100">
            </div>
          </div>

          <!-- Region -->
          <div class="field-group">
            <label class="field-label required" for="region">Region</label>
            <select id="region" class="field-input" formControlName="region" [class.invalid]="invalid('region')">
              <option value="" disabled>Select region</option>
              @for (r of regions; track r) {
                <option [value]="r">{{ r }}</option>
              }
            </select>
            @if (invalid('region')) {
              <span class="field-error">Region is required</span>
            }
          </div>

          <!-- Driver Name (optional) -->
          <div class="field-group">
            <label class="field-label" for="driverName">Driver Name <span class="optional">(optional)</span></label>
            <input id="driverName" class="field-input" type="text" formControlName="driverName"
              placeholder="Assign a driver">
          </div>

          <!-- Footer -->
          <div class="drawer-footer">
            <button type="button" class="btn btn-ghost" (click)="closed.emit()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="material-symbols-rounded spinning">progress_activity</span> Saving…
              } @else {
                <span class="material-symbols-rounded">add</span> Add Vehicle
              }
            </button>
          </div>
        </form>

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
      width: 520px; max-width: 95vw;
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
      background: rgba(2,132,199,0.1);
      display: flex; align-items: center; justify-content: center;
      span { font-size: 22px; color: #0284c7; font-variation-settings: 'FILL' 1; }
    }
    .drawer-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
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
      padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
    }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .field-group { display: flex; flex-direction: column; gap: 5px; }

    .field-label {
      font-size: 0.8125rem; font-weight: 600; color: var(--color-text-secondary);
      &.required::after { content: ' *'; color: var(--color-error); }
    }
    .optional { font-weight: 400; color: var(--color-text-muted); }

    .field-input {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 0.875rem;
      font-family: inherit;
      color: var(--color-text-primary);
      background: var(--color-surface);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%;
      &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(26,122,74,0.1); }
      &.invalid { border-color: var(--color-error); }
      &:disabled { background: var(--color-bg-subtle); cursor: not-allowed; }
    }
    select.field-input { cursor: pointer; }

    .field-error { font-size: 0.75rem; color: var(--color-error); }

    .drawer-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      display: flex; justify-content: flex-end; gap: 10px;
      flex-shrink: 0;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      font-family: inherit; transition: opacity 0.15s;
      span { font-size: 18px; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .btn-primary { background: var(--color-primary); color: white; &:hover:not(:disabled) { opacity: 0.88; } }
    .btn-ghost { background: var(--color-bg-subtle); color: var(--color-text-secondary); border: 1px solid var(--color-border-light); &:hover { background: var(--color-border-light); } }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinning { animation: spin 0.8s linear infinite; }
  `]
})
export class AddVehicleDrawerComponent {
  private readonly fb    = inject(FormBuilder);
  private readonly store = inject(VehicleStore);

  readonly closed = output<void>();
  readonly saved  = output<Vehicle>();

  readonly saving = signal(false);

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly regions      = GHANA_REGIONS;
  readonly years        = YEARS;

  readonly form = this.fb.group({
    plateNumber: ['', Validators.required],
    type:        ['', Validators.required],
    make:        ['', Validators.required],
    model:       ['', Validators.required],
    year:        ['', Validators.required],
    capacityKg:  [null as number | null, [Validators.required, Validators.min(1)]],
    fuelLevel:   [null as number | null, [Validators.min(0), Validators.max(100)]],
    region:      ['', Validators.required],
    driverName:  [''],
  });

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      this.closed.emit();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.saving.set(true);
    this.store.create({
      payload: {
        carPlateNumber: v.plateNumber!,
        vehicleType:    v.type!,
        make:           v.make!,
        model:          v.model!,
        year:           Number(v.year),
        capacity:       Number(v.capacityKg),
        fuelLevel:      v.fuelLevel != null ? Number(v.fuelLevel) : undefined,
        region:         v.region!,
        driverName:     v.driverName || undefined,
        status:         VehicleStatusApi.AVAILABLE,
      },
      onSuccess: (vehicle: Vehicle) => {
        this.saving.set(false);
        this.saved.emit(vehicle);
        this.closed.emit();
      },
    });
  }
}
