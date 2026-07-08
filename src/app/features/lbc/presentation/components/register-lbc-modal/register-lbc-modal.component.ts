import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LbcStore } from '../../../store/lbc.store';
import { CreateLbcRequest } from '../../../domain/lbc.model';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Oti',
  'Ahafo', 'Bono East', 'North East', 'Savannah', 'Western North', 'Bono',
];

@Component({
  selector: 'app-register-lbc-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Backdrop -->
    <div class="backdrop" (click)="onBackdropClick($event)">

      <!-- Drawer panel -->
      <aside class="drawer" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <div class="drawer-icon">
              <span class="material-symbols-rounded">business_center</span>
            </div>
            <div>
              <h2 class="drawer-title" id="modal-title">Register LBC</h2>
            </div>
          </div>
          <button class="close-btn" (click)="closed.emit()" aria-label="Close">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Form -->
        <form class="drawer-body" [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- LBC Name -->
          <div class="field-group">
            <label class="field-label required" for="name">LBC Name</label>
            <input id="name" class="field-input" type="text" formControlName="name"
              placeholder="e.g. Accra Gold Buyers Ltd." [class.invalid]="invalid('name')">
            @if (invalid('name')) {
              <span class="field-error">LBC name is required</span>
            }
          </div>

          <!-- Code + Region (2-col) -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="code">LBC Code</label>
              <input id="code" class="field-input" type="text" formControlName="code"
                placeholder="e.g. LBC-001" [class.invalid]="invalid('code')">
              @if (invalid('code')) {
                <span class="field-error">LBC code is required</span>
              }
            </div>
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
          </div>

          <!-- District -->
          <div class="field-group">
            <label class="field-label required" for="district">District</label>
            <input id="district" class="field-input" type="text" formControlName="district"
              placeholder="e.g. Ga West" [class.invalid]="invalid('district')">
            @if (invalid('district')) {
              <span class="field-error">District is required</span>
            }
          </div>

          <!-- Manager -->
          <div class="field-group">
            <label class="field-label required" for="manager">Manager Name</label>
            <input id="manager" class="field-input" type="text" formControlName="manager"
              placeholder="Full name of the LBC manager" [class.invalid]="invalid('manager')">
            @if (invalid('manager')) {
              <span class="field-error">Manager name is required</span>
            }
          </div>

          <!-- Phone + Email (2-col) -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label required" for="phone">Phone</label>
              <input id="phone" class="field-input" type="tel" formControlName="phone"
                placeholder="+233 XX XXX XXXX" [class.invalid]="invalid('phone')">
              @if (invalid('phone')) {
                <span class="field-error">Phone number is required</span>
              }
            </div>
            <div class="field-group">
              <label class="field-label required" for="email">Email</label>
              <input id="email" class="field-input" type="email" formControlName="email"
                placeholder="contact@lbc.com" [class.invalid]="invalid('email')">
              @if (invalid('email')) {
                <span class="field-error">Valid email is required</span>
              }
            </div>
          </div>

          @if (errorMsg()) {
            <div class="form-error-banner">
              <span class="material-symbols-rounded">error</span>
              {{ errorMsg() }}
            </div>
          }

        </form>

        <!-- Footer -->
        <div class="drawer-footer">
          <button type="button" class="btn btn-ghost" (click)="closed.emit()" [disabled]="isSaving()">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" (click)="onSubmit()" [disabled]="isSaving()">
            @if (isSaving()) {
              <span class="btn-spinner"></span> Registering…
            } @else {
              <span class="material-symbols-rounded">add</span> Register LBC
            }
          </button>
        </div>

      </aside>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      animation: fade-in var(--transition-fast) ease;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .drawer {
      width: 520px;
      max-width: 100vw;
      height: 100%;
      background: var(--color-surface);
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      animation: slide-in var(--transition-base) cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slide-in {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    /* ── Header ── */
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }

    .drawer-title-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .drawer-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(26, 122, 74, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      span {
        font-size: 22px;
        color: var(--color-primary);
        font-variation-settings: 'FILL' 1;
      }
    }

    .drawer-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }

    .drawer-subtitle {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      margin: 2px 0 0;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast), color var(--transition-fast);

      span { font-size: 20px; }

      &:hover {
        background: var(--color-border-light);
        color: var(--color-text-primary);
      }
    }

    /* ── Body / Form ── */
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      letter-spacing: 0.01em;

      &.required::after {
        content: ' *';
        color: var(--color-error);
      }
    }

    .field-input {
      padding: 10px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--color-text-primary);
      background: var(--color-surface);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none;
      width: 100%;
      box-sizing: border-box;

      &::placeholder { color: var(--color-text-muted); }

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(26, 122, 74, 0.12);
      }

      &.invalid {
        border-color: var(--color-error);
        &:focus { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12); }
      }
    }

    select.field-input { cursor: pointer; appearance: auto; }

    .password-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .password-input { padding-right: 42px; }

      &.invalid .password-input { border-color: var(--color-error); }
    }

    .eye-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      padding: 0;
      transition: color var(--transition-fast);

      span { font-size: 18px; }
      &:hover { color: var(--color-text-primary); }
    }

    .field-error {
      font-size: 0.75rem;
      color: var(--color-error);
      font-weight: 500;
    }

    .form-error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: rgba(220, 38, 38, 0.08);
      border: 1px solid rgba(220, 38, 38, 0.2);
      border-radius: var(--radius-sm);
      color: var(--color-error);
      font-size: 0.875rem;

      span { font-size: 18px; font-variation-settings: 'FILL' 1; }
    }

    /* ── Footer ── */
    .drawer-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-light);
      flex-shrink: 0;
    }

    /* ── Spinner ── */
    .btn-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class RegisterLbcModalComponent {
  readonly closed = output<void>();
  readonly registered = output<void>();

  readonly store = inject(LbcStore);
  readonly regions = GHANA_REGIONS;
  readonly isSaving = signal(false);
  readonly errorMsg = signal('');

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name:            ['', Validators.required],
    code:            ['', Validators.required],
    region:          ['', Validators.required],
    district:        ['', Validators.required],
    manager:         ['', Validators.required],
    phone:           ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
  });

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      this.closed.emit();
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMsg.set('');

    const v = this.form.getRawValue();
    const payload: CreateLbcRequest = {
      name:     v.name!,
      code:     v.code!,
      region:   v.region!,
      district: v.district!,
      manager:  v.manager!,
      phone:    v.phone!,
      email:    v.email!,
    };

    this.store.create(payload, {
      onSuccess: () => {
        this.isSaving.set(false);
        this.registered.emit();
        this.closed.emit();
      },
      onError: (msg: string) => {
        this.isSaving.set(false);
        this.errorMsg.set(msg);
      },
    });
  }
}
